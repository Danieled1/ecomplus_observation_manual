# ✅ QA Report — Phase 5D (Final Micro‑Fix Loop)

Date: 26 Oct 2025  
Scope: Apply targeted micro‑fixes to remaining blockers (placement, tickets, reviews) and re‑test only these flows.
Runs compared:

- Phase 5C (micro): run-2025-10-26T15-36-05-196Z
- Phase 5D (micro): run-2025-10-26T15-59-52-515Z

---

## Summary

- Implemented 5C recommendations and re‑ran the three flows.
- Outcome: No change in assertion totals vs 5C. Micro pass‑rate remains 9/16 = 56.25% (< 80%).

---

## Per‑flow results and deltas (5D vs 5C)

| Flow      |        5C |        5D |   Δ | Notes                                                                                                                         |
| --------- | --------: | --------: | --: | ----------------------------------------------------------------------------------------------------------------------------- |
| Placement | 3/6 (50%) | 3/6 (50%) |   0 | `.acf-file-uploader` detected; basic‑uploader probe executed; form submit attempted; no upload ack or persistence visible.    |
| Ticket    | 4/6 (67%) | 4/6 (67%) |   0 | Success banner present; immediate row and post‑reload/pagination scans still don’t show the new title (likely cache/latency). |
| Reviews   | 2/4 (50%) | 2/4 (50%) |   0 | Rating still not registering; no success or validation banners captured.                                                      |

Totals (3 flows): 9/16 = 56.25%

Session notes: login 6/6, logout 1/1, support 4/4 executed due to re‑login; not counted in micro score.

---

## What we changed in 5D

- Placement: submit `#acf-form` after upload attempt; capture ACF/feedback notices; re‑check persistence after reload.
- Tickets: exponential backoff on reload; click “View All”/pagination by text; row‑scan improved.
- Reviews: prefill common required fields (name, email, message); broaden validation/notice capture.

Result: Live behavior appears gated by backend/UI constraints (ACF media workflow, list cache/ingestion delay, review form validation/nonce), so front‑end automation didn’t flip the remaining assertions.

---

## Recommendations to reach ≥ 80%

1. Placement (target ≥ 4/6)

- Ensure the file field exposes a true basic uploader in this environment (ACF setting). Without it, headless cannot pass the OS file picker. Alternatively, provide a non‑JS fallback endpoint for file POST.
- After enabling basic uploader, the current script will upload, submit, and verify filename persistence.

2. Tickets (target ≥ 5/6)

- Confirm whether the listing is cached or moderated; expose a non‑cached “My tickets” endpoint or a client‑side refresh hook we can trigger after submit.
- Provide a predictable “View All” or “Refresh” control with an ID/selector for deterministic clicks.

3. Reviews (target 3/4)

- If form is Gravity/WPCF7 with nonce/anti‑spam, allow a validation banner (or a dedicated dry‑run endpoint) to serve as acknowledgement without sending live data.
- Expose a deterministic rating input (hidden or numeric) we can set programmatically.

---

## Decision

- Micro pass‑rate still 56.25% (< 80%).
- Status: NOT ready for Phase 6 (Launch Metrics & Archive).
- Ask: Approve the minor environment/config adjustments above (basic uploader toggle; refresh control; review validation acceptance) or provide a staging form variant to validate the remaining assertions without live side effects.

---

Footnotes

- Evidence folder for 5D: `qa/puppeteer/output/run-2025-10-26T15-59-52-515Z/`
- If you enable the ACF basic uploader on placement and confirm, we can re‑run just that flow to close the gap quickly.
