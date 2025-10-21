# 📄 Page Observation — Technical Support Page

**Experience:** Student  
**Date:** 20 Oct 2025  
**File:** Page template “Technical Support Guide” (custom PHP + inline JS/CSS)

---

## 🧩 Planned Behavior

A single, friendly info page that explains how to request help and funnels users to the existing external support form (Google Form) via one primary button.

---

## 🔍 Four Lenses

### Have

- Clear, RTL-friendly hero with explanatory copy and bullet points.
- One obvious CTA (“טופס תמיכה טכנית”) that opens the form in a new tab.
- Simple, low-risk implementation (no server processing on submit).
- Consistent visual style with site branding (gradient header, rounded cards).

### Missing

- No confirmation that the user is signed in or passes identity context to the form.
- No inline contact options (email/WhatsApp/KB links) for self-serve.
- No SLA/response-time expectations or operating hours.
- Accessibility hooks (button role/aria-label; list semantics are OK, CTA lacks a native `<button>`).
- Empty state/alternative when Google Forms is blocked.
- Analytics: no click tracking, UTM, or event for the CTA.

### Pending

- Responsiveness is mostly fine, but long body text wraps tight on mobile; consider larger line-height and max-width to improve readability.
- Button is a styled `<div>`; keyboard users can’t activate it (Enter/Space). Needs native element or JS key handlers.

### Post-Launch

- Embed the form (iframe) or migrate to on-site ACF/Gravity Forms for SSO prefill, file uploads, and better analytics.
- Automatic triage (topic → dynamic guidance or ticket routing).
- Status banner for platform-wide issues.
- “Before you submit” checklist with quick links to known fixes.
- Ticket history page for logged-in users.

---

## 🧠 Perspectives

| Aspect               | Observation                                                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UX / Visual          | Strong visual hierarchy and simple single-CTA flow. Tight paragraph tracking; increase line-height and max-width on text blocks. Add a secondary link to a knowledge base or “urgent issues” guidance.                                                             |
| Logic / Code         | Template is minimal: opens external URL on click. Replace styled `<div>` with `<a>` (href target=\_blank rel="noopener") or `<button>` plus JS. Consider passing context via querystring (user_id, course, role) so the form can prefill hidden fields.            |
| QA / Edge Cases      | If Google Forms is blocked by network/adblock → users stranded. If user is logged out, we still show page (OK) but we lose identity. Test RTL on small devices and high zoom; verify focus outline is visible; verify link works with keyboard and screen readers. |
| Integration / System | Currently off-site only. Next steps: webhooks to Slack/HubSpot/Zendesk, email confirmations, and SLA auto-replies. Consider rate-limit/captcha if migrating on-site.                                                                                               |

---

## 🎨 Visual Notes

Screens: desktop, tablet, and mobile variants show gradient hero, bullet list, and single CTA. The CTA sits near the fold and is easy to find; header image is placeholder and should be replaced with production artwork.

---

## ⚙️ Technical Notes

- Template registers ACF head and uses inline CSS/JS. Move CSS/JS to enqueued assets and scope with a page-specific body class.
- Replace the CTA container with a semantic element:  
  • Preferred: `<a class="support-button" href="https://forms.gle/..." target="_blank" rel="noopener">` with inner text and icon.  
  • If using `<button>`, attach click handler and set `type="button"`, also add keyboard activation and focus styles.
- Add attributes: `aria-label="פתיחת טופס התמיכה הטכנית בחלון חדש"`, `title="..."`.
- Prefill form via query params where possible: e.g., `?uid=123&name=First+Last&email=` and `course=`. Populate values from current user/course context.
- Analytics: fire an event on CTA click (e.g., `gtag('event','support_click',{location:'tech-support-page'})`) or Matomo equivalent.
- Content security: avoid inline JS where CSP may block; enqueue via `wp_enqueue_script`. Escape attributes/URLs with `esc_url`, `esc_attr`.
- Performance: lazy-load header image, provide real asset (not placeholder), include `width/height` to prevent CLS.
- Accessibility: ensure color contrast for purple on gradient; provide keyboard focus outline on CTA; ensure list bullets render in RTL correctly (they do, but verify).

---

## ✅ Readiness

| Area        | Status | Comment                                                                          |
| ----------- | ------ | -------------------------------------------------------------------------------- |
| Visual      | ⚙️     | Looks polished, but text density on mobile and placeholder hero need refinement. |
| Logic       | ⚙️     | Works as a pipe to Google Forms; improve semantics, accessibility, and prefill.  |
| QA          | ⚙️     | Basic path OK; add tests for adblock/offline/keyboard/screen reader/mobile zoom. |
| Integration | ❌     | No identity pass-through, analytics, or SLA messaging yet.                       |

**Readiness %:** 65%  
**Launch Ready:** ⚙️ (usable as-is, recommended to ship with quick fixes below)

---

### Ship-Now Quick Fixes (low effort)

1. Change CTA to semantic link/button with `target="_blank" rel="noopener"` and `aria-label`.
2. Add `gtag` (or Matomo) click event.
3. Pass user/email/course via query params to prefill the form (if allowed).
4. Tweak typography on mobile: increase line-height to ~1.6 and cap content width (~68ch).
5. Add one sentence with SLA/office hours and a fallback mailto in case the form is blocked.

### Next Iteration (small)

- Inline FAQ/KB links per common issues.
- Replace placeholder hero with optimized image and `loading="lazy"`.
- Provide a form embed (iframe) behind a toggle for users who prefer staying on-site, with a direct-link fallback.
