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
| **MONGODB_URI** (or **DATABASE_URL**) | `api/lib/mongo.ts`, payments/feedback/admin APIs | MongoDB connection string for payments and feedback. **Required** for order creation, webhook, payment status, and admin dashboards. Do not commit the connection string; set it only in Vercel and local `.env`. |

---

## Troubleshooting 500 on `/api/orders/create`

If the payment flow returns **500** in production or test:

1. **Check env on Vercel**  
   In **Vercel → Project → Settings → Environment Variables**, confirm **PAYU_KEY** and **PAYU_SALT** are set for the same environment (Production/Preview) you’re testing. If either is missing, the API returns **503** (“Payment not configured”), not 500.

2. **Redeploy after every change**  
   **Latest push must be deployed.** After changing env vars or any code (including `api/` and `api/lib/`), trigger a new deployment so the serverless functions get the new values. If you don’t redeploy, production will keep running the old build (old UX, old API, old mobile).

3. **`ERR_MODULE_NOT_FOUND: api/lib/store`**  
   If the logs show “Cannot find module …/api/lib/store”, the deployment is missing the `api/lib` files or is using an old build. Ensure `api/lib/store.ts` and `api/lib/payu.ts` exist in the repo and that your API routes import them with the **`.js`** extension (e.g. `from '../lib/store.js'`). Then push and **redeploy** so Vercel includes them in the function bundle.

4. **Check function logs**  
   In **Vercel → Project → Deployments → [latest] → Functions**, open the log for the deployment and trigger a payment again. The handler logs `Create order error: <message>` on failure; that message tells you what threw (e.g. body parsing, hash, or store).

5. **503 vs 500**  
   - **503** = PayU not configured (add PAYU_KEY + PAYU_SALT in Vercel, then redeploy).  
   - **500** = Exception inside the handler; use the logs from step 4 to fix.

---

## Wrong amount (e.g. ₹4999) or “transaction failed” every time

- **Wrong amount**  
  PayU expects the **amount in rupees** (e.g. `49` for ₹49). The app now sends **49** from the frontend and the backend clamps/ignores paise (e.g. if `4900` was sent by mistake, it is treated as ₹49). So you should see **₹49** on the PayU page.

- **“Transaction failed” or “Order not found”**  
  Orders must be persisted so the webhook (which may run on a different serverless instance) can find them.  
  **Fix:** Set **MONGODB_URI** (or **DATABASE_URL**) in Vercel to your MongoDB Atlas connection string. Then:
  - Creating an order writes a **PENDING** document to the `payments` collection (so any instance can see it).
  - The webhook finds the payment by `gateway_order_id`, updates it to **PAID**, and records `paid_at`. No SQL tables needed.

- **MongoDB collections (payments & feedback)**  
  The app uses two collections. They are created automatically when first used; you can also create them and a unique index on `gateway_order_id` for `payments`:
  - **payments:** `session_id`, `gateway_order_id` (unique), `receipt_id`, `amount_paise`, `status` ('PENDING' | 'PAID'), `email`, `created_at`, `paid_at`.
  - **feedback:** `session_id`, `page`, `message`, `email`, `type`, `status`, `created_at`.
  Do **not** commit your MongoDB connection string; set **MONGODB_URI** only in Vercel and local `.env`.

---

## Summary

- **PayU:** Do not add to repo. Add **PAYU_KEY** and **PAYU_SALT** (and optional PayU URLs) **only in Vercel Environment Variables** so real payment tests work on the deployed site.
- **Local:** Use `.env` for PayU + OpenAI; run `npm run dev:full` so the API has access to them.
- **Amount:** Always **49** (rupees) for ₹49; PayU shows the same.
- **Reliable webhook:** Set **MONGODB_URI** (or **DATABASE_URL**) to your MongoDB connection string so every instance can read/update payments and mark them PAID.
