import { FileView } from 'obsidian';
import TextZoneManager from "./TextZoneManager";
import {PdfExporter} from "./PdfExporter";
import MyPlugin from "../main";

/**
 * Manages the toolbar for the PDF viewer.
 */
export default class PDFToolbarManager {
	plugin: MyPlugin;

	constructor(plugin: MyPlugin) {
		this.plugin = plugin;
	}

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
		const fontSizeDropdown = defaultToolbar.createEl("select", { cls: "font-size-dropdown" });
		["12px", "14px", "16px", "18px", "20px", "24px"].forEach(size => {
			fontSizeDropdown.createEl("option", { text: size, value: size });
		});


		// Create a dropdown for font family
		const fontFamilyDropdown = defaultToolbar.createEl("select", { cls: "font-family-dropdown" });
		["Arial", "Verdana", "Times New Roman", "Courier New", "Georgia"].forEach(font => {
			fontFamilyDropdown.createEl("option", { text: font, value: font });
		});

		// Create a color picker
		const colorPicker = defaultToolbar.createEl("input", {
			type: "color",
			cls: "text-color-picker",
		});

		//Create button to add text Area
		const addTextButton = defaultToolbar.createEl("button", {
			cls: "custom-toolbar-button",
		});
		addTextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" aria-hidden="true" focusable="false" viewBox="0 0 512 512">
    <path
      fill="currentColor"
      d="M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416 32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-1.8 0 18-48 159.6 0 18 48-1.8 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-25.8 0L254 52.8zM279.8 304l-111.6 0L224 155.1 279.8 304z"
    />
  </svg>`;
		addTextButton.addEventListener("click", () => {
			console.log("Adding a text zone...");
			new TextZoneManager(this.plugin).addTextZone(fontSizeDropdown.value, fontFamilyDropdown.value, colorPicker.value);
		});
		console.log("Button added to the default toolbar.");

		//Create button to export pdf
		const exportButton = defaultToolbar.createEl("button", {
			cls: "custom-toolbar-button",
		});
		exportButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" aria-hidden="true" focusable="false" viewBox="0 0 512 512">
    <path
      fill="currentColor"
      d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
    />
  </svg>`;

		exportButton.addEventListener("click", async () => {
			// Vérifier que le PDF actuel est chargé
			if (!this.plugin.currentPdfBytes) {
				alert("No PDF is currently loaded!");
				return;
			}

			// Exporter le PDF avec les modifications
			const exporter = new PdfExporter(this.plugin.currentPdfBytes);
			await exporter.exportPdfWithTextZones();
		});


		// Event listeners for applying styles to the selected text
		fontSizeDropdown.addEventListener("change", () => new TextZoneManager(this.plugin).applyStyleToSelection("fontSize", fontSizeDropdown.value));
		fontFamilyDropdown.addEventListener("change", () => new TextZoneManager(this.plugin).applyStyleToSelection("fontFamily", fontFamilyDropdown.value));
		colorPicker.addEventListener("input", () => new TextZoneManager(this.plugin).applyStyleToSelection("color", colorPicker.value));
	}
}
