const fs = require('fs');
const path = require('path');

function findLatestRun(outputDir) {
  if (!fs.existsSync(outputDir)) return null;
  const runs = fs.readdirSync(outputDir).filter(n => n.startsWith('run-')).sort();
  return runs.length ? path.join(outputDir, runs[runs.length-1]) : null;
}

function loadJSON(p) { try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch(e){ return null; } }

function analyze(results) {
  const suggestions = [];
  if (!results) return suggestions;
  // Check login
  if (results.login) {
    const r = results.login;
    if (!r.ok) suggestions.push({ area: 'login', issue: 'login failed', reason: r.error || 'unknown', action: 'Check credentials, selectors used in loginFlow, and any 2FA or CAPTCHA' });
    if (r.meta && r.meta.loginVerified === false) suggestions.push({ area: 'login', issue: 'login not verified', reason: 'verifyScreenshot present but loginVerified false', action: 'Adjust post-login verification selectors or capture more page text' });
  }

  // Courses
  if (results.courses && Array.isArray(results.courses)) {
    for (let i=0;i<results.courses.length;i++) {
      const c = results.courses[i];
      if (!c.ok) {
        suggestions.push({ area: `course-${i}`, issue: 'course flow failed', reason: c.error || 'unknown', action: 'Inspect console log and HAR; consider increasing PER_FLOW_TIMEOUT_MS or improving selectors in coursePageFlow' });
      } else if (c.meta && typeof c.meta.lessonCount !== 'undefined' && c.meta.lessonCount === 0) {
        suggestions.push({ area: `course-${i}`, issue: 'zero lessons detected', reason: 'lessonCount === 0', action: 'Expand selector list in coursePageFlow; add inline JSON/REST probes; try percent-decoded path retry' });
      }
    }
  }

  // Generic checks for other flows
  const otherFlows = ['profile','grades','ticket','support','placement','courses','lesson'];
  for (const f of otherFlows) {
    if (results[f]) {
      const r = results[f];
      if (!r.ok) suggestions.push({ area: f, issue: 'flow failed', reason: r.error || 'unknown', action: `Open ${f}.console.log and ${f}.har inside run folder to see errors; consider increasing timeout` });
      if (r.meta && r.meta.rows === 0) suggestions.push({ area: f, issue: 'no rows found', reason: 'possible data or selector mismatch', action: 'Adjust rows selector or check auth/session' });
    }
  }

  // If nothing to say
  if (!suggestions.length) suggestions.push({ area: 'general', issue: 'no obvious issues detected', action: 'If results look incomplete, upload the run folder so the QA can inspect HARs and screenshots' });
  return suggestions;
}

if (require.main === module) {
  const outputDir = path.join(__dirname, '..', 'output');
  const latest = findLatestRun(outputDir);
  if (!latest) { console.error('No runs found in', outputDir); process.exit(1); }
  const resultsPath = path.join(latest, 'results.json');
  const results = loadJSON(resultsPath);
  const suggestions = analyze(results || {});
  const destJson = path.join(latest, 'auto_suggestions.json');
  const destMd = path.join(latest, 'auto_suggestions.md');
  try { fs.writeFileSync(destJson, JSON.stringify(suggestions, null, 2)); } catch(e){}
  let md = `# Auto Suggestions for run ${path.basename(latest)}\n\n`;
  for (const s of suggestions) {
    md += `- Area: **${s.area}**\n  - Issue: ${s.issue}\n  - Reason: ${s.reason || ''}\n  - Suggested action: ${s.action}\n\n`;
  }
  try { fs.writeFileSync(destMd, md); } catch(e){}
  console.log('Wrote', destJson, 'and', destMd);
}
