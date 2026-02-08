# Mobile UX — No-signup ATS resume builder

Mobile-first design: one action per screen, thumb-friendly, no side-by-side layouts.

---

## 1. Mobile screen flow (step-by-step)

| Step | Screen | Primary action | Notes |
|------|--------|----------------|-------|
| 1 | **Resume Dashboard** | Tap section card → Section editor | Progress indicator, Target Role summary, section list (Profile, Experience, Projects, Skills, Education, Achievements). Each card shows completion + ATS warning icon if relevant. |
| 2 | **Target Role** (optional first) | Confirm & Next | Target role, experience level, target market, optional JD. Sticky CTA: "Confirm & Next". |
| 3 | **Section Editor** | Save & Preview _or_ Save | Full-screen, one section only. Sticky bottom: "Save & Preview" (goes to Preview) or "Save" (back to dashboard). Experience: collapsible role cards, bullets as list, Move Up/Down, Edit/Improve/Delete per bullet. |
| 4 | **Preview** (separate route `/preview`) | Download PDF _or_ Unlock | Full-width A4 preview. Top: Back, Template, Download PDF. Bottom: ATS Score (tap to expand), Unlock CTA if locked. |

**No signup by default.** Identity (email) only at risk moments: Restore Purchase, payment success but unlock missing, resume lost, new device.

---

## 2. Gesture rules

| Context | Gesture | Action |
|---------|---------|--------|
| **Preview** | Pinch | Zoom in/out (0.5×–2×). |
| **Preview** | Double-tap | Reset zoom to 100%. |
| **Preview** | Vertical scroll | Scroll through A4 content. |
| **Section cards** | Tap | Open section editor. |
| **Experience role** | Tap header | Expand/collapse role card. |
| **Bullet** | Tap | Inline edit. |
| **Bullet** | ⋮ menu | Edit / Improve / Delete. |

No drag-and-drop on mobile; use **Move Up / Down** buttons for reorder.

---

## 3. Sticky CTA logic

| Screen | Sticky bar | Primary CTA | Secondary |
|--------|------------|-------------|-----------|
| **Dashboard** | Bottom | "Preview resume" → `/preview` | ATS bar (when JD set): "ATS: X/100" + "Improve" (tap to expand modal). |
| **Target Role** | Bottom | "Confirm & Next" → back to dashboard | — |
| **Section Editor** | Bottom | "Save & Preview" → `/preview` _or_ "Save" → dashboard | — |
| **Preview** | Top | Back, Template, Download PDF | — |
| **Preview** | Bottom | ATS Score (tap to expand) | "Unlock stronger wording — ₹49 one-time" when template locked. |

One primary CTA per screen; critical actions are never hidden.

---

## 4. Error & recovery UX

| Scenario | Behavior |
|----------|----------|
| **Payment success** | Banner: "Payment received. Verifying…" → poll unlock → "Payment verified. You can download now." Toast-style; user stays on preview. |
| **Payment failure** | Banner: "Payment was not completed. You can try again or use the free template." |
| **Unlock missing after payment** | Banner: "Payment confirmed but delivery delayed. Please wait a moment and refresh." Optionally show **Restore Purchase** and ask for email only here. |
| **Create order fails (e.g. 500)** | Inline error in SoftLockModal; no `alert()`. User-facing message: "Payment unavailable. Check your connection or try again." |
| **Restore Purchase** | Ask for email only at this moment. Copy: "Enter your email to restore your paid access." |

---

## 5. Accessibility (font size, tap targets)

- **Minimum tap target:** 44×44 px for all interactive elements (buttons, section cards, bullet actions).
- **Font sizes:** Section titles 15–17 px; body 14–16 px; labels 10–11 px uppercase. No tiny critical text.
- **Contrast:** Dark theme `#0F172A` with white/white-10 for text and controls; amber for ATS warnings.
- **Focus & semantics:** `aria-label` on icon-only buttons; `aria-expanded` on ATS toggle; `aria-live="polite"` on payment/unlock messages.
- **Safe areas:** Top/bottom bars use `safe-area-top` / `safe-area-bottom` for notch and home indicator.

---

## 6. Paid UX (mobile)

- **When locked:** Locked template preview shows overlay with CTA: **"Unlock stronger wording — ₹49 one-time"**. Same CTA in bottom sticky bar.
- **Payment success:** Instant unlock when webhook + poll confirm; toast/banner; user remains on preview and can download.
- **If unlock fails after payment:** Show Restore Purchase; ask for email only here.
- **No double pay:** Unlock state is checked from backend; UI reflects single purchase.

---

## Files touched

- **Dashboard:** `src/components/mobile/MobileSectionDashboard.tsx` — progress, section cards, ATS warning per section, one primary CTA.
- **Section editor:** `src/components/mobile/MobileSectionEditor.tsx` — "Save & Preview", Experience as collapsible cards, bullets with Move Up/Down and Edit/Improve/Delete.
- **Mobile editor:** `src/components/mobile/MobileEditor.tsx` — passes `onSaveAndPreview` to section editor.
- **Preview (mobile):** `src/pages/PreviewPage.tsx` — mobile layout: top bar (Back, Template, Download), full-width A4, pinch/double-tap zoom, bottom bar (ATS tap to expand, Unlock CTA).
- **Hook:** `src/hooks/useIsMobile.ts` — breakpoint 768px.
- **Global:** `src/index.css` — `.safe-area-top` / `.safe-area-bottom` for notches.
