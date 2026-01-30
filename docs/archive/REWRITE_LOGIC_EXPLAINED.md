# 🔄 REWRITE LOGIC EXPLAINED - Who Uses OpenAI?

## 📊 **REWRITE FLOW DIAGRAM**

```
USER REQUEST
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 2 EDITOR: "AI Suggestions" Button                 │
│  File: src/components/Step2Editor.tsx                   │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  PRIMARY: honestAIRewriteService.rewriteWithConstraints │
│  File: src/services/honestAIRewriteService.ts           │
│  ✅ Uses OpenAI GPT-4o-mini                              │
│  ✅ Context-aware (role/market/exp/JD)                   │
│  ✅ Validates against experience level                   │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  OPENAI API CALL                                        │
│  Model: gpt-4o-mini                                     │
│  Endpoint: https://api.openai.com/v1/chat/completions  │
│  Key: VITE_OPENAI_API_KEY (from .env)                  │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  FALLBACK (if OpenAI fails):                            │
│  rewriteWithRules() - Rule-based rewrite                │
│  No API call, uses intelligence data                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 **WHO REWRITES WHAT?**

### **1. PRIMARY REWRITE SERVICE (NEW - RECOMMENDED)** ✅

**File:** `src/services/honestAIRewriteService.ts`

**Functions:**
- `rewriteWithConstraints()` - **Main rewrite function**
- `fixGrammarOnly()` - Grammar fix only
- `suggestSkillGaps()` - Skill suggestions (no rewrite)

**Uses OpenAI:** ✅ YES
- Model: `gpt-4o-mini`
- Temperature: `0.3` (balanced creativity)
- Max tokens: `400`

**Context Provided:**
- Role (e.g., "Data Analyst")
- Market (e.g., "India")
- Experience Level (e.g., "1-3 years")
- JD Keywords (if available)
- Role Market Intelligence (core skills, avoid claims, action verbs)

**Used By:**
- ✅ `Step2Editor.tsx` - When user clicks "AI Suggestions"
- ✅ `Step2Templates.tsx` - For Template2 AI-rewritten preview
- ✅ `MobileFinalPreview.tsx` - For Template2 download

**Example Call:**
```typescript
const result = await rewriteWithConstraints({
  mode: 'rewrite',
  role: 'Data Analyst',
  market: 'india',
  experienceLevel: '1-3',
  jdKeywords: ['SQL', 'Python', 'Power BI'],
  originalText: 'Worked on data analysis'
});
```

---

### **2. OPENAI SERVICE (PAID TEMPLATE)** 

**File:** `src/services/openaiService.ts`

**Functions:**
- `rewriteBulletWithOpenAI()` - Rewrite single bullet
- `rewriteSummaryWithOpenAI()` - Rewrite summary
- `extractJDKeywords()` - Extract keywords (no OpenAI, regex-based)

**Uses OpenAI:** ✅ YES
- Model: `gpt-4o-mini`
- Temperature: `0.3`
- Max tokens: `300` (bullets), `400` (summary)

**Used By:**
- ⚠️ `paidAIRewriteService.ts` - For paid template secondary rewrite
- ⚠️ Legacy code (being replaced by honestAIRewriteService)

---

### **3. PAID AI REWRITE SERVICE (BACKEND API)**

**File:** `src/services/paidAIRewriteService.ts`

**Functions:**
- `applyPaidAIRewrite()` - Rewrite entire resume
- Calls backend `/api/ai-rewrite/bullet` and `/api/ai-rewrite/summary`

**Uses OpenAI:** ⚠️ INDIRECT (via backend)
- Backend makes OpenAI calls
- Frontend just calls backend API

**Used By:**
- `Step2Templates.tsx` - Optional secondary rewrite for Template2
- `Step3TemplateExport.tsx` - Legacy export flow

---

### **4. GEMINI SERVICE (FALLBACK/LEGACY)**

**File:** `src/services/geminiService.ts`

**Functions:**
- `rewriteBulletPoint()` - Uses Gemini/Groq
- `rewriteAllBullets()` - Batch rewrite

**Uses OpenAI:** ❌ NO
- Uses Gemini API or Groq API
- Fallback when OpenAI unavailable

**Used By:**
- ⚠️ Legacy code (being phased out)

---

## 🔄 **CURRENT REWRITE FLOW (STEP-BY-STEP)**

### **STEP 1: User Clicks "AI Suggestions" in Editor**

**File:** `src/components/Step2Editor.tsx` (line ~708)

```typescript
const handleAISuggestions = async () => {
  // 1. Validate CV first
  const validation = await validateUserCV(data);
  setValidationWarnings(validation.warnings);
  
  // 2. Get JD keywords
  const jdKeywords = extractJDKeywords(data.jobDescription || '');
  
  // 3. Rewrite summary
  const summaryResult = await rewriteWithConstraints({
    mode: 'rewrite',
    role: data.basics.targetRole || 'Software Engineer',
    market: targetMarket,
    experienceLevel,
    jdKeywords,
    originalText: data.summary
  });
  
  // 4. Rewrite each bullet
  for (const exp of data.experience) {
    for (const bullet of exp.highlights) {
      const bulletResult = await rewriteWithConstraints({
        mode: 'rewrite',
        role: data.basics.targetRole || 'Software Engineer',
        market: targetMarket,
        experienceLevel,
        jdKeywords,
        originalText: bullet
      });
      // Add to suggestions
    }
  }
};
```

---

### **STEP 2: Template2 Preview Generation**

**File:** `src/components/Step2Templates.tsx` (line ~268)

```typescript
const generateAIRewrittenData = async (originalData: ResumeData) => {
  // 1. Get role market intelligence
  const intelligence = await getRoleMarketIntelligence(
    originalData.basics.targetRole,
    targetMarket,
    experienceLevel
  );
  
  // 2. Get JD keywords
  const jdKeywords = extractJDKeywords(originalData.jobDescription || '');
  
  // 3. Rewrite each experience bullet
  const rewrittenExperience = await Promise.all(
    originalData.experience.map(async (exp) => {
      const rewrittenHighlights = await Promise.all(
        exp.highlights.map(async (bullet) => {
          const result = await rewriteWithConstraints({
            mode: 'rewrite',
            role: originalData.basics.targetRole || 'Software Engineer',
            market: targetMarket,
            experienceLevel,
            jdKeywords: jdKeywords.length > 0 ? jdKeywords : undefined,
            originalText: bullet
          });
          return result.rewritten;
        })
      );
      return { ...exp, highlights: rewrittenHighlights };
    })
  );
  
  return { ...originalData, experience: rewrittenExperience };
};
```

---

### **STEP 3: Template2 Download (Optional Secondary Rewrite)**

**File:** `src/components/Step2Templates.tsx` (line ~550)

```typescript
const handleDownload = async (template) => {
  if (template.id === 'template2') {
    // Use AI-rewritten data
    let finalData = aiRewrittenData;
    
    // OPTIONAL: Apply additional paid AI rewrite
    try {
      const { applyPaidAIRewrite } = await import('../services/paidAIRewriteService');
      const rewriteOutput = await applyPaidAIRewrite(aiRewrittenData, data.jobDescription);
      finalData = applyRewriteToResumeData(aiRewrittenData, rewriteOutput);
    } catch (error) {
      // Continue with aiRewrittenData if paid service fails
    }
    
    await generatePDFFromTemplate(template.id, finalData);
  }
};
```

---

## 🎯 **REWRITE LOGIC SUMMARY**

### **PRIMARY (NEW - RECOMMENDED):**
- **Service:** `honestAIRewriteService.rewriteWithConstraints()`
- **Uses OpenAI:** ✅ YES (gpt-4o-mini)
- **Context:** Full (role/market/exp/JD/intelligence)
- **Validation:** ✅ YES (checks experience level)
- **Used In:** Step2Editor, Step2Templates (Template2)

### **SECONDARY (OPTIONAL):**
- **Service:** `paidAIRewriteService.applyPaidAIRewrite()`
- **Uses OpenAI:** ⚠️ INDIRECT (via backend)
- **Context:** Limited (role/JD only)
- **Validation:** ❌ NO
- **Used In:** Template2 download (optional enhancement)

### **FALLBACK:**
- **Service:** `rewriteWithRules()` (in honestAIRewriteService)
- **Uses OpenAI:** ❌ NO (rule-based)
- **Context:** Uses intelligence data
- **Validation:** ✅ YES
- **Used When:** OpenAI unavailable or fails

---

## 🔑 **OPENAI API KEY LOCATION**

**Environment Variable:** `VITE_OPENAI_API_KEY`

**Set In:**
- `.env` file (root directory)
- `.env.local` (local overrides)

**Usage:**
```typescript
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
```

**Check:**
```typescript
if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key_here') {
  // Fallback to rule-based rewrite
}
```

---

## 📊 **REWRITE CALL FLOW**

```
User Action
    ↓
Component (Step2Editor/Step2Templates)
    ↓
honestAIRewriteService.rewriteWithConstraints()
    ↓
Check OpenAI Key
    ├─ YES → Call OpenAI API (gpt-4o-mini)
    │         ↓
    │      Get Response
    │         ↓
    │      Validate Against Experience Level
    │         ↓
    │      Return Result + Warnings
    │
    └─ NO → rewriteWithRules() (rule-based)
              ↓
           Return Result (lower confidence)
```

---

## ✅ **WHAT'S WORKING NOW:**

1. ✅ **Step2Editor** uses `honestAIRewriteService` with full context
2. ✅ **Template2 Preview** uses `honestAIRewriteService` with full context
3. ✅ **Template2 Download** uses AI-rewritten data (with optional paid enhancement)
4. ✅ **Fallback** to rule-based if OpenAI unavailable
5. ✅ **Validation** prevents inappropriate claims

---

## ⚠️ **LEGACY CODE (BEING PHASED OUT):**

- `geminiService.ts` - Old Gemini-based rewrite
- `agentOrchestrationService.ts` - Old agent system
- Direct `openaiService.ts` calls (replaced by honestAIRewriteService)

---

**Last Updated:** 2026-01-23
**Status:** ✅ Primary rewrite uses OpenAI with full context
