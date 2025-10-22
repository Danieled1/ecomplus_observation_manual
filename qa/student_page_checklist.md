# Student Experience — Per-page manual checklist

Use this checklist for each page under the Student experience. Mark Pass/Fail and attach Evidence IDs.

Shared checks (every page)

- [ ] HTTP 200 within 5s
- [ ] RTL layout visually correct (no horizontal scroll)
- [ ] Mobile responsive (320px & 375px) — main CTA visible
- [ ] No console errors (0 critical errors)
- [ ] Error/empty states present and informative
- [ ] Strings localized (no hard-coded English)

Page-specific checks

Login

- [ ] Role-based redirect works (Admin/Instructor/Student)
- [ ] Nonce present & validated server-side
- [ ] Password visibility toggle works and accessible
- [ ] Forgot-password link exists and triggers recovery

Dashboard

- [ ] Personalized cards show last activity and correct numbers
- [ ] Course progress links navigate correctly
- [ ] No layout break with >10 items

Course single

- [ ] Resume link points to next actionable step
- [ ] Video preview opens and plays (captions if provided)
- [ ] Empty-state shows guidance when no lessons
- [ ] Progress infobar shows correct % and last activity

Lesson

- [ ] Mark-complete updates progress immediately
- [ ] Gating works (locked lessons show message)
- [ ] Assignment list shows attachments and statuses

Grades

- [ ] AJAX returns only current user data
- [ ] Table renders correctly on mobile
- [ ] Empty state and retry for network errors

Tickets

- [ ] Create ticket form validates inputs and file sizes
- [ ] Ticket appears in history for the user
- [ ] Email notification sent to sector address

Placement

- [ ] Resume upload stores file and triggers notification
- [ ] Job status reflects ACF user meta
- [ ] Resume file size/type validation present

Reviews

- [ ] Form has nonce and server validation
- [ ] Submission acknowledgement shown (or redirect)
- [ ] Throttle protections or rate-limit noted

Profile

- [ ] XProfile fields display correctly
- [ ] Edit button visible to owner only
- [ ] Dynamic group tabs appear and load content

How to use

- For each failed check, capture evidence using `qa/evidence_template.md` and update `DEFECTS.csv` with the Evidence ID.
