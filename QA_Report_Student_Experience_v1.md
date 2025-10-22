# QA Report — Student Experience v1

Scope: Student only
Decision: Pending

## AI-assisted draft — Readiness table (initial)

| Page            | Readiness % | Have                                             | Missing                                          | Pending                                     | Top blocker                              | Evidence |
| --------------- | ----------: | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------- | ---------------------------------------- | -------- |
| Login           |         85% | Role-based redirects, Hebrew localization, nonce | Forgot-password link, password visibility toggle | Mobile RTL polish, accessibility            | Forgot-password missing                  | EVID-001 |
| Dashboard       |         80% | Personalized cards, status cards                 | Central metrics widget                           | Performance metrics integration             | Performance metrics not present          | EVID-002 |
| Course (single) |         87% | Resume logic, progress infobar, video preview    | Empty states, loading skeletons                  | Resume re-targeting audit for large courses | Missing empty-state & loaders            | EVID-003 |
| Lesson          |         85% | Content + video, gating, sidebar checklist       | Sticky mobile complete CTA, transcript           | Video UX polish (captions/resume)           | Sticky complete button missing on mobile | EVID-004 |
| Grades          |         85% | AJAX fetch, table render, caching                | Export/filters, empty state polish               | Loading skeletons & UX polish               | Missing export/filtering                 | EVID-005 |
| Tickets         |         85% | ACF form, list, email notifications              | Pagination UI, file validation                   | Threaded replies, 2-way messaging           | No pagination & file validation          | EVID-006 |
| Placement       |         80% | Resume upload (ACF), status widgets              | Resume versioning, inline editing                | Company card conditional rendering          | Resume versioning absent                 | EVID-007 |
| Reviews         |         35% | Simple form and email send                       | Nonce/CSRF, persistence, moderation              | Backend CPT + moderation                    | No nonce & no persistence                | EVID-008 |
| Profile         |         88% | XProfile display, group tabs, campaign cards     | Campaign data binding, empty-state messages      | AJAX tab switching                          | Campaign placeholders                    | EVID-009 |

---

## Per-page AI stubs (short observations and suggested checks)

### Login

- Files: `page-custom-login.php` (child theme)
- Key checks: role-based redirect, nonce present, password toggle, forgot-password link
- Suggested repros: invalid credentials, multi-role account redirect, password toggle keyboard test

### Dashboard

- Files: (dashboard template snippets in `CONTEXT.txt`)
- Key checks: cards accuracy, CTA navigation, performance under load (large course lists)
- Suggested repros: login → dashboard for sample student; open 10+ course cards; measure load

### Course (single)

- Files: `template-parts/learndash/single-course.php` or child override
- Key checks: Resume target correctness, video playback, empty-state rendering
- Suggested repros: open small/normal/large course, click resume, test preview open/close and accessibility

### Lesson

- Files: `learndash/ld30/lesson.php` and modules
- Key checks: gating logic, assignments visibility, mark-complete flow, next/prev behavior
- Suggested repros: open locked lesson, verify gating message; complete lesson and verify progress

### Grades

- Files: `page-grades.php`, `page-grades.js`
- Key checks: AJAX returns only student data, table renders, export placeholder
- Suggested repros: run AJAX in devtools; simulate no grades; attempt export (if present)

### Tickets

- Files: `page-tickets.php`, ticket CPT registration, ACF form
- Key checks: create ticket, email notification, modal content safety, pagination check
- Suggested repros: create 2 tickets (text only, attachments) and inspect email and history

### Placement

- Files: `page-placement.php`, ACF user fields
- Key checks: resume upload, email notifications, job status mapping
- Suggested repros: upload small/large file; check resulting email and meta update

### Reviews

- Files: `page-reviews.php`
- Key checks: nonce present, server validation, persistence strategy
- Suggested repros: submit review; watch for nonce validation and saved record (if any)

### Profile

- Files: `buddypress/members/single/profile/*.php`
- Key checks: XProfile fields rendering, dynamic group tabs, edit link visibility
- Suggested repros: view own profile, view another user, toggle group membership to see tab changes

---

_Note: these AI stubs are intended as a starting point for manual verification. Add EVID-00X entries as you capture screenshots/logs during manual checks._

---

## Remediation suggestions (initial)

| Evidence | Top blocker                              | Suggested fix (concise)                                                                                                                 | Suggested owner | Estimate |
| -------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------: |
| EVID-001 | Forgot-password missing                  | Add 'Forgot password' link to `page-custom-login.php`, wire to WP lost password flow and test email templates. Include i18n.            | dev-auth        |       1h |
| EVID-002 | Performance metrics not present          | Add admin-only metrics widget or link to a lightweight metrics page; consider simple DB queries for key KPIs.                           | dev-analytics   |       2h |
| EVID-003 | Missing empty-state & loaders            | Implement skeleton loaders and empty-state copy in course single template; centralize translations.                                     | dev-ux          |       3h |
| EVID-004 | Sticky complete button missing on mobile | Implement sticky footer action when lesson content scrolls past X px; ensure accessible focus and keyboard support.                     | dev-ux          |       2h |
| EVID-005 | Missing export/filtering                 | Add export CSV endpoint and client-side filter controls for `page-grades.php` (export limited to user data).                            | dev-data        |       4h |
| EVID-006 | No pagination & file validation          | Add pagination controls to tickets history and implement file type/size checks on ACF upload with user-friendly errors.                 | dev-tickets     |       3h |
| EVID-007 | Resume versioning absent                 | Implement simple resume version meta on user (store last N uploads, show history).                                                      | dev-placements  |       4h |
| EVID-008 | No nonce & no persistence                | Add `wp_nonce_field()` and `check_admin_referer()` to reviews form; store submissions in `review` CPT and create admin moderation view. | dev-forms       |       5h |
| EVID-009 | Campaign placeholders                    | Wire campaign cards to path/group metadata; fallback to CTA to request campaign data.                                                   | dev-profile     |       2h |

# QA Report — Student Experience v1

Scope: Student only
Decision: Pending

## Expanded AI-first observations (appendix)

This appendix contains the AI-expanded observations that augment the per-page stubs above. Use these to guide manual checks and to seed additional rows in `DEFECTS.csv` when you capture evidence.

- i18n gaps: look for hard-coded English strings in templates and JS.
- Accessibility: check modals (focus trap), aria attributes on interactive controls, and keyboard navigation for cards and galleries.
- Performance: profile pages that iterate LearnDash queries for each card (possible N+1 queries). Run a quick query count or watch request times in HAR.
- Security: audit AJAX endpoints for proper current_user_can() checks and ensure student endpoints do not return other users' data.
- Email: verify `wp_mail()` calls on Tickets/Placement/Reviews and watch for failed deliveries in staging.

---

## Puppeteer scaffold added

See `qa/puppeteer/README.md` for instructions on running basic automated flows (login, open course, open lesson, tickets, grades). The script saves screenshots and a HAR file to `qa/puppeteer/output/`.

Run the script locally and upload the `qa/puppeteer/output/` files into `qa/evidence/` using the Evidence template — I will ingest them and expand the defects automatically.
