/**
 * @file ParticleModifier.js
 * @description Simulates gravity on pixels, causing them to fall until they hit a surface.
 */

/**
 * Simulates particle deposition/gravity.
 * Pixels fall until they encounter a solid pixel in the layer below or the bottom of the grid.
 */
export class ParticleModifier {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {};

    /**
     * Applies the particle deposition logic.
     *
     * @param {number[][]} dataGrid - The current layer's grid.
     * @param {object} config - The configuration object (unused).
     * @param {SeededRandom} prng - The pseudo-random number generator (unused).
     * @param {number[][]} readBelowGrid - The composite grid of all layers below this one.
     * @returns {number[][]} A new grid with the particles dropped.
     */
    apply(dataGrid, config, prng, readBelowGrid) {
        // Create a deep copy to avoid modifying the original grid during iteration.
        const outputGrid = JSON.parse(JSON.stringify(dataGrid));
        const size = dataGrid.length;

        // If there's no grid below us, we can't simulate gravity. Return the original.
        if (readBelowGrid === null) {
            console.warn('ParticleModifier requires a layer below it to function.');
            return outputGrid;
        }

        // Loop through the current layer's grid to find "particles" (pixels > 0).
        // We iterate from the bottom up to handle particles correctly in one pass.
        for (let y = size - 1; y >= 0; y--) {
            for (let x = 0; x < size; x++) {
                // We check the *original* dataGrid for a particle.
                if (dataGrid[y][x] > 0) {
                    const particleValue = dataGrid[y][x];
                    outputGrid[y][x] = 0; // Pick it up from its original spot in the output.

                    // --- SMART LOGIC: Simulate the drop using readBelowGrid ---
                    let landed = false;
                    for (let dropY = y; dropY < size; dropY++) {
                        // Check if the space *below* in the composite grid is solid.
                        if (dropY + 1 < size && readBelowGrid[dropY + 1][x] > 0) {
                            // Land the particle here.
                            outputGrid[dropY][x] = particleValue;
                            landed = true;
                            break; // Stop this particle's drop.
                        }
                    }

                    // If it never found a surface, it lands on the floor.
                    if (!landed) {
                        outputGrid[size - 1][x] = particleValue;
                    }
                }
            }
        }
        return outputGrid;
    }
}
