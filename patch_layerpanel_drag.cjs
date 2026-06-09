const fs = require('fs');
const file = 'src/ui/LayerPanel.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add draggable to layer item
content = content.replace(
    /            item\.className = 'layer-item';/,
    `            item.className = 'layer-item';\n            item.draggable = true;`
);

// 2. Add drag event listeners
const dragListeners = `
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

            const draggedElement = this.#container.querySelector(\`.layer-item[data-layer-id="\${draggedLayerId}"]\`);
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
            let targetStackIndex = totalLayers - insertIndexUI;

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
            let stackIndex = totalLayers - 1 - targetIndexUI;
            if (e.clientY < midPoint) {
                // Dropped above in UI -> means it goes to a HIGHER stack index
                stackIndex = stackIndex + 1;
            }
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
`;

content = content.replace(
    /        this\.#container\.addEventListener\('click', \(e\) => \{/,
    `${dragListeners}\n        this.#container.addEventListener('click', (e) => {`
);

fs.writeFileSync(file, content);
