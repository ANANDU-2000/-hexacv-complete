# Payment troubleshooting (PayU / HexaCV)

## Why payment shows errors or “not working”

### 1. **“Please enter correct UPI ID” (PayU checkout)**

- PayU validates UPI ID (VPA) on their page. Use a **valid format**:
  - `yourname@paytm` · `yourname@ybl` (PhonePe) · `yourname@okaxis` · `yourname@upi`
- In **test mode** (`apitest.payu.in`), some gateways only accept specific test VPAs. Check PayU docs for test UPI IDs.
- Avoid typos (e.g. `76373838376342@ybl` — ensure the part before `@` and the handle are valid).

### 2. **CleverTap errors: “Null value for key 'MID' / 'bin' was removed”**

- These come from **PayU’s checkout page** (their analytics/tracking), not from HexaCV.
- They usually mean PayU’s script is sending events without MID (Merchant ID) or card BIN (e.g. on UPI, no card). They are **informational** and do not block payment.
- No change needed in HexaCV code; they are on PayU’s side.

### 3. **403 on `testpgnb.svg` (bank logo)**

- That URL is a **PayU asset** (bank logo) on their checkout. A 403 is from their server (permissions or missing file).
- It does not affect payment processing. No fix in HexaCV.

### 4. **Loading takes long**

- After you click “Pay ₹49”, HexaCV calls the backend, then **redirects** to PayU. The delay is usually:
  - Our backend creating the order, or
  - PayU’s page loading (they load many payment options).
- We show “Redirecting to payment…” during redirect. If it hangs before redirect, check backend logs and PayU dashboard.

### 5. **Back / Refresh and “lost” amount or resume**

- **Resume is saved** before redirect. We write the current resume to `localStorage` under `hexacv_draft_<sessionId>` when you click Pay. If you come **Back** or **Refresh** on our site, you can **Restore** the draft when prompted (or open the editor again).
- **Money:** Payment is only deducted when PayU completes the transaction. If you only clicked Pay and then went Back before completing on PayU, **no amount is charged**. If PayU showed success and you then refreshed, unlock is tied to the session; we poll unlock status when you land back with `?payment=success`.
- **Best practice:** Don’t use the browser Back button during payment. Use **Cancel** or **Pay** on PayU’s page. If you must leave, your resume is still in the browser draft.

---

## PayU dashboard (test vs live)

- **“Complete onboarding to activate”** — In the PayU dashboard, finish **Website Details** and **KYC** so that live payments (and sometimes test flows) work as expected.
- **Test Key / Test Salt** — For test mode you must use the **UAT (test) key and salt** from PayU’s “Get UAT Key & Salt” section. Our backend must use these for `apitest.payu.in`; the salt you have (e.g. `mDZEGEwDXBKWa8SsoRxPem...`) is the test salt from that section.
- **Success / Failure URLs** — Backend must set PayU success and failure URLs to your app (e.g. `https://yoursite.com/preview?payment=success` and `?payment=failure`) so we can show the right message and poll unlock.

---

## Summary

| Issue | Cause | What to do |
|------|--------|------------|
| “Please enter correct UPI ID” | Invalid or unsupported UPI ID on PayU | Use valid UPI (e.g. name@paytm, name@ybl); in test use PayU test UPI if required |
| CleverTap MID/bin null | PayU’s analytics on their page | Ignore; no HexaCV change |
| 403 testpgnb.svg | PayU’s bank logo asset | Ignore; no HexaCV change |
| Long loading | Backend or PayU page load | Check backend and PayU; we show “Redirecting…” |
| Back/Refresh “lost” resume | User left before completing payment | Restore draft when prompted; resume is in localStorage |
| Back/Refresh “lost” amount | Misunderstanding | No charge if payment wasn’t completed on PayU; after success we poll unlock |
