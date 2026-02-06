/**
 * A4 Page System
 * Enforces strict 794×1123px page dimensions with overflow detection
 * Part of Phase 1 implementation from master-resume-system.md
 */

import { TemplateConfig } from './template-config';

/**
 * A4 Page Dimensions (96 DPI standard)
 */
export const A4_DIMENSIONS = {
  WIDTH: 794, // 210mm
  HEIGHT: 1123, // 297mm
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
} as const;

/**
 * Page interface representing a single A4 page
 */
export interface Page {
  pageNumber: number;
  content: PageSection[];
  remainingHeight: number;
  isFull: boolean;
}

/**
 * Section that can be placed on a page
 */
export interface PageSection {
  type: 'header' | 'profile' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications';
  content: any;
  estimatedHeight: number;
  canSplit: boolean;
}

/**
 * Content measurement result
 */
export interface ContentMeasurement {
  height: number;
  width: number;
  overflow: boolean;
}

/**
 * Page break validation result
 */
export interface PageBreakValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Create a new empty page
 */
export function createPage(pageNumber: number, config: TemplateConfig): Page {
  const contentHeight = config.page.height - config.page.padding.top - config.page.padding.bottom;
  
  return {
    pageNumber,
    content: [],
    remainingHeight: contentHeight,
    isFull: false,
  };
}

/**
 * Check if content fits on current page
 */
export function canFitOnPage(page: Page, sectionHeight: number): boolean {
  return page.remainingHeight >= sectionHeight && !page.isFull;
}

/**
 * Add section to page
 */
export function addSectionToPage(page: Page, section: PageSection): boolean {
  if (!canFitOnPage(page, section.estimatedHeight)) {
    return false;
  }

  page.content.push(section);
  page.remainingHeight -= section.estimatedHeight;
  
  if (page.remainingHeight < 50) { // Minimum space threshold
    page.isFull = true;
  }

  return true;
}

/**
 * Measure DOM element height
 */
export function measureElementHeight(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return rect.height;
}

/**
 * Estimate section height based on content
 */
export function estimateSectionHeight(section: PageSection, config: TemplateConfig): number {
  const { margins, padding } = config.page;
  const { sizes, lineHeights } = config.typography;

  let height = margins.section; // Section margin

  switch (section.type) {
    case 'header':
      // Name + contact info
      height += sizes.name * lineHeights.tight;
      height += (sizes.caption * lineHeights.normal) * 3; // ~3 lines of contact
      break;

    case 'profile':
      // Section title + profile text
      height += sizes.sectionTitle * lineHeights.tight;
      const profileLines = Math.ceil(section.content.length / 100); // ~100 chars per line
      height += (sizes.body * lineHeights.relaxed) * profileLines;
      break;

    case 'experience':
      // Section title + entries
      height += sizes.sectionTitle * lineHeights.tight;
      section.content.forEach((exp: any) => {
        height += margins.entry;
        height += sizes.jobTitle * lineHeights.tight; // Job title
        height += sizes.caption * lineHeights.normal; // Company + date
        height += (sizes.body * lineHeights.normal) * Math.min(exp.bullets.length, config.rules.maxBulletsPerRole);
      });
      break;

    case 'education':
      height += sizes.sectionTitle * lineHeights.tight;
      section.content.forEach(() => {
        height += margins.entry;
        height += sizes.jobTitle * lineHeights.tight; // Degree
        height += sizes.caption * lineHeights.normal; // Institution + year
      });
      break;

    case 'skills':
      height += sizes.sectionTitle * lineHeights.tight;
      const skillLines = Math.ceil(section.content.length / 10); // ~10 skills per line
      height += (sizes.body * lineHeights.normal) * skillLines;
      break;

    case 'projects':
      height += sizes.sectionTitle * lineHeights.tight;
      section.content.forEach((proj: any) => {
        height += margins.entry;
        height += sizes.jobTitle * lineHeights.tight; // Project name
        height += (sizes.body * lineHeights.normal) * 2; // ~2 lines description
      });
      break;

    case 'certifications':
      height += sizes.sectionTitle * lineHeights.tight;
      section.content.forEach(() => {
        height += margins.entry;
        height += sizes.body * lineHeights.normal;
      });
      break;
  }

  return Math.ceil(height);
}

/**
 * Split content into pages
 */
export function splitContentIntoPages(
  sections: PageSection[],
  config: TemplateConfig
): Page[] {
  const pages: Page[] = [];
  let currentPage = createPage(1, config);
  pages.push(currentPage);

  for (const section of sections) {
    const estimatedHeight = estimateSectionHeight(section, config);
    section.estimatedHeight = estimatedHeight;

    // Try to add to current page
    if (addSectionToPage(currentPage, section)) {
      continue;
    }

    // Section doesn't fit, try to split if allowed
    if (section.canSplit && section.type === 'experience') {
      const split = splitExperienceSection(section, currentPage.remainingHeight, config);
      
      if (split.firstPart) {
        addSectionToPage(currentPage, split.firstPart);
      }
      
      if (split.secondPart) {
        currentPage = createPage(pages.length + 1, config);
        pages.push(currentPage);
        addSectionToPage(currentPage, split.secondPart);
      }
    } else {
      // Create new page for atomic section
      currentPage = createPage(pages.length + 1, config);
      pages.push(currentPage);
      addSectionToPage(currentPage, section);
    }
  }

  return pages;
}

/**
 * Split experience section across pages
 */
function splitExperienceSection(
  section: PageSection,
  availableHeight: number,
  config: TemplateConfig
): { firstPart: PageSection | null; secondPart: PageSection | null } {
  const experiences = section.content as any[];
  const firstPart: any[] = [];
  const secondPart: any[] = [];
  
  let accumulatedHeight = config.page.margins.section;
  
  for (const exp of experiences) {
    const expHeight = estimateExperienceEntryHeight(exp, config);
    
    if (accumulatedHeight + expHeight <= availableHeight) {
      firstPart.push(exp);
      accumulatedHeight += expHeight;
    } else {
      secondPart.push(exp);
    }
  }

  return {
    firstPart: firstPart.length > 0 ? { ...section, content: firstPart } : null,
    secondPart: secondPart.length > 0 ? { ...section, content: secondPart } : null,
  };
}

/**
 * Estimate height of single experience entry
 */
function estimateExperienceEntryHeight(exp: any, config: TemplateConfig): number {
  const { margins } = config.page;
  const { sizes, lineHeights } = config.typography;
  
  let height = margins.entry;
  height += sizes.jobTitle * lineHeights.tight; // Role
  height += sizes.caption * lineHeights.normal; // Company + date
  height += (sizes.body * lineHeights.normal) * Math.min(exp.bullets?.length || 0, config.rules.maxBulletsPerRole);
  
  return height;
}

/**
 * Validate page breaks
 */
export function validatePageBreaks(pages: Page[], config: TemplateConfig): PageBreakValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  pages.forEach((page, index) => {
    // Check for orphaned section titles
    const lastSection = page.content[page.content.length - 1];
    if (lastSection && page.remainingHeight < 30) {
      warnings.push(`Page ${page.pageNumber}: Section title may be orphaned at bottom`);
    }

    // Check for overflow
    const totalHeight = config.page.height - page.remainingHeight;
    if (totalHeight > config.page.height) {
      errors.push(`Page ${page.pageNumber}: Content exceeds page height by ${totalHeight - config.page.height}px`);
    }

    // Check for blank pages
    if (page.content.length === 0 && index < pages.length - 1) {
      errors.push(`Page ${page.pageNumber}: Blank page detected`);
    }

    // Check minimum content
    if (page.content.length === 1 && page.content[0].type === 'header' && index === 0) {
      warnings.push(`Page 1: Only header present, add more content`);
    }
  });

  // Check total page count
  if (pages.length > 3) {
    warnings.push(`Resume spans ${pages.length} pages. Consider condensing to 2 pages max.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detect content overflow
 */
export function detectOverflow(element: HTMLElement, config: TemplateConfig): ContentMeasurement {
  const rect = element.getBoundingClientRect();
  const contentWidth = config.page.width - config.page.padding.left - config.page.padding.right;
  const contentHeight = config.page.height - config.page.padding.top - config.page.padding.bottom;

  return {
    height: rect.height,
    width: rect.width,
    overflow: rect.height > contentHeight || rect.width > contentWidth,
  };
}

/**
 * Calculate page count from content height
 */
export function calculatePageCount(totalHeight: number, config: TemplateConfig): number {
  const contentHeight = config.page.height - config.page.padding.top - config.page.padding.bottom;
  return Math.ceil(totalHeight / contentHeight) || 1;
}

/**
 * Get page CSS styles
 */
export function getPageStyles(config: TemplateConfig): string {
  return `
    .resume-page {
      width: ${config.page.width}px;
      height: ${config.page.height}px;
      padding: ${config.page.padding.top}px ${config.page.padding.right}px ${config.page.padding.bottom}px ${config.page.padding.left}px;
      background: white;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
      page-break-after: always;
    }

    .resume-page:last-child {
      page-break-after: auto;
    }

    @media print {
      .resume-page {
        width: ${A4_DIMENSIONS.WIDTH_MM}mm;
        height: ${A4_DIMENSIONS.HEIGHT_MM}mm;
        margin: 0;
        box-shadow: none;
      }

      @page {
        size: A4;
        margin: 0;
      }
    }
  `;
}

/**
 * Check if section should be kept together (no page break within)
 */
export function shouldKeepTogether(sectionType: PageSection['type']): boolean {
  return ['profile', 'education'].includes(sectionType);
}
