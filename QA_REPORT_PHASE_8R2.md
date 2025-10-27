# QA Report – Phase 8R2 (Release Validation + Endpoint Logging)

Date: 2025-10-27

Objective: Capture server responses for ticket lookups to validate equality vs inclusion and confirm endpoint scoping. Then re-run the suite and compare with Phase 8R.

What changed in this pass:

- Ticket flow now persists endpoint diagnostics into `flow_logs/`:
  - `ticket.find_ticket_by_title.json` — includes searchedTitle, attempts (GET/POST with cache-buster), HTTP status, and JSON body.
  - `ticket.get_ticket_titles.json` — includes searchedTitle, status, titles[], and flags: includesExact and includesPartial.
- No assertion logic changed; only added diagnostics. Deterministic/persistence checks remain identical.

Run info (fill after execution):

- Phase 8R2 output: qa/puppeteer/output/<runId>/
- Compared against: Phase 8R `qa/puppeteer/output/run-2025-10-27T11-12-54-720Z/`

Summary (post-run):

- Assertions overall: TBD
- Deterministic subset: TBD
- Evidence coverage: TBD

Tickets – stateful assertions (post-run):

- ticketAppearsInList: TBD (ms)
- ticketPersistsAfterReload: TBD (ms)

Endpoint diagnostics (expected artifacts in Phase 8R2 run folder):

- `flow_logs/ticket.find_ticket_by_title.json`
  - Verify that `details.found === true` when the title exactly matches the posted `searchedTitle` (UTF-8 / RTL safe).
- `flow_logs/ticket.get_ticket_titles.json`
  - Check `includesExact` vs `includesPartial` and inspect `titles[]` for normalization/trimming differences.

Readiness status: TBD after run (targets: ≥90% deterministic and overall assertions; ≥85% evidence).

How to run (example):

- Set environment variables: STAGING_URL, STUDENT_EMAIL, STUDENT_PASSWORD.
- Optional: focus on tickets first: `RUN_ONLY=ticket`
- Suggested timeout for full run: `PER_FLOW_TIMEOUT_MS=60000`

Artifacts to attach after run:

- `qa/puppeteer/output/<runId>/coverage.json`
- `qa/puppeteer/output/<runId>/results.json`
- `qa/puppeteer/output/<runId>/flow_logs/` (the two JSON diagnostics)

Notes:

- If `find_ticket_by_title` returns found=false while `get_ticket_titles` shows the title, confirm endpoint user scoping and caching headers server-side.
- If `includesPartial=true` but `includesExact=false`, consider normalizing title comparisons (trim, Unicode normalization) in the endpoint or adjusting the assertion to equality when server confirms exact match.

## Run results (ticket-only, 8R2)

Output folder: `qa/puppeteer/output/run-2025-10-27T11-33-43-908Z/`

### Endpoint diagnostics artifacts

ticket.find_ticket_by_title.json

```json
{
  "searchedTitle": "QA test ticket 1761564840697",
  "endpoint": "find_ticket_by_title",
  "base": "https://app.digitalschool.co.il/wp-admin/admin-ajax.php",
  "details": {
    "found": false,
    "attempts": [
      {
        "method": "GET",
        "url": "https://app.digitalschool.co.il/wp-admin/admin-ajax.php?action=find_ticket_by_title&title=QA+test+ticket+1761564840697&_=1761564845849-0",
        "status": 200,
        "data": { "found": false }
      },
      {
        "method": "GET",
        "url": "https://app.digitalschool.co.il/wp-admin/admin-ajax.php?action=find_ticket_by_title&title=QA+test+ticket+1761564840697&_=1761564846989-1",
        "status": 200,
        "data": { "found": false }
      },
      {
        "method": "GET",
        "url": "https://app.digitalschool.co.il/wp-admin/admin-ajax.php?action=find_ticket_by_title&title=QA+test+ticket+1761564840697&_=1761564848527-2",
        "status": 200,
        "data": { "found": false }
      }
    ]
  }
}
```

ticket.get_ticket_titles.json

```json
{
  "searchedTitle": "QA test ticket 1761564840697",
  "endpoint": "get_ticket_titles",
  "url": "https://app.digitalschool.co.il/wp-admin/admin-ajax.php?action=get_ticket_titles&_=1761564850567",
  "details": { "ok": false, "status": 400 }
}
```

### includesExact vs includesPartial

| Check                | Value                  |
| -------------------- | ---------------------- |
| find_ticket_by_title | found=false (HTTP 200) |
| get_ticket_titles    | N/A (HTTP 400)         |
| includesExact        | N/A                    |
| includesPartial      | N/A                    |

Observation:

- Endpoint `find_ticket_by_title` returned `found: false` for the exact posted title across three attempts (cache-busted GETs). No POST attempt was needed because responses were 200 with JSON.
- Endpoint `get_ticket_titles` returned HTTP 400 (no list available), so equality vs inclusion couldn’t be evaluated via this source.

## Phase 8R3 – proposed directive

Given the 8R2 findings, we should treat this as a server-side scoping/normalization issue; client assertions will prefer equality once the server returns correct data.

Server-side minimal patch (WordPress/BuddyBoss conventions):

- find_ticket_by_title:

  - Scope by current user (author) explicitly to ensure the just-created ticket is eligible.
  - Compare titles with Unicode normalization and trim: `normalize('NFC')`, `trim()`, and case-insensitive compare.
  - Accept both GET and POST; require and validate a nonce tied to the tickets page.
  - Add headers: `Cache-Control: no-store, no-cache, must-revalidate`.
  - Response JSON: `{ found: true, id, title }` on match; `{ found: false }` otherwise.

- get_ticket_titles:
  - Return 200 JSON for authenticated student with their own ticket titles: `{ titles: ["…"] }`.
  - Same nonce policy and `no-store` headers.

Client-side adjustments (after server fix):

- Ticket assertions: switch to strict equality check (exact match) against `find_ticket_by_title` response for determinism.
- Keep DOM inclusion as a secondary signal only when endpoint is unavailable.
- Pass nonce in both calls when available (read from a data-attribute or localized script object on the tickets page).

Acceptance for 8R3:

- Ticket-only run shows `find_ticket_by_title` -> `found: true` for the posted `searchedTitle`.
- `get_ticket_titles` responds 200 with titles including the exact new title (`includesExact=true`).
- With server fix in place, flip assertions to equality; rerun full suite aiming for ≥90% deterministic.
