# Template Selector - Visual Implementation Guide

## Page Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOP NAVIGATION BAR (Sticky - 80px height)                                  │
│ ┌─────────────────────────────────┬─────────────────────────────────────┐  │
│ │ Choose Your Template            │ [← Back to Edit] [⬇ Download PDF]  │  │
│ │ Preview designs • 1 page        │                                     │  │
│ └─────────────────────────────────┴─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────┬────────────────────────────────────────┐
│ LEFT PANEL (60%)                   │ RIGHT PANEL (40%)                      │
│ Background: #F8FAFC                │ Background: #1A1A1A                    │
│                                    │                                        │
│ Available Templates (4)            │ ┌────────────────────────────────────┐ │
│                                    │ │ PREVIEW CONTROLS                   │ │
│ ┌──────────┬──────────┐           │ │ [−] [100%] [+]     Page 1 of 2    │ │
│ │          │          │           │ └────────────────────────────────────┘ │
│ │ Template │ Template │           │                                        │
│ │    1     │    2     │           │ ┌────────────────────────────────────┐ │
│ │  (A4)    │  (A4)    │           │ │                                    │ │
│ │          │          │           │ │                                    │ │
│ │ [✓] FREE │    FREE  │           │ │     LIVE A4 PREVIEW                │ │
│ └──────────┴──────────┘           │ │                                    │ │
│                                    │ │     • Real resume data             │ │
│ ┌──────────┬──────────┐           │ │     • Zoom: 50-150%                │ │
│ │          │          │           │ │     • Transform: center            │ │
│ │ Template │ Template │           │ │     • Shadow: paper effect         │ │
│ │    3     │    4     │           │ │                                    │ │
│ │  (A4)    │  (A4)    │           │ │                                    │ │
│ │          │          │           │ │                                    │ │
│ │   ₹49    │   ₹99    │           │ │                                    │ │
│ └──────────┴──────────┘           │ └────────────────────────────────────┘ │
│                                    │                                        │
│ [Scrollable for more templates]   │ ┌────────────────────────────────────┐ │
│                                    │ │ [◀ Previous]  1 of 2  [Next ▶]    │ │
│                                    │ └────────────────────────────────────┘ │
└────────────────────────────────────┴────────────────────────────────────────┘
```

## Component Breakdown

### 1. Top Navigation Bar
```
┌─────────────────────────────────────────────────────────────────┐
│  Brand/Title                              Actions                │
│  ├─ "Choose Your Template" (24px bold)    ├─ Back to Edit       │
│  └─ "Preview designs • 1 page" (13px)     └─ Download PDF (CTA) │
└─────────────────────────────────────────────────────────────────┘
Properties:
- Position: sticky, top: 0
- Z-index: 1000
- Background: #FFFFFF
- Border-bottom: 1px solid #e5e7eb
- Padding: 16px 32px
- Shadow: 0 1px 3px rgba(0,0,0,0.05)
```

### 2. Template Card (Left Panel)
```
┌───────────────────────────────┐
│  ┌─────────────────────────┐  │ ← Checkmark (if selected)
│  │                         │  │   Position: absolute, top-right
│  │   MINI A4 PREVIEW       │  │   32px circle, blue bg, white ✓
│  │   (Scale: 0.22)         │  │
│  │   794px → 175px width   │  │
│  │                         │  │
│  │   [Real resume data]    │  │
│  │                         │  │
│  └─────────────────────────┘  │
│  ────────────────────────────  │
│  Template Name       [ATS] FREE│
│  Short description here...     │
└───────────────────────────────┘

States:
• Default:    Border 1px #E5E7EB, Shadow subtle
• Hover:      Border 1px #3B82F6, Shadow elevated, Transform Y-4px
• Selected:   Border 3px #3B82F6, Checkmark visible, Strong shadow
```

### 3. Preview Panel (Right - Dark Theme)
```
┌────────────────────────────────────────┐
│ TOOLBAR (#2d2d2d)                      │
│ ┌────┐ ┌─────┐ ┌────┐    Page 1 of 2  │
│ │ − │ │100%│ │ + │                    │
│ └────┘ └─────┘ └────┘                  │
├────────────────────────────────────────┤
│                                        │
│       ┌──────────────────┐             │
│       │                  │             │
│       │  A4 CANVAS       │             │
│       │  794×1123px      │             │
│       │                  │             │
│       │  [Resume HTML]   │             │
│       │                  │             │
│       └──────────────────┘             │
│         ^ Zoom transform applied       │
│                                        │
├────────────────────────────────────────┤
│ NAVIGATION (#2d2d2d)                   │
│    [◀ Previous]  1 of 2  [Next ▶]     │
└────────────────────────────────────────┘

Colors:
- Background: #1A1A1A
- Toolbar/Nav: #2d2d2d
- Buttons: #FFFFFF (white)
- Text: #FFFFFF
- Preview Shadow: 0 12px 48px rgba(0,0,0,0.4)
```

## Interaction States

### Template Card States
```
┌─────────────────────────────────────────────────────────────┐
│ State      │ Border        │ Shadow           │ Transform   │
├────────────┼───────────────┼──────────────────┼─────────────┤
│ Default    │ 1px #E5E7EB   │ Subtle (0 1px)   │ none        │
│ Hover      │ 1px #3B82F6   │ Elevated (0 4px) │ Y(-4px)     │
│ Selected   │ 3px #3B82F6   │ Strong (0 8px)   │ none        │
│ Checkmark  │ Visible ✓     │ Blue circle      │ scale(1)    │
└─────────────────────────────────────────────────────────────┘
```

### Zoom Button States
```
┌──────────────────────────────────────────────────────────┐
│ Zoom Level │ [−] Button │ Display │ [+] Button          │
├────────────┼────────────┼─────────┼─────────────────────┤
│ 50%        │ Disabled   │ "50%"   │ Enabled (white)     │
│ 100%       │ Enabled    │ "100%"  │ Enabled             │
│ 150%       │ Enabled    │ "150%"  │ Disabled (gray 40%) │
└──────────────────────────────────────────────────────────┘

Disabled style:
- Background: #404040
- Opacity: 0.4
- Cursor: not-allowed
```

### Page Navigation States
```
┌─────────────────────────────────────────────────────────┐
│ Page      │ [Previous] │ Indicator │ [Next]            │
├───────────┼────────────┼───────────┼───────────────────┤
│ 1 of 2    │ Disabled   │ "1 of 2"  │ Enabled (white)   │
│ 2 of 2    │ Enabled    │ "2 of 2"  │ Disabled (gray)   │
└─────────────────────────────────────────────────────────┘
```

## Color Palette Reference

### Primary Colors
```
#3B82F6 ████ Primary Accent (Blue) - Selected states, CTAs
#10B981 ████ Success (Green) - FREE badges, checkmarks
#F59E0B ████ Warning (Amber) - Paid indicators
```

### Background Colors
```
#FFFFFF ████ White - Cards, buttons, paper
#F8FAFC ████ Background Light - Template panel
#1A1A1A ████ Background Dark - Preview panel
#2d2d2d ████ Panel Dark - Toolbar/Navigation
```

### Text Colors
```
#0F172A ████ Text Primary - Headings
#64748B ████ Text Secondary - Descriptions
#E5E7EB ████ Border - Card borders
```

## Spacing System (8px base)

```
┌─────────┬────────┬────────────────────────────┐
│ Size    │ Value  │ Usage                      │
├─────────┼────────┼────────────────────────────┤
│ XS      │ 8px    │ Icon gaps, tight spacing   │
│ SM      │ 12-16px│ Button padding, small gaps │
│ MD      │ 20-24px│ Card gaps, sections        │
│ LG      │ 32-40px│ Panel padding, margins     │
│ XL      │ 48-64px│ Page margins               │
└─────────┴────────┴────────────────────────────┘
```

## Responsive Breakpoints

```
Desktop Large (≥1920px)
┌───────────────────────────────────────────┐
│ 60%                      │ 40%            │  Max-width: 2400px
│ Template Grid (2 col)    │ Preview Panel  │  Padding: 48-64px
└───────────────────────────────────────────┘

Desktop (1366px-1919px)
┌───────────────────────────────────────────┐
│ 60%                      │ 40%            │  Full 60/40 split
│ Template Grid (2 col)    │ Preview Panel  │  Padding: 40px
└───────────────────────────────────────────┘

Laptop (1024px-1365px)
┌───────────────────────────────────────────┐
│ 55%                    │ 45%              │  Adjusted split
│ Template Grid (2 col)  │ Preview Panel    │  Padding: 32px
└───────────────────────────────────────────┘

Tablet (768px-1023px)
┌───────────────────────────────────────────┐
│ Template Grid (1 col - stacked)           │  Full width
├───────────────────────────────────────────┤  Padding: 24px
│ Preview Panel (bottom sheet - 600px)      │  1-column grid
└───────────────────────────────────────────┘

Mobile (<768px)
┌───────────────────────────────────────────┐
│ Template Grid (1 col - full width)        │  Padding: 16px
│ [Preview hidden - show as modal]          │  Cards: 280px height
└───────────────────────────────────────────┘
```

## Animation Timing Reference

```
┌─────────────────────────┬──────────┬──────────────┐
│ Animation               │ Duration │ Easing       │
├─────────────────────────┼──────────┼──────────────┤
│ Template selection      │ 300ms    │ ease-in-out  │
│ Preview transition      │ 300ms    │ ease-out     │
│ Hover elevation         │ 200ms    │ ease-in-out  │
│ Zoom scale              │ 250ms    │ ease-in-out  │
│ Page navigation         │ 400ms    │ ease-in-out  │
│ Button press            │ 150ms    │ ease-out     │
└─────────────────────────┴──────────┴──────────────┘
```

## CSS Class Reference

```css
/* Main layout containers */
.template-selector-layout      /* 60/40 grid container */
.template-selection-panel      /* Left panel (60%) */
.live-preview-panel            /* Right panel (40%) */

/* Custom scrollbar (left panel) */
.template-selection-panel::-webkit-scrollbar        /* 8px width */
.template-selection-panel::-webkit-scrollbar-track  /* #e2e8f0 bg */
.template-selection-panel::-webkit-scrollbar-thumb  /* #94a3b8 bg */

/* Loading states */
.template-loading              /* Opacity 0.6, spinner */
.template-loading::after       /* Spinning animation */
```

## Key Measurements

### Template Card
```
Width: ~250px (responsive to grid)
Height: 350px (70% preview + 30% metadata)
Preview scale: 0.22 (794px → 175px)
Aspect ratio: 1:1.414 (A4 standard)
```

### Preview Panel
```
A4 Canvas: 794px × 1123px (exact dimensions)
Zoom range: 50% - 150%
Transform origin: center center
Toolbar height: 60px
Navigation height: 50px
```

### Navigation Bar
```
Height: 80px
Padding: 16px 32px
Button gap: 12px
Title size: 24px
Subtitle size: 13px
```

## Accessibility Features

```
┌────────────────────────────────────────────────────┐
│ Feature              │ Implementation              │
├──────────────────────┼─────────────────────────────┤
│ Keyboard Navigation  │ Tab order optimized         │
│ Focus Indicators     │ 3px blue outline            │
│ ARIA Labels          │ All buttons labeled         │
│ Color Contrast       │ WCAG AA (4.5:1 minimum)     │
│ Reduced Motion       │ Respects prefers-reduced    │
│ High Contrast        │ Border enhancements         │
│ Touch Targets        │ 44px minimum on mobile      │
└────────────────────────────────────────────────────┘
```

## Implementation Checklist

- [x] 60/40 split panel layout
- [x] 2-column template grid (4 visible initially)
- [x] A4-proportioned mini previews (scale 0.22)
- [x] Template card selection states (default, hover, selected)
- [x] Checkmark indicator on selected template
- [x] Live preview panel with real user data
- [x] Zoom controls (50-150% range)
- [x] Page navigation (Previous/Next buttons)
- [x] Responsive breakpoints (desktop, laptop, tablet, mobile)
- [x] Smooth animations (300ms template selection)
- [x] Color palette implementation
- [x] Typography scale
- [x] Shadow hierarchy
- [x] Accessibility features
- [x] Custom scrollbar styling
- [x] Touch device optimizations

## Quick Reference: Component Props

### TemplateRenderer
```typescript
templateId: string          // Selected template ID
resumeData: ResumeData      // User's actual resume data
onPageCountChange?: (n)     // Callback for page count
currentPage?: number        // Current visible page (1-based)
className?: string          // Additional CSS classes
```

### State Variables
```typescript
selectedTemplateId: string  // Current template
previewZoom: number        // 50-150%
currentPage: number        // Current page in preview
renderedPageCount: number  // Total pages
```

---

**Document Version**: 1.0  
**Last Updated**: January 7, 2026  
**Status**: Implementation Complete ✅
