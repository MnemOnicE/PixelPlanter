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
            this.#renderModifierNode(modConfig, 0, this.#modifierParamsContainer);
        });
    }

    #renderModifierNode(modConfig, depth, container) {
        const modifierClass = this.#planter.getModifier(modConfig.name);
        if (modifierClass) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'modifier-param-group';
            groupDiv.style.marginLeft = `${depth * 20}px`;
            if (depth > 0) {
                groupDiv.style.borderLeft = '2px solid var(--border)';
                groupDiv.style.paddingLeft = '10px';
            }

            const groupLabel = document.createElement('h4');
            groupLabel.textContent = `${modConfig.name} Settings`;
            groupDiv.appendChild(groupLabel);

            if (modifierClass.params) {
                this.#buildControls(groupDiv, modifierClass.params, modConfig.name, modConfig);
            }

            if (modifierClass.isLogicBlock) {
                const addBtn = document.createElement('button');
                addBtn.textContent = '+ Add Child Modifier';
                addBtn.className = 'secondary';
                addBtn.style.marginTop = '5px';
                addBtn.style.fontSize = '0.8em';
                // Mock behavior for now
                addBtn.onclick = () => alert('Advanced visual pipeline editor coming soon!');
                groupDiv.appendChild(addBtn);
            }

            if (modConfig.children && modConfig.children.length > 0) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'children-container';
                modConfig.children.forEach(child => {
                    this.#renderModifierNode(child, depth + 1, childrenContainer);
                });
                groupDiv.appendChild(childrenContainer);
            }

            container.appendChild(groupDiv);
        }
    }


    getConfig() {
         const config = { modifiers: [] };
         const genParamsInputs = this.#generatorParamsContainer.querySelectorAll('[data-param-name]');
         genParamsInputs.forEach((input) => {
             const key = input.dataset.paramName;
             const isNumeric = input.type === 'number' || input.type === 'range';
             const value = isNumeric ? parseFloat(input.value) : input.value;
             config[key] = Number.isNaN(value) ? (isNumeric ? 0 : input.value) : value;
         });
         return config;
    }

    getModifierParams(modName) {
        const modConfig = { name: modName };
        const modParamsInputs = this.#modifierParamsContainer.querySelectorAll(`[data-param-owner="${modName}"]`);
        modParamsInputs.forEach((input) => {
            const key = input.dataset.paramName;
            const isNumeric = input.type === 'number' || input.type === 'range';
             const value = isNumeric ? parseFloat(input.value) : input.value;
            modConfig[key] = Number.isNaN(value) ? (isNumeric ? 0 : input.value) : value;
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
