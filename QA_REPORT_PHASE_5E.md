# ✅ QA Report — Phase 5E (Validation Re‑run)

Date: 26 Oct 2025  
Scope: Validation re‑run after environment tweaks (ACF basic uploader enabled; deterministic ticket refresh control). Focused micro set: placement, tickets, reviews.

Runs compared:

- Phase 5D (micro): run-2025-10-26T15-59-52-515Z
- Phase 5E (micro): run-2025-10-26T17-15-41-759Z

---

## Summary

- Placement is fully green with the basic uploader enabled. Filename persistence verified across reload.
- Tickets submit path remains green, but the new ticket still doesn’t appear in list (likely cache/moderation or scope mismatch).
- Reviews form loads and inputs are present, but rating isn’t registering and no acknowledgement banner captured.

Micro pass‑rate: 12/16 = 75.00% (< 80% target)

---

## Per‑flow results and deltas (5E vs 5D)

| Flow      |        5D |         5E |   Δ | Notes                                                                                                                              |
| --------- | --------: | ---------: | --: | ---------------------------------------------------------------------------------------------------------------------------------- |
| Placement | 3/6 (50%) | 6/6 (100%) |  +3 | Basic uploader resolved file‑picker issue; upload acknowledged and filename persists after reload.                                 |
| Ticket    | 4/6 (67%) |  4/6 (67%) |   0 | Submit success banner present; list scan and post‑reload refresh still don’t show the new title (likely cache/moderation/filters). |
| Reviews   | 2/4 (50%) |  2/4 (50%) |   0 | Rating input not programmatically registering; no success or validation notice captured.                                           |

Totals (3 flows): 5D = 9/16 (56.25%) → 5E = 12/16 (75.00%)  
Evidence folder for 5E: `qa/puppeteer/output/run-2025-10-26T17-15-41-759Z/`

Session notes (not included in micro score): login 6/6, logout 1/1, support 4/4 executed due to one re‑login; all green.

---

## Evidence highlights (5E)

- Placement
  - Assertions (6/6): form present, related courses present, file input present, upload attempted, UI acknowledged (Hebrew file name and metadata), persists after reload.
  - Screens: `placement_upload.png`, `placement_body.png`
- Tickets
  - Assertions (4/6): title filled, content filled, submit clicked, submit success; fails: appears in list, persists after reload.
  - Screens: `tickets_page.png`, `tickets_filled.png`, `tickets_after_submit.png`, `ticket_body.png`
- Reviews
  - Assertions (2/4): form present, inputs present; fails: rating set, submit acknowledged.
  - Screens: `reviews.png`, `reviews_body.png`

---

## What changed in 5E vs 5D

- Environment: ACF basic uploader enabled on Placement; deterministic `#ticketRefreshBtn` available on Tickets.
- Result: Placement flipped to fully green; Tickets and Reviews unchanged in assert outcomes.

---

## Recommendations to reach ≥ 80%

1. Tickets (need +1 pass to reach 5/6)

- Verify whether the list is cached or moderated; if so, expose an un‑cached "My tickets" endpoint or add a server‑side bypass (e.g., cache‑busting query or AJAX list refresh hook) immediately after submit.
- Confirm that the list scope matches the submit scope (same user, same sector/filter). If the table defaults to a filtered view, switch automation to the "All"/"Mine" tab with a stable ID.
- Option: provide a lightweight JSON endpoint for newly created ticket lookup by title or timestamp for deterministic verification.

2. Reviews (need +1 pass to reach 3/4)

- Provide a deterministic rating input we can set directly (e.g., hidden numeric `input[name="rating"]` or a data‑bound field that reflects in the form model).
- If anti‑spam/nonce blocks submission, allow a validation banner to count as acknowledgement, or expose a staging form that accepts submissions from the test user.

With either Tickets or Reviews gaining +1 pass, the micro set reaches ≥ 80%.

---

## Decision

- Micro pass‑rate: 75.00% (< 80% target).
- Status: NOT yet ready for Phase 6 (Launch Metrics & Archive).
- Ask: Approve one of the quick levers above (ticket list verification endpoint/refresh bypass or review rating field) and we’ll re‑run the same micro set to cross 80%.

---

Footnotes

- Evidence folder for 5E: `qa/puppeteer/output/run-2025-10-26T17-15-41-759Z/`
- Evidence folder for 5D: `qa/puppeteer/output/run-2025-10-26T15-59-52-515Z/`
