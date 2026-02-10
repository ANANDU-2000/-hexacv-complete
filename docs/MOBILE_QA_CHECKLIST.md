# Mobile QA checklist

Use this checklist to verify mobile UX, resume layout, and payment flow.

---

## Mobile preview

- [ ] Preview shows a single full-width resume page (no horizontal scroll; page scales to fit).
- [ ] Container: ~92vw width, max-width 420px, A4 proportion (aspect-ratio 210/297).
- [ ] Top bar: Back (left), Download PDF (right) only. No Template dropdown.
- [ ] No zoom or pinch controls on mobile preview.
- [ ] No ATS score footer panel on mobile preview.
- [ ] No ₹49 or pricing text on the preview screen (no overlay CTA with price, no footer price CTA).
- [ ] When locked, a single "Improve ATS" button is available (e.g. top or bottom bar); tapping it opens the payment modal.
- [ ] Bottom of screen: page indicator only (e.g. "Page 1 / 2").

---

## Mobile editor (Step 2)

- [ ] One section visible at a time (e.g. Profile, Experience).
- [ ] Inputs are compact (reduced padding, readable font size).
- [ ] Sticky bottom CTA: "Preview resume" (or "Save & Preview") visible and tappable without nested scroll hiding it.
- [ ] Profile section: "Add a professional photo (optional)" and "Do you want to add a profile photo?" with Yes / No / Skip.
- [ ] When "Yes" is selected: upload area and region-based guidance (Gulf / India / Global) visible.
- [ ] When space allows (e.g. wider mobile), selected photo thumbnail appears on the right of the form.

---

## Pricing and payment

- [ ] No ₹49 (or any price) on any button or card outside the payment modal.
- [ ] All entry points show "Improve ATS" (or "Improve wording for ATS") with no price.
- [ ] Clicking "Improve ATS" opens the SoftLockModal; price (₹49 one-time) and trust bullets appear only inside the modal.
- [ ] Single "Pay" CTA in the modal; no duplicate payment buttons.
- [ ] On payment success: redirect to PayU.
- [ ] On payment failure (e.g. 5xx): user sees "Payment temporarily unavailable. Try again later." in the modal; Pay button disabled until user closes and can retry.

---

## Resume layout (all viewports)

- [ ] Header is left-aligned (not centered).
- [ ] Name and target role are visible when present; contact line with clear links (blue, no underline or subtle offset).
- [ ] Experience / project: company and role both bold on one line; dates bold and right-aligned.
- [ ] Same date treatment for projects and education where applicable.

---

## Optional

- [ ] Mobile Optimization Engine: no confusing "Object" console log; either clear structured log or removed.
