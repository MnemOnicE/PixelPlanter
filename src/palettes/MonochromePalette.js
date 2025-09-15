/**
 * @class MonochromePalette
 * Maps a 2D data grid to a simple black and white color scheme.
 */
export class MonochromePalette {
    /**
     * Maps the abstract data grid to a color grid.
     * @param {number[][]} dataGrid - The grid from the generator (containing 0s and 1s).
     * @returns {string[][]} A 2D array of color strings.
     */
    map(dataGrid) {
        // Define the colors. The first color corresponds to a value of 0, the second to 1, etc.
        const colors = ['#FFFFFF', '#000000']; // 0 = White, 1 = Black

        // Use the .map() array method for a clean transformation.
        // This iterates through each row of the dataGrid.
        return dataGrid.map(row => {
            // Then iterates through each value in the current row.
            return row.map(value => {
                // The value (0 or 1) is used as an index to pick the correct color.
                return colors[value];
            });
        });
    }
}
