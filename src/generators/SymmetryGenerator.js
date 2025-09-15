/**
 * @class SymmetryGenerator
 * Generates a 2D data grid representing a vertically symmetrical pattern.
 */
export class SymmetryGenerator {
    /**
     * Runs the generation algorithm.
     * @param {object} config - The configuration object from the Planter instance.
     * @param {number} config.size - The width and height of the grid.
     * @param {boolean} [config.allowBlank=false] - If true, allows the generator to produce a completely empty grid.
     * @returns {number[][]} A 2D array of numbers (0 for off, 1 for on).
     */
    run({ size, allowBlank = false }) { // We've added the new 'allowBlank' parameter here
        const dataGrid = Array.from({ length: size }, () => Array(size).fill(0));
        const midPoint = Math.ceil(size / 2);

        // --- THE FIX (NOW CONDITIONAL) ---
        // We only run this block if 'allowBlank' is false.
        if (!allowBlank) {
            const guaranteedY = Math.floor(Math.random() * size);
            const guaranteedX = Math.floor(Math.random() * midPoint);
            dataGrid[guaranteedY][guaranteedX] = 1;
        }

        // The rest of the generation logic is identical
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < midPoint; x++) {
                // We must ensure we don't overwrite the guaranteed pixel if it was just placed.
                if (!allowBlank && dataGrid[y][x] === 1) {
                    continue;
                }
                const value = Math.random() < 0.5 ? 1 : 0;
                dataGrid[y][x] = value;
            }
        }

        // Mirroring algorithm remains the same
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < midPoint; x++) {
                const mirrorX = size - 1 - x;
                dataGrid[y][mirrorX] = dataGrid[y][x];
            }
        }

        return dataGrid;
    }
}
