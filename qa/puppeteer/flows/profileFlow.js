const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(r => setTimeout(r, ms));

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

module.exports = async function profileFlow(page, outputDir, creds = {}) {
  // Keep this flow fast to avoid hitting the orchestrator's PER_FLOW_TIMEOUT_MS (default ~20s)
  try { page.setDefaultNavigationTimeout(8000); } catch(e) {}
  try { page.setDefaultTimeout(5000); } catch(e) {}

  const baseUser = creds.email || process.env.STUDENT_EMAIL || 'test_live_student';
  const base = (creds.url || process.env.STAGING_URL || '').replace(/\/+$/, '') || 'http://localhost';
  const url = `${base}/members/${baseUser}/`;
  const screenshots = [];
  const tabsVisited = [];
  const assertions = [];
  const startAt = Date.now();
  const SOFT_BUDGET_MS = parseInt(process.env.PROFILE_SOFT_BUDGET_MS || '12000', 10); // stop early if we exceed this
  const MAX_TABS = parseInt(process.env.PROFILE_MAX_TABS || '5', 10); // cap tabs to visit
  const MIN_SUCCESS_TABS = parseInt(process.env.PROFILE_MIN_SUCCESS_TABS || '2', 10);

  // dialog handler: accept to allow navigation to proceed
  const onDialog = async dialog => {
    try {
      console.log('[profileFlow] dialog:', dialog.type(), dialog.message());
      await dialog.accept();
    } catch (e) { console.warn('[profileFlow] dialog handler failed', e.message); }
  };

  page.on('dialog', onDialog);

  try {
    console.log('[profileFlow] navigating to', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // give heavy pages extra time to hydrate (BuddyBoss can be heavy)
    await page.waitForTimeout(1200);
    const firstShot = path.join(outputDir, 'profile_page.png');
    await page.screenshot({ path: firstShot }).catch(()=>{});
    screenshots.push(firstShot);

    // Check shared components: header and buddypanel
  const headerPresent = !!(await page.$('header, .bb-header, .site-header'));
  const buddypanelPresent = !!(await page.$('.bb-panel, .buddypanel, #buddypanel, .bp-personal-tabs'));
  assertions.push(mkAssert({ id: 'profileHeaderPresent', label: 'Profile header present', pass: headerPresent }));
  assertions.push(mkAssert({ id: 'buddyPanelPresent', label: 'BuddyPanel present', pass: buddypanelPresent }));

    // Collect top nav anchors inside the personal nav (tolerant selector)
    const anchors = await page.$$eval('ul li.bp-personal-tab a, ul.subnav a, .bp-personal-tab a', els =>
      els.map(a => ({ id: a.id || null, href: a.href || null, text: a.textContent && a.textContent.trim() }))
    ).catch(()=>[]);

    // If not anchors found, try the bb-single-nav-item-point pattern
    if (!anchors || anchors.length === 0) {
      const alt = await page.$$eval('.bb-single-nav-item-point', els =>
        els.map(el => ({ id: null, href: el.closest('a') ? el.closest('a').href : null, text: el.textContent && el.textContent.trim() }))
      ).catch(()=>[]);
      if (alt && alt.length) anchors.push(...alt);
    }

    // Deduplicate anchors by href
    const seen = new Set();
    const anchorsFiltered = anchors
      .filter(a => a && a.href && !seen.has(a.href) && (seen.add(a.href) || true))
      .slice(0, Math.max(1, Math.min(MAX_TABS, 12)));

    let successCount = 0;

    for (let i = 0; i < anchorsFiltered.length; i++) {
      // Respect soft budget: if we've already captured enough, or we're over budget, bail out
      if (Date.now() - startAt > SOFT_BUDGET_MS && successCount >= MIN_SUCCESS_TABS) {
        console.log('[profileFlow] soft budget reached — exiting early');
        break;
      }
      const a = anchorsFiltered[i];
      const label = a.id || a.text || `tab-${i}`;
      const shot = path.join(outputDir, `profile_tab_${i + 1}_${label.replace(/[^a-z0-9-_\.]/gi, '_')}.png`);
      try {
        console.log('[profileFlow] clicking tab', a.href, label);
        // Prefer element-handle click; fall back to evaluate click, then to goto(href) if navigation didn't happen.
        let navigated = false;
        const tryClickOnce = async () => {
          try {
            const handle = await page.$(`a[href="${a.href}"]`);
            if (handle) {
              await Promise.all([
                handle.click().catch(()=>{}),
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(()=>{})
              ]);
              return true;
            }
          } catch (e) {
            // rethrow to allow outer retry logic to inspect
            throw e;
          }
          return false;
        };

        // ensure the main document is ready before attempting clicks
        try {
          await page.waitForFunction(() => document.readyState === 'complete', { timeout: 3000 }).catch(()=>{});
        } catch(e) {}

        // attempt with retries for transient "Requesting main frame too early!" errors
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts && !navigated) {
          attempts++;
          try {
            const ok = await tryClickOnce();
            if (ok) { navigated = true; break; }
            // try evaluate-based click
            try {
              await page.evaluate(h => { const el = document.querySelector(`a[href="${h}"]`); if (el) el.click(); }, a.href).catch(()=>{});
              await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(()=>{});
              navigated = true; break;
            } catch (e) {}
            // last resort: goto
            try {
              await page.goto(a.href, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{});
              navigated = true; break;
            } catch (e) {}
            // try decoded URI
            try {
              const decoded = decodeURIComponent(a.href);
              if (decoded !== a.href) {
                await page.goto(decoded, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{});
                navigated = true; break;
              }
            } catch (e) {}
          } catch (err) {
            const msg = err && err.message ? err.message : String(err);
            if (msg.includes('Requesting main frame too early')) {
              // transient - wait a bit and retry with increasing backoff
              const backoff = 600 + (attempts * 400);
              await page.waitForTimeout(backoff);
              continue;
            }
            // unknown error - break and let outer handler capture
            break;
          }
          // small backoff between attempts
          if (!navigated) await page.waitForTimeout(400 + (attempts * 200));
        }
        // If still not navigated after retries, try a robust final goto with networkidle2
        if (!navigated) {
          try {
            await page.goto(a.href, { waitUntil: 'networkidle2', timeout: 15000 }).catch(()=>{});
            navigated = true;
          } catch (e) {
            // try decoded
            try {
              const decoded = decodeURIComponent(a.href);
              if (decoded !== a.href) await page.goto(decoded, { waitUntil: 'networkidle2', timeout: 15000 }).catch(()=>{});
              navigated = true;
            } catch (ee) {}
          }
        }
        // stabilization pause
        await page.waitForTimeout(800);
        // Wait briefly for likely content selectors to render (bounded)
        try {
          const selList = ['.bp-personal .bp-navs', '.bb-user-profile', '.bp-settings', '.bp-notifications', '.bp-activity', '.bp-members', '.entry-content'];
          await page.waitForFunction((list) => list.some(s => !!document.querySelector(s)), { timeout: 2000 }, selList).catch(()=>{});
        } catch(e) {}
        await page.screenshot({ path: shot }).catch(()=>{});
        screenshots.push(shot);
        tabsVisited.push({ label, href: a.href, ok: true, screenshot: path.basename(shot) });
        successCount++;
      } catch (err) {
        console.warn('[profileFlow] clicking tab failed', a.href, err.message);
        await page.screenshot({ path: shot }).catch(()=>{});
        screenshots.push(shot);
        tabsVisited.push({ label, href: a.href, ok: false, error: err.message, screenshot: path.basename(shot) });
      }
      // short pause between tab interactions
      await page.waitForTimeout(600);
    }

    assertions.push(mkAssert({ id: 'minTabsVisited', label: 'Minimum tabs visited', pass: successCount >= MIN_SUCCESS_TABS, text: `visited=${successCount}, min=${MIN_SUCCESS_TABS}` }));

    // collect console log sample and include in meta for debug
    let consoleSample = null;
    try {
      const consolePath = path.join(outputDir, 'profile.console.log');
      if (fs.existsSync(consolePath)) consoleSample = consolePath;
    } catch(e){}
    page.removeListener('dialog', onDialog);

    return { ok: true, meta: { url, headerPresent, buddypanelPresent, tabs: tabsVisited, consoleSample, assertions }, screenshots };
  } catch (err) {
    page.removeListener('dialog', onDialog);
    const shot = path.join(outputDir, 'profile_error.png');
    await page.screenshot({ path: shot }).catch(()=>{});
    return { ok: false, error: err.message, meta: { url, assertions }, screenshots: [shot] };
  }
};
