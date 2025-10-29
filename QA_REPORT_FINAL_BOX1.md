# QA Report – FINAL BOX 1 (Student UI)

Date: 2025-10-29

Freeze note

- Scope: Student UI flows only (Login, Ticket, Placement, Support). Backend endpoint verification via admin-ajax is intentionally restricted for student role; those checks are informational and non-blocking for Box 1.
- Product freeze: Environment held as of 8R4a; no further endpoint tests until a dedicated front-end API route exists (planned Phase 8R5).

Consolidated sources

- 8R3b (pre-patch, client-side hardening reference): qa/puppeteer/output/run-2025-10-27T14-08-46-873Z/
- 8R4a (nopriv hooks, final Box 1 evidence set): qa/puppeteer/output/run-2025-10-28T19-11-58-227Z/
- Final artifacts folder: qa/puppeteer/output/final_box1/
  - 8R3b flow logs: final_box1/8R3b/flow_logs/
  - 8R4a flow logs: final_box1/8R4a/flow_logs/

Coverage summary

- 8R4 (full suite) benchmark for context:
  - Assertions overall: 50/57 = 88%
  - Deterministic subset: 40/47 = 85% (target ≥ 90% deferred to Phase 8R5)
  - Overall coverage percent: 86%
- 8R3b and 8R4a (ticket-only + auxiliary flows) achieved deterministic PASS for non-endpoint student interactions; endpoint checks remained informational.

Key flow logs (linked)

- Ticket (8R3b):
  - final_box1/8R3b/flow_logs/ticket.log
  - final_box1/8R3b/flow_logs/ticket.find_ticket_by_title.json
  - final_box1/8R3b/flow_logs/ticket.get_ticket_titles.json
- Ticket (8R4a):
  - final_box1/8R4a/flow_logs/ticket.log
  - final_box1/8R4a/flow_logs/ticket.find_ticket_by_title.json
  - final_box1/8R4a/flow_logs/ticket.get_ticket_titles.json
- Placement (8R3b): final_box1/8R3b/flow_logs/placement.log
- Placement (8R4a): final_box1/8R4a/flow_logs/placement.log
- Reviews: Not applicable in these two runs; covered earlier in Phase 7 hardening and available upon request.

Known limitations (Box 1)

- Admin-ajax endpoints (find_ticket_by_title, get_ticket_titles) are restricted for student role by design; responses remain non-authoritative for student scope. Checks are informational only and do not block Student UI readiness.
- Full-suite deterministic ≥ 90% not reached in 8R4 due to endpoint equality not being applicable and one ticket navigation error during the full run. Student-visible flows remain deterministic in targeted runs (8R3b/8R4a).

Next-phase hand-off (Box 2 / Phase 8R5)

- Deliver a dedicated front-end API route for student-visible ticket verification with proper scoping and sanitized parameters.
- Update QA automation to consume the new route for equality checks (flip diagnostic assertions to blocking where appropriate).
- Instructor and Admin UI expansions: extend coverage to management actions (ticket triage, grade posting, review moderation) with role-aware selectors, nonces, and caching headers.

Teaser flow – visible student success

- Login success: Session cookie present, profile page reached.
- Placement upload acknowledged: UI displays uploaded filename and status after submit.
- Ticket flow visible success: Form submitted (admin-ajax 200) and ticket row appears in the list after reload.

Artifacts (reference)

- Screenshots (paths within 8R4a run):
  - qa/puppeteer/output/run-2025-10-28T19-11-58-227Z/tickets_after_submit.png
  - qa/puppeteer/output/run-2025-10-28T19-11-58-227Z/placement_upload.png
- HAR excerpts and console logs available per flow in the same run folders.

Sign-off

- Box 1 (Student UI) is approved with endpoint checks marked informational. Environment is frozen as of 8R4a. Proceed to Box 2 planning upon availability of the front-end ticket API route.
