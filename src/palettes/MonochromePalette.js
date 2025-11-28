/**
 * @file MonochromePalette.js
 * @description Defines the MonochromePalette class for black and white color mapping.
 */

/**
 * Maps a 2D data grid to a simple black and white color scheme.
 * Implements the palette interface expected by the Planter.
 */
export class MonochromePalette {
    /**
     * Maps the abstract data grid to a color grid.
     *
     * @param {number[][]} dataGrid - The grid from the generator (containing 0s and 1s).
     * @returns {string[][]} A 2D array of color strings (hex codes).
     */
    map(dataGrid) {
        // Define the colors. The first color corresponds to a value of 0, the second to 1, etc.
        const colors = ['#FFFFFF', '#000000']; // 0 = White, 1 = Black

        // Use the .map() array method for a clean transformation.
        // This iterates through each row of the dataGrid.
        return dataGrid.map(row => {
            // Then iterates through each value in the current row.
            return row.map(value => {
                // If value is 0, return white. Otherwise, for any non-zero value, return black.
                return value === 0 ? colors[0] : colors[1];
            });
        });
    }
}
