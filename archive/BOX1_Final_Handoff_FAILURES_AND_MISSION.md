```markdown
# BOX 1 — Final Handoff: FAILURES & MISSION UNTIL LAUNCH

Date: 2025-10-30 (calibration baseline)
Source documents (authoritative):

- archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md
- archive/QA_REPORT_FINAL_BOX1_EXPANDED.md
- archive/BOX1_Executive_Summary.md
- archive/BOX1_Phase_Evolution.md
- archive/BOX1_Evidence_Grid.md

Note: This file lists ONLY failures/attention items and the immediate mission derived from the five Box 1 source documents above. Wording is taken from or tightly paraphrased from those documents and attributed below each item.

---

## FAILURES (calibrated, per-source)

1. Courses (list) — incomplete UX readiness (67%)

- Failure: Missing empty-state and loading skeletons; mobile RTL spacing and gutters need adjustment; no basic search/sort implemented.
- Evidence/source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md (Courses: "needs empty-state and loader; normalize Hebrew labels; adjust mobile gutters") and archive/BOX1_Executive_Summary.md (Key risk #1: "Courses list at 67% — lacks empty-state and loader; minor RTL spacing on mobile; no search/sort").

2. Reviews — minimal MVP; validation and persistence deferred (67%)

- Failure: Review flow is an MVP single-field form with no nonce, missing validation and persistence; storage/moderation not implemented.
- Evidence/source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md (Reviews: "nonce/validation/persistence deferred") and archive/BOX1_Executive_Summary.md (Key risk #2: "Reviews at 67% — MVP email form only; missing nonce/validation/persistence").

3. Tickets — UI-level success; endpoint verification non-authoritative for student role (67%)

- Failure: While the UI shows form submit and row persistence after reload, admin-ajax endpoint equality checks are informational only for student scope; true equality/verification is not available in Box 1.
- Evidence/source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md (Tickets: "admin-ajax submit 200; row detected after reload. Endpoint equality checks logged but non-authoritative for student role") and archive/BOX1_Executive_Summary.md (Key risk #3: "Ticket endpoints informational by design (student scope)").

4. Course detail — one sample with content/timing variance (60% for one sample)

- Failure: One course sample exhibits timing/content variance leading to lower readiness for that sample (60%).
- Evidence/source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md (Course detail readiness: "86/86/86/60% (course-0/1/2/3)").

5. Accessibility & polish gaps (cross-cutting)

- Failure: Missing ARIA attributes/focus states, contrast issues, and several small UX polish items (password visibility toggle, 'Forgot password', attachment feedback, empty/caption states for tables) are outstanding across flows.
- Evidence/source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md (Design notes: "missing empty/loader states and a few accessibility touches (ARIA, focus, contrast)"), archive/BOX1_Executive_Summary.md ("Accessibility touches: focus outlines, aria-labels, and color-contrast fixes where noted").

6. Placement & Tickets micro‑UX items

- Failure: Placement flow lacks clear file-type/size hints; tickets lack improved attachment feedback, pagination/search, and clearer status chips.
- Evidence/source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md (Placement: "confirm file type/size hints"; Tickets: "improve attachment feedback and success/error toasts; add pagination/search and status chips").

7. Minor mobile/interaction polish on lessons

- Failure: Mobile experience for lessons missing sticky mobile actions (e.g., sticky "Mark Complete") and improved video defaults/transcript placement.
- Evidence/source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md (Lesson: "add sticky 'Mark Complete' on mobile; consider transcript/resources section and better video UX defaults").

---

## MISSION UNTIL LAUNCH (immediate, scoped, and sourced)

Purpose: Clear, actionable items that close Box 1 failures to a GO-with-minor-polish decision. Each mission item references the source doc(s) that justify it.

Priority A — Quick non-invasive fixes (can be deployed post-freeze with low risk)

1. Add empty/loading states and minimal skeletons for Courses list and Tickets history

- Action: Implement simple client-side placeholders/skeletons for the courses grid and tickets list; ensure loading copy/localized Hebrew strings. Verify behavior under slow network.
- Success criteria: Courses and Tickets show skeletons during load; visual flicker reduced; readiness moves off the 67% weak-spot. Source: archive/BOX1_Executive_Summary.md; archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md.

2. Reviews — add nonce + basic validation + simple persistence/thank-you state

- Action: Add a server-side nonce to the reviews form, basic server-side validation on submit, and a simple thank-you success state (client-side) while planning CPT storage in Box 2.
- Success criteria: Reviews form returns 200 with validated payload and shows a thank-you confirmation; logs show submission evidence in baseline runs. Source: archive/BOX1_Executive_Summary.md; archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md.

3. Accessibility quick wins

- Action: Add focus outlines, aria-labels on interactive CTAs (support CTA, course action buttons), and fix color contrast where noted in the dossier.
- Success criteria: Key interactive elements have ARIA-friendly labels and visible focus states; color contrast >= WCAG AA for flagged elements. Source: archive/BOX1_Executive_Summary.md; archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md.

Priority B — Small UX improvements (scheduled as near-term polish)

4. RTL/mobile spacing fixes and Hebrew label normalization

- Action: Adjust mobile gutters and spacing on the courses and lesson headers; normalize Hebrew labels on ribbons/CTAs.
- Success criteria: No RTL overflow on small viewports; ribbons/labels match content spec. Source: archive/BOX1_Executive_Summary.md; archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md.

5. Tickets micro‑UX (attachments, toasts, pagination/search)

- Action: Improve attachment upload feedback, add lightweight success/error toasts, and introduce pagination/search for the tickets list (simple client-side or server-assisted pagination if available).
- Success criteria: Attachment flow reports size/name and completion; toasts appear on submit; tickets list can be paged or searched. Source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md.

6. Placement file guidance

- Action: Add file-type and maximum-file-size guidance text near upload control and enforce basic client-side validation.
- Success criteria: Upload control shows hint; disallowed files are rejected with a clear message. Source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md.

Priority C — Tactical product/engineering handoff items (Box 2 dependency)

7. Deliver a student‑scoped verification API for tickets (Box 2)

- Action: Implement the front-end student-scoped API route that returns normalized verification for ticket creation/listing (cache-buster headers recommended). Once live, flip the diagnostic endpoint assertions from informational to blocking in QA.
- Success criteria: New API returns deterministic equality results for ticket verification; QA assertions switch to blocking checks and converge. Source: archive/BOX1_Executive_Summary.md; archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md; archive/BOX1_Phase_Evolution.md.

8. Course detail timing/content variance — triage sample

- Action: Identify the sample course with timing/content variance, capture reproducible steps, and either harden selectors/waits or normalize sample content to remove timing variability.
- Success criteria: The failing course sample returns to parity with other samples in baseline runs (readiness improves from 60% to match peers). Source: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md.

---

## How to use this handoff

- Owners: Product (reviews, tickets, courses), Engineering (front-end and a11y), QA (verify fixes in staging with the existing orchestrator). Use the frozen baseline runs as regression anchors (see Evidence Grid).
- Verification: Re-run the Puppeteer orchestrator (qa/puppeteer) after each Priority A/B fix and confirm changes in the three baseline assertions and coverage.json. For API-level mission (item 7), coordinate with Box 2 planning to flip the equality checks to blocking.

## Closing note

This handoff is strictly sourced from the five Box 1 documents listed at the top. It contains the calibrated failures and a minimal, actionable mission that will move the Student UI to full launch readiness or a controlled GO-with-minor-polish. For Box 2 work (API), see Box 2 kickoff notes in the phase reports.
```
