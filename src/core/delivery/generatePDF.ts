/**
 * LEGACY: iframe + template-based PDF generation using HTML templates.
 *
 * This path is DEPRECATED in favor of the React A4 document engine:
 * - Preview: src/ui/document/DocumentPreview.tsx
 * - PDF: src/core/delivery/generatePDFFromDocument.ts (printDocumentPreview)
 *
 * UI code MUST NOT call this function for user-facing downloads anymore.
 * It is kept only for backwards compatibility and can be removed
 * once all legacy consumers (if any) are migrated.
 */
export {};
