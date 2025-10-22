# 📄 Page Observation — My Profile

**Experience:** Student  
**Date:** 21 Oct 2025  
**Files:**

- `/buddypress/members/single/profile/profile-loop.php`
- `/buddypress/members/single/profile/home.php`
- `/functions/learndash-functions.php` (custom group navigation + course logic)
- `/learndash/templates/ld-certificates-panel.php` (optional certificate sub-panel)

---

## 🧩 Planned Behavior

The **My Profile** page serves as the central hub for a student’s personal and academic data.  
It combines three layers:

1. **Personal & General Info** — BuddyBoss XProfile fields (name, age, contact, skills, etc.).
2. **Campaign / Project Cards** — promotional or program-based banners for students’ tracks.
3. **Dynamic LearnDash Achievements Layer** — built via custom hooks that detect group enrollments, generate sub-tabs automatically, and show personalized course progress and certificates per group.

---

## 🔍 Four Lenses

### ✅ **Have**

- Profile base templates successfully cloned and overridden from BuddyBoss (`profile-loop.php`, `home.php`).
- Full RTL layout confirmed on desktop and mobile.
- Dynamic XProfile data table with localized Hebrew headers.
- “Edit” button visible only to the profile owner.
- Preload for user cover image (`preload_lcp_image()` → improves LCP).
- Campaign/project cards visually active (placeholders currently static).
- LearnDash integration layer live and functional:
  - Hooks into `ld_added_course_access` to save user “main course path.”
  - `bp_setup_nav` dynamically generates profile sub-tabs for each LearnDash group the user belongs to.
  - Each sub-tab displays enrolled group courses via `display_group_courses()`.
  - Progress and last-activity indicators rendered via `learndash_course_progress()` and `learndash_get_user_activity()`.
- Certificates and achievements visible either in profile main view or under dedicated Certificates tab.

---

### ❌ **Missing**

- Dynamic campaign card linkage (still placeholders, no data mapping).
- Empty-state message missing in course/achievement panels.
- No loading indicator when switching between course-group tabs.
- Certificate panel has no Hebrew empty-state or progress iconography.
- Profile edit save action gives no inline success/failure feedback.
- Some mobile spacing inconsistencies between profile table and cards.

---

### ⚙️ **Pending**

- Validate that `get_all_sector_names()` and other meta queries are indexed and not causing slow admin load.
- Verify `learndash_get_users_group_ids()` runs only when profile is displayed (no background loops).
- Test group detection function `is_main_group()` for naming edge cases.
- Confirm translation coverage for dynamically created sub-tabs (`bp_core_new_subnav_item`).
- Ensure CSS loads before the LearnDash course list for consistent rendering.

---

### 🕓 **Post-Launch**

- Add “Next Course” recommendation under each group tab (based on `learndash_course_progress`).
- Animate campaign cards (hover + reveal interaction).
- Integrate progress summary widget (total % completion across groups).
- Enable AJAX switching between group sub-tabs for smoother UX.
- Connect campaigns dynamically with student’s “main course path” (stored in user meta).
- Add local caching layer for `learndash_group_enrolled_courses()` results.

---

## 🧠 Perspectives

| Aspect                   | Observation                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UX / Visual**          | Design and hierarchy consistent. Group sub-tabs feel seamless with BuddyBoss UI. Campaign cards well-aligned but need dynamic data. Certificates panel functional but plain visually.                                                                                                                                  |
| **Logic / Code**         | `update_main_course_path()` stores a main course reference automatically. Group and tab generation handled dynamically through `process_groups()` and `add_group_tab()`. Each tab’s content pulled from `display_group_courses()` which constructs a LearnDash-like card list with progress, steps, and last activity. |
| **QA / Edge Cases**      | New student with no groups → no sub-tabs appear, no message displayed. Mixed-language course titles might bypass `strpos($course_title, 'קורס')`. Non-indexed queries (`get_posts` by slug) could slow group lookup.                                                                                                   |
| **Integration / System** | Deep integration between LearnDash, BuddyBoss, and WordPress user meta. Custom hooks use `bp_setup_nav`, `ld_added_course_access`, `learndash_get_users_group_ids()`, `learndash_group_enrolled_courses()`. Works with both RTL and LTR.                                                                               |

---

## 🎨 Visual Notes

**Screenshots:**

- `profile_desktop.png`
- `profile_mobile.png`
- `profile_sidebar_open.png`
- `profile_group_tabs.png`
- `profile_certificates.png`

**Visual observations:**

- Sidebar toggle functional (mobile).
- Course group tabs auto-generated and visible under "Courses".
- Certificates appear in structured grid below campaign cards.
- Layout visually cohesive across devices; RTL margins slightly misaligned in nested divs.

---

## ⚙️ Technical Notes

**Core Functions (custom):**

- `update_main_course_path($user_id, $course_id)`  
  → Detects “main course” enrollment and saves it to user meta as `path`.
- `add_dynamic_group_tabs()`  
  → Main entrypoint that calls `process_groups()` and attaches BuddyBoss subnav tabs based on LearnDash groups.
- `process_groups($group_ids)`  
  → Iterates through enrolled groups, detects “main group” by keyword “מחזור לימוד קורס”, builds tabs.
- `add_group_tab($group, $is_main_group)`  
  → Registers new sub-tab in profile nav via `bp_core_new_subnav_item()`.
- `display_group_courses($group_id)`  
  → Outputs courses grid per group; uses LearnDash helpers for progress and steps.
- `display_course_item($course_id)`  
  → Renders a single course card with progress, last activity, and link.
- `find_group_id_by_slug()`  
  → Lookup for group posts based on slugs.
- `is_main_group()` / `determine_position()`  
  → Utility functions to organize sub-tabs by relevance and order.

**CSS & Visual Assets:**

- `profile-loop.css`, `profile-home.css` (conditionally enqueued).
- `mini-logo.svg` used in campaign cards.

**Hooks in use:**

- `ld_added_course_access`
- `learndash_added_user_group` / `learndash_removed_user_group` (cache clearing).
- `bp_setup_nav` (dynamic tab generation).
- `wp_head` (LCP preload).
- `wp_enqueue_scripts` (profile CSS).

---

## ✅ Readiness

| Area        | Status | Comment                                                 |
| ----------- | ------ | ------------------------------------------------------- |
| Visual      | ⚙️     | Strong, but campaign cards static and RTL spacing minor |
| Logic       | ✅     | Dynamic LearnDash tab generation working                |
| QA          | ⚙️     | Needs empty-state and translation tests                 |
| Integration | ✅     | Deep LearnDash–BuddyBoss integration stable             |

**Readiness %:** 88 %  
**Launch Ready:** ⚙️ _Fully functional, pending data binding + polish._

---

## 🧩 Notes / Next

1. Localize all dynamic strings in LearnDash tab titles and empty messages.
2. Add caching for `learndash_group_enrolled_courses()` to prevent load spikes.
3. Replace campaign placeholders with dynamic path-linked banners.
4. Conduct RTL + mobile QA for new sub-tabs and course cards.
5. Add analytics (event tracking) for tab clicks and certificate views.

### Role Behavior Notes (Observation Only)

- **Admin:** currently redirected to WP Admin (not using profile hub).  
- **Instructor:** lands on same hub view with link to “Instructor Dashboard”.  
  - _Open question:_ should instructors go **directly** to `/instructor-dashboard` after login? (Decision for Amit/Ben.)
- **Student:** hub without instructor tools.  
- **Future idea (not for now, just captured):**  
  Use Profile as a living “mini-resume” that fills itself via milestones (projects/tests/certificates/badges).  
  Logged as a **Post-Launch** concept.
---

**Prepared by:** Daniel Edri
