import { FileView } from 'obsidian';
import MyPlugin from "../main";
/**
 * Manages text zones added to the PDF.
 */
export default class TextZoneManager {
	plugin: MyPlugin;

	constructor(plugin: MyPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Adds a new text zone to the PDF.
	 * @param fontSize - The font size of the text zone.
	 * @param fontFamily - The font family of the text zone.
	 * @param color - The text color of the text zone.
	 */
	addTextZone(fontSize: string, fontFamily: string, color: string) {
		const activeLeaf = this.plugin.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("No active or supported file view.");
			return;
		}

		const container = activeLeaf.containerEl.querySelector(".page");
		if (!container) {
			console.warn("No active or supported file view.");
			return;
		}
		// Create the text zone (editable div)
		const overlay = container.createDiv({ cls: "text-overlay", text: "Text here" });

		// Create the delete button
		const deleteButton = document.createElement("button");
		deleteButton.innerHTML = "&#128465;"; // Bin icon
		deleteButton.classList.add("delete-button");
		deleteButton.style.display = "none";  // Hidden by default
		deleteButton.contentEditable="false"

		// Append the delete button to the text zone
		overlay.appendChild(deleteButton);

		// Set initial styles for the text zone
		overlay.setAttr("contenteditable", "true");
		overlay.style.position = "absolute";
		overlay.style.top = "50%";
		overlay.style.left = "50%";
		overlay.style.padding = "5px";
		overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
		overlay.style.border = "2px dashed #0078d7"; // Initial dotted border
		overlay.style.borderRadius = "4px"; // Rounded corners
		overlay.style.cursor = "move";

		// Apply custom font styles
		overlay.style.fontSize = fontSize || this.plugin.settingsManager.settings.defaultFontSize || "14px";
		overlay.style.fontFamily = fontFamily || this.plugin.settingsManager.settings.defaultFontFamily || "Arial";
		overlay.style.color = color || this.plugin.settingsManager.settings.defaultTextColor || "black";

		// Event listeners for dragging and editing
		overlay.addEventListener("mousedown", (event) => this.handleDrag(event, overlay, container));
		overlay.addEventListener("dblclick", () => this.enableTextEditing(overlay));
		overlay.addEventListener("dblclick", () => deleteButton.style.display = "block");
		overlay.addEventListener("mouseleave", () => deleteButton.style.display = "none");

		// Delete button functionality
		deleteButton.addEventListener("click", (event) => {
			event.stopPropagation(); // Prevent triggering other events
			overlay.remove();
		});



		// Ajouter un événement global pour détecter les clics dans le document
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			// Vérifier si le clic est en dehors de la zone de texte et de la barre d'outils
			if (!overlay.contains(target) && !target.closest(".pdf-toolbar")) {
				this.finalizeTextZone(overlay);
			}
		};

		document.addEventListener("click", handleClickOutside);
	}

	/**
	 * Handles dragging of the text zone.
	 */
	handleDrag(event: MouseEvent, overlay: HTMLDivElement, container: Element) {
		if ((event.target as HTMLElement).isContentEditable) return;

		event.preventDefault();
		let isDragging = true;
		const rect = overlay.getBoundingClientRect();
		const offsetX = event.clientX - rect.left;
		const offsetY = event.clientY - rect.top;

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			const containerRect = container.getBoundingClientRect();
			const newX = e.clientX - containerRect.left - offsetX;
			const newY = e.clientY - containerRect.top - offsetY;

			overlay.style.left = `${newX}px`;
			overlay.style.top = `${newY}px`;
		};

		const onMouseUp = () => {
			isDragging = false;
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	}

	/**
	 * Enables editing of the text zone.
	 */
	enableTextEditing(overlay: HTMLDivElement) {
		overlay.setAttr("contenteditable", "true");
		overlay.style.border = "2px dashed #0078d7"; // Add dotted border on double click
		overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
		overlay.focus();
	}

	/**
	 * Finalizes the text zone by removing the border and disabling editing.
	 */
	finalizeTextZone(overlay: HTMLDivElement) {
		const textContent = overlay.innerText.trim();

		if (!textContent) {
			overlay.remove();
			return;
		}

		overlay.setAttr("contenteditable", "false");
		overlay.style.border = "none"; // Remove border on click outside
		overlay.style.backgroundColor = "transparent";
		overlay.style.padding = "0";
		overlay.style.cursor = "default";
	}

	/**
	 * Applies the selected style (fontSize, fontFamily, or color) to the currently selected text.
	 */
	applyStyleToSelection(styleType: string, value: string) {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) {
			console.warn("No text selected.");
			return;
		}

		const range = selection.getRangeAt(0);

		// Create a span to wrap the selected text with the style
		const span = document.createElement("span");
		if (styleType === "fontSize") {
			span.style.fontSize = value;
		} else if (styleType === "fontFamily") {
			span.style.fontFamily = value;
		} else if (styleType === "color") {
			span.style.color = value;
		}

		// Wrap the selected text with the styled span
		range.surroundContents(span);
	}

}
