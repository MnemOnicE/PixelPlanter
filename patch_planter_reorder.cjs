const fs = require('fs');
const file = 'src/Planter.js';
let content = fs.readFileSync(file, 'utf8');

const newMethod = `    /**
     * Reorders a layer by moving it to a specific index.
     * @param {number} layerId - The ID of the layer to move.
     * @param {number} targetIndex - The index to move it to.
     */
    reorderLayer(layerId, targetIndex) {
        const index = this.#layerStack.findIndex((l) => l.id === layerId);
        if (index === -1) return;

        const [layer] = this.#layerStack.splice(index, 1);
        this.#layerStack.splice(targetIndex, 0, layer);
    }`;

// Insert after moveLayer
content = content.replace(
    /        \} else if \(direction === 'down' && index > 0\) \{\n            \[this\.#layerStack\[index\], this\.#layerStack\[index - 1\]\] = \[\n                this\.#layerStack\[index - 1\],\n                this\.#layerStack\[index\],\n            \];\n        \}\n    \}/,
    `        } else if (direction === 'down' && index > 0) {\n            [this.#layerStack[index], this.#layerStack[index - 1]] = [\n                this.#layerStack[index - 1],\n                this.#layerStack[index],\n            ];\n        }\n    }\n\n${newMethod}`
);

fs.writeFileSync(file, content);
