import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Planter } from '../src/Planter.js';
import { Layer } from '../src/Layer.js';
import { FilterModifier } from '../src/modifiers/FilterModifier.js';
import { OutlineModifier } from '../src/modifiers/OutlineModifier.js';

describe('Visual Modifier Pipeline (Conditional Logic)', () => {
    let planter;

    beforeEach(() => {
        planter = new Planter({ size: 4 });
        // Register necessary modifiers
        planter.registerModifier('filter', new FilterModifier());
        planter.registerModifier('outline', new OutlineModifier());
    });

    it('FilterModifier generates a mask based on target value', () => {
        const filter = new FilterModifier();
        const inputGrid = [
            [0, 1, 0, 0],
            [1, 2, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ];

        // Should only select the pixel with value '2'
        const mask = filter.apply(inputGrid, { condition: 'value', targetValue: 2 });

        expect(mask).toEqual([
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('FilterModifier generates a mask based on empty pixels', () => {
        const filter = new FilterModifier();
        const inputGrid = [
            [1, 1],
            [0, 1]
        ];

        // Should select only the 0
        const mask = filter.apply(inputGrid, { condition: 'empty' });

        expect(mask).toEqual([
            [0, 0],
            [1, 0]
        ]);
    });

    it('OutlineModifier respects an active mask', () => {
        const outline = new OutlineModifier();
        const inputGrid = [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ];

        // Mask only the right side
        const activeMask = [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 0]
        ];

        const result = outline.apply(inputGrid, {}, null, null, activeMask);

        // Since the outline normally draws on empty space (value 0) adjacent to 1s,
        // it should only draw the outline on the right side where the mask is 1.
        expect(result[1][3]).toBe(2); // Right outline drawn (mask was 1)
        expect(result[1][0]).toBe(0); // Left outline NOT drawn (mask was 0)
    });

    it('Layer generates correctly with nested modifiers (Tree Structure)', () => {
        // Mock a generator that just returns a static grid
        const mockGenerator = {
            run: () => [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            isStructural: false
        };
        planter.registerGenerator('mock-gen', mockGenerator);

        const layerConfig = {
            generator: 'mock-gen',
            modifiers: [
                {
                    name: 'filter',
                    condition: 'value',
                    targetValue: 1, // Select the single '1' pixel
                    children: [
                        {
                            name: 'outline' // Apply outline ONLY around the '1' pixel
                        }
                    ]
                }
            ]
        };

        const layer = new Layer(layerConfig);
        layer.generate(planter);

        // Filter selects ONLY the coordinate [1][1] (which is the '1').
        // The outline modifier tries to draw '2' around the shape.
        // HOWEVER, since the mask is strictly only active AT [1][1] (the shape itself),
        // and outline tries to draw on empty space [0,1], [1,0], etc.,
        // the outline modifier will be blocked from drawing on those empty spaces because they are masked out (0 in the mask)!

        // Therefore, the grid should remain unchanged! This proves the masking logic works strictly.
        expect(layer.dataGrid).toEqual([
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]);
    });
});
