# QA Report Phase 2E — Coverage & Redundancy Audit

Run: run-2025-10-26T12-31-48-442Z  
Source: qa/puppeteer/output/run-2025-10-26T12-31-48-442Z/{results.json, coverage.json}

## Summary

- Evidence coverage: 89% (overall items present across flows)
- Assertions: 48 passed / 72 total (67% pass rate)
- Session integrity: Verified; explicit logout clears wordpress_logged_in; re-login captured post-logout
- Persistence highlights:
  - Ticket: submit acknowledged, but not visible in list and not persisted after reload (2 fails)
  - Profile: nickname update persisted and reverted (pass)
  - Lessons: video playback started; completion persistence after re-login (pass); resumeSaved (time) did not persist (fail)
  - Placement: resume filename persistence failed (input and acknowledgment not detected)
  - Grades: API captured; DOM vs API count mismatch and schema stability after reload failed

## Per-flow metrics

| Flow                       | Evidence coverage | Assertions (passed/total) | Notes                                                                 |
| -------------------------- | ----------------: | ------------------------: | --------------------------------------------------------------------- |
| login                      |               60% |                       6/6 | loginVerified evidence not captured in items but assertions all green |
| support                    |              100% |                       4/4 | Sidebar link validated (sidebarNavOk)                                 |
| placement                  |              100% |                       2/6 | Resume input/upload/ack/persist failed                                |
| course-0 (ChatGPT)         |              100% |                       5/7 | stepsFileExtracted, navigatedToLesson failed                          |
| course-1 (Digital AI)      |              100% |                       5/7 | stepsFileExtracted, navigatedToLesson failed                          |
| course-2 (NLP)             |              100% |                       5/7 | stepsFileExtracted, navigatedToLesson failed                          |
| course-3 (Member Courses)  |              100% |                       3/7 | lessonsDetectedDom, startOrContinueClicked, navigatedToLesson failed  |
| courses-list               |              100% |                       1/3 | anyCourseHasLessons, anyCourseStepsExtracted failed                   |
| lesson (ChatGPT — שיעור 2) |              100% |                       4/5 | resumeSaved failed; completion persists after re-login passed         |
| ticket                     |              100% |                       4/6 | list appearance and persist-after-reload failed                       |
| grades                     |              100% |                       2/4 | DOM vs API mismatch; schema stability after reload failed             |
| profile                    |              100% |                       4/4 | BuddyPanel present; update persisted and reverted                     |
| reviews                    |              100% |                       2/5 | ratingSet, submit acknowledged, and sidebar link absent               |
| logout                     |               75% |                       1/1 | wordpress_logged_in cleared proven                                    |

Overall (from coverage.json):

- Items coverage: 1335/1500 (89%)
- Assertions: 48/72 passed (67%)

## Duplicate assertion IDs across flows

These indicate shared checks we can consolidate in helpers to reduce noise and improve signal:

- lessonsDetectedDom — course-0, course-1, course-2, course-3
- lessonsDetectedText — course-0, course-1, course-2, course-3
- lessonsDetectedApprox — course-0, course-1, course-2, course-3
- stepsFileExtracted — course-0, course-1, course-2, course-3
- courseHeaderPresent — course-0, course-1, course-2, course-3
- startOrContinueClicked — course-0, course-1, course-2, course-3
- navigatedToLesson — course-0, course-1, course-2, course-3
- sidebarNavOk — support, placement, courses-list, ticket, grades
- submitClicked — login, ticket

Recommendation: factor these into reusable assertion helpers (e.g., courses.assertions.\* and sidebar.assertNavOk) with consistent evidence capture.

## Missing or thin persistence checks

- Courses (all course-\* and courses-list): no explicit persistence assertions (e.g., continue state, lesson progress carry-over) — add lightweight checks:
  - After clicking Start/Continue, record lesson slug; reload course page; assert the same lesson is marked continue
  - Capture and compare LearnDash localStorage/cookies that track progress
- Support page: only presence checks; no persistence/state (OK for static guide, optional)
- Reviews: no “post-submit appears in list” or confirmation toast evidence

Existing persistence checks (present but failing):

- Ticket: ticketAppearsInList, ticketPersistsAfterReload
- Placement: resumeFilenamePersists
- Lesson: resumeSaved
- Grades: gradesSchemaStableAfterReload

## Notable failures (by area)

- Courses:
  - stepsFileExtracted failed across all course pages (0/4)
  - navigatedToLesson failed across all course pages (0/4)
  - courses-list: anyCourseHasLessons and anyCourseStepsExtracted both failed
- Ticket:
  - ticketAppearsInList, ticketPersistsAfterReload failed
- Placement:
  - resumeInputPresent, resumeUploadAttempt, resumeUploadAcknowledged, resumeFilenamePersists failed (file input likely obstructed/ACF variant)
- Lesson:
  - resumeSaved failed (Vimeo/native playback position not persisted)
- Grades:
  - gradesMatchesApi failed (api=6, dom=7)
  - gradesSchemaStableAfterReload failed
- Reviews:
  - ratingSet, reviewSubmitAcknowledged failed; sidebar link absent

## Recommendations (next pass)

- Courses/lessons

  - Stabilize lesson navigation: prefer explicit first lesson anchor selector, wait for .ld-lesson or player selector, then assert URL contains /lessons/
  - Steps extraction: include fallbacks (window.course_steps, ldGlobal settings, or data attributes) and tolerate gzip/nonce-guarded JSON by fetching via page.evaluate with credentials
  - Add minimal progress persistence: mark a lesson complete (if safe on staging), reload, assert completed state remains

- Ticket

  - After submit, wait for admin-ajax POST and success feedback; then navigate to /tickets/ with networkidle0 and search by exact title; if list is paginated, query via REST/admin-ajax where available

- Placement

  - Detect non-standard or hidden file input (ACF File field): use page.$eval to remove display:none and set files via input.uploadFile; assert selected filename text near field

- Grades

  - Align table row selector to exclude header rows when comparing with API length; add schema keys validation (id, course, grade, date)

- Reviews

  - Identify the rating widget selector (stars/slider) and set value; wait for confirmation banner; optionally skip actual submit if it triggers moderation

- Cross-cutting
  - Consolidate duplicate assertions into helpers; standardize sidebar assertion to capture the exact active URL and left-nav label
  - Improve evidence coverage for login/logout items (mark loginVerified, counts) to bring those to 100%

## Appendix

- Trace markers observed across flows: nav.start/finish, cookies.applied, har.start/stop, wait.domcontentloaded/load, dialog.dismissed, console.write, assertions.summary, run.complete; logout includes nav.loginPageDetected and logout.cookiesChecked.
- Session continuity: verifySession ran before flows; re-login executed when logout detected.

---

Commit suggestion: qa(report): Phase 2E coverage + redundancy audit for run-2025-10-26T12-31-48-442Z
