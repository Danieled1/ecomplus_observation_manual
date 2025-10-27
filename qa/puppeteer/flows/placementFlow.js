let addMetric = () => {};
const fs = require('fs');
const path = require('path');
try {
  ({ addMetric } = require("../../puppeteer-app/logger/metricsExporter"));
} catch (e) {
  // optional metrics exporter not present; use no-op
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

module.exports = async function placementFlow(page, context = {}) {
  const flowStart = performance.now();
  const timings = {};
  const outDir = typeof context === 'string' ? context : (context.outputDir || '.');

  try {
    const xhrs = [];
    page.on('requestfinished', async request => {
      const url = request.url();
      if (url.includes('admin-ajax.php') || url.includes('/wp-json/')) {
        try {
          const response = await request.response();
          const timing = await response.timing();
          const duration = timing?.receiveHeadersEnd - timing?.startTime;
          if (duration > 500) {
            console.warn(`🐢 Slow XHR [${request.method()}] ${url} → ${Math.round(duration)}ms`);
          }
          xhrs.push({ url, duration });
        } catch (err) {
          console.warn(`⚠️ Could not get timing for ${url}:`, err.message);
        }
      }
    });

    const navStart = performance.now();
  const url = 'https://app.digitalschool.co.il/placement/';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
    timings.domLoad = performance.now() - navStart;
    console.log(`🚀 DOM loaded in ${Math.round(timings.domLoad)}ms`); // 🚀 UX: DOM + readiness

  await assertVisible(page, '.header-placement-title', 'Header title');
  const assertions = [];
    const formCheckStart = performance.now();
  await page.waitForSelector('#acf-form', { timeout: 4000 });
  assertions.push(mkAssert({ id: 'formPresent', label: 'Placement form present', pass: true, selector: '#acf-form' }));
    timings.resumeFormLoad = performance.now() - formCheckStart;
    console.log(`📄 Resume form visible in ${Math.round(timings.resumeFormLoad)}ms`);

  await assertVisible(page, '#resume-label', 'Job status label'); // 🧠 UX: Resume label existence
  await assertVisible(page, '.placement-notes', 'Placement notes section');

    const courseListStart = performance.now();
    await page.waitForSelector('#courses-placement .bb-course-item-wrap', { timeout: 4000 });
    timings.courseListRender = performance.now() - courseListStart;

    const courseItems = await page.$$('#courses-placement .bb-course-item-wrap');
    if (courseItems.length > 0) {
      console.log(`🎯 Found ${courseItems.length} related course(s) in ${Math.round(timings.courseListRender)}ms`);
      assertions.push(mkAssert({ id: 'relatedCoursesPresent', label: 'Related courses listed', pass: true, selector: '#courses-placement .bb-course-item-wrap' }));
    } else {
      console.warn('📉 UX: No related job-prep courses found'); // 🧠 UX: Zero course edge case
      assertions.push(mkAssert({ id: 'relatedCoursesPresent', label: 'Related courses listed', pass: false, selector: '#courses-placement .bb-course-item-wrap' }));
    }

        // Resume upload (targeted): locate the real file input (ACF often hides it), try enabling basic uploader,
        // force visible, upload a dummy file, dispatch change, await UI ack
    let uploadSel = null;
    let uploadAttempted = false;
    let uploadAcknowledged = false;
    let uploadInfo = '';
    try {
          // If ACF hides the native input behind WP Media, try switching to the basic uploader first
          try {
            const basicToggles = [
              'a[data-name="basic-uploader"]',
              '.acf-basic-uploader',
              'a[href*="basic-uploader"]',
              '.acf-file-uploader .acf-actions a'
            ];
            for (const t of basicToggles) {
              const link = await page.$(t);
              if (link) { await link.click().catch(()=>{}); await page.waitForTimeout(400); break; }
            }
          } catch(_) {}
          // First, pick any input[type=file] even if hidden
          let fileHandle = null;
          const fileSelCandidates = [
            'input[type="file"][name^="acf"]',
            'input[type="file"][name*="resume"]',
            'input[type="file"][id*="resume"]',
            'input[type="file"]'
          ];
          for (const sel of fileSelCandidates) {
            const el = await page.$(sel);
            if (el) { uploadSel = sel; fileHandle = el; break; }
          }
          if (!fileHandle) {
            const all = await page.$$('input[type="file"]');
            if (all && all.length) { fileHandle = all[0]; uploadSel = 'input[type="file"]'; }
          }
          // If still not found, at least note the presence of an ACF file uploader wrapper
          if (!fileHandle) {
            const wrapper = await page.$('.acf-file-uploader, .acf-field-file, [data-type="file"]');
            if (wrapper) uploadSel = '.acf-file-uploader';
          }
          if (fileHandle) {
        // create a tiny dummy file in output directory
        const outDir = typeof context === 'string' ? context : (context.outputDir || '.');
        const dummyPath = path.join(outDir, 'dummy-resume.txt');
        try { fs.writeFileSync(dummyPath, 'QA dummy resume file'); } catch(_) {}
            if (fs.existsSync(dummyPath)) {
          // Ensure input is actionable (ACF often hides the real input)
                try { await page.$eval(uploadSel, el => { el.style.display = 'block'; el.style.visibility = 'visible'; el.style.position = 'static'; el.style.opacity = '1'; el.removeAttribute('disabled'); el.removeAttribute('aria-hidden'); }); } catch(_) {}
                await fileHandle.uploadFile(dummyPath).catch(()=>{});
                // Dispatch a change event so ACF hooks fire
                try { await page.$eval(uploadSel, el => { el.dispatchEvent(new Event('change', { bubbles: true })); }); } catch(_) {}
          uploadAttempted = true;
          // Heuristic: look for filename echo or "uploaded" label
                const ackSelectors = ['.file-name', '.uploaded', '.acf-file-uploader .filename', '.acf-file-uploader .file-info', '[data-file-name]', '.acf-file-uploader a[href*="uploads"]'];
                // wait briefly for DOM to update
                await page.waitForTimeout(800);
          for (const s of ackSelectors) {
            const found = await page.$(s);
            if (found) {
              uploadAcknowledged = true;
              uploadInfo = await page.$eval(s, el => (el.innerText || el.getAttribute('data-file-name') || '').trim()).catch(()=> '');
              break;
            }
          }
        }
      }
    } catch(_) {}
    const shotUpload = (typeof context === 'string' ? context : (context.outputDir || '.')) + '/placement_upload.png';
    await page.screenshot({ path: shotUpload }).catch(()=>{});
    assertions.push(mkAssert({ id: 'resumeInputPresent', label: 'Resume file input present', pass: !!uploadSel, selector: uploadSel, screenshot: shotUpload }));
    assertions.push(mkAssert({ id: 'resumeUploadAttempt', label: 'Resume file upload attempted', pass: uploadAttempted, selector: uploadSel, screenshot: shotUpload }));
    assertions.push(mkAssert({ id: 'resumeUploadAcknowledged', label: 'Resume upload acknowledged by UI', pass: uploadAcknowledged, selector: uploadSel, screenshot: shotUpload, text: uploadInfo }));

    // If upload was attempted, try submitting the ACF form to persist (success or validation notice counts as process ack)
    let formSubmitted = false;
    let submitAck = '';
    try {
      const submitSel = '#acf-form button[type="submit"], #acf-form input[type="submit"]';
      const btn = await page.$(submitSel);
      if (btn) {
        await btn.click().catch(()=>{});
        // Wait for any ACF notice or general success/validation feedback
        const ackSel = '.acf-notice, .acf-notice.-success, .bb-notice, .bb-feedback, .message-success, .updated';
        await page.waitForTimeout(800);
        const ack = await page.$(ackSel);
        if (ack) {
          formSubmitted = true;
          submitAck = await page.$eval(ackSel, el => (el.innerText||'').trim()).catch(()=> '');
        }
      }
    } catch(_) {}
    // Functional: filename persists after reload
    let filenamePersists = false;
    try {
      if ((uploadAcknowledged && uploadInfo) || formSubmitted) {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{});
            const ackSelectors = ['.file-name', '.uploaded', '.acf-file-uploader .filename', '.acf-file-uploader .file-info', '[data-file-name]', '.acf-file-uploader a[href*="uploads"]'];
            await page.waitForTimeout(700);
        for (const s of ackSelectors) {
              const txt = await page.$eval(s, el => (el.innerText || el.getAttribute('data-file-name') || el.getAttribute('href') || '').trim()).catch(()=> '');
              if (txt && uploadInfo && (txt === uploadInfo || txt.includes(path.basename(uploadInfo)) || path.basename(txt) === path.basename(uploadInfo))) { filenamePersists = true; break; }
        }
      }
    } catch(e) {}
    assertions.push(mkAssert({ id: 'resumeFilenamePersists', label: 'Resume filename persists after reload', pass: filenamePersists }));
    
    const totalTime = Math.round(performance.now() - flowStart);
    console.log(`📊 placementFlow completed in ${totalTime}ms`);
    if (totalTime > 7000) {
      console.warn(`⚠️ SLOW PAGE: placement page took ${totalTime}ms to fully render`);
    }
    // Minimal meta for coverage and sidebar validation
    const meta = { url };
    try {
      const header = await page.$('header, .bb-header, .site-header');
      if (header) meta.headerPresent = true;
      const nav = await validateSidebarNav(page, url, outDir, { contentSelectors: ['#acf-form', '.entry-content'], shotName: 'placement_sidebar.png' });
      if (nav) Object.assign(meta, nav);
    } catch(e) {}

    // Attach assertions to meta
    meta.assertions = assertions;

    if (context.shouldExport) {
      addMetric({
        flow: 'placementFlow',
        totalMs: totalTime,
        domMs: Math.round(timings.domLoad),
        resumeFormMs: Math.round(timings.resumeFormLoad),
        courseListMs: Math.round(timings.courseListRender),
        courseCount: courseItems.length,
        timestamp: new Date().toISOString(),
      });
    }
    
    return { ok: true, meta };
  } catch (err) {
    console.warn('⚠️ placementFlow failed:', err.message);
    return { ok: false, error: err.message, meta: { url: 'https://app.digitalschool.co.il/placement/', assertions: [] } };
  }
};
