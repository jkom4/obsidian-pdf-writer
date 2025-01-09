import { Plugin, FileView } from 'obsidian';

/**
 * Manages text zones added to the PDF.
 */
export default class TextZoneManager {
	plugin: Plugin;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	addTextZone(fontSize: string, fontFamily: string, color: string) {

		const activeLeaf = this.plugin.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("No active or supported file view.");
			return;
		}

		const container = activeLeaf.containerEl;
		const overlay = container.createDiv({ cls: "text-overlay", text: "Text here" });

		overlay.setAttr("contenteditable", "true");
		overlay.style.position = "absolute";
		overlay.style.top = "50%";
		overlay.style.left = "50%";
		overlay.style.padding = "5px";
		overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
		overlay.style.border = "1px solid #ccc";
		overlay.style.cursor = "move";


		// Apply custom styles
		overlay.style.fontSize = fontSize || "14px";
		overlay.style.fontFamily = fontFamily || "Arial";
		overlay.style.color = color || "black";

		overlay.addEventListener("mousedown", (event) => this.handleDrag(event, overlay, container));
		overlay.addEventListener("dblclick", () => this.enableTextEditing(overlay));
		//overlay.addEventListener("blur", () => this.finalizeTextZone(overlay));
		// Ajouter un événement global pour détecter les clics dans le document
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			// Vérifier si le clic est en dehors de la zone de texte et de la barre d'outils
			if (!overlay.contains(target) && !target.closest(".pdf-toolbar")) {
				console.log("ok")
				this.finalizeTextZone(overlay);

			}
		};

		document.addEventListener("click", handleClickOutside);
		console.log("Text zone added.");
	}

	handleDrag(event: MouseEvent, overlay: HTMLDivElement, container: HTMLElement) {
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

	enableTextEditing(overlay: HTMLDivElement) {
		overlay.setAttr("contenteditable", "true");
		overlay.style.border = "1px solid #000";
		overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
		overlay.focus();
	}

	finalizeTextZone(overlay: HTMLDivElement) {
		const textContent = overlay.innerText.trim();

		if (!textContent) {
			overlay.remove();
			console.log("Text zone removed as it was empty.");
			return;
		}

		overlay.setAttr("contenteditable", "false");
		overlay.style.backgroundColor = "transparent";
		overlay.style.border = "none";
		overlay.style.padding = "0";
		overlay.style.cursor = "default";

		console.log("Text zone finalized.");
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

		console.log(`Applied ${styleType}: ${value} to the selected text.`);
	}

}
