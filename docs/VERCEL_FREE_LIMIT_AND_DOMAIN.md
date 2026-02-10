# Vercel free limit (12 functions) and your domain hexacv.online

## What’s going on

- **Vercel Hobby (free)** allows **max 12 serverless functions** per deployment. Your project had more than 12, so the build failed with: *"No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan."*
- You bought **hexacv.online** (e.g. via Vercel Domains). The domain is yours; it’s not tied only to one host.
- **Netlify** doesn’t show your custom domain when you “create project” because you add the domain **after** the site is created and deployed.

---

## Option A: Stay on Vercel (free) and keep hexacv.online

1. **Reduce serverless functions to 12 or fewer**  
   This repo has **8 serverless functions** after removing the unused legacy route (`api/payments/record.ts`). If your **failed deployment is a different project** (e.g. "hexacv-admin" from another repo), reduce functions there too, or use this repo as the single deployment and add your domain to it.

2. **Redeploy**  
   Push the changes and redeploy on Vercel (or click Redeploy in the Vercel dashboard). The build should pass.

3. **Use your domain**  
   In Vercel: **Project → Settings → Domains** → Add **hexacv.online** (and `www.hexacv.online` if you want).  
   If you bought the domain in Vercel, it may already be in your account; you just assign it to this project.

No need to pay for Pro if you stay under 12 functions.

---

## Option B: Move to Netlify (free) and use hexacv.online

1. **Create the site on Netlify**  
   Connect the same Git repo and build (e.g. build command: `node build.mjs`, publish: `dist`). You don’t add a custom domain during “create project.”

2. **Add the domain after the site exists**  
   - **Site → Domain management → Add domain / Add custom domain**  
   - Enter **hexacv.online** (and optionally **www.hexacv.online**).  
   - Netlify will show the DNS records you need (e.g. A record or CNAME).

3. **Point the domain to Netlify**  
   - If you bought the domain **in Vercel**: Vercel Domains → hexacv.online → DNS / Nameservers. Either change nameservers to Netlify’s, or add the A/CNAME records Netlify gives you (if your registrar allows DNS there).  
   - If the domain is at another registrar (GoDaddy, Namecheap, etc.): in that registrar’s DNS, add the A or CNAME record Netlify shows.

4. **Wait for DNS**  
   It can take a few minutes up to 48 hours. After that, hexacv.online will open your Netlify site.

**Note:** Netlify free tier also has limits (e.g. serverless invocations). If this app uses many serverless/API routes, you may need to move or merge them (e.g. fewer endpoints) for Netlify as well.

---

## Summary

| Goal | What to do |
|------|------------|
| Stay on Vercel, no money | Reduce to ≤12 functions (done in this repo), redeploy, add hexacv.online in Project → Domains. |
| Use Netlify | Create site from repo, deploy, then **Domain management → Add custom domain** → hexacv.online, then point DNS to Netlify. |
| Domain not “showing” on Netlify | Normal: you add the custom domain **after** the project is created, in Domain management. |

Your domain **hexacv.online** works with either Vercel or Netlify; you just configure it in that host’s “Domains” or “Domain management” and point DNS to that host.
