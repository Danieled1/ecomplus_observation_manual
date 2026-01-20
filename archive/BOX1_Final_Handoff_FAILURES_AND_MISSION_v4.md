This document is the final Box 1 handoff consolidating the identified Failures and the Missions until launch for the Student Experience. It was compiled solely from capsule outputs, the canonical Box 1 archive documents, and the `student/*.md` pages in this repository; no external data or assumptions were introduced.

## FAILURES

Below are failures merged from capsule outputs, Box 1 canonical documents, and student pages (deduplicated and phrased using source text). Each failure entry contains: Description / Why / How long it takes to fix / Urgent level.

1. Courses list: incomplete UX (empty states, loaders, search/pagination)

Description

The Courses list renders but lacks consistent empty-state and loading/skeleton UI, has minor RTL spacing issues on mobile, and is missing search/sort/pagination affordances; this flow is reported at ~67% readiness in the Box 1 dossier.

Why

Box 1 and the student page observations mark the Courses list at 67% readiness and explicitly call out empty/loading states, RTL spacing fixes, and absence of search/pagination as usability risks that degrade discoverability and cause user confusion during slow networks or no-results conditions.

How long it takes to fix

Not specified in source files.

Urgent level

High — listed as one of Box 1 top-3 risks and surfaced in the Executive Summary as a primary attention item.

2. Reviews: missing nonce/validation/persistence & no moderation pipeline

Description

The Reviews page is an MVP email-only form with no nonce/CSRF protection, no server-side validation or persistence (no CPT/moderation storage), and no rate‑limit or spam protections.

Why

Box 1 and student-page docs explicitly list Reviews at ~67% readiness and note the lack of nonce/validation/persistence. The Executive Summary includes Reviews as a top risk and recommends adding validation + persistence to avoid spam, ensure data integrity, and provide a moderation flow.

How long it takes to fix

Not specified in source files.

Urgent level

High — Reviews are included in Box 1 top‑3 risks and explicitly called out in the archive as needing nonce + validation.

3. Tickets: UI success but endpoint equality informational (and missing pagination/search/attachment feedback)

Description

Ticket creation and UI row-detection are validated at the student level, but admin-ajax endpoint equality checks are treated as informational for the student scope. Additionally, the Tickets hub lacks pagination/search, stronger attachment validation/feedback, and deeper thread/reply UX.

Why

The Box 1 dossier marks Tickets as ~67% ready with UI success but notes endpoint equality is non‑authoritative under student scope (deferred to Box 2). Student pages and the evidence grid call out missing pagination/search and file-validation UI as explicit gaps.

How long it takes to fix

Not specified in source files.

Urgent level

High — Tickets (endpoint posture + UX gaps) are part of Box 1 top‑3 risks; Box 1 recommends a Box 2 API to normalize endpoint verification.

4. Missing empty / loading states (global)

Description

Multiple student pages (Courses list, Course detail, Tickets, Grades, Profile panels) lack consistent empty-state copy and loading/skeleton patterns which results in perceived slowness and unclear failure modes for students.

Why

The Executive Summary and multiple page observations explicitly list empty/loading states as high-priority quick wins to improve perceived performance and clarity; these items appear throughout the student pages.

How long it takes to fix

Not specified in source files.

Urgent level

High — called out as immediate quick wins in the Executive Summary.

5. Accessibility (a11y), focus and ARIA gaps

Description

Several pages call out missing focus management, ARIA labels, keyboard-accessible controls (e.g., support CTA built as a div), color-contrast and modal focus traps. Examples include Course detail preview modal, Support CTA, Tickets modals, and Lesson modal controls.

Why

Executive Summary and multiple page observations recommend accessibility touches (aria, focus outlines, keyboard traps) as necessary polish and part of the launch readiness checklist.

How long it takes to fix

Not specified in source files.

Urgent level

High — Executive Summary lists a11y fixes among top polished items to push for launch.

6. Course sample variability (Course sample #3 at 60%)

Description

One course sample (course‑3) demonstrates timing/content variability and reduced assertion pass rates (~60% in the dossier), indicating flaky content/timing behavior on that sample.

Why

The Course detail observation and the Calibration baseline specifically list Course sample #3 at 60% readiness; the dossier recommends investigating timing/content variance and applying resilient waits or skeletons.

How long it takes to fix

Not specified in source files.

Urgent level

Medium — listed in Box 1 as a localized variability issue (not blocking Box 1 but important to stabilize).

7. Placement: file validation and UX (resume upload hints)

Description

Placement page supports resume upload but lacks explicit file type/size hints, client-side validation, and consistent success/error toasts.

Why

Student placement documentation and Box 1 call out resume upload behavior and ask for size/type hints and validation to reduce fail-rate and support staff overhead.

How long it takes to fix

Not specified in source files.

Urgent level

Medium — explicitly listed in Box 1 as an actionable polish item; readiness was otherwise high but this UX gap affects submission quality.

8. Login polish: password visibility, Forgot password, mobile RTL spacing

Description

Login flow functions, but UI polish items remain: password visibility toggle, “Forgot password” link, mobile RTL spacing and focus improvements.

Why

Login page observations and the dossier list these as missing polish items; login functional readiness is high, but these are small UX blockers for users.

How long it takes to fix

Not specified in source files.

Urgent level

Medium — not in top-3 risks but called out as an immediate UX polish in Box 1 observations.

9. Support: identity prefill, SLA / fallback copy

Description

Support page is a single-CTA to an external form and lacks identity prefill, SLA/response time copy, and a keyboard-accessible semantic CTA.

Why

Support observation recommends prefill via query params, SLA copy and a semantic CTA for keyboard users; these improve success rate and reduce duplicates.

How long it takes to fix

Not specified in source files.

Urgent level

Medium — Support flow is 100% functional in baseline evidence but missing helpful prefill and SLA context.

10. Profile: empty states and campaign placeholders

Description

Profile has campaign placeholders (static) and missing empty states within group/course panels; switching tabs lacks loading hints.

Why

Profile page observation explicitly lists campaign placeholders and missing empty-states; improving these makes the hub less noisy and more informative.

How long it takes to fix

Not specified in source files.

Urgent level

Low — functional but UX improvement is recommended for polish.

---

## MISSION UNTIL LAUNCH — STUDENT EXPERIENCE

For each mission below, the mapping derives directly from failures above, Box 1 recommended actions, or explicit actions proposed in the archive/Executive Summary. Each mission contains: Description / Why / How long it takes / Urgent level.

1. Implement Courses list quick fixes: empty-state, skeleton loader, RTL spacing, basic search/sort/pagination

Description

Add an empty-state message and a skeleton loading pattern for the Courses list; fix mobile RTL spacing; implement a basic text search and sort (progress/date/title) and a light pagination or lazy-load to handle long lists.

Why

This directly addresses the top-3 Box 1 risk (Courses list at 67%), increases discoverability, and reduces perceived slowness and confusion when tabs or network loads return no results.

How long it takes

Not specified in source files.

Urgent level

High — maps to Box 1 top‑3 risk and Executive Summary quick wins.

2. Harden Reviews for launch: add nonce, server validation, persistence (CPT) and moderation pipeline

Description

Add `wp_nonce_field()` and server-side nonce checks, server-side validation with clear error UI, and persist reviews into a `review` CPT (or equivalent) with a staff moderation workflow and admin UI. Optionally configure a lightweight rate-limit/CAPTCHA for spam protection.

Why

This addresses the Box 1 top‑3 risk for Reviews (67% readiness), removes an injection and spam risk, and provides a stored audit trail for moderation and analytics.

How long it takes

Not specified in source files.

Urgent level

High — directly mapped from Box 1 top‑3 risk.

3. Tickets: ship student-scoped verification API + flip QA checks; implement pagination/search and attachment validation UX

Description

Work with the backend/API owners to deliver a student‑scoped verification endpoint for ticket equality checks (Box 2 scope), then flip the QA diagnostic checks to blocking once available. Meanwhile implement UI pagination/search for the Tickets history, improve attachment file-type/size validation on the client (with toasts), and add a status color legend.

Why

Box 1 marks Tickets as UI-validated but endpoint‑informational; delivering a student API resolves the ambiguity and allows QA to treat endpoint equality as deterministic. Pagination/search and attachment validation reduce user friction and staff load.

How long it takes

Not specified in source files.

Urgent level

High — Tickets are in Box 1 top‑3 risks and require Box 2 API for full verification; UX fixes are recommended pre-launch.

4. Apply site-wide empty/loading states: Courses, Course detail, Tickets, Grades, Profile

Description

Implement consistent skeleton loaders and empty-state copy for the major student flows (courses list, course detail, tickets history, grades table, profile panels) and wire them to existing AJAX points and the LearnDash data fetches.

Why

Executive Summary highlights empty/loading states as quick wins that materially improve perceived performance and reduce user confusion; student page notes identify missing states across flows.

How long it takes

Not specified in source files.

Urgent level

High — Executive Summary lists this as a priority quick win.

5. Accessibility pass: focus management, ARIA labels, keyboard navigation, color contrast

Description

Run a focused accessibility remediation across student flows: ensure modals have focus traps and restore focus on close, convert non-semantic CTAs to buttons/links with ARIA, add aria-labels for key controls (support CTA, ticket actions), ensure focus outlines and color contrast meet WCAG guidance.

Why

The Box 1 dossier and page observations explicitly call out a11y improvements as necessary polish for launch readiness and to reduce support friction for keyboard and screen-reader users.

How long it takes

Not specified in source files.

Urgent level

High — recommended in the Executive Summary as a targeted launch polish.

6. Stabilize Course sample #3: investigate content/timing variance and add resilient waits/skeletons

Description

Investigate failing assertions for the course sample with 60% readiness, add robust client-side skeletons and server-resilience checks, and adjust automated waits/selectors in the harness to avoid flaky timing issues.

Why

Course sample #3 is explicitly flagged in the course detail observation and calibration baseline as lower readiness and likely caused by timing/content variance; stabilizing it reduces false negatives in QA and improves student experience for that sample.

How long it takes

Not specified in source files.

Urgent level

Medium — flagged in Box 1 as a localized issue; fix recommended but not blocking for Box 1 sign‑off.

7. Placement: add file-type/size hints + client validation + success/error toasts

Description

Add file type and size guidance near the resume upload control, implement client-side validation and a clear success/error toast pattern, and confirm server-side validation mirrors client rules.

Why

The Placement page and Box 1 both call out the need for upload validation and clearer UX to reduce failed uploads and support tickets.

How long it takes

Not specified in source files.

Urgent level

Medium — explicit action item in Box 1; improves submission quality though the overall flow is functional.

8. Login polish: password visibility, Forgot password, mobile RTL QA

Description

Add a password visibility toggle, include a prominent “Forgot password” link, and perform mobile RTL spacing and focus-state QA on the login form.

Why

Login observations and the dossier list these small UX items as polish required for a smooth first-use experience despite the flow being functionally stable.

How long it takes

Not specified in source files.

Urgent level

Medium — user-facing polish recommended pre-launch but not blocking.

9. Support: semantic CTA, identity prefill, SLA copy and fallback

Description

Replace non-semantic CTA with a proper link/button (keyboard accessible), add optional prefill via query params (user id/email) to the external form or embed, and add a short SLA/fallback mailto note to reduce duplicate tickets.

Why

Support observation recommends these changes to increase success rates when the external form is used and to reduce support churn when users can't access Google Forms.

How long it takes

Not specified in source files.

Urgent level

Medium — functional but improves reliability and accessibility.

10. Profile hub polish: add empty states and bind campaign placeholders to data

Description

Add explicit empty-state messaging and skeleton loaders for profile sub-tabs (group/course panels) and replace campaign placeholders with real data bindings or hide them until populated.

Why

Profile page observations call out campaign placeholders and missing empty-states that make the hub feel incomplete; addressing this reduces visual noise and cognitive load.

How long it takes to fix

Not specified in source files.

Urgent level

Low — polish work; not critical for Box 1 launch but recommended.

---

Notes

- This handoff uses only allowed inputs (capsule JSONs, Box1 archive docs, and student pages). No external data or assumptions were used.
- Time estimates are missing in source files; where absent we state “Not specified in source files.”

Completion

Created by merging capsule outputs and Box 1 canonical docs with student page observations, per the requested merging logic.
