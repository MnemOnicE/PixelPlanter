export class CanvasInput {
    #container;
    #planter;
    #onStroke;
    #onFill;
    #isBrushing = false;
    #activeTool = 'brush';
    #activeBrushSize = 1;
    #activeSymmetryMode = 'none';

    constructor(planter, container, onStroke, onFill) {
        this.#planter = planter;
        this.#container = container;
        this.#onStroke = onStroke;
        this.#onFill = onFill;
        this.#attachEventListeners();
    }

    setTool(tool) {
        this.#activeTool = tool;
    }

    setBrushSize(size) {
        this.#activeBrushSize = size;
    }

    setSymmetryMode(mode) {
        this.#activeSymmetryMode = mode;
    }

    #attachEventListeners() {
        this.#container.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.#container.setPointerCapture(e.pointerId);
            if (this.#activeTool === 'fill') {
                this.#handleFloodFill(e);
            } else {
                this.#isBrushing = true;
                this.#handleBrushStroke(e);
            }
        });
        this.#container.addEventListener('pointermove', (e) => {
            if (this.#isBrushing) {
                e.preventDefault();
                this.#handleBrushStroke(e);
            }
        });
        this.#container.addEventListener('pointerup', (e) => {
            this.#isBrushing = false;
            this.#container.releasePointerCapture(e.pointerId);
            // Trigger a callback to save state after stroke is done?
            // Currently UIManager saves state after every stroke point (which is expensive but simple)
            // Or maybe after every generate.
            // The original code called generate() and saveState() inside handleBrushStroke.
        });
        this.#container.addEventListener('pointerleave', () => (this.#isBrushing = false));
    }

    #handleBrushStroke(event) {
        // We need to calculate points and pass them to the callback
        // The callback (UIManager) knows the active layer and handles the actual drawing call to Planter.
        // Wait, the original code called planterInstance.drawOnLayer directly.
        // It's better if this class calculates the grid coordinates and the UIManager executes the logic.

        const canvas = this.#planter.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;

        // We need access to layer config (pixelSize, size) to map to grid.
        // But we don't know the active layer here.
        // We can ask the UIManager via the callback.

        this.#onStroke({
            x: canvasX,
            y: canvasY,
            brushSize: this.#activeBrushSize,
            tool: this.#activeTool,
            symmetry: this.#activeSymmetryMode
        });
    }

    #handleFloodFill(event) {
        const canvas = this.#planter.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;

        this.#onFill({
            x: canvasX,
            y: canvasY
        });
    }
}
