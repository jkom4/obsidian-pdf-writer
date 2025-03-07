import {FileView, Notice,setIcon} from 'obsidian';
import PDFWriter from "../main";
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

		defaultToolbar.classList.add("pdf-writer-toolbar");


		const addTextButton = defaultToolbar.createEl("button", { cls: "pdf-writer-toolbar-button" });
		setIcon(addTextButton, 'type-outline');
		this.toolbarElements.push(addTextButton);


		const fontSizeDropdown = defaultToolbar.createEl("select", { cls: "pdf-writer-toolbar-button" });
		["12px", "14px", "16px", "18px", "20px", "24px"].forEach(size => {
			fontSizeDropdown.createEl("option", { text: size, value: size });
		});
		fontSizeDropdown.value = this.plugin.settingsManager.settings.defaultFontSize || "16px";
		this.toolbarElements.push(fontSizeDropdown);

		const fontFamilyDropdown = defaultToolbar.createEl("select", { cls: "pdf-writer-toolbar-button" });
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

		addTextButton.addEventListener("click", () => {
			this.plugin.textZoneManager.addTextZone(fontSizeDropdown.value, fontFamilyDropdown.value, colorPicker.value);
		});

		const saveButton = defaultToolbar.createEl("button", { cls: "pdf-writer-toolbar-button" });
		setIcon(saveButton, 'save');
		this.toolbarElements.push(saveButton);

		saveButton.addEventListener("click", async () => {
			if (!this.plugin.currentPdfBytes) {
				this.myNotice.setMessage("No PDF is currently loaded!");
				return;
			}
			const exporter = new PdfExporter(this.plugin);
			await exporter.saveAnnotationsToFile();
		});

			const exportButton = defaultToolbar.createEl("button", { cls: "pdf-writer-toolbar-button" });
		setIcon(exportButton, 'download');
		this.toolbarElements.push(exportButton);

		exportButton.addEventListener("click", async () => {
			if (!this.plugin.currentPdfBytes) {
				this.myNotice.setMessage("No PDF is currently loaded!");
				return;
			}
			const exporter = new PdfExporter(this.plugin);
			await exporter.exportPdfWithTextZones();
		});
		// Event listeners for applying styles to the selected text
		fontSizeDropdown.addEventListener("change", () => this.plugin.textZoneManager.applyStyleToSelection("fontSize", fontSizeDropdown.value));
		fontFamilyDropdown.addEventListener("change", () => this.plugin.textZoneManager.applyStyleToSelection("fontFamily", fontFamilyDropdown.value));
		colorPicker.addEventListener("input", () => this.plugin.textZoneManager.applyStyleToSelection("color", colorPicker.value));

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
