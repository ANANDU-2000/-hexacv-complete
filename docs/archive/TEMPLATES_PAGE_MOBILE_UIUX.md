# Mobile UI/UX Design Specification
## Templates Page - Responsive Design

---

## 📱 Mobile Design Philosophy

### Core Principles
1. **Touch-First**: Design for fingers, not cursors
2. **Content Priority**: Preview first, options second
3. **Thumb Zone**: Critical actions within easy reach
4. **Performance**: Fast, smooth, responsive
5. **Native Feel**: Match platform conventions

---

## 📐 Mobile Breakpoints

```css
/* Mobile Portrait */
@media (max-width: 480px) {
  /* 320px - 480px */
}

/* Mobile Landscape */
@media (min-width: 481px) and (max-width: 767px) {
  /* 481px - 767px */
}

/* Tablet Portrait */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 768px - 1023px */
}
```

---

## 🎨 Mobile Layout Variants

### Variant 1: Preview-First (Recommended)
```
┌──────────────────────┐
│ ← Back    Download   │  ← Sticky Header (60px)
├──────────────────────┤
│                      │
│ ┌──────────────────┐ │
│ │                  │ │
│ │  Live Preview    │ │  ← Sticky Preview Panel
│ │  Real A4 Shape   │ │     (300px height)
│ │  Scaled to fit   │ │
│ │                  │ │
│ └──────────────────┘ │
│ Page 1 of 2  [< >]   │
├──────────────────────┤
│                      │
│ Select Template:     │
│                      │
│ ┌──────────────────┐ │
│ │ Template 1       │ │
│ │ [Mini Preview]   │ │  ← Card (160px height)
│ │ Professional     │ │
│ │ [FREE] ✓ Selected│ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Template 2       │ │
│ │ [Mini Preview]   │ │
│ │ Modern Tech      │ │
│ │ [FREE]           │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Template 3       │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Template 4       │ │
│ └──────────────────┘ │
│                      │
└──────────────────────┘
```

### Variant 2: Cards-First (Alternative)
```
┌──────────────────────┐
│ ← Back    Download   │  ← Header
├──────────────────────┤
│ Choose Template:     │
│                      │
│ ┌────────┬─────────┐ │
│ │ Tmpl 1 │ Tmpl 2  │ │  ← 2-column grid
│ │ [Mini] │ [Mini]  │ │     (180px each)
│ │ FREE ✓ │ FREE    │ │
│ └────────┴─────────┘ │
│ ┌────────┬─────────┐ │
│ │ Tmpl 3 │ Tmpl 4  │ │
│ │ [Mini] │ [Mini]  │ │
│ │ FREE   │ FREE    │ │
│ └────────┴─────────┘ │
├──────────────────────┤
│ Preview:             │
│ ┌──────────────────┐ │
│ │                  │ │
│ │  Full Preview    │ │  ← Expanded preview
│ │  Professional    │ │     (on scroll or tap)
│ │                  │ │
│ └──────────────────┘ │
│ Page 1 of 2  [< >]   │
└──────────────────────┘
```

---

## 📏 Mobile Dimensions

### Screen Sizes
```javascript
const MOBILE_BREAKPOINTS = {
  xs: 320,  // Small phones
  sm: 375,  // iPhone SE, Galaxy S8
  md: 414,  // iPhone Pro
  lg: 428,  // iPhone Pro Max
  xl: 768   // Tablet
};
```

### Component Sizing
```javascript
// Header
const HEADER_HEIGHT = 60; // px

// Preview Panel (Mobile)
const PREVIEW_HEIGHT = 300; // px
const PREVIEW_WIDTH = window.innerWidth - 32; // 16px padding each side

// Template Cards (Mobile)
const CARD_HEIGHT = 160; // px
const CARD_WIDTH = window.innerWidth - 32;
const CARD_GAP = 16;

// Buttons
const MIN_TOUCH_TARGET = 44; // px (iOS/Android guideline)
```

### A4 Scaling for Mobile
```javascript
// Mobile preview scaling
const MOBILE_PREVIEW_WIDTH = window.innerWidth - 32;
const A4_WIDTH = 794;
const MOBILE_SCALE = MOBILE_PREVIEW_WIDTH / A4_WIDTH;
// Scale: ~0.43 for 375px screen

// Card preview scaling
const CARD_MINI_WIDTH = window.innerWidth - 64;
const CARD_MINI_SCALE = CARD_MINI_WIDTH / A4_WIDTH;
// Scale: ~0.39 for 375px screen
```

---

## 🎯 Touch Interactions

### Gestures
```javascript
// Swipe left/right: Change page
// Tap card: Select template
// Tap preview: Expand full screen
// Pinch: Zoom preview (optional)
// Pull down: Refresh (disabled)
```

### Touch Targets
```css
/* Minimum tap area */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Button spacing */
.button-group {
  gap: 12px;
}

/* Card padding for easier tapping */
.template-card {
  padding: 16px;
  margin: 8px 0;
}
```

---

## 🎨 Mobile Components

### 1. Mobile Header
```tsx
interface MobileHeaderProps {
  onBack: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

// Design
┌────────────────────────────┐
│ [←] Choose Template  [⬇]   │
└────────────────────────────┘

Styling:
- Height: 60px
- Position: sticky, top: 0
- Background: #fff with backdrop blur
- Border bottom: 1px solid #e5e7eb
- Z-index: 100
- Box shadow on scroll
```

### 2. Mobile Preview Panel
```tsx
interface MobilePreviewPanelProps {
  templateId: string;
  resumeData: Resume;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onExpand: () => void;
}

// Design
┌────────────────────────────┐
│ ┌────────────────────────┐ │
│ │                        │ │
│ │   Resume Preview       │ │
│ │   Tap to expand        │ │
│ │                        │ │
│ └────────────────────────┘ │
│ [←]  Page 1 of 2  [→]     │
└────────────────────────────┘

Styling:
- Height: 300px
- Position: sticky, top: 60px
- Margin: 16px
- Border radius: 12px
- Box shadow: 0 2px 8px rgba(0,0,0,0.1)
- Tap to expand to fullscreen
```

### 3. Mobile Template Card
```tsx
interface MobileTemplateCardProps {
  template: Template;
  isSelected: boolean;
  onClick: () => void;
}

// Design
┌────────────────────────────┐
│ ┌──────┐  Professional     │
│ │ Mini │  Clean layout     │
│ │ A4   │  [FREE] [ATS] ✓   │
│ └──────┘  2 pages          │
└────────────────────────────┘

Styling:
- Height: auto (min 120px)
- Padding: 16px
- Border: 2px solid #e5e7eb
- Border radius: 12px
- Selected: border #000, shadow
- Tap feedback: scale(0.98)
```

### 4. Fullscreen Preview Modal
```tsx
interface FullscreenPreviewProps {
  templateId: string;
  resumeData: Resume;
  currentPage: number;
  totalPages: number;
  onClose: () => void;
  onPageChange: (page: number) => void;
}

// Design (Overlay)
┌────────────────────────────┐
│ [× Close]         [⬇ Save] │
│                            │
│ ┌────────────────────────┐ │
│ │                        │ │
│ │   Full Screen          │ │
│ │   Resume Preview       │ │
│ │   Pinch to zoom        │ │
│ │                        │ │
│ └────────────────────────┘ │
│                            │
│ [←]  Page 1 of 2  [→]     │
└────────────────────────────┘

Styling:
- Position: fixed, fullscreen
- Background: rgba(0,0,0,0.95)
- Z-index: 1000
- Smooth slide-up animation
- Swipe down to dismiss
```

---

## 🎭 Mobile Animations

### Transitions
```css
/* Card selection */
.template-card {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.template-card.selected {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

/* Preview panel updates */
.preview-panel {
  transition: opacity 300ms ease-in-out;
}

/* Modal slide-up */
.fullscreen-modal {
  animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Performance
```javascript
// Use CSS transforms (GPU accelerated)
transform: translate3d(0, 0, 0); // Force GPU

// Debounce rapid taps
const debouncedSelect = useCallback(
  debounce((id: string) => selectTemplate(id), 200),
  []
);

// Lazy load off-screen cards
const { ref, inView } = useInView({
  triggerOnce: true,
  threshold: 0.1
});
```

---

## 📱 Platform-Specific Considerations

### iOS Safari
```css
/* Safe area insets */
.mobile-header {
  padding-top: env(safe-area-inset-top);
}

/* Disable bounce scroll on body */
body {
  overscroll-behavior: none;
}

/* Fix iOS zoom on input focus */
input, select, textarea {
  font-size: 16px; /* Prevents auto-zoom */
}

/* Smooth momentum scrolling */
.scrollable {
  -webkit-overflow-scrolling: touch;
}
```

### Android Chrome
```css
/* Hide address bar on scroll */
html {
  scroll-padding-top: 60px;
}

/* Fix viewport height */
.fullscreen-modal {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
```

```javascript
// Calculate actual viewport height
const setVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', setVH);
setVH();
```

---

## 🎨 Mobile Color & Typography

### Typography Scaling
```css
/* Mobile-optimized sizes */
.mobile-page-title {
  font-size: 20px; /* Desktop: 24px */
  line-height: 1.3;
}

.mobile-card-title {
  font-size: 14px; /* Desktop: 16px */
  line-height: 1.4;
}

.mobile-body {
  font-size: 13px; /* Desktop: 14px */
  line-height: 1.5;
}

.mobile-caption {
  font-size: 11px; /* Desktop: 12px */
  line-height: 1.4;
}
```

### Touch States
```css
/* Button touch feedback */
.touch-button:active {
  transform: scale(0.95);
  background: rgba(0,0,0,0.05);
}

/* Card touch feedback */
.template-card:active {
  transform: scale(0.98);
}

/* No hover states on touch devices */
@media (hover: none) {
  .hover-effect:hover {
    /* Disable hover effects */
    transform: none;
  }
}
```

---

## 🔄 Loading States (Mobile)

### Skeleton Screens
```tsx
// Loading template cards
<div className="skeleton-card">
  <div className="skeleton-preview animate-pulse" />
  <div className="skeleton-text animate-pulse" />
  <div className="skeleton-badge animate-pulse" />
</div>

// Styles
.skeleton-preview {
  width: 100%;
  height: 120px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## ⚡ Mobile Performance Optimization

### Image Optimization
```javascript
// Lazy load preview images
<img 
  src={thumbnailUrl}
  loading="lazy"
  decoding="async"
  alt="Template preview"
/>

// Use WebP with fallback
<picture>
  <source srcSet="preview.webp" type="image/webp" />
  <img src="preview.png" alt="Template preview" />
</picture>
```

### Code Splitting
```javascript
// Lazy load fullscreen modal
const FullscreenModal = lazy(() => 
  import('./FullscreenModal')
);

// Use Suspense for loading
<Suspense fallback={<LoadingSpinner />}>
  {showFullscreen && <FullscreenModal />}
</Suspense>
```

### Reduce Re-renders
```javascript
// Memoize expensive components
const MemoizedTemplateCard = memo(TemplateCard, (prev, next) => 
  prev.isSelected === next.isSelected &&
  prev.template.id === next.template.id
);

// Use callback refs
const cardRef = useCallback((node) => {
  if (node && isSelected) {
    node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}, [isSelected]);
```

---

## 📊 Mobile Analytics

### Track Mobile Events
```javascript
// Template selection on mobile
trackEvent('mobile_template_select', {
  template_id: templateId,
  device_type: 'mobile',
  viewport_width: window.innerWidth,
  interaction_type: 'tap'
});

// Preview expansion
trackEvent('mobile_preview_expand', {
  template_id: templateId,
  current_page: currentPage
});

// Download from mobile
trackEvent('mobile_download', {
  template_id: templateId,
  device_type: 'mobile',
  os: navigator.platform
});
```

---

## ✅ Mobile Testing Checklist

### Device Testing
- [ ] iPhone SE (375×667)
- [ ] iPhone 12 (390×844)
- [ ] iPhone 14 Pro Max (430×932)
- [ ] Samsung Galaxy S21 (360×800)
- [ ] Samsung Galaxy S23 (412×915)
- [ ] iPad Mini (768×1024)
- [ ] iPad Pro (1024×1366)

### Browser Testing
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Firefox Android
- [ ] Samsung Internet
- [ ] Edge Mobile

### Functionality Testing
- [ ] All cards render correctly
- [ ] Preview updates on selection
- [ ] Page navigation works
- [ ] Download generates PDF
- [ ] Fullscreen modal opens/closes
- [ ] Swipe gestures work
- [ ] Touch targets adequate (44×44px)

### Performance Testing
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Smooth 60fps scrolling
- [ ] No janky animations
- [ ] Images load progressively

### UX Testing
- [ ] Easy to understand
- [ ] One-thumb operation possible
- [ ] Clear selected state
- [ ] Preview readable
- [ ] Buttons easy to tap
- [ ] No accidental taps

---

## 🎯 Mobile-Specific Features

### Progressive Web App (PWA)
```json
// manifest.json
{
  "name": "HexaResume",
  "short_name": "Resume",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add to Home Screen
```javascript
// Prompt to install PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install button
  showInstallPromotion();
});
```

### Offline Support
```javascript
// Service worker for offline access
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

---

## 🚀 Mobile Launch Checklist

### Pre-Launch
- [ ] All mobile layouts tested
- [ ] Touch interactions smooth
- [ ] Performance optimized
- [ ] PWA configured
- [ ] App store assets ready
- [ ] Mobile analytics setup

### Testing
- [ ] Real device testing complete
- [ ] Multiple browsers tested
- [ ] Various screen sizes verified
- [ ] Slow 3G network tested
- [ ] Offline functionality tested

### Launch
- [ ] Mobile-specific tracking enabled
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] User feedback collection ready
- [ ] Mobile documentation complete

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Mobile Implementation
