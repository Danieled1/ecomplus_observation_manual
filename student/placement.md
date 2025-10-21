# 📄 Page Observation — [Placement Page]

**Experience:** Student  
**Date:** 21 Oct 2025  
**File:** `page-placement.php` (custom template)

---

## 🧩 Planned Behavior

A student lands on a single hub to manage their job-placement journey: upload/update resume, view current placement status and notes from staff, see interview/employment details as they progress, and access a curated set of job-search courses. Page elements adapt to the student's **job_status** (ACF user field).

---

## 🔍 Four Lenses

### Have

✅ Custom hero with context copy.  
✅ Dynamic status widgets (Resume/Status/Notes) driven by user ACF fields.  
✅ Resume upload via **ACF front-end form** to user meta (`resume_file`).  
✅ Placement notes download with “last updated” timestamp.  
✅ Conditional sections for **interview**, **published**, and **hired** states.  
✅ Related LearnDash “job-prep” courses list with enrollment/progress badges.  
✅ Email notifications on resume upload (student + placement team).  
✅ Basic mobile responsiveness (cards stack; CTA visible).

### Missing

❌ Inline editing for interview details (currently commented out).  
❌ Student-facing timeline/history of changes (status changes, notes, resume versions).  
❌ Empty states for each widget (uniform design + guidance).  
❌ Accessibility pass (landmarks, focus order, labels for icons, contrast).  
❌ Rate limit / size validation UI for resume upload; accepted file types hint.  
❌ Global success/error toasts for ACF actions and Ajax updates.  
❌ i18n for a few hard-coded strings.

### Pending

⚙️ Header/brand parity with decoupled header (colors/expansion polish).  
⚙️ Company card (logo + name) only shown when data exists; animation/placeholder pending.  
⚙️ Standardized card component tokens (radius, gap, shadows) across pages.

### Post-Launch

🕓 Social-ready milestone cards (“Got hired!”, “Interview scheduled”) with share images.  
🕓 Student-side activity log + staff replies (threaded) unified with Tickets system.  
🕓 Resume versioning with quick restore & diff.  
🕓 Add slider/feeds of external job boards personalized by track.  
🕓 SLA/ETA hints (“Avg review in 1–2 days”) and nudges (“Complete course X to improve chances”).  
🕓 Add notifications (email + in-app) for status/notes changes.

---

## 🧠 Perspectives

| Aspect               | Observation                                                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX / Visual          | Clear two-column “Status/Notes” layout on desktop; strong hero; cards stack well on mobile. Consider consistent CTA placement and a unified empty state with icon + action.                                                 |
| Logic / Code         | Job state drives conditional rendering via ACF user meta; ACF form used for resume upload; WP_Query for related courses; DOMContentLoaded toggles visibility of company header if employment info exists.                   |
| QA / Edge Cases      | What happens if resume upload fails (size/type/server)? Handle duplicate submits, non-image company logos, and missing ACF fields gracefully. Verify RTL spacing for long filenames and truncated titles.                   |
| Integration / System | Emails on resume upload to **placement_custom_email** + student. Ajax endpoint defined for job status/notes updates. Assets enqueued only on `page-placement.php`. Ensure LearnDash queries are cached/paginated for scale. |

---

## 🎨 Visual Notes

- Hero: `placement-bg.png` with gradient overlay and RTL headline.
- Cards: “קובץ קורות חיים”, “סטטוס השמה”, “הערות” with pill statuses and action buttons.
- Related courses: 4 cards from **ld_course_category: job-prep** including progress bars.

---

## ⚙️ Technical Notes

- CPT: **resume** (not used directly on page), user-meta ACF fields drive UI.
- ACF (user fields): `job_status` (select with values: hired/interview/published/…); `resume_file`; `interview_details` (date/time/location); `employment_info` (company_name/logo); `placement_notes` + `placement_notes_last_updated`.
- Rendering helpers: displayJobStatusSection(...), displayInterviewDetail(...), displayEmploymentInfo(...), displayPlacementNotes(...), displayCourseItem(...).
- Notifications: resumeUploadedMailTrigger → preparePlacementTeamEmailContent, prepareStudentEmailContent.
- Ajax (planned/partial): update_user_job_status (status + notes upload), update_custom_email (admin).
- Assets (conditional enqueue): page-placement.css, page-placement.js, acf_enqueue_scripts(), wp_localize_script('adminAjax.ajaxUrl').
- LearnDash: Related courses via WP_Query + ld_course_category=job-prep; progress via learndash_get_template_part('modules/progress.php', ...).

---

## ✅ Readiness

| Area        | Status | Comment                                                                                |
| ----------- | ------ | -------------------------------------------------------------------------------------- |
| Visual      | ⚙️     | Looks polished; header parity & placeholders still pending.                            |
| Logic       | ⚙️     | Core flows work; interview inline editing & status Ajax are partially implemented.     |
| QA          | ⚙️     | Needs pass on file types/limits, error toasts, a11y, and empty-state behavior.         |
| Integration | ✅     | Emails + ACF upload + LearnDash list wired; confirm option keys and env mail settings. |

**Readiness %:** 80%  
**Launch Ready:** ⚙️

---

### Quick Wins (next sprint)

- Add file-type/size hints + validation to resume field; show toast on success/error.
- Standard empty state with CTA for each card.
- Tighten a11y: aria labels for icons, focus traps in modals (if added later), color contrast.
- Cache related courses query; lazy-load course images.
- Finish header decoupling (match tokens/colors, full-width hero fix).
