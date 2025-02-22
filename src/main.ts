import {FileView, Plugin, TFile,} from 'obsidian';

import {PluginSettingsManager, PDFWriterSettingTab} from "./features/SettingsManager";
import PDFToolbarManager from "./features/PDFToolbarManager";



/**
 * Obsidian PDF Plugin Class
 * Handles lifecycle events and integrates all managers.
 */
export default class PDFWriter extends Plugin {
	currentPdfBytes: ArrayBuffer | null = null;
	settingsManager: PluginSettingsManager;
	toolbarManager: PDFToolbarManager;

	async onload() {


		this.settingsManager = new PluginSettingsManager(this);
		await this.settingsManager.loadSettings();

		this.toolbarManager = new PDFToolbarManager(this);
		let isToolbarInitialized = false;

		// Initialize the toolbar if a PDF is active
		const initializeToolbarIfNeeded = async () => {
			const activeLeaf = this.app.workspace.getActiveViewOfType(FileView);
			if (activeLeaf) {
				const file = this.app.workspace.getActiveFile();
				if (file && file.extension === "pdf") {
					try {
						const arrayBuffer = await this.readFileAsArrayBuffer(file);

						// Stocker les données du PDF dans la propriété currentPdfBytes
						this.currentPdfBytes = arrayBuffer;

						// Ajouter la toolbar uniquement si elle n'existe pas déjà
						if (!isToolbarInitialized ) {
							this.toolbarManager.addToolbarToViewer();
							isToolbarInitialized = true; // Marquer la toolbar comme initialisée
						}
					} catch (error) {
						console.error("Failed to read PDF file:", error);
					}
				}else {
					isToolbarInitialized = false;
				}
			}
		};

		// Listen to file opening
		this.registerEvent(
			this.app.workspace.on("file-open", async (file: TFile | null) => {
				if (file && file.extension === "pdf") {
					await initializeToolbarIfNeeded();
				}
			})
		);

		// Listen to active tab changes
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", async () => {
				await initializeToolbarIfNeeded();
			})
		);

		// Add settings tab
		this.addSettingTab(new PDFWriterSettingTab(this.app, this));


		this.app.workspace.trigger("layout-change"); // Forcer un refresh de l'interface

	}

	onunload() {
		if (this.toolbarManager) {
			this.toolbarManager.removeToolbarElements(); // Supprime les éléments propres à ton plugin
		}
		document.querySelectorAll(".pdf-writer-text-overlay").forEach((el) => el.remove());
		this.app.workspace.trigger("layout-change"); // Forcer un refresh de l'interface
	}

	async readFileAsArrayBuffer(file: TFile): Promise<ArrayBuffer> {
		const fileData = await this.app.vault.readBinary(file);
		return fileData.slice();
	}
}


