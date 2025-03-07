import {FileView, Plugin, TFile,} from 'obsidian';

import {PluginSettingsManager, PDFWriterSettingTab} from "./features/SettingsManager";
import PDFToolbarManager from "./features/PDFToolbarManager";
import PDFTextZoneManager from "./features/PDFTextZoneManager";



/**
 * Obsidian PDF Plugin Class
 * Handles lifecycle events and integrates all managers.
 */
export default class PDFWriter extends Plugin {
	currentPdfBytes: ArrayBuffer | null = null;
	settingsManager: PluginSettingsManager;
	toolbarManager: PDFToolbarManager;
	file : TFile;
	textZoneManager: PDFTextZoneManager;

	async onload() {


		this.textZoneManager = new PDFTextZoneManager(this);
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
						this.file = file;


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
					await this.textZoneManager.loadAnnotations();
				}
			})
		);

		// Listen to active tab changes
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", async () => {
				if(this.file && this.file.extension === "pdf") {
					await initializeToolbarIfNeeded();
					await this.textZoneManager.loadAnnotations();
				}

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


