# HexaCV - Maintenance Guide

## Safe Changes (Low Risk)

### Content Updates
- Update homepage copy
- Update meta tags
- Fix typos

### Styling
- Update colors in Tailwind config
- Adjust spacing/fonts
- Mobile responsiveness fixes

### Bug Fixes
- Fix validation errors
- Fix PDF rendering issues
- Fix mobile UI bugs

## Risky Changes (Need Testing)

### Template Changes
- **DO NOT** add new templates
- Template HTML is in `public/templates/template1free.html`
- CSS changes may break PDF rendering

### AI Prompts
- Located in `src/agents/shared/`
- Test thoroughly before deploying
- Have fallback ready

### Core Logic
- `src/rule-based-ats-engine.ts` - Offline keyword extraction
- `src/offline-role-library.ts` - Role knowledge base
- Changes here affect fallback behavior

## Deployment

### Vercel (Automatic)
1. Push to main branch
2. Vercel auto-deploys
3. Check deployment status at vercel.com

### Manual Build
```bash
npm install
npm run build
npm run preview  # Test locally
```

## Environment Variables

### Required (Frontend)
```
VITE_GEMINI_API_KEY=your-gemini-key
VITE_GROQ_API_KEY=your-groq-key
```

### Optional
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Monitoring

### Google Analytics
- Page views
- Download events
- User flow

### Console Errors
- Check browser console for errors
- LLM failures logged to console

## Emergency Procedures

### AI Services Down
1. App continues to work (rule-based fallback)
2. Users see "AI unavailable" message
3. Basic keyword extraction still works

### Vercel Down
1. Wait for Vercel status recovery
2. No local hosting option (frontend-only)

## DO NOT

- Add login/authentication
- Add database/backend
- Add paid features
- Add new templates
- Change core product rules
