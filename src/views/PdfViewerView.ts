import { ItemView, WorkspaceLeaf } from "obsidian";
import { PdfViewer } from "./PdfWiewer";

export const VIEW_TYPE_PDF = "pdf-viewer";

export class PdfViewerView extends ItemView {
	viewer: PdfViewer;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.viewer = new PdfViewer(this.containerEl);
	}

	getViewType(): string {
		return VIEW_TYPE_PDF;
	}

	getDisplayText(): string {
		return "PDF Viewer";
	}

	async onOpen(): Promise<void> {
		// Exemple de chargement d'un fichier PDF.
		const filePath = "path/to/your/file.pdf";
		await this.viewer.loadPdf(filePath);
	}

	async onClose(): Promise<void> {
		// Nettoyage, si nécessaire.
	}
}
