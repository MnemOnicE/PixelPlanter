// Filename: src/Layer.js

export class Layer {
    // --- PROPERTIES ---
    id;
    config;
    dataGrid;
    isVisible = true;
    opacity = 1.0;
    blendMode = 'source-over';
    maskLayerId = null; // For Feature #3
    name;

    // CONSTRUCTOR
    constructor(initialConfig) {
        this.id = Date.now() + Math.random(); // Add random to avoid collision
        this.name = initialConfig.name || `Layer ${Math.floor(this.id)}`;
        this.config = initialConfig;
        this.dataGrid = [];

        if (initialConfig.isVisible !== undefined) this.isVisible = initialConfig.isVisible;
        if (initialConfig.opacity !== undefined) this.opacity = initialConfig.opacity;
        if (initialConfig.blendMode !== undefined) this.blendMode = initialConfig.blendMode;
        if (initialConfig.maskLayerId !== undefined) this.maskLayerId = initialConfig.maskLayerId;
    }

    // --- UPDATED generate() METHOD ---
    generate(planterInstance, readBelowGrid = null) {
        const prng = planterInstance.getPRNG(this.config.seed);
        const generator = planterInstance.getGeneratorInstance(this.config.generator);

        if (!generator) {
            console.error(`Generator "${this.config.generator}" not found for layer ${this.id}.`);
            this.dataGrid = []; // Ensure grid is empty
            return this;
        }

        let grid = generator.run(this.config, prng);

        // --- MODIFIER PIPELINE now passes the context ---
        if (this.config.modifiers && this.config.modifiers.length > 0) {
            for (const modConfig of this.config.modifiers) {
                const modifier = planterInstance.getModifierInstance(modConfig.name);
                if (modifier) {
                    // Pass the extra `readBelowGrid` parameter.
                    grid = modifier.apply(grid, modConfig, prng, readBelowGrid);
                } else {
                    console.warn(`Modifier "${modConfig.name}" not found for layer ${this.id}.`);
                }
            }
        }

        this.dataGrid = grid;
        return this;
    }
}
