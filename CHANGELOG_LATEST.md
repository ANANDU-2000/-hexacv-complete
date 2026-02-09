# Latest build – what’s new (push this to GitHub)

## Summary
- **UX & copy:** Calmer preview, non‑judging ATS labels, standardized ₹49 paid CTA, trust copy.
- **Payments:** Fixed wrong amount (₹49 not ₹4900), webhook works across serverless (DB-backed).
- **Admin:** Real payments/feedback from Postgres; payment status API; paid rewrite gated by payment.

---

## 1. Preview & editor UX
- **Preview (desktop):** Fit-to-width A4 by default; zoom/percent hidden until “Zoom” clicked; page shadow/border; template & ATS panels hidden by default; “Page 1 of N” when multiple pages.
- **Editor:** “Build a clean, ATS-safe resume” + subtext; step indicator removed; ATS panel shows “ATS feedback available” / “Keyword suggestions ready” (no 0/100 by default).
- **ATSScoreCard:** Softer copy; no “ATS SCORE: 0/100”; suggestions instead of judgments.

## 2. Paid CTA & trust copy
- All paid CTAs: **“Improve wording for ATS – ₹49 (one-time)”** / **“ATS Optimized Version — ₹49 (one-time)”**.
- Trust line: “One-time ₹49 • Secure PayU • No auto-debit”; free PDF “no watermark”; “This format is safe for ATS”.
- Legal (Terms/Pricing) and templates updated to same wording.

## 3. Payment fixes
- **Amount:** Frontend now sends **49** (rupees). Backend normalizes (e.g. 4900 → 49) so PayU always shows **₹49**.
- **Webhook:** No longer depends on in-memory order. Uses DB: create order inserts **PENDING** row; webhook finds by `gateway_order_id`, verifies hash, sets **PAID**, unlocks. Works on any Vercel instance when **DATABASE_URL** is set.
- **New:** `api/lib/db.ts` (Postgres), `api/payments/status.ts` (GET ?session_id= for unlock check). `api/orders/create.ts` persists order to `payments`; `api/payments/webhook.ts` uses DB when order not in memory.

## 4. Admin dashboard
- **Admin APIs:** `GET /api/admin/payments` (totals + list from DB), `GET /api/admin/feedback` (from DB). Auth: `x-admin-key` or `?adminKey=`.
- **AdminDashboard.tsx:** Fetches real payments + feedback; hero shows “Paid unlocks” and “Revenue (₹)” from API.

## 5. ATS / paid rewrite
- **Paid rewrite:** `api/rewrite/paid.ts` checks payment status in DB (`status = PAID` for session); returns 402 if not paid; no OpenAI call for free users.
- Free ATS remains rule-based only.

## 6. Dependencies & docs
- **package.json:** Added `pg`, `@types/pg` for Postgres.
- **docs/VERCEL_ENV_AND_PAYU.md:** Wrong amount + “transaction failed” troubleshooting; **payments** table SQL (with `gateway_order_id` unique).

---

## Files changed (for your push)

**New:** `api/lib/db.ts`, `api/admin/feedback.ts`, `api/payments/status.ts`  
**Modified:**  
`api/orders/create.ts`, `api/payments/webhook.ts`, `api/admin/payments.ts`, `api/rewrite/paid.ts`,  
`src/pages/PreviewPage.tsx`, `src/pages/EditorPage.tsx`, `src/components/AdminDashboard.tsx`,  
`src/ui/editor/ATSScoreCard.tsx`, `src/ui/preview/OptimizationPanel.tsx`, `src/core/rewrite/paidRewrite.ts`,  
`src/core/delivery/templates.ts`, `src/templates/paid/premium.ts`, `src/pages/legal/*`, `src/pages/FreeATSResumeBuilder.tsx`,  
`src/utils/abTesting.ts`, `package.json`, `docs/VERCEL_ENV_AND_PAYU.md`

---

## Before you push

1. **Remove Git lock (if you see “index.lock” error)**  
   Close any Git GUI/editor, then delete:  
   `.git/index.lock`

2. **Finish rebase (if Git says “currently rebasing”)**  
   - If you had conflicts and fixed them:  
     `git add -A`  
     `git rebase --continue`  
   - Or to abort rebase and keep your current branch as-is:  
     `git rebase --abort`

3. **Then add, commit, push**  
   ```bash
   git add -A
   git commit -m "UX plan + payment fix (₹49, DB webhook) + admin APIs + paid rewrite gate"
   git push origin main
   ```

4. **After push**  
   - Run `npm install` (for `pg`).  
   - In Vercel: set **PAYU_KEY**, **PAYU_SALT**, and (for reliable payments) **DATABASE_URL**; create **payments** table (see docs/VERCEL_ENV_AND_PAYU.md).
