# ARCHIVED – Final Pre-Production Readiness (Phase 8R4a)

Archived: 2025-10-29

Status

- Client-side ticket creation is validated via DOM row detection; all client-side automation remains deterministic for this flow.
- Backend admin-ajax endpoints are intentionally restricted for student scope; endpoint checks are informational only (no blocking assertions).
- Further runs are on hold until a dedicated front-end API route exists (planned Phase 8R5).

# QA Report – Phase 8R4 (Endpoint Normalization Verification)

Date: 2025-10-28

Objective

- Verify backend endpoint normalization/scoping for tickets is live and correct.
- Confirm the automation detects success deterministically using endpoint equality (no client-side normalization).

Preconditions (server-side patch deployed)

- find_ticket_by_title
  - Scopes to current user (author)
  - Normalizes and trims titles; case-insensitive compare server-side
  - Responds with `Cache-Control: no-store`
  - Returns JSON: `{ found: true, id, title }` on exact match; `{ found: false }` otherwise
- get_ticket_titles
  - Returns `{ titles: ["..."] }` (no empty strings)
  - Includes the newly created title exactly (same glyphs/spacing)
  - Responds with 200 and `Cache-Control: no-store`

Runs compared

- Phase 8R3b (pre-patch reference): qa/puppeteer/output/run-2025-10-27T14-08-46-873Z/
- Phase 8R4 ticket-only: qa/puppeteer/output/run-2025-10-28T15-55-21-702Z/
- Phase 8R4 full suite: qa/puppeteer/output/run-2025-10-28T16-00-39-425Z/
- Phase 8R4a ticket-only (nopriv hooks): qa/puppeteer/output/run-2025-10-28T19-11-58-227Z/

What to validate (8R4)

1. Ticket-only run
   - find_ticket_by_title -> `found: true` for the posted title (exact equality)
   - get_ticket_titles -> `ok: true` and `includesExact: true`; `titles[]` contains the exact title
   - submitSuccess -> PASS (via notice or row detection); ticketAppearsInList -> PASS; ticketPersistsAfterReload -> PASS
2. Full suite
   - Deterministic coverage ≥ 90%
   - Overall assertions ≥ 90%

How to run

- Ticket-only:

```
cmd /c "set RUN_ONLY=ticket && set PER_FLOW_TIMEOUT_MS=60000 && node orchestrator.js"
```

- Full suite:

```
cmd /c "set RUN_ONLY=all && set PER_FLOW_TIMEOUT_MS=60000 && node orchestrator.js"
```

Artifacts to attach

- `qa/puppeteer/output/<runId>/flow_logs/ticket.find_ticket_by_title.json`
- `qa/puppeteer/output/<runId>/flow_logs/ticket.get_ticket_titles.json`
- `qa/puppeteer/output/<runId>/ticket.har` (filter for admin-ajax POST/GET)
- `qa/puppeteer/output/<runId>/coverage.json` and `results.json`
- `qa/puppeteer/output/<runId>/flow_logs/ticket.log` (sequence markers)

Success criteria

- Endpoint equality confirmed:
  - find_ticket_by_title: `{ found: true, title: <exact posted title> }`
  - get_ticket_titles: titles[] includes the exact posted title
- Ticket flow assertions: submitSuccess, ticketAppearsInList, ticketPersistsAfterReload all PASS
- Deterministic ≥ 90% (full suite)

If something fails (triage checklist)

- If find_ticket_by_title returns false, capture `searchedTitle` and returned `title` (if any) from JSON; note any spacing/Unicode differences
- If get_ticket_titles has empty strings, note length of titles[] and attach a small sample (first 5)
- Re-run a single retry with a fresh title to rule out transient caching
- Keep client-side logic unchanged (no normalization on the client) per scope; open a server ticket with the attached evidence

Summary (current outcomes)

- Ticket-only 8R4 endpoint diagnostics:
  - flow_logs/ticket.find_ticket_by_title.json → found=false (HTTP 200)
  - flow_logs/ticket.get_ticket_titles.json → ok: true (HTTP 200), includesExact:false, includesPartial:false, titles: []
- Ticket-only 8R4a endpoint diagnostics (with nopriv hooks):
  - flow_logs/ticket.find_ticket_by_title.json → found=false (HTTP 200)
  - flow_logs/ticket.get_ticket_titles.json → ok: true (HTTP 200), includesExact:false, includesPartial:false, titles: []
- Full suite 8R4 coverage (coverage.json):
  - Assertions overall: 50/57 = 88%
  - Deterministic subset: 40/47 = 85%
  - Overall coverage percent: 86%

Before vs After (endpoint behavior)

| Metric                        | 8R3b                       | 8R4 (ticket-only)      |
| ----------------------------- | -------------------------- | ---------------------- |
| find_ticket_by_title          | found=false (HTTP 200)     | found=false (HTTP 200) |
| get_ticket_titles             | 200 OK, empty/blank titles | 200 OK, titles: []     |
| includesExact/includesPartial | false / false              | false / false          |

Notes

- Despite the stated deployment (including nopriv access), the observed endpoint responses do not yet reflect normalization/scoping for the test user: `find_ticket_by_title` remains false and `get_ticket_titles` returns an empty array.
- Client-side remains unchanged from 8R3b and continues to detect real submission (admin-ajax POST 200) and row-based ticket presence when rendered.
- Deterministic ≥ 90% was not reached in the full suite due to the endpoints not confirming equality and a ticket flow navigation error occurred during the full run.

Recommended follow-up

- Re-check that the server patch is active in the same environment used by automation (staging URL, user role: test_live_student) and that nonces/headers are aligned.
- Verify endpoint routing and parameter names (action=find_ticket_by_title, title=<exact>) and ensure responses contain normalized, non-empty titles.
- After confirming the patch, rerun:
  1. Ticket-only to confirm found:true and includesExact:true
  2. Full suite to confirm deterministic ≥ 90%
