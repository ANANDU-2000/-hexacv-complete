# Running HexaCV Locally

## Option 1: Frontend only (simplest)

```bash
cd "C:\Users\anand\OneDrive\Desktop\-hexacv-complete-main"
npm run dev
```

- Opens at **http://localhost:5173**
- You can build resume, edit, use free tools, see preview.
- **Payment / Unlock / Paid rewrite will not work** (no backend). You’ll see “Connection failed” or 404 for those.

---

## Option 2: Frontend + backend (payment, paid rewrite, unlock)

```bash
cd "C:\Users\anand\OneDrive\Desktop\-hexacv-complete-main"
npm run dev:full
```

This runs **Vercel CLI** (`vercel dev`). First time it will ask:

1. **“Set up and develop this project?”** → type **y** and press Enter.
2. **“Which scope?”** → press **Enter** to pick the one shown (e.g. “anandukrishnapa2000-gmailcom's projects”).
3. Wait until it prints a URL (e.g. **http://localhost:3000**). Open that in the browser.

**Important:** Do not close the terminal or press Ctrl+C until you’re done. If you close the prompt or the window, you’ll see `Error: User force closed the prompt` or `EPIPE`. Run `npm run dev:full` again and answer the questions.

---

## Summary

| Command            | URL (usually)   | Payment / API |
|--------------------|-----------------|---------------|
| `npm run dev`      | http://localhost:5173 | No  |
| `npm run dev:full` | http://localhost:3000 | Yes (after you complete the 2 prompts) |

The **mobile.css** error (Unexpected `}`) is already fixed in the project. If you still see it, save all files and run `npm run dev` again.
