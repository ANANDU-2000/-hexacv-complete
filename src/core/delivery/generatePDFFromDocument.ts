/**
 * PDF = snapshot of the document preview DOM.
 * No template engine; no iframe; same renderer as preview.
 */

const PAGE_STYLES = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  .page {
    width: 210mm;
    height: 297mm;
    padding: 20mm;
    background: white;
    overflow: hidden;
    font-family: 'Inter', 'Calibri', 'Arial', system-ui, sans-serif;
    font-size: 10pt;
    line-height: 1.35;
    color: #222;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }
  .doc-section-title {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    border-bottom: 1px solid #222;
    margin: 8px 0 6px;
    padding-bottom: 2px;
  }
  .doc-section { margin-bottom: 6px; }
  .doc-header-name { font-size: 17pt; font-weight: bold; margin-bottom: 2px; }
  .doc-header-title { font-size: 11pt; font-weight: 600; margin-bottom: 6px; color: #333; }
  .doc-header-contact { font-size: 9.5pt; color: #444; line-height: 1.4; }
  .doc-header-contact a { color: #2563eb; text-decoration: none; }
  .doc-entry-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 2px; }
  .doc-entry-left { flex: 1; min-width: 0; }
  .doc-entry-role { font-weight: bold; font-size: 10.5pt; }
  .doc-entry-company { font-size: 10pt; color: #444; }
  .doc-entry-date { font-size: 9.5pt; color: #444; flex-shrink: 0; white-space: nowrap; }
  .doc-entry-bullets { margin: 2px 0 0; padding-left: 14px; font-size: 10pt; line-height: 1.35; }
  .doc-entry-bullets li { margin-bottom: 2px; }
  .doc-skills-category { margin-bottom: 4px; }
  .doc-skills-label { font-weight: 600; font-size: 10pt; }
  .doc-skills-items { font-size: 10pt; color: #333; }
  .doc-edu-degree { font-weight: bold; font-size: 10.5pt; }
  .doc-edu-institute { font-size: 10pt; color: #444; }
  .doc-edu-year { font-size: 9.5pt; color: #444; }
`;

/**
 * Opens a print window with the exact DOM of the document preview (page stack).
 * User gets PDF = exactly what they see. No watermark for free tier (handled in render).
 */
export function printDocumentPreview(container: HTMLElement): void {
  const clone = container.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.transformOrigin = '';
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PAGE_STYLES}</style></head><body>${clone.outerHTML}</body></html>`;
  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow pop-ups to download PDF.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  w.onload = () => {
    w.print();
    w.onafterprint = () => w.close();
  };
  setTimeout(() => w.close(), 15000);
}
