import { PDFDocument, rgb } from "pdf-lib";

export class PdfExporter {
	private currentPdfBytes: ArrayBuffer;

	constructor(currentPdfBytes: ArrayBuffer) {
		this.currentPdfBytes = currentPdfBytes;
	}

	async exportPdfWithTextZones(): Promise<void> {

		try {
			// Charger le fichier PDF actuel
			const pdfDoc = await PDFDocument.load(this.currentPdfBytes);

			// Obtenir la première page (ou plusieurs pages si nécessaire)
			const pages = pdfDoc.getPages();
			const firstPage = pages[0];

			// Ajouter les zones de texte
			const textZones = document.querySelectorAll(".text-overlay");

			textZones.forEach((textZone) => {
				const deleteButton = textZone.querySelector(".delete-button");
				// @ts-ignore
				textZone.removeChild(deleteButton);
				const text = textZone.textContent || "";
				const { x, y, width, height } = textZone.getBoundingClientRect();

				// Ajouter le texte à la position correspondante
				firstPage.drawText(text, {
					x: x, // Position X
					y: firstPage.getHeight() - y - height, // Calculer Y en inversant l'axe
					size: 12,
					color: rgb(0, 0, 0), // Couleur noire
				});
			});

			// Exporter le PDF modifié
			const pdfBytesModified = await pdfDoc.save();

			// Télécharger le fichier modifié
			const blob = new Blob([pdfBytesModified], { type: "application/pdf" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = "modified-document.pdf";
			link.click();
		} catch (error) {
			alert("Error exporting PDF");
			console.error("Error exporting PDF:", error);
		}
	}
}
