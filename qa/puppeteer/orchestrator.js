const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
// Require puppeteer-har robustly: package may export the constructor as default or module.exports
const _puppeteerHar = require('puppeteer-har');
const PuppeteerHar = _puppeteerHar.PuppeteerHar || _puppeteerHar.default || _puppeteerHar;

// Load environment variables from .env (parent `qa/.env` or local) if present.
// Try dotenv if installed, otherwise parse manually so users don't need extra deps.
(() => {
  try {
    const tryPaths = [
      path.join(__dirname, '..', '.env'), // qa/.env (one level up)
      path.join(__dirname, '.env') // qa/puppeteer/.env (local)
    ];
    for (const p of tryPaths) {
      if (fs.existsSync(p)) {
        try {
          // prefer dotenv if available
          require('dotenv').config({ path: p });
          console.log('[orchestrator] loaded env via dotenv from', p);
        } catch (e) {
          // dotenv not installed — do a minimal manual parse
          const raw = fs.readFileSync(p, 'utf8');
          raw.split(/\r?\n/).forEach(line => {
            const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*(.*)\s*$/);
            if (!m) return;
            let val = m[2] || '';
            // Normalize: trim, remove trailing semicolon, then strip surrounding quotes
            val = val.trim();
            // remove trailing semicolon if present
            if (val.endsWith(';')) val = val.slice(0, -1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            val = val.trim();
            // don't overwrite existing env vars
            if (process.env[m[1]] === undefined) process.env[m[1]] = val;
          });
          console.log('[orchestrator] loaded env by manual parse from', p);
        }
        break; // stop after first found
      }
    }
  } catch (err) {
    console.warn('[orchestrator] .env load failed', err && err.message);
  }
})();

const loginFlow = require('./flows/loginFlow');
const coursePageFlow = require('./flows/coursePageFlow');
const lessonPageFlow = require('./flows/lessonPageFlow');
const ticketFlow = require('./flows/ticketFlow');
const gradesFlow = require('./flows/gradesFlow');

async function runAll(creds) {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  // We'll create per-flow HAR files and per-flow console logs to improve evidence granularity.
  async function runFlow(name, fn, ...args) {
    const harPath = path.join(outputDir, `${name}.har`);
    const consolePath = path.join(outputDir, `${name}.console.log`);
    const logs = [];
    const onConsole = msg => {
      try { logs.push(`${new Date().toISOString()} [${msg.type()}] ${msg.text()}`); } catch(e) {}
    };
    page.on('console', onConsole);
    const har = new PuppeteerHar(page);
    let res = { ok: false };
    try {
      await har.start({ path: harPath });
      const result = await fn(page, outputDir, ...args);
      res = Object.assign({}, result || {}, { _har: harPath });
      await har.stop();
    } catch (err) {
      try { await har.stop(); } catch (e) {}
      res = { ok: false, error: err && err.message };
    } finally {
      page.removeListener('console', onConsole);
      try { fs.writeFileSync(consolePath, logs.join('\n')); } catch(e) {}
      res._console = consolePath;
    }
    return res;
  }

  try {
    const results = {};
    results.login = await runFlow('login', loginFlow, creds);
    // Use COURSE_SLUGS env var or default
    const slugs = (process.env.COURSE_SLUGS || 'course-small,course-medium,course-large').split(',').map(s=>s.trim());
    results.courses = [];
    for(const slug of slugs) {
      results.courses.push(await runFlow(`course-${slug}`, coursePageFlow, creds, slug));
    }
    results.lesson = await runFlow('lesson', lessonPageFlow, creds, (process.env.LESSON_SLUG || 'sample-lesson'));
    results.ticket = await runFlow('ticket', ticketFlow, creds);
    results.grades = await runFlow('grades', gradesFlow, creds);
    await browser.close();
    fs.writeFileSync(path.join(outputDir, 'results.json'), JSON.stringify(results, null, 2));
    console.log('Done. Outputs in', outputDir);
  } catch (err) {
    console.error('Orchestrator error', err);
    await har.stop();
    await browser.close();
  }
}

if (require.main === module) {
  const sanitize = v => {
    if (!v && v !== '') return undefined;
    let s = String(v).trim();
    if (s.endsWith(';')) s = s.slice(0, -1).trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
    return s.trim();
  };
  const creds = {
    url: sanitize(process.env.STAGING_URL),
    email: sanitize(process.env.STUDENT_EMAIL),
    password: sanitize(process.env.STUDENT_PASSWORD)
  };
  console.log(creds);
  
  if (!creds.url || !creds.email || !creds.password) {
    console.error('Set STAGING_URL, STUDENT_EMAIL, STUDENT_PASSWORD');
    process.exit(1);
  }
  runAll(creds);
}
