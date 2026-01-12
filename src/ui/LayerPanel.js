export class LayerPanel {
    #planter;
    #container;
    #onLayerAction;

    constructor(planter, container, onLayerAction) {
        this.#planter = planter;
        this.#container = container;
        this.#onLayerAction = onLayerAction;
        this.#attachEventListeners();
    }

    render() {
        const layerStack = this.#planter.getLayerStack();
        this.#container.innerHTML = '';

        [...layerStack].reverse().forEach((layer) => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            if (layer.type === 'zone') {
                item.classList.add('zone-layer');
            }
            item.dataset.layerId = layer.id;
            // Note: Active state is managed by CSS based on a class we need to apply
            // But we don't have the activeLayerId here directly unless passed or queried.
            // For now, let's rely on the parent to update the 'active' class or pass it in.
            // Better: Pass activeLayerId to render.

            const otherLayers = layerStack.filter((l) => l.id !== layer.id);
            const maskOptions = otherLayers
                .map((l) => `<option value="${l.id}" ${layer.maskLayerId == l.id ? 'selected' : ''}>${l.name}</option>`)
                .join('');

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
                        <label>Type</label>
                        <select class="layer-type-select">
                            <option value="normal" ${layer.type === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="zone" ${layer.type === 'zone' ? 'selected' : ''}>Zone (Mask)</option>
                        </select>
                    </div>
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
            this.#container.appendChild(item);
        });
    }

    updateActiveState(activeLayerId) {
        const items = this.#container.querySelectorAll('.layer-item');
        items.forEach(item => {
            if (Number(item.dataset.layerId) === activeLayerId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    #attachEventListeners() {
        this.#container.addEventListener('click', (e) => {
            const layerItem = e.target.closest('.layer-item');
            if (!layerItem) return;
            const layerId = Number(layerItem.dataset.layerId);

            if (e.target.matches('.layer-delete-btn')) {
                this.#onLayerAction('delete', layerId);
            } else if (e.target.matches('.layer-move-up-btn')) {
                this.#onLayerAction('moveUp', layerId);
            } else if (e.target.matches('.layer-move-down-btn')) {
                this.#onLayerAction('moveDown', layerId);
            } else if (e.target.matches('.copy-mods-btn')) {
                this.#onLayerAction('copyMods', layerId);
            } else if (e.target.matches('.paste-mods-btn')) {
                this.#onLayerAction('pasteMods', layerId);
            } else if (!e.target.matches('input, select, button')) {
                this.#onLayerAction('select', layerId);
            }
        });

        this.#container.addEventListener('input', (e) => {
            const layerItem = e.target.closest('.layer-item');
            if (!layerItem) return;
            const layerId = Number(layerItem.dataset.layerId);

            if (e.target.matches('.layer-visible-toggle')) {
                this.#onLayerAction('toggleVisibility', layerId, e.target.checked);
            } else if (e.target.matches('.layer-type-select')) {
                 // Update visually immediately
                 if (e.target.value === 'zone') {
                    layerItem.classList.add('zone-layer');
                 } else {
                    layerItem.classList.remove('zone-layer');
                 }
                 this.#onLayerAction('updateType', layerId, e.target.value);
            } else if (e.target.matches('.layer-opacity-slider')) {
                this.#onLayerAction('updateOpacity', layerId, parseFloat(e.target.value));
            } else if (e.target.matches('.layer-blend-mode-select')) {
                this.#onLayerAction('updateBlendMode', layerId, e.target.value);
            } else if (e.target.matches('.layer-name-input')) {
                this.#onLayerAction('updateName', layerId, e.target.value);
            } else if (e.target.matches('.layer-mask-select')) {
                const value = e.target.value;
                const maskId = value === 'none' ? null : Number(value);
                this.#onLayerAction('updateMask', layerId, maskId);
            }
        });
    }
}
