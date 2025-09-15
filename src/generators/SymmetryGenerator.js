/**
 * @class SymmetryGenerator
 * A generator that creates a vertically symmetrical pattern.
 * It populates the left half of the grid with random values and mirrors them to the right half.
 */
export class SymmetryGenerator {
    /**
     * Executes the generator to create a data grid.
     * @param {object} config - The configuration object from the Planter.
     * @param {number} config.size - The width and height of the grid.
     * @returns {number[][]} A 2D array of numbers (0 or 1) representing the pixel data.
     */
    run({ size }) {
        // Create an empty 2D array, initialized with zeros.
        const dataGrid = Array(size).fill(0).map(() => Array(size).fill(0));

        // Calculate the midpoint. We use Math.ceil to handle odd sizes correctly.
        const midX = Math.ceil(size / 2);

        // Iterate over each row.
        for (let y = 0; y < size; y++) {
            // Iterate over the left half of the columns.
            for (let x = 0; x < midX; x++) {
                // Generate a random value (0 or 1 for a binary pattern).
                const value = Math.random() > 0.5 ? 1 : 0;

                // Set the value on the left side.
                dataGrid[y][x] = value;

                // Mirror the value to the right side.
                // The check `x < size - 1 - x` prevents overwriting the center column on odd-sized grids.
                if (x < size - 1 - x) {
                    dataGrid[y][size - 1 - x] = value;
                }
            }
        }

        return dataGrid;
    }
}
