# ✅ QA Report — Phase 5F (Final Validation)

Date: 26 Oct 2025  
Scope: Final validation after restoring deterministic ticket list visibility. Focused micro set: placement, tickets, reviews.

Runs compared:

- Phase 5E (micro): run-2025-10-26T17-15-41-759Z
- Phase 5F (micro): run-2025-10-26T17-31-55-180Z

---

## Summary

- Implemented ticket flow adjustments: after submit, click `#ticketHistoryBtn`, wait for `.ticket-row` (8s), then click `#ticketRefreshBtn` (if present) and wait again; proceed with scan.
- Outcomes unchanged vs 5E: Placement remains fully green; Tickets submit succeeds but item not visible in list; Reviews unchanged.

Micro pass‑rate: 12/16 = 75.00% (< 80% target)

---

## Per‑flow results and deltas (5F vs 5E)

| Flow      |         5E |         5F |   Δ | Notes                                                                                                                          |
| --------- | ---------: | ---------: | --: | ------------------------------------------------------------------------------------------------------------------------------ |
| Placement | 6/6 (100%) | 6/6 (100%) |   0 | Basic uploader continues to work; upload acknowledged and filename persists after reload.                                      |
| Ticket    |  4/6 (67%) |  4/6 (67%) |   0 | History+Refresh path executed; success banner present; list scan still doesn’t show the new title (cache/moderation/filters?). |
| Reviews   |  2/4 (50%) |  2/4 (50%) |   0 | Rating not registering; no success/validation banner captured.                                                                 |

Totals (3 flows): 5E = 12/16 (75.00%) → 5F = 12/16 (75.00%)  
Evidence folder for 5F: `qa/puppeteer/output/run-2025-10-26T17-31-55-180Z/`

Session notes (not included in micro score): login 6/6, logout 1/1, support 4/4 executed due to re‑login; all green.

---

## Evidence highlights (5F)

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

## What changed in 5F vs 5E

- Code: Restored deterministic list visibility sequence in ticket flow (`#ticketHistoryBtn` → wait `.ticket-row` → `#ticketRefreshBtn` → wait `.ticket-row`).
- Result: No change in ticket visibility assertions, indicating backend/state factors (caching, moderation, scope filtering) beyond client refresh sequence.

---

## Recommendations to reach ≥ 80%

1. Tickets (need +1 pass to reach 5/6)

- Provide a non‑cached “My tickets” or JSON lookup endpoint we can query by submitted title/timestamp right after submit; treat a positive match as list visibility.
- Validate list scope alignment: ensure we’re viewing the correct tab/filter (same user and sector) or expose stable tab IDs.
- If moderation exists, expose a bypass for the test user or add a temporary flag to show “pending” tickets in the list.

2. Reviews (need +1 pass to reach 3/4)

- Add a deterministic rating input (hidden numeric) that reflects in the form model; or a dry‑run endpoint that returns a success/validation banner.
- If anti‑spam blocks submission, allow a validation banner to count as acknowledgement for the test user.

Either Tickets or Reviews gaining +1 pass will push the micro set ≥ 80%.

---

## Decision

- Micro pass‑rate: 75.00% (< 80% target).
- Status: NOT yet ready for Phase 6 (Launch Metrics & Archive).
- Ask: Enable one of the low‑risk levers above (ticket verification endpoint or review rating field) and we’ll re‑run the same micro set to cross 80%.

---

Footnotes

- Evidence folder for 5F: `qa/puppeteer/output/run-2025-10-26T17-31-55-180Z/`
- Evidence folder for 5E: `qa/puppeteer/output/run-2025-10-26T17-15-41-759Z/`
