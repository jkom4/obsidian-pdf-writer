import * as pdfjsLib from "pdfjs-dist";

export class PdfViewer {
	container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	async loadPdf(url: string) {
		// Charger le fichier PDF
		const pdf = await pdfjsLib.getDocument(url).promise;

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);

			// Créer un canevas pour chaque page
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d")!;
			const viewport = page.getViewport({ scale: 1.0 });

			canvas.width = viewport.width;
			canvas.height = viewport.height;

			// Rendre la page sur le canevas
			await page.render({
				canvasContext: context,
				viewport: viewport,
			}).promise;

			this.container.appendChild(canvas);
		}
	}
}
