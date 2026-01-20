# Box 1 — Phase Evolution (Compact Timeline)

Date: 2025-10-30
Source of truth: archive/QA_REPORT_FINAL_BOX1_EXPANDED_v2.md + QA phase reports (through 8R4/8R4a)

## Timeline (1–2 lines per phase)

- Phase 1–4: Baseline scaffolding

  - Established Puppeteer harness and initial student flows; began evidence capture (screenshots) and simple assertions.

- Phase 5 (5 → 5I): Orchestrator + evidence deepening

  - Introduced mapping-driven orchestration, added HAR and console capture, and split assertions into deterministic vs stateful; stabilized session handling with re-login.

- Phase 6: Baseline coverage

  - Standardized evidence artifacts and coverage computation; built first per-flow coverage.json/results.json summaries.

- Phase 7 (7, 7B): Optimization + weak-spot diagnostics

  - Hardened waits and selectors; added body summaries; identified partials (courses list, reviews) and ticket endpoint ambiguity under student scope.

- Phase 8 / 8R / 8R2 / 8R3: Launch readiness hardening

  - Increased deterministic checks across student flows; refined form handling (tickets, placement) and captured comprehensive evidence sequences.

- Phase 8R4: Endpoint normalization verification

  - Verified server-side patches; observed admin-ajax responses remain non-authoritative for students; full-suite snapshot ~86–88% assertions, ~85% deterministic.

- Phase 8R4a (archive + freeze)

  - Marked endpoint checks informational; froze environment pending a dedicated student API route; consolidated final_box1 artifacts.

- Calibration baseline (three full runs; no code change)
  - Refreshed evidence across all student flows; converged metrics at 87% overall/assertions/deterministic; produced the final narrative dossier for Box 1.

## At-a-glance table

| Phase        | Focus                               | Evidence maturity                 | Coverage signal           |
| ------------ | ----------------------------------- | --------------------------------- | ------------------------- |
| 1–4          | Harness + first flows               | Screenshots + simple checks       | N/A                       |
| 5 (→ 5I)     | Orchestrator + deep capture         | HAR + console + taxonomy          | Per-flow summaries begin  |
| 6            | Baseline coverage                   | Standardized artifacts + results  | Coverage.json introduced  |
| 7 / 7B       | Optimization + diagnostics          | Body summaries + selectors harden | Weak spots identified     |
| 8 / 8R / 8R3 | Readiness hardening                 | Form hardening + retries          | High 80s (representative) |
| 8R4          | Endpoint normalization verification | Ticket endpoint diagnostics       | ~86–88% assertions; 85% D |
| 8R4a         | Archive + freeze                    | Informational endpoint posture    | Frozen                    |
| Calibration  | Evidence refresh (no code change)   | Full baseline across all flows    | 87% overall/D/assertions  |

Notes: “D” = deterministic subset. All metrics are frozen and sourced from the v2 dossier and referenced phase reports.
