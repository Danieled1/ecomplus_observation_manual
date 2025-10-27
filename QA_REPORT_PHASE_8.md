# QA Report – Phase 8 (Launch Metrics)

Date: 2025-10-26
Runs compared:

- Previous full suite (Phase 7): `qa/puppeteer/output/run-2025-10-26T19-20-47-021Z/`
- Current full suite (Phase 8): `qa/puppeteer/output/run-2025-10-26T19-57-51-203Z/`

## Summary

- Assertions overall: 59/68 = 87% (no change)
- Deterministic subset: 46/53 = 87% (no change)
- Evidence coverage: 89% (no change)

Observation: Client-side minimal patches were applied (ticket refresh/warm-up, reviews rating event dispatch). Coverage did not improve due to persistent server-side determinism gaps on tickets listing. Reviews remained 2/3 passing, indicating the target rating input on the live page likely does not bind via the inspected selectors (requires page-specific selector or server-side form config check).

## Deltas

| Metric               |     Phase 7 |     Phase 8 |   Δ |
| -------------------- | ----------: | ----------: | --: |
| Assertions passed    | 59/68 (87%) | 59/68 (87%) |   0 |
| Deterministic passed | 46/53 (87%) | 46/53 (87%) |   0 |
| Evidence coverage    |         89% |         89% |   0 |

Slow assertions (Phase 8):

- ticketPersistsAfterReload — 11719 ms (was 5749 ms)
- ticketAppearsInList — 5536 ms (was 4933 ms)
- lesson completionPersistsAfterRelogin — 4007 ms (was 3882 ms)
- lesson resumeSaved — 2852 ms (was 3761 ms)
- course startOrContinueClicked — 2501 ms (was 2521 ms)
- ticket submitClicked — 2026 ms (was 2027 ms)

## Flow notes

- Tickets

  - Still failing: `ticketAppearsInList`, `ticketPersistsAfterReload`.
  - Client patch added: unconditional refresh click, Hebrew refresh text clicks, admin-ajax warm up (`get_ticket_titles`), persistence check via JSON in polling loop.
  - Root cause remains server-side: either listing cache/moderation or endpoint not deployed. Expect flips to PASS once `find_ticket_by_title` and `no-store` cache headers are live.

- Reviews

  - `ratingSet` still failing: page likely uses a rating widget without exposed input matching `name*="rating"` or requires widget-specific events. We now dispatch input/change broadly; next step is a page-specific selector mapping or verifying form structure.

- Lessons/Courses
  - Stable; minor timing shifts within normal variance.

## Readiness

- Deterministic: 87% (target ≥90%).
- Assertions overall: 87% (target ≥90%).
- Evidence coverage: 89% (meets ≥85%).

Status: Conditional Ready — pending server-side ticket determinism.

## Minimal actions to achieve ≥90%

1. Tickets

   - Deploy `admin-ajax.php` action: `find_ticket_by_title`
   - Ensure response includes `{ found: true }` for the current user’s ticket; set `Cache-Control: no-store`
   - Optionally extend `get_ticket_titles` to set `no-store`

2. Reviews

   - Confirm the rating widget markup; expose/confirm an underlying input (radio/range/number) or add a hidden field bound to chosen rating. Alternatively, provide a form-specific selector hint in the QA config.

3. Courses hub (optional)
   - If desired, mark steps extraction as informational only where no JSON is expected (already non-blocking in coverage goals).

## Next

- After deploying ticket endpoint/headers and (optionally) rating input binding, re-run full suite and update this report. Target expectation: +3–4 assertions to green → ~90–92% overall/deterministic.
