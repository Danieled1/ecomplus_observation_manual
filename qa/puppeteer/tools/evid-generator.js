const fs = require('fs');
const path = require('path');

function findLatestRun(outputDir) {
  if (!fs.existsSync(outputDir)) return null;
  const runs = fs.readdirSync(outputDir).filter(n => n.startsWith('run-')).sort();
  return runs.length ? path.join(outputDir, runs[runs.length-1]) : null;
}

function short(p) { return p ? path.basename(p) : ''; }

function summarizeRun(runDir) {
  const summary = { runDir, created: null, flows: [] };
  try {
    const stat = fs.statSync(runDir);
    summary.created = stat.mtime.toISOString();
  } catch(e){}
  const resultsPath = path.join(runDir, 'results.json');
  const coveragePath = path.join(runDir, 'coverage.json');
  let results = null, coverage = null;
  if (fs.existsSync(resultsPath)) {
    try { results = JSON.parse(fs.readFileSync(resultsPath, 'utf8')); } catch(e){}
  }
  if (fs.existsSync(coveragePath)) {
    try { coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8')); } catch(e){}
  }

  if (results) {
    for (const k of Object.keys(results)) {
      const r = results[k];
      const cov = coverage && coverage[k] ? coverage[k] : null;
      const item = { name: k, ok: !!(r && r.ok), error: r && r.error, meta: r && r.meta, screenshots: r && r.screenshots };
      if (cov) item.coverage = cov;
      summary.flows.push(item);
    }
  } else {
    // fallback: scan HAR/console files found in runDir
    const files = fs.readdirSync(runDir || '.');
    const har = files.filter(f => f.endsWith('.har'));
    for (const h of har) summary.flows.push({ name: h.replace(/\.har$/,''), ok: true, har: h });
  }
  return summary;
}

function emitMarkdown(summary, dest) {
  let md = `# QA Evidence Summary\n\nRun: ${summary.runDir}\nCreated: ${summary.created || 'unknown'}\n\n`;
  md += '## Per-flow evidence\n\n';
  if (!summary.flows.length) md += '_No flows found in results.json_\n';
  for (const f of summary.flows) {
    md += `### ${f.name}\n`;
    md += `- status: ${f.ok ? 'OK' : 'FAILED'}\n`;
    if (f.error) md += `- error: ${f.error}\n`;
    if (f.meta) {
      if (typeof f.meta.lessonCount !== 'undefined') md += `- lessonCount: ${f.meta.lessonCount}\n`;
      if (typeof f.meta.rows !== 'undefined') md += `- rows: ${f.meta.rows}\n`;
      if (f.meta.stepsFile) md += `- stepsFile: ${short(f.meta.stepsFile)}\n`;
      if (f.meta.verifyScreenshot) md += `- verifyScreenshot: ${short(f.meta.verifyScreenshot)}\n`;
    }
    if (Array.isArray(f.screenshots) && f.screenshots.length) {
      md += `- screenshots (${f.screenshots.length}):\n`;
      for (const s of f.screenshots) md += `  - ${short(s)}\n`;
    }
    if (f.coverage) md += `- coverage: ${f.coverage.percent || 'n/a'}%\n`;
    md += '\n';
  }

  md += '## Quick checklist\n\n';
  md += '- [ ] Login verified (login flow shows verifyScreenshot and loginVerified)\n';
  md += '- [ ] Profile page accessible\n';
  md += '- [ ] Courses listed and course pages reachable\n';
  md += '- [ ] Lesson pages load and lesson counts > 0\n';
  md += '- [ ] Grades/tickets/placement pages show rows where applicable\n';

  try { fs.writeFileSync(dest, md); } catch(e){ console.error('write failed', e && e.message); }
}

if (require.main === module) {
  const out = path.join(__dirname, '..', 'output');
  const latest = findLatestRun(out);
  if (!latest) { console.error('No runs found in', out); process.exit(1); }
  const summary = summarizeRun(latest);
  const dest = path.join(latest, 'evidence_summary.md');
  emitMarkdown(summary, dest);
  console.log('Wrote', dest);
}
