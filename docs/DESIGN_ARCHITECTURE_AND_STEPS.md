# HexaCV — Design Architecture, Form Fields, Buttons & Step-by-Step Flows

Companion to [PROJECT_TREE_AND_FLOWS.md](PROJECT_TREE_AND_FLOWS.md). This doc covers: user design architecture, every form field and button, mobile design architecture, and step-by-step order for desktop and mobile.

---

## 1. User design architecture (latest current workflow)

- **Entry:** Single app shell (`AppNew`) with React state for `resume`; routing by path + `isMobile` (width < 768px).
- **Desktop:** Home (Hero) → Editor (two-column: left = tabbed editor, right = live preview) → Preview (template pick + PDF) → optional PayU for paid template.
- **Mobile:** Home (Hero mobile layout) → Editor (full-screen dashboard → section editors) → same Preview route (sidebar + main).
- **Free tools:** Separate routes; paste-only, no resume state; each tool has its own form and result UI.
- **Data flow:** One-way: user input → `onChange` → `setResume` in AppNew → props down to Editor/Preview. No persistence of resume content.

---

## 2. Every form field and button (by screen)

### Home (Hero) — Desktop

| Element | Type | Action |
|--------|------|--------|
| Upload Your CV | Label + hidden file input | `accept="application/pdf"`; on select/drop → `onUpload(file)` → parse → navigate `/editor` |
| Create New Resume | Button | `onStart()` → navigate `/editor` |
| Free Tools (nav) | Link/button | Navigate to Free Tools / dropdown |
| Trust badges | Static spans | 100% Free, No Login, Privacy |

### Home (Hero) — Mobile

| Element | Type | Action |
|--------|------|--------|
| Upload Existing PDF | Label + hidden file input | Same as desktop |
| Build From Scratch | Button | `onStart()` → navigate `/editor` |
| Free Tools | Button | `window.location.href = '/free-tools'` |

### Editor — Desktop (EditorPage + ResumeEditor + EditorLayout)

| Element | Type | Data / Action |
|--------|------|----------------|
| Back | Button | `onBack()` → navigate `/` |
| Next: Preview | Button | `onNext()` → validate → navigate `/preview` |
| Tab: Profile, Experience, Projects, Skills, Education, Achievements | Buttons | `onTabChange(id)` → show section |
| **Profile section** | | |
| Full Name | Input text | `basics.fullName` |
| Email | Input email | `basics.email` |
| Phone | Input text | `basics.phone` |
| Location | Input text | `basics.location` |
| Target Role | Input text | `basics.targetRole` |
| Summary | Textarea | `data.summary` |
| **Experience section** | | |
| + Add | Button | Append new experience entry |
| Company | Input (per entry) | `experience[i].company` |
| Position | Input (per entry) | `experience[i].position` |
| **Projects section** | | |
| + Add | Button | Append new project |
| Project Name | Input (per entry) | `projects[i].name` |
| Description | Textarea (per entry) | `projects[i].description` |
| **Skills section** | | |
| Skills | Textarea | Comma-separated → `skills[]` |
| **Education section** | | |
| + Add | Button | Append new education |
| Institution | Input (per entry) | `education[i].institution` |
| Degree | Input (per entry) | `education[i].degree` |
| Year | Input (per entry) | `education[i].year` / `graduationDate` |
| **Achievements section** | | |
| + Add | Button | Append new achievement |
| Description | Textarea (per entry) | `achievements[i]` (string) |

### Editor — Mobile (MobileEditor + MobileSectionDashboard + MobileSectionEditor)

| Element | Type | Data / Action |
|--------|------|----------------|
| MobileHeader: Back | Button | `onBack()` → navigate `/` |
| Resume Context (Target Role) | Button | `onNavigateToSection('target-jd')` |
| Profile, Experience, Projects, Skills, Education, Achievements | Buttons | `onNavigateToSection(sectionId)` → section editor |
| Completion progress | Progress bar + % | Computed from section completeness |
| Live Preview (sticky footer) | Button | `onContinue()` → navigate `/preview` |
| Section editors | Forms | Same fields as desktop; data via `data` / `onChange` |

### Preview (PreviewPage)

| Element | Type | Data / Action |
|--------|------|----------------|
| Back | Button | `onBack()` → navigate `/editor` |
| Download PDF | Button | `generatePDF(selectedTemplateId, data)` (client print) |
| Choose Template | Heading | — |
| Template cards | Grid (TemplateCard) | `onSelect(template.id)` → `selectedTemplateId` |
| Main area | ResumePreview iframe | Renders `data` with `selectedTemplateId` |

### Free tools

| Element | Type | Data / Action |
|--------|------|----------------|
| Paste area (JD or resume text) | Textarea | Local state only |
| Analyze / Check / Improve | Button | Call `core/ats` or `core/rewrite`; show result |
| Back / Home | Button | Navigate `/` or `/free-tools` |

---

## 3. Mobile design architecture (current)

- **Detection:** `isMobile = window.innerWidth < 768` in AppNew; same routes, different component per route (e.g. `/editor` → MobileEditor vs EditorPage).
- **Shell:** Full-viewport, dark theme (`#0F172A`); sticky header (MobileHeader) and sticky bottom CTA where used.
- **Editor flow:** Dashboard-first (MobileSectionDashboard): "Resume Context" (target role) + list of sections (Profile → Experience → Projects → Skills → Education → Achievements). Tapping a section opens MobileSectionEditor. Progress and "Live Preview" at bottom.
- **No two-column on mobile:** Editor has no side-by-side preview; user goes to Preview route for full preview.
- **Preview route:** Same PreviewPage; sidebar (templates + Download) and main (ResumePreview) with overflow/scroll.
- **Free tools:** Mobile-specific wrappers (e.g. MobileATSKeywordExtractor) with same logic, different layout.

---

## 4. Step-by-step user flow (order)

### Desktop

1. **Landing** — Open `/`; see Hero (headline, Upload CV, Create New Resume).
2. **Start** — Click "Create New Resume" or upload PDF (→ parse →) go to `/editor`.
3. **Editor** — Left: tabs (Profile … Achievements); right: live preview. Fill any section in any order.
4. **Next** — Click "Next: Preview" (validation runs); go to `/preview`.
5. **Preview** — Choose template; click "Download PDF" for client-side PDF.
6. **(Optional) Paid** — If template is paid and locked, pay via PayU (redirect); unlock after webhook; then download.

### Mobile

1. **Landing** — Open `/`; mobile Hero (Upload Existing PDF, Build From Scratch, Free Tools).
2. **Start** — "Build From Scratch" or upload PDF → `/editor`.
3. **Editor** — Dashboard: "Resume Context" (target role) + section list (Profile, Experience, Projects, Skills, Education, Achievements). Tap section → edit that section; back to dashboard.
4. **Preview** — Tap "Live Preview" (sticky footer) → `/preview`.
5. **Preview** — Same: pick template, "Download PDF".
6. **(Optional) Paid** — Same as desktop.

### Free tools (both)

1. Go to `/free-tools` (or direct tool route).
2. Paste text (JD or resume).
3. Click action (e.g. Extract, Check, Improve).
4. View result; no save. Back/Home to leave.
