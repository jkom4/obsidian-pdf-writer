import { PDFDocument, rgb } from "pdf-lib";
import { Notice } from "obsidian";

export class PdfExporter {
	private currentPdfBytes: ArrayBuffer;

	constructor(currentPdfBytes: ArrayBuffer) {
		this.currentPdfBytes = currentPdfBytes;
	}

	async exportPdfWithTextZones(): Promise<void> {
		try {
			// Load the active PDF document
			const pdfDoc = await PDFDocument.load(this.currentPdfBytes);
			const pages = pdfDoc.getPages();

			// Get all text overlays
			const textZones = document.querySelectorAll(".pdf-writer-text-overlay");
			textZones.forEach((textZone) => {
				// Remove delete button if it exists
				const deleteButton = textZone.querySelector(".pdf-writer-delete-button");
				if (deleteButton) {
					textZone.removeChild(deleteButton);
				}

				const text = textZone.textContent?.trim() || "";
				if (!text) return;

				// Extract styling properties
				const styles = window.getComputedStyle(textZone);
				const fontSize = parseFloat(styles.fontSize) || 12;
				const color = styles.color.match(/\d+/g);
				const [r, g, b] = color ? color.map(Number) : [0, 0, 0]; // Default to black

				// Get bounding box position
				const rect = textZone.getBoundingClientRect();;
				if (!rect) return;

				// Identify the page number based on the closest ".page" container
				const pageElement = textZone.closest(".page");
				const pageIndex = pageElement
					? Array.from(document.querySelectorAll(".page")).indexOf(pageElement)
					: 0; // Default to the first page if not found
				// Ensure the page index is within the valid range
				if (pageIndex < 0 || pageIndex >= pages.length) return;

				const targetPage = pages[pageIndex];
				// @ts-ignore
				const pageRect = pageElement.getBoundingClientRect();

				const x = (rect.left - pageRect.left) * (targetPage.getWidth() / pageRect.width);
				const y = targetPage.getHeight() - ((rect.top - pageRect.top) * (targetPage.getHeight() / pageRect.height)) - rect.height;


				// Draw text on the correct PDF page
				targetPage.drawText(text, {
					x,
					y,
					size: fontSize,
					color: rgb(r / 255, g / 255, b / 255),
				});
			});

			// Save and download the modified PDF
			const pdfBytesModified = await pdfDoc.save();
			const blob = new Blob([pdfBytesModified], { type: "application/pdf" });

			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = "modified-document.pdf";
			link.click();
		} catch (error) {
			new Notice("No PDF is currently loaded!", 3000);
			alert("Error exporting PDF");
			console.error("Error exporting PDF:", error);
		}
	}
}
