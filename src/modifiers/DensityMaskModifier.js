/**
 * @file DensityMaskModifier.js
 * @description Modifies the density of the grid by randomly removing pixels.
 */

/**
 * Reduces the density of the pattern by culling pixels.
 * Supports asymmetric culling to create gradients (e.g., fading out to the left).
 */
export class DensityMaskModifier {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {
        density: {
            label: 'Density',
            type: 'slider',
            min: 0.1,
            max: 1.0,
            step: 0.05,
            defaultValue: 0.8,
        },
        asymmetry: {
            label: 'Asymmetry',
            type: 'select',
            options: ['none', 'left-heavy', 'right-heavy', 'top-heavy', 'bottom-heavy'],
            defaultValue: 'none',
        }
    };

    /**
     * Applies the density modification to the data grid.
     *
     * @param {number[][]} dataGrid - The incoming 2D array.
     * @param {object} config - An object for modifier-specific settings.
     * @param {number} [config.density=0.8] - The target density of the output.
     * @param {string} [config.asymmetry='none'] - The asymmetry mode.
     * @param {SeededRandom} prng - The pseudo-random number generator instance.
     * @returns {number[][]} A new, modified 2D array.
     */
    apply(dataGrid, config = {}, prng) {
        const outputGrid = dataGrid.map(row => [...row]);
        const density = (config.density === undefined || config.density === null) ? 0.8 : config.density;
        const asymmetry = config.asymmetry || 'none';
        const size = dataGrid.length;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (outputGrid[y][x] > 0) { // If the pixel is "on"
                    let cullProbability = 1.0 - density;

                    // Adjust cullProbability based on the asymmetry mode
                    if (asymmetry === 'left-heavy') {
                        cullProbability += (x / size) * 0.5;
                    } else if (asymmetry === 'right-heavy') {
                        cullProbability += (1.0 - (x / size)) * 0.5;
                    } else if (asymmetry === 'top-heavy') {
                        cullProbability += (y / size) * 0.5;
                    } else if (asymmetry === 'bottom-heavy') {
                        cullProbability += (1.0 - (y / size)) * 0.5;
                    }

                    if (prng.next() < cullProbability) {
                        outputGrid[y][x] = 0; // Remove the pixel
                    }
                }
            }
        }

        return outputGrid;
    }
}
