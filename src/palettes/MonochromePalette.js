/**
 * @class MonochromePalette
 * A simple palette that maps binary data (0 or 1) to two colors.
 * In this case, 0 is treated as transparent and 1 is black.
 */
export class MonochromePalette {
    /**
     * Maps a 2D data grid of numbers to a 2D grid of color strings.
     * @param {number[][]} dataGrid - The input grid from a generator.
     * @returns {Array<Array<(string|null)>>} A 2D array of color strings or nulls.
     */
    map(dataGrid) {
        // Use the Array.prototype.map function for a concise transformation.
        return dataGrid.map(row => {
            return row.map(value => {
                // If the value is 1, return black.
                if (value === 1) {
                    return '#000000'; // Black
                }
                // Otherwise, return null for transparency.
                return null;
            });
        });
    }
}
