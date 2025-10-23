# Flow → Page mapping (Student experience)

Purpose: map existing Puppeteer flows to the Student pages in this repo. Use this as the single source of truth for which automated flows we will run to collect evidence for the QA report.

How to use

- Review each row and mark `coverage` as `full`, `partial` or `none` after you inspect the flow script.
- For `partial` flows, list missing selectors or steps in `notes` so we can update the flow wrappers.
- After running a flow and collecting outputs, add Evidence IDs used for defects.

| Page file              | Page name                   | Puppeteer flow(s) available                            | Coverage | Next actions / Notes                                                                                                            | Evidence IDs |
| ---------------------- | --------------------------- | ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `student/login.md`     | Login                       | `flows/loginFlow.js` (orchestrator)                    | full     | Verify selectors `input[name="log"]`, `input[name="pwd"]` and login button. Run once and capture `after_login.png`.             |              |
| `student/courses.md`   | Courses list                | `flows/coursePageFlow.js`, `flows/coursesFlow.js`      | partial  | `coursesFlow.js` may include tab switching. Confirm selectors for group tabs and card status ribbons.                           |              |
| `student/course.md`    | Course (single)             | `flows/coursePageFlow.js`                              | partial  | Confirm `.resume-button`, progress infobar selectors, and video preview modal selector. Add skeleton checks.                    |              |
| `student/lesson.md`    | Lesson                      | `flows/lessonPageFlow.js`                              | partial  | Confirm `video` selector, `.mark-complete` and next/prev selectors. Add gating and assignment check steps.                      |              |
| `student/grades.md`    | Grades                      | `flows/gradesFlow.js`                                  | full     | Confirm AJAX network call name (`fetch_client_grades`) and capture HAR. Ensure table renders.                                   |              |
| `student/tickets.md`   | Tickets                     | `flows/ticketFlow.js`, `flows/ticketEmptyStateFlow.js` | partial  | Confirm ACF field names used in the form. Check for file upload control selector and submission confirmation.                   |              |
| `student/placement.md` | Placement                   | `flows/placementFlow.js` (in `puppeteer-app/flows`)    | partial  | If not copied, we need to import `placementFlow.js` from `puppeteer-app`. Confirm resume upload selector and notification flow. |              |
| `student/reviews.md`   | Reviews                     | `flows/supportFlow.js`, `flows/reviewsFlow.js`         | none     | The reviews template likely needs a custom flow to test nonce & persistence. Add a small flow to submit and capture result.     |              |
| `student/profile.md`   | Profile                     | `flows/coursesFlow.js` (group tabs)                    | partial  | Confirm dynamic group tabs selector and campaign card. Check for placeholders and save screenshot.                              |              |
| `student/support.md`   | Support / Technical Support | `flows/supportFlow.js`                                 | full     | Confirm CTA link to Google Form or portal; capture click behavior and fallback.                                                 |              |

Next actions (short)

1. Mark coverage per row after you open each flow script (in `qa/puppeteer/flows/` and `puppeteer-app/flows`).
2. For `partial` rows, note missing selectors in `Next actions / Notes` and I will update wrapper flows.
3. Run `orchestrator.js` locally to collect initial evidence. Move outputs to `qa/evidence/` and create `EVID-###.md` files.
4. I will ingest evidence and expand `DEFECTS.csv` and update `QA_Report_Student_Experience_v1.md`.

If you want I can scan `puppeteer-app/flows` now and pre-fill `Coverage` and `Next actions` automatically — say "Scan flows" and I'll do that.

links: (AI student)

https://app.digitalschool.co.il/courses/chatgpt/
https://app.digitalschool.co.il/courses/%d7%a7%d7%95%d7%a8%d7%a1-digital-ai-%d7%9e%d7%aa%d7%a2%d7%93%d7%9b%d7%9f/
https://app.digitalschool.co.il/courses/nlp/

https://app.digitalschool.co.il/courses/chatgpt/lessons/%d7%a9%d7%99%d7%a2%d7%95%d7%a8-2-3/

https://app.digitalschool.co.il/technical-support-guide/
https://app.digitalschool.co.il/tickets/
https://app.digitalschool.co.il/placement/
https://app.digitalschool.co.il/grades/
https://app.digitalschool.co.il/%d7%9e%d7%a9%d7%95%d7%912/
https://app.digitalschool.co.il/members/test_live_student/courses/
https://app.digitalschool.co.il/members/test_live_student/
https://app.digitalschool.co.il/members/test_live_student/friends/
https://app.digitalschool.co.il/members/test_live_student/certificates/
https://app.digitalschool.co.il/members/test_live_student/settings/
https://app.digitalschool.co.il/members/test_live_student/messages/compose/
https://app.digitalschool.co.il/members/test_live_student/groups/
https://app.digitalschool.co.il/members/test_live_student/notifications/
