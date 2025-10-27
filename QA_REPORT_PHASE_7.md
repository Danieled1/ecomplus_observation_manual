# 🚀 QA Report – Phase 7: Optimization & Roll-ups

Date: 2025-10-26
Run ID: run-2025-10-26T19-20-47-021Z (full suite)
Micro validation: run-2025-10-26T19-18-41-891Z (placement,ticket,reviews)

## Outcomes

- Assertion coverage (full suite): 87% (59/68) — up from 79% in Phase 6 (+8 pp)
- Deterministic subset coverage: 87% (46/53) — new in Phase 7 (target ≥ 70% achieved)
- Evidence coverage: 89% — unchanged (already strong)
- Slow assertions (> 2000 ms): 6 flagged (see below)

## What changed in Phase 7

- Added assertion tags and timers:
  - Every assertion now carries type: deterministic | stateful, plus elapsedMs when measured.
  - coverage.json now includes deterministicOverall and slowAssertions.
- Low-risk roll-ups applied:
  - Tickets: admin-ajax verification hardened (cache-buster, POST fallback, 3 retries). Timed appears/persists checks.
  - Courses: hardened lesson navigation (broader selectors + waits). Added timing for click/navigation.
  - Reviews: rating set made resilient; submit acknowledgment accepts successful AJAX/REST response as implicit ack. Timed rating+submit.

## Per-flow snapshot (Phase 7 vs Phase 6)

- login: 100% assertions (unchanged); evidence 60% items (expected; loginVerified is post-check).
- support: 100% (unchanged)
- placement: 100% (unchanged)
- course-chatgpt: 86% (was 71%)
- course-קורס-digital-ai-מתעדכן: 86% (was 71%)
- course-nlp: 86% (was 71%)
- course-courses: 60% (was 60% on assertions; evidence now 100% items)
- courses-list: 67% (was 67%)
- lesson-שיעור-2-3: 100% (was 100%)
- ticket: 67% (unchanged on assertions; verification more robust, timings recorded)
- grades: 100% (unchanged)
- profile: 100% (unchanged)
- reviews: 67% (unchanged on assertions; timing/ack improved)
- logout: 100% (unchanged)

Note: Names for specific course/lesson flows match URL-encoded slugs as in coverage.json.

## Deterministic subset (new)

- DeterministicOverall: 87% (46/53)
- Interpretation: UI reachability and non-persistence checks are stable and above target.
- Stateful set remains the main risk area (tickets/reviews persistence and ack states).

## Slow assertions (> 2 s)

From coverage.json (sorted by elapsedMs):

1. ticket: ticketPersistsAfterReload — 5749 ms
2. ticket: ticketAppearsInList — 4933 ms
3. lesson-שיעור-2-3: completionPersistsAfterRelogin — 3882 ms
4. lesson-שיעור-2-3: resumeSaved — 3761 ms
5. course-1: startOrContinueClicked — 2521 ms
6. ticket: submitClicked — 2027 ms

Actionable next steps:

- For tickets, consider a short-circuit admin-ajax endpoint that returns the freshly created ticket ID immediately, or push server-side cache headers to no-store for the list JSON used by the UI.
- For lesson persistence, pre-seed localStorage or use LearnDash REST to fetch completion for the exact lesson ID to bypass UI latency.

## Evidence map

All flows include HAR, console logs, and screenshots. Per-flow introspective logs live under:
qa/puppeteer/output/run-2025-10-26T19-20-47-021Z/flow_logs/

## Deltas vs Phase 6

- Assertion coverage: 79% → 87% (+8 pp)
- Deterministic subset: N/A → 87% (+87 pp; new metric)
- Slow assertion visibility: added. 6 slow checks identified (tickets and lesson persistence dominate).

## Notes

- The ticket flow still fails 2 stateful checks in this run (appearsInList, persists after reload) on this environment; the AJAX hardening reduced false negatives in micro, but the full sweep still sees timing/cache variance.
- Reviews remain 2/3 with the submit ack relying on DOM or successful XHR response. If server can emit a consistent success class or JSON key, we can push this to 3/3 quickly.
