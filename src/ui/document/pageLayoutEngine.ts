import type { DocumentBlock } from './blocks/types';

/** A4 content area: 297mm - 40mm padding = 257mm; at 96dpi ~971px */
export const PAGE_CONTENT_HEIGHT_PX = 971;
/** 210mm - 40mm = 170mm; at 96dpi ~643px (for measure container width) */
export const PAGE_CONTENT_WIDTH_PX = 643;

/**
 * Assign blocks to pages. Section title + first content block are kept together (atomic).
 */
export function assignBlocksToPages(
  blocks: DocumentBlock[],
  heights: number[]
): DocumentBlock[][] {
  if (blocks.length === 0) return [];
  if (heights.length !== blocks.length) return [blocks]; // fallback: one page

  const pages: DocumentBlock[][] = [];
  let currentPage: DocumentBlock[] = [];
  let remaining = PAGE_CONTENT_HEIGHT_PX;
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const h = heights[i] ?? 0;
    const isSectionTitle = block.type === 'sectionTitle';
    const nextHeight = i + 1 < blocks.length ? (heights[i + 1] ?? 0) : 0;
    const titlePlusFirst = h + nextHeight;

    if (isSectionTitle && i + 1 < blocks.length) {
      // Section title + first content block = atomic
      if (remaining < titlePlusFirst) {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
        }
        remaining = PAGE_CONTENT_HEIGHT_PX;
      }
      currentPage.push(block, blocks[i + 1]);
      remaining -= titlePlusFirst;
      i += 2;
      continue;
    }

    if (remaining < h) {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
      }
      remaining = PAGE_CONTENT_HEIGHT_PX;
    }

    currentPage.push(block);
    remaining -= h;
    i += 1;
  }

  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
}
