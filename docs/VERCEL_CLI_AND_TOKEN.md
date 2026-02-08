# Vercel CLI – token, connect, and run

Your project is already on Vercel as **hexacv-admin-web** and live at **www.hexacv.online**. Pushes to `main` on [GitHub - ANANDU-2000/-hexacv-complete](https://github.com/ANANDU-2000/-hexacv-complete) auto-deploy. This doc is for using the **Vercel CLI** from your PC (token, link project, run locally/deploy).

---

## 1. Get and save your Vercel CLI token

### Option A: Login in terminal (easiest – no token file)

In PowerShell:

```powershell
cd "C:\Users\anand\OneDrive\Desktop\-hexacv-complete-main"
vercel login
```

- It will show a URL (e.g. https://vercel.com/oauth/device?user_code=XXXX).
- Open that URL in the browser, log in with the same account as the Vercel dashboard (**anandukrishnapa2000-gmailcom**).
- Approve the device, then go back to the terminal and press Enter.
- After “Congratulations! You are now signed in”, the CLI is connected. No token file to manage.

### Option B: Use a token (for scripts or CI)

1. In the browser: **[Vercel Dashboard](https://vercel.com) → Profile (bottom-left) → Settings → Tokens** (or go to https://vercel.com/account/tokens).
2. Click **Create Token**.
3. Name it (e.g. `hexacv-cli`), choose scope (e.g. Full Account or the hexacv project), set expiry.
4. Copy the token (you only see it once).
5. **Save it** (only on your machine, never commit):
   - **Option 1 – env:** Add to your project `.env` (or a local `.env.local`):
     ```env
     VERCEL_TOKEN=your_token_here
     ```
   - **Option 2 – global:** In PowerShell (one time):
     ```powershell
     $env:VERCEL_TOKEN = "your_token_here"
     ```
     To make it permanent for your user, add the same line to your PowerShell profile.
6. Use the CLI; it will read `VERCEL_TOKEN` automatically.

---

## 2. Connect this folder to your Vercel project (one time)

From your project folder:

```powershell
cd "C:\Users\anand\OneDrive\Desktop\-hexacv-complete-main"
vercel link
```

- **Set up and develop?** → **Y**
- **Which scope?** → choose **anandukrishnapa2000-gmailcom's projects** (Enter).
- **Link to existing project?** → **Y**
- **What’s the name of your existing project?** → **hexacv-admin-web** (same as in the dashboard).

This creates a `.vercel/project.json` in the folder (you can commit it so the same project is used from every clone).

---

## 3. Run and deploy yourself

### Local dev with API (frontend + `/api` routes)

```powershell
cd "C:\Users\anand\OneDrive\Desktop\-hexacv-complete-main"
npm run dev:full
```

- Uses your saved login or `VERCEL_TOKEN`.
- Answers the same “Set up and develop?” / “Which scope?” as above if not linked yet.
- Opens a URL like **http://localhost:3000** – use that to test payment/API locally.

### Deploy from your PC (without pushing to GitHub)

```powershell
cd "C:\Users\anand\OneDrive\Desktop\-hexacv-complete-main"
vercel
```

- First time: same scope/project prompts; choose **hexacv-admin-web** if asked.
- Deploys a **preview** (new URL). To deploy to **production** (what www.hexacv.online uses):

```powershell
vercel --prod
```

---

## 4. Update / run summary

| Goal | Command |
|------|--------|
| Save CLI auth (no token file) | `vercel login` |
| Save token in env | Add `VERCEL_TOKEN=...` to `.env` or `$env:VERCEL_TOKEN` |
| Connect folder to hexacv-admin-web | `vercel link` → choose existing project **hexacv-admin-web** |
| Local dev with API | `npm run dev:full` |
| Deploy preview | `vercel` |
| Deploy production | `vercel --prod` |
| Auto-deploy (no CLI) | Push to `main` on GitHub → Vercel deploys (already set up) |

---

## 5. Billing warning on the dashboard

If you see **“The billing address on your payment method is missing or incomplete”** in the Vercel dashboard, that’s about your **payment method**, not the CLI token. Fix it in **[Vercel → Account Settings → Billing](https://vercel.com/account/billing)** if you use paid features; it doesn’t block CLI login or token use.

---

**Quick start from scratch:**  
Run `vercel login`, then `vercel link` in your project folder and choose **hexacv-admin-web**. After that, `npm run dev:full` and `vercel` / `vercel --prod` will use that project and your saved auth.
