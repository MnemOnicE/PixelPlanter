// == OutlineModifier Pseudocode ==

// CLASS OutlineModifier
// Adds a 1-pixel outline around all "on" (value > 0) pixels.
export class OutlineModifier {
    // METHOD apply
    // PARAMETERS:
    //  - dataGrid: The incoming 2D array from the generator or a previous modifier.
    //  - config (optional): An object for modifier-specific settings, like outline color/value.
    // RETURNS: A new, modified 2D array.
    apply(dataGrid, config = {}) {
        const height = dataGrid.length;
        if (height === 0) return [];
        const width = dataGrid[0].length;
        if (width === 0) return [];

        // Create a deep copy of the original dataGrid to serve as our output grid.
        const outputGrid = dataGrid.map(row => [...row]);

        // Define the value to use for the outline.
        const outlineValue = 2;

        // Iterate over every cell (y, x) in the original `dataGrid`.
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // IF the current cell's value is 0 (it's empty space):
                if (dataGrid[y][x] === 0) {
                    // Check its four direct neighbors (up, down, left, right).
                    const neighbors = [
                        y > 0 && dataGrid[y - 1][x],         // Up
                        y < height - 1 && dataGrid[y + 1][x], // Down
                        x > 0 && dataGrid[y][x - 1],         // Left
                        x < width - 1 && dataGrid[y][x + 1]    // Right
                    ];

                    // IF any neighbor has a value > 0 (it's part of the shape):
                    if (neighbors.some(neighborValue => neighborValue > 0)) {
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
