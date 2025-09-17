// Filename: src/modifiers/ParticleModifier.js (Updated to use context)

export class ParticleModifier {
    // This modifier no longer needs its own parameters, as it operates on existing data.
    // We leave the static property for consistency, but it can be empty.
    static params = {};

    // --- UPDATED APPLY METHOD ---
    // Now accepts the `readBelowGrid`.
    apply(dataGrid, config, prng, readBelowGrid) {
        // Create a deep copy to avoid modifying the original grid during iteration.
        const outputGrid = JSON.parse(JSON.stringify(dataGrid));
        const size = dataGrid.length;

        // If there's no grid below us, we can't simulate gravity. Return the original.
        if (readBelowGrid === null) {
            console.warn("ParticleModifier requires a layer below it to function.");
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
