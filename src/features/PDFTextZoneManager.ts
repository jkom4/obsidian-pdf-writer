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
	 * Wait for the next click on a PDF page to place a text zone.
	 */
	waitForClickToAddTextZone(fontSize?: string, fontFamily?: string, color?: string, pageIndex?: number, text?: string) {
		console.log("Placement mode: click on the PDF to place the text zone.");
		const hint = document.createElement("div");
		hint.textContent = " click on the PDF to place the text zone";
		hint.className = "pdf-writer-placement-hint";
		document.body.appendChild(hint);

		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const page = target.closest(".page") as HTMLElement | null;

			if (!page) {
				console.warn("Click not on a PDF page, ignoring.");
				return;
			}

			// calcul relative position in page
			const rect = page.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			this.addTextZone(fontSize, fontFamily, color, Array.from(page.parentElement?.children || []).indexOf(page), { x, y }, text);

			// cleanup
			document.removeEventListener("click", handleClick, true);
			hint.remove();
			document.body.style.cursor = "default";
		};

		document.addEventListener("click", handleClick, true);
		document.body.style.cursor = "crosshair";
	}


	/* -----------------------
   Helpers : attach target / normalization
   ----------------------- */
	findAttachTarget(page: HTMLElement): HTMLElement {
		const media = page.querySelector('canvas, img, svg');
		if (media && media.parentElement) {
			return media.parentElement as HTMLElement;
		}

		const all = Array.from(page.querySelectorAll<HTMLElement>('*'));
		for (const el of all) {
			const cs = window.getComputedStyle(el);
			if (cs.transform && cs.transform !== 'none') return el;
		}


		return page;
	}
	/* -----------------------
	   Observers : reattach when PDF.js re-render
	   ----------------------- */
	observePageRender(page: HTMLElement) {
		if ((page as any).__pdfWriterRenderObserverAttached) return;

		const mo = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === "childList") {
					// when PDF.js re-renders, it often replaces the canvas element
					this.reattachOverlays(page);
					break;
				}
			}
		});

		mo.observe(page, { childList: true, subtree: true });

		// cleanup
		this.plugin.register(() => mo.disconnect());
		(page as any).__pdfWriterRenderObserverAttached = true;
	}





	addTextZone(fontSize?: string, fontFamily?: string, color?: string, pageIndex?: number, position?: { x: number; y: number }, text?: string) {
		const activeLeaf = this.plugin.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("No active or supported file view.");
			return;
		}

		const pages = activeLeaf.containerEl.querySelectorAll(".page");
		if (!pages.length) {
			console.warn("No pages found in the active file view.");
			return;
		}

		let activePage: HTMLElement | undefined;
		let closestToCenter = Infinity;
		if (pageIndex !== undefined && pageIndex >= 0 && pageIndex < pages.length) {
			activePage = pages[pageIndex] as HTMLElement;
		} else {
			pages.forEach((page) => {
				const rect = page.getBoundingClientRect();
				const pageCenter = (rect.top + rect.bottom) / 2;
				const viewportCenter = window.innerHeight / 2;

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

		// find the element that actually gets scaled / contains the canvas
		const attachTarget = this.findAttachTarget(activePage);

		// create DOM node (native, plus compatible avec marshalling)
		const overlay = document.createElement("div");
		overlay.classList.add("pdf-writer-text-overlay");
		if (text) {
			text.split("\n").forEach((line, index) => {
				if (index > 0) overlay.appendChild(document.createElement("br"));
				overlay.appendChild(document.createTextNode(line));
			});
		} else {
			overlay.setAttribute("data-placeholder", "Text here");
			overlay.classList.add("pdf-writer-text-overlay-empty");
		}
		overlay.setAttribute("contenteditable", "false");

		// delete button
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "🗑️";
		deleteButton.className = "pdf-writer-delete-button pdf-writer-delete-button-hidden";
		deleteButton.contentEditable = "false";
		overlay.appendChild(deleteButton);

		// Styles classes
		const fontSizeClass = getFontSizeClass(fontSize || this.plugin.settingsManager.settings.defaultFontSize || "14px");
		const fontFamilyClass = getFontFamilyClass(fontFamily || this.plugin.settingsManager.settings.defaultFontFamily || "Arial");
		overlay.classList.add(fontSizeClass, fontFamilyClass);

		// Color
		const textColor = color || this.plugin.settingsManager.settings.defaultTextColor || "#000000";
		overlay.style.setProperty("--pdf-text-color", textColor);

		// position normalization:
		// If position provided, try to interpret it: if coordinates are <=1 we treat them as normalized already,
		// otherwise treat them as pixels and convert to normalized based on current attachTarget size.
		const rect = attachTarget.getBoundingClientRect();
		let baseX = 0, baseY = 0;
		if (position) {
			if (position.x <= 1 && position.y <= 1) {
				baseX = position.x;
				baseY = position.y;
			} else {
				baseX = position.x / rect.width;
				baseY = position.y / rect.height;
			}
		} else {
			// default: center-ish
			baseX = 0.1;
			baseY = 0.1;
		}

		overlay.dataset.baseX = baseX.toString();
		overlay.dataset.baseY = baseY.toString();
		// pixel position based on attachTarget current size
		overlay.style.left = `${baseX * rect.width}px`;
		overlay.style.top = `${baseY * rect.height}px`;
		overlay.style.position = "absolute";
		overlay.style.transformOrigin = "top left";

		// append to the attach target (so it follows PDF.js transforms)
		attachTarget.appendChild(overlay);

		// events
		overlay.addEventListener("mousedown", (event) => this.handleDrag(event, overlay, activePage!, attachTarget));
		overlay.addEventListener("dblclick", () => {
			overlay.setAttribute("contenteditable", "true");
			overlay.classList.remove("pdf-writer-text-overlay-finalize-editing");
			overlay.classList.add("pdf-writer-text-overlay-editing");
			overlay.focus();
			deleteButton.classList.remove("pdf-writer-delete-button-hidden");
		});
		overlay.addEventListener("mouseleave", () => deleteButton.classList.add("pdf-writer-delete-button-hidden"));

		deleteButton.addEventListener("click", (event) => {
			event.stopPropagation();
			overlay.remove();
		});

		// finalize on outside click
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!overlay.contains(target) && !target.closest(".pdf-toolbar")) {
				this.finalizeTextZone(overlay);
			}
		};
		document.addEventListener("click", handleClickOutside);
		this.plugin.register(() => document.removeEventListener("click", handleClickOutside));

		// observe page render changes so overlays get reattached if PDF.js re-creates the canvas
		this.observePageRender(activePage);


		// after attachTarget.appendChild(overlay);
		this.makeTextZoneDraggable ? this.makeTextZoneDraggable(overlay, attachTarget) : overlay.addEventListener("mousedown", (e) => this.handleDrag(e, overlay, activePage!, attachTarget));


	}


	/**
	 *  This function is a wrapper around handleDrag to avoid stacking multiple listeners on the same element.
	 *  It sets up the necessary event listeners for dragging the text zone and ensures that only one set of listeners is active at a time.
	 *
	 */
	makeTextZoneDraggable(overlay: HTMLElement, container: HTMLElement) {
		let isDragging = false;
		let startX = 0;
		let startY = 0;
		let initialLeft = 0;
		let initialTop = 0;

		const onMouseDown = (event: MouseEvent) => {
			if ((event.target as HTMLElement).isContentEditable) return;

			isDragging = true;
			startX = event.clientX;
			startY = event.clientY;


			initialLeft = parseFloat(overlay.style.getPropertyValue("--pdf-overlay-left") || "0");
			initialTop = parseFloat(overlay.style.getPropertyValue("--pdf-overlay-top") || "0");

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
			event.preventDefault();
		};

		const onMouseMove = (event: MouseEvent) => {
			if (!isDragging) return;

			const dx = event.clientX - startX;
			const dy = event.clientY - startY;

			const newLeft = initialLeft + dx;
			const newTop = initialTop + dy;


			overlay.style.setProperty("--pdf-overlay-left", `${newLeft}px`);
			overlay.style.setProperty("--pdf-overlay-top", `${newTop}px`);
		};

		const onMouseUp = () => {
			if (!isDragging) return;
			isDragging = false;

			const newX = parseFloat(overlay.style.getPropertyValue("--pdf-overlay-left"));
			const newY = parseFloat(overlay.style.getPropertyValue("--pdf-overlay-top"));

			overlay.dataset.x = newX.toString();
			overlay.dataset.y = newY.toString();

			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};

		overlay.addEventListener("mousedown", onMouseDown);
		this.plugin.register(() => overlay.removeEventListener("mousedown", onMouseDown));
	}



	updateOverlayPositionFromNormalized(overlay: HTMLElement, attachTarget: HTMLElement) {
		const baseX = parseFloat(overlay.dataset.baseX || "0");
		const baseY = parseFloat(overlay.dataset.baseY || "0");
		const rect = attachTarget.getBoundingClientRect();
		const px = baseX * rect.width;
		const py = baseY * rect.height;

		overlay.style.left = `${px}px`;
		overlay.style.top = `${py}px`;
		overlay.style.position = "absolute";
		overlay.style.transformOrigin = "top left";


		overlay.dataset._lastPixelLeft = px.toString();
		overlay.dataset._lastPixelTop = py.toString();
	}


	handleDrag(event: MouseEvent, overlay: HTMLElement, page: HTMLElement, attachTarget: HTMLElement) {

		if ((event.target as HTMLElement).isContentEditable) return;
		event.preventDefault();

		let isDragging = true;


		const parentRect = attachTarget.getBoundingClientRect();
		const startRect = overlay.getBoundingClientRect();

		const offsetX = event.clientX - startRect.left;
		const offsetY = event.clientY - startRect.top;

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;


			const newX = e.clientX - parentRect.left - offsetX;
			const newY = e.clientY - parentRect.top - offsetY;


			overlay.style.left = `${newX}px`;
			overlay.style.top = `${newY}px`;


			overlay.dataset.baseX = (newX / parentRect.width).toString();
			overlay.dataset.baseY = (newY / parentRect.height).toString();
		};

		const onMouseUp = () => {
			if (!isDragging) return;
			isDragging = false;

			const updatedParentRect = attachTarget.getBoundingClientRect();
			const left = parseFloat(overlay.style.left || "0");
			const top = parseFloat(overlay.style.top || "0");
			overlay.dataset.baseX = (left / updatedParentRect.width).toString();
			overlay.dataset.baseY = (top / updatedParentRect.height).toString();

			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);


		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	}


	reattachOverlays(page: HTMLElement) {
		const attachTarget = this.findAttachTarget(page);
		const overlays = page.querySelectorAll<HTMLElement>(".pdf-writer-text-overlay");

		overlays.forEach((overlay) => {
			if (overlay.parentElement !== attachTarget) {
				attachTarget.appendChild(overlay);
			}
			this.updateOverlayPositionFromNormalized(overlay, attachTarget);
		});
	}

	/**
	 * Rescales all annotations on a given page when zoom changes.
	 * Maintenant on recalcule la position en pixels depuis baseX/baseY.
	 */
	rescaleAnnotations(page: HTMLElement) {
		const attachTarget = this.findAttachTarget(page);
		const overlays = page.querySelectorAll<HTMLElement>(".pdf-writer-text-overlay");

		overlays.forEach((overlay) => {
			this.updateOverlayPositionFromNormalized(overlay, attachTarget);


		});
	}


	async loadAnnotations() {
		const activeLeaf = this.plugin.app.workspace.getActiveViewOfType(FileView);
		if (!activeLeaf) {
			console.warn("No active or supported file view.");
			return;
		}

		const annotationFile = `${this.plugin.file.path}.annotations.json`;

		let annotations: any[] = [];
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

		const pages = activeLeaf.containerEl.querySelectorAll(".page");
		if (!pages.length) return;

		for (const annotation of annotations) {
			// valide minimal
			if (!annotation.position || annotation.pageIndex === undefined) {
				console.warn("Annotation invalide :", annotation);
				continue;
			}

			// wait a bit to ensure page is rendered (surtout si PDF.js charge)
			setTimeout(() => {
				const pageEl = pages[annotation.pageIndex] as HTMLElement;
				if (!pageEl) {
					console.warn("Page index not found for annotation:", annotation);
					return;
				}
				const attachTarget = this.findAttachTarget(pageEl);
				const rect = attachTarget.getBoundingClientRect();

				let baseX = 0, baseY = 0;
				// backward compatibility: si les coords sont <=1 -> normalisées; sinon -> pixels -> on normalise
				if (annotation.position.x <= 1 && annotation.position.y <= 1) {
					baseX = annotation.position.x;
					baseY = annotation.position.y;
				} else {
					baseX = annotation.position.x / rect.width;
					baseY = annotation.position.y / rect.height;
				}

				// compute pixels for current render
				const px = baseX * rect.width;
				const py = baseY * rect.height;

				// create the overlay on the right page
				this.addTextZone(
					annotation.fontSize,
					annotation.fontFamily,
					annotation.color,
					annotation.pageIndex,
					{ x: px, y: py },
					annotation.text
				);
			}, 150);
		}
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




}
