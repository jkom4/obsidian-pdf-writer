import {FileView, Notice,setIcon} from 'obsidian';
import PDFWriter from "../main";
import PDFTextZoneManager from "./PDFTextZoneManager";
import {PdfExporter} from "./PdfExporter";

/**
 * Manages the toolbar for the PDF viewer.
 */
export default class PDFToolbarManager {
	plugin: PDFWriter;
	myNotice: Notice;
	private toolbarElements: HTMLElement[] = [];

	constructor(plugin: PDFWriter) {
		this.plugin = plugin;
		this.myNotice = new Notice("",3000);
	}
	addToolbarElements() {
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

		// Créer les éléments et les stocker dans `this.toolbarElements`
		const fontSizeDropdown = defaultToolbar.createEl("select");
		["12px", "14px", "16px", "18px", "20px", "24px"].forEach(size => {
			fontSizeDropdown.createEl("option", { text: size, value: size });
		});
		fontSizeDropdown.value = this.plugin.settingsManager.settings.defaultFontSize || "16px";
		this.toolbarElements.push(fontSizeDropdown);

		const fontFamilyDropdown = defaultToolbar.createEl("select");
		["Arial", "Verdana", "Times New Roman", "Courier New", "Georgia"].forEach(font => {
			fontFamilyDropdown.createEl("option", { text: font, value: font });
		});
		fontFamilyDropdown.value = this.plugin.settingsManager.settings.defaultFontFamily || "Arial";
		this.toolbarElements.push(fontFamilyDropdown);

		const colorPicker = defaultToolbar.createEl("input", {
			type: "color",
			cls: "pdf-text-color-picker",
		});
		colorPicker.value = this.plugin.settingsManager.settings.defaultTextColor || "#000000";
		defaultToolbar.appendChild(colorPicker);
		this.toolbarElements.push(colorPicker);

		const addTextButton = defaultToolbar.createEl("button", { cls: "pdf-toolbar-button pdf-add-text-button" });
		setIcon(addTextButton, 'type-outline');
		this.toolbarElements.push(addTextButton);

		addTextButton.addEventListener("click", () => {
			new PDFTextZoneManager(this.plugin).addTextZone(fontSizeDropdown.value, fontFamilyDropdown.value, colorPicker.value);
		});

		const exportButton = defaultToolbar.createEl("button", { cls: "pdf-toolbar-button pdf-export-button" });
		setIcon(exportButton, 'download');
		this.toolbarElements.push(exportButton);

		exportButton.addEventListener("click", async () => {
			if (!this.plugin.currentPdfBytes) {
				this.myNotice.setMessage("No PDF is currently loaded!");
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

		//defaultToolbar.append(fontSizeDropdown, fontFamilyDropdown, colorPicker, addTextButton, exportButton);
	}

	removeToolbarElements() {
		this.toolbarElements.forEach(el => {
			if (el.parentNode) {
				el.parentNode.removeChild(el); // Supprime du DOM
			}
		});
		this.toolbarElements = []; // Vider la liste

	}
	/**
	 * Adds a toolbar to the PDF viewer.
	 */
	addToolbarToViewer() {
		this.addToolbarElements();
	}

}
