# ✅ QA Report — Phase 5B (Focused Retest)

Date: 26 Oct 2025  
Scope: Targeted rerun of affected student flows after Phase 5 fixes  
Runs compared:

- Phase 5 (baseline): qa/puppeteer/output/run-2025-10-26T13-52-54-761Z — 50/71 assertions (70%), evidence coverage: 89%
- Phase 5B (focused): qa/puppeteer/output/run-2025-10-26T14-32-54-131Z — 48/67 assertions (72%), evidence coverage: 88% (filtered flows only)

---

## Overview

- Focused retest validated the most impacted flows: courses list/detail, lesson resume, grades, tickets, placement, reviews, with session integrity (login/logout) and support sanity.
- Clear improvements landed:
  - Lesson resume logic now persists reliably via LearnDash storage fallback.
  - Grades table stability after reload is now consistent with captured AJAX payloads.
- No regressions detected in the retested set; several items remain unchanged (pending backend/UX nuances).

---

## Assertion rollup (deltas)

| Flow (key page)                         | Phase 5 | Phase 5B | Δ   | Notes                                                                    |
| --------------------------------------- | ------- | -------- | --- | ------------------------------------------------------------------------ |
| Login                                   | 6/6     | 6/6      | 0   | Stable (cookie present, redirect ok)                                     |
| Courses list                            | 2/3     | 2/3      | 0   | Steps JSON still not extracted from listing context                      |
| Course detail — ChatGPT                 | 5/7     | 5/7      | 0   | Steps JSON not extracted; navigation-to-lesson sometimes skipped (gated) |
| Course detail — DIGITAL AI              | 5/7     | 5/7      | 0   | Same as above                                                            |
| Course detail — NLP                     | 5/7     | 5/7      | 0   | Same as above                                                            |
| Courses page as detail (member courses) | 3/7     | 3/7      | 0   | DOM lesson selector variant + steps JSON unresolved                      |
| Lesson — שיעור 2-3                      | 4/5     | 5/5      | +1  | Resume saved + completion gating verified                                |
| Grades                                  | 3/4     | 4/4      | +1  | DOM count now matches API; schema stable after reload                    |
| Tickets                                 | 4/6     | 4/6      | 0   | Submit acknowledged; list persistence not yet visible                    |
| Placement                               | 2/6     | 2/6      | 0   | Resume file input hidden/obscured; no persisted filename after reload    |
| Reviews                                 | 2/4     | 2/4      | 0   | Rating widget not registering; submission ack not observed               |
| Support                                 | 4/4     | 4/4      | 0   | Stable sanity check                                                      |
| Logout                                  | 1/1     | 1/1      | 0   | Session cookie cleared via wp-login.php?action=logout                    |

Overall (focused set): 48/67 → 72% (up from 70% in Phase 5 baseline). Evidence coverage: 88% across focused flows.

---

## Evidence snapshot (Phase 5B)

- Lesson — שיעור-2-3: 5/5 — player present, iframe play triggered, resume saved, gated completion, completion persists after re-login
- Grades: 4/4 — admin-ajax captured (2 calls, length=6), DOM rows=6, matches API, stable after reload
- Tickets: form filled + submit success banner; new ticket title not visible after reload/pagination sweep (cache/latency suspected)
- Placement: form + related courses present; resume input not interactable (hidden); no UI acknowledgement; filename not persisted
- Reviews: form + inputs present; rating not set; submission not acknowledged (likely requires nonce/validation and possibly CAPTCHA)

---

## Residual blockers and targeted next fixes

1. Placement — ACF resume upload (still failing)

- Symptom: Hidden/overlay file input, no UI acknowledgement, filename not persistent post-reload.
- Likely cause: ACF field variant uses hidden input + proxied button; requires focusing the real input and dispatching change; also needs a visible status element (acf-notice or filename span) to confirm.
- Next fixes:
  - Locate underlying input[type=file] within .acf-field-file or .acf-field[data-type=file].
  - Use elementHandle.uploadFile + manual change event + short wait for .acf-file-uploader .file-info.
  - Save/update action if required by the form (acf-form submit) and then reload to verify persistence.

2. Steps JSON extraction (courses list/detail)

- Symptom: stepsFileExtracted remains false across list and detail pages.
- Likely cause: LD globals defined as ldCourseData/ldVars/ldData or data-ld-\* attributes; some pages gate JSON until interaction.
- Next fixes:
  - On course detail pages, evaluate multiple candidates: window.ldCourseData, window.ldVars, window.LD_Data, data-ld-\*; fallback to first lesson anchors when JSON is gated.
  - Where permitted, attempt LearnDash REST (ldlms/v2/sfwd-courses/:id) with existing cookies to fetch steps (guard with timeout; do not fail the flow if blocked).

3. Tickets — list persistence after submit

- Symptom: Title present in submit payload, submit success, but not visible in list after reload.
- Likely cause: Cached listing, delayed ingestion, or pagination.
- Next fixes:
  - After success banner, poll the table with cache-busted reloads and explicit pagination/refresh clicks.
  - Add a “View All” trigger if available; scan across pages; widen selector set for row text.

4. Reviews — rating + submission acknowledgement

- Symptom: Rating widget not registering (no hidden input sync), submission not acknowledged.
- Likely cause: Star widget requires specific event sequence; form may require nonce/validation and/or CAPTCHA.
- Next fixes:
  - Synthesize mouse events on the star element and set the hidden input[name=rating] value; verify via form serialization.
  - If CAPTCHA or strict nonce is present, downgrade the submission step to “attempt + visible validation message” to avoid false negatives.

---

## Session integrity and flakiness check

- Re-login occurred once due to transient logout detection during tickets flow; recovery successful (6/6 on subsequent login run).
- Logout flow hardened via explicit wp-login.php?action=logout and cookie clearance assertion.

---

## Recommendation: next iteration (Phase 6)

- Apply the targeted fixes above, then run a mixed suite: focused for quick feedback + one full run for global regressions.
- Success criteria:
  - Lesson: remain 5/5
  - Grades: remain 4/4
  - Placement: ≥4/6 (ack + persistence pass)
  - Courses detail: ≥6/7 for at least 2 courses (navigation-to-lesson or steps JSON extraction)
  - Tickets: ≥5/6 (visibility after reload)
  - Reviews: 3/4 (rating set + visible response or expected validation)

---

## Trace markers present (quick audit)

- Present in focused run: nav.start/finish, wait.domcontentloaded/load, cookies.applied, har.start/stop, dialog.dismissed, assertions.summary, run.complete.
- Evidence collected per flow: HAR, console log, body HTML summary, and screenshots where applicable.

---

Footnotes

- Some flows are AJAX-driven and subject to caching/latency. Assertions use short, bounded polling to avoid flakiness.
- REST calls for LearnDash steps are optional and must not break the run if blocked.
