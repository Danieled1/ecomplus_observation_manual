module.exports = async function gradesFlow(page, outputDir, creds) {
  const url = `${creds.url}/grades/`;
  const screenshots = [];
  const xhrCalls = [];
  page.on('requestfinished', async req => {
    try {
      const u = req.url();
      if (u.includes('admin-ajax.php') || u.includes('/wp-json/')) {
        xhrCalls.push(u);
      }
    } catch(e){}
  });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const shot = `${outputDir}/grades.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    screenshots.push(shot);

    const hasTable = await page.$('#gradesTable, .grades-table, table.grades');
    if (!hasTable && xhrCalls.length === 0) {
      return { ok: false, error: 'grades table missing and no XHR detected', meta: { url, xhrCalls }, screenshots };
    }
    // Count rows if table exists
    const rows = hasTable ? await page.$$eval('#gradesTable tr, .grades-table tr, table.grades tr', els => els.length).catch(()=>0) : 0;
    return { ok: true, meta: { url, xhrCalls, rows }, screenshots };
  } catch (err) {
    const shot = `${outputDir}/grades_error.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    return { ok: false, error: err.message, meta: { url }, screenshots: [shot] };
  }
}
