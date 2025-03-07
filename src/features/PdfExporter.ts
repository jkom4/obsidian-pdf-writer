import { PDFDocument, rgb } from "pdf-lib";
import {Notice, TFile} from "obsidian";
import PDFWriter from "../main";

export class PdfExporter {
	private pdfWriterPlugin: PDFWriter;

	constructor(pdfWriterPlugin: PDFWriter) {
		this.pdfWriterPlugin = pdfWriterPlugin;
	}

	async exportPdfWithTextZones(): Promise<void> {
		try {
			// Load the active PDF document
			const pdfDoc = await PDFDocument.load(this.pdfWriterPlugin.currentPdfBytes!);
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
				const rect = textZone.getBoundingClientRect();
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
				const y = targetPage.getHeight() - ((rect.top - pageRect.top) * (targetPage.getHeight() / pageRect.height)) ;


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
	async saveAnnotationsToFile() {
		// Charger le document PDF
		const pdfDoc = await PDFDocument.load(this.pdfWriterPlugin.currentPdfBytes!);
		const pages = pdfDoc.getPages();

		// Sélectionner toutes les zones de texte
		const textZones = document.querySelectorAll(".pdf-writer-text-overlay");
		const annotationFile = `${this.pdfWriterPlugin.file.path}.annotations.json`;

		const annotations: any[] = []; // Liste pour stocker toutes les annotations

		textZones.forEach((textZone) => {
			// Retirer le bouton de suppression s'il existe
			const deleteButton = textZone.querySelector(".pdf-writer-delete-button");
			if (deleteButton) {
				textZone.removeChild(deleteButton);
			}

			const text = textZone.textContent?.trim() || "";
			if (!text) return;

			// Extraire les styles (taille et couleur)
			const styles = window.getComputedStyle(textZone);
			const fontSize = parseFloat(styles.fontSize) || 12;
			const fontFamily = styles.fontFamily;
			const color = styles.color.match(/\d+/g);
			const [r, g, b] = color ? color.map(Number) : [0, 0, 0]; // Noir par défaut
			const hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

			// Récupérer la position du texte
			const rect = textZone.getBoundingClientRect();
			if (!rect) return;

			// Identifier la page cible
			const pageElement = textZone.closest(".page");
			const pageIndex = pageElement
				? Array.from(document.querySelectorAll(".page")).indexOf(pageElement)
				: 0;


			if (pageIndex < 0 || pageIndex >= pages.length) return;


			//const targetPage = pages[pageIndex];
			// @ts-ignore
			const pageRect = pageElement.getBoundingClientRect();
			const x = (rect.x - pageRect.x) ;
			const y = (rect.y - pageRect.y) ;

			// Add annotations
			annotations.push({
				text,
				fontSize,
				fontFamily,
				color: hexColor,
				pageIndex,
				position: { x, y }
			});
		});

		// Sauvegarder les annotations dans un fichier JSON
		const data = JSON.stringify(annotations, null, 2);
		await this.pdfWriterPlugin.app.vault.adapter.write(annotationFile, data);
	}



}
