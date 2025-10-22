# Puppeteer flows inventory (import from https://github.com/Danieled1/puppeteer-app)

Use this file to map and record Puppeteer flows and scripts you already built in your external repo. Copy the relevant files into `qa/puppeteer/` in this workspace and fill the table below. Once the files are present I will ingest them and update the QA scripts/report to reuse selectors and flows.

How to import the repo locally (PowerShell)

1. Clone the external repo into a temp folder:

```powershell
git clone https://github.com/Danieled1/puppeteer-app C:\temp\puppeteer-app
```

2. Copy the scripts you want to reuse into this workspace:

```powershell
# adjust paths as needed
$src = 'C:\temp\puppeteer-app' ;
$dst = 'C:\Users\suppo\Downloads\ecom_observation_manual\qa\puppeteer' ;
robocopy $src $dst *.js *.json *.md /S
```

3. Optionally remove the temp clone when done:

```powershell
Remove-Item -Recurse -Force C:\temp\puppeteer-app
```

Inventory template (fill after import)

| Flow name     | File(s)            | Purpose                                     | Entry URL(s)      | Selectors used (key)                                              | Env vars required                            | Notes                          |
| ------------- | ------------------ | ------------------------------------------- | ----------------- | ----------------------------------------------------------------- | -------------------------------------------- | ------------------------------ |
| Login flow    | `login.js`         | Sign-in and role redirect validation        | `/custom-login/`  | `input[name="log"]`, `input[name="pwd"]`, `button[type="submit"]` | STUDENT_EMAIL, STUDENT_PASSWORD, STAGING_URL | e.g., multi-role redirect test |
| Course open   | `open-course.js`   | Open course by slug, capture screenshot     | `/course/{slug}/` | `.course-hero`, `.resume-button`                                  | COURSE_SLUGS                                 | include small/medium/large     |
| Lesson play   | `lesson-play.js`   | Open lesson, check video playback           | `/lesson/{slug}/` | `video`, `.mark-complete`                                         | -                                            | check captions and keyboard    |
| Ticket create | `ticket-create.js` | Fill ACF front-end ticket form, submit      | `/tickets/`       | `input[name="ticket_title"]`, `textarea[name="ticket_content"]`   | -                                            | ensure test suffix in title    |
| Grades fetch  | `grades-fetch.js`  | Visit grades page and capture AJAX response | `/grades/`        | Network request to `fetch_client_grades`                          | -                                            | save HAR                       |

Attach copied filenames below and mark them as "Imported" after you run the copy commands.

Imported files

- `run.js` — Imported
- `...` —

Next steps after import

1. Confirm files are in `qa/puppeteer/` in this workspace.
2. I will scan the imported scripts, extract selectors, and merge flows into the QA report and Puppeteer runner (or create wrappers) so you can run a single consolidated script.
3. Run the consolidated Puppeteer script locally and upload `qa/puppeteer/output/*` into `qa/evidence/` for ingestion.
