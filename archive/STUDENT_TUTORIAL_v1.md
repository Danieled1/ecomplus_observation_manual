# Student Experience Tutorial (Box 1.5b)

_Primary student flows from first login to logout._

---

## 1. Login Page

**Purpose:** This page lets you access your learning hub by signing in and being redirected to your profile based on your role.

1. Guests who attempt to access any private page are redirected here.
2. Upon successful login, users are redirected according to their role.
3. Note the landing page after successful login (student profile URL pattern).
4. Hebrew-localized error messages for wrong/empty credentials.
5. Attempt invalid credentials to observe the Hebrew error message.
6. Then continue from My Profile to your courses.

> Tip: Implement auth recovery & password visibility.

![Login screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/login_body.png)

_Transition: Next you arrive at your Profile hub._

---

## 2. My Profile

**Purpose:** This page lets you see and manage your info and progress by organizing profile details, group tabs, and certificates in one hub.

1. "Edit" button visible only to the profile owner.
2. Dynamic sub-tabs for each LearnDash group the user belongs to.
3. Progress and last-activity indicators are rendered.
4. Switch between group sub-tabs to view course lists and certificates.
5. Tap Edit to update profile fields and return to the overview.
6. Then go to Courses to explore what to learn next.

> Tip: Unified student experience with RTL support and consistent theming.

![Profile screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/profile_body.png)

_Transition: Move into Courses to choose what to learn now._

---

## 3. Courses Page

**Purpose:** This page lets you find what to learn next by browsing your enrolled courses via group tabs, statuses, and progress.

1. Dynamic group tabs/chips (LearnDash groups → tabs).
2. Grid/List toggle functional.
3. Status ribbons with progress %, last activity, and access states.
4. Interpret the status ribbon on a card (Start/In‑progress/Completed).
5. Open a course card from the relevant group tab to continue.
6. Then move to the course page to start or resume.

> Tip: Add empty‑state components and unified visual polish across pages.

![Courses screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/courses-list_body.png)

_Transition: Drill into a Course to resume structured progress._

---

## 4. Course (Single View)

**Purpose:** This page lets you resume and plan a course by showing progress, actions, and contents in one place.

1. Primary action button (Start/Continue/Completed) with resume link.
2. Preview video modal (oEmbed or MP4 fallback).
3. View progress infobar (percentage + last activity).
4. Check the counts (lessons/topics/quizzes) and certificate indicator.
5. Use the primary button to resume exactly where you left off.
6. Then open the next lesson from the contents list.

> Tip: Focus: Stability, RTL usability, and connected backend logic.

![Course screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/course-0_body.png)

_Transition: Enter a Lesson to keep advancing._

---

## 5. Lesson Page

**Purpose:** This page lets you learn and advance toward completion by viewing lesson content, updating status, and moving to the next step.

1. Assignments, topics, and quizzes lists (when present).
2. Mark the lesson complete to unlock the next step.
3. Use the Next button to continue; if blocked, read the gating notice.
4. Previous/Next navigation with gating rules.
5. Sidebar checklist with current lesson highlighted.
6. Then after several lessons, review Grades to check your progress.

> Tip: Accessibility + performance audits.

![Lesson screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/lesson-%d7%a9%d7%99%d7%a2%d7%95%d7%a8-2-3_body.png)

_Transition: Review Grades to gauge performance._

---

## 6. Grades

**Purpose:** This page lets you understand your performance by listing evaluated items with status and totals in one table.

1. Live table populated client‑side via fetch_client_grades (AJAX).
2. Completed counter (e.g., 5/6).
3. Placement status chip and responsive table labels.
4. Review each row’s status and deadline; look for completed vs. pending.
5. Check the completed counter and confirm it matches visible rows.
6. Then revisit low‑score lessons or open Tickets if something looks wrong.

> Tip: Add empty‑state components and unified visual polish across pages.

![Grades screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/grades_body.png)

_Transition: Open Tickets if you need help or clarification._

---

## 7. Tickets (פניות ואישורים)

**Purpose:** This page lets you get help and approvals by submitting a ticket and tracking status and feedback in one place.

1. Create a ticket via ACF front‑end form (sector, sub‑subject, title, content).
2. View ticket history table (status, last modified, feedback).
3. Open content modal for message, attachments, and links.
4. Submit a new ticket with sector and sub‑subject; confirm it appears in the history.
5. Open the message modal to review content and attachments.
6. Then return to your lessons while awaiting feedback.

> Tip: Add empty‑state components and unified visual polish across pages.

![Tickets screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/tickets_after_submit.png)

_Transition: Visit Placement to progress your career journey._

---

## 8. Placement

**Purpose:** This page lets you move your job search forward by uploading your resume, checking status/notes, and accessing prep courses.

1. Upload resume via ACF front‑end form (user meta).
2. View status widgets and placement notes.
3. Browse related LearnDash job‑prep courses.
4. Upload or replace your resume file and confirm the “last updated” note.
5. Review current status and notes; open a related job‑prep course.
6. Then take a suggested job‑prep course next.

> Tip: Unified student experience with RTL support and consistent theming.

![Placement screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/placement_upload.png)

_Transition: Share quick feedback through Reviews if desired._

---

## 9. Reviews

**Purpose:** This page lets you share feedback that improves the experience by submitting a simple one‑off review.

1. Submit a POST form that sanitizes inputs and sends an email via wp_mail().
2. Redirect to user profile after successful send.
3. Use minimal fields (name, satisfaction, free-text).
4. Select satisfaction level and submit feedback; observe redirect to profile.
5. Use the free‑text field to add specifics that help staff improve.
6. Then return to your profile or course to continue.

> Tip: Full Reviews backend (CPT + moderation).

![Reviews screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/reviews.png)

_Transition: Need technical help? Visit Support._

---

## 10. Technical Support Page

**Purpose:** This page lets you quickly get technical help by opening the external support form with clear guidance.

1. Read guidance on how to request help.
2. Activate the "Technical Support Form" button (opens in a new tab).
3. Open the external support form in a new tab.
4. If forms are blocked, use the fallback contact method provided (mailto or help address).
5. Then return to your previous page to resume learning.

> Tip: Replace Google Form dependencies with internal ACF forms.

![Support screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/support_body.png)

_Transition: When finished, log out safely._

---

## 11. Logout

**Purpose:** This page lets you end your session safely by logging out and returning to the login page.

1. Logout from header to end session.
2. Click Logout in the header and confirm you return to /custom-login/.
3. Attempt to open a private page to verify the session is terminated.

> Tip: Unified student experience with RTL support and consistent theming.

![Logout screenshot](/qa/puppeteer/output/run-2025-10-29T13-37-12-867Z/logout_after.png)

**Tutorial generation complete — ready for publishing or visual export.**
