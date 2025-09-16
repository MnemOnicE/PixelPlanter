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
        this.#updateGeneratorParamsUI(); // Initial call
        this.#initializePatternEditorGrid();
    }

    #attachEventListeners() {
        this.#controls.generateBtn.addEventListener('click', () => this.handleGenerate());
        this.#controls.saveBtn.addEventListener('click', () => this.handleSave());
        this.#controls.generatorSelect.addEventListener('change', () => this.#updateGeneratorParamsUI());
        this.#modifiersContainer.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') this.#updateModifierParamsUI();
        });

        // Pattern Editor Listeners
        this.#controls.editPatternsBtn.addEventListener('click', () => this.#openPatternEditor());
        this.#controls.closePatternEditorBtn.addEventListener('click', () => this.#closePatternEditor());
        this.#controls.savePatternBtn.addEventListener('click', () => this.#handleSavePattern());
        window.addEventListener('click', (event) => {
            if (event.target == this.#patternEditorModal) this.#closePatternEditor();
        });
        this.#patternGridContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('pattern-cell')) {
                event.target.classList.toggle('active');
            }
        });
    }

    // --- Pattern Editor Methods ---

    #openPatternEditor() {
        this.#patternEditorModal.style.display = 'block';
    }

    #closePatternEditor() {
        this.#patternEditorModal.style.display = 'none';
    }

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
        if (!name) {
            alert('Please enter a name for the pattern.');
            return;
        }

        const gridSize = Math.sqrt(this.#patternGridContainer.children.length);
        const dataGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        const cells = this.#patternGridContainer.children;

        for (let i = 0; i < cells.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            if (cells[i].classList.contains('active')) {
                dataGrid[row][col] = 1;
            }
        }

        const newPattern = new Pattern(name, dataGrid);
        this.#planterInstance.registerPattern(name, newPattern);

        alert(`Pattern "${name}" saved!`);
        this.#closePatternEditor();
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
                paramConfig.options.forEach(opt => {
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

    handleGenerate() {
        const config = {
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
            config[key] = value;
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
            config.modifiers.push(modConfig);
        });

        this.#canvasContainer.innerHTML = '';
        const newPlanter = new Planter(config);
        newPlanter.generate();
        const canvas = newPlanter.getCanvas();
        this.#currentCanvas = canvas;
        this.#currentSeed = config.seed;
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
