import { Plugin, TFile,  } from 'obsidian';

import {PluginSettingsManager, SampleSettingTab} from "./features/SettingsManager";
import PDFToolbarManager from "./features/PDFToolbarManager";
import {KeyboardCommand} from "./features/KeyboardCommand";


/**
 * Obsidian PDF Plugin Class
 * Handles lifecycle events and integrates all managers.
 */
export default class MyPlugin extends Plugin {
	currentPdfBytes: ArrayBuffer | null = null;
	settingsManager: PluginSettingsManager;
	keyboardCommand: KeyboardCommand;

	async onload() {
		console.log("PDF Plugin loaded.");


		this.settingsManager = new PluginSettingsManager(this);
		await this.settingsManager.loadSettings();

		const toolbarManager = new PDFToolbarManager(this);
		this.registerEvent(
			this.app.workspace.on("file-open", async (file: TFile | null) => {
				if (file && file.extension === "pdf") {
					console.log("PDF opened:", file.name);
					try {
						const arrayBuffer = await this.readFileAsArrayBuffer(file);
						console.log("PDF data loaded as ArrayBuffer");

						// Stocker les données du PDF dans la propriété currentPdfBytes
						this.currentPdfBytes = arrayBuffer;

						// Ajouter la toolbar au visualiseur PDF
						toolbarManager.addToolbarToViewer();
						// Other plugin initializations after init
						this.keyboardCommand = new KeyboardCommand(this);
					} catch (error) {
						console.error("Failed to read PDF file:", error);
					}
				}
			})
		);

		// Add settings tab
		this.addSettingTab(new SampleSettingTab(this.app, this));


	}

	onunload() {
		console.log("PDF Plugin unloaded.");
	}

	async readFileAsArrayBuffer(file: TFile): Promise<ArrayBuffer> {
		const fileData = await this.app.vault.readBinary(file);
		return fileData.slice();
	}
}


