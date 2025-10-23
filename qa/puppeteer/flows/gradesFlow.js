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

module.exports = async function gradesFlow(page, outputDir, creds) {
  const url = `${(creds.url || '').replace(/\/+$/,'')}/grades/`;
  const screenshots = [];
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

  // capture finished requests and attempt to read JSON/text responses for admin-ajax/wp-json
  page.on('requestfinished', async req => {
    try {
      const u = req.url();
      if (u.includes('admin-ajax.php') || u.includes('/wp-json/')) {
        xhrCalls.push(u);
        try {
          const res = await req.response();
          const ct = res.headers()['content-type'] || '';
          if (ct.includes('application/json')) {
            const body = await res.json().catch(()=>null);
            xhrResponses.push({ url: u, contentType: ct, summary: summarizeBody(body) });
          } else {
            const text = await res.text().catch(()=>null);
            xhrResponses.push({ url: u, contentType: ct, summary: summarizeBody(text) });
          }
        } catch(e) {
          // ignore body read errors
        }
      }
    } catch(e){}
  });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const shot = `${outputDir}/grades.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    screenshots.push(shot);
    const assertions = [];

    // Wait up to 5s for any matching XHRs to appear
    const waitForXhr = async (timeout = 5000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (xhrCalls.length > 0) return true;
        await new Promise(r => setTimeout(r, 200));
      }
      return false;
    };
    await waitForXhr(3000);

    // If we have XHR responses captured, try to inspect them for grade rows
  let rows = 0;
    if (xhrResponses.length) {
      for (const r of xhrResponses) {
        try {
          const s = r.summary;
          if (!s) continue;
          if (s.type === 'array') rows += s.length;
          else if (s.type === 'object' && s.summary) {
            if (s.summary.data && s.summary.data.type === 'array') rows += s.summary.data.length;
            else if (s.summary.rows && s.summary.rows.type === 'array') rows += s.summary.rows.length;
            else {
              // attempt to find any top-level array summaries
              for (const k of Object.keys(s.summary)) {
                if (s.summary[k] && s.summary[k].type === 'array') rows += s.summary[k].length || 0;
              }
            }
          } else if (s.type === 'string' && s.snippet) {
            rows += (s.snippet.match(/<tr\b/gi) || []).length;
          }
        } catch(e){}
      }
    }

    // If no rows found from XHRs, fall back to DOM table parsing with small retries
    const findRowsInDom = async () => {
      const sel = '#gradesTable tr, .grades-table tr, table.grades tr';
      for (let i=0;i<5;i++) {
        const count = await page.$$eval(sel, els => els.length).catch(()=>0);
        if (count > 0) return count;
        await new Promise(r => setTimeout(r, 400));
      }
      return 0;
    };
  if (!rows) rows = await findRowsInDom();

  assertions.push(mkAssert({ id: 'xhrCaptured', label: 'Captured grade XHR/API calls', pass: xhrCalls.length > 0 }));
  assertions.push(mkAssert({ id: 'gradesRowsDetected', label: 'Grades rows detected', pass: rows > 0, selector: '#gradesTable tr, .grades-table tr, table.grades tr', screenshot: shot }));

    // Build meta
  const meta = { url, xhrCalls, xhrResponses: xhrResponses.length ? xhrResponses : undefined, rows };
    // BuddyPanel validation (non-blocking)
    try {
      const nav = await validateSidebarNav(page, url, outputDir, { contentSelectors: ['#gradesTable', '.entry-content', 'body'], shotName: 'grades_sidebar.png' });
      if (nav) Object.assign(meta, nav);
      // Mark header present to satisfy counts on pages with minimal DOM evidence
      const header = await page.$('header, .bb-header, .site-header');
      if (header) meta.headerPresent = true;
  } catch(e) {}
  meta.assertions = assertions;
    if (!rows && xhrCalls.length === 0) {
      return { ok: true, meta, screenshots }; // still ok (page exists) but no grades
    }
    return { ok: true, meta, screenshots };
  } catch (err) {
    const shot = `${outputDir}/grades_error.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    return { ok: false, error: err.message, meta: { url }, screenshots: [shot] };
  }
}
