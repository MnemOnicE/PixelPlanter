import { Planter } from './Planter.js';
import { Pattern } from './patterns/Pattern.js';

const TOOLTIP_TEXTS = {
    'generator-select': 'The core algorithm used to create the pattern.',
    'seed-input': 'A number or string that determines the random pattern. The same seed will always produce the same image.',
    'palette-select': 'The set of colors used in the artwork.',
    'size-input': 'The number of cells in the grid (e.g., 32x32).',
    'pixel-size-input': 'The size of each \'pixel\' in the final image.',
    'modifiers-container': 'Optional effects that alter the generated image.'
};

// CLASS UIManager
// Manages the interaction between the HTML controls and the Planter instance.
export class UIManager {
    // PRIVATE PROPERTIES
    #planterInstance;
    #controls = {};
    #canvasContainer;
    #modifiersContainer;
    #generatorParamsContainer;
    #modifierParamsContainer;
    #patternEditorModal;
    #patternGridContainer;
    #currentCanvas;
    #currentSeed;
    #activeTool = 'generate'; // 'generate', 'stamp', 'brush'
    #isBrushing = false;

    // CONSTRUCTOR
    constructor(planter) {
        this.#planterInstance = planter;
        this.#bindDOM();
        this.#initializeUI();
        this.#attachEventListeners();
    }

    #bindDOM() {
        const C = this.#controls; // Shorthand
        C.generatorSelect = document.getElementById('generator-select');
        C.paletteSelect = document.getElementById('palette-select');
        C.sizeInput = document.getElementById('size-input');
        C.pixelSizeInput = document.getElementById('pixel-size-input');
        C.seedInput = document.getElementById('seed-input');
        C.generateBtn = document.getElementById('generate-btn');
        C.saveBtn = document.getElementById('save-btn');
        C.editPatternsBtn = document.getElementById('edit-patterns-btn');
        C.savePatternBtn = document.getElementById('save-pattern-btn');
        C.patternNameInput = document.getElementById('pattern-name-input');
        C.closePatternEditorBtn = document.querySelector('.close-button');
        C.stampToolBtn = document.getElementById('stamp-tool-btn');
        C.brushToolBtn = document.getElementById('brush-tool-btn');

        this.#canvasContainer = document.getElementById('canvas-container');
        this.#modifiersContainer = document.getElementById('modifiers-container');
        this.#generatorParamsContainer = document.getElementById('generator-params');
        this.#modifierParamsContainer = document.getElementById('modifier-params');
        this.#patternEditorModal = document.getElementById('pattern-editor-modal');
        this.#patternGridContainer = document.getElementById('pattern-grid-container');
    }

    #initializeUI() {
        this.#populateGeneratorOptions();
        this.#populatePaletteOptions();
        this.#populateModifierOptions();
        this.#addTooltips();
        this.#updateGeneratorParamsUI();
        this.#initializePatternEditorGrid();
        this.#setActiveTool('generate'); // Set initial tool
    }

    #attachEventListeners() {
        // Main controls
        this.#controls.generateBtn.addEventListener('click', () => {
            this.#setActiveTool('generate');
            this.handleGenerate();
        });
        this.#controls.saveBtn.addEventListener('click', () => this.handleSave());
        this.#controls.generatorSelect.addEventListener('change', () => this.#updateGeneratorParamsUI());
        this.#modifiersContainer.addEventListener('change', (e) => { if (e.target.type === 'checkbox') this.#updateModifierParamsUI(); });

        // Pattern Editor
        this.#controls.editPatternsBtn.addEventListener('click', () => this.#openPatternEditor());
        this.#controls.closePatternEditorBtn.addEventListener('click', () => this.#closePatternEditor());
        this.#controls.savePatternBtn.addEventListener('click', () => this.#handleSavePattern());
        window.addEventListener('click', (e) => { if (e.target === this.#patternEditorModal) this.#closePatternEditor(); });
        this.#patternGridContainer.addEventListener('click', (e) => { if (e.target.classList.contains('pattern-cell')) e.target.classList.toggle('active'); });

        // Canvas tools
        this.#controls.stampToolBtn.addEventListener('click', () => this.#setActiveTool('stamp'));
        this.#controls.brushToolBtn.addEventListener('click', () => this.#setActiveTool('brush'));
        this.#canvasContainer.addEventListener('mousedown', (e) => this.#handleCanvasMouseDown(e));
        this.#canvasContainer.addEventListener('mousemove', (e) => this.#handleCanvasMouseMove(e));
        this.#canvasContainer.addEventListener('mouseup', () => this.#isBrushing = false);
        this.#canvasContainer.addEventListener('mouseleave', () => this.#isBrushing = false);
    }

    // --- Tooling Methods ---

    #setActiveTool(toolName) {
        this.#activeTool = toolName;
        // Add visual feedback for active tool
        this.#controls.stampToolBtn.style.fontWeight = toolName === 'stamp' ? 'bold' : 'normal';
        this.#controls.brushToolBtn.style.fontWeight = toolName === 'brush' ? 'bold' : 'normal';
        this.#controls.generateBtn.style.fontWeight = toolName === 'generate' ? 'bold' : 'normal';
        this.#canvasContainer.style.cursor = (toolName === 'stamp' || toolName === 'brush') ? 'crosshair' : 'default';
    }

    #handleCanvasMouseDown(event) {
        if (this.#activeTool === 'stamp') {
            this.#handleStamp(event);
        } else if (this.#activeTool === 'brush') {
            this.#isBrushing = true;
            this.#handleStamp(event); // Stamp once on initial click
        }
    }

    #handleCanvasMouseMove(event) {
        if (this.#isBrushing) {
            this.#handleStamp(event);
        }
    }

    #handleStamp(event) {
        if (!this.#currentCanvas) {
            alert('Please generate an image first to define the canvas area.');
            return;
        }

        if (this.#controls.generatorSelect.value !== 'pattern') {
            alert("Please select the 'pattern' generator from the dropdown to use the Stamp/Brush tools.");
            this.#setActiveTool('generate');
            return;
        }

        const patternNameInput = this.#generatorParamsContainer.querySelector('select[data-param-name="patternName"]');
        const patternName = patternNameInput?.value;

        if (!patternName || this.#planterInstance.getPatternNames().length === 0) {
             alert("Please create and save a pattern first, then select it from the 'Pattern' dropdown.");
             return;
        }

        const pattern = this.#planterInstance.getPattern(patternName);
        if (!pattern) {
            alert(`Pattern "${patternName}" not found!`);
            return;
        }

        const rect = this.#currentCanvas.getBoundingClientRect();
        const scaleX = this.#currentCanvas.width / rect.width;
        const scaleY = this.#currentCanvas.height / rect.height;
        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;

        const xPercent = (canvasX / this.#currentCanvas.width) * 100;
        const yPercent = (canvasY / this.#currentCanvas.height) * 100;

        this.#planterInstance.stamp(patternName, xPercent, yPercent);
    }

    // --- Pattern Editor Methods ---

    #openPatternEditor() { this.#patternEditorModal.style.display = 'block'; }
    #closePatternEditor() { this.#patternEditorModal.style.display = 'none'; }

    #initializePatternEditorGrid(size = 8) {
        this.#patternGridContainer.innerHTML = '';
        this.#patternGridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('pattern-cell');
            this.#patternGridContainer.appendChild(cell);
        }
    }

    #handleSavePattern() {
        const name = this.#controls.patternNameInput.value.trim();
        if (!name) { alert('Please enter a name for the pattern.'); return; }

        const gridSize = Math.sqrt(this.#patternGridContainer.children.length);
        const dataGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        const cells = this.#patternGridContainer.children;
        for (let i = 0; i < cells.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            if (cells[i].classList.contains('active')) dataGrid[row][col] = 1;
        }
        const newPattern = new Pattern(name, dataGrid);
        this.#planterInstance.registerPattern(name, newPattern);
        alert(`Pattern "${name}" saved!`);
        this.#closePatternEditor();
        this.#updateGeneratorParamsUI(); // Refresh UI in case the pattern generator is selected
    }

    // --- Core UI Methods ---

    #addTooltips() {
        for (const controlId in TOOLTIP_TEXTS) {
            const controlElement = document.getElementById(controlId);
            if (!controlElement) continue;
            let label = (controlId === 'modifiers-container')
                ? controlElement.previousElementSibling
                : document.querySelector(`label[for="${controlId}"]`);
            if (label) {
                label.classList.add('tooltip');
                const tooltipText = document.createElement('span');
                tooltipText.classList.add('tooltip-text');
                tooltipText.textContent = TOOLTIP_TEXTS[controlId];
                label.appendChild(tooltipText);
            }
        }
    }

    #populateGeneratorOptions() {
        const generatorNames = this.#planterInstance.getGeneratorNames();
        this.#controls.generatorSelect.innerHTML = '';
        generatorNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            this.#controls.generatorSelect.appendChild(option);
        });
    }

    #populatePaletteOptions() {
        const paletteNames = this.#planterInstance.getPaletteNames();
        this.#controls.paletteSelect.innerHTML = '';
        paletteNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            this.#controls.paletteSelect.appendChild(option);
        });
    }

    #populateModifierOptions() {
        const modifierNames = this.#planterInstance.getModifierNames();
        this.#modifiersContainer.innerHTML = '';
        modifierNames.forEach(name => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `mod-${name}`;
            checkbox.dataset.modifierName = name;
            const label = document.createElement('label');
            label.htmlFor = `mod-${name}`;
            label.textContent = name;
            div.appendChild(checkbox);
            div.appendChild(label);
            this.#modifiersContainer.appendChild(div);
        });
    }

    #updateGeneratorParamsUI() {
        const generatorName = this.#controls.generatorSelect.value;
        const generatorClass = this.#planterInstance.getGenerator(generatorName);
        this.#generatorParamsContainer.innerHTML = '';
        if (generatorClass && generatorClass.params) {
            this.#buildControls(this.#generatorParamsContainer, generatorClass.params, generatorName);
        }
    }

    #updateModifierParamsUI() {
        this.#modifierParamsContainer.innerHTML = '';
        const modifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]:checked');
        modifierCheckboxes.forEach(checkbox => {
            const modifierName = checkbox.dataset.modifierName;
            const modifierClass = this.#planterInstance.getModifier(modifierName);
            if (modifierClass && modifierClass.params) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'modifier-param-group';
                const groupLabel = document.createElement('h4');
                groupLabel.textContent = `${modifierName} Settings`;
                groupDiv.appendChild(groupLabel);
                this.#buildControls(groupDiv, modifierClass.params, modifierName);
                this.#modifierParamsContainer.appendChild(groupDiv);
            }
        });
    }

    #buildControls(container, paramsObject, ownerName) {
        for (const key in paramsObject) {
            const paramConfig = paramsObject[key];
            const controlDiv = document.createElement('div');
            const label = document.createElement('label');
            label.textContent = paramConfig.label;

            let input;
            if (paramConfig.type === 'slider') {
                input = document.createElement('input');
                input.type = 'range';
                input.min = paramConfig.min;
                input.max = paramConfig.max;
                input.step = paramConfig.step;
                input.value = paramConfig.defaultValue;
            } else if (paramConfig.type === 'select') {
                input = document.createElement('select');
                let options = [];
                if (paramConfig.optionsSource === 'patterns') {
                    options = this.#planterInstance.getPatternNames();
                    if (options.length === 0) {
                        const option = document.createElement('option');
                        option.textContent = 'No patterns saved';
                        option.disabled = true;
                        input.appendChild(option);
                    }
                } else {
                    options = paramConfig.options || [];
                }
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    input.appendChild(option);
                });
                input.value = paramConfig.defaultValue;
            }

            if (input) {
                input.dataset.paramOwner = ownerName;
                input.dataset.paramName = key;
                label.htmlFor = `${ownerName}-${key}`;
                input.id = `${ownerName}-${key}`;
                controlDiv.appendChild(label);
                controlDiv.appendChild(input);
                container.appendChild(controlDiv);
            }
        }
    }

    handleGenerate(overrideConfig = {}) {
        const baseConfig = {
            generator: this.#controls.generatorSelect.value,
            palette: this.#controls.paletteSelect.value,
            size: parseInt(this.#controls.sizeInput.value, 10),
            pixelSize: parseInt(this.#controls.pixelSizeInput.value, 10),
            seed: this.#controls.seedInput.value || Date.now(),
            modifiers: []
        };

        const genParamsInputs = this.#generatorParamsContainer.querySelectorAll('[data-param-name]');
        genParamsInputs.forEach(input => {
            const key = input.dataset.paramName;
            const value = input.type === 'range' ? parseFloat(input.value) : input.value;
            baseConfig[key] = value;
        });

        const modifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]:checked');
        modifierCheckboxes.forEach(checkbox => {
            const modName = checkbox.dataset.modifierName;
            const modConfig = { name: modName };
            const modParamsInputs = this.#modifierParamsContainer.querySelectorAll(`[data-param-owner="${modName}"]`);
            modParamsInputs.forEach(input => {
                const key = input.dataset.paramName;
                const value = input.type === 'range' ? parseFloat(input.value) : input.value;
                modConfig[key] = value;
            });
            baseConfig.modifiers.push(modConfig);
        });

        const finalConfig = { ...baseConfig, ...overrideConfig };

        // When stamping, we don't want a new random seed
        if (overrideConfig.generator === 'pattern') {
            finalConfig.seed = this.#currentSeed || finalConfig.seed;
        }

        this.#canvasContainer.innerHTML = '';
        const newPlanter = new Planter(finalConfig);
        newPlanter.generate();
        const canvas = newPlanter.getCanvas();
        this.#currentCanvas = canvas;
        this.#currentSeed = finalConfig.seed;
        this.#canvasContainer.appendChild(canvas);
    }

    handleSave() {
        if (!this.#currentCanvas) {
            console.error('No canvas to save.');
            return;
        }
        const link = document.createElement('a');
        link.href = this.#currentCanvas.toDataURL('image/png');
        link.download = `pixel-art-seed-${this.#currentSeed}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
