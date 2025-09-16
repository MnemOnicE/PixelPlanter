/**
 * @class Pattern
 * A simple container for a user-defined pattern.
 */
export class Pattern {
    /**
     * A string to identify the pattern (e.g., "crosshair", "my-brush").
     * @type {string}
     */
    name;

    /**
     * A 2D array (like our other grids) that holds the shape of the pattern.
     * @type {number[][]}
     */
    dataGrid;

    /**
     * Creates an instance of the Pattern class.
     * @param {string} name - The name of the pattern.
     * @param {number[][]} dataGrid - The 2D array representing the pattern's shape.
     */
    constructor(name, dataGrid) {
        this.name = name;
        this.dataGrid = dataGrid;
    }
}
