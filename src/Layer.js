// Filename: src/Layer.js

export class Layer {
    // --- PROPERTIES ---
    id;         // A unique identifier for the layer.
    config;     // The full configuration object for this layer.
    dataGrid;   // The raw 2D array generated for this layer.
    isVisible = true;
    opacity = 1.0; // A value from 0.0 to 1.0.
    blendMode = 'source-over'; // 'normal' blend mode in canvas is 'source-over'

    // CONSTRUCTOR
    constructor(initialConfig) {
        this.id = Date.now();
        this.name = `Layer ${this.id}`; // Add a default name
        this.config = initialConfig;
        this.dataGrid = []; // Starts empty.
    }

    // --- METHODS ---

    /**
     * Generates or regenerates the dataGrid for this specific layer using its own config.
     * This method relies on the Planter instance to provide access to the necessary registries.
     * @param {import('./Planter.js').Planter} planterInstance - The main Planter instance.
     * @returns {this} The layer instance for chaining.
     */
    generate(planterInstance) {
        // To generate, we need a PRNG instance for this specific layer's seed.
        const prng = planterInstance.getPRNG(this.config.seed);

        // 1. Get the generator from the registry using this.config.generator.
        const generator = planterInstance.getGeneratorInstance(this.config.generator);
        if (!generator) {
            console.error(`Generator "${this.config.generator}" not found for layer ${this.id}.`);
            return this;
        }

        // 2. Run the generator to get a base dataGrid.
        let grid = generator.run(this.config, prng);

        // 3. Run the modifier pipeline from this.config.modifiers.
        if (this.config.modifiers && this.config.modifiers.length > 0) {
            for (const modConfig of this.config.modifiers) {
                const modifier = planterInstance.getModifierInstance(modConfig.name);
                if (modifier) {
                    grid = modifier.apply(grid, modConfig, prng);
                } else {
                    console.warn(`Modifier "${modConfig.name}" not found for layer ${this.id}.`);
                }
            }
        }

        // 4. Store the final result in this.dataGrid.
        this.dataGrid = grid;

        return this; // For chaining.
    }
}
