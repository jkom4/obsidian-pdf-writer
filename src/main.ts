import {App, Plugin, PluginSettingTab, Setting, Notice, TFile, FileView} from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log("Plugin PDF chargé.");
		this.registerEvent(
			this.app.workspace.on("file-open", (file: TFile | null) => {
				if (file && file.extension === "pdf") {
					console.log("PDF ouvert :", file.name);
					this.addToolbarToViewer();
				}
			})
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}
	addToolbarToViewer() {
		const activeLeaf = this.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("Aucun fichier actif ou non pris en charge.");
			return;
		}

		const container = activeLeaf.containerEl;

		// Cible la barre d'outils existante
		const defaultToolbar = container.querySelector(".pdf-toolbar");

		if (!defaultToolbar) {
			console.warn("Barre d'outils par défaut introuvable.");
			return;
		}

		// Ajoute un bouton à la barre d'outils existante
		const newButton = defaultToolbar.createEl("button", {
			text: "Ajouter une zone de texte",
			cls: "custom-toolbar-button",
		});

		newButton.addEventListener("click", () => {
			console.log("Ajout d'une zone de texte...");
			this.addTextZone();
		});

		console.log("Bouton ajouté à la barre d'outils par défaut.");
	}

	addTextZone() {
		const activeLeaf = this.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("Aucun fichier actif ou non pris en charge.");
			return;
		}

		const container = activeLeaf.containerEl;
		const overlay = container.createDiv({ cls: "text-overlay", text: "Texte ici" });

		// Style de la zone de texte
		overlay.setAttr("contenteditable", "true");
		overlay.style.position = "absolute";
		overlay.style.top = "50px";
		overlay.style.left = "50px";
		overlay.style.padding = "5px";
		overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
		overlay.style.border = "1px solid #ccc";

		//Controler la position du textarea
		overlay.addEventListener("mousedown", (event) => {
			let isDragging = true;
			const offsetX = event.offsetX;
			const offsetY = event.offsetY;

			const onMouseMove = (e: MouseEvent) => {
				if (!isDragging) return;
				overlay.style.left = `${e.pageX - offsetX}px`;
				overlay.style.top = `${e.pageY - offsetY}px`;
			};

			const onMouseUp = () => {
				isDragging = false;
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		});

		console.log("Zone de texte ajoutée.");
	}



	onunload() {
		console.log("Plugin déchargé.");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
