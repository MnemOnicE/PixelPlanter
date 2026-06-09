const fs = require('fs');
const file = 'src/ui/LayerPanel.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        this.#container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const layerItem = e.target.closest('.layer-item');
            if (layerItem) {`;

const newStr = `        this.#container.addEventListener('dragover', (e) => {
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

            if (layerItem) {`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(file, content);
