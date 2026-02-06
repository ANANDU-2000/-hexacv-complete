# HexaCV – One guide (UI, backend, connection, employees, deploy, new repo push)

**Repo:** https://github.com/ANANDU-2000/-hexacv-complete

Everything in one place: where to edit UI and each page, where to add/duplicate backend API, how frontend and backend connect, and how to run, deploy, and push to the new repo (terminal commands).

---

## 1. Where to edit UI (each page)

| Page / screen | File to edit |
|---------------|--------------|
| Homepage, hero | `src/components/Hero.tsx` |
| Goal step | `src/components/GoalStep.tsx` |
| Role / market step | `src/components/RoleMarketStep.tsx` |
| JD (job description) step | `src/components/JDStep.tsx` |
| Reality check | `src/components/RealityCheckStep.tsx`, `RealityDashboard.tsx`, `RealityPanel.tsx` |
| Fixes explained | `src/components/FixesExplainedStep.tsx` |
| Rewrite options | `src/components/RewriteOptionsStep.tsx` |
| Download checklist | `src/components/DownloadChecklistStep.tsx` |
| Editor (desktop) | `src/components/Step2Editor.tsx`, `Step2Templates.tsx`, `Step2AlignDesign.tsx` |
| Preview & export | `src/components/Step3Preview.tsx`, `Step3Finalize.tsx`, `Step3TemplateExport.tsx` |
| Mobile flow | `src/components/mobile/MobileEditor.tsx`, `MobileFinalPreview.tsx`, `MobileTemplateExport.tsx`, etc. |
| Admin login / dashboard | `src/components/AdminAuth.tsx`, `AdminDashboard.tsx` |
| Shared UI (buttons, stepper) | `src/components/ui/` |
| App flow / steps | `src/AppNew.tsx` |
| Global styles | `src/index.css`, `src/mobile.css`, `src/design_overrides.css`, `src/fix_modal.css` |
| Resume PDF layout | `public/templates/*.html` and `src/template-engine.ts`, `src/template-renderer.tsx` |

**Rule:** One screen = one component. Edit that file only so others don't get merge conflicts.

---

## 2. Backend: new API and duplicate

- **Where APIs live:** `backend/src/routes/`. One file per area (e.g. `ai-rewrite.ts`, `orders.ts`, `admin.ts`).
- **Add new API:** Create a new file in `backend/src/routes/` (e.g. `myfeature.ts`), add routes, then in `backend/src/server.ts` add `app.use('/api/myfeature', myfeatureRouter)`.
- **Duplicate an API:** Copy the route file (e.g. `feedback.ts` → `feedback-v2.ts`), change the logic, then in `server.ts` mount the new router (e.g. `app.use('/api/feedback-v2', feedbackV2Router)`).
- **DB:** `backend/src/db/index.ts` (client); migrations in `database/migrations/*.sql`. Run migrations from backend: `npm run migrate`.

**Existing route files:** `ai-rewrite.ts`, `analytics-v2.ts`, `orders.ts`, `templates.ts`, `admin.ts`, `feedback.ts`, `categorization.ts`, `intelligence.ts`, `llm.ts`. Frontend calls these via `src/services/` (e.g. `paidAIRewriteService.ts`, `api-service.ts`).

---

## 3. Connection (frontend ↔ backend)

- **Frontend calls backend** using `VITE_API_URL` from env. All API calls go through `src/api-service.ts` or specific services in `src/services/` (e.g. `paidAIRewriteService.ts`). No raw fetch URLs in components.
- **Env:** Root `.env`: `VITE_API_URL=http://localhost:3001` (dev) or your API URL (prod). Backend `.env`: `PORT`, `DATABASE_URL`, API keys, etc. **Never commit `.env`**; use `.env.example` as template. All secrets (API keys, tokens, passwords) go in `.env` only, never hardcoded in code.
- **Contract:** Backend route = one API surface. Frontend has one service file per area that calls that route. To add a new API: add route in backend, add or update a service in `src/services/`, use it from the component.
- **Security:** No API keys, tokens, or passwords in code files. Use `import.meta.env.VITE_*` (frontend) or `process.env.*` (backend). GitHub will block pushes if it detects secrets in code.

---

## 4. Employee guidance (who edits what)

| Role | Edit only | Do not edit |
|------|-----------|-------------|
| UI / Frontend | `src/components/`, `src/index.css`, `src/mobile.css`, `public/templates/` | `backend/`, `database/` |
| Backend | `backend/src/routes/`, `backend/src/db/`, `database/migrations/` | `src/components/`, root build config |
| Full-stack / lead | Any; coordinate so one person owns one area per PR | – |

**Rule:** One area per PR. Don't mix frontend and backend in the same PR unless agreed. Reduces merge conflicts.

---

## 5. Run and deploy

- **Run frontend:** From project root: `npm install` then `npm run dev` → http://localhost:5173
- **Run backend:** `cd backend`, `npm install`, `npm run dev` → http://localhost:3001
- **Build:** Root: `npm run build`. Backend: `cd backend && npm run build`
- **Push:** `.\push-and-deploy.ps1 "message"` or `git add .` → `git commit -m "..."` → `git push origin main`. Remote: https://github.com/ANANDU-2000/-hexacv-complete.git

**Vercel (Frontend):**
1. Go to https://vercel.com/dashboard → Project `prj_ZLUzdW0OdMAQt8iXFBQ7jbPmmwCY`
2. Settings → Git → Connect `-hexacv-complete` repo
3. Settings → Environment Variables → Add (IMPORTANT: Use HTTPS, not HTTP):
   - `VITE_API_URL=https://api.hexacv.online` (must be HTTPS!)
   - `VITE_OPENAI_API_KEY=sk-your-key` (get from https://platform.openai.com/api-keys)
   - `VITE_GEMINI_API_KEY`, `VITE_GROQ_API_KEY` (optional)
4. Push to `main` → Auto-deploys

**Fix Mixed Content Error:** If you see "Mixed Content" errors, ensure `VITE_API_URL` uses `https://` not `http://` in Vercel environment variables.

**AWS EC2 (Backend) - Run on EC2:**
```bash
ssh -i key.pem ubuntu@ec2-ip
cd ~/hexacv
git remote set-url origin https://github.com/ANANDU-2000/-hexacv-complete.git
git pull origin main
cd backend
echo "OPENAI_API_KEY=sk-your-key" >> .env
npm install --production
npm run db:migrate
npm run build
pm2 restart hexacv-backend
pm2 logs hexacv-backend
```

---

## 6. Push to GitHub

**Normal push:**
```powershell
.\push-and-deploy.ps1 "Your commit message"
```

**Or manually:**
```bash
git add -A
git commit -m "Your commit message"
git push origin main
```

**Authentication:** Use **Personal Access Token** as password (create at https://github.com/settings/tokens, scope `repo`).

---

## 7. Environment Variables

**Frontend (.env in root):**
- `VITE_API_URL` - Backend API URL
- `VITE_GEMINI_API_KEY` - Gemini AI key (https://aistudio.google.com/app/apikey)
- `VITE_GROQ_API_KEY` - Groq AI key (https://console.groq.com/keys)
- `VITE_OPENAI_API_KEY` - OpenAI key for premium rewrite (https://platform.openai.com/api-keys)

**Backend (.env in backend/):**
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY` - AI service keys
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` - Payment gateway
- `ADMIN_PASSWORD` - Admin panel password
- `SESSION_SECRET` - Random 32-byte hex string
- `FRONTEND_URL` - Frontend domain for CORS
- `NODE_ENV=production`, `PORT=3001`

**Never commit `.env` files** - use `.env.example` as template.

---

*Hexa Stack Ai Solutions*
