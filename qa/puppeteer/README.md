Puppeteer QA scaffold

This folder contains Puppeteer scripts to exercise Student flows and capture screenshots/HAR files. It now includes an `orchestrator.js` that runs a set of flows (login, open courses, lesson, tickets, grades) and saves results.

Setup

1. Install Node.js (v18+ recommended).
2. From this folder run:

npm install

Running (PowerShell example)
Set environment variables and run the orchestrator. Example:

```powershell
$env:STAGING_URL = "https://app.digitalschool.co.il";
$env:STUDENT_EMAIL = "test_live_student";
$env:STUDENT_PASSWORD = "test_live_student";
$env:COURSE_SLUGS = "course-small,course-medium,course-large";
node orchestrator.js
```

Outputs

- The orchestrator saves HAR and screenshots to `qa/puppeteer/output/` and writes `results.json` with pass/fail per flow.

How to use the outputs

- Move screenshots/HAR to `qa/evidence/` and create `EVID-###.md` files using `qa/evidence_template.md`.
- Update `DEFECTS.csv` rows to reference the Evidence IDs.

Notes

- The flows are best-effort wrappers — if selectors differ on your site, edit the relevant files in `qa/puppeteer/flows/`.
- The orchestrator runs headful (visible browser) so you can observe. For CI/headless, change the `puppeteer.launch` options in `orchestrator.js`.
