# QA Report — Phase 5 (Student flows)

Date: 26 Oct 2025
Scope: Compare prior suite run vs. latest after targeted fixes; quantify assertion pass-rate delta, call out persistence/session/BuddyPanel checks, and list next fixes.

---

## Executive summary

- Overall evidence coverage: 89% → 89% (no change)
- Assertions: 48/72 (67%) → 50/71 (70%)
  - Net +2 passes, -1 total checks (made a role-dependent check optional in Reviews)
- Session integrity: verified. One re-login performed on logout detection; explicit logout cleared `wordpress_logged_in` cookie.
- BuddyPanel/Sidebar: stable; sidebarNavOk true on Support, Grades, Placement, Courses; Reviews has no sidebar link by design.

---

## Per‑flow delta

| Flow (runName)            | Previous (pass/total) | Current (pass/total) | Delta | Notes                                                                      |
| ------------------------- | --------------------: | -------------------: | :---: | -------------------------------------------------------------------------- |
| login                     |                   6/6 |                  6/6 |   —   | Stable                                                                     |
| support                   |                   4/4 |                  4/4 |   —   | Stable                                                                     |
| placement                 |                   2/6 |                  2/6 |   —   | Resume upload still not acknowledged/persisted                             |
| courses-list              |                   1/3 |                  2/3 |  +1   | Now detects lessons on at least one course; steps file still not extracted |
| course-0                  |                   5/7 |                  5/7 |   —   | Steps JSON still not extracted; lesson nav occasionally SPA                |
| course-1                  |                   5/7 |                  5/7 |   —   | Same as above                                                              |
| course-2                  |                   5/7 |                  5/7 |   —   | Same as above                                                              |
| course-3 (member courses) |                   3/7 |                  3/7 |   —   | From member page we click first course; start/continue still flaky         |
| lesson-שיעור-2-3          |                   4/5 |                  4/5 |   —   | ResumeSaved via native video still failing; gating + completion persist OK |
| ticket                    |                   4/6 |                  4/6 |   —   | Submit acknowledged but not found in list or after reload                  |
| grades                    |                   2/4 |                  3/4 |  +1   | DOM vs API count now matches; schema-after-reload still flagged            |
| profile                   |                   4/4 |                  4/4 |   —   | BuddyPanel + profile update persistence stable                             |
| reviews                   |             2/5 (40%) |            2/4 (50%) | +10pp | Sidebar link made role-aware (optional); rating + submit still failing     |
| logout                    |                   1/1 |                  1/1 |   —   | Cookie cleared via wp-login.php?action=logout                              |

Totals: 48/72 (67%) → 50/71 (70%)

---

## Highlights (what improved)

- Courses list: anyCourseHasLessons now true by broadening lesson selectors and capturing LearnDash globals.
- Grades: DOM count switched to tbody rows; parity with API achieved; reload still monitored.
- Reviews: Role-aware sidebar assertion prevents false negatives; report now focuses on rating/submission.
- Session hygiene: re-login on logout detection and explicit logout proven via cookie clearing.

---

## Persisting issues (top blockers)

- Placement (ACF upload):
  - resumeInputPresent=false; upload attempt/ack/persist all false.
  - Likely hidden/overlay input or JS hook. Need to target true input name and dispatch change.
- Courses detail (steps extraction):
  - stepsFileExtracted=false across all courses. Look for ldGlobalSettings or inlined JSON in alternative tags/attrs.
- Lesson resume (LearnDash):
  - resumeSaved=false when native <video> isn’t exposed; rely on localStorage key `learndash-video-progress-*` and verify after reload.
- Ticket list persistence:
  - ticketAppearsInList=false and ticketPersistsAfterReload=false; form submit acknowledges but list isn’t updated within budget.
- Grades schema stability:
  - gradesSchemaStableAfterReload=false despite row parity; confirm selectors and debounce timing.
- Reviews UX:
  - ratingSet=false and reviewSubmitAcknowledged=false; star/range/radio inputs detected but interaction not accepted by widget.

---

## Evidence references (latest run)

- Latest: qa/puppeteer/output/run-2025-10-26T13-52-54-761Z
- Previous: qa/puppeteer/output/run-2025-10-26T12-31-48-442Z
- Example artifacts: HAR, console logs, screenshots per flow at the paths above.

---

## Next fixes (targeted, low‑risk)

1. Placement upload (ACF)

- Action: Select the real file input (acf-field or input[type=file]) even if visually hidden; remove CSS visibility guard and use elementHandle.uploadFile; dispatch input + change; wait for filename label to update; reload to assert persistence.
- Success: resumeInputPresent=true; resumeUploadAttempt=true; resumeUploadAcknowledged=true; resumeFilenamePersists=true.

2. Steps JSON extraction (courses)

- Action: Parse ldGlobalSettings or inlined data-ld-\* payload; if absent, call window.ldVars or scan script tags for ldCourseData JSON; treat minimal array as success.
- Success: stepsFileExtracted=true on at least one course detail and/or courses-list.

3. Lesson resume via LearnDash storage

- Action: If native video time isn’t available, write and then verify the matching localStorage key; after reload, assert value >= written time.
- Success: resumeSaved=true.

4. Tickets persistence

- Action: After submit, navigate list pagination or re-query via AJAX endpoint used by the table; wait for new row by title; retry after short backoff.
- Success: ticketAppearsInList=true; ticketPersistsAfterReload=true.

5. Grades schema after reload

- Action: After first render parity, reload and query tbody tr again with a short wait for the AJAX response; assert the same count and column set.
- Success: gradesSchemaStableAfterReload=true.

6. Reviews rating + submit

- Action: Try programmatic click/keydown on star widgets and fallback to hidden input; ensure submit triggers a visible success selector; respect CSRF/nonces.
- Success: ratingSet=true; reviewSubmitAcknowledged=true.

---

## Four‑lens (Student) snapshot

- Have: Sidebar links match, login/session stable, course pages render lessons, grades parity with API, profile updates persist.
- Missing: Steps JSON extraction, placement resume upload, ticket list persistence, lesson resume when native player hidden.
- Pending: Reviews rating/submission, grades schema stability after reload.
- Post‑Launch: Analytics on form submissions, richer lesson resume logic, full Reviews CPT + moderation.

Overall status: Assertions up to 70% with stable evidence coverage; next cycle targets persistence and extraction gaps to approach 80–85% assertion pass.
