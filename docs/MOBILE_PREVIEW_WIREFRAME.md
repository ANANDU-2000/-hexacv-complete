# Mobile preview and editor wireframes

ASCII wireframes for mobile UX: preview (PDF-viewer style), editor (one section + sticky CTA), and Improve ATS flow.

---

## 1. Mobile preview

Top bar: Back (left), Download PDF (right). Full-width scrollable document. Bottom: page indicator only.

```
+------------------------------------------+
|  [← Back]                    [Download PDF]  |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  |                                    |  |
|  |     Resume page (A4 proportion)    |  |
|  |     width: 92vw, max 420px        |  |
|  |     aspect-ratio 210/297          |  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  (vertical scroll)                       |
|                                          |
+------------------------------------------+
|           Page 1 / 2                     |
+------------------------------------------+
```

When locked: same layout; a single "Improve ATS" button (e.g. in top bar or bottom bar) opens the payment modal. No price on the button; no overlay or footer ₹49 CTA.

---

## 2. Mobile editor (Step 2)

Top bar: Back (left), section name (e.g. "Profile"). Content: one section at a time. Sticky bottom CTA.

```
+------------------------------------------+
|  [← Back]                    Profile     |
+------------------------------------------+
|                                          |
|  Section fields (compact inputs)         |
|  - Add a professional photo (optional)   |
|  - Do you want to add a profile photo?   |
|    [ Yes ]  [ No / Skip ]                |
|  - Name, email, phone, etc.              |
|                                          |
|  (optional: photo thumbnail on right     |
|   when width allows, e.g. min 380px)     |
|                                          |
+------------------------------------------+
|        [ Preview resume ]                |
+------------------------------------------+
```

---

## 3. Improve ATS flow

Single entry point: user taps "Improve ATS" (no price shown). Modal opens with price and one Pay CTA.

```
  User taps "Improve ATS" (anywhere: overlay, panel, mobile bar)
           |
           v
+------------------------------------------+
|  Modal: ATS Optimized Version — ₹49      |
|  (one-time)                              |
|  • Tailored to your exact job role       |
|  • Optimized for ATS screening           |
|  • ...                                   |
|  Secure PayU. No login; we don't store   |
|  card or address.                        |
|                                          |
|  [ Pay ]                                 |
|  [ Continue with Free Version ]           |
+------------------------------------------+
           |
           v (Pay)
  Loading → Redirect to PayU
     OR
  Error → "Payment temporarily unavailable.
          Try again later." (Pay button disabled;
          user closes and can retry)
```

---

## Payment state machine (summary)

- **Idle** → User clicks "Improve ATS" → **Modal open**
- **Modal open** → User clicks "Pay" → **Loading**
- **Loading** → Success → Redirect to PayU
- **Loading** → Failure → Show error in modal, disable Pay CTA; user closes modal (back to Idle) and can try again
- Price is shown only inside the modal, never on buttons or cards outside it.
