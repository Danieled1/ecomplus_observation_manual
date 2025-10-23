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

module.exports = async function reviewsFlow(page, outputDir, creds = {}) {
  // Construct reviews URL from base; tolerate either encoded or decoded path
  const base = (creds.url || process.env.STAGING_URL || '').replace(/\/+$/, '') || 'https://app.digitalschool.co.il';
  const candidates = [
    `${base}/%d7%9e%d7%a9%d7%95%d7%912/`,
    `${base}/משוב2/`
  ];
  let url = candidates[0];
  try {
    // pick the first that loads quickly; fallback to first candidate
    for (const u of candidates) {
      try { await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 12000 }); url = u; break; } catch(e) {}
    }
  } catch (e) {}
  const meta = { url };
  const screenshots = [];
  try {
    const shot = `${outputDir}/reviews.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    screenshots.push(shot);

    // Detect common review form elements (do not submit in live)
  const formSel = 'form, .gform_wrapper, .wpcf7-form, .acf-form';
  const hasForm = !!(await page.$(formSel));
  meta.formPresent = !!hasForm;
  const assertions = [];
  assertions.push(mkAssert({ id: 'reviewFormPresent', label: 'Review form present', pass: hasForm, selector: formSel, screenshot: shot }));
    // Common text inputs/buttons
  try { meta.inputCount = await page.$$eval('input, textarea, select', els => els.length).catch(()=>0); } catch(e) {}
  assertions.push(mkAssert({ id: 'reviewInputsPresent', label: 'Review inputs present', pass: (meta.inputCount || 0) > 0 }));

    // Mark header for coverage 'counts'
    const header = await page.$('header, .bb-header, .site-header');
    if (header) meta.headerPresent = true;

    // BuddyPanel sidebar validation (non-blocking)
    try {
      const nav = await validateSidebarNav(page, url, outputDir, { contentSelectors: [formSel, '.entry-content', 'body'], shotName: 'reviews_sidebar.png' });
      if (nav) Object.assign(meta, nav);
    } catch(e) {}
    if (typeof meta.sidebarLinkFound !== 'undefined') {
      assertions.push(mkAssert({ id: 'sidebarLinkPresent', label: 'Sidebar link present for Reviews', pass: !!meta.sidebarLinkFound }));
    }
    meta.assertions = assertions;
    return { ok: true, meta, screenshots };
  } catch (err) {
    const shotErr = `${outputDir}/reviews_error.png`;
    await page.screenshot({ path: shotErr }).catch(()=>{});
    return { ok: false, error: err.message, meta, screenshots: [shotErr] };
  }
}
