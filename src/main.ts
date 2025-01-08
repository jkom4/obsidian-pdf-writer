import { Plugin, TFile,  } from 'obsidian';

import {PluginSettingsManager, SampleSettingTab} from "./features/SettingsManager";
import PDFToolbarManager from "./features/PDFToolbarManager";


/**
 * Obsidian PDF Plugin Class
 * Handles lifecycle events and integrates all managers.
 */
export default class MyPlugin extends Plugin {
	settingsManager: PluginSettingsManager;

	async onload() {
		console.log("PDF Plugin loaded.");

		this.settingsManager = new PluginSettingsManager(this);
		await this.settingsManager.loadSettings();

		const toolbarManager = new PDFToolbarManager(this);
		this.registerEvent(
			this.app.workspace.on("file-open", (file: TFile | null) => {
				if (file && file.extension === "pdf") {
					console.log("PDF opened:", file.name);
					toolbarManager.addToolbarToViewer();
				}
			})
		);

		// Add settings tab
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
		console.log("PDF Plugin unloaded.");
	}
}


