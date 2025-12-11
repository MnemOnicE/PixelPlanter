
import { Planter } from '../src/Planter.js';
import 'jest-environment-jsdom';

describe('Drawing Tools', () => {
    let planter;

    beforeEach(() => {
        planter = new Planter({ size: 10, pixelSize: 1 });
    });

    test('floodFillLayer fills connected region', () => {
        const layer = planter.addLayer({ generator: 'noise' });

        // Initialize 10x10 grid with 0s
        layer.dataGrid = Array.from({ length: 10 }, () => Array(10).fill(0));

        // Create a ring of 1s
        // 0 0 0 0 0
        // 0 1 1 1 0
        // 0 1 0 1 0
        // 0 1 1 1 0
        // 0 0 0 0 0

        const ringPoints = [
            {x:1, y:1}, {x:2, y:1}, {x:3, y:1},
            {x:1, y:2},             {x:3, y:2},
            {x:1, y:3}, {x:2, y:3}, {x:3, y:3}
        ];

        for (const p of ringPoints) {
            layer.dataGrid[p.y][p.x] = 1;
        }

        // Fill the center hole (2,2) with 2
        planter.floodFillLayer(layer.id, 2, 2, 2);
        expect(layer.dataGrid[2][2]).toBe(2);
        expect(layer.dataGrid[2][1]).toBe(1); // Boundary preserved

        // Fill the ring with 3
        planter.floodFillLayer(layer.id, 1, 1, 3);
        expect(layer.dataGrid[1][1]).toBe(3);
        expect(layer.dataGrid[2][1]).toBe(3);
        expect(layer.dataGrid[2][2]).toBe(2); // Inner hole preserved
        expect(layer.dataGrid[0][0]).toBe(0); // Outside preserved
    });

    test('drawOnLayer modifies grid correctly', () => {
         const layer = planter.addLayer({ generator: 'noise' });
         const points = [{x: 5, y: 5}, {x: 6, y: 6}];
         planter.drawOnLayer(layer.id, points, 9);
         expect(layer.dataGrid[5][5]).toBe(9);
         expect(layer.dataGrid[6][6]).toBe(9);
         expect(layer.dataGrid[5][6]).toBe(0); // Unchanged
    });
});
