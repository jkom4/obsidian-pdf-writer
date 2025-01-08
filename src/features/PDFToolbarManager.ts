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

		const newButton = defaultToolbar.createEl("button", {
			text: "Add Text Zone",
			cls: "custom-toolbar-button",
		});

		newButton.addEventListener("click", () => {
			console.log("Adding a text zone...");
			new TextZoneManager(this.plugin).addTextZone();
		});

		console.log("Button added to the default toolbar.");
	}
}
