/**
 * @file OutlineModifier.js
 * @description Adds an outline around shapes in the grid.
 */

/**
 * Adds a 1-pixel outline around all "on" (value > 0) pixels.
 * Used for emphasizing shapes or creating borders.
 */
export class OutlineModifier {
    /**
     * Applies the outline modification.
     *
     * @param {number[][]} dataGrid - The incoming 2D array from the generator or a previous modifier.
     * @param {object} [config={}] - An object for modifier-specific settings (unused here but standard signature).
     * @returns {number[][]} A new, modified 2D array with outlines applied.
     */
    apply(dataGrid, config = {}, prng = null, readBelowGrid = null, activeMask = null) {
        const height = dataGrid.length;
        if (height === 0) return [];
        const width = dataGrid[0].length;
        if (width === 0) return [];

        // Create a deep copy of the original dataGrid to serve as our output grid.
        const outputGrid = dataGrid.map((row) => [...row]);

        // Define the value to use for the outline.
        // Assuming > 0 is "on", we use 2 to distinguish or just ensure it's on.
        // The palette mapper should handle values > 0 as "on".
        const outlineValue = 2;

        // Iterate over every cell (y, x) in the original `dataGrid`.
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // IF the current cell's value is 0 (it's empty space):
                // If there's an active mask, only apply outline if the current cell is within the mask.
                if (activeMask && activeMask[y] && activeMask[y][x] === 0) {
                    continue; // Skip masked-out areas
                }

                // IF the current cell's value is 0 (it's empty space):
                if (dataGrid[y][x] === 0) {
                    // Check its four direct neighbors (up, down, left, right).
                    const neighbors = [
                        y > 0 && dataGrid[y - 1][x], // Up
                        y < height - 1 && dataGrid[y + 1][x], // Down
                        x > 0 && dataGrid[y][x - 1], // Left
                        x < width - 1 && dataGrid[y][x + 1], // Right
                    ];

                    // IF any neighbor has a value > 0 (it's part of the shape):
                    if (neighbors.some((neighborValue) => neighborValue > 0)) {
                        // This empty cell is on the border of the shape.
                        // In the `outputGrid` at position (y, x), set the value to `outlineValue`.
                        outputGrid[y][x] = outlineValue;
                    }
                }
            }
        }

        // Return the `outputGrid` which contains the original shape PLUS the new outline pixels.
        return outputGrid;
    }
}
