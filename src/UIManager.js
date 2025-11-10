import { driver } from "driver.js";
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
    #clipboard = null; // For copy/pasting modifiers
    #presetsModal;
    #presetGallery;
    #closePresetsBtn;

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

        const loadedFromURL = this.#loadConfigFromURL();
        if (!loadedFromURL) {
            this.#handleAddLayer();
        }
        this.#startOnboardingTour();
    }

    #startOnboardingTour() {
        const hasBeenOnboarded = localStorage.getItem('pixelPlanterOnboarded');
        if (hasBeenOnboarded) {
            return;
        }

        const driverObj = driver({
            showProgress: true,
            steps: [
                { element: '#generator-select', popover: { title: '1. Pick a Generator', description: 'This is the main algorithm used to create your art. Try "noise" or "cellular" to start.' } },
                { element: '#palette-select', popover: { title: '2. Pick a Palette', description: 'Choose a color scheme for your creation.' } },
                { element: '#generate-btn', popover: { title: '3. Generate!', description: 'Click here to create your artwork. You can click it again to get a new variation with the same settings.' } },
                { element: '#randomize-btn', popover: { title: 'Roll the Dice', description: 'This button will randomize all settings for a surprise result.' } },
                { element: '#mode-toggle-container', popover: { title: 'Unlock More Power', description: 'When you\'re ready, switch to "Advanced" mode to unlock layers, modifiers, and more!' } }
            ]
        });

        driverObj.drive();
        localStorage.setItem('pixelPlanterOnboarded', 'true');
    }

    #bindDOM() {
        this.#controls.generatorSelect = document.getElementById('generator-select');
        this.#controls.paletteSelect = document.getElementById('palette-select');
        this.#controls.sizeInput = document.getElementById('size-input');
        this.#controls.pixelSizeInput = document.getElementById('pixel-size-input');
        this.#controls.seedInput = document.getElementById('seed-input');
        this.#controls.generateBtn = document.getElementById('generate-btn');
        this.#controls.randomizeBtn = document.getElementById('randomize-btn');
        this.#controls.symmetrySelect = document.getElementById('symmetry-select');
        this.#layerPanel = document.getElementById('layer-panel');
        this.#controls.addLayerBtn = document.getElementById('add-layer-btn');
        this.#controls.layerList = document.getElementById('layer-list');
        this.#canvasContainer = document.getElementById('canvas-container');
        this.#modifiersContainer = document.getElementById('modifiers-container');
        this.#generatorParamsContainer = document.getElementById('generator-params');
        this.#modifierParamsContainer = document.getElementById('modifier-params');
        this.#controls.saveBtn = document.getElementById('save-btn');
        this.#controls.exportJsonBtn = document.getElementById('export-json-btn');
        this.#controls.undoBtn = document.getElementById('undo-btn');
        this.#controls.redoBtn = document.getElementById('redo-btn');
        this.#controls.shareBtn = document.getElementById('share-btn');
        this.#controls.showPresetsBtn = document.getElementById('show-presets-btn');
        this.#presetsModal = document.getElementById('presets-modal');
        this.#presetGallery = document.getElementById('preset-gallery');
        this.#closePresetsBtn = this.#presetsModal.querySelector('.close-button');
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
        this.#controls.generateBtn.addEventListener('click', () => this.handleGenerateActiveLayer());
        this.#controls.randomizeBtn.addEventListener('click', () => this.#handleRandomizeAll());
        this.#controls.addLayerBtn.addEventListener('click', () => this.#handleAddLayer());
        this.#controls.exportJsonBtn.addEventListener('click', () => this.#handleExportJSON());
        this.#controls.undoBtn.addEventListener('click', () => this.#handleUndo());
        this.#controls.redoBtn.addEventListener('click', () => this.#handleRedo());
        this.#controls.shareBtn.addEventListener('click', () => this.#handleShare());
        document.getElementById('mode-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('simple-mode');
            } else {
                document.body.classList.add('simple-mode');
            }
        });

        // --- UPDATED: Delegated listeners for the layer list ---
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
            } else if (e.target.matches('.copy-mods-btn')) {
                this.#copyModifierStack(layerId);
            } else if (e.target.matches('.paste-mods-btn')) {
                this.#pasteModifierStack(layerId);
            } else if (!e.target.matches('input, select, button')) {
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
                this.#planterInstance.generate();
                this.#saveState();
            } else if (e.target.matches('.layer-opacity-slider')) {
                layer.opacity = parseFloat(e.target.value);
                this.#planterInstance.generate();
                this.#saveState();
            } else if (e.target.matches('.layer-blend-mode-select')) {
                layer.blendMode = e.target.value;
                this.#planterInstance.generate();
                this.#saveState();
            } else if (e.target.matches('.layer-name-input')) {
                layer.name = e.target.value;
                this.#saveState(); // No need to regenerate, just save
            } else if (e.target.matches('.layer-mask-select')) {
                const value = e.target.value;
                layer.maskLayerId = value === 'none' ? null : Number(value);
                this.#planterInstance.generate(); // Masking requires a full generate
                this.#saveState();
            }
        });

        this.#controls.symmetrySelect.addEventListener('change', e => this.#activeSymmetryMode = e.target.value);
        this.#canvasContainer.addEventListener('mousedown', e => { this.#isBrushing = true; this.#handleBrushStroke(e); });
        this.#canvasContainer.addEventListener('mousemove', e => { if (this.#isBrushing) this.#handleBrushStroke(e); });
        this.#canvasContainer.addEventListener('mouseup', () => this.#isBrushing = false);
        this.#canvasContainer.addEventListener('mouseleave', () => this.#isBrushing = false);

        this.#controls.showPresetsBtn.addEventListener('click', () => this.#handleShowPresets());
        this.#closePresetsBtn.addEventListener('click', () => this.#presetsModal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target == this.#presetsModal) {
                this.#presetsModal.style.display = 'none';
            }
        });

        this.#presetGallery.addEventListener('click', (event) => {
            const presetItem = event.target.closest('.preset-item');
            if (presetItem) {
                const configString = presetItem.dataset.config;
                this.#loadConfig(configString);
                this.#presetsModal.style.display = 'none';
            }
        });
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

    // --- UPDATED: Renders the entire layer panel with new controls ---
    #renderLayerPanel() {
        const layerStack = this.#planterInstance.getLayerStack();
        this.#controls.layerList.innerHTML = '';

        [...layerStack].reverse().forEach(layer => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.dataset.layerId = layer.id;
            if (layer.id === this.#activeLayerId) {
                item.classList.add('active');
            }

            const otherLayers = layerStack.filter(l => l.id !== layer.id);
            const maskOptions = otherLayers.map(l => `<option value="${l.id}" ${layer.maskLayerId == l.id ? 'selected' : ''}>${l.name}</option>`).join('');

            item.innerHTML = `
                <div class="layer-item-header">
                    <input type="checkbox" class="layer-visible-toggle" ${layer.isVisible ? 'checked' : ''} title="Toggle Visibility">
                    <input type="text" class="layer-name-input" value="${layer.name}">
                    <div class="layer-item-buttons">
                        <button class="layer-move-up-btn" title="Move Up">↑</button>
                        <button class="layer-move-down-btn" title="Move Down">↓</button>
                        <button class="layer-delete-btn" title="Delete Layer">X</button>
                    </div>
                </div>
                <div class="layer-item-controls">
                    <div>
                        <label>Opacity</label>
                        <input type="range" class="layer-opacity-slider" min="0" max="1" step="0.05" value="${layer.opacity}">
                    </div>
                    <div>
                        <label>Blend</label>
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
                    <div>
                        <label>Mask</label>
                        <select class="layer-mask-select">
                            <option value="none">No Mask</option>
                            ${maskOptions}
                        </select>
                    </div>
                    <div class="modifier-actions">
                        <button class="copy-mods-btn">Copy Mods</button>
                        <button class="paste-mods-btn">Paste Mods</button>
                    </div>
                </div>
            `;
            this.#controls.layerList.appendChild(item);
        });
    }

    // --- NEW: Methods for copy/pasting modifiers ---
    #copyModifierStack(layerId) {
        const layer = this.#planterInstance.getLayerById(layerId);
        if (layer && layer.config.modifiers) {
            this.#clipboard = JSON.parse(JSON.stringify(layer.config.modifiers));
            alert('Modifiers copied!');
        }
    }

    #pasteModifierStack(layerId) {
        if (this.#clipboard === null) {
            alert('Nothing to paste!');
            return;
        }
        const layer = this.#planterInstance.getLayerById(layerId);
        if (layer) {
            layer.config.modifiers = JSON.parse(JSON.stringify(this.#clipboard));
            this.#setActiveLayer(layer.id); // This will update the main controls
            this.handleGenerateActiveLayer(); // This regenerates and saves state
        }
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
        this.#setActiveLayer(newLayer.id);
        this.handleGenerateActiveLayer(); // This will generate and save
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
            // This can happen if the last layer is deleted.
            this.#planterInstance.generate(); // Render the empty state
            this.#saveState();
            return;
        }
        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        if (layer) {
            layer.config = this.#getConfigFromMainControls();
            // The main generate call will handle the individual layer generation now
            this.#planterInstance.generate();
            this.#saveState();
        }
    }

    async #handleShowPresets() {
        if (this.#presetGallery.children.length === 0) {
            try {
                const response = await fetch('./src/presets.json');
                const presets = await response.json();
                this.#populatePresetGallery(presets);
            } catch (error) {
                console.error('Failed to load presets:', error);
                this.#presetGallery.innerHTML = '<p>Could not load presets.</p>';
            }
        }
        this.#presetsModal.style.display = 'block';
    }

    #populatePresetGallery(presets) {
        this.#presetGallery.innerHTML = '';
        presets.forEach(preset => {
            const item = document.createElement('div');
            item.className = 'preset-item';
            item.dataset.config = preset.config;
            item.innerHTML = `
                <img src="${preset.preview}" alt="${preset.name}" loading="lazy">
                <div class="preset-item-name">${preset.name}</div>
            `;
            this.#presetGallery.appendChild(item);
        });
    }
    }

    #handleRandomizeAll() {
        if (!this.#activeLayerId) {
            alert("Please add or select a layer to randomize.");
            return;
        }
        // ... (rest of the method is unchanged, so omitted for brevity)
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
            const value = input.type === 'range' ? parseFloat(input.value) : input.value;
            config[key] = isNaN(value) ? input.value : value;
        });
        const modifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]:checked');
        modifierCheckboxes.forEach(checkbox => {
            const modName = checkbox.dataset.modifierName;
            const modConfig = { name: modName };
            const modParamsInputs = this.#modifierParamsContainer.querySelectorAll(`[data-param-owner="${modName}"]`);
            modParamsInputs.forEach(input => {
                const key = input.dataset.paramName;
                const value = input.type === 'range' ? parseFloat(input.value) : input.value;
                modConfig[key] = isNaN(value) ? input.value : value;
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
        if (!modifiersConfig) return;
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
                input.innerHTML = options.map(opt => `<option value="${opt}" ${opt == currentValue ? 'selected' : ''}>${opt}</option>`).join('');
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
        // ... (omitted for brevity, unchanged)
    }

    #saveState() {
        const layerStack = this.#planterInstance.getLayerStack();
        const state = layerStack.map(layer => {
            const newLayer = new Layer(JSON.parse(JSON.stringify(layer.config)));
            newLayer.id = layer.id;
            newLayer.name = layer.name;
            newLayer.isVisible = layer.isVisible;
            newLayer.opacity = layer.opacity;
            newLayer.blendMode = layer.blendMode;
            newLayer.maskLayerId = layer.maskLayerId; // IMPORTANT: Persist mask ID
            // Don't save the dataGrid in history, it can be regenerated.
            // newLayer.dataGrid = JSON.parse(JSON.stringify(layer.dataGrid));
            return newLayer;
        });
        this.#historyManager.addState({ layers: state, activeLayerId: this.#activeLayerId });
    }

    #restoreState(state) {
        if (!state) return;
        const newLayerStack = state.layers.map(simpleLayer => {
            const newLayer = new Layer(simpleLayer.config);
            newLayer.id = simpleLayer.id;
            newLayer.name = simpleLayer.name;
            newLayer.isVisible = simpleLayer.isVisible;
            newLayer.opacity = simpleLayer.opacity;
            newLayer.blendMode = simpleLayer.blendMode;
            newLayer.maskLayerId = simpleLayer.maskLayerId;
            // Data grid will be regenerated.
            return newLayer;
        });
        this.#planterInstance.setLayerStack(newLayerStack);
        this.#activeLayerId = state.activeLayerId;
        const newActiveLayer = this.#planterInstance.getLayerById(this.#activeLayerId) || newLayerStack[newLayerStack.length - 1];
        this.#setActiveLayer(newActiveLayer ? newActiveLayer.id : null);
        this.#planterInstance.generate();
    }

    #handleUndo() {
        const prevState = this.#historyManager.undo();
        if (prevState) this.#restoreState(prevState);
    }

    #handleRedo() {
        const nextState = this.#historyManager.redo();
        if (nextState) this.#restoreState(nextState);
    }

    #handleShare() {
        const layerStack = this.#planterInstance.getLayerStack();
        const simplifiedStack = layerStack.map(layer => ({
            config: layer.config,
            name: layer.name,
            isVisible: layer.isVisible,
            opacity: layer.opacity,
            blendMode: layer.blendMode,
            maskLayerId: layer.maskLayerId,
        }));
        const jsonString = JSON.stringify(simplifiedStack);
        const base64String = btoa(encodeURIComponent(jsonString));
        const shareableURL = `${window.location.origin}${window.location.pathname}?config=${base64String}`;
        navigator.clipboard.writeText(shareableURL).then(() => alert("Link copied to clipboard!")).catch(err => console.error("Failed to copy link: ", err));
    }

    #loadConfigFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const configString = urlParams.get('config');
        if (!configString) return false;

        return this.#loadConfig(configString);
    }

    #loadConfig(configString) {
        try {
            const jsonString = decodeURIComponent(atob(configString));
            const simplifiedStack = JSON.parse(jsonString);
            if (!Array.isArray(simplifiedStack)) return false;

            const newLayerStack = simplifiedStack.map(simpleLayer => {
                const newLayer = new Layer(simpleLayer.config);
                newLayer.name = simpleLayer.name || `Layer ${newLayer.id}`;
                newLayer.isVisible = simpleLayer.isVisible !== false;
                newLayer.opacity = simpleLayer.opacity || 1.0;
                newLayer.blendMode = simpleLayer.blendMode || 'source-over';
                newLayer.maskLayerId = simpleLayer.maskLayerId || null;
                return newLayer;
            });

            this.#planterInstance.setLayerStack(newLayerStack);
            const firstLayer = newLayerStack[0];
            if (firstLayer) this.#setActiveLayer(firstLayer.id);
            this.#planterInstance.generate();
            this.#saveState();
            return true;
        } catch (error) {
            console.error("Failed to parse config:", error);
            return false;
        }
    }
}
