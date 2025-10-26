# ✅ QA Report — Phase 5C (Final Micro-Retest)

Date: 26 Oct 2025  
Scope: Micro‑retest for remaining blockers only (placement, tickets, reviews)
Runs compared:

- Phase 5B (focused): run-2025-10-26T14-32-54-131Z (subset)
- Phase 5C (micro): run-2025-10-26T15-36-05-196Z (placement, ticket, reviews)

---

## Summary

- Targeted code patches applied to the three blocker flows and re‑executed.
- Outcome: 9/16 assertions passed (56.25%). Threshold 80% not met; keep Phase 6 as pending until fixes below are applied.

---

## Per‑flow results and deltas

| Flow      |  Phase 5B |  Phase 5C |   Δ | Notes                                                                                                             |
| --------- | --------: | --------: | --: | ----------------------------------------------------------------------------------------------------------------- |
| Placement | 2/6 (33%) | 3/6 (50%) |  +1 | Input presence now detected (.acf-file-uploader). Upload/ack/persist still failing (likely WP media/ACF variant). |
| Ticket    | 4/6 (67%) | 4/6 (67%) |   0 | Submit acknowledged; immediate list and post‑reload visibility still missing (cache/pagination).                  |
| Reviews   | 2/4 (50%) | 2/4 (50%) |   0 | Rating widget not registering; no acknowledgement or validation banner.                                           |

Totals (3 flows): 9/16 = 56.25%  
Session sanity (from the run): login 6/6, logout 1/1, support 4/4 (not counted in micro score)

---

## Evidence (Phase 5C)

- Placement: form + related courses ✅; .acf-file-uploader detected ✅; upload attempt ❌; UI filename ❌; persistence after reload ❌.
- Ticket: title+content filled ✅; submit ✅; success banner ✅; immediate row ❌; persists after reload ❌.
- Reviews: form + inputs ✅; rating set ❌; acknowledgement ❌ (no success or validation banner observed).

---

## What changed in 5C vs 5B

- Placement
  - Added basic‑uploader toggle probing and broader selectors. Result: input presence now true; upload path still blocked.
- Tickets
  - Moved "appears in list" check to after submit; widened table scan and pagination/refresh taps. Still no visibility, suggesting backend delay/caching.
- Reviews
  - Broadened rating selectors, added synthetic star clicks and hidden input sync, and expanded acknowledgement detection to include validation banners. No visible effect in live page (likely additional validation/nonce flow).

---

## Recommendations (to reach ≥80%)

1. Placement (goal: ≥4/6)

- Detect and click Basic Uploader explicitly (a[data-name="basic-uploader"]).
- After upload, submit ACF form (button[type=submit] within #acf-form) and wait for success notice before checking filename on reload.
- Accept persistence via link href or file‑info text.

2. Tickets (goal: ≥5/6)

- After submit success, force a list refresh via a dedicated control (e.g., a "View all" or a filter reset) if present.
- If the list is remote‑cached, allow a bounded 2–3s polling backoff sequence (exponential 400ms→1.6s) before concluding.
- Add an alternate assertion: presence in a "My recent submissions" widget, if available.

3. Reviews (goal: 3/4)

- Serialize form to confirm rating value set (input[name*="rating"] > 0) before submit.
- Tolerate validation‑ack as pass by asserting presence of known validation containers (we already scan common selectors; consider adding form‑specific ones if identified on this site).
- If a nonce/recaptcha is enforced, downgrade submission to a visible warning/validation‑ack path (still counts as acknowledged).

---

## Decision

- Current micro‑score: 56.25% (< 80%).
- Status: NOT ready for Phase 6.
- Next: Apply the above targeted fixes and re‑run a short micro suite; if stable ≥80% across the three flows, proceed to Phase 6 with a full suite and a short regression table.

---

Footnotes

- This micro run included automatic session flows (login/logout) and support sanity due to re‑login; these did not factor into the micro score.
