const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
// Require puppeteer-har robustly: package may export the constructor as default or module.exports
const _puppeteerHar = require('puppeteer-har');
const PuppeteerHar = _puppeteerHar.PuppeteerHar || _puppeteerHar.default || _puppeteerHar;

// Load environment variables from .env (parent `qa/.env` or local) if present.
// Try dotenv if installed, otherwise parse manually so users don't need extra deps.
(() => {
  try {
    const tryPaths = [
      path.join(__dirname, '..', '.env'), // qa/.env (one level up)
      path.join(__dirname, '.env') // qa/puppeteer/.env (local)
    ];
    for (const p of tryPaths) {
      if (fs.existsSync(p)) {
        try {
          // prefer dotenv if available
          require('dotenv').config({ path: p });
          console.log('[orchestrator] loaded env via dotenv from', p);
        } catch (e) {
          // dotenv not installed — do a minimal manual parse
          const raw = fs.readFileSync(p, 'utf8');
          raw.split(/\r?\n/).forEach(line => {
            const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*(.*)\s*$/);
            if (!m) return;
            let val = m[2] || '';
            // Normalize: trim, remove trailing semicolon, then strip surrounding quotes
            val = val.trim();
            // remove trailing semicolon if present
            if (val.endsWith(';')) val = val.slice(0, -1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            val = val.trim();
            // don't overwrite existing env vars
            if (process.env[m[1]] === undefined) process.env[m[1]] = val;
          });
          console.log('[orchestrator] loaded env by manual parse from', p);
        }
        break; // stop after first found
      }
    }
  } catch (err) {
    console.warn('[orchestrator] .env load failed', err && err.message);
  }
})();

// We'll dynamically require only the flows that exist and are referenced in qa/flow_mapping.md
// This keeps the orchestrator aligned with the documented flow → page mapping.
const flowsDir = path.join(__dirname, 'flows');
const mappingPath = path.join(__dirname, '..', 'flow_mapping.md');

function safeRequireFlow(name) {
  try {
    const p = path.join(flowsDir, `${name}.js`);
    if (fs.existsSync(p)) return require(p);
  } catch (e) {
    // ignore
  }
  return null;
}

function parseFlowMapping() {
  const out = { desiredFlows: [], coverage: {}, rows: [] };
  if (!fs.existsSync(mappingPath)) return out;
  const raw = fs.readFileSync(mappingPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    // match table rows like: | file | name | `flows/loginFlow.js` ... |
    if (!line.trim().startsWith('|')) continue;
    if (line.includes('---')) continue; // separator
    // split by | and trim
    const parts = line.split('|').map(s => s.trim());
    // parts: ['', 'Page file', 'Page name', 'Puppeteer flow(s) available', ...]
    if (parts.length < 4) continue;
    const pageFile = parts[1] || '';
    const pageName = parts[2] || '';
    const flowsCell = parts[3] || '';
    out.rows.push({ pageFile, pageName, flowsCell });
    // extract flow filenames referenced as flows/<name>.js
    const re = /flows\/([A-Za-z0-9_\-]+)\.js/g;
    let m;
    while ((m = re.exec(flowsCell))) {
      out.desiredFlows.push(m[1]);
      out.coverage[m[1]] = (out.coverage[m[1]] || []).concat({ pageFile, pageName });
    }
    // also accept simple flow names like `ticketFlow` (no path)
    const reSimple = /`?([A-Za-z0-9_\-]+Flow)`?/g;
    while ((m = reSimple.exec(flowsCell))) {
      const name = m[1].replace(/`/g, '').replace(/\.js$/, '');
      if (name.endsWith('Flow') && !out.desiredFlows.includes(name)) out.desiredFlows.push(name);
    }
  }
  // dedupe
  out.desiredFlows = Array.from(new Set(out.desiredFlows));
  // extract any URLs in the file (links section) and classify them
  const urls = [];
  const urlRe = /https?:\/\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]+/g;
  let mu;
  while ((mu = urlRe.exec(raw))) urls.push(mu[0]);
  const classify = { courses: [], lessons: [], tickets: [], placement: [], grades: [], members: [], support: [], other: [], reviews: [] };
  for (const u of urls) {
    try {
      const parsed = new URL(u);
      const p = parsed.pathname.toLowerCase();
  // If a path contains both /courses/ and /lessons/ we want it classified as a lesson
  if (p.includes('/lessons/') || p.includes('/lessons')) classify.lessons.push(u);
  else if (p.includes('/courses/')) classify.courses.push(u);
      else if (p.includes('/tickets')) classify.tickets.push(u);
      else if (p.includes('/placement')) classify.placement.push(u);
      else if (p.includes('/grades')) classify.grades.push(u);
      else if (p.includes('/members/')) classify.members.push(u);
      else if (p.includes('technical-support') || p.includes('/support')) classify.support.push(u);
      else if (p.includes('%d7%9e%d7%a9%d7%95%d7%912') || decodeURIComponent(p).includes('משוב')) classify.reviews.push(u);
      else classify.other.push(u);
    } catch (e) {
      classify.other.push(u);
    }
  }
  out.links = classify;
  return out;
}

async function runAll(creds) {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  // create a timestamped run directory so each run's outputs are isolated
  const runId = `run-${new Date().toISOString().replace(/[:.]/g,'-')}`;
  const runDir = path.join(outputDir, runId);
  if (!fs.existsSync(runDir)) fs.mkdirSync(runDir, { recursive: true });
  // write a pointer to the last run for convenience
  try { fs.writeFileSync(path.join(outputDir, 'last_run.txt'), runId); } catch(e){}
  const defaultViewport = { width: 1280, height: 800 };
  // Per-flow timeout (ms). Short default avoids long hangs; configurable via env PER_FLOW_TIMEOUT_MS.
  const PER_FLOW_TIMEOUT_MS = parseInt(process.env.PER_FLOW_TIMEOUT_MS || '20000', 10);
  // sharedCookies will hold cookies captured after login so we can set them on new pages
  let sharedCookies = [];
  // Build flow plan from mapping file and available flow modules
  const mapping = parseFlowMapping();
  const availableFlowFiles = fs.existsSync(flowsDir) ? fs.readdirSync(flowsDir).filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, '')) : [];
  const planned = { availableFlowFiles, desiredFlows: mapping.desiredFlows, missingFlows: [], plannedRuns: [] };
  // lightweight body analysis and coverage helpers will live inside runAll so they can access runDir, browser and sharedCookies
  async function analyzeBodyForResult(browserRef, runDirRef, resObj, runObj) {
    try {
      if (!resObj) return resObj;
      if (!resObj.meta) resObj.meta = {};
      const target = resObj.meta.url || (runObj.args && runObj.args[0]) || null;
      if (!target) return resObj;
      const scanPage = await browserRef.newPage();
      try {
        try { await scanPage.setViewport(defaultViewport); } catch(e){}
        if (Array.isArray(sharedCookies) && sharedCookies.length) {
          try { await scanPage.setCookie(...sharedCookies); } catch(e) {}
        }
        await scanPage.goto(target, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{});
        const shot = path.join(runDirRef, `${runObj.runName}_body.png`);
        await scanPage.screenshot({ path: shot }).catch(()=>{});
        const bodyText = await scanPage.evaluate(() => document.body ? (document.body.innerText || '') : '');
        const html = await scanPage.evaluate(() => document.documentElement ? document.documentElement.outerHTML || '' : '');
        const headings = await scanPage.evaluate(() => Array.from(document.querySelectorAll('h1,h2,h3')).map(h => (h.innerText||'')).slice(0,10));
        const keywords = ['lesson','curriculum','syllabus','lessons','grade','ticket','support','profile','logout','login','שיעור','סילבוס','תוכנית','שירות'];
        const found = [];
        const lower = (bodyText || '').toLowerCase();
        for (const k of keywords) if (lower.includes(k)) found.push(k);
        resObj.meta.bodySummary = { url: target, textSample: (bodyText||'').slice(0,1000), htmlLength: (html||'').length, headings, keywordsFound: found };
        resObj.screenshots = resObj.screenshots || [];
        if (!resObj.screenshots.includes(shot)) resObj.screenshots.push(shot);
        try { await scanPage.close(); } catch(e){}
      } catch(e) {
        try { await scanPage.close(); } catch(e){}
      }
    } catch (e) {}
    return resObj;
  }

  function computeCoverageForResult(runName, resObj) {
    const meta = resObj && resObj.meta ? resObj.meta : {};
    const totalItems = [];
    const present = [];
    // HAR
    totalItems.push('har');
    if (resObj && resObj._har && fs.existsSync(resObj._har)) present.push('har');
    // console
    totalItems.push('console');
    if (resObj && resObj._console && fs.existsSync(resObj._console)) present.push('console');
    // screenshot(s)
    totalItems.push('screenshot');
    if (resObj && Array.isArray(resObj.screenshots) && resObj.screenshots.length) {
      let foundAny = false;
      for (const s of resObj.screenshots) if (fs.existsSync(s)) { foundAny = true; break; }
      if (foundAny) present.push('screenshot');
    }
    // content counts / domain-specific evidence
    totalItems.push('counts');
    let countsPresent = false;
    if (meta) {
      if (typeof meta.lessonCount === 'number' && meta.lessonCount > 0) countsPresent = true;
      if (typeof meta.rows === 'number' && meta.rows > 0) countsPresent = true;
      if (Array.isArray(meta.tabs) && meta.tabs.length) countsPresent = true;
      if (meta.headerPresent) countsPresent = true;
      if (meta.stepsFile) countsPresent = true;
      if (meta.verifyScreenshot) countsPresent = true; // login verified evidence
    }
    if (countsPresent) present.push('counts');
    // special: login requires loginVerified
    if (runName === 'login') {
      totalItems.push('loginVerified');
      if (meta && meta.loginVerified) present.push('loginVerified');
    }
    const percent = Math.round((present.length / totalItems.length) * 100);
    // Assertion rollup (small addition): summarize pass/total from meta.assertions if present
    let assertions = { total: 0, passed: 0, percent: 0 };
    try {
      const arr = Array.isArray(meta.assertions) ? meta.assertions : [];
      const total = arr.length;
      const passed = arr.filter(a => a && a.pass === true).length;
      const ap = total ? Math.round((passed / total) * 100) : 0;
      assertions = { total, passed, percent: ap };
    } catch (e) {}
    return { runName, total: totalItems.length, present: present.length, percent, items: { total: totalItems, present }, assertions };
  }
  // Map known logical flow names to run names and modules
  const logicalMap = {
    loginFlow: { runName: 'login' },
    coursePageFlow: { runNamePrefix: 'course-' },
    // Use a distinct runName for the courses index to avoid clashing with the
    // aggregated results.courses array used for per-course detail runs.
    coursesFlow: { runName: 'courses-list' },
    lessonPageFlow: { runName: 'lesson' },
    ticketFlow: { runName: 'ticket' },
    gradesFlow: { runName: 'grades' },
    profileFlow: { runName: 'profile' },
    supportFlow: { runName: 'support' },
    placementFlow: { runName: 'placement' },
    reviewsFlow: { runName: 'reviews' }
  };

  // Determine actual flows to require
  const flowsToRequire = {};
  for (const name of mapping.desiredFlows) {
    if (availableFlowFiles.includes(name)) {
      flowsToRequire[name] = safeRequireFlow(name);
    } else {
      planned.missingFlows.push(name);
    }
  }
  // Always ensure core flows we may run are included if present
  ['loginFlow','coursePageFlow','lessonPageFlow','ticketFlow','gradesFlow','profileFlow','supportFlow','placementFlow','reviewsFlow'].forEach(n => {
    if (!Object.prototype.hasOwnProperty.call(flowsToRequire, n) && availableFlowFiles.includes(n)) {
      flowsToRequire[n] = safeRequireFlow(n);
    }
  });

  // Build plannedRuns array strictly from mapping links (no sample defaults).
  // Use mapping.links (courses/lessons/members/etc.) to create specific runs.
  const links = mapping.links || { courses: [], lessons: [], tickets: [], placement: [], grades: [], members: [], support: [], other: [] };
  if (flowsToRequire['loginFlow']) planned.plannedRuns.push({ runName: 'login', module: flowsToRequire['loginFlow'] });

  // Unconditionally include Support and Placement early using BuddyPanel defaults if mapping lacks URLs
  try {
    const base = (creds.url || '').replace(/\/+$/, '');
    if (flowsToRequire['supportFlow']) {
      const supportUrl = (links.support && links.support[0]) || (base ? `${base}/technical-support-guide/` : undefined);
      planned.plannedRuns.push({ runName: 'support', module: flowsToRequire['supportFlow'], args: supportUrl ? [supportUrl] : [] });
    }
    if (flowsToRequire['placementFlow']) {
      const placementUrl = (links.placement && links.placement[0]) || (base ? `${base}/placement/` : undefined);
      planned.plannedRuns.push({ runName: 'placement', module: flowsToRequire['placementFlow'], args: placementUrl ? [placementUrl] : [] });
    }
  } catch (e) { console.warn('[orchestrator] support/placement early insert failed', e && e.message); }

  // Course runs: one per explicit course URL found in flow_mapping.md
  if (flowsToRequire['coursePageFlow']) {
    if (links.courses.length) {
      // protect against lesson URLs present under courses (e.g. /courses/<slug>/lessons/<id>)
      const courseUrls = links.courses.filter(u => !u.toLowerCase().includes('/lessons/'));
      for (const url of courseUrls) {
        // create a short run name from last path segment
        const seg = (() => { try { const p = new URL(url).pathname.split('/').filter(Boolean); return p[p.length-1] || p.join('-') } catch(e){ return encodeURIComponent(url); } })();
        planned.plannedRuns.push({ runName: `course-${seg}`, module: flowsToRequire['coursePageFlow'], args: [url] });
      }
    } else {
      planned.missingTargets = planned.missingTargets || {};
      planned.missingTargets.coursePageFlow = 'no course URLs found in flow_mapping.md links';
    }
  }

  // Run the courses index as "courses-list" to avoid colliding with results.courses[]
  if (flowsToRequire['coursesFlow']) planned.plannedRuns.push({ runName: 'courses-list', module: flowsToRequire['coursesFlow'] });

  // Lesson runs from links
  if (flowsToRequire['lessonPageFlow']) {
    // include explicit lesson links plus any course links that point to lessons
    const lessonUrls = [].concat(links.lessons || []);
    const courseLessonUrls = (links.courses || []).filter(u => u.toLowerCase().includes('/lessons/'));
    for (const u of courseLessonUrls) lessonUrls.push(u);
    if (lessonUrls.length) {
      for (const url of lessonUrls) {
        const seg = (() => { try { const p = new URL(url).pathname.split('/').filter(Boolean); return p[p.length-1] || p.join('-') } catch(e){ return encodeURIComponent(url); } })();
        planned.plannedRuns.push({ runName: `lesson-${seg}`, module: flowsToRequire['lessonPageFlow'], args: [url] });
      }
    } else {
      planned.missingTargets = planned.missingTargets || {};
      planned.missingTargets.lessonPageFlow = 'no lesson URLs found in flow_mapping.md links';
    }
  }

  // Other single runs
  if (flowsToRequire['ticketFlow']) {
    // ticket flow might not need a URL — but if a tickets link exists, include it
    if (links.tickets.length) {
      planned.plannedRuns.push({ runName: 'ticket', module: flowsToRequire['ticketFlow'], args: [links.tickets[0]] });
    } else {
      planned.plannedRuns.push({ runName: 'ticket', module: flowsToRequire['ticketFlow'] });
    }
  }
  if (flowsToRequire['gradesFlow']) {
    if (links.grades && links.grades.length) planned.plannedRuns.push({ runName: 'grades', module: flowsToRequire['gradesFlow'], args: [links.grades[0]] });
    else planned.plannedRuns.push({ runName: 'grades', module: flowsToRequire['gradesFlow'] });
  }
  if (flowsToRequire['profileFlow']) {
    // prefer a members URL to test profile pages
    if (links.members && links.members.length) planned.plannedRuns.push({ runName: 'profile', module: flowsToRequire['profileFlow'], args: [links.members[0]] });
    else planned.plannedRuns.push({ runName: 'profile', module: flowsToRequire['profileFlow'] });
  }
  // (Support/Placement were inserted early; avoid duplicates here)
  // Reviews: prefer classified reviews link, else try to detect in other links
  if (flowsToRequire['reviewsFlow']) {
    let reviewUrl = null;
    if (links.reviews && links.reviews.length) reviewUrl = links.reviews[0];
    if (!reviewUrl) {
      const all = ([]).concat(links.other || [], links.support || []);
      for (const u of all) {
        try {
          const p = new URL(u).pathname;
          const dec = decodeURIComponent(p || '').toLowerCase();
          if (dec.includes('משוב')) { reviewUrl = u; break; }
        } catch (e) {
          try { if (decodeURIComponent(String(u)).includes('משוב')) { reviewUrl = u; break; } } catch(ee) {}
        }
      }
    }
    planned.plannedRuns.push({ runName: 'reviews', module: flowsToRequire['reviewsFlow'], args: reviewUrl ? [reviewUrl] : [] });
  }

  // Final guard: ensure support and placement are included if modules exist (dedupe by runName)
  try {
    const have = new Set(planned.plannedRuns.map(r => r.runName));
    if (flowsToRequire['supportFlow'] && !have.has('support')) {
      const su = (links.support && links.support[0]) || undefined;
      planned.plannedRuns.push({ runName: 'support', module: flowsToRequire['supportFlow'], args: su ? [su] : undefined });
      have.add('support');
    }
    if (flowsToRequire['placementFlow'] && !have.has('placement')) {
      const pu = (links.placement && links.placement[0]) || undefined;
      planned.plannedRuns.push({ runName: 'placement', module: flowsToRequire['placementFlow'], args: pu ? [pu] : undefined });
      have.add('placement');
    }
  } catch (e) {}

  // Persist flow plan for transparency inside the run directory, include which flows were required
  try { planned.requiredFlows = Object.keys(flowsToRequire); } catch (e) {}
  try { console.log('[orchestrator] required flows:', Object.keys(flowsToRequire)); } catch (e) {}
  try { console.log('[orchestrator] planned runs:', (planned.plannedRuns || []).map(r => r.runName)); } catch (e) {}
  // persist flow plan for transparency inside the run directory
  try { fs.writeFileSync(path.join(runDir, 'flow_plan.json'), JSON.stringify(planned, null, 2)); } catch(e){}
  // We'll create per-flow HAR files and per-flow console logs to improve evidence granularity.
  async function runFlow(name, fn, ...args) {
    const harPath = path.join(runDir, `${name}.har`);
    const consolePath = path.join(runDir, `${name}.console.log`);
    const logs = [];
    const flowPage = await browser.newPage();
    try { await flowPage.setViewport(defaultViewport); } catch(e){}
    const onConsole = msg => {
      try { logs.push(`${new Date().toISOString()} [${msg.type()}] ${msg.text()}`); } catch(e) {}
    };
    flowPage.on('console', onConsole);
    const har = new PuppeteerHar(flowPage);
    let res = { ok: false };
    try {
      // If login provided cookies earlier, apply them to this page so sessions persist.
      if (Array.isArray(sharedCookies) && sharedCookies.length) {
        try { await flowPage.setCookie(...sharedCookies); } catch(e) { console.warn('[orchestrator] failed to set cookies on flow page', e && e.message); }
      }
      await har.start({ path: harPath });
      // pass the runDir as the output directory to flows so they save screenshots inside the run folder
      // Protect each flow with a timeout so a single page won't block the whole run.
      try {
        // start a cancellable timeout so we can clear it when the flow completes
        let timeoutId;
        const timeoutPromise = new Promise((_, rej) => { timeoutId = setTimeout(() => rej(new Error('flow_timeout')), PER_FLOW_TIMEOUT_MS); });
        try {
          const result = await Promise.race([
            (async () => { return await fn(flowPage, runDir, ...args); })(),
            timeoutPromise
          ]);
          res = Object.assign({}, result || {}, { _har: harPath });
        } finally {
          try { if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId); } catch(e){}
        }
      } catch (err) {
        res = { ok: false, error: err && err.message ? err.message : String(err) };
      }
      try { await har.stop(); } catch(e){}
    } catch (err) {
      try { await har.stop(); } catch (e) {}
      res = { ok: false, error: err && err.message };
    } finally {
      try { flowPage.removeListener('console', onConsole); } catch(e){}
      try { fs.writeFileSync(consolePath, logs.join('\n')); } catch(e) {}
      try { await flowPage.close(); } catch(e){}
      res._console = consolePath;
    }
    return res;
  }

  let results = {};
  let abortAllRuns = false;
  try {
    // iterate planned runs
    for (const r of planned.plannedRuns) {
      if (abortAllRuns) break;
      try {
        const args = [creds].concat(r.args || []);
        const res = await runFlow(r.runName, r.module, ...args);
        // If this was the login run, capture cookies for reuse
        if (r.runName === 'login' && res && res.meta && Array.isArray(res.meta.cookies)) {
          sharedCookies = res.meta.cookies.map(c => {
            // ensure minimal cookie fields for setCookie and include URL so puppeteer can set the cookie
            const out = { name: c.name, value: c.value, url: creds.url };
            if (c.domain) out.domain = c.domain;
            if (c.path) out.path = c.path;
            if (typeof c.expires !== 'undefined') out.expires = c.expires;
            if (typeof c.httpOnly !== 'undefined') out.httpOnly = c.httpOnly;
            if (typeof c.secure !== 'undefined') out.secure = c.secure;
            if (typeof c.sameSite !== 'undefined') out.sameSite = c.sameSite;
            return out;
          });
          console.log(`[orchestrator] captured ${sharedCookies.length} cookies from login`);
          if (!sharedCookies.length) console.warn('[orchestrator] warning: login returned zero cookies; subsequent flows may be unauthenticated');
          // give the server a moment to settle session cookies
          await new Promise(rp => setTimeout(rp, 1500));
          // Post-login verification: open a members URL (if available) or root and assert logged-in indicators
          try {
            const verifyUrl = (mapping && mapping.links && mapping.links.members && mapping.links.members[0]) || creds.url || (creds.url + '/');
            const verifyPage = await browser.newPage();
            try {
              await verifyPage.setViewport(defaultViewport).catch(()=>{});
              if (Array.isArray(sharedCookies) && sharedCookies.length) {
                try { await verifyPage.setCookie(...sharedCookies); } catch(e) { console.warn('[orchestrator] failed to set cookies on verify page', e && e.message); }
              }
              await verifyPage.goto(verifyUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(()=>{});
              const verifyScreenshot = path.join(runDir, 'login_verify.png');
              await verifyPage.screenshot({ path: verifyScreenshot }).catch(()=>{});
              // selectors that often indicate logged-in state
              const loggedInSelectors = ['.bb-user-nav', '.bb-user-avatar', 'a[href*="logout"]', '.profile-menu', '.wp-admin-bar-my-account', '.logout'];
              let verified = false;
              for (const sel of loggedInSelectors) {
                try {
                  const el = await verifyPage.$(sel);
                  if (el) { verified = true; break; }
                } catch (e) {}
              }
              // fallback: check for username or profile keyword in page text
              if (!verified) {
                try {
                  const bodyText = await verifyPage.evaluate(() => document.body.innerText || '');
                  if (bodyText && (bodyText.toLowerCase().includes('profile') || bodyText.toLowerCase().includes('logout') )) verified = true;
                } catch(e){}
              }
              res.meta.loginVerified = verified;
              res.meta.verifyUrl = verifyUrl;
              res.meta.verifyScreenshot = verifyScreenshot;
                  if (!verified) {
                    console.error('[orchestrator] post-login verification failed — aborting remaining runs');
                    // record login result and abort the rest of the planned runs gracefully
                    results.login = res;
                    abortAllRuns = true;
                    try { await verifyPage.close().catch(()=>{}); } catch(e){}
                    break;
                  }
            } finally {
              try { await verifyPage.close(); } catch(e){}
            }
          } catch (e) {
            console.warn('[orchestrator] post-login verification error', e && e.message);
          }
        }
        // group course-* runs together
        if (r.runName.startsWith('course-')) {
          results.courses = results.courses || [];
          results.courses.push(res);
        } else {
          results[r.runName] = res;
        }
        // persist partial results and per-run coverage so folder is shareable
        try { fs.writeFileSync(path.join(runDir, 'results.json'), JSON.stringify(results, null, 2)); } catch(e){}
        try {
          const cov = {};
          for (const k of Object.keys(results)) {
            if (k === 'courses') continue;
            cov[k] = computeCoverageForResult(k, results[k]);
          }
          if (Array.isArray(results.courses)) {
            cov.courses = results.courses.map((c,i) => computeCoverageForResult(`course-${i}`, c));
          }
          fs.writeFileSync(path.join(runDir, 'coverage.json'), JSON.stringify(cov, null, 2));
        } catch(e){}
      } catch (err) {
        results[r.runName] = { ok: false, error: err && err.message };
      }
    }

  // Ensure support & placement executed even if missing from initial plan; update plan file accordingly
    try {
      const ensurePost = [];
      if (!results.support && flowsToRequire['supportFlow']) {
        const su = (links.support && links.support[0]) || undefined;
        planned.plannedRuns.push({ runName: 'support', module: flowsToRequire['supportFlow'], args: su ? [su] : undefined });
        ensurePost.push({ runName: 'support', module: flowsToRequire['supportFlow'], args: su ? [su] : [] });
      }
      if (!results.placement && flowsToRequire['placementFlow']) {
        const pu = (links.placement && links.placement[0]) || undefined;
        planned.plannedRuns.push({ runName: 'placement', module: flowsToRequire['placementFlow'], args: pu ? [pu] : undefined });
        ensurePost.push({ runName: 'placement', module: flowsToRequire['placementFlow'], args: pu ? [pu] : [] });
      }
      if (ensurePost.length) {
        try { fs.writeFileSync(path.join(runDir, 'flow_plan.json'), JSON.stringify(planned, null, 2)); } catch(e){}
        for (const ep of ensurePost) {
          try {
            const res = await runFlow(ep.runName, ep.module, creds, ...(ep.args || []));
            results[ep.runName] = res;
            try { fs.writeFileSync(path.join(runDir, 'results.json'), JSON.stringify(results, null, 2)); } catch(e){}
          } catch (e) {}
        }
      }
    } catch (e) {}

  // Post-run: analyze bodies and compute coverage for each flow
    try {
      const coverage = { runId: runId, date: new Date().toISOString(), perFlow: [], overall: { total: 0, covered: 0, percent: 0 }, assertionsOverall: { total: 0, passed: 0, percent: 0 } };
      // For courses array
      if (Array.isArray(results.courses)) {
        for (let i = 0; i < results.courses.length; i++) {
          const r = results.courses[i];
          const runObj = { runName: `course-${i}`, args: [] };
          results.courses[i] = await analyzeBodyForResult(browser, runDir, r, runObj);
          const cov = computeCoverageForResult(`course-${i}`, results.courses[i]);
          coverage.perFlow.push(cov);
        }
      }
      // For other named runs
      const keys = Object.keys(results).filter(k => k !== 'courses');
      for (const k of keys) {
        try {
          const r = results[k];
          const runObj = { runName: k, args: [] };
          results[k] = await analyzeBodyForResult(browser, runDir, r, runObj);
          const cov = computeCoverageForResult(k, results[k]);
          coverage.perFlow.push(cov);
        } catch (e) {}
      }
  // compute overall
  coverage.overall.total = coverage.perFlow.length * 100;
  const sum = coverage.perFlow.reduce((s, p) => s + (p.percent || 0), 0);
  coverage.overall.covered = sum;
  coverage.overall.percent = Math.round(sum / (coverage.perFlow.length || 1));
  // assertion overall rollup (sum of totals and passed across flows)
  try {
    const aTotals = coverage.perFlow.reduce((acc, p) => {
      const a = p && p.assertions ? p.assertions : { total: 0, passed: 0 };
      acc.total += a.total || 0;
      acc.passed += a.passed || 0;
      return acc;
    }, { total: 0, passed: 0 });
    coverage.assertionsOverall.total = aTotals.total;
    coverage.assertionsOverall.passed = aTotals.passed;
    coverage.assertionsOverall.percent = aTotals.total ? Math.round((aTotals.passed / aTotals.total) * 100) : 0;
  } catch (e) {}
  // close the browser now that analysis which relied on it is complete
  try { await browser.close(); } catch(e) {}
  // write coverage.json and update results.json
      try { fs.writeFileSync(path.join(runDir, 'coverage.json'), JSON.stringify(coverage, null, 2)); } catch(e){}
      try { fs.writeFileSync(path.join(runDir, 'results.json'), JSON.stringify(results, null, 2)); } catch(e){}
      console.log('Done. Outputs in', runDir);
      // Optional debug: print active handles/requests to help diagnose lingering process handles
      if (process.env.DEBUG_HANDLES === '1') {
        try {
          console.log('[orchestrator] DEBUG_HANDLES=1 — printing active handles and requests');
          if (typeof process._getActiveHandles === 'function') console.log('activeHandles:', process._getActiveHandles());
          if (typeof process._getActiveRequests === 'function') console.log('activeRequests:', process._getActiveRequests());
        } catch (e) { console.warn('[orchestrator] debug handles print failed', e && e.message); }
      }
    } catch (e) {
      // fallback
      try { fs.writeFileSync(path.join(runDir, 'results.json'), JSON.stringify(results, null, 2)); } catch(e){}
      console.log('Done (with partial analysis). Outputs in', runDir);
    }
  } catch (err) {
    console.error('Orchestrator error', err && err.stack ? err.stack : err);
    try { await browser.close(); } catch(e){}
  }
  // persist partial results on unexpected exceptions so the run folder remains useful
  process.on('uncaughtException', err => {
    try { fs.writeFileSync(path.join(runDir, 'results.json'), JSON.stringify(results, null, 2)); } catch(e){}
    try { fs.writeFileSync(path.join(runDir, 'coverage.json'), JSON.stringify(Object.keys(results).reduce((acc,k)=>{ acc[k]=computeCoverageForResult(k, results[k]); return acc; },{}), null, 2)); } catch(e){}
    console.error('[orchestrator] uncaughtException, wrote partial results:', err && err.message);
    process.exit(1);
  });
  process.on('unhandledRejection', err => {
    try { fs.writeFileSync(path.join(runDir, 'results.json'), JSON.stringify(results, null, 2)); } catch(e){}
    try { fs.writeFileSync(path.join(runDir, 'coverage.json'), JSON.stringify(Object.keys(results).reduce((acc,k)=>{ acc[k]=computeCoverageForResult(k, results[k]); return acc; },{}), null, 2)); } catch(e){}
    console.error('[orchestrator] unhandledRejection, wrote partial results:', err && (err.message || String(err)));
  });
}

if (require.main === module) {
  const sanitize = v => {
    if (!v && v !== '') return undefined;
    let s = String(v).trim();
    if (s.endsWith(';')) s = s.slice(0, -1).trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
    return s.trim();
  };
  const creds = {
    url: sanitize(process.env.STAGING_URL),
    email: sanitize(process.env.STUDENT_EMAIL),
    password: sanitize(process.env.STUDENT_PASSWORD)
  };
  console.log(creds);
  
  if (!creds.url || !creds.email || !creds.password) {
    console.error('Set STAGING_URL, STUDENT_EMAIL, STUDENT_PASSWORD');
    process.exit(1);
  }
  runAll(creds);
}
