import { Planter } from './Planter.js';
import { HistoryManager } from './HistoryManager.js';
import { Layer } from './Layer.js';

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
    #planterInstance;
    #controls = {};
    #canvasContainer;
    #modifiersContainer;
    #generatorParamsContainer;
    #modifierParamsContainer;
    #layerPanel;
    #activeLayerId = null;
    #historyManager;
    #activeSymmetryMode = 'none';
    #isBrushing = false;

    constructor() {
        this.#historyManager = new HistoryManager();
        this.#bindDOM();

        const globalConfig = {
            size: parseInt(this.#controls.sizeInput.value, 10),
            pixelSize: parseInt(this.#controls.pixelSizeInput.value, 10),
        };
        this.#planterInstance = new Planter(globalConfig);

        this.#initializeUI();
        this.#attachEventListeners();

        // Load from URL if config is present, otherwise start with a default layer
        const loadedFromURL = this.#loadConfigFromURL();
        if (!loadedFromURL) {
            this.#handleAddLayer();
        }
    }

    #bindDOM() {
        // Main Controls
        this.#controls.generatorSelect = document.getElementById('generator-select');
        this.#controls.paletteSelect = document.getElementById('palette-select');
        this.#controls.sizeInput = document.getElementById('size-input');
        this. #controls.pixelSizeInput = document.getElementById('pixel-size-input');
        this.#controls.seedInput = document.getElementById('seed-input');
        this.#controls.generateBtn = document.getElementById('generate-btn');
        this.#controls.randomizeBtn = document.getElementById('randomize-btn');
        this.#controls.symmetrySelect = document.getElementById('symmetry-select');

        // Layer Panel
        this.#layerPanel = document.getElementById('layer-panel');
        this.#controls.addLayerBtn = document.getElementById('add-layer-btn');
        this.#controls.layerList = document.getElementById('layer-list');

        // Containers
        this.#canvasContainer = document.getElementById('canvas-container');
        this.#modifiersContainer = document.getElementById('modifiers-container');
        this.#generatorParamsContainer = document.getElementById('generator-params');
        this.#modifierParamsContainer = document.getElementById('modifier-params');

        // Note: History, Share, and other buttons are not bound yet as their
        // functionality needs to be rewritten for the layer system.
        this.#controls.saveBtn = document.getElementById('save-btn');
        this.#controls.exportJsonBtn = document.getElementById('export-json-btn');
        this.#controls.undoBtn = document.getElementById('undo-btn');
        this.#controls.redoBtn = document.getElementById('redo-btn');
        this.#controls.shareBtn = document.getElementById('share-btn');
    }

    #initializeUI() {
        this.#populateGeneratorOptions();
        this.#populatePaletteOptions();
        this.#populateModifierOptions();
        this.#addTooltips();

        const canvas = this.#planterInstance.getCanvas();
        this.#canvasContainer.appendChild(canvas);
    }

    #attachEventListeners() {
        // Main controls - now they affect the active layer
        this.#controls.generateBtn.addEventListener('click', () => this.handleGenerateActiveLayer());
        this.#controls.randomizeBtn.addEventListener('click', () => this.#handleRandomizeAll());
        this.#controls.addLayerBtn.addEventListener('click', () => this.#handleAddLayer());
        this.#controls.exportJsonBtn.addEventListener('click', () => this.#handleExportJSON());
        this.#controls.undoBtn.addEventListener('click', () => this.#handleUndo());
        this.#controls.redoBtn.addEventListener('click', () => this.#handleRedo());
        this.#controls.shareBtn.addEventListener('click', () => this.#handleShare());

        // Delegated listeners for the layer list
        this.#controls.layerList.addEventListener('click', e => {
            const layerItem = e.target.closest('.layer-item');
            if (!layerItem) return;
            const layerId = Number(layerItem.dataset.layerId);

            if (e.target.matches('.layer-delete-btn')) {
                this.#handleRemoveLayer(layerId);
            } else if (e.target.matches('.layer-move-up-btn')) {
                this.#planterInstance.moveLayer(layerId, 'up');
                this.#renderLayerPanel();
                this.#saveState();
            } else if (e.target.matches('.layer-move-down-btn')) {
                this.#planterInstance.moveLayer(layerId, 'down');
                this.#renderLayerPanel();
                this.#saveState();
            } else {
                this.#setActiveLayer(layerId);
            }
        });

        this.#controls.layerList.addEventListener('input', e => {
            const layerItem = e.target.closest('.layer-item');
            if (!layerItem) return;
            const layerId = Number(layerItem.dataset.layerId);
            const layer = this.#planterInstance.getLayerById(layerId);
            if (!layer) return;

            if (e.target.matches('.layer-visible-toggle')) {
                layer.isVisible = e.target.checked;
            } else if (e.target.matches('.layer-opacity-slider')) {
                layer.opacity = parseFloat(e.target.value);
            } else if (e.target.matches('.layer-blend-mode-select')) {
                layer.blendMode = e.target.value;
            }

            // Trigger a full redraw to show blending/opacity changes
            this.#planterInstance.generate();
            this.#saveState();
        });

        // Symmetry and Brush Listeners
        this.#controls.symmetrySelect.addEventListener('change', e => {
            this.#activeSymmetryMode = e.target.value;
        });

        this.#canvasContainer.addEventListener('mousedown', e => {
            this.#isBrushing = true;
            this.#handleBrushStroke(e);
        });
        this.#canvasContainer.addEventListener('mousemove', e => {
            if (this.#isBrushing) {
                this.#handleBrushStroke(e);
            }
        });
        this.#canvasContainer.addEventListener('mouseup', () => this.#isBrushing = false);
        this.#canvasContainer.addEventListener('mouseleave', () => this.#isBrushing = false);
    }

    #handleBrushStroke(event) {
        if (!this.#activeLayerId) return;

        const canvas = this.#planterInstance.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;

        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        const { size, pixelSize } = layer.config;

        const gridX = Math.floor(canvasX / pixelSize);
        const gridY = Math.floor(canvasY / pixelSize);

        const pointsToDraw = [{ x: gridX, y: gridY }];

        if (this.#activeSymmetryMode === 'vertical' || this.#activeSymmetryMode === 'quad') {
            pointsToDraw.push({ x: size - 1 - gridX, y: gridY });
        }
        if (this.#activeSymmetryMode === 'horizontal' || this.#activeSymmetryMode === 'quad') {
            pointsToDraw.push({ x: gridX, y: size - 1 - gridY });
        }
        if (this.#activeSymmetryMode === 'quad') {
            pointsToDraw.push({ x: size - 1 - gridX, y: size - 1 - gridY });
        }

        this.#planterInstance.drawOnLayer(this.#activeLayerId, pointsToDraw, 1);
        this.#planterInstance.generate();
        this.#saveState();
    }

    #renderLayerPanel() {
        const layerStack = this.#planterInstance.getLayerStack();
        this.#controls.layerList.innerHTML = '';

        // Iterate backwards to render top layer first
        [...layerStack].reverse().forEach(layer => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.dataset.layerId = layer.id;
            if (layer.id === this.#activeLayerId) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <input type="checkbox" class="layer-visible-toggle" ${layer.isVisible ? 'checked' : ''}>
                <span class="layer-item-name">${layer.name}</span>
                <div class="layer-item-buttons">
                    <button class="layer-move-up-btn">↑</button>
                    <button class="layer-move-down-btn">↓</button>
                    <button class="layer-delete-btn">X</button>
                </div>
                <div class="layer-item-controls">
                    <div>
                        <label>Opacity</label>
                        <input type="range" class="layer-opacity-slider" min="0" max="1" step="0.05" value="${layer.opacity}">
                    </div>
                    <div>
                        <label>Blend Mode</label>
                        <select class="layer-blend-mode-select">
                            <option value="source-over" ${layer.blendMode === 'source-over' ? 'selected' : ''}>Normal</option>
                            <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>Multiply</option>
                            <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>Screen</option>
                            <option value="overlay" ${layer.blendMode === 'overlay' ? 'selected' : ''}>Overlay</option>
                            <option value="difference" ${layer.blendMode === 'difference' ? 'selected' : ''}>Difference</option>
                            <option value="lighten" ${layer.blendMode === 'lighten' ? 'selected' : ''}>Lighten</option>
                            <option value="darken" ${layer.blendMode === 'darken' ? 'selected' : ''}>Darken</option>
                        </select>
                    </div>
                </div>
            `;
            this.#controls.layerList.appendChild(item);
        });
    }

    #setActiveLayer(layerId) {
        this.#activeLayerId = layerId;
        const layer = this.#planterInstance.getLayerById(layerId);
        if (layer) {
            this.#updateMainControlsFromLayer(layer);
        }
        this.#renderLayerPanel();
    }

    #handleAddLayer() {
        const defaultConfig = {
            generator: 'noise',
            palette: 'monochrome',
            seed: Date.now().toString(),
            modifiers: [],
            noiseScale: 20,
            noiseThreshold: 0.5,
        };
        const newLayer = this.#planterInstance.addLayer(defaultConfig);
        newLayer.generate(this.#planterInstance);
        this.#setActiveLayer(newLayer.id);
        this.#planterInstance.generate();
        this.#saveState();
    }

    #handleRemoveLayer(layerId) {
        this.#planterInstance.removeLayer(layerId);
        if (this.#activeLayerId === layerId) {
            const layerStack = this.#planterInstance.getLayerStack();
            const newActiveLayer = layerStack.length > 0 ? layerStack[layerStack.length - 1] : null;
            this.#setActiveLayer(newActiveLayer ? newActiveLayer.id : null);
        }
        this.#renderLayerPanel();
        this.#planterInstance.generate();
        this.#saveState();
    }

    handleGenerateActiveLayer() {
        if (!this.#activeLayerId) {
            alert("Please add or select a layer first.");
            return;
        }
        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        if (layer) {
            // Update layer's config from the main UI controls
            layer.config = this.#getConfigFromMainControls();
            // Regenerate the data grid for this layer specifically
            layer.generate(this.#planterInstance);
            // Redraw the entire canvas with the updated layer
            this.#planterInstance.generate();
            this.#saveState();
        }
    }

    #handleRandomizeAll() {
        if (!this.#activeLayerId) {
            alert("Please add or select a layer to randomize.");
            return;
        }

        const allGenerators = this.#planterInstance.getGeneratorNames();
        const allPalettes = this.#planterInstance.getPaletteNames();
        const allModifiers = this.#planterInstance.getModifierNames();

        const randomConfig = {};
        randomConfig.generator = allGenerators[Math.floor(Math.random() * allGenerators.length)];
        randomConfig.palette = allPalettes[Math.floor(Math.random() * allPalettes.length)];
        randomConfig.seed = Date.now().toString();

        // Also randomize global size property for fun
        const sizes = [16, 32, 64];
        randomConfig.size = sizes[Math.floor(Math.random() * sizes.length)];
        // Note: pixelSize is not randomized to keep the canvas size consistent.

        randomConfig.modifiers = [];
        const numModifiers = Math.floor(Math.random() * 3);
        const shuffledModifiers = allModifiers.sort(() => 0.5 - Math.random());

        for (let i = 0; i < numModifiers; i++) {
            const modName = shuffledModifiers[i];
            const modConfig = { name: modName };
            const modifierClass = this.#planterInstance.getModifier(modName);

            if (modifierClass && modifierClass.params) {
                for (const paramKey in modifierClass.params) {
                    const paramDef = modifierClass.params[paramKey];
                    if (paramDef.type === 'slider') {
                        const randomValue = Math.random() * (paramDef.max - paramDef.min) + paramDef.min;
                        modConfig[paramKey] = parseFloat(randomValue.toFixed(2));
                    } else if (paramDef.type === 'select' && paramDef.options) {
                        modConfig[paramKey] = paramDef.options[Math.floor(Math.random() * paramDef.options.length)];
                    }
                }
            }
            randomConfig.modifiers.push(modConfig);
        }

        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        if (layer) {
            layer.config = { ...layer.config, ...randomConfig };
            this.#updateMainControlsFromLayer(layer);
            // handleGenerateActiveLayer already saves state, so we just call it.
            this.handleGenerateActiveLayer();
        }
    }

    #getConfigFromMainControls() {
        const config = {
            generator: this.#controls.generatorSelect.value,
            palette: this.#controls.paletteSelect.value,
            seed: this.#controls.seedInput.value || Date.now().toString(),
            modifiers: []
        };

        const genParamsInputs = this.#generatorParamsContainer.querySelectorAll('[data-param-name]');
        genParamsInputs.forEach(input => {
            const key = input.dataset.paramName;
            config[key] = input.type === 'range' ? parseFloat(input.value) : input.value;
        });

        const modifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]:checked');
        modifierCheckboxes.forEach(checkbox => {
            const modName = checkbox.dataset.modifierName;
            const modConfig = { name: modName };
            const modParamsInputs = this.#modifierParamsContainer.querySelectorAll(`[data-param-owner="${modName}"]`);
            modParamsInputs.forEach(input => {
                const key = input.dataset.paramName;
                modConfig[key] = input.type === 'range' ? parseFloat(input.value) : input.value;
            });
            config.modifiers.push(modConfig);
        });

        return config;
    }

    #updateMainControlsFromLayer(layer) {
        const config = layer.config;
        this.#controls.generatorSelect.value = config.generator;
        this.#controls.paletteSelect.value = config.palette;
        this.#controls.seedInput.value = config.seed;

        this.#updateGeneratorParamsUI(config.generator, config);

        const allModifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]');
        allModifierCheckboxes.forEach(checkbox => {
            checkbox.checked = config.modifiers.some(m => m.name === checkbox.dataset.modifierName);
        });

        this.#updateModifierParamsUI(config.modifiers);
    }

    // --- UI Population and Updates ---

    #addTooltips() {
        for (const controlId in TOOLTIP_TEXTS) {
            const el = document.getElementById(controlId);
            if (!el) continue;
            let label = (controlId === 'modifiers-container') ? el.previousElementSibling : document.querySelector(`label[for="${controlId}"]`);
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
        const names = this.#planterInstance.getGeneratorNames();
        this.#controls.generatorSelect.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
    }

    #populatePaletteOptions() {
        const names = this.#planterInstance.getPaletteNames();
        this.#controls.paletteSelect.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
    }

    #populateModifierOptions() {
        const names = this.#planterInstance.getModifierNames();
        this.#modifiersContainer.innerHTML = names.map(name => `
            <div>
                <input type="checkbox" id="mod-${name}" data-modifier-name="${name}">
                <label for="mod-${name}">${name}</label>
            </div>
        `).join('');
    }

    #updateGeneratorParamsUI(generatorName, config) {
        const generatorClass = this.#planterInstance.getGenerator(generatorName);
        this.#generatorParamsContainer.innerHTML = '';
        if (generatorClass && generatorClass.params) {
            this.#buildControls(this.#generatorParamsContainer, generatorClass.params, generatorName, config);
        }
    }

    #updateModifierParamsUI(modifiersConfig) {
        this.#modifierParamsContainer.innerHTML = '';
        modifiersConfig.forEach(modConfig => {
            const modifierClass = this.#planterInstance.getModifier(modConfig.name);
            if (modifierClass && modifierClass.params) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'modifier-param-group';
                const groupLabel = document.createElement('h4');
                groupLabel.textContent = `${modConfig.name} Settings`;
                groupDiv.appendChild(groupLabel);
                this.#buildControls(groupDiv, modifierClass.params, modConfig.name, modConfig);
                this.#modifierParamsContainer.appendChild(groupDiv);
            }
        });
    }

    #buildControls(container, paramsObject, ownerName, config) {
        for (const key in paramsObject) {
            const paramConfig = paramsObject[key];
            const currentValue = config[key] !== undefined ? config[key] : paramConfig.defaultValue;

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
                input.value = currentValue;
            } else if (paramConfig.type === 'select') {
                input = document.createElement('select');
                let options = paramConfig.optionsSource === 'patterns' ? this.#planterInstance.getPatternNames() : (paramConfig.options || []);
                input.innerHTML = options.map(opt => `<option value="${opt}" ${opt === currentValue ? 'selected' : ''}>${opt}</option>`).join('');
            }

            if (input) {
                input.dataset.paramOwner = ownerName;
                input.dataset.paramName = key;
                controlDiv.appendChild(label);
                controlDiv.appendChild(input);
                container.appendChild(controlDiv);
            }
        }
    }

    #handleExportJSON() {
        if (!this.#activeLayerId) {
            alert("Please select a layer to export.");
            return;
        }

        const finalGrid = this.#planterInstance.getDataGridForLayer(this.#activeLayerId);
        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);

        if (!finalGrid || finalGrid.length === 0) {
            alert("Please generate the active layer first!");
            return;
        }

        const exportObject = {
            name: `pixel-planter-export-layer-${layer.name}-seed-${layer.config.seed}`,
            size: finalGrid.length,
            createdAt: new Date().toISOString(),
            grid: finalGrid
        };

        const jsonString = JSON.stringify(exportObject, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pixel-art-layer-seed-${layer.config.seed}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    #saveState() {
        const layerStack = this.#planterInstance.getLayerStack();
        // Deep copy the stack and its layers
        const state = layerStack.map(layer => {
            const newLayer = new Layer(JSON.parse(JSON.stringify(layer.config)));
            newLayer.id = layer.id;
            newLayer.name = layer.name;
            newLayer.isVisible = layer.isVisible;
            newLayer.opacity = layer.opacity;
            newLayer.blendMode = layer.blendMode;
            newLayer.dataGrid = JSON.parse(JSON.stringify(layer.dataGrid));
            return newLayer;
        });
        this.#historyManager.addState(state);
    }

    #restoreState(state) {
        if (!state) return;
        this.#planterInstance.setLayerStack(state);
        const newActiveLayer = state.find(l => l.id === this.#activeLayerId) || state[state.length - 1];
        this.#setActiveLayer(newActiveLayer ? newActiveLayer.id : null);
        this.#planterInstance.generate();
        this.#renderLayerPanel();
    }

    #handleUndo() {
        const prevState = this.#historyManager.undo();
        if (prevState) {
            this.#restoreState(prevState);
        }
    }

    #handleRedo() {
        const nextState = this.#historyManager.redo();
        if (nextState) {
            this.#restoreState(nextState);
        }
    }

    #handleShare() {
        const layerStack = this.#planterInstance.getLayerStack();
        // We only need to store the serializable parts of each layer
        const simplifiedStack = layerStack.map(layer => ({
            config: layer.config,
            name: layer.name,
            isVisible: layer.isVisible,
            opacity: layer.opacity,
            blendMode: layer.blendMode,
            dataGrid: layer.dataGrid // The grid is needed to reconstruct the exact state
        }));

        const jsonString = JSON.stringify(simplifiedStack);
        const base64String = btoa(jsonString);
        const shareableURL = `${window.location.origin}${window.location.pathname}?config=${base64String}`;

        navigator.clipboard.writeText(shareableURL)
            .then(() => alert("Link copied to clipboard!"))
            .catch(err => console.error("Failed to copy link: ", err));
    }

    #loadConfigFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const configString = urlParams.get('config');

        if (!configString) return false;

        try {
            const jsonString = atob(configString);
            const simplifiedStack = JSON.parse(jsonString);

            if (!Array.isArray(simplifiedStack)) {
                console.error("Failed to load from URL: config is not an array.");
                return false;
            }

            const newLayerStack = simplifiedStack.map(simpleLayer => {
                const newLayer = new Layer(simpleLayer.config);
                newLayer.name = simpleLayer.name;
                newLayer.isVisible = simpleLayer.isVisible;
                newLayer.opacity = simpleLayer.opacity;
                newLayer.blendMode = simpleLayer.blendMode;
                newLayer.dataGrid = simpleLayer.dataGrid;
                // ID will be new, but that's okay.
                return newLayer;
            });

            this.#planterInstance.setLayerStack(newLayerStack);

            const firstLayer = newLayerStack[0];
            if (firstLayer) {
                this.#setActiveLayer(firstLayer.id);
            }

            this.#planterInstance.generate();
            this.#saveState(); // Save this loaded state as the initial state in history
            return true;

        } catch (error) {
            console.error("Failed to parse config from URL:", error);
            return false;
        }
    }
}
