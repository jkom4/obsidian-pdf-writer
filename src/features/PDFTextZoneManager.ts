import { FileView } from 'obsidian';
import PDFWriter from "../main";
import {getFontFamilyClass, getFontSizeClass} from "../utils/Styles";

/**
 * Manages text zones added to the PDF.
 */
export default class PDFTextZoneManager {
	plugin: PDFWriter;

	constructor(plugin: PDFWriter) {
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
		const deleteButton = createEl("button", { text: "🗑️", cls: "delete-button pdf-delete-button-hidden" });
		deleteButton.contentEditable = "false";

		// Append the delete button to the text zone
		overlay.appendChild(deleteButton);

		// Apply default styles
		const fontSizeClass = getFontSizeClass(fontSize || this.plugin.settingsManager.settings.defaultFontSize || "14px");
		const fontFamilyClass = getFontFamilyClass(fontFamily || this.plugin.settingsManager.settings.defaultFontFamily || "Arial");

		overlay.classList.add(fontSizeClass, fontFamilyClass);
		// Appliquer la couleur dynamiquement en utilisant une variable CSS
		const textColor = color || this.plugin.settingsManager.settings.defaultTextColor || "#000000";
		overlay.style.setProperty("--pdf-text-color", textColor);

		// Event listeners for dragging and editing
		overlay.addEventListener("mousedown", (event) => this.handleDrag(event, overlay, container));
		overlay.addEventListener("dblclick", () => this.enableTextEditing(overlay));
		overlay.addEventListener("dblclick", () => deleteButton.classList.remove("pdf-delete-button-hidden"));
		overlay.addEventListener("mouseleave", () => deleteButton.classList.add("pdf-delete-button-hidden"));

		// Delete button functionality
		deleteButton.addEventListener("click", (event) => {
			event.stopPropagation(); // Prevent triggering other events
			overlay.remove();
		});

		// Global click event to finalize the text zone
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			// Check if the click is outside the text zone and toolbar
			if (!overlay.contains(target) && !target.closest(".pdf-toolbar")) {
				this.finalizeTextZone(overlay);
			}
		};

		document.addEventListener("click", handleClickOutside);

		// Clean up the event listener when the plugin is unloaded
		this.plugin.register(() => {
			document.removeEventListener("click", handleClickOutside);
		});
	}

	/**
	 * Handles dragging of the text zone.
	 */
	handleDrag(event: MouseEvent, overlay: HTMLDivElement, container: Element) {
		if ((event.target as HTMLElement).isContentEditable) return;

		//event.preventDefault();
		let isDragging = true;
		const rect = overlay.getBoundingClientRect();
		const offsetX = event.clientX - rect.left;
		const offsetY = event.clientY - rect.top;

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			const containerRect = container.getBoundingClientRect();
			const newX = e.clientX - containerRect.left - offsetX;
			const newY = e.clientY - containerRect.top - offsetY;

			overlay.style.setProperty("--pdf-overlay-left", `${newX}px`);
			overlay.style.setProperty("--pdf-overlay-top", `${newY}px`);
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
		overlay.classList.remove("pdf-text-overlay-finalize-editing");
		overlay.classList.add("pdf-text-overlay-editing");
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
		overlay.classList.add("pdf-text-overlay-finalize-editing");
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
		const span = createEl("span");
		if (styleType === "fontSize") {
			span.classList.add(`pdf-text-overlay-font-size-${parseInt(value, 14)}`);
		} else if (styleType === "fontFamily") {
			span.classList.add(`pdf-text-overlay-font-family-${value.toLowerCase().replace(/ /g, "-")}`);
		} else if (styleType === "color") {
			span.style.setProperty("--pdf-text-color", value);
			span.classList.add("pdf-text-color-modified");
		}

		// Wrap the selected text with the styled span
		range.surroundContents(span);
	}
}
