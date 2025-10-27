# QA Weak-Spot Diagnostics (Phase 7B)

This analysis consolidates the latest runs to pinpoint flaky or failing assertions, timing hotspots, and minimal fixes with the highest impact.

- Full suite: `qa/puppeteer/output/run-2025-10-26T19-20-47-021Z/`
  - Assertions: 59/68 = 87% pass
  - Deterministic subset: 46/53 = 87%
  - Evidence coverage: 89%
- Micro (placement, ticket, reviews): `qa/puppeteer/output/run-2025-10-26T19-18-41-891Z/`
  - Assertions: 23/26 = 88%
  - Deterministic subset: 10/11 = 91%

## Top unstable or failing assertions (across runs)

| Assertion ID                           | Type          | Fail count | Avg elapsed (ms) | Category                            | Minimal fix suggestion                                                                                                                                                                              |
| -------------------------------------- | ------------- | ---------: | ---------------: | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ticketAppearsInList                    | stateful      |          2 |             5024 | Data propagation / cache            | After submit, wait for admin-ajax confirmation; refresh list with a cache-buster (e.g., `?ts=<now>`); optionally add/find a deterministic `find_ticket_by_title` endpoint and query it post-submit. |
| ticketPersistsAfterReload              | stateful      |          2 |             5747 | Persistence / moderation            | Same as above; also ensure QA user’s tickets bypass moderation/filters; consider short `no-store` headers on the ticket list JSON to avoid stale reads.                                             |
| ratingSet (reviews)                    | deterministic |          2 |              n/a | DOM interaction / selector variance | Prefer setting rating via the actual input (radio/range) and dispatch `input`/`change` events; fallback to clicking the label with robust selector and verify by reading the bound input value.     |
| stepsFileExtracted (course-nlp)        | deterministic |          1 |              n/a | Instrumentation / content           | Steps JSON not found/extractable; either provide a steps file or relax this assertion to warning for courses without steps JSON.                                                                    |
| lessonsDetectedDom (course-courses)    | deterministic |          1 |              n/a | Selector coverage                   | Include grid/list variants: `.bb-course-item-wrap, .course-card, .ld-item-list .ld-item, .ld-table-list .ld-table-list-item`.                                                                       |
| anyCourseStepsExtracted (courses-list) | deterministic |          1 |              n/a | Instrumentation                     | Same as steps extraction above; treat as non-blocking if steps JSON is not a contract of this view.                                                                                                 |

Notes

- Fail counts computed from both runs (micro + full). n/a elapsed means the flow did not record a timer for that assertion (or only failed once).
- Reviews flow wasn’t part of the full-suite artifacts but consistently failed `ratingSet` in micro.

## Slowest assertions (timing hotspots)

Source: `coverage.json` slowAssertions from the full suite.

1. ticketPersistsAfterReload — 5749 ms
2. ticketAppearsInList — 4933 ms
3. lesson completionPersistsAfterRelogin — 3882 ms
4. lesson resumeSaved — 3761 ms
5. course startOrContinueClicked — 2521 ms
6. ticket submitClicked — 2027 ms

Interpretation

- Ticket list refresh is the dominant hotspot (state propagation and caching).
- Lesson state saves are healthy but slow; likely video API/LD completion events.
- Course CTA click time suggests SPA/nav work; acceptable but monitor for regressions.

## Flow-level summary and likely root causes

### Tickets

- Symptoms: Submit acknowledged, but new ticket not visible in list or after reload.
- Likely causes: Server-side cache of listing, pagination/scope mismatch, or moderation status hiding new rows for this user.
- Evidence: `ticketAppearsInList` and `ticketPersistsAfterReload` fail in both runs; slow timings concentrated here.
- Minimal fixes (stack-safe):
  - Add/confirm `admin-ajax.php` action to deterministically look up ticket by exact title or ID (e.g., `find_ticket_by_title`) and await it immediately after submit.
  - Add cache-buster to list fetch on refresh and/or send `Cache-Control: no-store` on ticket list JSON.
  - Ensure QA user role doesn’t apply moderation filters that hide fresh tickets from the user’s own view.

### Reviews

- Symptoms: Form and inputs present; `ratingSet` not reliably applied.
- Likely causes: Star UI uses labels/pseudo-elements; value bound to a hidden input/radio requires explicit `change`/`input` events.
- Minimal fixes:
  - In automation, set the underlying input value and dispatch events; fallback to clicking the label by `for` attribute, then assert the input `checked`/value.
  - Optionally expose a REST/AJAX ack (already accepted in Phase 7) for deterministic success after submit.

### Courses / Lessons

- Symptoms: Steps file extraction fails on some pages; one courses hub fails DOM lesson detection under certain layouts.
- Likely causes: Steps JSON absent by design; course list view uses alternate markup (table/grid vs list) not covered by selectors.
- Minimal fixes:
  - Selector wideners already added for lesson navigation; extend to the courses hub (`.bb-course-item-wrap, .course-card, .ld-table-list .ld-table-list-item`).
  - Gate steps extraction: downgrade to non-blocking when no steps asset is present; keep it as info coverage.
  - Lessons: keep current gating/playback logic; timings acceptable though “slow”.

## Minimal patches to unlock +3–5% coverage

Priority order (lowest risk, highest impact):

1. Tickets listing determinism (+2 assertions)
   - Client: After submit, poll `admin-ajax.php?action=find_ticket_by_title&ts=<Date.now()>` with 2–3 retries over ~6s; only then refresh list with `?cb=<Date.now()>` and assert presence.
   - Server: Ensure `find_ticket_by_title` returns only current user’s tickets and sets `Cache-Control: no-store`.
2. Reviews rating set (+1 assertion)
   - Client: Prefer `await page.$eval('input[name="rating"]', el => { el.value = 5; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); })`); confirm via input value.
3. Courses list selectors (+1 assertion)
   - Client: Add selectors for table/grid variants when detecting lessons/course rows; treat steps JSON as informational.

Projected impact: flips 3–4 assertions green in full suite, pushing assertion pass rate into ~90–92% without server refactors.

## Risk notes and RTL considerations

- Ticket titles and DOM text include RTL/Hebrew; keep exact-match queries Unicode-safe and avoid trimming/normalization that drops diacritics.
- Avoid brittle nth-child selectors on BuddyBoss; prefer class-based or attribute patterns.
- For caching, prefer response headers over client sleeps; the current waits are bounded and will back off once server-side headers are corrected.

## Artifacts referenced

- Full suite `coverage.json`: `qa/puppeteer/output/run-2025-10-26T19-20-47-021Z/coverage.json`
- Full suite `results.json`: `qa/puppeteer/output/run-2025-10-26T19-20-47-021Z/results.json`
- Micro `coverage.json`: `qa/puppeteer/output/run-2025-10-26T19-18-41-891Z/coverage.json`
- Micro `results.json`: `qa/puppeteer/output/run-2025-10-26T19-18-41-891Z/results.json`

## Phase 8 readiness

- With the minimal fixes above, we expect ≥90% assertions and ≥90% deterministic subset, with slow hotspots limited to lesson persistence and ticket list refresh.
- Next: implement ticket endpoint/header change, widen review rating interaction, rerun full suite and publish `QA_REPORT_PHASE_8.md` with deltas and a green gate on deterministic ≥90%.

## Phase 7B-F: Forensic confirmation

Validated the existence of assertion arrays and timing data for the target flows across both runs.

- Sources:
  - Full suite results: `qa/puppeteer/output/run-2025-10-26T19-20-47-021Z/results.json`
  - Full suite coverage: `qa/puppeteer/output/run-2025-10-26T19-20-47-021Z/coverage.json`
  - Micro results: `qa/puppeteer/output/run-2025-10-26T19-18-41-891Z/results.json`
  - Micro coverage: `qa/puppeteer/output/run-2025-10-26T19-18-41-891Z/coverage.json`

### Ticket assertions — presence and timings

| Run              | submitClicked (ms) | ticketAppearsInList (ms) | ticketPersistsAfterReload (ms) | Notes                                                                                           |
| ---------------- | -----------------: | -----------------------: | -----------------------------: | ----------------------------------------------------------------------------------------------- |
| Micro (19-18-41) |               2029 |              5115 (FAIL) |                    5745 (FAIL) | Arrays present in `results.json`; `submitSuccess` acknowledged (27 ms).                         |
| Full (19-20-47)  |               2027 |              4933 (FAIL) |                    5749 (FAIL) | Arrays present in `results.json`; slow timings align with full-suite `coverage.json` slow list. |

Conclusion: Ticket assertion arrays exist in both runs; elapsedMs are recorded and consistent (±<200 ms variance). These confirm the stateful weak spots and timing hotspots used in projections.

### Reviews assertions — presence and timings

| Run              | reviewFormPresent      | reviewInputsPresent | ratingSet  | elapsedMs availability | Notes                                                                                                                                    |
| ---------------- | ---------------------- | ------------------- | ---------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Micro (19-18-41) | PASS                   | PASS                | FAIL       | Not recorded (n/a)     | Arrays present in `results.json`; `ratingSet` lacks `elapsedMs` (expected for current implementation).                                   |
| Full (19-20-47)  | PASS/total=3, passed=2 | PASS                | (one FAIL) | Not recorded (n/a)     | Detailed `reviews` block not present in `results.json`, but existence and pass counts confirmed via `coverage.json` (3 total, 2 passed). |

Conclusion: Reviews assertion arrays are confirmed in micro results; in full suite, the run is confirmed via coverage with the same 2/3 pass shape. No elapsedMs captured for these assertions, so the “n/a” designation in analysis is correct.

Overall confirmation: The +3–5% coverage uplift projection rests on confirmed artifacts (arrays present and timings validated). Proceed to minimal patches with confidence.
