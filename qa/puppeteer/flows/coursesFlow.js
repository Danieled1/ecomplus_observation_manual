// Optional metrics export: fall back to no-op if the helper isn't present in this repo
let addMetric = () => {};
try {
  const m = require("../../puppeteer-app/logger/metricsExporter");
  addMetric = typeof m.addMetric === 'function' ? m.addMetric : addMetric;
} catch (e) {
  addMetric = () => {};
}
const { validateSidebarNav } = require('../tools/sidebarNav');

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

module.exports = async function coursesFlow(page, context = {}) {
  const url = 'https://app.digitalschool.co.il/members/test_live_student/courses/';
  const outDir = typeof context === 'string' ? context : (context.outputDir || '.');
  const start = performance.now(); // ⏱️ UX: Start timing
  const MAX_CARDS = parseInt(process.env.COURSES_LIST_MAX_CARDS || '5', 10);
  const MAX_SUBPAGE_OPENS = parseInt(process.env.COURSES_LIST_MAX_SUBPAGES || '2', 10);

  const perCourse = [];
  const xhrCalls = [];
  const xhrResponses = [];

  function summarizeBody(body) {
    try {
      if (body === null || body === undefined) return { type: 'null' };
      if (typeof body === 'string') return { type: 'string', length: body.length, snippet: body.slice(0, 200) };
      if (Array.isArray(body)) return { type: 'array', length: body.length, sample: body.slice(0, 3) };
      if (typeof body === 'object') {
        const keys = Object.keys(body || {}).slice(0, 10);
        const summary = {};
        for (const k of keys) {
          const v = body[k];
          if (Array.isArray(v)) summary[k] = { type: 'array', length: v.length };
          else if (v && typeof v === 'object') summary[k] = { type: 'object' };
          else summary[k] = { type: typeof v, value: String(v).slice(0, 200) };
        }
        return { type: 'object', topKeys: keys, summary };
      }
      return { type: typeof body };
    } catch (e) { return { type: 'error' }; }
  }

  page.on('requestfinished', async req => {
    try {
      const u = req.url();
      if (u.includes('admin-ajax.php') || u.includes('/wp-json/')) {
        xhrCalls.push(u);
        try {
          const res = await req.response();
          const ct = (res.headers() || {})['content-type'] || '';
          if (ct.includes('application/json')) {
            const body = await res.json().catch(()=>null);
            xhrResponses.push({ url: u, contentType: ct, summary: summarizeBody(body) });
          } else {
            const text = await res.text().catch(()=>null);
            xhrResponses.push({ url: u, contentType: ct, summary: summarizeBody(text) });
          }
        } catch(e){}
      }
    } catch(e){}
  });

  try {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
    const domLoaded = performance.now();
    console.log(`📥 DOM content loaded in ${(domLoaded - start).toFixed(0)}ms`); // ⏱️ UX: DOM load time

    // Wait for course cards (if a different selector is used, we tolerate timeout)
    try { await page.waitForSelector('.bb-course-item-wrap, .course-card, .course-listing', { timeout: 5000 }); } catch(e) {}

    const cards = await page.$$eval('.bb-course-item-wrap, .course-card, .course-listing .course', els => els.map(el => {
      const a = el.querySelector('a');
      const title = el.querySelector('.course-title, .bb-course-title, h3')?.innerText || a?.innerText || '';
      const href = a ? a.href : null;
      return { title: title ? title.trim() : '', href };
    })).catch(()=>[]);

    const courseCount = cards.length;
    console.log(`🎓 Found ${courseCount} course cards`);
    const assertions = [];
    assertions.push(mkAssert({ id: 'courseCardsPresent', label: 'Course cards present', pass: courseCount > 0, selector: '.bb-course-item-wrap, .course-card, .course-listing .course' }));

    // For each course card, try to infer lesson count from either inline info, XHRs, or by navigating into the course detail page
  let subpagesOpened = 0;
  for (let i = 0; i < cards.length && i < MAX_CARDS; i++) {
      const c = cards[i];
      const entry = { index: i, title: c.title, href: c.href, lessonCount: 0 };
      // Quick heuristic: check if the card contains a lessons count badge via DOM
      try {
        entry.lessonCount = await page.$$eval('.bb-course-item-wrap, .course-card, .course-listing .course', (els, idx) => {
          const el = els[idx];
          if (!el) return 0;
          const badge = el.querySelector('.lesson-count, .num-lessons, .course-lessons');
          if (badge) return parseInt(badge.innerText.replace(/[^0-9]/g,'')) || 0;
          return 0;
        }, i).catch(()=>0);
      } catch(e){}

      // If still zero, try to inspect captured XHRs that might reference this course by URL or slug
      if (!entry.lessonCount && xhrResponses.length) {
        for (const r of xhrResponses) {
          try {
            if (!r || !r.summary) continue;
            const s = r.summary;
            if (s.type === 'array') {
              // best-effort: check sample objects for slug/title
              const sample = r.sample || s.sample || [];
              for (const b of sample) {
                try {
                  if (b && ((b.post_name && c.href && b.post_name === new URL(c.href).pathname.split('/').filter(Boolean).pop()) || (b.title && c.title && String(b.title).includes(c.title)))) {
                    entry.lessonCount = s.length || 0; break;
                  }
                } catch(e){}
              }
              if (entry.lessonCount) break;
            } else if (s.type === 'object' && s.summary) {
              if (s.summary.lessons && s.summary.lessons.type === 'array') entry.lessonCount = s.summary.lessons.length;
              else if (s.summary.data && s.summary.data.type === 'array') entry.lessonCount = s.summary.data.length;
              if (entry.lessonCount) break;
            } else if (s.type === 'string' && s.snippet && c.href && s.snippet.includes(c.href)) {
              entry.lessonCount += (s.snippet.match(/<li\b/gi) || []).length;
            }
          } catch(e){}
        }
      }

      // If still zero and we have an href, attempt to navigate into the course detail page to count lessons
      if (!entry.lessonCount && c.href && subpagesOpened < MAX_SUBPAGE_OPENS) {
        try {
          const subPage = await page.browser().newPage();
          await subPage.setViewport({ width: 1200, height: 800 });
          // copy cookies from main page
          const cookies = await page.cookies();
          if (cookies && cookies.length) await subPage.setCookie(...cookies);
          await subPage.goto(c.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
          const sel = '.ld-lesson-list li, .lesson-item, .ld-item, .ld-lesson, ul.lessons li, .lesson-list li, .bb-lesson-item, .ld-item-list .ld-item, .ld-item-list .ld-item-list-item, .ld-table-list .ld-table-list-item, .ld-lesson-items li, .bb-course-lesson-item, .ld-course-content .ld-item-list-item';
          let found = 0;
          for (let r=0;r<5;r++) {
            found = await subPage.$$eval(sel, els => els.length).catch(()=>0);
            if (found) break;
            await new Promise(res => setTimeout(res, 300));
          }
          entry.lessonCount = found;
          const snap = `${(context.outputDir || '.')}/course_detail_${i}_${encodeURIComponent(c.title || 'course')}.png`;
          await subPage.screenshot({ path: snap }).catch(()=>{});
          entry.detailScreenshot = snap;
          // attempt inline JSON/window-global extraction for steps
          try {
            const inlineFound = await subPage.evaluate(() => {
              const out = {};
              try {
                const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
                scripts.forEach((s, i) => { try { out[`script_json_${i}`] = JSON.parse(s.textContent); } catch(e){} });
              } catch(e){}
              try { if (window.ldGlobalSettings) out.ldGlobalSettings = window.ldGlobalSettings; } catch(e){}
              try { if (window.wpApiSettings) out.wpApiSettings = window.wpApiSettings; } catch(e){}
              try { if (window.ldlms) out.ldlms = window.ldlms; } catch(e){}
              try { if (window.learndash) out.learndash = window.learndash; } catch(e){}
              try { if (window.ldlmsData) out.ldlmsData = window.ldlmsData; } catch(e){}
              // Additional LearnDash globals sometimes used by themes
              try { if (window.ldCourseData) out.ldCourseData = window.ldCourseData; } catch(e){}
              try { if (window.ldVars) out.ldVars = window.ldVars; } catch(e){}
              try { if (window.ldData) out.ldData = window.ldData; } catch(e){}
              // data-* payloads
              try { Array.from(document.querySelectorAll('[data-ld-steps], [data-course]')).forEach((el, i) => { try { out[`data_attr_${i}`] = JSON.parse(el.getAttribute('data-ld-steps') || el.getAttribute('data-course') || '{}'); } catch(e){} }); } catch(e){}
              return out;
            }).catch(()=>({}));
            if (inlineFound && Object.keys(inlineFound).length) {
              const fs = require('fs');
              for (const k of Object.keys(inlineFound)) {
                try {
                  const v = inlineFound[k];
                  if (!v) continue;
                  if (Array.isArray(v)) {
                    const sf = `${(context.outputDir || '.')}/course_${i}_steps.json`;
                    try { fs.writeFileSync(sf, JSON.stringify(v, null, 2)); entry.stepsFile = sf; } catch(e){}
                    entry.lessonCount = v.length; break;
                  } else if (typeof v === 'object') {
                    for (const kk of ['steps','curriculum','lessons','items','course_content','data']) {
                      if (Array.isArray(v[kk]) && v[kk].length) {
                        const sf = `${(context.outputDir || '.')}/course_${i}_steps.json`;
                        try { fs.writeFileSync(sf, JSON.stringify(v[kk], null, 2)); entry.stepsFile = sf; } catch(e){}
                        entry.lessonCount = v[kk].length; break;
                      }
                    }
                    if (entry.lessonCount) break;
                  }
                } catch(e){}
              }
            }
          } catch(e){}
          await subPage.close();
          subpagesOpened += 1;
        } catch(e) {
          // ignore navigation errors
        }
      }

      perCourse.push(entry);
    }

    await new Promise(r => setTimeout(r, 500)); // small breathing room
    const end = performance.now();
    const totalTime = Math.round(end - start);
    if (context?.shouldExport) {
      addMetric({ flow: 'courses', totalMs: totalTime, domMs: Math.round(domLoaded - start), courseCount, timestamp: new Date().toISOString() });
    }

    // BuddyPanel validation (non-blocking)
    let meta = { url, courseCount, perCourse, xhrCalls: xhrCalls.length?xhrCalls:undefined, xhrResponses: xhrResponses.length?xhrResponses:undefined };
    try {
      const nav = await validateSidebarNav(page, url, outDir, { contentSelectors: ['.bb-course-item-wrap', '.course-card', '.entry-content'], shotName: 'courses_sidebar.png' });
      if (nav) Object.assign(meta, nav);
      const header = await page.$('header, .bb-header, .site-header');
      if (header) meta.headerPresent = true;
    } catch(e) {}

    // Aggregate assertion: at least one course has lesson count or steps file
    const anyLessonCount = perCourse.some(c => (c.lessonCount || 0) > 0);
    const anyStepsFile = perCourse.some(c => !!c.stepsFile);
    assertions.push(mkAssert({ id: 'anyCourseHasLessons', label: 'At least one course has lessons', pass: anyLessonCount }));
    assertions.push(mkAssert({ id: 'anyCourseStepsExtracted', label: 'At least one course steps file extracted', pass: anyStepsFile }));
    meta.assertions = assertions;

  return { ok: true, meta, screenshots: [] };
  } catch (err) {
    console.warn('⚠️ Courses page failed:', err.message);
    return { ok: false, error: err.message, meta: { url } };
  }
};
