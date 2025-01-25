import { __awaiter } from "tslib";
export default class PDFToolbarManager {
    constructor(containerEl) {
        this.containerEl = containerEl;
    }
    loadPdfFromViewer(pdfData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implémentation pour charger le PDF dans la vue
            this.containerEl.empty(); // Nettoie le conteneur
            this.containerEl.createEl("div", { text: "Chargement du PDF..." });
            // Utilise une bibliothèque comme PDF.js pour rendre le PDF ici.
        });
    }
    addTextOverlay() {
        // Crée une div pour représenter une zone de texte
        const textOverlay = this.containerEl.createEl("div", {
            cls: "pdf-text-overlay",
        });
        // Styles de base pour la zone de texte
        Object.assign(textOverlay.style, {
            position: "absolute",
            top: "100px",
            left: "100px",
            width: "150px",
            height: "50px",
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid #ccc",
            cursor: "move",
        });
        // Rendre la zone déplaçable (drag-and-drop)
        this.makeDraggable(textOverlay);
        // Ajouter un champ de saisie pour écrire
        const inputField = textOverlay.createEl("textarea", {
            cls: "pdf-text-input",
        });
        Object.assign(inputField.style, {
            width: "100%",
            height: "100%",
            border: "none",
            outline: "none",
            resize: "none",
            background: "transparent",
        });
        this.containerEl.appendChild(textOverlay);
    }
    makeDraggable(element) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        element.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.clientX - element.offsetLeft;
            startY = e.clientY - element.offsetTop;
            element.style.zIndex = "1000";
        });
        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                element.style.left = `${e.clientX - startX}px`;
                element.style.top = `${e.clientY - startY}px`;
            }
        });
        document.addEventListener("mouseup", () => {
            isDragging = false;
            element.style.zIndex = "auto";
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGRmTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBkZk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sQ0FBQyxPQUFPLE9BQU8sVUFBVTtJQUc5QixZQUFZLFdBQXdCO1FBQ25DLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2hDLENBQUM7SUFFSyxpQkFBaUIsQ0FBQyxPQUFvQjs7WUFDM0MsaURBQWlEO1lBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyx1QkFBdUI7WUFDakQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLENBQUMsQ0FBQztZQUNuRSxnRUFBZ0U7UUFDakUsQ0FBQztLQUFBO0lBRUQsY0FBYztRQUNiLGtEQUFrRDtRQUNsRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7WUFDcEQsR0FBRyxFQUFFLGtCQUFrQjtTQUN2QixDQUFDLENBQUM7UUFFSCx1Q0FBdUM7UUFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFO1lBQ2hDLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLEdBQUcsRUFBRSxPQUFPO1lBQ1osSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsT0FBTztZQUNkLE1BQU0sRUFBRSxNQUFNO1lBQ2QsVUFBVSxFQUFFLDBCQUEwQjtZQUN0QyxNQUFNLEVBQUUsZ0JBQWdCO1lBQ3hCLE1BQU0sRUFBRSxNQUFNO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsNENBQTRDO1FBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFaEMseUNBQXlDO1FBQ3pDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO1lBQ25ELEdBQUcsRUFBRSxnQkFBZ0I7U0FDckIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFO1lBQy9CLEtBQUssRUFBRSxNQUFNO1lBQ2IsTUFBTSxFQUFFLE1BQU07WUFDZCxNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxNQUFNO1lBQ2YsTUFBTSxFQUFFLE1BQU07WUFDZCxVQUFVLEVBQUUsYUFBYTtTQUN6QixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsYUFBYSxDQUFDLE9BQW9CO1FBQ2pDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFZixPQUFPLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsVUFBVSxHQUFHLElBQUksQ0FBQztZQUNsQixNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ3hDLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzVDLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQztnQkFDL0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDO1lBQy9DLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDbkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGRmTWFuYWdlciB7XG5cdHByaXZhdGUgY29udGFpbmVyRWw6IEhUTUxFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCkge1xuXHRcdHRoaXMuY29udGFpbmVyRWwgPSBjb250YWluZXJFbDtcblx0fVxuXG5cdGFzeW5jIGxvYWRQZGZGcm9tVmlld2VyKHBkZkRhdGE6IEFycmF5QnVmZmVyKSB7XG5cdFx0Ly8gSW1wbMOpbWVudGF0aW9uIHBvdXIgY2hhcmdlciBsZSBQREYgZGFucyBsYSB2dWVcblx0XHR0aGlzLmNvbnRhaW5lckVsLmVtcHR5KCk7IC8vIE5ldHRvaWUgbGUgY29udGVuZXVyXG5cdFx0dGhpcy5jb250YWluZXJFbC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IFwiQ2hhcmdlbWVudCBkdSBQREYuLi5cIiB9KTtcblx0XHQvLyBVdGlsaXNlIHVuZSBiaWJsaW90aMOocXVlIGNvbW1lIFBERi5qcyBwb3VyIHJlbmRyZSBsZSBQREYgaWNpLlxuXHR9XG5cblx0YWRkVGV4dE92ZXJsYXkoKSB7XG5cdFx0Ly8gQ3LDqWUgdW5lIGRpdiBwb3VyIHJlcHLDqXNlbnRlciB1bmUgem9uZSBkZSB0ZXh0ZVxuXHRcdGNvbnN0IHRleHRPdmVybGF5ID0gdGhpcy5jb250YWluZXJFbC5jcmVhdGVFbChcImRpdlwiLCB7XG5cdFx0XHRjbHM6IFwicGRmLXRleHQtb3ZlcmxheVwiLFxuXHRcdH0pO1xuXG5cdFx0Ly8gU3R5bGVzIGRlIGJhc2UgcG91ciBsYSB6b25lIGRlIHRleHRlXG5cdFx0T2JqZWN0LmFzc2lnbih0ZXh0T3ZlcmxheS5zdHlsZSwge1xuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdHRvcDogXCIxMDBweFwiLFxuXHRcdFx0bGVmdDogXCIxMDBweFwiLFxuXHRcdFx0d2lkdGg6IFwiMTUwcHhcIixcblx0XHRcdGhlaWdodDogXCI1MHB4XCIsXG5cdFx0XHRiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC44KVwiLFxuXHRcdFx0Ym9yZGVyOiBcIjFweCBzb2xpZCAjY2NjXCIsXG5cdFx0XHRjdXJzb3I6IFwibW92ZVwiLFxuXHRcdH0pO1xuXG5cdFx0Ly8gUmVuZHJlIGxhIHpvbmUgZMOpcGxhw6dhYmxlIChkcmFnLWFuZC1kcm9wKVxuXHRcdHRoaXMubWFrZURyYWdnYWJsZSh0ZXh0T3ZlcmxheSk7XG5cblx0XHQvLyBBam91dGVyIHVuIGNoYW1wIGRlIHNhaXNpZSBwb3VyIMOpY3JpcmVcblx0XHRjb25zdCBpbnB1dEZpZWxkID0gdGV4dE92ZXJsYXkuY3JlYXRlRWwoXCJ0ZXh0YXJlYVwiLCB7XG5cdFx0XHRjbHM6IFwicGRmLXRleHQtaW5wdXRcIixcblx0XHR9KTtcblxuXHRcdE9iamVjdC5hc3NpZ24oaW5wdXRGaWVsZC5zdHlsZSwge1xuXHRcdFx0d2lkdGg6IFwiMTAwJVwiLFxuXHRcdFx0aGVpZ2h0OiBcIjEwMCVcIixcblx0XHRcdGJvcmRlcjogXCJub25lXCIsXG5cdFx0XHRvdXRsaW5lOiBcIm5vbmVcIixcblx0XHRcdHJlc2l6ZTogXCJub25lXCIsXG5cdFx0XHRiYWNrZ3JvdW5kOiBcInRyYW5zcGFyZW50XCIsXG5cdFx0fSk7XG5cblx0XHR0aGlzLmNvbnRhaW5lckVsLmFwcGVuZENoaWxkKHRleHRPdmVybGF5KTtcblx0fVxuXG5cdG1ha2VEcmFnZ2FibGUoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcblx0XHRsZXQgaXNEcmFnZ2luZyA9IGZhbHNlO1xuXHRcdGxldCBzdGFydFggPSAwO1xuXHRcdGxldCBzdGFydFkgPSAwO1xuXG5cdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlKSA9PiB7XG5cdFx0XHRpc0RyYWdnaW5nID0gdHJ1ZTtcblx0XHRcdHN0YXJ0WCA9IGUuY2xpZW50WCAtIGVsZW1lbnQub2Zmc2V0TGVmdDtcblx0XHRcdHN0YXJ0WSA9IGUuY2xpZW50WSAtIGVsZW1lbnQub2Zmc2V0VG9wO1xuXHRcdFx0ZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIjEwMDBcIjtcblx0XHR9KTtcblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGUpID0+IHtcblx0XHRcdGlmIChpc0RyYWdnaW5nKSB7XG5cdFx0XHRcdGVsZW1lbnQuc3R5bGUubGVmdCA9IGAke2UuY2xpZW50WCAtIHN0YXJ0WH1weGA7XG5cdFx0XHRcdGVsZW1lbnQuc3R5bGUudG9wID0gYCR7ZS5jbGllbnRZIC0gc3RhcnRZfXB4YDtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsICgpID0+IHtcblx0XHRcdGlzRHJhZ2dpbmcgPSBmYWxzZTtcblx0XHRcdGVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCJhdXRvXCI7XG5cdFx0fSk7XG5cdH1cbn1cbiJdfQ==
