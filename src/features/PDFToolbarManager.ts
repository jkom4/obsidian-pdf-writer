import {  Plugin, FileView } from 'obsidian';
import TextZoneManager from "./TextZoneManager";

/**
 * Manages the toolbar for the PDF viewer.
 */
export default class PDFToolbarManager {
	plugin: Plugin;

	constructor(plugin: Plugin) {
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
)
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
		const newButton = defaultToolbar.createEl("button", {
			text: "Add Text Zone",
			cls: "custom-toolbar-button",
		});

		newButton.addEventListener("click", () => {
			console.log("Adding a text zone...");
			new TextZoneManager(this.plugin).addTextZone(fontSizeDropdown.value, fontFamilyDropdown.value, colorPicker.value);
		});

		console.log("Button added to the default toolbar.");

		// Event listeners for applying styles to the selected text
		fontSizeDropdown.addEventListener("change", () => new TextZoneManager(this.plugin).applyStyleToSelection("fontSize", fontSizeDropdown.value));
		fontFamilyDropdown.addEventListener("change", () => new TextZoneManager(this.plugin).applyStyleToSelection("fontFamily", fontFamilyDropdown.value));
		colorPicker.addEventListener("input", () => new TextZoneManager(this.plugin).applyStyleToSelection("color", colorPicker.value));
	}
}
