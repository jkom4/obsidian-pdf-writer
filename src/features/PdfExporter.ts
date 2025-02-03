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

			// Fonction pour convertir les coordonnées du navigateur en coordonnées du PDF
			const convertToPdfCoordinates = (element: HTMLElement, pdfPageHeight: number) => {
				const rect = element.getBoundingClientRect();

				// Récupérer la position de la page PDF dans le navigateur
				const pdfPageContainer = document.querySelector(".pdf-container");
				if (!pdfPageContainer) {
					throw new Error("PDF page container not found");
				}
				const containerRect = pdfPageContainer.getBoundingClientRect();

				// Ajuster les coordonnées en fonction des marges ou du padding
				const offsetX = containerRect.left;
				const offsetY = containerRect.top;
				const toolbarHeight = 13;
				// Calculer les coordonnées relatives à la page PDF
				const x = rect.left - offsetX;
				const y = pdfPageHeight - (rect.bottom - offsetY) - toolbarHeight; // Inverser l'axe Y et ajuster la hauteur

				return { x, y };
			};

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
				const [r, g, b] = rgbMatch ? rgbMatch.map(Number) : [0, 0, 0];
				// Convertir les coordonnées du navigateur en coordonnées du PDF
				const { x, y } = convertToPdfCoordinates(textZone as HTMLElement, firstPage.getHeight());

				// Ajouter le texte à la position correspondante
				firstPage.drawText(text, {
					x: x,
					y: y,
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
