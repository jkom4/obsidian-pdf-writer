import { PDFDocument, rgb } from "pdf-lib";
import { Notice } from "obsidian";
import PDFWriter from "../main";

export class PdfExporter {
	private pdfWriterPlugin: PDFWriter;

	constructor(pdfWriterPlugin: PDFWriter) {
		this.pdfWriterPlugin = pdfWriterPlugin;
	}

	// ─── Helpers ────────────────────────────────────────────────────────────────

	private extractText(el: HTMLElement): string {
		const clone = el.cloneNode(true) as HTMLElement;
		clone.querySelector(".pdf-writer-delete-button")?.remove();
		return Array.from(clone.childNodes)
			.map((node: ChildNode) => {
				if (node.nodeName === "BR") return "\n";
				if (node.nodeName === "DIV") return "\n" + (node as HTMLElement).innerText;
				return (node as HTMLElement).innerText ?? node.textContent ?? "";
			})
			.join("")
			.trim();
	}

	private extractStyles(el: HTMLElement): { fontSize: string; fontFamily: string; color: string } {
		const spanChild = el.querySelector("span") as HTMLElement | null;
		const styleSource = spanChild || el;

		// fontSize
		let fontSize = this.pdfWriterPlugin.settingsManager.settings.defaultFontSize || "14px";
		styleSource.classList.forEach((cls) => {
			const match = cls.match(/^pdf-text-overlay-font-size-(\d+)$/);
			if (match) fontSize = `${match[1]}px`;
		});
		if (fontSize === (this.pdfWriterPlugin.settingsManager.settings.defaultFontSize || "14px")) {
			const computed = window.getComputedStyle(styleSource).fontSize;
			if (computed) fontSize = computed;
		}

		// fontFamily
		let fontFamily = this.pdfWriterPlugin.settingsManager.settings.defaultFontFamily || "Arial";
		styleSource.classList.forEach((cls) => {
			const match = cls.match(/^pdf-text-overlay-font-family-(.+)$/);
			if (match) fontFamily = match[1].replace(/-/g, " ");
		});

		// color
		const colorSpan = el.querySelector(".pdf-text-color-modified") as HTMLElement | null;
		const color =
			colorSpan?.style.getPropertyValue("--pdf-text-color")?.trim() ||
			el.style.getPropertyValue("--pdf-text-color")?.trim() ||
			this.pdfWriterPlugin.settingsManager.settings.defaultTextColor ||
			"#000000";

		return { fontSize, fontFamily, color };
	}

	private hexToRgb(hex: string): { r: number; g: number; b: number } {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
				r: parseInt(result[1], 16) / 255,
				g: parseInt(result[2], 16) / 255,
				b: parseInt(result[3], 16) / 255,
			}
			: { r: 0, g: 0, b: 0 };
	}

	// ─── Export ─────────────────────────────────────────────────────────────────

	async exportPdfWithTextZones(): Promise<void> {
		try {
			const pdfDoc = await PDFDocument.load(this.pdfWriterPlugin.currentPdfBytes!);
			const pages = pdfDoc.getPages();
			const textZones = document.querySelectorAll<HTMLElement>(".pdf-writer-text-overlay");

			textZones.forEach((textZone) => {
				if (textZone.classList.contains("pdf-writer-text-overlay-empty")) return;

				const text = this.extractText(textZone);
				if (!text) return;

				const { fontSize: fontSizeStr, color } = this.extractStyles(textZone);
				const fontSize = parseFloat(fontSizeStr) || 12;
				const lineHeight = fontSize * 1.2;
				const { r, g, b } = this.hexToRgb(color);

				const pageElement = textZone.closest(".page") as HTMLElement | null;
				const pageIndex = pageElement
					? Array.from(document.querySelectorAll(".page")).indexOf(pageElement)
					: 0;

				if (pageIndex < 0 || pageIndex >= pages.length) return;
				const page = pages[pageIndex];

				const rect = textZone.getBoundingClientRect();
				const pageRect = pageElement!.getBoundingClientRect();

				const x = (rect.left - pageRect.left) * (page.getWidth() / pageRect.width);
				const baseY =
					page.getHeight() -
					((rect.top - pageRect.top) * (page.getHeight() / pageRect.height)) -
					fontSize;

				text.split("\n").forEach((line, index) => {
					if (!line.trim()) return;
					page.drawText(line, {
						x,
						y: baseY - index * lineHeight,
						size: fontSize,
						color: rgb(r, g, b),
					});
				});
			});

			const pdfBytesModified = await pdfDoc.save();
			const blob = new Blob([pdfBytesModified], { type: "application/pdf" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = "modified-document.pdf";
			link.click();

			new Notice("PDF successfully exported", 3000);
		} catch (error) {
			new Notice("Error when exporting PDF", 3000);
			console.error("PDF export error:", error);
		}
	}

	// ─── Save ────────────────────────────────────────────────────────────────────

	async saveAnnotationsToFile() {
		const pdfDoc = await PDFDocument.load(this.pdfWriterPlugin.currentPdfBytes!);
		const pages = pdfDoc.getPages();

		const textZones = document.querySelectorAll<HTMLElement>(".pdf-writer-text-overlay");
		const annotationFile = `${this.pdfWriterPlugin.file.path}.annotations.json`;
		const annotations: any[] = [];

		textZones.forEach((el) => {
			if (el.classList.contains("pdf-writer-text-overlay-empty")) return;

			const text = this.extractText(el);
			if (!text) return;

			const { fontSize, fontFamily, color } = this.extractStyles(el);

			const baseX = parseFloat(el.dataset.baseX || "0");
			const baseY = parseFloat(el.dataset.baseY || "0");

			const pageElement = el.closest(".page");
			const pageIndex = pageElement
				? Array.from(document.querySelectorAll(".page")).indexOf(pageElement)
				: 0;

			if (pageIndex < 0 || pageIndex >= pages.length) return;

			annotations.push({
				text,
				fontSize,
				fontFamily,
				color,
				pageIndex,
				position: { x: baseX, y: baseY },
			});
		});

		const data = JSON.stringify(annotations, null, 2);
		await this.pdfWriterPlugin.app.vault.adapter.write(annotationFile, data);
		new Notice("Saved successfully", 3000);
	}
}
