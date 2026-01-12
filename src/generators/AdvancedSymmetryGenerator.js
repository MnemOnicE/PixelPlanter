/**
 * @file AdvancedSymmetryGenerator.js
 * @description Generates patterns with multiple symmetry modes (vertical, horizontal, quad, radial).
 */

/**
 * Generates patterns with complex symmetry modes including vertical, horizontal, quad, and radial.
 */
export class AdvancedSymmetryGenerator {
    /**
     * Indicates that this generator is structural and should be preserved during low-variance batch generation.
     * @returns {boolean}
     */
    get isStructural() {
        return true;
    }

    /**
     * Runs the generation algorithm.
     *
     * @param {object} config - The configuration object.
     * @param {number} config.size - The width and height of the grid.
     * @param {string} [config.symmetryMode='vertical'] - The type of symmetry to apply ('vertical', 'horizontal', 'quad', 'radial').
     * @param {SeededRandom} prng - The pseudo-random number generator instance.
     * @param {number[][]} [inputMask] - Optional mask. If provided, generation is restricted to non-zero pixels in this mask.
     * @returns {number[][]} A 2D array of numbers (0 for off, 1 for on).
     */
    run({ size, symmetryMode = 'vertical' }, prng, inputMask = null) {
        const dataGrid = Array.from({ length: size }, () => Array(size).fill(0));
        const midX = Math.ceil(size / 2);
        const midY = Math.ceil(size / 2);

        // --- Generation Phase ---
        if (symmetryMode === 'vertical') {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < midX; x++) {
                    if (inputMask && inputMask[y][x] === 0) continue;
                    dataGrid[y][x] = prng.next() < 0.5 ? 1 : 0;
                }
            }
        } else if (symmetryMode === 'horizontal') {
            for (let y = 0; y < midY; y++) {
                for (let x = 0; x < size; x++) {
                    if (inputMask && inputMask[y][x] === 0) continue;
                    dataGrid[y][x] = prng.next() < 0.5 ? 1 : 0;
                }
            }
        } else if (symmetryMode === 'quad') {
            for (let y = 0; y < midY; y++) {
                for (let x = 0; x < midX; x++) {
                    if (inputMask && inputMask[y][x] === 0) continue;
                    dataGrid[y][x] = prng.next() < 0.5 ? 1 : 0;
                }
            }
        } else if (symmetryMode === 'radial') {
            // For radial, we generate a 1D array of values from center to edge
            const radialSource = Array.from({ length: midX }, () => (prng.next() < 0.5 ? 1 : 0));
            const centerX = (size - 1) / 2;
            const centerY = (size - 1) / 2;
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (inputMask && inputMask[y][x] === 0) continue;

                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.floor(Math.sqrt(dx * dx + dy * dy));
                    if (distance < midX) {
                        dataGrid[y][x] = radialSource[distance];
                    }
                }
            }
            // For radial, mirroring is implicit in the generation, so we return early.
            return dataGrid;
        }

        // --- Mirroring Phase ---
        switch (symmetryMode) {
            case 'vertical':
                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < midX; x++) {
                        const mirrorX = size - 1 - x;
                        if (inputMask && inputMask[y][mirrorX] === 0) {
                            dataGrid[y][mirrorX] = 0;
                        } else {
                            dataGrid[y][mirrorX] = dataGrid[y][x];
                        }
                    }
                }
                break;
            case 'horizontal':
                for (let y = 0; y < midY; y++) {
                    for (let x = 0; x < size; x++) {
                        const mirrorY = size - 1 - y;
                        if (inputMask && inputMask[mirrorY][x] === 0) {
                            dataGrid[mirrorY][x] = 0;
                        } else {
                            dataGrid[mirrorY][x] = dataGrid[y][x];
                        }
                    }
                }
                break;
            case 'quad':
                // Mirror vertically (left to right)
                for (let y = 0; y < midY; y++) {
                    for (let x = 0; x < midX; x++) {
                        const mirrorX = size - 1 - x;
                        if (inputMask && inputMask[y][mirrorX] === 0) {
                            dataGrid[y][mirrorX] = 0;
                        } else {
                            dataGrid[y][mirrorX] = dataGrid[y][x];
                        }
                    }
                }
                // Mirror horizontally (top to bottom)
                // Note: We need to mirror the *entire* top half (including what we just mirrored left-to-right)
                for (let y = 0; y < midY; y++) {
                    for (let x = 0; x < size; x++) {
                        const mirrorY = size - 1 - y;
                        if (inputMask && inputMask[mirrorY][x] === 0) {
                            dataGrid[mirrorY][x] = 0;
                        } else {
                            dataGrid[mirrorY][x] = dataGrid[y][x];
                        }
                    }
                }
                break;
        }

        return dataGrid;
    }
}
