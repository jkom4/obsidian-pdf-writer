import MyPlugin from "../main";

export class KeyboardCommand {
	private plugin: MyPlugin;

	constructor(plugin: MyPlugin) {
		this.plugin = plugin;
		this.registerKeyCommands();
	}


	// Register all keyboard commands
	private registerKeyCommands(): void {
		// Gérer la sélection de la zone de texte
		let selectedTextArea: Element | null = null;

		document.addEventListener("keydown", (event) => {

			document.querySelectorAll(".text-overlay").forEach((textarea) => {
				textarea.addEventListener("focus", () => {
					selectedTextArea = textarea;
				});

				textarea.addEventListener("blur", () => {
					selectedTextArea = null;
				});
			});

			if (selectedTextArea && event.key === "Delete") {
				event.stopPropagation(); // Prevent triggering other events
				selectedTextArea.remove();
			}
		});

	}
}
