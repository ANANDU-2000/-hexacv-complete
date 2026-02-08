# HexaCV — Project Tree, User Flow, Data & Workflows

## 1. Project tree (files and folders)

```
hexacv-complete-main/
├── api/                          # Vercel serverless (backend)
│   ├── admin/
│   │   ├── payments.ts           # List payments (admin key)
│   │   └── unlock-template.ts    # Manual unlock (admin)
│   ├── lib/
│   │   ├── payu.ts               # PayU hash gen + verify
│   │   └── store.ts              # In-memory orders + unlocks (→ InsForge DB later)
│   ├── orders/
│   │   └── create.ts             # POST create order, return PayU redirect params
│   ├── payments/
│   │   ├── record.ts             # Legacy Razorpay record (optional)
│   │   └── webhook.ts            # PayU webhook: verify hash → set unlock
│   ├── rewrite/
│   │   └── paid.ts               # POST paid rewrite (OpenAI server-side)
│   └── templates/
│       └── unlock-status.ts      # GET template unlock by session
├── public/                       # Static assets + HTML templates
│   └── templates/                # Resume HTML (classic, minimal, etc.)
├── src/
│   ├── AppNew.tsx                # Root: routes, resume state, nav
│   ├── main.tsx
│   ├── types.ts                  # Re-exports + doc layer types
│   ├── api-service.ts            # Session ID (hexacv_session_id), local analytics, template recs
│   ├── payment-service.ts       # Thin: session ID (user_session_id), unlock check via API
│   ├── core/                     # All business logic (no UI)
│   │   ├── types.ts              # ResumeData, Experience, Education, PaymentRecord, etc.
│   │   ├── session/              # createSession, getSession (localStorage)
│   │   ├── ats/
│   │   │   ├── extractKeywords.ts    # JD → skills/soft/role keywords (rule-based)
│   │   │   ├── scoreATS.ts           # scoreATS(), checkResumeStructure()
│   │   │   ├── validation.ts        # validateResumeData()
│   │   │   ├── resumeParser.ts      # Parse text with AI (Gemini/Groq)
│   │   │   ├── refinement.ts        # Groq refinement
│   │   │   └── roleIntelligence.ts  # Role/market intel (OpenAI/Groq)
│   │   ├── rewrite/
│   │   │   ├── freeRewrite.ts    # Grammar/clarity (Groq) — frontend
│   │   │   ├── paidRewrite.ts    # Calls POST /api/rewrite/paid only
│   │   │   └── rewriteValidator.ts
│   │   ├── payment/
│   │   │   ├── createOrder.ts    # POST /api/orders/create → redirect PayU
│   │   │   ├── checkUnlock.ts    # GET unlock-status API + optional cache
│   │   │   └── paymentState.ts   # Local unlock/payment lists (localStorage)
│   │   ├── delivery/
│   │   │   ├── generatePDF.ts   # Client-side iframe print
│   │   │   ├── templateEngine.ts
│   │   │   └── templates.ts     # AVAILABLE_TEMPLATES (free + paid)
│   │   └── errors/
│   │       └── userErrors.ts
│   ├── ui/                       # Dumb UI components
│   │   ├── editor/               # ResumeEditor, EditorLayout, sections
│   │   ├── preview/              # ResumePreview (iframe)
│   │   └── templates/            # TemplateCard, TemplateGrid
│   ├── pages/
│   │   ├── EditorPage.tsx        # Editor + live preview (2-col desktop)
│   │   ├── PreviewPage.tsx       # Template pick + PDF download
│   │   ├── FreeATSResumeBuilder*.tsx, ATSResumeForFreshers, etc. (SEO landings)
│   │   └── FreeToolsPage.tsx
│   ├── tools/                    # Standalone free tools (keyword, bullet, section, JD)
│   ├── components/               # Hero, modals, mobile, etc.
│   ├── templates/                # Template configs (free/basic, paid/premium)
│   ├── constants.ts, utils/, analytics/, styles/
│   └── ... (ai-prompts, role-guidance-engine, validation-service, etc.)
├── .env                          # VITE_*, PAYU_*, INSFORGE_*, OPENAI_API_KEY (do not commit)
├── vercel.json
├── vite.config.ts
└── package.json
```

---

## 2. What was done (recent refactor)

- **Env:** All keys in `.env` + `vite-env.d.ts` (Groq, Gemini, OpenAI, InsForge, PayU, Stitch).
- **Payment:** Razorpay removed from frontend; PayU only. Create order → `POST /api/orders/create` → redirect to PayU; unlock only after **webhook** (`/api/payments/webhook`). Unlock status from `api/templates/unlock-status` (reads `api/lib/store`; later InsForge DB).
- **Core payment:** `createOrder.ts` only calls API and redirects; `checkUnlock.ts` calls API; `payment-service.ts` is thin (session + unlock API).
- **ATS:** Removed `rule-based-ats-engine.ts` and `ats-comparison-engine.ts`. Single engine: `core/ats` (extractKeywords, scoreATS, checkResumeStructure, validation).
- **Rewrite:** Free = Groq grammar/clarity only (frontend). Paid = `POST /api/rewrite/paid` only (OpenAI on server); no OpenAI key in frontend.
- **UI:** Editor = two-column desktop (editor left, live preview right); preview page scrollable from top; simplified processing overlay (no fake AI animations).
- **API:** `api/lib/store` (orders + unlocks in memory), PayU hash in `api/lib/payu`, orders/create, payments/webhook, rewrite/paid, templates/unlock-status.

---

## 3. Current user flow

1. **Landing**  
   User opens `/` → Hero + “Build resume” / “Free tools”. No signup.

2. **Start resume**  
   - “Build resume” or “Start” from SEO pages → `/editor`.  
   - Optional: upload PDF → parse with AI (Gemini/Groq) → resume state filled → `/editor`.

3. **Editor**  
   - Desktop: left = sections (Profile, Experience, Projects, Skills, Education, Achievements), right = live preview (free template).  
   - Mobile: single column editor.  
   - All edits update React state only (see “Where data is saved”).

4. **Preview**  
   - “Next: Preview” (with validation) → `/preview`.  
   - Pick template (free + paid; paid may require unlock).  
   - “Download PDF” → client-side iframe print (free path).

5. **Payment (paid template)**  
   - User chooses paid template → pay (e.g. ₹49).  
   - Frontend calls `core/payment/createOrderAndPay()` → `POST /api/orders/create` → form submit to PayU.  
   - User pays on PayU → redirect back to success/failure URL.  
   - **Unlock only when** PayU webhook hits `/api/payments/webhook` (hash verified → store unlock).  
   - Unlock status: `payment-service.checkTemplateUnlockStatus()` → `core/payment/checkUnlock` → `GET /api/templates/unlock-status`.

6. **Free tools**  
   - `/free-tools` → ATS Keyword Extractor, Keyword Checker, Bullet Improver, JD Analyzer, Section Checker.  
   - Each tool: paste text → call `core/ats` or `core/rewrite/freeRewrite` → show result. No resume state; no save.

---

## 4. Working flow (technical)

- **Resume data:** Single source = `useState<ResumeData>(resume)` in `AppNew.tsx`. Passed as `data={resume}` to `EditorPage` and `PreviewPage`; `onChange` updates state. **Not** persisted to backend or localStorage (see below).
- **Session IDs:**  
  - `api-service.getSessionId()` → `localStorage.hexacv_session_id` (analytics, template recs).  
  - `payment-service.getCurrentSessionId()` → `localStorage.user_session_id` (payment/unlock).  
  - Used when creating PayU order and when checking unlock.
- **Payment:** Create order (API) → PayU redirect → webhook updates in-memory store (later InsForge) → unlock-status API reads store. Frontend only calls APIs and caches unlock in localStorage for UX.
- **ATS:** JD text → `core/ats/extractKeywords` → keywords; resume text + keywords → `core/ats/scoreATS` → score + matched/missing. Section check: `core/ats/scoreATS.checkResumeStructure(resumeText)`.
- **Rewrite:** Free: `core/rewrite/freeRewrite` (Groq) in browser. Paid: `core/rewrite/paidRewrite` → `POST /api/rewrite/paid` (OpenAI on server).

---

## 5. Where each field is stored / saved

| What | Where | After user leaves / refresh? |
|------|--------|-------------------------------|
| **Resume content** (basics, summary, experience, education, projects, skills, achievements, jobDescription) | React state in `AppNew` only | **Lost** on refresh or new tab. Not in localStorage or backend. |
| **Session ID (analytics)** | `localStorage.hexacv_session_id` | Persists (same device). |
| **Session ID (payment)** | `localStorage.user_session_id` | Persists (same device). |
| **Unlock status** | Server (api/lib/store → later InsForge); frontend caches in `unlocked_templates_${sessionId}` | Persists on server; cache persists in browser until cleared. |
| **Orders / payments** | Server only (api/lib/store) | Persists on server (in-memory until replaced by DB). |
| **Analytics events** | `localStorage.hexacv_events` (last 100) | Local only; not sent to backend in current flow. |
| **Role intel cache** | `localStorage` (roleIntelligence) | Persists (7-day TTL). |

**Summary:** Resume is **session-only in memory**. Nothing saves the resume to server or localStorage. User must export PDF before closing if they want to keep it.

---

## 6. ATS and each field (user entry → usage)

- **basics** (fullName, email, phone, location, linkedin, github, targetRole, etc.)  
  - Entered in Profile section.  
  - Used in preview/PDF and (e.g. email) for PayU.  
  - Not used for ATS score; ATS uses full resume text.

- **summary**  
  - Entered in Profile.  
  - Included in resume text for ATS and in preview/PDF.

- **experience** (company, position, dates, highlights)  
  - Entered in Experience section.  
  - Part of resume text for `scoreATS` and `checkResumeStructure`; shown in preview/PDF.

- **education** (institution, degree, field, graduationDate)  
  - Entered in Education section.  
  - Same as experience: ATS + preview/PDF.

- **projects** (name, description, highlights, tech)  
  - Entered in Projects section.  
  - Same: ATS + preview/PDF.

- **skills** (array of strings)  
  - Entered in Skills section.  
  - Same: ATS + preview/PDF.

- **achievements**  
  - Entered in Achievements section.  
  - Same: ATS + preview/PDF.

- **jobDescription**  
  - Optional; pasted (e.g. in editor or tools).  
  - Used for: `extractKeywordsFromJD(jobDescription)` → keywords → `scoreATS(resumeText, jdKeywords)` → score, matched, missing.  
  - Not printed on PDF; for ATS feedback only.

- **atsMetrics** (score, missingKeywords)  
  - Computed by `scoreATS` (and optionally cached on `ResumeData`).  
  - Not a user input; derived from resume + JD.

**ATS pipeline:**  
`jobDescription` → `extractKeywordsFromJD` → `ExtractedKeywords`.  
Resume (all sections serialized to text) + `ExtractedKeywords` → `scoreATS` → `ATSScoreResult` (score, matched, missing).  
Resume text only → `checkResumeStructure` → section presence + score + suggestions.

---

## 7. Weaknesses

- **Resume not saved:** Refresh or close tab loses all resume data. No auto-save or “Save draft” to server or localStorage.
- **Two session IDs:** `hexacv_session_id` and `user_session_id`; can confuse which is used where (analytics vs payment).
- **Orders/unlocks in memory:** `api/lib/store` is in-memory; lost on Vercel cold start. Need InsForge (or DB) for production.
- **PDF is client-side only:** Free PDF = iframe print; no server-side PDF or signed URLs for paid yet.
- **Pre-existing TS/lint:** Missing `services/feedback`, `role-guidance-engine` type, some editor section types still error.
- **Free AI keys in frontend:** Groq/Gemini still in browser for free rewrite/parse; ideal long-term is to proxy via backend.

---

## 8. Strengths

- **Clear core/ boundary:** Logic in `core/` (ats, rewrite, payment, delivery, session); UI in `ui/`, `pages/`, `components/`.
- **Single ATS engine:** One place for scoring and structure (`core/ats`).
- **Payment security:** No PayU key/hash in frontend; unlock only after webhook verification.
- **Paid rewrite server-side:** OpenAI only in API; frontend calls `/api/rewrite/paid`.
- **Deterministic ATS:** Same resume + JD → same score (rule-based keyword + sections).
- **No signup:** Session and payment by session ID; no account required.
- **Desktop editor UX:** Two-column layout with live preview.

---

## 9. Correct workflow summary

- For **design architecture, every form field/button, mobile architecture, and step-by-step desktop/mobile flows**, see [DESIGN_ARCHITECTURE_AND_STEPS.md](DESIGN_ARCHITECTURE_AND_STEPS.md).

- **User edits** → only `AppNew` state; **nothing** is saved to server or localStorage for the resume body.
- **User pays** → order created via API → PayU → webhook sets unlock on server; frontend checks unlock via API (and optional cache).
- **User exports** → PDF from browser (iframe print) for current session only.
- **ATS** → JD + resume text → `core/ats` → score and missing keywords; no persistence of ATS result except in UI.

To **persist resume** across refresh/tab: add either localStorage auto-save or a backend “draft” endpoint keyed by session (and, if needed, tie to same `user_session_id` used for payment).
