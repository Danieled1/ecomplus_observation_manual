# 📄 Page Observation — [Page Reviews]

**Experience:** [Student]  
**Date:** 20 Oct 2025  
**File:** `page-reviews.php` (custom template)

---

## 🧩 Planned Behavior

A lightweight page where students can submit a simple, one-off review/feedback. For launch, either hide the page or keep it as a minimal, clean form that emails the placement/support team and confirms submission to the student.

---

## 🔍 Four Lenses

### Have

✅ Custom template renders a branded header and a working POST form that sanitizes inputs and sends an email via `wp_mail()`.  
✅ Basic fields: name, teaching satisfaction (select), free-text improvement.  
✅ Redirect to user profile after successful send.  
✅ Assets enqueuing stub present (`enqueue_page_reviews_assets`).

### Missing

❌ Nonce + CSRF protection for the form; no `wp_nonce_field()` / `check_admin_referer()`.  
❌ Validation and error feedback UI (server + client).  
❌ Rate‑limit / CAPTCHA; no spam protection.  
❌ Persistence (no DB storage/audit trail); only email — no moderation, no analytics.  
❌ Role logic / visibility rules (who can submit, how often, from which contexts).  
❌ Backend review system (CPT, statuses, moderation, reply, publish pipelines).  
❌ i18n strings (some hard‑coded Hebrew and English).  
❌ Accessibility checks (labels, aria, focus order) and keyboard flow for multi‑step controls.  
❌ Unit/integration tests.

### Pending

⚙️ Multi‑step form scaffolding JS exists but only one active section; counter/next/prev not wired to real steps.  
⚙️ Campaign card shown in sidebar (recommend removing for launch).  
⚙️ Styling pass for small/mobile devices; ensure header image & form spacing consistent with other student pages.

### Post-Launch

🕓 Full Reviews backend (CPT `review`, taxonomy for type/topic, ACF group, moderation dashboard, publish rules).  
🕓 Email templates + notifications (HTML templates, per‑type routing, cc to mentor).  
🕓 Throttling & abuse controls (per user/day), reCAPTCHA/Turnstile, and server‑side rate limits.  
🕓 Analytics & reporting (volume by cohort, NPS trends, satisfaction distribution).  
🕓 Contextual entry points (post‑lesson, after grade posted, end‑of‑course).  
🕓 API/REST endpoints for SPA submission and staff tools.  
🕓 Optional public testimonials pipeline with consent capture.

---

## 🧠 Perspectives

| Aspect               | Observation                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX / Visual          | Clean hero, minimal form. Remove promo campaign card for launch. Add success message & inline validation.                                               |
| Logic / Code         | Simple `$_POST` handler with sanitization and `wp_mail()`. Needs nonce, error handling, and server‑side validation. Consider storing to CPT + emailing. |
| QA / Edge Cases      | Empty/partial submissions; duplicate sends on refresh; large payloads; non‑logged users; email failures; spam floods.                                   |
| Integration / System | No persistence or admin UI. Add CPT `review`, ACF group, notification routing (options table), and role‑based visibility.                               |

---

## 🎨 Visual Notes

No screenshots included. Quick launch hot‑fix: **hide campaign card** (`.card-campaign`) and keep a single column form.

---

## ⚙️ Technical Notes

- **Template**: `/* Template Name: Reviews */` + `acf_form_head(); get_header(); get_footer();`
- **Submission**: Checks `$_SERVER['REQUEST_METHOD'] == 'POST'`, sanitizes fields, builds plain‑text message, `wp_mail($recipient_email, $subject, $message, $headers)`, redirects to BuddyBoss profile.
- **Enqueue**: `enqueue_page_reviews_assets()` loads `page-reviews.css` and `page-reviews.js` when `is_page_template('page-reviews.php')`.
- **JS**: multi‑step scaffolding (`showStep`, next/prev handlers) — currently only one real section.
- **Immediate fixes**:
  - Add `wp_nonce_field('reviews_submit','reviews_nonce')` and `check_admin_referer('reviews_submit','reviews_nonce')`.
  - Server‑side validation + error array surfaced in UI.
  - Swap redirect for a thank‑you state to avoid duplicate posts; or add PRG pattern with query arg.
  - Rate‑limit (per user/day) and CAPTCHA.
  - Log failures from `wp_mail()`; optionally switch to HTML template.
  - Option page for routing emails by **review type**; or store in CPT and trigger emails via hooks.

**Suggested CPT sketch (post-launch):**

- `review` (title = student + context; meta: type, course, rating, message, consent, status).
- Taxonomies: `review_type`, `course`, `cohort`.
- Status workflow: `pending → reviewed → published` (optional public).

---

## ✅ Readiness

| Area        | Status | Comment                                                     |
| ----------- | ------ | ----------------------------------------------------------- |
| Visual      | ⚙️     | Looks consistent; remove promo card for launch.             |
| Logic       | ⚙️     | Works for email-only, but missing nonce/validation/storage. |
| QA          | ❌     | No explicit tests; edge cases not handled.                  |
| Integration | ❌     | No backend moderation or analytics.                         |

**Readiness %:** 35%  
**Launch Ready:** ⚙️ (hide for launch or ship minimal with nonce + spam controls; backend after GA)
