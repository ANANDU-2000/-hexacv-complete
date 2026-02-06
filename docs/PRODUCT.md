# HexaCV - Product Documentation

## What is HexaCV?

HexaCV is a **free, frontend-only ATS resume builder** that helps job seekers create optimized resumes without any login, signup, or payment.

## Core Value Proposition

1. **Instant ATS Keyword Extraction** - Paste a job description to extract keywords
2. **Honest Resume Rewriting** - AI improves wording without inventing fake experience
3. **ATS-Friendly Formatting** - Clean, parseable template that passes ATS systems
4. **Zero Friction** - No login, no signup, no database, no cookies (except analytics)

## Product Rules (LOCKED - DO NOT CHANGE)

- **ONE template only** (Free ATS Template)
- **FREE forever** - No paid features, no upgrades
- **No login/signup required**
- **No user data stored** on servers
- **No payments** - Everything is free
- **Works offline** - Rule-based fallback if AI unavailable

## Target Users

1. **Freshers** looking for first job
2. **Job seekers** optimizing for ATS systems
3. **Career switchers** reformatting their experience
4. **Anyone** who needs a quick, free resume

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **AI**: Google Gemini (free tier) + Groq (free tier)
- **Hosting**: Vercel (free tier)
- **PDF**: jsPDF + html2canvas (client-side)

## Zero Cost Architecture

| Component | Cost | Limit |
|-----------|------|-------|
| Vercel Hosting | $0 | 100GB/month |
| Gemini API | $0 | 60 req/min |
| Groq API | $0 | 30 req/min |
| Rule-based Fallback | $0 | Unlimited |

**Total Monthly Cost: $0**

## Feature Scope (DO NOT EXPAND)

### Included
- Resume upload (PDF parsing)
- Manual resume creation
- ATS keyword extraction
- Grammar/spelling fixes
- PDF download
- Single free template

### Explicitly NOT Included
- User accounts / authentication
- Cloud storage of resumes
- Multiple templates
- Premium features
- Payment processing
- Admin dashboard
- Analytics beyond page views
