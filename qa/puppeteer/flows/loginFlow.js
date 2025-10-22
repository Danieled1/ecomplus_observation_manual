const delay = ms => new Promise(r => setTimeout(r, ms));

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
    await page.screenshot({ path: `${outputDir}/login_page.png` }).catch(()=>{});

    await typeWithClear(page, '#user_login', username);
    await typeWithClear(page, '#user_pass', password);

    const submitStart = performance.now();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click('#wp-submit'),
    ]);
    const submitEnd = performance.now();

    await delay(1000);
    const cookies = await page.cookies();
    const totalTime = Math.round(performance.now() - start);

    await page.screenshot({ path: `${outputDir}/after_login.png` }).catch(()=>{});
    return { ok: true, meta: { url: loginUrl, submitMs: Math.round(submitEnd - submitStart), totalMs: totalTime, cookies } };
  } catch (err) {
    await page.screenshot({ path: `${outputDir}/login_error.png` }).catch(()=>{});
    return { ok: false, error: err.message, meta: { url: loginUrl } };
  }
}
