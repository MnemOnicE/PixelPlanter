import { jest } from '@jest/globals';
import { Planter } from '../src/Planter.js';

describe('Layer Movement Bug', () => {
    let planter;

    beforeEach(() => {
        planter = new Planter({ size: 10 });
    });

    it('should move layer UP correctly (visually towards foreground / higher index)', () => {
        // Stack order 0 (Bottom) -> 1 (Top)
        const layerA = planter.addLayer({ name: 'A' });
        const layerB = planter.addLayer({ name: 'B' });
        const layerC = planter.addLayer({ name: 'C' });

        // Initial state: [A, B, C]
        // Indices: A=0, B=1, C=2
        let stack = planter.getLayerStack();
        expect(stack[0].id).toBe(layerA.id);
        expect(stack[1].id).toBe(layerB.id);
        expect(stack[2].id).toBe(layerC.id);

        // Move B (index 1) UP. It should swap with C (index 2).
        // Expected result: [A, C, B]
        planter.moveLayer(layerB.id, 'up');

        stack = planter.getLayerStack();
        expect(stack[0].id).toBe(layerA.id);
        expect(stack[1].id).toBe(layerC.id);
        expect(stack[2].id).toBe(layerB.id);
    });

    it('should move layer DOWN correctly (visually towards background / lower index)', () => {
        // Stack order 0 (Bottom) -> 1 (Top)
        const layerA = planter.addLayer({ name: 'A' });
        const layerB = planter.addLayer({ name: 'B' });
        const layerC = planter.addLayer({ name: 'C' });

        // Move B (index 1) DOWN. It should swap with A (index 0).
        // Expected result: [B, A, C]
        planter.moveLayer(layerB.id, 'down');

        const stack = planter.getLayerStack();
        expect(stack[0].id).toBe(layerB.id);
        expect(stack[1].id).toBe(layerA.id);
        expect(stack[2].id).toBe(layerC.id);
    });
});
