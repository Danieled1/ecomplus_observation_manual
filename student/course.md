# 📄 Page Observation — Course (Single View)

**Experience:** Student  
**Date:** 21 Oct 2025  
**Example:** “DIGITAL AI – קורס מתעדכן”  
**Files (child theme overrides / snippets):**

- Single course layout & sidebar widget: `template-parts/learndash/single-course.php` (or equivalent override)
- Course “enroll/resume” panel & status ribbons (modified BuddyBoss LD30 template).
- Custom CSS injected inline (see snippet) for sticky sidebar, preview card, buttons.
- Video preview modal markup in same template.

---

## 🧩 Planned Behavior

This page is the **hub for a specific course**. A student sees:

- Large **hero** with course title.
- **Progress infobar** (percentage + last activity).
- Left **sticky sidebar** with preview image/video, **status bubble** (התחל/בתהליך/הושלם), and a single **primary action** (“התחל/המשך/הושלם”).
- **Course volume** summary (lessons / topics / quizzes / certificate).
- Main **content list** below (lessons with completion state).
- (Optionally) course participants / widgets.

---

## 🔍 Four Lenses

### ✅ Have

- **Accurate status computation** via `learndash_course_progress(['array'=>true])` → `completed/notcompleted/progress` bubble.
- **Primary action button** logic (Start/Continue/Completed) including **resume link** generation.
- **Access/price branches** (`open/free/paynow/subscribe/closed` + Product model) determine button vs. payment vs. “Not Enrolled”.
- **Sticky sidebar** (custom CSS), branded button styles, RTL layout.
- **Preview video modal** (oEmbed or MP4 fallback).
- **Counts**: Lessons / Topics / Quizzes / Certificate displayed.
- **Progress infobar** showing percent + last activity timestamp.
- **Participants** block supported (when option enabled).
- **Custom progress bar** style (modified LD).

### ❌ Missing

- **Empty-state messages** for: no video, no lessons/topics/quizzes.
- **Loading/skeleton** for hero/preview on slow networks.
- **Error feedback** for oEmbed failures beyond a generic message.
- **ARIA & keyboard** focus for the preview modal and resume button.
- **Telemetry** (click tracking for resume, preview, module opens).

### ⚙️ Pending

- Confirm **mobile spacing** around sidebar card and infobar; check long titles wrapping.
- Validate **price visibility** policy for enrolled students (hide when not relevant).
- Verify **admin auto-enroll** toggle behavior on this page (matches list view).
- Ensure **resume link** always points to the _next actionable_ step (topic/quiz) after re-computation.
- Localize any remaining English strings in LD templates.

### 🕓 Post-Launch

- Add **recent recordings** / “last opened lesson” quick link near the hero.
- **Inline checklist** of milestones (badge/certificate triggers).
- **Autosave notes** or “pin” for this course hub.
- **Skeleton loaders** and **optimistic progress** updates.

---

## 🧠 Perspectives

| Aspect                   | Observation                                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UX / Visual**          | Clear hierarchy: hero → progress → action → contents. Sidebar CTA is obvious; “volume” summary communicates scope succinctly. Need loader/empty states, and slight spacing polish in RTL mobile.                                                                    |
| **Logic / Code**         | Robust branching for pricing & access (`sfwd_lms_has_access`, `learndash_get_course_price`, Product model). Start/Continue/Completed logic derived from progress array; resume URL via BuddyBoss helper. Counts computed by iterating lessons, topics, and quizzes. |
| **QA / Edge Cases**      | Course with zero steps; MP4 without poster; mixed-language labels; admin auto-enroll off; Product model absent; resume URL when last item completed; very large lesson counts (performance).                                                                        |
| **Integration / System** | Harmonizes LearnDash progress with BuddyBoss UI; optional participants; custom CSS override for sticky and CTA. Connects cleanly with your **group→tab** navigation model from the Courses list.                                                                    |

---

## 🎨 Visual Notes

**Screens:** `course_desktop_hero.png`, `course_desktop_sidebar.png`, `course_tablet.png`, `course_mobile_1.png`, `course_mobile_2.png`, `course_mobile_list.png`

- Hero gradient matches system palette; sidebar card has rounded corners + shadow.
- Infobar shows “הושלם X%” with last activity; green progress line visible.
- Section header “תוכן הקורס” lists lesson rows with check states.

---

## ⚙️ Technical Notes (from your snippet)

- **Context & user:**
  - `$current_user_id = get_current_user_id();`
  - `$has_access = sfwd_lms_has_access($course_id, $current_user_id);`
- **Pricing & access:**
  - `learndash_get_course_meta_setting($course_id, 'course_price[_type]')`
  - `learndash_get_course_price($course_id)`
  - **Product model** presence (`LearnDash\Core\Models\Product::find`) to display pre-order/starts/ended & seats.
- **Progress:**
  - `learndash_course_progress(['array'=>true])` → `%/completed/total`, mapped to `completed/notcompleted/progress`.
  - Infobar shows last activity from progress helpers.
  - **Custom progress bar** visuals applied in template/CSS.
- **Resume:**
  - `buddyboss_theme()->learndash_helper()->boss_theme_course_resume($course_id)` for Start/Continue target.
- **Counts:**
  - Lessons via `learndash_get_course_lessons_list($course_id, null, ['num' => -1])`
  - Topics via `learndash_get_topic_list($lesson->ID)` and `learndash_topic_dots`
  - Quizzes via `learndash_get_course_quiz_list()` + per-lesson/topic quiz lists
- **Certificate:**
  - `learndash_get_course_meta_setting($course_id, 'certificate')` toggles certificate list item.
- **Participants (optional):**
  - `learndash_get_users_for_course($course_id, ['number' => 5], false)` + BuddyBoss helper for count.
- **Video preview:**
  - oEmbed via `wp_oembed_get($course_video_embed)` or `<video>` MP4 fallback.
- **Sidebar widgets:**
  - `is_active_sidebar('learndash_course_sidebar')` renders widget area.
- **Styling overrides:**
  - Inline `<style>` (sticky, button states, bb-ld-tabs shadow). Consider moving to `assets/css/course-single.css`.

---

## 🔌 Operational Context (important)

- **Cohort model:** each new student is assigned a **group bundle** of courses (main + extras).
- **Automation plugin:** internal **Vimeo→WordPress** uploader ties a selected course to a Vimeo folder and builds lessons automatically. (Architecture supports **Zoom→Vimeo→WordPress** + optional Drive backup in future.)
- **Result:** the course hub stays consistent while content grows automatically per cohort.

---

## ✅ Readiness

| Area            | Status | Comment                                     |
| --------------- | ------ | ------------------------------------------- |
| **Visual**      | ⚙️     | Strong base; needs mobile spacing & loaders |
| **Logic**       | ✅     | Access/price/CTA/progress all correct       |
| **QA**          | ⚙️     | Edge cases (0 steps, MP4 fallback, resume)  |
| **Integration** | ✅     | Cohort groups + automation plugin aligned   |

**Readiness %:** **87%**  
**Launch Ready:** **⚙️** (ship with empty/loader states + a11y pass)

---

## 🧩 Notes / Next

1. **Empty & loading states** (preview, counts, contents).
2. **A11y:** focus trap + ESC for video modal; ARIA on status bubble & CTA.
3. **Move inline CSS** to versioned `course-single.css` and enqueue conditionally.
4. **Normalize strings** (Hebrew translations centrally via `__()`/`_x()`).
5. **Resume target** audit: ensure it always points to next incomplete step.
6. **Telemetry** events for: preview open, resume click, completion.

---

**Prepared by:** Daniel Edri  
**Last updated:** 21 Oct 2025
