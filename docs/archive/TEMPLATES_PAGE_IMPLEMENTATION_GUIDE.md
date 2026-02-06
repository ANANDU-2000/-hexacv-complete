# Templates Page - Implementation Guide
## Step-by-Step Development Instructions

---

## 🎯 Overview

This guide provides detailed implementation instructions for redesigning the Templates page with:
- **Left**: Real A4-shaped template cards with live data
- **Right**: Full-size live preview with page navigation
- **4 Templates**: Clean, professional, responsive design
- **Mobile**: Optimized layout for all devices

---

## 📋 Prerequisites

Before starting implementation:
- [x] Read TEMPLATES_PAGE_UIUX_REDESIGN_PLAN.md
- [x] Read TEMPLATES_PAGE_MOBILE_UIUX.md
- [x] Understand current AppNew.tsx structure
- [x] Familiar with TemplateRenderer component
- [x] Know A4 dimensions (794×1123px)

---

## 🗂️ File Structure

### New Files to Create
```
src/
├── components/
│   └── templates-page/
│       ├── TemplatesPageLayout.tsx       (Main container)
│       ├── TemplateCard.tsx              (Left sidebar cards)
│       ├── LivePreviewPanel.tsx          (Right preview)
│       ├── PageNavigation.tsx            (Page controls)
│       ├── FullscreenPreview.tsx         (Mobile fullscreen)
│       ├── templates-page.css            (Styles)
│       └── index.ts                      (Exports)
```

### Files to Modify
```
src/
├── AppNew.tsx                             (Update step='template')
├── templates.ts                           (Add 3 new templates)
└── index.css                              (Add responsive utilities)
```

---

## 📝 Step 1: Create Component Structure

### 1.1 Create Directory
```bash
mkdir -p src/components/templates-page
```

### 1.2 Create index.ts
```typescript
// src/components/templates-page/index.ts
export { TemplatesPageLayout } from './TemplatesPageLayout';
export { TemplateCard } from './TemplateCard';
export { LivePreviewPanel } from './LivePreviewPanel';
export { PageNavigation } from './PageNavigation';
export { FullscreenPreview } from './FullscreenPreview';
```

---

## 🎨 Step 2: Implement Templates Page Layout

### 2.1 Create TemplatesPageLayout.tsx

```typescript
// src/components/templates-page/TemplatesPageLayout.tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Download } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { LivePreviewPanel } from './LivePreviewPanel';
import { FullscreenPreview } from './FullscreenPreview';
import './templates-page.css';

interface Resume {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  profile: string;
  skills: { category: string; items: string[] }[];
  experience: any[];
  education: any[];
  projects: any[];
  certifications: any[];
  achievements: string[];
  photo: string | null;
}

interface Template {
  id: string;
  name: string;
  description: string;
  price: number;
  atsSafe: boolean;
}

interface TemplatesPageLayoutProps {
  templates: Template[];
  selectedTemplateId: string;
  resumeData: Resume;
  estimatedPages: number;
  onTemplateSelect: (id: string) => void;
  onDownload: () => void;
  onBack: () => void;
  isDownloading: boolean;
  isPaid: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const TemplatesPageLayout: React.FC<TemplatesPageLayoutProps> = ({
  templates,
  selectedTemplateId,
  resumeData,
  estimatedPages,
  onTemplateSelect,
  onDownload,
  onBack,
  isDownloading,
  isPaid,
  currentPage,
  onPageChange
}) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="templates-page">
      {/* Header */}
      <header className="templates-page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Choose Your Template</h1>
            <p className="page-subtitle">
              Preview your resume in different designs • Estimated {estimatedPages} page{estimatedPages > 1 ? 's' : ''}
            </p>
          </div>
          <div className="header-actions">
            <button 
              onClick={onBack}
              className="btn-secondary"
            >
              <ChevronLeft size={18} />
              <span className="btn-text">Back to Edit</span>
            </button>
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="btn-primary"
            >
              {isDownloading ? (
                <span>Processing...</span>
              ) : isPaid ? (
                <span>Unlock ₹{selectedTemplate?.price}</span>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="templates-page-main">
        <div className="templates-page-container">
          
          {/* Left Sidebar - Template Cards */}
          <aside className="templates-sidebar">
            <div className="templates-sidebar-header">
              <h2>Templates</h2>
              <p>{templates.length} designs</p>
            </div>
            <div className="template-cards-list">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  resumeData={resumeData}
                  isSelected={selectedTemplateId === template.id}
                  estimatedPages={estimatedPages}
                  onClick={() => onTemplateSelect(template.id)}
                />
              ))}
            </div>
          </aside>

          {/* Right Panel - Live Preview */}
          <section className="templates-preview-panel">
            {selectedTemplate && (
              <div className="preview-header">
                <div className="preview-info">
                  <h3>{selectedTemplate.name}</h3>
                  <p>{selectedTemplate.description}</p>
                </div>
                <div className="preview-badges">
                  {selectedTemplate.atsSafe && (
                    <span className="badge badge-ats">ATS-Safe</span>
                  )}
                  <span className={`badge ${selectedTemplate.price === 0 ? 'badge-free' : 'badge-paid'}`}>
                    {selectedTemplate.price === 0 ? 'FREE' : `₹${selectedTemplate.price}`}
                  </span>
                </div>
              </div>
            )}

            <LivePreviewPanel
              templateId={selectedTemplateId}
              resumeData={resumeData}
              currentPage={currentPage}
              totalPages={estimatedPages}
              onPageChange={onPageChange}
              onExpand={isMobile ? () => setShowFullscreen(true) : undefined}
            />
          </section>

        </div>
      </main>

      {/* Fullscreen Preview (Mobile) */}
      {showFullscreen && isMobile && (
        <FullscreenPreview
          templateId={selectedTemplateId}
          resumeData={resumeData}
          currentPage={currentPage}
          totalPages={estimatedPages}
          onClose={() => setShowFullscreen(false)}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
```

---

## 🎴 Step 3: Implement Template Card Component

### 3.1 Create TemplateCard.tsx

```typescript
// src/components/templates-page/TemplateCard.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { TemplateRenderer } from '../../template-renderer';

interface Template {
  id: string;
  name: string;
  description: string;
  price: number;
  atsSafe: boolean;
}

interface TemplateCardProps {
  template: Template;
  resumeData: any;
  isSelected: boolean;
  estimatedPages: number;
  onClick: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  resumeData,
  isSelected,
  estimatedPages,
  onClick
}) => {
  return (
    <div
      className={`template-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Select ${template.name} template`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Preview Container */}
      <div className="template-card-preview">
        {/* A4 Preview at scale */}
        <div className="template-card-preview-inner">
          <TemplateRenderer
            templateId={template.id}
            resumeData={resumeData}
          />
        </div>
        
        {/* Page Count Overlay */}
        <div className="template-card-page-count">
          {estimatedPages} {estimatedPages > 1 ? 'Pages' : 'Page'}
        </div>
      </div>

      {/* Card Footer */}
      <div className="template-card-footer">
        <div className="template-card-info">
          <h3 className="template-card-title">{template.name}</h3>
          <p className="template-card-description">{template.description}</p>
        </div>

        <div className="template-card-meta">
          <div className="template-card-badges">
            {template.atsSafe && (
              <span className="badge badge-small badge-ats">ATS</span>
            )}
            <span className={`badge badge-small ${template.price === 0 ? 'badge-free' : 'badge-paid'}`}>
              {template.price === 0 ? 'FREE' : `₹${template.price}`}
            </span>
          </div>

          {isSelected && (
            <div className="template-card-selected">
              <Check size={16} />
              <span>Selected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🖼️ Step 4: Implement Live Preview Panel

### 4.1 Create LivePreviewPanel.tsx

```typescript
// src/components/templates-page/LivePreviewPanel.tsx
import React from 'react';
import { TemplateRenderer } from '../../template-renderer';
import { PageNavigation } from './PageNavigation';

interface LivePreviewPanelProps {
  templateId: string;
  resumeData: any;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onExpand?: () => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  templateId,
  resumeData,
  currentPage,
  totalPages,
  onPageChange,
  onExpand
}) => {
  return (
    <div className="live-preview-panel">
      {/* Preview Document */}
      <div 
        className="live-preview-document"
        onClick={onExpand}
        role={onExpand ? 'button' : undefined}
        tabIndex={onExpand ? 0 : undefined}
        aria-label={onExpand ? 'Tap to expand preview' : undefined}
      >
        <div className="live-preview-document-inner">
          <TemplateRenderer
            templateId={templateId}
            resumeData={resumeData}
          />
        </div>
        
        {onExpand && (
          <div className="live-preview-tap-hint">
            Tap to expand
          </div>
        )}
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <PageNavigation
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => onPageChange(currentPage - 1)}
          onNext={() => onPageChange(currentPage + 1)}
        />
      )}
    </div>
  );
};
```

---

## 🔢 Step 5: Implement Page Navigation

### 5.1 Create PageNavigation.tsx

```typescript
// src/components/templates-page/PageNavigation.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="page-navigation">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="page-nav-button"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
        <span>Previous</span>
      </button>

      <div className="page-indicator">
        Page {currentPage} of {totalPages}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="page-nav-button"
        aria-label="Next page"
      >
        <span>Next</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
```

---

## 📱 Step 6: Implement Fullscreen Preview (Mobile)

### 6.1 Create FullscreenPreview.tsx

```typescript
// src/components/templates-page/FullscreenPreview.tsx
import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { TemplateRenderer } from '../../template-renderer';
import { PageNavigation } from './PageNavigation';

interface FullscreenPreviewProps {
  templateId: string;
  resumeData: any;
  currentPage: number;
  totalPages: number;
  onClose: () => void;
  onPageChange: (page: number) => void;
}

export const FullscreenPreview: React.FC<FullscreenPreviewProps> = ({
  templateId,
  resumeData,
  currentPage,
  totalPages,
  onClose,
  onPageChange
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle swipe gestures (basic implementation)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    (e.currentTarget as any).touchStartX = touch.clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const startX = (e.currentTarget as any).touchStartX;
    const diffX = startX - touch.clientX;

    // Swipe threshold: 50px
    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentPage < totalPages) {
        onPageChange(currentPage + 1);
      } else if (diffX < 0 && currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    }
  };

  return (
    <div className="fullscreen-preview">
      {/* Header */}
      <header className="fullscreen-preview-header">
        <button onClick={onClose} className="btn-icon" aria-label="Close">
          <X size={24} />
        </button>
        <h2>Preview</h2>
        <div className="header-spacer" />
      </header>

      {/* Content */}
      <div 
        className="fullscreen-preview-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="fullscreen-preview-document">
          <TemplateRenderer
            templateId={templateId}
            resumeData={resumeData}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="fullscreen-preview-footer">
        {totalPages > 1 && (
          <PageNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => onPageChange(currentPage - 1)}
            onNext={() => onPageChange(currentPage + 1)}
          />
        )}
      </footer>
    </div>
  );
};
```

---

## 🎨 Step 7: Add Styles

### 7.1 Create templates-page.css

```css
/* src/components/templates-page/templates-page.css */

/* ============================================
   TEMPLATES PAGE LAYOUT
   ============================================ */

.templates-page {
  background: #fafafa;
  min-height: 100vh;
}

/* Header */
.templates-page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1.5px solid #e5e7eb;
  padding: 16px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #000;
}

.page-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Main Content */
.templates-page-main {
  max-width: 1400px;
  margin: 32px auto;
  padding: 0 32px;
}

.templates-page-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 32px;
}

/* ============================================
   TEMPLATE CARDS SIDEBAR
   ============================================ */

.templates-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.templates-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.templates-sidebar-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.templates-sidebar-header p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.template-cards-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 4px;
}

/* Scrollbar */
.template-cards-list::-webkit-scrollbar {
  width: 6px;
}

.template-cards-list::-webkit-scrollbar-track {
  background: transparent;
}

.template-cards-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.template-cards-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* ============================================
   TEMPLATE CARD
   ============================================ */

.template-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.template-card.selected {
  border-color: #000;
  border-width: 3px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.template-card:focus {
  outline: 2px solid #000;
  outline-offset: 2px;
}

/* Card Preview */
.template-card-preview {
  width: 100%;
  height: 424px; /* A4 ratio: 300 * 1.414 */
  overflow: hidden;
  position: relative;
  background: #fff;
}

.template-card-preview-inner {
  width: 794px; /* A4 width */
  height: 1123px; /* A4 height */
  transform: scale(0.378); /* 300/794 */
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
}

/* Page Count Overlay */
.template-card-page-count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

/* Card Footer */
.template-card-footer {
  padding: 16px 20px;
  background: #fff;
  border-top: 1.5px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-card.selected .template-card-footer {
  background: #f9fafb;
}

.template-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.template-card-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}

.template-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-card-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.template-card-selected {
  padding: 6px 12px;
  background: #000;
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ============================================
   LIVE PREVIEW PANEL
   ============================================ */

.templates-preview-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-header {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #000;
}

.preview-info p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.preview-badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Live Preview Document */
.live-preview-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.live-preview-document {
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.live-preview-document-inner {
  width: 794px; /* A4 width */
  height: 1123px; /* A4 height */
  transform: scale(0.7);
  transform-origin: top center;
  margin: 0 auto;
}

.live-preview-tap-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

/* ============================================
   PAGE NAVIGATION
   ============================================ */

.page-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
}

.page-nav-button {
  padding: 8px 16px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 200ms;
  color: #000;
}

.page-nav-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #000;
}

.page-nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* ============================================
   FULLSCREEN PREVIEW (MOBILE)
   ============================================ */

.fullscreen-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  flex-direction: column;
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

.fullscreen-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.fullscreen-preview-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.header-spacer {
  width: 44px;
}

.fullscreen-preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-preview-document {
  width: 100%;
  max-width: 794px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.fullscreen-preview-footer {
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

/* ============================================
   BADGES & BUTTONS
   ============================================ */

.badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.badge-small {
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
}

.badge-ats {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.badge-free {
  background: #d1fae5;
  color: #065f46;
}

.badge-paid {
  background: #fef3c7;
  color: #92400e;
}

.btn-primary {
  padding: 12px 32px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 200ms;
}

.btn-primary:hover:not(:disabled) {
  background: #1a1a1a;
}

.btn-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: #fff;
  border: 1.5px solid #000;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 200ms;
  color: #000;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 200ms;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-text {
  display: inline;
}

/* ============================================
   RESPONSIVE - TABLET
   ============================================ */

@media (max-width: 1023px) {
  .templates-page-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .templates-sidebar {
    order: 2;
  }

  .templates-preview-panel {
    order: 1;
    position: sticky;
    top: 120px;
    z-index: 50;
  }

  .template-cards-list {
    max-height: none;
    grid-template-columns: repeat(2, 1fr);
    display: grid;
  }
}

/* ============================================
   RESPONSIVE - MOBILE
   ============================================ */

@media (max-width: 767px) {
  .templates-page-header {
    padding: 12px 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .header-actions {
    flex-direction: row;
    justify-content: space-between;
  }

  .btn-text {
    display: none;
  }

  .templates-page-main {
    margin: 16px auto;
    padding: 0 16px;
  }

  .templates-preview-panel {
    top: 140px;
  }

  .live-preview-document-inner {
    transform: scale(0.4);
  }

  .preview-header {
    padding: 12px 16px;
  }

  .template-cards-list {
    grid-template-columns: 1fr;
  }

  .template-card-preview {
    height: 300px;
  }

  .template-card-preview-inner {
    transform: scale(0.31);
  }

  .page-navigation {
    padding: 8px 12px;
    gap: 12px;
  }

  .page-nav-button {
    padding: 8px 12px;
    font-size: 13px;
  }

  .page-nav-button span {
    display: none;
  }

  .page-indicator {
    font-size: 13px;
  }
}
```

---

## 🔄 Step 8: Update AppNew.tsx

### 8.1 Import New Components

```typescript
// Add at top of AppNew.tsx
import { TemplatesPageLayout } from './components/templates-page';
```

### 8.2 Replace Template Step

Find the section `if (step === 'template')` and replace with:

```typescript
// ============== STEP 3: TEMPLATE SELECTION (NEW DESIGN) ==============
if (step === 'template') {
    const selectedTemplate = templates.find((t: Template) => t.id === selectedTemplateId) || templates[0];
    const isPaid = selectedTemplate && selectedTemplate.price > 0;

    const estimatedPages = renderedPageCount || 1;

    return (
        <TemplatesPageLayout
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            resumeData={memoizedResumeData}
            estimatedPages={estimatedPages}
            onTemplateSelect={(id) => {
                setSelectedTemplateId(id);
                logStat('template', id);
                trackEvent('template_click', id, targetRole, { price: templates.find(t => t.id === id)?.price || 0 });
            }}
            onDownload={async () => {
                if (isPaid) {
                    if (unlockedTemplates.has(selectedTemplateId)) {
                        logStat('download');
                        generatePDF();
                        return;
                    }
                    try {
                        setPaymentProcessing(true);
                        const result = await initiatePayment(
                            selectedTemplateId,
                            selectedTemplate.name,
                            resume.email,
                            resume.phone
                        );
                        if (result.success) {
                            setUnlockedTemplates((prev: Set<string>) => new Set([...prev, selectedTemplateId]));
                            logStat('paid');
                            trackEvent('payment_completed', selectedTemplateId, targetRole, {
                                price: selectedTemplate.price,
                                templateName: selectedTemplate.name
                            });
                            setShowPaymentSuccessModal(true);
                        }
                    } catch (error) {
                        console.error('Payment error:', error);
                        setShowPaymentSuccessModal(false);
                        alert(`❌ Payment failed. Please try again or contact support.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    } finally {
                        setPaymentProcessing(false);
                    }
                } else {
                    logStat('download');
                    trackEvent('download', selectedTemplateId, targetRole);
                    generatePDF();
                    setTimeout(() => setShowFeedbackModal(true), 1000);
                }
            }}
            onBack={() => setStep('review')}
            isDownloading={paymentProcessing}
            isPaid={isPaid && !unlockedTemplates.has(selectedTemplateId)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
        />
    );
}
```

---

## ✅ Step 9: Testing Checklist

### Functionality Testing
- [ ] All templates load correctly
- [ ] Template selection updates preview instantly
- [ ] Page navigation works (if multi-page)
- [ ] Mobile fullscreen opens and closes
- [ ] Download button triggers PDF generation
- [ ] Back button returns to review page

### Visual Testing
- [ ] A4 proportions correct on cards
- [ ] A4 proportions correct on live preview
- [ ] Selected state clearly visible
- [ ] Hover states smooth
- [ ] Badges display correctly
- [ ] Typography readable at all sizes

### Responsive Testing
- [ ] Desktop (≥1024px) layout perfect
- [ ] Tablet (768-1023px) layout optimal
- [ ] Mobile (≤767px) layout excellent
- [ ] Touch targets minimum 44×44px
- [ ] No horizontal scroll on any device

### Performance Testing
- [ ] Page loads in < 2 seconds
- [ ] Template switches in < 300ms
- [ ] Smooth 60fps animations
- [ ] No janky scrolling
- [ ] Memory usage reasonable

---

## 🚀 Step 10: Launch

1. **Test thoroughly** on all devices
2. **Run build** to check for errors
3. **Deploy to staging** for QA
4. **Collect feedback** from users
5. **Monitor analytics** for usage patterns
6. **Iterate** based on data

---

## 📚 Additional Resources

- **TEMPLATES_PAGE_UIUX_REDESIGN_PLAN.md**: Full design specification
- **TEMPLATES_PAGE_MOBILE_UIUX.md**: Mobile-specific guidelines
- **template-renderer.tsx**: Existing renderer component
- **templates.ts**: Template configuration

---

**Implementation Guide Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Development
