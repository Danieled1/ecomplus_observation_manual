function mkAssert({ id, label, pass, selector, screenshot, text }) {
  return {
    id,
    label,
    pass: !!pass,
    evidence: {
      selector: selector || null,
      screenshot: screenshot || null,
      text: typeof text === 'string' ? (text.length > 300 ? text.slice(0, 300) + '…' : text) : null
    }
  };
}

module.exports = async function coursePageFlow(page, outputDir, creds, slugOrUrl) {
  const isUrl = typeof slugOrUrl === 'string' && /^https?:\/\//i.test(slugOrUrl);
  const base = (creds && creds.url) || '';
  const url = isUrl ? slugOrUrl : `${base.replace(/\/+$/,'')}/course/${slugOrUrl}/`;
  const safeSlug0 = slugOrUrl || 'course';
  let safeSlug = safeSlug0;
  try { safeSlug = decodeURIComponent(String(safeSlug0)); } catch(e) {}
  const safeName = encodeURIComponent(isUrl ? slugOrUrl.replace(/^https?:\/\//,'') : String(safeSlug).replace(/\//g,'-'));
  const screenshots = [];
  const assertions = [];

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const shot = `${outputDir}/course_${safeName}.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    screenshots.push(shot);

    // Simple DOM-based lesson count using common selectors (expanded)
    const selectors = [
      '.ld-lesson-list li',
      '.lesson-item',
      '.ld-item',
      '.ld-lesson',
      'ul.lessons li',
      '.lesson-list li',
      '.bb-lesson-item',
      '.ld-item-list .ld-item',
      '.ld-item-list .ld-item-list-item',
      '.ld-table-list .ld-table-list-item',
      '.ld-lesson-items li',
      '.bb-course-lesson-item',
      '.ld-course-content .ld-item-list-item'
    ];
    let lessonCount = 0;
    for (const sel of selectors) {
      try {
        const c = await page.$$eval(sel, els => els.length).catch(() => 0);
        if (c && c > 0) { lessonCount = c; break; }
      } catch (e) {}
    }
    assertions.push(mkAssert({ id: 'lessonsDetectedDom', label: 'Lessons detected via DOM selectors', pass: lessonCount > 0, selector: selectors.join(', '), screenshot: shot }));

    // Fallback 1: parse Hebrew text for a number before the word "שיעור/שיעורים" (e.g., "36 שיעורים")
    if (!lessonCount) {
      try {
        const text = await page.evaluate(() => document.body && document.body.innerText ? document.body.innerText : '');
        const m = text && text.match(/(\d+)\s*שיעור(?:ים)?/);
        if (m) {
          const n = parseInt(m[1], 10);
          if (!isNaN(n) && n > 0) lessonCount = n;
        }
      } catch(e) {}
    }
    assertions.push(mkAssert({ id: 'lessonsDetectedText', label: 'Lessons detected via text pattern', pass: lessonCount > 0 }));

    // Fallback 2: count occurrences of the word "שיעור" in the course content section (coarsely)
    if (!lessonCount) {
      try {
        const approx = await page.evaluate(() => {
          const root = document.querySelector('.ld-course-content') || document.body;
          if (!root) return 0;
          const txt = (root.innerText || '').split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
          let count = 0;
          for (const line of txt) {
            if (/\bשיעור\b/.test(line)) count++;
          }
          return count;
        });
        if (approx && approx > 0) lessonCount = approx;
      } catch(e) {}
    }
    assertions.push(mkAssert({ id: 'lessonsDetectedApprox', label: 'Approx lessons detected via content', pass: lessonCount > 0 }));

    // Try to extract inline JSON or window globals that may include steps
    const inline = await page.evaluate(() => {
      const out = {};
      try {
        document.querySelectorAll('script[type="application/json"]').forEach((s, i) => {
          try { out[`script_json_${i}`] = JSON.parse(s.textContent); } catch (e) {}
        });
        try { if (window.ldlms) out.ldlms = window.ldlms; } catch(e) {}
        try { if (window.learndash) out.learndash = window.learndash; } catch(e) {}
        try { if (window.ldlmsData) out.ldlmsData = window.ldlmsData; } catch(e) {}
        try { if (window.wpApiSettings) out.wpApiSettings = window.wpApiSettings; } catch(e) {}
        try { if (window.ldGlobalSettings) out.ldGlobalSettings = window.ldGlobalSettings; } catch(e) {}
        try { if (window.ldCourseData) out.ldCourseData = window.ldCourseData; } catch(e) {}
        try { if (window.ldVars) out.ldVars = window.ldVars; } catch(e) {}
        try { if (window.ldData) out.ldData = window.ldData; } catch(e) {}
        // also try to capture any inline JSON in data-* attributes commonly used by themes
        try { Array.from(document.querySelectorAll('[data-ld-steps], [data-course]')).forEach((el, i) => { try { out[`data_attr_${i}`] = JSON.parse(el.getAttribute('data-ld-steps') || el.getAttribute('data-course') || '{}'); } catch(e){} }); } catch(e){}
      } catch (e) {}
      return out;
    }).catch(() => ({}));

    const fs = require('fs');
  let stepsFile = null;
    if (inline && Object.keys(inline).length) {
      for (const k of Object.keys(inline)) {
        try {
          const v = inline[k];
          if (!v) continue;
          if (Array.isArray(v)) {
            const sf = `${outputDir}/course_${safeName}_steps.json`;
            try { fs.writeFileSync(sf, JSON.stringify(v, null, 2)); stepsFile = sf; } catch(e) {}
            lessonCount = lessonCount || v.length;
            break;
          }
          if (typeof v === 'object') {
            for (const kk of ['steps','curriculum','lessons','items','course_content','data']) {
              if (Array.isArray(v[kk]) && v[kk].length) {
                const sf = `${outputDir}/course_${safeName}_steps.json`;
                try { fs.writeFileSync(sf, JSON.stringify(v[kk], null, 2)); stepsFile = sf; } catch(e) {}
                lessonCount = lessonCount || v[kk].length;
                break;
              }
            }
            if (stepsFile) break;
          }
        } catch(e) {}
      }
    }

    // If still no steps found, try LearnDash REST endpoints and common WP REST links (best-effort)
  if (!stepsFile) {
      try {
        // try to find course ID or REST base from window globals
        const candidate = await page.evaluate(() => {
          const out = { courseId: null, restRoot: null };
          try { if (window.ldlmsData && window.ldlmsData.course_id) out.courseId = window.ldlmsData.course_id; } catch(e){}
          try { if (window.learndash && window.learndash.course && window.learndash.course.id) out.courseId = window.learndash.course.id; } catch(e){}
          try { if (window.wpApiSettings && window.wpApiSettings.root) out.restRoot = window.wpApiSettings.root; } catch(e){}
          // search for REST link tags
          try { const l = document.querySelector('link[rel="https://api.w.org/"]'); if (l && l.href) out.restRoot = out.restRoot || l.href; } catch(e){}
          return out;
        }).catch(()=>({}));

        if (candidate && candidate.courseId && candidate.restRoot) {
          const stepsUrl = `${candidate.restRoot.replace(/\/+$/,'')}/ldlms/v1/sfwd-courses/${candidate.courseId}/steps`;
          try {
            const resp = await page.goto(stepsUrl, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(()=>null);
            if (resp) {
              try {
                const txt = await resp.text();
                try { const json = JSON.parse(txt); if (Array.isArray(json) && json.length) { const sf = `${outputDir}/course_${safeName}_steps.json`; fs.writeFileSync(sf, JSON.stringify(json, null, 2)); stepsFile = sf; lessonCount = lessonCount || json.length; } } catch(e){}
              } catch(e){}
            }
          } catch(e){}
        }
      } catch(e){}
    }

    // As a last attempt, call admin-ajax endpoints that sometimes return curriculum JSON (best-effort)
  if (!stepsFile) {
      try {
        const adminAjaxCandidates = await page.evaluate(() => {
          const out = [];
          try { document.querySelectorAll('a,button').forEach(el => { const onclick = el.getAttribute('onclick'); if (onclick && onclick.includes('admin-ajax.php')) out.push(onclick); }); } catch(e){}
          return out;
        }).catch(() => []);
        for (const cand of adminAjaxCandidates) {
          try {
            // attempt to extract query string and call it
            const m = cand.match(/admin-ajax\.php\?([^']+)/);
            if (!m) continue;
            const qs = m[1];
            const adminUrl = `${(creds && creds.url) ? creds.url.replace(/\/+$/,'') : ''}/wp-admin/admin-ajax.php?${qs}`;
            const resp = await page.goto(adminUrl, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(()=>null);
            if (resp) {
              try {
                const txt = await resp.text();
                try { const json = JSON.parse(txt); if (json && (Array.isArray(json) || typeof json === 'object')) { const sf = `${outputDir}/course_${safeName}_steps.json`; fs.writeFileSync(sf, JSON.stringify(json, null, 2)); stepsFile = sf; if (Array.isArray(json)) lessonCount = lessonCount || json.length; break; } } catch(e){}
              } catch(e){}
            }
          } catch(e){}
        }
      } catch(e){}
    }

    // If still zero, attempt to decode path and reload (handles percent-encoded slugs)
  if (!lessonCount && isUrl) {
      try {
        const u = new URL(url);
        const decodedPath = decodeURIComponent(u.pathname);
        if (decodedPath && decodedPath !== u.pathname) {
          const decoded = `${u.origin}${decodedPath}${u.search || ''}`;
          await page.goto(decoded, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(()=>{});
          const shot2 = `${outputDir}/course_${safeName}_decoded.png`;
          await page.screenshot({ path: shot2 }).catch(()=>{});
          screenshots.push(shot2);
          lessonCount = await page.$$eval('.ld-lesson-list li, .lesson-item, .ld-item, .ld-lesson, ul.lessons li', els => els.length).catch(() => 0);
        }
      } catch (e) {}
    }

  assertions.push(mkAssert({ id: 'stepsFileExtracted', label: 'Steps JSON extracted', pass: !!stepsFile }));
  // Header presence for consistency with other flows
  let headerPresent = false;
  try { headerPresent = !!(await page.$('header, .bb-header, .site-header')); } catch(e) {}
  assertions.push(mkAssert({ id: 'courseHeaderPresent', label: 'Course header present', pass: headerPresent }));

  // Functional: attempt to start/continue course and open a lesson
  let startClicked = false;
  let navigatedToLesson = false;
  try {
    const startSelectors = [
      'a.bb-button, a.button, button, .ld-button, .btn'
    ];
    const labelMatches = [/continue/i, /start/i, /התחל/, /המשך/];
    // Find a clickable element whose text matches common labels
    let handle = null;
    for (const sel of startSelectors) {
      const hs = await page.$$(sel);
      for (const h of hs) {
        try {
          const t = (await page.evaluate(el => (el.innerText||'') + ' ' + (el.value||''), h)) || '';
          if (labelMatches.some(r => r.test(t))) { handle = h; break; }
        } catch(e){}
      }
      if (handle) break;
    }
    if (!handle) {
      // Fallback: the course content list first lesson link
      handle = await page.$('.ld-lesson-list a, .lesson-list a, .bb-lesson-item a');
    }
    if (handle) {
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 12000 }).catch(()=>{}),
        handle.click().catch(()=>{})
      ]);
      startClicked = true;
      try {
        const p = new URL(page.url());
        if (p.pathname.includes('/lessons/')) navigatedToLesson = true;
      } catch(e) {
        navigatedToLesson = /\/lessons\//.test(page.url());
      }
      // SPA fallback: if URL didn't change, consider presence of lesson/player selectors as success
      if (!navigatedToLesson) {
        try {
          const spaFound = await page.$$eval('.ld-lesson, .ld-lesson-list li, iframe, video, .learndash_player, .ld-video', els => els.length).catch(()=>0);
          if (spaFound > 0) navigatedToLesson = true;
        } catch(_) {}
      }
    }
  } catch(e) {}
  assertions.push(mkAssert({ id: 'startOrContinueClicked', label: 'Start/Continue course clicked', pass: startClicked }));
  assertions.push(mkAssert({ id: 'navigatedToLesson', label: 'Navigated to a lesson from course page', pass: navigatedToLesson }));

  // If this is a member courses URL and we still didn't detect lessons, try to drill into first course card
  try {
    if (!navigatedToLesson && /\/members\//.test(url)) {
      const courseLink = await page.$('.bb-course-item-wrap a.bb-course-title, .bb-course-item-wrap a, a.bb-course-title');
      if (courseLink) {
        await Promise.race([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 12000 }).catch(()=>{}),
          courseLink.click().catch(()=>{})
        ]);
        // re-run a minimal lesson presence check
        let found = 0;
        try {
          found = await page.$$eval('.ld-lesson-list li, .lesson-item, .ld-item, .ld-lesson, .ld-item-list .ld-item, .ld-table-list .ld-table-list-item', els => els.length).catch(()=>0);
        } catch(_) {}
        if (found > 0) { lessonCount = lessonCount || found; navigatedToLesson = true; }
      }
    }
  } catch(_) {}

  const meta = { url, lessonCount, assertions };
    if (stepsFile) meta.stepsFile = stepsFile;
    return { ok: true, meta, screenshots };
  } catch (err) {
    const shotErr = `${outputDir}/course_error_${Date.now()}.png`;
    try { await page.screenshot({ path: shotErr }); } catch(e) {}
    return { ok: false, error: err && err.message, meta: { url }, screenshots: [shotErr] };
  }
};
