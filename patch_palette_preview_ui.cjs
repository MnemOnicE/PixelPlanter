const fs = require('fs');
const file = 'src/UIManager.js';
let content = fs.readFileSync(file, 'utf8');

// bindDOM
content = content.replace(
    /        this\.#controls\.paletteSelect = document\.getElementById\('palette-select'\);/,
    `        this.#controls.paletteSelect = document.getElementById('palette-select');\n        this.#controls.paletteSwatches = document.getElementById('palette-swatches');`
);

// attachEventListeners
content = content.replace(
    /        this\.#controls\.toolRadios\.forEach\(\(radio\) => \{/,
    `        this.#controls.paletteSelect.addEventListener('change', () => this.#updatePaletteSwatches());\n\n        this.#controls.toolRadios.forEach((radio) => {`
);

// updatePaletteSwatches method
const newMethod = `
    /**
     * Updates the color swatches below the palette dropdown.
     * @private
     */
    #updatePaletteSwatches() {
        if (!this.#controls.paletteSwatches) return;
        this.#controls.paletteSwatches.textContent = '';
        const selectedPaletteName = this.#controls.paletteSelect.value;
        const paletteInstance = this.#planterInstance.getPaletteInstance(selectedPaletteName);

        if (paletteInstance && paletteInstance.colors) {
            paletteInstance.colors.forEach(colorHex => {
                const swatch = document.createElement('div');
                swatch.className = 'swatch';
                swatch.style.backgroundColor = colorHex;
                swatch.title = colorHex;
                this.#controls.paletteSwatches.appendChild(swatch);
            });
        }
    }
`;

content = content.replace(
    /    #populatePaletteOptions\(\) \{/,
    `${newMethod}\n    #populatePaletteOptions() {`
);

// Call updatePaletteSwatches when options are populated or when loading/updating from layer
content = content.replace(
    /        \}\);\n    \}\n\n    \/\*\*\n     \* Populates the modifier checkbox list\./,
    `        });\n        this.#updatePaletteSwatches();\n    }\n\n    /**\n     * Populates the modifier checkbox list.`
);

content = content.replace(
    /        this\.#controls\.paletteSelect\.value = config\.palette;/,
    `        this.#controls.paletteSelect.value = config.palette;\n        this.#updatePaletteSwatches();`
);


fs.writeFileSync(file, content);
