let addMetric = () => {};
try {
  ({ addMetric } = require("../../puppeteer-app/logger/metricsExporter"));
} catch (e) {
  // optional metrics exporter not present in this workspace; use no-op
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

const assertVisible = async (page, selector, label) => {
  const found = await page.$(selector);
  if (found) {
    console.log(`✅ ${label} found`);
  } else {
    console.warn(`❌ ${label} NOT found`);
  }
};
  
module.exports = async function supportFlow(page, context= {}) {
  const flowStart = performance.now();
  const timings = {};
  const outDir = typeof context === 'string' ? context : (context.outputDir || '.');

  try {
    const navStart = performance.now();
    const url = 'https://app.digitalschool.co.il/technical-support-guide/';
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
    });
    timings.domLoad = performance.now() - navStart;
    console.log(`🛠️ DOM loaded in ${Math.round(timings.domLoad)}ms`); // 🛠️ UX: DOM load time

  await assertVisible(page, '.header-title', 'Support header title');
  await assertVisible(page, '.support-button', 'Support form button'); // 🧠 UX: Form trigger visibility
  const assertions = [];
  // Record presence assertions
  const hasHeaderTitle = !!(await page.$('.header-title'));
  const hasSupportBtn = !!(await page.$('.support-button'));
  assertions.push(mkAssert({ id: 'supportHeaderPresent', label: 'Support header title present', pass: hasHeaderTitle, selector: '.header-title' }));
  assertions.push(mkAssert({ id: 'supportButtonPresent', label: 'Support button present', pass: hasSupportBtn, selector: '.support-button' }));

    // 🧭 UX: Scroll responsiveness and external redirect testing can be done in Layer 4

    const totalTime = Math.round(performance.now() - flowStart);
    console.log(`✅ supportFlow completed in ${totalTime}ms`);
    if (totalTime > 5000) {
      console.warn(`⚠️ SLOW PAGE: support page took ${totalTime}ms to fully render`);
    }
    
    // Minimal meta for coverage and sidebar validation
    const meta = { url };
    try {
      const header = await page.$('header, .bb-header, .site-header');
      if (header) meta.headerPresent = true;
      const nav = await validateSidebarNav(page, url, outDir, { contentSelectors: ['.support-button', '.entry-content'], shotName: 'support_sidebar.png' });
      if (nav) Object.assign(meta, nav);
    } catch(e) {}
    if (typeof meta.sidebarNavOk !== 'undefined') {
      assertions.push(mkAssert({ id: 'sidebarNavOk', label: 'Sidebar link matches target', pass: !!meta.sidebarNavOk }));
    }
    meta.assertions = assertions;

    if (context.shouldExport) {
      addMetric({
        flow: 'supportFlow',
        totalMs: totalTime,
        domMs: Math.round(timings.domLoad),
        timestamp: new Date().toISOString(),
      });
    }
    
    await new Promise(r => setTimeout(r, 2000));
    return { ok: true, meta };
  } catch (err) {
    console.warn('⚠️ supportFlow failed:', err.message);
    return { ok: false, error: err.message, meta: { url: 'https://app.digitalschool.co.il/technical-support-guide/' } };
  }
};
