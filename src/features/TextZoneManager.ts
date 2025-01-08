import { Plugin, FileView } from 'obsidian';

/**
 * Manages text zones added to the PDF.
 */
export default class TextZoneManager {
	plugin: Plugin;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	addTextZone() {
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

		overlay.addEventListener("mousedown", (event) => this.handleDrag(event, overlay, container));
		overlay.addEventListener("dblclick", () => this.enableTextEditing(overlay));
		overlay.addEventListener("blur", () => this.finalizeTextZone(overlay));

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
}
