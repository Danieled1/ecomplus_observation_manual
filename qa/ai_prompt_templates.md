# AI prompt templates (use these to generate consistent outputs)

1. Page summarizer (input: `student/<page>.md` and relevant `CONTEXT.txt` snippets)

Prompt:
"You are a QA assistant. Summarize the Student page at `<page>`.
Output a JSON object with: title, files (list of file paths found), short_description (1 sentence), have (list), missing (list), pending (list), top_blocker (single sentence)."

Expected output (JSON example):
{
"title": "Course - single",
"files": ["template-parts/learndash/single-course.php"],
"short_description": "Course hub showing progress, resume, and lesson list.",
"have": ["Resume logic", "progress infobar"],
"missing": ["empty-state"],
"pending": ["mobile spacing polish"],
"top_blocker": "Missing empty-state and loading skeletons for slow networks"
}

2. Readiness table generator (input: array of page summaries)

Prompt:
"Given the following page summaries (JSON array), generate a markdown readiness table with columns: Page, Readiness %, Have (short), Missing (short), Pending (short), Top blocker, Evidence placeholder. Compute Readiness % by weighing Have/Missing/Pending (use heuristic: base 100, -10 per missing, -5 per pending, min 0)."

3. Defect extractor (input: page summary + evidence entries)

Prompt:
"From the page summary and provided evidence items, extract a defect list. For each defect produce: id (auto EVID-###), severity, page, area, title, steps (numbered), actual, expected, evidence (EVID-###), status=open, owner=unassigned. Output CSV rows only."

4. Remediation generator (input: defect row)

Prompt:
"For the defect described, provide a concise remediation (3-6 lines) with suggested owner label and an S/M/L estimate. Keep code suggestions minimal and reference file paths if provided."

5. Final report writer (input: readiness table, defect list, evidence index)

Prompt:
"Write the final QA report in markdown using these inputs. Include: Title, Meta, Executive summary (3 bullets), Overall readiness %, Readiness table (markdown), Detailed page sections (with defects listed), Prioritized backlog (blocking->medium), Evidence appendix (EVID mapping). Keep language concise and suitable for an executive review."

Usage tips

- Seed prompts with explicit examples (like the JSON example above) to improve consistency.
- When asking for CSV/JSON outputs, require strict machine-parsable formats; do not include commentary.
