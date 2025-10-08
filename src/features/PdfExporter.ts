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
			const pdfDoc = await PDFDocument.load(this.pdfWriterPlugin.currentPdfBytes!);
			const pages = pdfDoc.getPages();

			// Sélection de toutes les zones de texte visibles sur le PDF
			const textZones = document.querySelectorAll(".pdf-writer-text-overlay");

			textZones.forEach((textZone) => {
				// Supprimer le bouton de suppression pour éviter de le dessiner
				const deleteButton = textZone.querySelector(".pdf-writer-delete-button");
				if (deleteButton) deleteButton.remove();

				const text = textZone.textContent?.trim();
				if (!text) return;

				// --- Extraire les styles appliqués ---
				const styles = window.getComputedStyle(textZone);
				const fontSize = parseFloat(styles.fontSize) || 12;
				const fontColor = styles.color.match(/\d+/g);
				let [r, g, b] = fontColor ? fontColor.map(Number) : [0, 0, 0];
				r /= 255; g /= 255; b /= 255;

				// --- Déterminer la page correspondante ---
				const pageElement = textZone.closest(".page");
				const pageIndex = pageElement
					? Array.from(document.querySelectorAll(".page")).indexOf(pageElement)
					: 0;

				if (pageIndex < 0 || pageIndex >= pages.length) return;
				const page = pages[pageIndex];

				// --- Convertir les coordonnées DOM en coordonnées PDF ---
				const rect = textZone.getBoundingClientRect();
				// @ts-ignore
				const pageRect = pageElement.getBoundingClientRect();

				// Conversion des coordonnées relatives à la page PDF
				const x = (rect.left - pageRect.left) * (page.getWidth() / pageRect.width);
				const y = page.getHeight() -
					((rect.top - pageRect.top) * (page.getHeight() / pageRect.height)) - fontSize;

				// --- Dessiner le texte sur la page PDF ---
				page.drawText(text, {
					x,
					y,
					size: fontSize, // utilise la vraie taille en points
					color: rgb(r, g, b),
				});
			});

			// --- Sauvegarder le PDF modifié ---
			const pdfBytesModified = await pdfDoc.save();
			const blob = new Blob([pdfBytesModified], { type: "application/pdf" });

			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = "modified-document.pdf";
			link.click();

			new Notice("PDF successfully exported  ", 3000);
		} catch (error) {
			new Notice("Error when exporting PDF ", 3000);
			console.error("PDF export error:", error);
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
		new Notice("Saved successfully  ", 3000);
	}



}
