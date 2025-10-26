# QA Summary — Phase 3B (Synthesis)

Run: run-2025-10-26T12-31-48-442Z  
Source defects: qa/puppeteer/output/DEFECTS.csv

## Defect Density per Flow

Actionable = Failed + Missing + Thin (excludes Duplicate). Totals include all types.

| Flow                       | Failed | Missing | Thin | Duplicate | Actionable | Total |
| -------------------------- | -----: | ------: | ---: | --------: | ---------: | ----: |
| course-3 (Member Courses)  |      4 |       1 |    0 |         7 |          5 |    12 |
| placement                  |      4 |       0 |    0 |         1 |          4 |     5 |
| course-0 (ChatGPT)         |      2 |       1 |    0 |         7 |          3 |    10 |
| course-1 (Digital AI)      |      2 |       1 |    0 |         7 |          3 |    10 |
| course-2 (NLP)             |      2 |       1 |    0 |         7 |          3 |    10 |
| courses-list               |      2 |       1 |    0 |         1 |          3 |     4 |
| reviews                    |      3 |       0 |    0 |         0 |          3 |     3 |
| ticket                     |      2 |       0 |    0 |         2 |          2 |     4 |
| grades                     |      2 |       0 |    0 |         1 |          2 |     3 |
| lesson (ChatGPT — שיעור 2) |      1 |       0 |    0 |         0 |          1 |     1 |
| login                      |      0 |       0 |    1 |         1 |          1 |     2 |
| logout                     |      0 |       0 |    1 |         0 |          1 |     1 |
| support                    |      0 |       0 |    0 |         1 |          0 |     1 |
| profile                    |      0 |       0 |    0 |         0 |          0 |     0 |

Totals:

- All defects: 66
- By type: Failed 24 (36%), Missing 5 (8%), Thin 2 (3%), Duplicate 35 (53%)
- Unique (non-duplicate): 31 (47%) vs Duplicates: 35 (53%)

## Top 5 Recurrent Issues

- navigatedToLesson — 8 occurrences (4 duplicate, 4 failed)
- stepsFileExtracted — 8 occurrences (4 duplicate, 4 failed)
- sidebarNavOk — 5 duplicates across support, placement, courses-list, ticket, grades
- persistence assertions (continue state) — 5 missing across courses and courses-list
- lessonsDetectedDom — 5 occurrences (4 duplicate, 1 failed in course-3)

Close contenders: lessonsDetectedText (4 duplicates), lessonsDetectedApprox (4 duplicates), submitClicked (2 duplicates).

## Coverage Gaps

- Courses & courses-list: No persistence/continue-state checks; failures to navigate into actual lesson pages; steps JSON not extracted.
- Placement: ACF File input workflow not detected/acknowledged; no persisted filename.
- Grades: DOM vs API count mismatch; schema stability not verified across reload.
- Reviews: Rating widget not set; submission not acknowledged; sidebar link missing.
- Auth evidence: login lacks loginVerified evidence item; logout lacks counts in items.

## Recommendations for Next Cycle

- Courses/lesson stabilization

  - Navigation: Use explicit first-lesson selector; wait for .ld-lesson/player; assert URL contains /lessons/.
  - Steps: Add fallbacks (window.course_steps, ldGlobal, data attributes); fetch via page.evaluate with credentials to handle nonce/gzip.
  - Persistence: Record current lesson slug and assert continue-state after reload; optionally validate LearnDash progress storage.

- Placement upload (ACF)

  - Unhide or target the real file input; programmatically upload (input.uploadFile); assert selected filename text and persistence after reload.

- Grades alignment

  - Exclude header rows in DOM count; validate schema keys (id, course, grade, date); confirm stability across reload.

- Reviews flow

  - Identify rating widget and set value; wait for confirmation banner; optionally avoid actual submit if moderated.

- Cross-cutting hygiene
  - Consolidate duplicate assertions (course assertions, sidebarNavOk, submitClicked) into helpers with consistent evidence capture.
  - Improve auth evidence coverage (mark loginVerified, include counts) to bring login/logout items to 100% in coverage.

---

This summary is synthesized from DEFECTS.csv for run run-2025-10-26T12-31-48-442Z. No flows were re-run.
