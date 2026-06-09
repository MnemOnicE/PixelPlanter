const fs = require('fs');
const file = 'src/UIManager.js';
let content = fs.readFileSync(file, 'utf8');

const newCase = `            case 'reorder':
                this.#planterInstance.reorderLayer(layerId, value);
                this.#renderLayerPanel();
                this.#saveState();
                break;`;

content = content.replace(
    /            case 'moveDown':\n                this\.#planterInstance\.moveLayer\(layerId, 'down'\);\n                this\.#renderLayerPanel\(\);\n                this\.#saveState\(\);\n                break;/,
    `            case 'moveDown':\n                this.#planterInstance.moveLayer(layerId, 'down');\n                this.#renderLayerPanel();\n                this.#saveState();\n                break;\n${newCase}`
);

fs.writeFileSync(file, content);
