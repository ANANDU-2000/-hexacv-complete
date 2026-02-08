# UX/UI Improvements Spec — Resume Builder

Reference for the UX/UI improvement prompt. This doc lists what’s implemented and what’s left.

---

## Desktop — Implemented

- **Navigation:** Left sidebar removed. **Horizontal top navigation tabs** for: Target Role, Profile, Experience, Projects, Skills, Education, Achievements. One section visible at a time (accordion-style).
- **Layout:** **40% left (editing) | 60% right (preview)**. Preview shows full resume with scroll.
- **ATS:** **Collapsible panel** in top-right; collapsed by default. Expand to see structure and missing keywords.
- **Preview zoom:** Slider + **Fit width** / **Fit height** / **100%** presets.
- **Form typography:** In editor content, labels ≥14px and inputs ≥16px (`.editor-form-spacing` in `index.css`). Improved tap/click targets.
- **Sticky section nav:** Section tabs are in a sticky bar below the main header so users always see where they are.

---

## Desktop — Not yet done

- Accordion expand/collapse **icons (chevron up/down)** on each section header in the content area (currently only tab bar).
- Multi-column layouts where appropriate (e.g. Experience Level + Target Market side-by-side) — partially present in Target & JD.
- Smart pagination or step-by-step wizard as an alternative view.
- Inline validation with clear error states.
- Auto-expand textareas.
- Placeholder text with concrete examples everywhere.
- Auto-save with visual confirmation, undo/redo, keyboard shortcuts.
- Real-time keyword highlighting in preview, inline ATS suggestions, score by section, one-click fixes.
- Side-by-side before/after preview, download/print preview mode.

---

## Mobile — Implemented

- **Vertical flow:** Dashboard with section cards; one section at a time in the section editor.
- **Sticky CTA:** “Save & Preview” or “Save [Section]” at bottom of each section (`MobileSectionEditor`).
- **Tap targets:** `min-h-[44px]` on primary buttons and list actions where updated.
- **Preview:** Separate preview route with full-width A4 and zoom (pinch/double-tap).
- **Progress:** Section cards show completion (checkmarks) and ATS warning where relevant.

---

## Mobile — Not yet done

- Bottom navigation bar or hamburger with current section indicator.
- Swipe gestures between sections.
- Floating action button (FAB) for “Preview Resume” (currently a full-width button).
- 16px minimum font size globally to avoid iOS zoom.
- Collapsible sections with +/− in the section editor.
- Native mobile inputs (keyboard types: email, phone, etc.).
- Pull-to-refresh.
- No horizontal scrolling (audit and fix any overflow).

---

## Universal — Implemented

- **Spacing:** 8px-based spacing in editor form area (`.editor-form-spacing`).
- **ATS contact logic:** Contact info detected from content (e.g. `@` for email, digit runs for phone), not only the words “email”/“phone”.
- **Section completion:** Icons (✔ / ⚠ / ○) in section tabs.

---

## Universal — Not yet done

- Consistent 8px grid across all sections.
- Subtle expand/collapse animations.
- Loading states for ATS.
- Empty states with guidance.
- Smart defaults from Target Role.
- Contextual tooltips.
- Multi-step wizards for Experience, drag-and-drop reorder, duplicate/template buttons, bulk import (LinkedIn, PDF).

---

## Files touched in this pass

- `src/ui/editor/EditorLayout.tsx` — Sidebar removed; horizontal sticky tabs.
- `src/pages/EditorPage.tsx` — 40/60 split; zoom presets (Fit width, Fit height, 100%).
- `src/index.css` — `.editor-form-spacing` for labels ≥14px, inputs ≥16px, spacing.
