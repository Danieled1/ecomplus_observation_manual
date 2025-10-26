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

module.exports = async function logoutFlow(page, outputDir, creds = {}) {
  const base = (creds.url || process.env.STAGING_URL || '').replace(/\/+$/, '');
  const verifyUrl = base || 'https://app.digitalschool.co.il';
  const assertions = [];
  let ok = false;
  let beforePng, afterPng;
  const trace = [];
  const onFrameNav = frame => {
    try {
      const u = frame.url();
      if (!u) return;
      const p = new URL(u).pathname || '';
      if (/\/wp-login\.php/i.test(p)) {
        trace.push({ ts: new Date().toISOString(), type: 'nav.loginPageDetected', url: u });
      }
    } catch (_) {}
  };
  try {
    try { page.on('framenavigated', onFrameNav); } catch(_){}
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115');
    const membersUrl = `${base}/members/`;
    await page.goto(membersUrl, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});
    beforePng = `${outputDir}/logout_before.png`;
    try { await page.screenshot({ path: beforePng }); } catch(e){}
    // Explicit WP logout: go to /wp-login.php?action=logout and click the confirmation link
    try {
      await page.goto(`${base}/wp-login.php?action=logout`, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});
      // typical confirm link has action=logout&_wpnonce=<token>
      const confirmSel = 'a[href*="action=logout"]';
      const confirm = await page.$(confirmSel);
      if (confirm) {
        // Prefer navigating directly to the href to avoid blocked clicks
        try {
          const href = await page.$eval(confirmSel, el => el.href);
          if (href) {
            await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});
          } else {
            await Promise.race([
              page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{}),
              confirm.click().catch(()=>{})
            ]);
          }
        } catch(_) {
          await Promise.race([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{}),
            confirm.click().catch(()=>{})
          ]);
        }
      }
      // Give WP a moment to process logout and set cookies, then hit a neutral URL
      await delay(500);
      await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(()=>{});
    } catch(e){}

    // Verify logged out by:
    // 1) current or subsequent nav hits wp-login (trace will record if so)
    // 2) no wordpress_logged_in cookie remains
    // 3) login form indicators present when visiting a members URL
    let cookiesOk = false;
    try {
      const cookies = await page.cookies();
      cookiesOk = !(Array.isArray(cookies) && cookies.some(c => /wordpress_logged_in/i.test(c.name)));
      trace.push({ ts: new Date().toISOString(), type: 'logout.cookiesChecked', cleared: cookiesOk });
      // If still present, try one more navigation to the members page then re-check (some browsers clear on next nav)
      if (!cookiesOk) {
        try {
          await page.goto(membersUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(()=>{});
          const cookies2 = await page.cookies();
          const cleared2 = !(Array.isArray(cookies2) && cookies2.some(c => /wordpress_logged_in/i.test(c.name)));
          cookiesOk = cleared2;
          trace.push({ ts: new Date().toISOString(), type: 'logout.cookiesRechecked', cleared: cleared2 });
        } catch(_){}
      }
    } catch(_){}
    let loginIndicators = false;
    let loggedIn = false;
    try {
      await page.goto(membersUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(()=>{});
      const loggedInSelectors = ['.bb-user-nav', '.bb-user-avatar', 'a[href*="logout"]', '.profile-menu', '.wp-admin-bar-my-account', '.logout'];
      for (const sel of loggedInSelectors) { try { if (await page.$(sel)) { loggedIn = true; break; } } catch(e){} }
      try { if (await page.$('#loginform, form[action*="wp-login"], input[name="log"], input[name="pwd"]')) loginIndicators = true; } catch(e){}
    } catch(e){}
    ok = cookiesOk && !loggedIn && loginIndicators;
    afterPng = `${outputDir}/logout_after.png`;
    try { await page.screenshot({ path: afterPng }); } catch(e){}
  } catch (err) {
    // keep ok=false
  }
  assertions.push(mkAssert({ id: 'logoutClearsSession', label: 'Logout clears session', pass: !!ok, screenshot: afterPng, text: ok ? 'wordpress_logged_in cleared' : 'cookie present or UI still logged-in' }));
  return { ok: !!ok, meta: { url: verifyUrl, assertions, trace }, screenshots: [beforePng, afterPng].filter(Boolean) };
}
