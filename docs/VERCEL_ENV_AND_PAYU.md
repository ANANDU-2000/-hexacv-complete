# Vercel environment variables and PayU

## Do NOT commit PayU keys

- **PayU_KEY** and **PayU_SALT** must **never** be in the repo or in a file that gets committed.
- `.env` is in `.gitignore` — use it only **locally**. Do not add `.env` to Vercel; use the Vercel Dashboard instead.

---

## Where real PayU tests will work

PayU (create order + webhook + unlock) works only if the **server** has the PayU env vars. So:

| Where you run | PayU vars set in | Real/sandbox PayU works? |
|---------------|-------------------|---------------------------|
| **Local** (`npm run dev` only) | — | No (API not running) |
| **Local** (`npm run dev:full` or `vercel dev`) | Local `.env` | Yes (test PayU URL) |
| **Vercel (production/preview)** | **Vercel Dashboard → Project → Settings → Environment Variables** | Yes (if you add the vars below) |

So: **real tests work on the live site only after you add the PayU variables in the Vercel project.**

---

## What to add in Vercel (Dashboard only)

In **Vercel → Your Project → Settings → Environment Variables**, add:

| Variable | Required | Description |
|----------|----------|-------------|
| **PAYU_KEY** | Yes | PayU merchant key (from PayU dashboard). |
| **PAYU_SALT** | Yes | PayU salt for hash (from PayU dashboard). |
| **PAYU_PAYMENT_URL** | No | Default: `https://test.payu.in/_payment`. For production use `https://secure.payu.in/_payment`. |
| **PAYU_SUCCESS_URL** | No | Full URL PayU redirects to on success (e.g. `https://www.hexacv.online/preview?payment=success`). If empty, build from request origin. |
| **PAYU_FAILURE_URL** | No | Full URL on failure (e.g. `https://www.hexacv.online/preview?payment=failure`). |

- Do **not** put these in the repo or in any committed file.
- After adding/editing, **redeploy** so the serverless API picks them up.

---

## Other useful Vercel variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| **OPENAI_API_KEY** | `api/rewrite/paid.ts` | Paid rewrite (server-side). |
| **VITE_GROQ_API_KEY** | Frontend (free rewrite) | Build-time / client. |
| **VITE_GEMINI_API_KEY** | Frontend (free rewrite) | Build-time / client. |
| **VITE_API_URL** | Optional | Backend API base URL. |
| **INSFORGE_SERVICE_KEY** | Future API routes | InsForge DB (server). |
| **ADMIN_SECRET_KEY** | `api/admin/*` | Protect admin endpoints. |

---

## Troubleshooting 500 on `/api/orders/create`

If the payment flow returns **500** in production or test:

1. **Check env on Vercel**  
   In **Vercel → Project → Settings → Environment Variables**, confirm **PAYU_KEY** and **PAYU_SALT** are set for the same environment (Production/Preview) you’re testing. If either is missing, the API returns **503** (“Payment not configured”), not 500.

2. **Redeploy**  
   After changing env vars, trigger a new deployment so the serverless function gets the new values.

3. **Check function logs**  
   In **Vercel → Project → Deployments → [latest] → Functions**, open the log for the deployment and trigger a payment again. The handler logs `Create order error: <message>` on failure; that message tells you what threw (e.g. body parsing, hash, or store).

4. **503 vs 500**  
   - **503** = PayU not configured (add PAYU_KEY + PAYU_SALT in Vercel, then redeploy).  
   - **500** = Exception inside the handler; use the logs from step 3 to fix.

---

## Summary

- **PayU:** Do not add to repo. Add **PAYU_KEY** and **PAYU_SALT** (and optional PayU URLs) **only in Vercel Environment Variables** so real payment tests work on the deployed site.
- **Local:** Use `.env` for PayU + OpenAI; run `npm run dev:full` so the API has access to them.
