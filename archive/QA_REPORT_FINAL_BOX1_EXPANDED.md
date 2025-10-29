# Ecom+ Student Experience QA Dossier – FINAL BOX 1 (Calibrated & Sequenced)

Date: 2025-10-29
Status: Completed and archived (Student UI). Environment paused pending Box 2 (API).

## Overview & methodology

- Scope: All student-visible flows (login, dashboard/profile, courses, lessons, grades, tickets, placement, reviews, support, logout).
- History: Phases 1 → 8R4a built orchestration, evidence capture (HAR, console, screenshots, body summaries), assertion taxonomy (deterministic/stateful), and diagnostics. Phase 8R4a closed with endpoints marked informational for student scope.
- Calibration baseline: Three full-suite deterministic runs were executed (no code changes) to refresh evidence and metrics.
  - Runs:
    - qa/puppeteer/output/run-2025-10-29T13-27-32-575Z/
    - qa/puppeteer/output/run-2025-10-29T13-32-29-280Z/
    - qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/
  - Purpose: produce current deterministic coverage and screenshots across all student flows under identical conditions.

## Per-flow validation (student pages)

- Login
  - Findings: Session established; cookie present; navigation to member profile successful.
  - Evidence: login.har, login.console.log, login_body.png (all calibration runs)
  - Readiness: 100%
- Dashboard/Profile
  - Findings: Tabs responsive (profile, settings); re-login handled if needed.
  - Evidence: profile.har, profile.console.log (calibration runs)
  - Readiness: 100%
- Courses (list)
  - Findings: Courses grid renders; count stable; some actions deferred (non-blocking).
  - Evidence: courses-list.har, console, screenshots
  - Readiness: 67%
- Course detail (multiple featured courses)
  - Findings: Primary elements render; “Start/Continue” interaction present; minor timing variability.
  - Evidence: course-0..3 HAR/console/screenshots
  - Readiness: 60–86% (per course)
- Lesson page
  - Findings: Resume state saved; completion persists after re-login.
  - Evidence: lesson-*/ HAR/console/screenshots
  - Readiness: 100%
- Grades
  - Findings: Grades view loads; expected elements present.
  - Evidence: grades HAR/console/screenshots
  - Readiness: 100%
- Tickets
  - Findings: Form open, sector + sub-topic selections, title + content filled, admin-ajax submit 200; row appears after reload; endpoint checks informational only.
  - Evidence: ticket HAR/console/screenshots; bodySummary shows row with posted title.
  - Readiness: 67% (student-visible success confirmed; backend equality deferred to Box 2)
- Placement
  - Findings: ACF form present; file input and upload acknowledgement rendered; related courses visible.
  - Evidence: placement HAR/console/screenshots (filename echoed in UI)
  - Readiness: 100%
- Reviews
  - Findings: Page reachable; UI elements present; some interactions partial (non-blocking for Box 1).
  - Evidence: reviews HAR/console/screenshots
  - Readiness: 67%
- Support
  - Findings: Support header and button present; form opens.
  - Evidence: support HAR/console/screenshots
  - Readiness: 100%
- Logout
  - Findings: Session cleared; redirected as expected.
  - Evidence: logout HAR/console/screenshots; logout_after.png
  - Readiness: 100%

Notes

- Flow-level readiness derived from calibration coverage (deterministic/stateful) and prior confirmed behavior; conflicts resolved in favor of most recent deterministic evidence (calibration > 8R4a > 8R3b).

## Coverage metrics (calibration baseline)

- Aggregate (average across three calibration runs):
  - Assertions overall ≈ 87%
  - Deterministic subset ≈ 87%
  - Overall coverage (artifacts present) ≈ 87%
- Representative run snapshots:
  - run-2025-10-29T13-27-32-575Z: assertions 87%, deterministic 87%, coverage 87%
  - run-2025-10-29T13-32-29-280Z: assertions 87%, deterministic 87%, coverage 87%
  - run-2025-10-29T13-37-12-867Z: assertions 87%, deterministic 87%, coverage 87%

## Strengths & risks

- Strengths
  - Stable session handling with automatic re-login and evidence capture per flow.
  - Lessons, placement, grades, support, login/logout achieve consistent 100% readiness in calibration.
  - Tickets: student-visible creation validated (row detection) and robust waits added.
- Risks / attention
  - Courses list and reviews retain partial readiness (67%) due to deferred interactions.
  - Ticket endpoint equality intentionally not applicable under student scope (admin-ajax role boundary) — moved to Box 2.
  - Some course detail actions intermittently slow (2–3s) but within acceptable thresholds.

## Unified readiness table

| Flow                | Readiness |
| ------------------- | --------- |
| Login               | 100%      |
| Dashboard/Profile   | 100%      |
| Courses (list)      | 67%       |
| Course detail (0/1/2/3) | 86/86/86/60% |
| Lesson              | 100%      |
| Grades              | 100%      |
| Tickets             | 67% (UI success; endpoints informational) |
| Placement           | 100%      |
| Reviews             | 67%       |
| Support             | 100%      |
| Logout              | 100%      |

## Known limitations & next-phase handoff

- Admin-ajax endpoints (find_ticket_by_title, get_ticket_titles) are restricted for student role; endpoint checks remain informational only for Box 1.
- Box 2 (API) handoff:
  - Provide a front-end, student-scoped API route for ticket verification (normalized equality, proper scoping, cache-control headers).
  - Update QA to consume that route and flip diagnostic assertions to blocking where appropriate.
  - Extend coverage for Instructor/Admin UI (ticket triage, grade posting, review moderation) with role-aware checks and nonces.

## Teaser flow – full student journey

- Sequence: login → dashboard/profile → courses → lessons → grades → tickets → placement → reviews → logout.
- Calibration references (latest run): qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/
  - Screenshots: login_body.png, tickets_after_submit.png, placement_upload.png, logout_after.png
  - HAR + console: per-flow files in the run folder
  - Body summaries: embedded in results.json per flow

## Evidence linkage (baseline only)

- Student pages: see /student/*.md (login.md, courses.md, lesson.md, grades.md, tickets.md, placement.md, reviews.md, profile.md, support.md)
- Calibration runs: three run-* folders dated 2025-10-29T13:27/13:32/13:37
- Deterministic metrics: coverage.json in each run folder

## Sign-off

- Box 1 (Student UI) — approved. Endpoint checks remain informational by design; backend equality deferred to Box 2.
- Environment paused at post-8R4a state with calibration evidence captured.
