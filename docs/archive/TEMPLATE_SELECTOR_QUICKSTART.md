# Template Selector - Quick Start Guide

## 🚀 Quick Start

### Accessing the Template Selector
The template selector appears after users complete the review/edit step:

```
User Flow: Homepage → Start → Review → [Template Selector] → Download
```

### Testing Locally
1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:5173`
3. Fill in resume data in the review step
4. Click "Continue" to access the template selector

## 📂 File Structure

```
src/
├── AppNew.tsx                    # Main app with template selector (lines 1403-1728)
├── template-selector.css         # Responsive styles for split-panel layout
├── template-renderer.tsx         # Renders templates with real data
├── template-engine.ts            # Populates templates with user data
└── templates.ts                  # Template definitions and metadata
```

## 🎯 Key Components

### 1. Main Template Selector (AppNew.tsx)
```typescript
// Located in: step === 'template' conditional

State:
- selectedTemplateId: string        // Current selection
- previewZoom: number               // 50-150%
- currentPage: number               // Current page in preview
- renderedPageCount: number         // Total pages

Functions:
- handleZoomIn()                    // Increase zoom by 10%
- handleZoomOut()                   // Decrease zoom by 10%
- handleZoomReset()                 // Reset to 100%
```

### 2. Layout Structure
```jsx
<div> {/* Root container */}
  <header> {/* Sticky navigation */}
    {/* Left: Title */}
    {/* Right: Back + Download buttons */}
  </header>

  <div className="template-selector-layout"> {/* 60/40 split */}
    {/* LEFT PANEL (60%) */}
    <div className="template-selection-panel">
      {/* 2-column grid of template cards */}
      {filteredTemplates.map(tpl => (
        <div onClick={() => setSelectedTemplateId(tpl.id)}>
          {/* Mini A4 preview + metadata */}
        </div>
      ))}
    </div>

    {/* RIGHT PANEL (40%) */}
    <div className="live-preview-panel">
      {/* Preview controls toolbar */}
      {/* A4 viewport with TemplateRenderer */}
      {/* Page navigation */}
    </div>
  </div>
</div>
```

## 🔧 Common Customizations

### Adjust Grid Columns
**File**: `AppNew.tsx`, template grid section

```jsx
// Change from 2 columns to 3
<div style={{ 
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)', // Change here
  gap: '24px'
}}>
```

### Modify Zoom Range
**File**: `AppNew.tsx`, zoom control functions

```typescript
// Current: 50-150%
const handleZoomIn = () => setPreviewZoom(prev => Math.min(prev + 10, 150));
const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 10, 50));

// To change range (e.g., 25-200%):
const handleZoomIn = () => setPreviewZoom(prev => Math.min(prev + 10, 200));
const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 10, 25));
```

### Change Split Ratio
**File**: `template-selector.css`

```css
/* Current: 60/40 */
.template-selector-layout {
  grid-template-columns: 60% 40%;
}

/* Change to 70/30: */
.template-selector-layout {
  grid-template-columns: 70% 30%;
}
```

### Adjust Card Preview Scale
**File**: `AppNew.tsx`, mini preview section

```jsx
// Current scale: 0.22
<div style={{
  width: '794px',
  height: '1123px',
  transform: 'scale(0.22)', // Adjust this value
  transformOrigin: 'top left'
}}>
```

## 🎨 Styling Reference

### Main Classes
```css
.template-selector-layout       /* 60/40 grid container */
.template-selection-panel       /* Left panel */
.live-preview-panel             /* Right panel */
```

### Color Variables (to be extracted)
```typescript
const COLORS = {
  primaryAccent: '#3B82F6',    // Blue - selected states
  success: '#10B981',          // Green - FREE badges
  warning: '#F59E0B',          // Amber - paid indicators
  bgLight: '#F8FAFC',          // Template panel bg
  bgDark: '#1A1A1A',           // Preview panel bg
  textPrimary: '#0F172A',      // Headings
  textSecondary: '#64748B',    // Descriptions
  border: '#E5E7EB'            // Card borders
};
```

## 🐛 Common Issues & Fixes

### Issue: Template cards not displaying
**Cause**: TemplateRenderer failed to load templates  
**Fix**: Check browser console for errors, verify template files exist in `public/templates/`

### Issue: Preview zoom not working
**Cause**: `previewZoom` state not initialized  
**Fix**: Ensure state is declared at component top level:
```typescript
const [previewZoom, setPreviewZoom] = useState(100);
```

### Issue: Responsive layout broken on mobile
**Cause**: CSS media queries not loading  
**Fix**: Verify `template-selector.css` is imported in `AppNew.tsx`:
```typescript
import './template-selector.css';
```

### Issue: Page navigation doesn't scroll
**Cause**: Multi-page scrolling not implemented in TemplateRenderer  
**Fix**: This is a known limitation; page indicator displays correctly but scrolling requires iframe manipulation

## 📊 Performance Tips

### 1. Optimize Template Rendering
```typescript
// Use React.memo for expensive components
const MemoizedTemplateRenderer = React.memo(TemplateRenderer);

// Memoize resume data
const memoizedResumeData = useMemo(() => resume, [resume]);
```

### 2. Debounce Rapid Template Switches
```typescript
import { debounce } from 'lodash';

const handleTemplateSelect = debounce((templateId: string) => {
  setSelectedTemplateId(templateId);
}, 300);
```

### 3. Lazy Load Template Previews
```typescript
// Only render visible templates (virtual scrolling)
import { useVirtualizer } from '@tanstack/react-virtual';
```

## 🧪 Testing Checklist

### Manual Testing
- [ ] Click each template card → Preview updates
- [ ] Click zoom buttons → Preview scales correctly
- [ ] Zoom reaches limits → Buttons disable
- [ ] Click page navigation → Indicator updates
- [ ] Resize window → Layout adapts at breakpoints
- [ ] Hover over cards → Elevation animation works
- [ ] Click Download PDF → PDF generates with selected template
- [ ] Click Back to Edit → Returns to review page

### Browser Compatibility
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

### Responsive Testing
- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

## 🔌 API Integration Points

### Template Fetching
```typescript
// src/api-service.ts
export async function fetchTemplates(): Promise<Template[]> {
  // Fetch from backend or use static config
  return TEMPLATES; // From templates.ts
}
```

### PDF Generation
```typescript
// Triggered by Download PDF button
const generatePDF = () => {
  generatePDFFromHTMLTemplate(
    selectedTemplateId,
    resumeData,
    `${resume.name}_Resume.pdf`
  );
};
```

### Analytics Tracking
```typescript
// Track template selection
trackEvent('template_click', selectedTemplateId, targetRole, {
  price: template.price
});

// Track download
trackEvent('download', selectedTemplateId, targetRole);
```

## 📝 Adding a New Template

1. **Create HTML file**:
   ```
   public/templates/my-template.html
   ```

2. **Register in templates.ts**:
   ```typescript
   {
     id: 'my-template',
     name: 'My Template',
     description: 'Description here',
     price: 0,
     category: 'professional',
     headerStyle: 'modern',
     colorScheme: { ... },
     atsSafe: true
   }
   ```

3. **Add to template-renderer.tsx**:
   ```typescript
   const templateMap: Record<string, string> = {
     // ... existing templates
     'my-template': 'my-template'
   };
   ```

4. **Test**:
   - Restart dev server
   - Template should appear in grid
   - Click to preview

## 🎓 Architecture Decisions

### Why Split Panel?
- **Instant feedback**: Users see changes immediately without switching screens
- **Easy comparison**: Side-by-side viewing helps decision-making
- **Professional UX**: Common pattern in design tools (Figma, Canva)

### Why Sticky Preview?
- **Constant reference**: Preview always visible while scrolling templates
- **Reduced cognitive load**: No need to remember what template looks like
- **Better UX**: Aligns with industry standards

### Why Real Data in Cards?
- **Accuracy**: Users see how their actual data fits in each template
- **Trust**: No surprises when generating PDF
- **WYSIWYG**: What you see is what you get

## 📚 Additional Resources

- **Design Document**: `.qoder/quests/design-template-selector.md`
- **Implementation Summary**: `TEMPLATE_SELECTOR_IMPLEMENTATION.md`
- **Visual Guide**: `TEMPLATE_SELECTOR_VISUAL_GUIDE.md`
- **Template Engine Docs**: Comments in `src/template-engine.ts`

## 🆘 Getting Help

### Debug Mode
Enable React DevTools and check:
1. Component state (`selectedTemplateId`, `previewZoom`, etc.)
2. Props passed to `TemplateRenderer`
3. Console errors/warnings

### Logging
Add debug logs:
```typescript
console.log('Selected template:', selectedTemplateId);
console.log('Preview zoom:', previewZoom);
console.log('Current page:', currentPage, 'of', renderedPageCount);
```

### Common Console Errors
```
❌ "Cannot read property 'id' of undefined"
→ Check if templates loaded: console.log(templates)

❌ "Transform origin not working"
→ Verify CSS transform-origin is set to 'center center'

❌ "Preview not updating"
→ Check TemplateRenderer key prop includes templateId
```

---

**Quick Start Version**: 1.0  
**Last Updated**: January 7, 2026  
**Maintained By**: Development Team
