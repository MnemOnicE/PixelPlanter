/**
 * @file PatternGenerator.js
 * @description Stamps a pre-defined pattern onto the grid.
 */

/**
 * Places a user-selected pattern onto the grid at a specified offset.
 * Useful for stamping specific shapes or brushes.
 */
export class PatternGenerator {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {
        patternName: {
            label: 'Pattern',
            type: 'select',
            optionsSource: 'patterns',
            defaultValue: '',
        },
        x: { label: 'X Offset', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 50 },
        y: { label: 'Y Offset', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 50 },
    };

    /**
     * Runs the pattern placement algorithm.
     *
     * @param {object} config - The configuration object.
     * @param {number} config.size - The grid size.
     * @param {number[][]} [config.patternData] - The 2D array data of the pattern to stamp.
     * @param {number} [config.x=50] - X offset percentage (0-100).
     * @param {number} [config.y=50] - Y offset percentage (0-100).
     * @param {SeededRandom} prng - The pseudo-random number generator (unused but part of signature).
     * @returns {number[][]} The generated grid.
     */
    run({ size, patternData, x, y }, prng) {
        const dataGrid = Array.from({ length: size }, () => Array(size).fill(0));

        if (!patternData) {
            // This is expected if no pattern is selected, so not a warning.
            return dataGrid;
        }

        const patternHeight = patternData.length;
        const patternWidth = patternData[0]?.length || 0;

        if (patternHeight === 0 || patternWidth === 0) {
            return dataGrid;
        }

        // Calculate top-left corner based on percentage offsets
        const totalX = size - patternWidth;
        const totalY = size - patternHeight;
        const startX = Math.floor((x / 100) * totalX);
        const startY = Math.floor((y / 100) * totalY);

        // Copy pattern to dataGrid
        for (let pY = 0; pY < patternHeight; pY++) {
            for (let pX = 0; pX < patternWidth; pX++) {
                const gridX = startX + pX;
                const gridY = startY + pY;

                // Bounds check
                if (gridX >= 0 && gridX < size && gridY >= 0 && gridY < size) {
                    if (patternData[pY][pX] > 0) {
                        dataGrid[gridY][gridX] = 1;
                    }
                }
            }
        }

        return dataGrid;
    }
}
