import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from "../main";

// Plugin settings interface to define the shape of the settings object.
interface MyPluginSettings {
	mySetting: string; // Example setting: A placeholder string.
	defaultFontSize: string; // Default font size for text zones.
	defaultFontFamily: string; // Default font family for text zones.
	defaultTextColor: string; // Default text color for text zones.
	autoSaveInterval: number; // Interval for auto-saving changes.
	enableAdvancedMode: boolean; // Enable or disable advanced mode features.
}

// Default values for plugin settings.
const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default', // Default value for "mySetting".
	defaultFontSize: '14px', // Default font size.
	defaultFontFamily: 'Arial', // Default font family.
	defaultTextColor: '#000000', // Default text color (black).
	autoSaveInterval: 5, // Auto-save every 5 minutes.
	enableAdvancedMode: false // Advanced mode disabled by default.
};

/**
 * Class to manage plugin settings.
 * Handles loading, saving, and defaulting settings for the plugin.
 */
class PluginSettingsManager {
	plugin: Plugin; // Reference to the plugin instance.
	settings: MyPluginSettings; // Holds the current settings for the plugin.

	constructor(plugin: Plugin) {
		this.plugin = plugin;
		this.settings = DEFAULT_SETTINGS; // Initialize with default settings.
	}

	/**
	 * Loads settings from Obsidian's storage and merges them with default settings.
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.plugin.loadData());
	}

	/**
	 * Saves the current settings to Obsidian's storage.
	 */
	async saveSettings() {
		await this.plugin.saveData(this.settings);
	}
}

/**
 * Class for the settings tab UI in Obsidian.
 * Provides a user interface for configuring plugin settings in the settings panel.
 */
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin; // Reference to the main plugin class.

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin; // Initialize with the main plugin instance.
	}

	/**
	 * Renders the settings UI.
	 * This method is called when the user opens the settings tab for the plugin.
	 */
	display(): void {
		const { containerEl } = this;

		containerEl.empty(); // Clear the container to avoid duplicate UI elements.
		// Add a header with the plugin name and description
		containerEl.createEl('h2', { text: 'Obsidian PDF Writer' });
		containerEl.createEl('p', { text: 'Customize your experience with Obsidian PDF Writer. For more information, visit the documentation.' });
		containerEl.createEl('a', {
			href: 'https://github.com/jkom4/obsidian-pdf-writer/blob/main/README.md',
			text: 'View Documentation',
			cls: 'docs-link'
		});
		// Dropdown for default font size.
		new Setting(containerEl)
			.setName('Default Font Size')
			.setDesc('Choose the default font size for text zones.')
			.addDropdown(dropdown => dropdown
				.addOptions({
					'12px': '12px',
					'14px': '14px',
					'16px': '16px',
					'18px': '18px',
					'20px': '20px'
				})
				.setValue(this.plugin.settingsManager.settings.defaultFontSize)
				.onChange(async (value) => {
					this.plugin.settingsManager.settings.defaultFontSize = value;
					await this.plugin.settingsManager.saveSettings();
				}));

		// Dropdown for default font family.
		new Setting(containerEl)
			.setName('Default Font Family')
			.setDesc('Choose the default font family for text zones.')
			.addDropdown(dropdown => dropdown
				.addOptions({
					'Arial': 'Arial',
					'Verdana': 'Verdana',
					'Times New Roman': 'Times New Roman',
					'Courier New': 'Courier New',
					'Georgia': 'Georgia'
				})
				.setValue(this.plugin.settingsManager.settings.defaultFontFamily)
				.onChange(async (value) => {
					this.plugin.settingsManager.settings.defaultFontFamily = value;
					await this.plugin.settingsManager.saveSettings();
				}));

		// Color picker for default text color.
		new Setting(containerEl)
			.setName('Default Text Color')
			.setDesc('Choose the default text color for text zones.')
			.addColorPicker(colorPicker => colorPicker
				.setValue(this.plugin.settingsManager.settings.defaultTextColor)
				.onChange(async (value) => {
					this.plugin.settingsManager.settings.defaultTextColor = value;
					await this.plugin.settingsManager.saveSettings();
				}));

		// Slider for auto-save interval.
		new Setting(containerEl)
			.setName('Auto-Save Interval (minutes)')
			.setDesc('Set the interval for auto-saving changes.')
			.addSlider(slider => slider
				.setLimits(1, 60, 1)
				.setValue(this.plugin.settingsManager.settings.autoSaveInterval)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settingsManager.settings.autoSaveInterval = value;
					await this.plugin.settingsManager.saveSettings();
				}));

		// Toggle for advanced mode.
		new Setting(containerEl)
			.setName('Enable Advanced Mode')
			.setDesc('Enable advanced features and settings.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settingsManager.settings.enableAdvancedMode)
				.onChange(async (value) => {
					this.plugin.settingsManager.settings.enableAdvancedMode = value;
					await this.plugin.settingsManager.saveSettings();
				}));
	}
}

// Export the settings tab and manager for use in the main plugin.
export { SampleSettingTab, PluginSettingsManager };
