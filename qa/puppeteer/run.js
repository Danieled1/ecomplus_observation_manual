// Minimal Puppeteer flow runner for Ecom+ QA
// Usage: set env vars STAGING_URL, STUDENT_EMAIL, STUDENT_PASSWORD and run `node run.js`

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PuppeteerHar } = require('puppeteer-har');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function run() {
  const url = process.env.STAGING_URL;
  const email = process.env.STUDENT_EMAIL;
  const password = process.env.STUDENT_PASSWORD;
  if (!url || !email || !password) {
    console.error('Set STAGING_URL, STUDENT_EMAIL and STUDENT_PASSWORD env vars');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const har = new PuppeteerHar(page);
  await har.start({ path: path.join(OUTPUT_DIR, 'run.har') });

  try {
    // Login
    await page.goto(url + '/custom-login/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'login_page.png') });
    await page.type('input[name="log"]', email, { delay: 30 }).catch(()=>{});
    await page.type('input[name="pwd"]', password, { delay: 30 }).catch(()=>{});
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'after_login.png') });

    // Open dashboard
    await page.goto(url + '/student-dashboard/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'dashboard.png') });

    // Open a course (attempt some known slugs)
    const courseSlugs = (process.env.COURSE_SLUGS || 'course-small,course-medium,course-large').split(',');
    for (let i = 0; i < Math.min(courseSlugs.length, 3); i++) {
      const slug = courseSlugs[i].trim();
      const courseUrl = `${url}/course/${slug}/`;
      await page.goto(courseUrl, { waitUntil: 'networkidle2' });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `course_${slug}.png`) });
      await page.waitForTimeout(1000);
    }

    // Visit lessons list and open first lesson
    await page.goto(url + '/lesson/sample-lesson/', { waitUntil: 'networkidle2' }).catch(()=>{});
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'lesson.png') });

    // Tickets page - open and attempt to fill minimal form
    await page.goto(url + '/tickets/', { waitUntil: 'networkidle2' }).catch(()=>{});
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tickets_page.png') });
    // try filling known fields if present
    await page.type('input[name="ticket_title"]', 'QA test ticket ' + Date.now()).catch(()=>{});
    await page.type('textarea[name="ticket_content"]', 'Automated QA ticket test.').catch(()=>{});
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tickets_filled.png') });

    // Grades page - capture
    await page.goto(url + '/grades/', { waitUntil: 'networkidle2' }).catch(()=>{});
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'grades.png') });

  } catch (err) {
    console.error('Error during run', err);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'error.png') }).catch(()=>{});
  } finally {
    await har.stop();
    await browser.close();
  }
}

run();
