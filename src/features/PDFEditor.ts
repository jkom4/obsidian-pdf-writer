import {PDFDocument, rgb} from "pdf-lib";

/**
 * Handles PDF editing logic.
 */
export default class PDFEditor {
	async saveTextToPDF(pdfBytes: Uint8Array, text: string, x: number, y: number) {
		const pdfDoc = await PDFDocument.load(pdfBytes);
		const pages = pdfDoc.getPages();
		const firstPage = pages[0];

		firstPage.drawText(text, {
			x: x,
			y: y,
			size: 14,
			color: rgb(0, 0, 0),
		});

		const modifiedPdfBytes = await pdfDoc.save();
		return modifiedPdfBytes;
	}
}

