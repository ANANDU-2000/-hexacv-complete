
/**
 * PDF Text Extraction Utility
 * Uses shared PDF.js instance from window (loaded via CDN/script tag)
 */

export async function extractTextFromPDF(file: File): Promise<string> {
    try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
            throw new Error('PDF.js library not loaded');
        }

        // Set worker (if needed, though often handled by the main lib script)
        // pdfjsLib.GlobalWorkerOptions.workerSrc = ... 

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Extract strings and join with spaces
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += pageText + '\n\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF. Please try copying text manually.');
    }
}
