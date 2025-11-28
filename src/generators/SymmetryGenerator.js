/**
 * @file SymmetryGenerator.js
 * @description Generates a vertically symmetrical pattern.
 */

/**
 * Generates a 2D data grid representing a vertically symmetrical pattern.
 * Creates a random pattern on the left half and mirrors it to the right.
 */
export class SymmetryGenerator {
    /**
     * Runs the generation algorithm.
     *
     * @param {object} config - The configuration object from the Planter instance.
     * @param {number} config.size - The width and height of the grid.
     * @param {boolean} [config.allowBlank=false] - If true, allows the generator to produce a completely empty grid.
     * @param {SeededRandom} prng - The pseudo-random number generator instance.
     * @returns {number[][]} A 2D array of numbers (0 for off, 1 for on).
     */
    run({ size, allowBlank = false }, prng) {
        const dataGrid = Array.from({ length: size }, () => Array(size).fill(0));
        const midPoint = Math.ceil(size / 2);

        // We only run this block if 'allowBlank' is false.
        // It ensures at least one pixel is turned on.
        if (!allowBlank) {
            const guaranteedY = Math.floor(prng.next() * size);
            const guaranteedX = Math.floor(prng.next() * midPoint);
            dataGrid[guaranteedY][guaranteedX] = 1;
        }

        // Iterate through the left half of the grid
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < midPoint; x++) {
                // We must ensure we don't overwrite the guaranteed pixel if it was just placed.
                if (!allowBlank && dataGrid[y][x] === 1) {
                    continue;
                }
                const value = prng.next() < 0.5 ? 1 : 0;
                dataGrid[y][x] = value;
            }
        }

        // Mirror the left half to the right half
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < midPoint; x++) {
                const mirrorX = size - 1 - x;
                dataGrid[y][mirrorX] = dataGrid[y][x];
            }
        }

        return dataGrid;
    }
}
