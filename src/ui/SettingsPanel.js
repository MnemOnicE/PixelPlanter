export class SettingsPanel {

    #generatorParamsContainer;
    #modifierParamsContainer;
    #planter;


    constructor(planter, generatorContainer, modifierContainer) {
        this.#planter = planter;
        this.#generatorParamsContainer = generatorContainer;
        this.#modifierParamsContainer = modifierContainer;
        this.#attachEventListeners();
    }

    updateGeneratorParamsUI(generatorName, config) {
        const generatorClass = this.#planter.getGenerator(generatorName);
        this.#generatorParamsContainer.textContent = '';
        if (generatorClass && generatorClass.params) {
            this.#buildControls(this.#generatorParamsContainer, generatorClass.params, generatorName, config);
        }
    }

    updateModifierParamsUI(modifiersConfig) {
        this.#modifierParamsContainer.textContent = '';
        if (!modifiersConfig) return;
        modifiersConfig.forEach((modConfig) => {
            const modifierClass = this.#planter.getModifier(modConfig.name);
            if (modifierClass && modifierClass.params) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'modifier-param-group';
                const groupLabel = document.createElement('h4');
                groupLabel.textContent = `${modConfig.name} Settings`;
                groupDiv.appendChild(groupLabel);
                this.#buildControls(groupDiv, modifierClass.params, modConfig.name, modConfig);
                this.#modifierParamsContainer.appendChild(groupDiv);
            }
        });
    }

    getConfig() {
         const config = { modifiers: [] };
         // We only grab dynamic params here.
         // The parent UIManager still holds references to the main selects (generator, palette, etc.)
         // Ideally, we'd move those here too, but let's start with the dynamic param containers.

         const genParamsInputs = this.#generatorParamsContainer.querySelectorAll('[data-param-name]');
         genParamsInputs.forEach((input) => {
             const key = input.dataset.paramName;
             const value = input.type === 'range' ? parseFloat(input.value) : input.value;
             config[key] = isNaN(value) ? input.value : value;
         });

         // For modifiers, we need to know which ones are active.
         // This information is currently in the modifiers checkboxes which are outside this panel's scope in the current DOM structure.
         // However, the input parsing logic for modifiers depends on the DOM elements inside modifierParamsContainer.

         // We will return a helper function or object to let the parent extract modifier params.
         // Or, the parent passes in the active modifier names, and we extract the values.

         return config;
    }

    getModifierParams(modName) {
        const modConfig = { name: modName };
        const modParamsInputs = this.#modifierParamsContainer.querySelectorAll(`[data-param-owner="${modName}"]`);
        modParamsInputs.forEach((input) => {
            const key = input.dataset.paramName;
            const value = input.type === 'range' ? parseFloat(input.value) : input.value;
            modConfig[key] = isNaN(value) ? input.value : value;
        });
        return modConfig;
    }

    #buildControls(container, paramsObject, ownerName, config) {
        for (const key in paramsObject) {
            const paramConfig = paramsObject[key];
            const currentValue = config[key] !== undefined ? config[key] : paramConfig.defaultValue;
            const controlDiv = document.createElement('div');
            const label = document.createElement('label');
            label.textContent = paramConfig.label;
            let input;
            if (paramConfig.type === 'slider') {
                input = document.createElement('input');
                input.type = 'range';
                input.min = paramConfig.min;
                input.max = paramConfig.max;
                input.step = paramConfig.step;
                input.value = currentValue;
            } else if (paramConfig.type === 'select') {
                input = document.createElement('select');
                let options =
                    paramConfig.optionsSource === 'patterns'
                        ? this.#planter.getPatternNames()
                        : paramConfig.options || [];
                                input.textContent = '';
                options.forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt;
                    optionEl.textContent = opt;
                    if (opt === currentValue) optionEl.selected = true;
                    input.appendChild(optionEl);
                });
            }
            if (input) {
                input.dataset.paramOwner = ownerName;
                input.dataset.paramName = key;
                controlDiv.appendChild(label);
                controlDiv.appendChild(input);
                container.appendChild(controlDiv);
            }
        }
    }

    #attachEventListeners() {
        // We can listen to changes in these containers and trigger updates
        // But for now, the UIManager triggers generation on "Generate" click.
        // If we want real-time updates (which isn't implemented yet), we would listen here.
    }
}
