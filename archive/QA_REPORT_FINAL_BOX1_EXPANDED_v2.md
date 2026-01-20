# Ecom+ Student Experience QA Dossier — FINAL BOX 1 (Calibrated, Merged, Narrative v2)

Date: 2025-10-30
Status: Completed and archived (Student UI). Environment remains paused pending Box 2 (API). No new runs in this pass.

## Overview & methodology

- Evolution and scope

  - Student-facing journey across BuddyBoss + LearnDash with custom WordPress extensions (ACF, AJAX, CPTs for grades and tickets). Focus on RTL/Hebrew usability, stable session handling, and visible student outcomes.
  - Orchestrator matured through Phases 1 → 8R4a: mapping-driven flows, deep evidence capture (HAR, console, screenshots, body summaries), deterministic vs stateful assertion taxonomy, and re-login integrity checks.
  - Phase 8R4a explicitly marked ticket endpoint checks informational for the student role; environment was frozen thereafter pending a student-scoped API in Box 2.

- Calibration baseline (frozen)
ש
  - Merge rule when findings conflict: calibration > 8R4a > 8R3b.

- Qualitative lens (from STUDENT_EXP.md)
  - UX consistency: cohesive visual system across pages; strong RTL support; minor mobile spacing polish needed on course and lesson headers; tables adapted for RTL with `data-colname`.
  - Student-journey clarity: login → profile hub → courses grid → course/lesson progression → operational hubs (grades, placement, tickets, support) feels linear and predictable.
  - Design notes: clear status cues (progress bars, ribbons, chips) communicate state; missing empty/loader states and a few accessibility touches (ARIA, focus, contrast) remain top polish items.

## Evolution summary (8R3b → 8R4 → Calibration)

- 8R3b (pre-patch, client-side hardening reference)

  - Endpoint equality for tickets not authoritative; UI success verified via row detection and reload persistence. Student-visible flows deterministic in targeted runs.

- 8R4 / 8R4a (endpoint normalization attempt + nopriv hooks)

  - Admin-ajax checks remained informational for student role; equality not confirmed by endpoints. Full-suite snapshot (8R4) reached: overall 86%, assertions 88% (50/57), deterministic 85% (40/47).
  - Environment frozen at 8R4a with explicit banner and Box 2 plan.

- Calibration baseline (three full runs; no code change)
  - Converged metrics across all three runs: overall coverage 87%, assertions 87% (59/68), deterministic 87% (46/53).
  - Lessons, placement, grades, support, login/logout stable at 100% readiness; courses list and reviews at ~67%; tickets validated at UI level (67%) with endpoints informational by design.

## Per‑flow validation (student pages)

For each flow: key behavior, calibration outcome, qualitative insights, and direct links to baseline evidence.

1. Login

- Outcome: Session established; redirected to member profile. Functional checks 6/6; no deterministic-gated checks for Box 1.
- UX & design: Clean Hebrew-localized form; add password visibility toggle and “Forgot password”; ensure mobile RTL spacing and focus states.
- Evidence: login.har, login.console.log, login_body.png in each baseline run.
- Readiness: 100%

2. Dashboard/Profile

- Outcome: Tabs (profile/settings) reachable; auto re-login on session drop.
- UX & design: Central hub with dynamic sub-tabs (LearnDash groups). Campaign cards are visually cohesive but still placeholders; add empty states and loading hints when switching tabs.
- Evidence: profile.har, profile.console.log, profile_body.png.
- Readiness: 100%

3. Courses (list)

- Outcome: Grid renders; counts stable; some interactions deferred.
- UX & design: Intuitive chips/tabs by group; needs empty-state and loader; normalize Hebrew labels on ribbons; adjust mobile gutters.
- Evidence: courses-list.har, courses-list.console.log, courses-list_body.png.
- Readiness: 67%

4. Course detail (featured samples)

- Outcome: Hero/progress/CTA stable. Minor variability on one sample (content/timing).
- UX & design: Clear progression model with sticky sidebar; add skeletons/empty states; verify a11y on preview modal and resume CTA.
- Evidence: course-_\__.har/.console.log and course-0_body.png … course-3_body.png.
- Readiness: 86/86/86/60% (course-0/1/2/3)

5. Lesson

- Outcome: Resume saved; completion persists across re-login.
- UX & design: Strong hero and checklist; add sticky “Mark Complete” on mobile; consider transcript/resources section and better video UX defaults.
- Evidence: lesson-%d7%… har/console and lesson\_\*\_body.png.
- Readiness: 100%

6. Grades

- Outcome: Grades hub loads; counters present; AJAX response OK.
- UX & design: RTL-optimized table with mobile-friendly labels; add caption/empty state; search/sort/filter post-launch.
- Evidence: grades.har, grades.console.log, grades_body.png.
- Readiness: 100%

7. Tickets

- Outcome: Form filled; admin-ajax submit 200; row detected after reload. Endpoint equality checks logged but non-authoritative for student role.
- UX & design: Clear two-action layout; add pagination/search and status chips; improve attachment feedback and success/error toasts.
- Evidence: ticket.har, ticket.console.log, tickets\_\* screenshots.
- Readiness: 67% (UI success; endpoints informational by design)

8. Placement

- Outcome: ACF form present; file upload acknowledged; related courses visible.
- UX & design: Polished cards; standardize empty states; confirm file type/size hints; unify tokens (radius/gap/shadow) with global system.
- Evidence: placement.har, placement.console.log, placement_body.png, placement_upload.png.
- Readiness: 100%

9. Reviews

- Outcome: Page reachable; minimal UX present; nonce/validation/persistence deferred.
- UX & design: Simple single-page form suitable for MVP; add nonce, validation, rate-limit, and storage (CPT) post-launch.
- Evidence: reviews.har, reviews.console.log, reviews.png.
- Readiness: 67%

10. Support

- Outcome: Header/button present; link opens.
- UX & design: Single CTA flow; make CTA a semantic link/button with aria-label; add SLA text and fallback mailto.
- Evidence: support.har, support.console.log, support_body.png.
- Readiness: 100%

11. Logout

- Outcome: Session cleared; redirected as expected.
- UX & design: Ensure redirect targets custom login page consistently; add confirmation copy if needed.
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
- Lessons, placement, grades, support, login/logout consistently validate at 100% readiness (calibration).
- Ticket flow robust at UI level (form submit + list persistence) with explicit row-detection strategy.

Risks / attention

- Courses list and reviews hold at ~67% (deferred interactions, missing validation/persistence).
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

## Teaser flow — full journey (narrative + baseline references)

Narrative overview:

- Student logs in with the custom Hebrew UI and is redirected to their member profile (session established).
- From the profile hub, they open the courses grid and pick a featured course; the course detail shows progress and a clear primary CTA.
- They enter a lesson, mark progress, and their completion state persists across a re-login.
- In the grades hub, they view evaluated items and counts at a glance.
- When opening a ticket, they fill sector/sub-topic, submit, and see the ticket row appear in their list after reload.
- On the placement page, they upload a resume and see an acknowledgement along with related job-prep courses.
- They can leave a simple review (MVP form) and reach the support page for external help when needed.
- Finally, they logout and return to the login entry point.

Primary references (latest baseline run: qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/):

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
- Baseline runs: the three qa/puppeteer/output/run-2025-10-29T13-27-32-575Z | 13-32-29-280Z | 13-37-12-867Z
- Phase context: QA_REPORT_PHASE_8R4.md (archived banner; endpoints informational for student scope)

## Sign‑off

- Box 1 (Student UI) — approved and archived with calibration evidence. Endpoint equality verification deferred to Box 2 API.
- Environment remains paused (post‑8R4a state) awaiting Box 2 kickoff.
