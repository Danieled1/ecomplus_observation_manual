# Box 1 — Evidence Grid (Calibration Baseline Index)

Date: 2025-10-30
Purpose: Visual index of baseline evidence for each student flow (no filenames expanded inline). Counts are per flow across the three calibration runs; some flows include additional screenshots per variant.
Source of truth: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md

Notes

- Environment is frozen; no new runs. Baseline runs:
  - qa/puppeteer/output/run-2025-10-29T13-27-32-575Z/
  - qa/puppeteer/output/run-2025-10-29T13-32-29-280Z/
  - qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/
- Typical per-flow baseline artifacts per run: 1× HAR, 1× console log, 1× screenshot. Course detail has multiple course samples and thus multiple screenshots/records per run.

## Grid

| Flow                    | Readiness    | HARs (3 runs) | Console logs (3 runs) | Screenshots (3 runs) |
| ----------------------- | ------------ | ------------- | --------------------- | -------------------- |
| Login                   | 100%         | 3             | 3                     | 3                    |
| Dashboard/Profile       | 100%         | 3             | 3                     | 3+                   |
| Courses (list)          | 67%          | 3             | 3                     | 3                    |
| Course detail (0/1/2/3) | 86/86/86/60% | 12+           | 12+                   | 12+                  |
| Lesson                  | 100%         | 3             | 3                     | 3                    |
| Grades                  | 100%         | 3             | 3                     | 3                    |
| Tickets                 | 67%          | 3             | 3                     | 3+                   |
| Placement               | 100%         | 3             | 3                     | 3+                   |
| Reviews                 | 67%          | 3             | 3                     | 3                    |
| Support                 | 100%         | 3             | 3                     | 3                    |
| Logout                  | 100%         | 3             | 3                     | 3                    |

Legend: “3+” indicates at least three screenshots (one per run) with additional variants (e.g., tabs, course samples, upload confirmations) present.
