import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from "../main";

// Plugin settings interface and default settings
interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
};

/**
 * Manages plugin settings.
 */
class PluginSettingsManager {
	plugin: Plugin;
	settings: MyPluginSettings;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
		this.settings = DEFAULT_SETTINGS;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.plugin.loadData());
	}

	async saveSettings() {
		await this.plugin.saveData(this.settings);
	}
}

/**
 * Sample Setting Tab Class
 * Provides a UI for configuring plugin settings in Obsidian.
 */
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settingsManager.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settingsManager.settings.mySetting = value;
					await this.plugin.settingsManager.saveSettings();
				}));
	}
}
export {SampleSettingTab,PluginSettingsManager};
