// == AdvancedSymmetryGenerator Pseudocode ==

// CLASS AdvancedSymmetryGenerator
export class AdvancedSymmetryGenerator {
    // METHOD run
    // PARAMETERS: config, prng
    run({ size, symmetryMode = 'vertical' }, prng) {
        const dataGrid = Array.from({ length: size }, () => Array(size).fill(0));
        const midX = Math.ceil(size / 2);
        const midY = Math.ceil(size / 2);

        // --- Generation Phase ---
        if (symmetryMode === 'vertical') {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < midX; x++) {
                    dataGrid[y][x] = prng.next() < 0.5 ? 1 : 0;
                }
            }
        } else if (symmetryMode === 'horizontal') {
            for (let y = 0; y < midY; y++) {
                for (let x = 0; x < size; x++) {
                    dataGrid[y][x] = prng.next() < 0.5 ? 1 : 0;
                }
            }
        } else if (symmetryMode === 'quad') {
            for (let y = 0; y < midY; y++) {
                for (let x = 0; x < midX; x++) {
                    dataGrid[y][x] = prng.next() < 0.5 ? 1 : 0;
                }
            }
        } else if (symmetryMode === 'radial') {
            // For radial, we generate a 1D array of values from center to edge
            const radialSource = Array.from({ length: midX }, () => prng.next() < 0.5 ? 1 : 0);
            const centerX = (size - 1) / 2;
            const centerY = (size - 1) / 2;
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
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
                        dataGrid[y][size - 1 - x] = dataGrid[y][x];
                    }
                }
                break;
            case 'horizontal':
                for (let y = 0; y < midY; y++) {
                    for (let x = 0; x < size; x++) {
                        dataGrid[size - 1 - y][x] = dataGrid[y][x];
                    }
                }
                break;
            case 'quad':
                // Mirror vertically
                for (let y = 0; y < midY; y++) {
                    for (let x = 0; x < midX; x++) {
                        dataGrid[y][size - 1 - x] = dataGrid[y][x];
                    }
                }
                // Mirror horizontally
                for (let y = 0; y < midY; y++) {
                    for (let x = 0; x < size; x++) {
                        dataGrid[size - 1 - y][x] = dataGrid[y][x];
                    }
                }
                break;
        }

        return dataGrid;
    }
}
