# How to capture QA evidence (quick guide)

Follow this short guide so evidence is consistent and easy to attach to the QA report.

1. Prepare

- Use the staging URL and test account provided.
- Open an incognito window to avoid cache/inconsistent sessions.
- Set browser zoom to 100% and device emulation for mobile checks.

2. Capture screenshots

- Full-page screenshot: show the whole page including header/footer.
- Zoomed screenshot: crop the problem area so text is readable.
- Use the naming convention: `EVID-###_<page>_<short>.png` (e.g., `EVID-001_login_error.png`).

3. Capture network/console logs

- Open DevTools → Network. Reproduce the action. Right-click → Save all as HAR.
- Copy any console errors (right-click → Save as) or screenshot the console.

4. Short screencast

- For flows (resume upload, ticket create), record a 10–30s screencast showing the steps.
- Save as `EVID-###_<page>_flow.mp4`.

5. Fill the Evidence template

- Create `qa/evidence/EVID-###.md` using `evidence_template.md` and paste filenames and short repro steps.

6. Update `DEFECTS.csv`

- Add or update a row with the `evidence` column set to `EVID-###` and a short reproduction summary.

Tips

- If an AJAX request fails, include the full response body (copy-paste) in the evidence MD.
- For email tests, include the recipient mailbox and a screenshot of the received email headers/body.
- When possible, include the file path in the evidence (where the template or function appears to live).
