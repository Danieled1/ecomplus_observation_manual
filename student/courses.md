# 🔧 My Profile — Addendum

### Role Behavior Notes (Observation Only)

- **Admin:** currently redirected to WP Admin (not using profile hub).
- **Instructor:** lands on same hub view with link to “Instructor Dashboard”.
  - _Open question:_ should instructors go **directly** to `/instructor-dashboard` after login? (Decision for Amit/Ben.)
- **Student:** hub without instructor tools.
- **Future idea (not for now, just captured):**  
  Use Profile as a living “mini-resume” that fills itself via milestones (projects/tests/certificates/badges).  
  Logged as a **Post-Launch** concept.

_No readiness % change from last version; this just clarifies intent._

---

# 📄 Page Observation — Courses Page

**Experience:** Student  
**Date:** 21 Oct 2025  
**File(s):**

- Course card template override (BuddyBoss LearnDash loop): `template-parts/learndash/content-course.php` (or equivalent in child theme)
- Group→tab logic from profile layer (drives chips/tabs): `functions/learndash-functions.php`
- Course single sidebar/lesson nav (partially visible in snippet): used on course pages, not list

---

## 🧩 Planned Behavior

Display the student’s **available/enrolled courses** organized by **group tabs** (e.g., “AI Extra”, “General Courses Extra”, cohort tab, etc.).  
Each card shows **title**, **lessons count**, **status ribbon** (Start/In-progress/Completed), **progress bar/percentage**, **last activity**, and **access state** (has access / not enrolled / free).  
Grid ↔ List toggle is available.

---

## 🔍 Four Lenses

### ✅ Have

- **Dynamic group tabs/chips** (LearnDash groups → tabs).
- **Course cards** with:
  - Lessons count via `learndash_get_course_lessons_list()`.
  - Status ribbon logic via `learndash_course_progress` / `learndash_status_bubble`.
  - Progress %, last activity via `learndash_get_user_activity()`.
  - Access states (has access / free / not enrolled).
- **Grid/List toggle** functional.
- **RTL layout** validated on desktop + mobile.
- **Admin auto-enroll** logic functional.
- **Participants block** visible when enabled.

---

### ❌ Missing

- Empty-state message when a tab has 0 courses.
- Loading state when switching tabs or toggling view.
- Search/filter (status, progress %, text).
- Pagination or infinite scroll.
- Lazy-loading or skeletons for card images.
- Consistent Hebrew translations in ribbons (“Start”, “Free”, etc.).

---

### ⚙️ Pending

- Mobile spacing & card gutter QA.
- Verify tab order + keyboard navigation.
- Cache/CDN exclusion for progress data.
- Confirm price visibility rules (should enrolled students see it?).
- Validate chip order (main cohort first).

---

### 🕓 Post-Launch

- Search & sort (Newest, A–Z, Progress %, Last activity).
- “Next up” recommendation card.
- Analytics: tab click + completion funnel.
- Local caching of LearnDash queries.

---

## 🧠 Perspectives

| Aspect                   | Observation                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UX / Visual**          | Cards are clear, ribbons intuitive (התחל קורס / בתהליך / הושלם). Tabs show grouping but need overflow and load feedback.                           |
| **Logic / Code**         | Correct branching using `learndash_course_progress`, `sfwd_lms_has_access`, `learndash_get_course_price`. Lessons + last activity render properly. |
| **QA / Edge Cases**      | Empty tab, long titles, 0-lesson courses, mixed language, admin auto-enroll off, slow load (no skeletons), RTL truncation.                         |
| **Integration / System** | Relies on LearnDash progress + BuddyBoss helpers. Needs cache rules to avoid stale progress % (disable CDN cache for container).                   |

---

## 🎨 Visual Notes

**Screenshots:**  
`courses_desktop.png`, `courses_desktop_tabs.png`, `courses_tablet.png`, `courses_mobile.png`

**Visual summary:**

- Chips: _AI Extra_, _General Courses Extra_, _מחזור לימוד קורס..._
- Status ribbons: **התחל קורס**, **בתהליך**, **הושלם**
- Progress bar aligns under title; last activity bottom-left.

---

## ⚙️ Technical Notes

- **Key vars & helpers:**
  - `sfwd_lms_has_access`, `learndash_get_course_price`, `learndash_get_course_meta_setting`
  - `learndash_course_progress(['array'=>true])`, `learndash_get_user_activity()`
  - `learndash_get_course_lessons_list()`
  - `learndash_status_bubble($status)`
  - `_learndash_course_grid_custom_ribbon_text`
  - `learndash_get_users_for_course()`, BuddyBoss theme helpers
- **Group→Tab source:** `add_dynamic_group_tabs()`, `process_groups()`, `add_group_tab()`
- **Performance watchpoints:** multiple progress/lesson queries per card (consider caching).
- **Accessibility:** ensure `aria-label`s and tab focus order.

---

## ✅ Readiness

| Area            | Status | Comment                                         |
| --------------- | ------ | ----------------------------------------------- |
| **Visual**      | ⚙️     | Needs empty-state, loader, RTL spacing polish   |
| **Logic**       | ✅     | Access, progress, and pricing all functional    |
| **QA**          | ⚙️     | Needs tests for long titles, empty tabs, mobile |
| **Integration** | ✅     | Groups, tabs, and LearnDash data stable         |

**Readiness %:** **86%**  
**Launch Ready:** ⚙️ Functional but pending polish (empty-state + loading indicators)

---

## 🧩 Notes / Next

1. Add **empty-state**: “אין קורסים להצגה כרגע”.
2. Add **loader/skeleton** for chip switch + thumbnails.
3. Decide on **price visibility** for enrolled students.
4. Introduce **pagination/lazy-load** for large lists.
5. Normalize **Hebrew labels** from single translation source.
6. Optional: add **basic search + sort** (Phase 2).

---

**Prepared by:** Daniel Edri  
**Last updated:** 21 Oct 2025
