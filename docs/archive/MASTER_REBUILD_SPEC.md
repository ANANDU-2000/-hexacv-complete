# 🔥 MASTER REBUILD SPECIFICATION: 3-STEP ATS RESUME BUILDER

## 🎯 PRODUCT GOAL

**User Goal (single sentence):**

"Upload or build a resume → quickly review & correct real data → choose a professional ATS-safe template → download."

**Core Principles:**
- No learning curve
- No guessing
- No forced validation errors
- 3 steps = fewer clicks, less confusion, higher conversion, fewer bugs

---

## 🧠 MASTER AGENTIC PROMPT

You are a senior Product Designer + UX Architect + ATS Resume Expert + Full-Stack Engineer.

Your task is to REBUILD this resume formatter into a strict **3-STEP flow**.
You must IGNORE the existing 5-step logic completely.

---

## ⚠️ GLOBAL NON-NEGOTIABLE RULES

1. **NEVER hallucinate, guess, or invent user data**
2. **NEVER infer seniority from total years alone**
3. **ALWAYS separate:**
   - Total career experience
   - Target role experience (e.g., AI/ML)
4. **Validation must be REAL, explainable, and optional unless critical**
5. **Reduce clicks to the absolute minimum**
6. **Mobile, laptop, desktop UX must all be first-class**
7. **UI must be modern, minimal, black & white, ATS-safe**
8. **Preview must ALWAYS match final output exactly**

---

## 📋 FINAL WORKFLOW (ONLY 3 STEPS)

### STEP 1: UPLOAD OR BUILD
### STEP 2: REVIEW & FIX (DATA ONLY)
### STEP 3: TEMPLATE + DOWNLOAD

**NO OTHER STEPS ALLOWED.**

---

## 📤 STEP 1: UPLOAD OR BUILD (HOMEPAGE)

### Purpose
Let user start immediately without thinking.

### UI Layout
- **Centered hero**
- **Headline:** "Create an ATS-Optimized Resume in Minutes"
- **Subtext:** "No signup • No guessing • Full control"

### Two Large Cards
Minimum 320px height, clickable entire card:
1. **Upload Resume (PDF)**
2. **Build from Scratch**

### UX Rules
- No footer
- No preview
- No scrolling
- One click → next step

### Loading State
- Full-screen loader
- Text: "Extracting your resume safely…"
- Progress bar (0–100%)
- Max wait perception: 1.5s (use skeletons)

---

## ✏️ STEP 2: REVIEW & FIX (CORE STEP)

### Purpose
- Show ALL extracted data
- Allow correction
- NEVER hide sections

### Layout (Desktop)
- **Left:** Editable data (60%)
- **Right:** OPTIONAL live preview (40%, toggleable)

### Layout (Mobile)
- Preview OFF by default
- Toggle button: "Show Preview"

---

### DATA STRUCTURE (MANDATORY)

Show ALL sections if present in CV:
- Personal Info
- Professional Summary
- Skills
- Experience (ALL roles + bullet points)
- Projects
- Education
- Certifications
- Achievements

**If section exists in CV → it MUST appear here.**

---

### EDITING UX

Each section:
- **Accordion with:**
  - ✔ status icon
  - ✏️ edit icon
  - ➕ add entry
  - ➖ remove entry

### Fields
- **NO full-width flat fields**
- Use grouped cards
- Max width 720px
- Field height ≥ 44px
- Font size ≥ 14px

---

### AI ASSIST (OPTIONAL, NEVER AUTO)

Each text area:
- Small ✨ "Improve with AI" icon

**AI CAN:**
- Fix grammar
- Improve clarity
- Match JD keywords

**AI CANNOT:**
- Change dates
- Change titles
- Add fake experience

---

### VALIDATION RULES (CRITICAL)

**Only BLOCK if:**
- Name missing
- No experience AND no education
- Invalid date format

**Warnings (NON-BLOCKING):**
- Overlapping dates
- Career switch detected
- Intern + senior mix

Warnings must say **WHY** and allow continue.

**Example:**
> ⚠ You have 1 year AI experience but 9 years business experience. Resume will reflect AI as primary target role.

---

## 🎨 STEP 3: TEMPLATE + DOWNLOAD

### Purpose
- Select design
- See REAL output
- Download

### Layout
- **Left (60%):** Template gallery (2 columns on desktop, 3 on large screens)
- **Right (40%):** Full A4 live preview

### Template Cards
- **REAL rendered thumbnails** (not placeholders)
- **Label:**
  - ATS Score
  - Best for (e.g., "AI Engineer", "Freshers")
  - Free / ₹19 / ₹49

### Selection Rules
- Template selection MUST persist
- Selected template ALWAYS controls preview & output

### Preview Rules
- Single A4 frame
- No internal scroll
- Zoom: 80% default
- Page 1 / Page 2 toggle if needed
- NO watermark at this stage

### Download Logic
- Free template → show Download
- Paid template → show Pay → then Download
- **Preview ALWAYS same as downloaded PDF**

---

## 🎨 UI DESIGN SYSTEM

### Colors
- Black: `#000`
- White: `#FFF`
- Gray: `#E5E7EB`

### Buttons
- Height: **48px**
- Radius: **12px**
- Shadow: `0 4px 12px rgba(0,0,0,0.12)`
- Hover: slight lift + darker

### Typography
- Headings: **20–28px**
- Body: **14–16px**
- Line height: **1.5**

### Spacing
- Section padding: **24px**
- Card gap: **16px**
- Max page width: **1200px**

---

## ✅ STRICT OUTPUT GUARANTEES

- What user edits = what appears in preview
- What preview shows = what PDF downloads
- No data guessing
- No role inflation
- No ATS tricks that break truth

---

## 🎯 FINAL SUCCESS CRITERIA

User can:
- Upload → Review → Download in **under 2 minutes**
- Understand every error
- Trust the output
- See exactly what they will download

---

## 🧪 WHY PREVIOUS APP FAILED

| Problem | Why it Happened |
|---------|----------------|
| Too many steps | Cognitive overload |
| Validation blocking | Over-strict logic |
| Missing sections | Parser → UI mismatch |
| Flat UI | No design system |
| Preview mismatch | State not centralized |
| Wrong seniority | No role-based reasoning |

---

## 🟢 HOW TO USE THIS SPEC

1. Open Qoder / Cursor / Trae
2. Paste entire prompt
3. Add ONE line before running:
   > "Delete existing workflow and rebuild exactly as specified."
4. Do NOT give small prompts after
5. If agent forgets → re-paste full master prompt

---

## 🚀 EXPECTED RESULT

- Clean 3-step resume app
- ATS-safe
- Trustworthy
- Monetizable
- Recruiter-ready
- No hallucinations
- No user frustration

---

## 📊 CURRENT IMPLEMENTATION STATUS

**✅ COMPLETED:**
- 3-step flow architecture (AppNew.tsx)
- Advanced AI system (Gemini + Groq + Hugging Face)
- 7 templates with real previews
- Role-based ATS optimization
- Mobile responsive design
- Grammar & quality validation
- Real data enforcement (no hallucinations)

**🔄 IN PROGRESS:**
- AI Assist button integration
- Certifications/Achievements sections
- Page 1/Page 2 toggle in preview

**⚠️ NEEDS REVIEW:**
- Template state persistence verification
- Preview-to-PDF pixel-perfect matching
- Mobile accordion UX refinement
