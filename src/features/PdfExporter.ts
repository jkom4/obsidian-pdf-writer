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
				if (deleteButton) {
					textZone.removeChild(deleteButton);
				}
				const text = textZone.textContent || "";

				// Récupérer les styles appliqués dynamiquement (fontSize, fontFamily, color)
				const fontSize = window.getComputedStyle(textZone).fontSize.replace("px", ""); // Extraire uniquement le chiffre
				const color = window.getComputedStyle(textZone).color;

				// Convertir la couleur en RGB
				const rgbMatch = color.match(/\d+/g);
				const [r, g, b] = rgbMatch ? rgbMatch.map(Number) : [0, 0, 0]; // Noir par défaut
				const { x, y, width, height } = textZone.getBoundingClientRect();

				// Ajouter le texte à la position correspondante
				firstPage.drawText(text, {
					x: x, // Position X
					y: firstPage.getHeight() - y - height, // Calculer Y en inversant l'axe
					size:  parseFloat(fontSize) || 12,
					color: rgb(r / 255, g / 255, b / 255), // Couleur noire
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
