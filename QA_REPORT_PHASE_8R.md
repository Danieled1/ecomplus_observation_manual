# QA Report – Phase 8R (Release Validation)

Date: 2025-10-27

Runs compared:

- Phase 8 (before server change): `qa/puppeteer/output/run-2025-10-26T19-57-51-203Z/`
- Phase 8R (after server change + UI readiness wait): `qa/puppeteer/output/run-2025-10-27T11-12-54-720Z/`

## Summary

- Assertions overall: 59/68 = 87% → 59/68 = 87% (Δ 0)
- Deterministic subset: 46/53 = 87% → 46/53 = 87% (Δ 0)
- Evidence coverage: 89% → 89% (Δ 0)

Observation: Despite the environment update (find_ticket_by_title + no-store) and the restored UI readiness wait, coverage did not change in this run. Ticket list assertions remain failing in the current environment.

## Tickets – stateful assertions

| Assertion                 |        Phase 8 |       Phase 8R | Note                                          |
| ------------------------- | -------------: | -------------: | --------------------------------------------- |
| ticketAppearsInList       |  FAIL (4933ms) |  FAIL (6512ms) | Still not visible post-submit. Timing varied. |
| ticketPersistsAfterReload | FAIL (11719ms) | FAIL (12084ms) | Persistence still not verified.               |

Client changes in 8R:

- Before assertions, click `#createTicketBtn` and wait for `select[name="acf[field_65f06082a4add]"]` to ensure ACF form visibility.
- Kept AJAX verification via `find_ticket_by_title` and warmed list via `get_ticket_titles` during persistence polling.

Server change claim:

- `find_ticket_by_title` deployed with `Cache-Control: no-store`.

Interpretation:

- In this run, the stateful checks still failed. Possible causes:
  - The ticket is created, but the title matching (Unicode/RTL or trimming) doesn’t align with list rendering.
  - The listing UI may paginate or filter out the newest item for this role.
  - Endpoint permissions or user scoping may still exclude the created ticket.

## Reviews

- ratingSet remains failing (2/3 passed overall for reviews) — likely a page-specific widget binding that doesn’t expose a standard input or requires a selector hint.

## Slow assertions (Phase 8R)

- ticketPersistsAfterReload — 12084 ms (Phase 8: 11719 ms)
- ticketAppearsInList — 6512 ms (Phase 8: 5536 ms)
- lesson completionPersistsAfterRelogin — 4433 ms (Phase 8: 4007 ms)
- lesson resumeSaved — 3913 ms (Phase 8: 2852 ms)
- course startOrContinueClicked — 2069–2847 ms

## Readiness status

- Deterministic coverage: 87% (target ≥ 90%)
- Overall assertions: 87% (target ≥ 90%)
- Evidence coverage: 89% (target ≥ 85%)

Status: Not Ready for Launch (deterministic < 90%).

## Recommended final checks

1. Tickets

   - Validate endpoint returns `found: true` for the exact posted title (UTF-8; no normalization differences). Check equality vs contains.
   - Confirm endpoint response includes the created ticket for `test_live_student` role.
   - Ensure the listing page shows the user’s own tickets regardless of moderation; and that the freshly created ticket is within the current page.
   - Optionally log the `find_ticket_by_title` JSON into `flow_logs` for inspection.

2. Reviews

   - Capture the exact rating widget DOM of the page to add a page-specific selector map (e.g., data-widget attributes or dynamic ID root) and set the backing input accordingly.

3. Optional: add a very short post-submit poll (2–3 attempts total) to refetch `find_ticket_by_title` with backoff before falling back to DOM-only scan.

## Artifacts

- 8R coverage: `qa/puppeteer/output/run-2025-10-27T11-12-54-720Z/coverage.json`
- 8 coverage: `qa/puppeteer/output/run-2025-10-26T19-57-51-203Z/coverage.json`
- Reports retained: `QA_REPORT_PHASE_8.md`, `QA_WEAKSPOT_ANALYSIS.md`
