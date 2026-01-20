# Ecom+ Student Experience QA Dossier — FINAL BOX 1 (Calibrated, Merged, Cross‑referenced)

Date: 2025-10-30
Status: Completed and archived (Student UI). Environment remains paused pending Box 2 (API).

## Overview & methodology

- Evolution: Phases 1 → 8R4a established the orchestrator (mapping-driven), deep evidence capture (HAR, console, screenshots, body summaries), and assertion taxonomy (deterministic vs stateful). Phase 8R4a formally marked ticket endpoint checks as informational for student scope and froze the environment.
- Calibration baseline: Three full RUN_ONLY=all passes executed with no code changes to refresh evidence and coverage under identical conditions.
  - Runs (baseline only):
    - qa/puppeteer/output/run-2025-10-29T13-27-32-575Z/
    - qa/puppeteer/output/run-2025-10-29T13-32-29-280Z/
    - qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/
- Merge rule: calibration > 8R4a > 8R3b when findings conflict.

## Per‑flow validation (student pages)

For each flow: key behavior, calibration outcome, and direct links to baseline evidence.

1. Login

   - Outcome: Session established; redirected to member profile. Functional checks 6/6; no deterministic-gated checks for Box 1.
   - Evidence: login.har, login.console.log, login_body.png in each baseline run.
   - Readiness: 100%

2. Dashboard/Profile

   - Outcome: Tabs (profile/settings) reachable; auto re-login on session drop.
   - Evidence: profile.har, profile.console.log, profile_body.png.
   - Readiness: 100%

3. Courses (list)

   - Outcome: Grid renders; counts stable; some interactions deferred.
   - Evidence: courses-list.har, courses-list.console.log, courses-list_body.png.
   - Readiness: 67%

4. Course detail (featured samples)

   - Outcome: Hero/progress/CTA stable. Minor variability on one sample (content/timing).
   - Evidence: course-_\__.har/.console.log and course-0_body.png … course-3_body.png.
   - Readiness: 86/86/86/60% (course-0/1/2/3)

5. Lesson

   - Outcome: Resume saved; completion persists across re-login.
   - Evidence: lesson-%d7%… har/console and lesson\_\*\_body.png.
   - Readiness: 100%

6. Grades

   - Outcome: Grades hub loads; counters present; AJAX response OK.
   - Evidence: grades.har, grades.console.log, grades_body.png.
   - Readiness: 100%

7. Tickets

   - Outcome: Form filled; admin-ajax submit 200; row detected after reload. Endpoint equality checks logged but non-authoritative for student role.
   - Evidence: ticket.har, ticket.console.log, tickets\_\* screenshots.
   - Readiness: 67% (UI success; endpoints informational by design)

8. Placement

   - Outcome: ACF form present; file upload acknowledged; related courses visible.
   - Evidence: placement.har, placement.console.log, placement_body.png, placement_upload.png.
   - Readiness: 100%

9. Reviews

   - Outcome: Page reachable; minimal UX present; nonce/validation/persistence deferred.
   - Evidence: reviews.har, reviews.console.log, reviews.png.
   - Readiness: 67%

10. Support

- Outcome: Header/button present; link opens.
- Evidence: support.har, support.console.log, support_body.png.
- Readiness: 100%

11. Logout

- Outcome: Session cleared; redirected as expected.
- Evidence: logout.har, logout.console.log, logout_after.png.
- Readiness: 100%

Evidence anchors (baseline only)

- Use the three baseline folders listed above. Each contains per‑flow HAR, console logs, screenshots, and coverage.json.

## Coverage metrics (calibration only)

- Deterministic coverage (all three runs): 46/53 = 87%
- Assertions overall (all three runs): 59/68 = 87%
- Artifact coverage (present items): 1310/1500 = 87%
- Files: coverage.json in each baseline run
  - run-2025-10-29T13-27-32-575Z/coverage.json
  - run-2025-10-29T13-32-29-280Z/coverage.json
  - run-2025-10-29T13-37-12-867Z/coverage.json

## Strengths & risks (merged)

Strengths

- Stable session integrity with auto re-login and comprehensive evidence capture.
- Lessons, placement, grades, support, login/logout consistently validate at 100% readiness.
- Ticket flow robust at UI level (form submit + list persistence) with explicit row-detection strategy.

Risks / attention

- Courses list and reviews hold at ~67% (deferred interactions and validation/persistence gaps).
- Course detail has one sample at 60% (content/timing variance), not blocking for Box 1.
- Ticket endpoint checks (admin-ajax) are non-authoritative for students by design; equality verification deferred to Box 2 API.

## Unified readiness table (Student UI)

| Flow                    | Readiness                                 |
| ----------------------- | ----------------------------------------- |
| Login                   | 100%                                      |
| Dashboard/Profile       | 100%                                      |
| Courses (list)          | 67%                                       |
| Course detail (0/1/2/3) | 86/86/86/60%                              |
| Lesson                  | 100%                                      |
| Grades                  | 100%                                      |
| Tickets                 | 67% (UI success; endpoints informational) |
| Placement               | 100%                                      |
| Reviews                 | 67%                                       |
| Support                 | 100%                                      |
| Logout                  | 100%                                      |

Source merge: Student Exp pages (/student/\*.md) + QA phase reports (through 8R4) + calibration coverage; conflicts resolved per merge rule.

## Known limitations & next‑phase handoff (Box 2)

- Admin-ajax ticket endpoints (find_ticket_by_title, get_ticket_titles) are restricted for the student role; checks remain informational for Box 1.
- Box 2 plan:
  - Deliver a student‑scoped front‑end API route for ticket verification with normalized equality and cache‑buster headers.
  - Flip diagnostic endpoint assertions to blocking in QA once new route is live.
  - Extend coverage to Instructor/Admin tools (ticket triage, grade posting, review moderation) with nonces and role gates.

## Teaser flow — full journey (baseline references)

Sequence: login → profile → courses → lesson → grades → ticket → placement → reviews → logout

- Primary references (latest baseline run: qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/):
  - login_page.png, login_body.png, after_login.png
  - courses-list_body.png, course-0_body.png, course-1_body.png, course-2_body.png, course-3_body.png
  - lesson-%d7%…\_body.png
  - grades_body.png
  - tickets_page.png, tickets_filled.png, tickets_after_submit.png
  - placement_body.png, placement_upload.png
  - reviews.png
  - logout_after.png

HAR + console logs exist for each flow; see corresponding .har/.console.log files in the same folder.

## Evidence linkage (single pane)

- Student docs: /student/login.md, /student/courses.md, /student/course.md, /student/lesson.md, /student/grades.md, /student/tickets.md, /student/placement.md, /student/reviews.md, /student/profile.md, /student/support.md
- Baseline runs: the three qa/puppeteer/output/run-2025-10-29T13-27-32-575Z|13-32-29-280Z|13-37-12-867Z
- Phase context: QA_REPORT_PHASE_8R4.md (archived banner; endpoints informational for student scope)

## Sign‑off

- Box 1 (Student UI) — approved and archived with calibration evidence. Endpoint equality verification deferred to Box 2 API.
- Environment remains paused (post‑8R4a state) awaiting Box 2 kickoff.
