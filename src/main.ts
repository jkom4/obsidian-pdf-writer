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


						this.currentPdfBytes = arrayBuffer;


						if (!isToolbarInitialized ) {
							this.toolbarManager.addToolbarToViewer();
							isToolbarInitialized = true;
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


		this.app.workspace.trigger("layout-change");

	}

	onunload() {
		if (this.toolbarManager) {
			this.toolbarManager.removeToolbarElements();
		}
		document.querySelectorAll(".pdf-writer-text-overlay").forEach((el) => el.remove());
		this.app.workspace.trigger("layout-change");
	}

	async readFileAsArrayBuffer(file: TFile): Promise<ArrayBuffer> {
		const fileData = await this.app.vault.readBinary(file);
		return fileData.slice();
	}
}


