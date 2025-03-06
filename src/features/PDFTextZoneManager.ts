import {FileView} from 'obsidian';
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
	 * @param position
	 * @param text
	 */
	addTextZone(fontSize?: string, fontFamily?: string, color?: string, pageIndex?: number, position?: {
		x: number;
		y: number
	}, text?: string) {
		const activeLeaf = this.plugin.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("No active or supported file view.");
			return;
		}

		// Get all pages
		const pages = activeLeaf.containerEl.querySelectorAll(".page");

		if (!pages.length) {
			console.warn("No pages found in the active file view.");
			return;
		}

		let activePage: HTMLElement;

		let closestToCenter = Infinity;
		if (pageIndex !== undefined && pageIndex >= 0 && pageIndex < pages.length) {
			activePage = pages[pageIndex] as HTMLElement;
		} else {
			pages.forEach((page) => {
				const rect = page.getBoundingClientRect();
				const pageCenter = (rect.top + rect.bottom) / 2;
				const viewportCenter = window.innerHeight / 2;

				// verify active page
				if (rect.top < window.innerHeight && rect.bottom > 0) {
					const distanceToCenter = Math.abs(pageCenter - viewportCenter);

					if (distanceToCenter < closestToCenter) {
						activePage = page as HTMLElement;
						closestToCenter = distanceToCenter;
					}
				}
			});
		}
		// @ts-ignore
		if (!activePage) {
			console.warn("No active page detected.");
			return;
		}

		// Create the text zone (editable div)
		const overlay = activePage.createDiv({cls: "pdf-writer-text-overlay", text: text || "Text here"});

		// Create the delete button
		const deleteButton = createEl("button", {
			text: "🗑️",
			cls: "pdf-writer-delete-button pdf-writer-delete-button-hidden"
		});
		deleteButton.contentEditable = "false";

		// Append the delete button to the text zone
		overlay.appendChild(deleteButton);

		// Apply default styles
		const fontSizeClass = getFontSizeClass(fontSize || this.plugin.settingsManager.settings.defaultFontSize || "14px");
		const fontFamilyClass = getFontFamilyClass(fontFamily || this.plugin.settingsManager.settings.defaultFontFamily || "Arial");

		overlay.classList.add(fontSizeClass, fontFamilyClass);
		// Apply color with CSS variables
		const textColor = color || this.plugin.settingsManager.settings.defaultTextColor || "#000000";
		overlay.style.setProperty("--pdf-text-color", textColor);

		// Restore position if exist
		if (position) {
			overlay.style.setProperty("--pdf-overlay-left", `${position.x}px`);
			overlay.style.setProperty("--pdf-overlay-top", `${position.y}px`);
		}

		// Event listeners for dragging and editing
		overlay.addEventListener("mousedown", (event) => this.handleDrag(event, overlay, activePage!));
		overlay.addEventListener("dblclick", () => this.enableTextEditing(overlay));
		overlay.addEventListener("dblclick", () => deleteButton.classList.remove("pdf-writer-delete-button-hidden"));
		overlay.addEventListener("mouseleave", () => deleteButton.classList.add("pdf-writer-delete-button-hidden"));


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
		overlay.classList.remove("pdf-writer-text-overlay-finalize-editing");
		overlay.classList.add("pdf-writer-text-overlay-editing");
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
		overlay.classList.add("pdf-writer-text-overlay-finalize-editing");
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
		let selectedNode = range.commonAncestorContainer as HTMLElement;

		// Get parent  (<span>)
		if (selectedNode.nodeType === Node.TEXT_NODE) {
			selectedNode = selectedNode.parentElement as HTMLElement;
		}

		if (selectedNode && selectedNode.tagName === "SPAN") {
			if (styleType === "fontSize") {
				selectedNode.classList.forEach((cls) => {
					if (cls.startsWith("pdf-text-overlay-font-size-")) {
						selectedNode.classList.remove(cls);
					}
				});
				selectedNode.classList.add(`pdf-text-overlay-font-size-${parseInt(value, 10)}`);
			} else if (styleType === "fontFamily") {
				selectedNode.classList.forEach((cls) => {
					if (cls.startsWith("pdf-text-overlay-font-family-")) {
						selectedNode.classList.remove(cls);
					}
				});
				selectedNode.classList.add(`pdf-text-overlay-font-family-${value.toLowerCase().replace(/ /g, "-")}`);
			} else if (styleType === "color") {
				selectedNode.classList.forEach((cls) => {
					if (cls.startsWith("pdf-text-color-")) {
						selectedNode.classList.remove(cls);
					}
				});
				selectedNode.style.setProperty("--pdf-text-color", value);
				selectedNode.classList.add("pdf-text-color-modified");
			}
		} else {
			// create a <span> if necessary
			const span = document.createElement("span");


			if (styleType === "fontSize") {
				span.classList.add(`pdf-text-overlay-font-size-${parseInt(value, 10)}`);
			} else if (styleType === "fontFamily") {
				span.classList.add(`pdf-text-overlay-font-family-${value.toLowerCase().replace(/ /g, "-")}`);
			} else if (styleType === "color") {
				span.style.setProperty("--pdf-text-color", value);
				span.classList.add("pdf-text-color-modified");
			}


			span.appendChild(range.extractContents());
			range.insertNode(span);

			selection.removeAllRanges();
			const newRange = document.createRange();
			newRange.selectNodeContents(span);
			selection.addRange(newRange);
		}
	}


	async loadAnnotations() {
		const activeLeaf = this.plugin.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("No active or supported file view.");
			return;
		}

		const annotationFile = `${this.plugin.file.path}.annotations.json`;

		let annotations = [];
		try {
			const data = await this.plugin.app.vault.adapter.read(annotationFile);
			annotations = JSON.parse(data);
		} catch (e) {
			console.warn("Aucune annotation trouvée pour ce fichier.");
		}

		if (!annotations || annotations.length === 0) {
			console.warn("Aucune annotation valide trouvée.");
			return;
		}

		// On boucle sur les annotations récupérées et on les ajoute
		for (const annotation of annotations) {
			if (annotation.fontSize && annotation.fontFamily && annotation.color && annotation.position && annotation.text) {
				setTimeout(() => {
					this.addTextZone(
						annotation.fontSize,
						annotation.fontFamily,
						annotation.color,
						annotation.pageIndex,
						annotation.position,
						annotation.text
					);
				}, 100);
			} else {
				console.warn("Annotation invalide :", annotation);
			}
		}
	}
}
