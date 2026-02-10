# Mobile, Feedback, Payment & UX — 25-Item Plan

## 1. Feedback & homepage
1. **Real feedback below hero** — Show real (featured) feedback in a horizontal strip directly below the hero section (desktop and mobile).
2. **Download → feedback popup** — After user clicks Download PDF and PDF is generated, show a feedback modal: optional rating/message, **Skip**, **Stay** (close, remain on preview), **Done** (redirect to homepage).
3. **Paid-user feedback** — When user has paid/unlocked, optional question in feedback: "Did you get what you were looking for?" (yes/no) for validation.
4. **Feedback persistence** — Save feedback via API or localStorage; admin dashboard can show submissions (existing `api/admin/feedback` + MongoDB when configured).

## 2. Mobile section list & target role/JD
5. **Section list compact** — Reduce "RESUME BUILDER" and "Vertical Flow Interface" text size; tighten vertical spacing so section cards fit with less scroll.
6. **Section cards** — Slightly smaller labels and padding; keep touch targets ≥44px.
7. **Target role page** — Experience Level + Target Market: already 2-col on small breakpoint; reduce `space-y-12` to `space-y-6`, smaller heading text.
8. **JD textarea** — Keep optional; reduce vertical padding so page is shorter.
9. **Unscrollable goal** — Where possible, reduce padding/margins so section list and target-role form need minimal or no scroll on typical phones.

## 3. Mobile preview (resume frame)
10. **A4 shape & scaling** — Mobile preview: ensure document frame uses A4 aspect ratio and scales to width; no horizontal overflow.
11. **Text legibility** — Font sizes in mobile preview readable; no cut-off (e.g. SKILLS section).
12. **Profile photo** — Ensure uploaded photo shows on resume (right side or as per template) when `photoUrl` + `includePhoto` are set.
13. **Vertical length** — Single-page view with scroll is acceptable; ensure content is not cropped and page indicator (Page 1/2) is clear.

## 4. Payment
14. **Payment flow audit** — Document: create order → redirect PayU → webhook → unlock; ensure no 500 when MongoDB missing.
15. **Frontend error handling** — "Payment temporarily unavailable" when backend fails; disable Pay button and show message.
16. **Success/failure UX** — Clear banners on return from PayU (verified / failed / delayed); poll unlock status when payment=success.
17. **Amount & product** — Ensure ₹49 and product description match PayU and UI.

## 5. Admin & data
18. **Admin dashboard** — List payments and feedback; real-time when API is used (poll or refresh).
19. **Feedback API** — POST feedback (session, page, message, type, paid flag); GET for admin (existing structure).
20. **Database** — Use existing MongoDB URL/context for payments and feedback collections; env vars for connection.

## 6. UX polish
21. **Sticky CTA** — Mobile editor: single sticky "Save & Preview" or "Preview resume"; no duplicate CTAs.
22. **Consistent copy** — "Preview your resume exactly as it will appear in the PDF"; "Unlock ATS-Optimized Wording — ₹49 one-time."
23. **Legal footer** — Name, address, pricing visible (done for PayU).

## 7. Code & quality
24. **MCP / Stitch** — Use for API or external services if integrated; keep frontend logic in repo.
25. **Modern styles** — Consistent spacing, touch targets, and contrast; fix any broken layout or overflow.

---

**Priority order for implementation:**  
Feedback (hero strip + download popup) → Mobile compact (sections + target/JD) → Mobile preview fixes → Payment audit → Admin/DB wiring.
