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
        this.#container.textContent = '';

        [...layerStack].reverse().forEach((layer) => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.draggable = true;
            if (layer.type === 'zone') {
                item.classList.add('zone-layer');
            }
            item.dataset.layerId = layer.id;
            // Note: Active state is managed by CSS based on a class we need to apply
            // But we don't have the activeLayerId here directly unless passed or queried.
            // For now, let's rely on the parent to update the 'active' class or pass it in.
            // Better: Pass activeLayerId to render.




                        const dragHandle = document.createElement('div');
            dragHandle.className = 'layer-drag-handle';
            dragHandle.textContent = '≡';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'layer-content';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'layer-name-input';
            nameInput.value = layer.name;
            contentDiv.appendChild(nameInput);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'layer-controls';

            const visBtn = document.createElement('button');
            visBtn.className = 'icon-btn toggle-visibility';
            visBtn.title = 'Toggle Visibility';
            visBtn.textContent = layer.isVisible ? '👁️' : '👁️‍🗨️';
            controlsDiv.appendChild(visBtn);

            const typeSelect = document.createElement('select');
            typeSelect.className = 'layer-type-select';
            typeSelect.title = 'Layer Type';
            const optNormal = document.createElement('option');
            optNormal.value = 'normal';
            optNormal.textContent = 'Normal';
            if (layer.type === 'normal') optNormal.selected = true;
            const optZone = document.createElement('option');
            optZone.value = 'zone';
            optZone.textContent = 'Zone';
            if (layer.type === 'zone') optZone.selected = true;
            typeSelect.appendChild(optNormal);
            typeSelect.appendChild(optZone);
            controlsDiv.appendChild(typeSelect);

            const opInput = document.createElement('input');
            opInput.type = 'range';
            opInput.className = 'layer-opacity';
            opInput.min = '0';
            opInput.max = '1';
            opInput.step = '0.1';
            opInput.value = layer.opacity;
            opInput.title = 'Opacity';
            controlsDiv.appendChild(opInput);

            const blendSelect = document.createElement('select');
            blendSelect.className = 'layer-blend-mode';
            blendSelect.title = 'Blend Mode';
            const blends = [['source-over', 'Normal'], ['multiply', 'Multiply'], ['screen', 'Screen'], ['overlay', 'Overlay']];
            blends.forEach(([val, text]) => {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = text;
                if (layer.blendMode === val) opt.selected = true;
                blendSelect.appendChild(opt);
            });
            controlsDiv.appendChild(blendSelect);

            const maskSelect = document.createElement('select');
            maskSelect.className = 'layer-mask-select';
            maskSelect.title = 'Mask Layer';
            const optNoMask = document.createElement('option');
            optNoMask.value = '';
            optNoMask.textContent = 'No Mask';
            maskSelect.appendChild(optNoMask);

            const planter = this.#planter;
            const stack = planter.getLayerStack();
            const currentIndex = stack.findIndex((l) => l.id === layer.id);
            const lowerLayers = stack.slice(0, currentIndex);
            lowerLayers.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.id;
                opt.textContent = `Mask: ${l.name}`;
                if (layer.maskLayerId == l.id) opt.selected = true;
                maskSelect.appendChild(opt);
            });
            controlsDiv.appendChild(maskSelect);

            contentDiv.appendChild(controlsDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'layer-actions';
            const btnCopy = document.createElement('button');
            btnCopy.className = 'icon-btn copy-mods';
            btnCopy.title = 'Copy Modifiers';
            btnCopy.textContent = '📄';
            actionsDiv.appendChild(btnCopy);

            const btnPaste = document.createElement('button');
            btnPaste.className = 'icon-btn paste-mods';
            btnPaste.title = 'Paste Modifiers';
            btnPaste.textContent = '📋';
            actionsDiv.appendChild(btnPaste);

            const btnDel = document.createElement('button');
            btnDel.className = 'icon-btn layer-delete-btn';
            btnDel.title = 'Delete Layer';
            btnDel.textContent = '🗑️';
            actionsDiv.appendChild(btnDel);

            item.appendChild(dragHandle);
            item.appendChild(contentDiv);
            item.appendChild(actionsDiv);
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

        let draggedLayerId = null;

        this.#container.addEventListener('dragstart', (e) => {
            const layerItem = e.target.closest('.layer-item');
            if (!layerItem) return;
            draggedLayerId = Number(layerItem.dataset.layerId);
            layerItem.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });

        this.#container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const layerItem = e.target.closest('.layer-item');

            // Clear borders on all other items to prevent lingering borders/flicker
            this.#container.querySelectorAll('.layer-item').forEach(item => {
                if (item !== layerItem) {
                    item.style.borderTop = '';
                    item.style.borderBottom = '';
                }
            });

            if (layerItem) {
                // Determine whether to insert above or below
                const rect = layerItem.getBoundingClientRect();
                const midPoint = rect.top + rect.height / 2;
                if (e.clientY < midPoint) {
                    layerItem.style.borderTop = '2px solid var(--accent)';
                    layerItem.style.borderBottom = '';
                } else {
                    layerItem.style.borderBottom = '2px solid var(--accent)';
                    layerItem.style.borderTop = '';
                }
            }
        });

        this.#container.addEventListener('dragleave', (e) => {
            const layerItem = e.target.closest('.layer-item');
            if (layerItem) {
                layerItem.style.borderTop = '';
                layerItem.style.borderBottom = '';
            }
        });

        this.#container.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetItem = e.target.closest('.layer-item');
            if (targetItem) {
                targetItem.style.borderTop = '';
                targetItem.style.borderBottom = '';
            }

            const draggedElement = this.#container.querySelector(`.layer-item[data-layer-id="${draggedLayerId}"]`);
            if (draggedElement) draggedElement.style.opacity = '1';

            if (!targetItem || draggedLayerId === null) return;

            const targetLayerId = Number(targetItem.dataset.layerId);
            if (draggedLayerId === targetLayerId) return;

            // Figure out the new index in the reversed stack
            const items = Array.from(this.#container.querySelectorAll('.layer-item'));
            const targetIndexUI = items.indexOf(targetItem);
            const rect = targetItem.getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;

            // If dropping below the midpoint, it means it goes "after" in the UI list
            let insertIndexUI = e.clientY > midPoint ? targetIndexUI + 1 : targetIndexUI;

            // Adjust index because Planter's stack is opposite of UI order
            // UI shows Top layer (index N-1) at UI index 0.
            const totalLayers = items.length;


            // If we are moving it up in the UI (down in the stack), the splice will shift things.
            // We'll let the reorderLayer method handle the exact placement since it removes then inserts.
            // But targetStackIndex needs to be correct for the splice target.

            // Simplest mapping: targetIndexUI maps to stack index (totalLayers - 1 - targetIndexUI)
            // But if we insert before or after, it changes.
            // Actually, a simpler way is to calculate the final desired order of IDs and pass the new index.

            // Let's calculate the target index in the actual stack.
            // UI index 0 -> stack index N-1
            // e.g., 3 layers (A, B, C), UI shows C (idx 0), B (idx 1), A (idx 2).
            // If we drag A and drop above C (insertIndexUI = 0). Target stack index = 3 (which will become 2 after removal of A, so just pass 2 or 3, splice handles it).
            // Actually, if we pass the target element's stack index, we can just say "put it at this index".
            // Let's find the stack index of the target.

            // reorderLayer handles the offset caused by removing the item first.

            // However, since reorderLayer uses splice, if we remove an item from below (lower index)
            // and insert above (higher index), the target index shifts by 1.
            // Let's pass the raw intended index and adjust in reorderLayer if needed, or adjust here.
            // Actually, a simpler robust way is: reorderLayer(layerId, index) means "make it so this layer is now at this index".
            // The formula to map insertIndexUI to final stack index is: totalLayers - insertIndexUI
            // (If insertIndexUI == 0, it means top of UI, so stack index == totalLayers. splice(totalLayers) will put it at end. Wait, totalLayers-1 is max index.
            // If we splice at totalLayers, it pushes it to the end. That's correct.
            let finalTargetStackIndex = totalLayers - insertIndexUI;

            const originalStackIndex = totalLayers - 1 - items.findIndex(el => Number(el.dataset.layerId) === draggedLayerId);
            if (originalStackIndex < finalTargetStackIndex) {
                 finalTargetStackIndex--; // Because we are removing it from below, everything shifts down.
            }

            this.#onLayerAction('reorder', draggedLayerId, Math.max(0, finalTargetStackIndex));
            draggedLayerId = null;
        });

        this.#container.addEventListener('dragend', (e) => {
             const layerItem = e.target.closest('.layer-item');
             if (layerItem) layerItem.style.opacity = '1';
             draggedLayerId = null;
        });

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
