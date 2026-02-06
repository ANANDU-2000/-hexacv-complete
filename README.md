# HexaCV

![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)
![Cost](https://img.shields.io/badge/Cost-$0%2Fmonth-brightgreen?style=for-the-badge)

**Free ATS Resume Builder - No Login Required**

Live: [https://hexacv.online](https://hexacv.online)

---

## What is HexaCV?

HexaCV is a **free, frontend-only ATS resume builder** that helps job seekers create optimized resumes without any login, signup, or payment.

### Key Features

- **Free Forever** - No paid features, no upgrades
- **No Login Required** - Start building immediately
- **ATS Keyword Extraction** - Paste job description to extract keywords
- **AI-Powered** - Uses free Gemini/Groq APIs for optimization
- **Works Offline** - Rule-based fallback if AI unavailable
- **Zero Data Storage** - Your resume never leaves your browser

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build
```

---

## Tech Stack

| Component | Technology | Cost |
|-----------|------------|------|
| Frontend | React 19 + Vite + TypeScript | $0 |
| Styling | Tailwind CSS | $0 |
| AI | Gemini + Groq (free tiers) | $0 |
| PDF | jsPDF + html2canvas | $0 |
| Hosting | Vercel | $0 |

**Total Monthly Cost: $0**

---

## Environment Variables

Create `.env` file:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_GROQ_API_KEY=your-groq-api-key
```

Get free API keys:
- Gemini: https://makersuite.google.com/app/apikey
- Groq: https://console.groq.com/keys

---

## User Flow

```
Homepage → Editor → Preview → Download
   │         │         │         │
   └── 1 ────└── 2 ────└── 3 ────└── Done!
```

Maximum 3-4 clicks from landing to downloaded resume.

---

## Documentation

- [PRODUCT.md](docs/PRODUCT.md) - Product rules and scope
- [USER_FLOW.md](docs/USER_FLOW.md) - User journey details
- [SEO_STRATEGY.md](docs/SEO_STRATEGY.md) - SEO keywords and strategy
- [MAINTENANCE.md](docs/MAINTENANCE.md) - How to safely update

---

## Deployment

Push to `main` branch → Vercel auto-deploys

```bash
git add -A
git commit -m "Your commit message"
git push origin main
```

---

## Architecture

```
hexacv/
├── src/
│   ├── AppNew.tsx          # Main app (3-step flow)
│   ├── components/         # React components
│   ├── agents/             # AI integration (Gemini/Groq)
│   └── services/           # Core services
├── public/
│   └── templates/          # Single free template
├── docs/                   # Documentation
└── package.json
```

---

## Rules (DO NOT CHANGE)

- ONE template only (Free ATS Template)
- FREE forever - No payments
- No login/signup
- No database
- No backend server
- Works offline with rule-based fallback

---

*HexaCV - Free ATS Resume Builder*
