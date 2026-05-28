import { describe, it, expect } from 'vitest';
import { DespeckleModifier } from '../src/modifiers/DespeckleModifier.js';

describe('DespeckleModifier', () => {
    it('should remove isolated 1x1 pixels', () => {
        const grid = [
            [1, 0, 0, 0, 1],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 1, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1],
        ];

        const modifier = new DespeckleModifier();
        const result = modifier.apply(grid, { maxIslandSize: 1 });

        // Expected:
        // - Top-left cluster (3 pixels) stays
        // - Bottom-left cluster (2 pixels) stays
        // - Top-right (1 pixel) removed
        // - Middle-right (1 pixel) removed
        // - Bottom-right (1 pixel) removed
        expect(result).toEqual([
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
    });

    it('should respect maxIslandSize configuration', () => {
        const grid = [
            [1, 1, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1],
        ];

        const modifier = new DespeckleModifier();
        // Remove clusters of size 2 or smaller
        const result = modifier.apply(grid, { maxIslandSize: 2 });

        // Expected:
        // - Top-left (4 pixels) stays
        // - Middle-right (2 pixels) removed
        // - Bottom-left (1 pixel) removed
        // - Bottom-right (1 pixel) removed
        expect(result).toEqual([
            [1, 1, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
    });
});
