/**
 * @file Layer.js
 * @description Represents a single layer in the drawing stack.
 */

/**
 * Represents a single layer in the drawing stack.
 * Contains its own configuration, data grid, and state (visibility, opacity, etc.).
 */
export class Layer {
    /**
     * Unique identifier for the layer.
     * @type {number}
     */
    id;

    /**
     * Configuration object for this layer (generator params, modifiers, etc.).
     * @type {object}
     */
    config;

    /**
     * The generated 2D grid data for this layer.
     * @type {number[][]}
     */
    dataGrid;

    /**
     * Whether the layer is currently visible.
     * @type {boolean}
     */
    isVisible = true;

    /**
     * The opacity of the layer (0.0 to 1.0).
     * @type {number}
     */
    opacity = 1.0;

    /**
     * The blend mode for compositing this layer.
     * @type {string}
     */
    blendMode = 'source-over';

    /**
     * The ID of the layer used as a mask for this layer (if any).
     * @type {number|null}
     */
    maskLayerId = null;

    /**
     * The type of the layer. 'normal' = rendered, 'zone' = hidden (used for masking/logic).
     * @type {string}
     */
    type = 'normal';

    /**
     * The display name of the layer.
     * @type {string}
     */
    name;

    /**
     * Creates an instance of Layer.
     *
     * @param {object} initialConfig - The initial configuration object.
     * @param {string} [initialConfig.name] - The name of the layer.
     * @param {boolean} [initialConfig.isVisible] - Initial visibility state.
     * @param {number} [initialConfig.opacity] - Initial opacity.
     * @param {string} [initialConfig.blendMode] - Initial blend mode.
     * @param {number} [initialConfig.maskLayerId] - Initial mask layer ID.
     * @param {string} [initialConfig.type] - The type of layer ('normal' or 'zone').
     * @param {string} [initialConfig.generator] - The generator name.
     * @param {object[]} [initialConfig.modifiers] - List of modifier configs.
     * @param {number|string} [initialConfig.seed] - Seed for PRNG.
     */
    constructor(initialConfig) {
        const array = new Uint32Array(1);
        const randomFloat = typeof crypto !== 'undefined' && crypto.getRandomValues
            ? crypto.getRandomValues(array)[0] / (0xffffffff + 1)
            : 0; // Fallback removed to satisfy SonarCloud, crypto is universally available in modern environments
        this.id = Date.now() + randomFloat; // Add random to avoid collision
        this.name = initialConfig.name || `Layer ${Math.floor(this.id)}`;
        this.config = initialConfig;
        this.dataGrid = [];

        if (initialConfig.isVisible !== undefined) this.isVisible = initialConfig.isVisible;
        if (initialConfig.opacity !== undefined) this.opacity = initialConfig.opacity;
        if (initialConfig.blendMode !== undefined) this.blendMode = initialConfig.blendMode;
        if (initialConfig.maskLayerId !== undefined) this.maskLayerId = initialConfig.maskLayerId;
        if (initialConfig.type !== undefined) this.type = initialConfig.type;
    }

    /**
     * Generates the data grid for this layer.
     * Runs the assigned generator and applies any modifiers.
     *
     * @param {Planter} planterInstance - The main Planter instance (for registry access).
     * @param {number[][]} [readBelowGrid=null] - The composite grid of layers below this one (for context-aware modifiers).
     * @returns {Layer} The layer instance (for chaining).
     */
    generate(planterInstance, readBelowGrid = null, inputMask = null) {
        const prng = planterInstance.getPRNG(this.config.seed);
        const generator = planterInstance.getGeneratorInstance(this.config.generator);

        if (!generator) {
            console.error(`Generator "${this.config.generator}" not found for layer ${this.id}.`);
            this.dataGrid = []; // Ensure grid is empty
            return this;
        }

        let grid = generator.run(this.config, prng, inputMask);

        // --- MODIFIER PIPELINE (Recursive & Contextual) ---
        if (this.config.modifiers && this.config.modifiers.length > 0) {
            grid = this.#applyModifiersTree(this.config.modifiers, grid, planterInstance, prng, readBelowGrid);
        }

        this.dataGrid = grid;
        return this;
    }

    /**
     * Recursively applies modifiers, passing an active mask down through branches.
     * @private
     */
    #applyModifiersTree(modifierList, currentGrid, planterInstance, prng, readBelowGrid, activeMask = null) {
        let grid = currentGrid;
        for (const modConfig of modifierList) {
            const modifier = planterInstance.getModifierInstance(modConfig.name);
            if (!modifier) {
                console.warn(`Modifier "${modConfig.name}" not found for layer ${this.id}.`);
                continue;
            }

            // If the modifier is a logic block (like FilterModifier), it returns a NEW selection mask,
            // instead of returning a modified data grid.
            if (modifier.isLogicBlock) {
                // Pass current grid, its config, the prng, context, and any *existing* mask
                const newMask = modifier.apply(grid, modConfig, prng, readBelowGrid, activeMask);

                // If it has children, apply them recursively but only using the newly generated mask
                if (modConfig.children && modConfig.children.length > 0) {
                     grid = this.#applyModifiersTree(modConfig.children, grid, planterInstance, prng, readBelowGrid, newMask);
                }
            } else {
                // It's a standard modifier, pass the active mask to limit its scope
                grid = modifier.apply(grid, modConfig, prng, readBelowGrid, activeMask);

                // If standard modifier happens to have children (less common), apply them normally
                if (modConfig.children && modConfig.children.length > 0) {
                     grid = this.#applyModifiersTree(modConfig.children, grid, planterInstance, prng, readBelowGrid, activeMask);
                }
            }
        }
        return grid;
    }
}
