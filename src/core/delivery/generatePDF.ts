import { ResumeData } from '../types';
import { populateTemplate } from './templateEngine';

/**
 * Generates PDF via browser print. Uses A4 size (210mm × 297mm).
 * Templates must define @page { size: A4; margin: ... } and use page-break rules
 * (e.g. page-break-after: avoid on section titles, page-break-inside: avoid on entries)
 * for predictable multi-page A4 output.
 */
export async function generatePDF(templateName: string, data: ResumeData): Promise<void> {
    const html = await populateTemplate(templateName, data);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.left = '-9999px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        // Wait for load
        await new Promise<void>(resolve => {
            iframe.onload = () => resolve();
            setTimeout(resolve, 1000);
        });

        iframe.contentWindow?.print();

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 3000);
    }
}
