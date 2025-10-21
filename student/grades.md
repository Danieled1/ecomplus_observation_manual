# 📄 Page Observation — [Page Grades]

**Experience:** [Student]  
**Date:** 20 Oct 2025  
**File:** `page-grades.php` (+ `page-grades.js`, `page-grades.css`)

---

## 🧩 Planned Behavior

Student lands on a single hub that shows all evaluated items (tests/projects/works) in a clean table fetched via AJAX, with quick context (avatar, username, placement status, total completed count). Data is read‑only for students.

---

## 🔍 Four Lenses

### Have

✅ Responsive banner & copy (“ציונים”), avatar + username (BuddyBoss mention if present).  
✅ Placement status chip (from cached `job_status` user meta).  
✅ Live table populated client‑side via `fetch_client_grades` (AJAX).  
✅ Completed counter (e.g., `5/6`).  
✅ Table transforms labels for RTL/mobile with `data-colname`.  
✅ Image `<picture>` with WebP → PNG fallback.  
✅ Caching with `wp_cache_get/wp_cache_set` for user meta (job status, avatar).

### Missing

❌ Empty states (no grades / request error) don’t render instructional UI.  
❌ Sorting / filtering / search on the table.  
❌ Drill‑down per item (open rubric, attachments, instructor notes).  
❌ Export (CSV/PDF) for personal records.  
❌ Accessibility: table headers announce, focus order after AJAX, caption.  
❌ i18n strings centralization (some literals hard-coded).

### Pending

⚙️ Consistent time format/timezone across items (server GMT → formatted).  
⚙️ Badge/legend for `grade_status` codes; unify Hebrew mapping in one place.  
⚙️ Loading/idle/skeleton states for fetch.  
⚙️ Error surfaces (network/server) with retry.

### Post-Launch

🕓 Add historical trends (average grade, progress over time).  
🕓 Per‑course filters, tag by path/semester.  
🕓 Student download of annotated feedback or rubric.  
🕓 Notifications hook when a grade changes.  
🕓 Privacy control for sharing grades (self only vs. advisor).

---

## 🧠 Perspectives

| Aspect               | Observation                                                                                                                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX / Visual          | Crisp hero, RTL-tuned table, responsive cards on mobile. Needs clearer hierarchy in the header strip (username + status) and a visible table caption.                                                                                                             |
| Logic / Code         | Data pulled with `fetch_client_grades` → returns serialized `grade_items` from the user’s associated Grades CPT post. Table built from a single headers array; transforms applied (e.g., name sans last word, “Not Submitted”→“מחכה להגשה”).                      |
| QA / Edge Cases      | No-grades user; missing `associated_grade_post_id`; malformed `grade_items`; very large lists (pagination/virtualization); slow network; avatar/job_status cache misses; user without BuddyBoss.                                                                  |
| Integration / System | Relies on: BuddyBoss (optional mention name), LearnDash groups for active courses (helper present), custom Grades CPT + `path` taxonomy, WP AJAX, ACF (page header only). Security: endpoints limited to the current user; admin-only endpoints for bulk grading. |

---

## 🎨 Visual Notes

`/assets/images/grades-banner-1.webp|png`  
Screens: `2821a1c6-55c3-4b18-a1d2-a66a6be3c60c.png`, `cea75920-7287-4d3e-a4f4-90e142635d8e.png`, `8f635de6-8efb-472f-9f73-1c252e2f0fe0.png`, `8aaa2e93-00b8-4247-9398-058547bb7bf2.png`, `d5fdef50-448a-4dd9-9f97-addb5c154095.png`

---

## ⚙️ Technical Notes

- **Key template & assets:** `page-grades.php`, `page-grades.js`, `page-grades.css` (enqueued via `enqueue_page_grades_assets`).
- **Caching:** `wp_cache_get/wp_cache_set` for `job_status_{user}` and `avatar_{user}`.
- **AJAX (student):** `fetch_client_grades` (validates `user_id`; fetches `associated_grade_post_id`; reads `grade_items` directly via `$wpdb` for perf; returns JSON).
- **AJAX (staff):** `fetch_admin_user_grades`, `save_user_grades` (bulk fetch & update by email/test name).
- **Update endpoint:** `save_grades` (index-based mutation of a single grade item; stamps `last_modified` in GMT).
- **Data model:** CPT `grades`; meta `grade_items` (array of objects: `grade_name`, `grade_type`, `grade_score`, `grade_status`, `grade_deadline`, `grade_feedback`, `last_modified`). Taxonomy `path` (+ helpers to pre-seed sub-terms).
- **UI build:** JS `populateGradesTable2()` renders `<thead>/<tbody>`, assigns `data-colname` for mobile, counts completed, maps strings to Hebrew.
- **Perf:** Measures AJAX duration; server logs execution time; removes `jquery-migrate`.
- **Security:** Admin-only for staff endpoints via `current_user_can('manage_options')`. Student fetch gated by `user_id` from session/localized `userInfo` and returns only their `grade_items`.

---

## ✅ Readiness

| Area        | Status | Comment                                                             |
| ----------- | ------ | ------------------------------------------------------------------- |
| Visual      | ⚙️     | Solid base; add caption/empty state & polished header hierarchy.    |
| Logic       | ✅     | Endpoints, caching, client render all working.                      |
| QA          | ⚙️     | Add tests for empty/malformed data, latency, pagination.            |
| Integration | ✅     | Plays with CPT/Taxonomy + BuddyBoss (optional) + LearnDash context. |

**Readiness %:** 85%  
**Launch Ready:** ✅ (with minor UX/empty-state polish)
