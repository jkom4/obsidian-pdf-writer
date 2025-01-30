import { FileView } from 'obsidian';
import PDFWriter from "../main";
import PDFTextZoneManager from "./PDFTextZoneManager";
import {PdfExporter} from "./PdfExporter";

/**
 * Manages the toolbar for the PDF viewer.
 */
export default class PDFToolbarManager {
	plugin: PDFWriter;

	constructor(plugin: PDFWriter) {
		this.plugin = plugin;
	}

	/**
	 * Adds a toolbar to the PDF viewer.
	 */
	addToolbarToViewer() {
		const activeLeaf = this.plugin.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("No active or supported file view.");
			return;
		}

		const container = activeLeaf.containerEl;
		const defaultToolbar = container.querySelector(".pdf-toolbar");

		if (!defaultToolbar) {
			console.warn("Default toolbar not found.");
			return;
		}


		// Create a dropdown for font size
		const fontSizeDropdown = defaultToolbar.createEl("select");
		["12px", "14px", "16px", "18px", "20px", "24px"].forEach(size => {
			fontSizeDropdown.createEl("option", { text: size, value: size });
		});
		fontSizeDropdown.value = this.plugin.settingsManager.settings.defaultFontSize || "16px";

		// Create a dropdown for font family
		const fontFamilyDropdown = defaultToolbar.createEl("select");
		["Arial", "Verdana", "Times New Roman", "Courier New", "Georgia"].forEach(font => {
			fontFamilyDropdown.createEl("option", { text: font, value: font });
		});
		fontFamilyDropdown.value = this.plugin.settingsManager.settings.defaultFontFamily || "Arial";

		// Create a color picker
		const colorPicker = defaultToolbar.createEl("input", {
			type: "color",
			cls: "pdf-text-color-picker",
		});
		colorPicker.value = this.plugin.settingsManager.settings.defaultTextColor || "#000000";

		// Create button to add text area
		const addTextButton = defaultToolbar.createEl("button", { cls: "pdf-toolbar-button pdf-add-text-button" });
		this.createSVGIcon(addTextButton, "M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416 32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-1.8 0 18-48 159.6 0 18 48-1.8 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-25.8 0L254 52.8zM279.8 304l-111.6 0L224 155.1 279.8 304z");

		addTextButton.addEventListener("click", () => {
			console.log("Adding a text zone...");
			new PDFTextZoneManager(this.plugin).addTextZone(fontSizeDropdown.value, fontFamilyDropdown.value, colorPicker.value);
		});

		// Create button to export PDF
		const exportButton = defaultToolbar.createEl("button", { cls: "pdf-toolbar-button pdf-export-button" });
		this.createSVGIcon(exportButton, "M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z");

		exportButton.addEventListener("click", async () => {
			if (!this.plugin.currentPdfBytes) {
				alert("No PDF is currently loaded!");
				return;
			}

			const exporter = new PdfExporter(this.plugin.currentPdfBytes);
			await exporter.exportPdfWithTextZones();
		});

		// Event listeners for applying styles to the selected text
		fontSizeDropdown.addEventListener("change", () => new PDFTextZoneManager(this.plugin).applyStyleToSelection("fontSize", fontSizeDropdown.value));
		fontFamilyDropdown.addEventListener("change", () => new PDFTextZoneManager(this.plugin).applyStyleToSelection("fontFamily", fontFamilyDropdown.value));
		colorPicker.addEventListener("input", () => new PDFTextZoneManager(this.plugin).applyStyleToSelection("color", colorPicker.value));

		// Clean up event listeners when the plugin is unloaded
		this.plugin.register(() => {
			fontSizeDropdown.removeEventListener("change", () => {});
			fontFamilyDropdown.removeEventListener("change", () => {});
			colorPicker.removeEventListener("input", () => {});
			addTextButton.removeEventListener("click", () => {});
			exportButton.removeEventListener("click", () => {});
		});
	}

	/**
	 * Creates an SVG icon for a button.
	 * @param button - The button element to which the SVG will be added.
	 * @param pathData - The `d` attribute of the SVG path.
	 */
	createSVGIcon(button: HTMLButtonElement, pathData: string) {
		const svgNS = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(svgNS, "svg");
		svg.setAttribute("class", "pdf-toolbar-icon");
		svg.setAttribute("viewBox", "0 0 512 512");
		svg.setAttribute("aria-hidden", "true");
		svg.setAttribute("focusable", "false");

		const path = document.createElementNS(svgNS, "path");
		path.setAttribute("fill", "currentColor");
		path.setAttribute("d", pathData);

		svg.appendChild(path);
		button.appendChild(svg);
	}
}
