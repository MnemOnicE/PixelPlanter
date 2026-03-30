const fs = require('fs');

const layerContent = fs.readFileSync('src/Layer.js', 'utf8');

const updatedContent = layerContent.replace(
    /\/\/ --- MODIFIER PIPELINE now passes the context ---[\s\S]*?this\.dataGrid = grid;/g,
    `// --- MODIFIER PIPELINE (Recursive & Contextual) ---
        if (this.config.modifiers && this.config.modifiers.length > 0) {
            grid = this.#applyModifiers(this.config.modifiers, grid, planterInstance, prng, readBelowGrid);
        }

        this.dataGrid = grid;
        return this;
    }

    /**
     * Recursively applies modifiers, passing an active mask down through branches.
     * @private
     */
    #applyModifiers(modifierList, currentGrid, planterInstance, prng, readBelowGrid, activeMask = null) {
        let grid = currentGrid;
        for (const modConfig of modifierList) {
            const modifier = planterInstance.getModifierInstance(modConfig.name);
            if (!modifier) {
                console.warn(\`Modifier "\${modConfig.name}" not found for layer \${this.id}.\`);
                continue;
            }

            // If the modifier is a logic block (like FilterModifier), it returns a NEW selection mask,
            // instead of returning a modified data grid.
            if (modifier.isLogicBlock) {
                // Pass current grid, its config, the prng, context, and any *existing* mask
                const newMask = modifier.apply(grid, modConfig, prng, readBelowGrid, activeMask);

                // If it has children, apply them recursively but only using the newly generated mask
                if (modConfig.children && modConfig.children.length > 0) {
                     grid = this.#applyModifiers(modConfig.children, grid, planterInstance, prng, readBelowGrid, newMask);
                }
            } else {
                // It's a standard modifier, pass the active mask to limit its scope
                grid = modifier.apply(grid, modConfig, prng, readBelowGrid, activeMask);

                // If standard modifier happens to have children (less common), apply them normally
                if (modConfig.children && modConfig.children.length > 0) {
                     grid = this.#applyModifiers(modConfig.children, grid, planterInstance, prng, readBelowGrid, activeMask);
                }
            }
        }
        return grid;
    }`
);

fs.writeFileSync('src/Layer.js', updatedContent);
console.log('Layer.js updated successfully!');
