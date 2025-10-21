# 📄 Page Observation — Tickets (פניות ואישורים)

**Experience:** Student  
**Date:** 20 Oct 2025  
**File:** page-tickets.php (+ custom Buddypanel desktop/mobile, enqueue, CPT & mail hooks)

---

## 🧩 Planned Behavior

A fast, self-contained hub where students can 1) open a new ticket to a chosen sector and sub‑subject, and 2) view a clear history table with status, last update, feedback, and full modal view of message, attachments, and links — without relying on heavy global theme bootstrap.

---

## 🔍 Four Lenses

### Have

- Header hero, guidance copy, and two primary actions: “צור פנייה חדשה“ and “מעקב פניות“.
- ACF front‑end form creating a **ticket** post (draft) with sector, sub‑subject, title, and content; basic uploader.
- Student ticket table (WP_Query author scoped) with: created date, sector, sub‑subject, title, content modal, status, feedback, last modified.
- Content modal that parses and safely renders parts of `ticket_content` (paragraphs, images, anchors) with `wp_kses` allowlist and DOMDocument walk.
- Custom Buddypanel (desktop + mobile) decoupled from BuddyBoss; mobile slide‑in with avatar and quick links.
- JS controller to toggle create/history, open/close modals, and dynamically populate sub‑subjects by sector.
- Performance‑aware asset loading: selective enqueue (page‑template gate), local Select2 fallback, ACF assets, fonts, icons; nuked heavy header/footer injection on this page.
- Email notifications on submit: to student and sector team (sector‑specific option with default), HTML emails.
- Custom post type `ticket` with REST, archive support, and admin UI.
- Accessibility touches: ARIA toggles on submenu, modal close button, keyboard‑neutral interactions.

### Missing

- No pagination controls for ticket history (query is paged but UI controls absent).
- No search/filter (by status/date/sector) on the table.
- No file size/type validation UI and success/failure toasts.
- No autosave/draft indicator on ACF form; no “continue later” UX.
- No SLA/ETA hints or service hours; no status color legend.
- No inline reply thread or 2‑way messaging per ticket (only initial payload + staff feedback field).
- No rate‑limit/abuse guard in UI (honeypot exists server‑side only if any).
- No i18n domain consistency for all strings; mixed locales.
- No unit/e2e tests for JS behaviors (modals, select cascade).

### Pending

- Header.php full decoupling (colors/spacing to match global header, hero not fully full‑bleed on some breakpoints).
- Finalize sector email mapping settings UI (wp‑admin options) and validation.
- Ticket table row density on mobile (stacked design OK; needs sticky headers / better readability).
- Empty‑state for history (friendly illustration + primary CTA).

### Post-Launch

- Student-side ticket view page with timeline of staff actions and attachments.
- Real‑time updates via REST + polling or SSE (status/feedback changes).
- Bulk export for staff; BI hooks.
- Service health banner (known issues) above the form to deflect duplicates.
- Inline capture: Loom/Screen recording and drag‑drop uploads with progress.
- Role‑based canned responses and auto‑routing by class/cohort.
- Rate limiting, hCaptcha, and re‑submission cooling window.
- Notifications center (in‑app) + granular email preferences.
- Granular capabilities: instructors can see their class tickets.

---

## 🧠 Perspectives

| Aspect               | Observation                                                                                                                                                                                                                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX / Visual          | Clear two‑action hero and simple guidance. Table is readable on desktop; on mobile the stacked design works but long Hebrew strings wrap and push “תוכן הודעה“ button downward — consider compact pills and a slide‑over detail view instead of modal per row. Need color/status chips and SLA hints.                                                                      |
| Logic / Code         | Page template bypasses heavy `get_header/get_footer` injection and manually enqueues only what’s needed — big win. Author‑scoped `WP_Query` prevents leakage. DOM parsing isolates text, images, links; `wp_kses` allowlist is good. Sub‑subjects populated from a JS map; consider moving to ACF choices or JSON via `wp_localize_script` to keep single source of truth. |
| QA / Edge Cases      | Empty `ticket_content` handled; ensure DOMDocument isn’t created on empty to avoid warnings (already guarded). Validate large files/timeouts; verify multiple images/links ordering. Test RTL in modals and focus trap (Esc closes, return focus to trigger). Verify that drafts are promoted to publish by staff workflow.                                                |
| Integration / System | CPT `ticket` registered with REST; email triggers on `acf/save_post` send to student and sector mailbox (fallback to support@). Sector email pulled from `sector_email_<value>` option; confirm options exist in non‑prod. Enqueue gates by `is_page_template('page-tickets.php')` to keep scope tight.                                                                    |

---

## 🎨 Visual Notes

Screens: tickets-hero-desktop.png, tickets-hero-table.png, tickets-mobile-cta.png, tickets-mobile-table.png, tickets-modal.png

---

## ⚙️ Technical Notes

- Page template: **Tickets** hub; uses author‑scoped `WP_Query` with `post_type=ticket`, `posts_per_page=10`, `paged` param.
- ACF front-end form: `post_id=new_post`, `post_type=ticket`, initial status draft; fields: sector, sub‑subject, title, content (IDs used). Uploader set to basic.
- Security: allowlist `wp_kses` for p, br, strong, em, a(href,title,target), img(src,alt). Additional DOM parse to emit only text nodes for paragraphs, then echo saved img/a nodes with target=\_blank.
- JS controller: toggles create/history, opens/closes modals, closes on backdrop click, populates sub‑subjects based on selected sector; uses event listeners after DOMContentLoaded.
- Enqueue (page‑scoped): registers local Select2 if missing, loads ACF input assets, icons, custom CSS/JS; nukes heavy icon pack then restores local one to avoid duplication. Consider `wp_localize_script` for sectors list; consider code‑splitting and defer.
- Emails: on `acf/save_post` for `ticket` — prepares HTML emails to student and sector; supports per‑sector option. Add SPF/DKIM/DMARC check and `wp_mail_failed` logging.
- CPT: `ticket` public with UI, supports title/editor/custom-fields; show_in_rest true. Consider capability type and `map_meta_cap` for finer control.
- Repeated function declarations present in the snippet for `create_ticket_post_type` and enqueue; ensure only one definition remains to avoid fatals.
- Performance: page is decoupled from BuddyBoss heavy header/footer; Buddypanel is custom and lazy. Keep hero image optimized and use `loading=lazy` for non-critical images.

---

## ✅ Readiness

| Area        | Status | Comment                                                                                            |
| ----------- | ------ | -------------------------------------------------------------------------------------------------- |
| Visual      | ⚙️     | Polished; minor header/hero sizing and mobile density tweaks left.                                 |
| Logic       | ✅     | Core flows work: create ticket, list, modal view, emails.                                          |
| QA          | ⚙️     | Needs pagination UI test, attachment stress test, RTL focus trap, and email deliverability checks. |
| Integration | ⚙️     | Sector email options and role capabilities audit pending.                                          |

**Readiness %:** 85%  
**Launch Ready:** ⚙️ (soft launch acceptable; monitor and iterate)

---

### Suggested Fast Wins (no design dependency)

1. Add simple pagination UI (prev/next) bound to current query var.
2. Add status chips and color legend.
3. Push sectors/sub‑sectors via `wp_localize_script` to avoid duplicate sources.
4. Add `loading='lazy'` to hero image and modal images; compress hero.
5. Add `Esc` key close and focus return to modal trigger; prevent body scroll when modal open.
6. Add empty-state and success toasts.
