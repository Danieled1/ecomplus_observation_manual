module.exports = async function coursePageFlow(page, outputDir, creds, slug) {
  const url = `${creds.url}/course/${slug}/`;
  const screenshots = [];
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const p = path => `${outputDir}/course_${slug}.png`;
    await page.screenshot({ path: p() }).catch(()=>{});
    screenshots.push(p());

    // Assertions: course container and lesson list
    const hasCourseContainer = await page.$('.course-content-container, .bb-course-item-wrap, .ld-lesson-list');
    if (!hasCourseContainer) {
      return { ok: false, error: 'course container missing', meta: { url }, screenshots };
    }

    // Count lesson items if present
    const lessonCount = await page.$$eval('.ld-lesson-list li, .ld-item, .lesson-item', els => els.length).catch(()=>0);
    return { ok: true, meta: { url, lessonCount }, screenshots };
  } catch (err) {
    const p = `${outputDir}/course_${slug}_error.png`;
    await page.screenshot({ path: p }).catch(()=>{});
    return { ok: false, error: err.message, meta: { url }, screenshots: [p] };
  }
}
