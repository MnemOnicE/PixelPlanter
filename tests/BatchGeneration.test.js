/**
 * @file BatchGeneration.test.js
 * @description Tests for the Asset Factory / Batch Generation feature.
 */


import { Planter } from '../src/Planter.js';

describe('Planter Batch Generation', () => {
    let planter;

    beforeEach(() => {
        planter = new Planter({ size: 10, pixelSize: 1 });
    });

    it('should generate a sprite sheet with correct dimensions', () => {
        planter.addLayer({ generator: 'noise', palette: 'monochrome' });

        const rows = 2;
        const cols = 3;
        const padding = 2;

        // Sprite size: 10 * 1 = 10px
        const spriteSize = 10;
        const expectedWidth = spriteSize * cols + padding * (cols - 1);
        const expectedHeight = spriteSize * rows + padding * (rows - 1);

        const sheet = planter.generateBatch({ rows, cols, padding, variance: 20 });

        expect(sheet).toBeDefined();
        expect(sheet.width).toBe(expectedWidth);
        expect(sheet.height).toBe(expectedHeight);
    });

    it('should restore original configuration after batch', () => {
        const layer = planter.addLayer({ generator: 'noise', palette: 'monochrome', seed: 'original' });

        planter.generateBatch({ rows: 2, cols: 2, variance: 100 });

        expect(layer.config.seed).toBe('original');
    });
});
