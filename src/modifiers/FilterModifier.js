/**
 * @file FilterModifier.js
 * @description A logic block modifier that returns a selection mask based on a condition,
 * rather than modifying the grid directly. Used for conditional pipeline branching.
 */

export class FilterModifier {
    /**
     * Indicates to the Planter engine that this is a logic block,
     * so its return value should be treated as a mask, not a replacement for the grid.
     */
    get isLogicBlock() {
        return true;
    }

    /**
     * Evaluates a condition and returns a selection mask.
     *
     * @param {number[][]} dataGrid - The incoming 2D array.
     * @param {object} config - Configuration including the condition.
     * @param {string} config.condition - The type of filter ('color', 'empty', 'not-empty', etc.)
     * @param {number} config.targetValue - The value to match against (for 'color' or 'value' conditions).
     * @param {object} [prng] - The PRNG instance.
     * @param {number[][]} [readBelowGrid] - The composite grid of layers below.
     * @param {number[][]} [activeMask] - An existing mask passed down from a parent logic block.
     * @returns {number[][]} A new 2D mask array (1s and 0s) where the condition is met.
     */
    apply(dataGrid, config = {}, prng, activeMask = null) {
        const height = dataGrid.length;
        if (height === 0) return [];
        const width = dataGrid[0].length;
        if (width === 0) return [];

        const condition = config.condition || 'not-empty';
        const targetValue = config.targetValue !== undefined ? config.targetValue : 1;

        // Create an empty mask initialized to 0s
        const resultMask = Array.from({ length: height }, () => Array(width).fill(0));

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // If there's an active parent mask and this pixel is masked out, skip it
                if (activeMask && activeMask[y] && activeMask[y][x] === 0) {
                    continue;
                }

                const pixelValue = dataGrid[y][x];
                let isMatch = false;

                switch (condition) {
                    case 'value':
                    case 'color':
                        // Exact match
                        isMatch = pixelValue === targetValue;
                        break;
                    case 'empty':
                        // Empty pixel
                        isMatch = pixelValue === 0;
                        break;
                    case 'not-empty':
                        // Any drawn pixel
                        isMatch = pixelValue > 0;
                        break;
                    case 'edge':
                        // Check if it's an edge (drawn pixel next to an empty pixel)
                        if (pixelValue > 0) {
                            const neighbors = [
                                y > 0 ? dataGrid[y - 1][x] : 0,
                                y < height - 1 ? dataGrid[y + 1][x] : 0,
                                x > 0 ? dataGrid[y][x - 1] : 0,
                                x < width - 1 ? dataGrid[y][x + 1] : 0
                            ];
                            isMatch = neighbors.some(n => n === 0);
                        }
                        break;
                    default:
                        // Default to matching everything (pass-through if unknown condition)
                        isMatch = true;
                }

                if (isMatch) {
                    resultMask[y][x] = 1;
                }
            }
        }

        return resultMask;
    }
}
