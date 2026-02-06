# HexaCV - User Flow Documentation

## Simplified 3-Step Flow

HexaCV uses a minimal, friction-free user flow:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   STEP 1        │    │   STEP 2        │    │   STEP 3        │
│   Homepage      │───>│   Editor        │───>│   Preview       │
│                 │    │                 │    │   + Download    │
│ - Upload PDF    │    │ - Edit sections │    │ - View result   │
│ - Start fresh   │    │ - Add content   │    │ - Download PDF  │
│                 │    │ - JD keywords   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Step Details

### Step 1: Homepage
- User lands on homepage
- Two options:
  1. **Upload PDF** - AI parses existing resume
  2. **Start from Scratch** - Empty form

### Step 2: Editor
- Fill in all resume sections:
  - Profile (name, contact, target role)
  - Summary
  - Experience (multiple entries)
  - Education
  - Projects
  - Skills
  - Achievements
- Optional: Paste Job Description for keyword extraction
- Click "Preview" to continue

### Step 3: Preview + Download
- View final resume in template
- Download as PDF
- Return to homepage or edit again

## Maximum Steps: 3-4

The user should be able to go from landing to downloaded resume in **3-4 clicks**:

1. Upload resume (or start fresh)
2. Review/edit content
3. Preview
4. Download

## No Extra Steps

The following are explicitly removed:
- Login / Signup
- Template selection (only 1 template)
- Payment / Checkout
- Email verification
- Account creation
