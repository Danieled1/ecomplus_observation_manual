## Copilot instructions for ecom_observation_manual

Be a practical, context-aware coding assistant for the Ecom+ observation/manual repository. Focus on concrete, repository-specific tasks (QA summaries, small fixes, content updates, and light PHP/WordPress tweaks). Keep suggestions minimal and directly actionable.

Key context (read before editing):

- This repo documents an Ecom+ WordPress stack built on BuddyBoss + LearnDash with custom PHP snippets and ACF-driven pages. See `CONTEXT.txt` for representative code and hooks.
- Primary working files and templates live at the repository root: `00_plan_guide.md`, `01_experience_pass_template.md`, `02_page_lens_template.md`, `03_decision_prep.md`, `STUDENT_EXP.md` and `PROMPTS.md`.
- QA workflows use `student/`, `teacher/`, and `staff/` folders. When asked to triage or summarize, read all `*/.md` files in those folders first.

How to help (high-value, repo-specific tasks):

- Summarize readiness: when asked, build a readiness table using `01_experience_pass_template.md` and data from `student/*.md` and `DEFECTS.csv`.
- Draft or update QA reports: edit `QA_Report_Student_Experience_v1.md` or `STUDENT_EXP.md` using the templates and the four-lens check (Have / Missing / Pending / Post-Launch).
- Small PHP/WordPress fixes: prefer minimal diffs. Typical patterns to match in `CONTEXT.txt`:
  - BuddyBoss/BuddyPress hooks (bp*\* and bp_nouveau*\* functions)
  - ACF/Custom CPT usage (grades, tickets, placement)
  - AJAX endpoints that return JSON for front-end components
- When changing code, preserve existing WordPress conventions (use hooks, nonces for AJAX, and translation functions like `esc_html_e`/`esc_attr_e`).
- For QA flow validation tasks: correlate failures in `coverage.json` with related DOM selectors or AJAX calls mentioned in `flow_logs/*.log`.

Repository patterns and constraints (do not assume otherwise):

- RTL / Hebrew content is present — check for hard-coded LTR assumptions when editing templates or CSS.
- The project is documentation+manual first: avoid broad refactors or adding new build tooling. Create small, reversible edits.
- There is no tooling config in-repo for builds — do not add CI/system-wide changes without asking.

Examples to cite when offering edits or templates:

- Use `PROMPTS.md` as the canonical example of an in-repo AI prompt ("You are my QA copilot...").
- For readiness summaries, follow the table structure found in `STUDENT_EXP.md` and `01_experience_pass_template.md`.
- When referencing code examples, point to `CONTEXT.txt` for BuddyBoss hooks and PHP snippets.


QA automation context (Puppeteer / orchestration):

- The repo also contains automated QA flows under `qa/puppeteer/`.
- Key files: `orchestrator.js`, `coverage.json`, `results.json`, `flow_logs/`, and markdown summaries (`QA_COVERAGE_BASELINE.md`, `QA_WEAKSPOT_ANALYSIS.md`, `QA_REPORT_PHASE_8.md`).
- When asked to analyze or summarize runs:
  • Read both `coverage.json` and `results.json` (latest run folders under `qa/puppeteer/output/`).
  • Correlate assertion pass/fail counts, timing (`elapsedMs`), and evidence links.
  • Generate diagnostics only — **never modify test logic** unless explicitly requested.
- When proposing patches, focus on minimal, low-risk adjustments:
  • Add cache-buster headers, selector wideners, or small endpoint hooks (`find_ticket_by_title`) consistent with BuddyBoss/WordPress conventions.
  • Do **not** add new frameworks or change Puppeteer architecture.
- Phase structure reference:
  • Phase 6 – Baseline run (logging + coverage)
  • Phase 7 – Optimization & Roll-ups
  • Phase 7B – Weak-Spot Diagnostics (analysis only)
  • Phase 8 – Launch Metrics (final readiness report)

When you cannot proceed:

- If a task requires running the application, making DB changes, or network calls, stop and request specific reproduction steps or access.
- If a change touches deployment, Redis, or external services (Vimeo, CRM), ask for confirmation and credentials (do not attempt to use them).

Tone and output style:

- Keep answers short, actionable and repo-focused. When suggesting code, provide a minimal patch and a one-line rationale.
- If editing docs or summaries, prefer the existing templates and phrasing. Keep headings and table formats consistent with other files.
- When summarizing automated QA data, prefer concise bullet lists and tables (flow | coverage % | timing | notes).


explicit commit/branch rules –
Branch naming: `qa/<scope>-<pass>` (e.g. qa/student-pass-v1)  
Commit format: `qa(page): summary` or `docs(template): update`


Ask the maintainer if unsure about scope or when a change affects more than a single markdown or small PHP patch.
