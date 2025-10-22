module.exports = async function lessonPageFlow(page, outputDir, creds, slug) {
  const url = `${creds.url}/lesson/${slug}/`;
  const screenshots = [];
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const shot = `${outputDir}/lesson_${slug}.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    screenshots.push(shot);

    // Ensure lesson content or player exists
    const hasPlayer = await page.$('iframe, video, .learndash_player, .ld-video, .lesson-content');
    if (!hasPlayer) {
      return { ok: false, error: 'lesson player/content missing', meta: { url }, screenshots };
    }

    return { ok: true, meta: { url }, screenshots };
  } catch (err) {
    const shot = `${outputDir}/lesson_${slug}_error.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    return { ok: false, error: err.message, meta: { url }, screenshots: [shot] };
  }
}
