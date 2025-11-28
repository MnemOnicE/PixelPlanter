/**
 * @file Pattern.js
 * @description Defines the Pattern class for storing user-defined pattern data.
 */

/**
 * A simple container for a user-defined pattern.
 * Holds the pattern's name and its 2D grid representation.
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
     *
     * @param {string} name - The name of the pattern.
     * @param {number[][]} dataGrid - The 2D array representing the pattern's shape.
     */
    constructor(name, dataGrid) {
        this.name = name;
        this.dataGrid = dataGrid;
    }
}
