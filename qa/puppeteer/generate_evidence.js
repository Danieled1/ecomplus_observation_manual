const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'output');
const evidenceDir = path.join(__dirname, '..', 'evidence');
if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

const resultsPath = path.join(outDir, 'results.json');
if (!fs.existsSync(resultsPath)) {
  console.error('No results.json found in output/ — run orchestrator first.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
let id = 1;
function nextId() { return String(id++).padStart(3, '0'); }

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

// helper to write a simple EVID markdown
function writeEvid(evidId, title, url, screenshots, notes) {
  const md = [];
  md.push(`# Evidence ${evidId}`);
  md.push('');
  md.push(`- Evidence ID: ${evidId}`);
  md.push(`- Page / URL: ${url || ''}`);
  md.push(`- Timestamp (UTC): ${new Date().toISOString()}`);
  md.push(`- Steps to reproduce:`);
  md.push(`  1. Run orchestrator.js`);
  md.push(`  2. Inspect screenshots in the evidence folder`);
  md.push(`- Expected result: [describe]`);
  md.push(`- Actual result: [describe]`);
  md.push('');
  if (screenshots.length) {
    md.push('Screenshots:');
    screenshots.forEach(s => md.push(`- ${s}`));
    md.push('');
  }
  if (notes) md.push('Notes:\n' + notes);

  fs.writeFileSync(path.join(evidenceDir, `${evidId}.md`), md.join('\n'));

  fs.writeFileSync(path.join(evidenceDir, `${evidId}.md`), md.join('\n'));
}

// Map flows to expected output files
const mapping = [
  { key: 'login', files: ['login_page.png','after_login.png','login_error.png'] },
  { key: 'courses', files: ['course_course-small.png','course_course-medium.png','course_course-large.png'] },
  { key: 'lesson', files: ['lesson_sample-lesson.png'] },
  { key: 'ticket', files: ['tickets_page.png','tickets_filled.png','tickets_after_submit.png'] },
  { key: 'grades', files: ['grades.png'] }
];

// Process single flows
for (const map of mapping) {
  const res = results[map.key];
  // For courses array, make one evidence per course
  if (map.key === 'courses' && Array.isArray(res)) {
    for (let i = 0; i < res.length; i++) {
      const r = res[i];
      const evidId = `EVID-${nextId()}`;
      const files = [map.files[i]]; // match by index
      const screenshots = [];
      files.forEach(f => {
        const src = path.join(outDir, f);
        const dest = path.join(evidenceDir, `${evidId}_${f}`);
        if (copyIfExists(src, dest)) screenshots.push(`${evidId}_${f}`);
      });
      writeEvid(evidId, `Courses - ${i}`, '', screenshots, `Result: ${JSON.stringify(r)}`);
      console.log('Wrote', evidId);
    }
    continue;
  }

  const evidId = `EVID-${nextId()}`;
    const screenshots = [];
    for (const f of map.files) {
      const src = path.join(outDir, f);
      const dest = path.join(evidenceDir, `${evidId}_${f}`);
      if (copyIfExists(src, dest)) screenshots.push(`${evidId}_${f}`);
    }
    // copy per-flow har & console if available (orchestrator adds _har and _console)
    let harFile = '';
    let consoleFile = '';
    if (res && res._har && fs.existsSync(res._har)) {
      const destHar = path.join(evidenceDir, `${evidId}.har`);
      fs.copyFileSync(res._har, destHar);
      harFile = path.basename(destHar);
    }
    if (res && res._console && fs.existsSync(res._console)) {
      const destConsole = path.join(evidenceDir, `${evidId}.console.log`);
      fs.copyFileSync(res._console, destConsole);
      consoleFile = path.basename(destConsole);
    }
    const url = (res && res.meta && res.meta.url) ? res.meta.url : '';
    const notes = `Result: ${JSON.stringify(res, null, 2)}\nHar: ${harFile}\nConsole: ${consoleFile}`;
    writeEvid(evidId, map.key, url, screenshots, notes);
    console.log('Wrote', evidId);
}

// Copy run.har as well
const harSrc = path.join(outDir, 'run.har');
if (fs.existsSync(harSrc)) {
  fs.copyFileSync(harSrc, path.join(evidenceDir, 'run.har'));
  console.log('Copied run.har to evidence/');
}

console.log('Evidence generation complete. Files in', evidenceDir);
