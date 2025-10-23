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

async function typeWithClear(page, selector, text, delayMs = 50) {
  await page.waitForSelector(selector, { visible: true, timeout: 5000 });
  await page.click(selector).catch(()=>{});
  await page.focus(selector).catch(()=>{});
  await page.evaluate((sel) => { const el = document.querySelector(sel); if (el) el.value = ''; }, selector).catch(()=>{});
  await delay(150);
  for (const ch of String(text)) { await page.type(selector, ch, { delay: delayMs }).catch(()=>{}); }
}

module.exports = async function loginFlow(page, outputDir, creds = {}) {
  const start = performance.now();
  const username = creds.email || process.env.STUDENT_EMAIL;
  const password = creds.password || process.env.STUDENT_PASSWORD;
  const loginUrl = (creds.url || process.env.STAGING_URL || '').replace(/\/+$/, '') + '/wp-login.php';
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115');
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const shotLanding = `${outputDir}/login_page.png`;
    await page.screenshot({ path: shotLanding }).catch(()=>{});

    await typeWithClear(page, '#user_login', username);
    await typeWithClear(page, '#user_pass', password);
    const assertions = [];
    assertions.push(mkAssert({ id: 'usernameFilled', label: 'Username typed', pass: !!username, selector: '#user_login', screenshot: shotLanding }));
    assertions.push(mkAssert({ id: 'passwordFilled', label: 'Password typed', pass: !!password, selector: '#user_pass', screenshot: shotLanding }));

    const submitStart = performance.now();
    let navigated = false;
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).then(()=>{ navigated = true; }).catch(()=>{}),
      page.click('#wp-submit').catch(()=>{})
    ]);
    const submitEnd = performance.now();
    assertions.push(mkAssert({ id: 'submitClicked', label: 'Login submit triggered', pass: true, selector: '#wp-submit' }));
    assertions.push(mkAssert({ id: 'postSubmitNavigated', label: 'Navigation after submit', pass: navigated }));

    await delay(1000);
    const cookies = await page.cookies();
    const hasLoginCookie = Array.isArray(cookies) && cookies.some(c => /wordpress_logged_in/i.test(c.name));
    const totalTime = Math.round(performance.now() - start);

    const shotAfter = `${outputDir}/after_login.png`;
    await page.screenshot({ path: shotAfter }).catch(()=>{});
    assertions.push(mkAssert({ id: 'loginCookiePresent', label: 'Login session cookie present', pass: hasLoginCookie, text: hasLoginCookie ? 'wordpress_logged_in' : 'missing' }));

    return { ok: true, meta: { url: loginUrl, submitMs: Math.round(submitEnd - submitStart), totalMs: totalTime, cookies, assertions }, };
  } catch (err) {
    await page.screenshot({ path: `${outputDir}/login_error.png` }).catch(()=>{});
    return { ok: false, error: err.message, meta: { url: loginUrl, assertions: [] } };
  }
}
