// Filename: src/modifiers/ParticleModifier.js

export class ParticleModifier {
    // --- PARAMETER DEFINITIONS ---
    static params = {
        particleCount: {
            label: 'Particle Count',
            type: 'slider', min: 10, max: 500, step: 10, defaultValue: 100
        },
        particleValue: {
            label: 'Particle Value', // The grid value to draw particles with.
            type: 'slider', min: 1, max: 5, step: 1, defaultValue: 2
        }
    };

    // --- APPLY METHOD ---
    apply(dataGrid, { particleCount = 100, particleValue = 2 }, prng) {
        const outputGrid = JSON.parse(JSON.stringify(dataGrid));
        const size = dataGrid.length;

        for (let i = 0; i < particleCount; i++) {
            // 1. Choose a random starting column for the particle to drop from.
            const startX = Math.floor(prng.next() * size);

            // 2. Simulate the particle falling straight down.
            for (let y = 0; y < size; y++) {
                // Check if the current cell is a solid surface.
                if (outputGrid[y][startX] > 0) {
                    // The cell below is solid. Check if the cell *above* it is empty.
                    if (y > 0 && outputGrid[y - 1][startX] === 0) {
                        // It's a valid surface to land on. Place the particle.
                        outputGrid[y - 1][startX] = particleValue;
                    }
                    // Stop this particle's drop, whether it landed or not.
                    break;
                }

                // If we reach the very bottom of the grid without hitting anything...
                if (y === size - 1 && outputGrid[y][startX] === 0) {
                    // ...the particle lands on the floor.
                    outputGrid[y][startX] = particleValue;
                }
            }
        }

        return outputGrid;
    }
}
