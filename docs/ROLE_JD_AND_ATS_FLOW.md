# Role, Job Description & ATS Flow

How the app uses **user context** (target role, JD, skills, experience) for ATS scoring and rewrites.

---

## 1. Data the app uses

| Data | Source | Used for |
|------|--------|----------|
| **Target role** | `data.basics.targetRole` | ATS context, free/paid rewrite prompts, resume text for scoring |
| **Job description (JD)** | `data.jobDescription` | Keyword extraction → ATS score, missing keywords, paid rewrite keywords |
| **Skills** | `data.skills` + experience/summary | Part of `resumeToText()` so ATS score sees them; also shown in doc |
| **Experience** | `data.experience` (company, position, dates, highlights) | Resume text for scoring; content for rewrites |
| **Summary, education, projects** | `data.summary`, `data.education`, `data.projects` | Included in `resumeToText()` for ATS |

When **no JD** is provided, the app still shows structure feedback and section warnings; it does **not** show a numeric ATS score or missing keywords (by design).

---

## 2. ATS score and keywords

- **Resume text:** `resumeToText(data)` builds one string from: name, contact, target role, summary, experience (company, role, dates, bullets), education, projects, skills, achievements. So the app **does** use role, skills, and full experience for scoring.
- **JD keywords:** `extractKeywordsFromJD(jdText)` (rule-based) returns:
  - **skills** (e.g. Python, React, SQL)
  - **tools** (e.g. Git, Jira, Docker)
  - **technologies** (from same lists + JD text)
  - **softSkills** (e.g. leadership, communication)
  - **roleKeywords** (e.g. frontend, backend, data engineer)
  - **businessTerms** (e.g. KPI, SaaS, compliance)
- **Scoring:** `scoreATS(resumeText, jdKeywords)` checks the resume text against **all** of these categories (skills, tools, technologies, softSkills, roleKeywords, businessTerms). Score = (matched / total) × 100. **Missing keywords** are shown in the ATS card so the user can add them.

So: **role + JD + skills and other keywords** are all used for ATS. The app does **not** use a generic list only; it uses JD-derived keywords when a JD is present.

---

## 3. Free vs paid wording

| | Free | Paid |
|---|------|------|
| **What** | Bullet improve (grammar, clarity) | ATS-oriented rewrite with role + JD keywords |
| **Where** | `freeRewrite.improveBullet(text, role?)` (Groq, frontend) | `paidRewrite.rewriteWithConstraints({...})` → `POST /api/rewrite/paid` (OpenAI, server) |
| **Role** | Optional `role` passed to prompt | `role` + `experienceLevel` + `market` in API |
| **JD keywords** | **Not** sent (free path is generic) | **Sent** as `jdKeywords`; backend prompt says "Integrate keywords if implied" |
| **Good vs bad wording** | No explicit bad→good list | Backend + `ai-prompts` atsOptimization: avoid buzzwords, use strong action verbs |

**Free path** does **not** inject JD keywords into suggestions; it improves clarity/grammar and can use role. **Paid path** is intended to use role + JD keywords for ATS-friendly wording. Any UI that calls `rewriteWithConstraints` after payment should pass `jdKeywords: extractKeywordsFromJD(data.jobDescription || '').allKeywords` when the user has a JD.

---

## 4. UI copy (current)

- **No JD:** “ATS feedback available once you add a job description.” (no score, no missing keywords)
- **With JD:** “ATS feedback based on your job description.” (score + missing keywords from JD)
- **Preview:** “Add a job description in the editor to see your score.” when score is null

This makes it clear that **JD drives keyword match and suggestions**.

---

## 5. Summary

- **User exp, role, JD, skills:** All are used. Resume text for ATS includes role, summary, experience, skills. JD is used to extract keywords; score and missing keywords are based on that.
- **Good/bad words:** Handled in paid rewrite and `atsOptimization` (avoid buzzwords, strong verbs). Free path does not do keyword or “bad word” substitution.
- **Keywords:** From JD via `extractKeywordsFromJD`; all categories (skills, tools, technologies, soft, role, business) are used in `scoreATS` and shown as missing when absent from the resume.
- **Logic:** Free = rule-based structure + JD keyword match (when JD present) + optional role in free bullet improve. Paid = server rewrite with role + experience level + JD keywords.
