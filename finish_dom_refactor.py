import re

def replace_in_file(filepath, target, replacement):
    with open(filepath, 'r') as f:
        content = f.read()

    if target in content:
        content = content.replace(target, replacement)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Replaced target in {filepath}")
    else:
        print(f"Target not found in {filepath}")

# UIManager presets item
u_target_1 = """            item.innerHTML = `
                <div class="preset-name">${preset.name}</div>
                <div class="preset-desc">${preset.description}</div>
            `;"""
u_rep_1 = """            const nameDiv = document.createElement('div');
            nameDiv.className = 'preset-name';
            nameDiv.textContent = preset.name;

            const descDiv = document.createElement('div');
            descDiv.className = 'preset-desc';
            descDiv.textContent = preset.description;

            item.appendChild(nameDiv);
            item.appendChild(descDiv);"""
replace_in_file('src/UIManager.js', u_target_1, u_rep_1)

# UIManager modifiersContainer
u_target_2 = """        this.#modifiersContainer.innerHTML = names
            .map(
                (name) => `
                <label class="modifier-checkbox">
                    <input type="checkbox" data-modifier-name="${name}">
                    ${name}
                </label>
            `,
            )
            .join('');"""
u_rep_2 = """        this.#modifiersContainer.textContent = '';
        names.forEach(name => {
            const label = document.createElement('label');
            label.className = 'modifier-checkbox';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.setAttribute('data-modifier-name', name);

            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + name));
            this.#modifiersContainer.appendChild(label);
        });"""
replace_in_file('src/UIManager.js', u_target_2, u_rep_2)

# SettingsPanel inputs
s_target = """                input.innerHTML = options
                    .map((opt) => `<option value="${opt}" ${opt === currentValue ? 'selected' : ''}>${opt}</option>`)
                    .join('');"""
s_rep = """                input.textContent = '';
                options.forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt;
                    optionEl.textContent = opt;
                    if (opt === currentValue) optionEl.selected = true;
                    input.appendChild(optionEl);
                });"""
replace_in_file('src/ui/SettingsPanel.js', s_target, s_rep)

# LayerPanel layer items
l_target = """            item.innerHTML = `
                <div class="layer-drag-handle">≡</div>
                <div class="layer-content">
                    <input type="text" class="layer-name-input" value="${layer.name}" />
                    <div class="layer-controls">
                        <button class="icon-btn toggle-visibility" title="Toggle Visibility">
                            ${layer.isVisible ? '👁️' : '👁️‍🗨️'}
                        </button>
                        <select class="layer-type-select" title="Layer Type">
                            <option value="normal" ${layer.type === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="zone" ${layer.type === 'zone' ? 'selected' : ''}>Zone</option>
                        </select>
                        <input type="range" class="layer-opacity" min="0" max="1" step="0.1" value="${layer.opacity}" title="Opacity" />
                        <select class="layer-blend-mode" title="Blend Mode">
                            <option value="source-over" ${layer.blendMode === 'source-over' ? 'selected' : ''}>Normal</option>
                            <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>Multiply</option>
                            <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>Screen</option>
                            <option value="overlay" ${layer.blendMode === 'overlay' ? 'selected' : ''}>Overlay</option>
                        </select>
                        <select class="layer-mask-select" title="Mask Layer">
                            <option value="">No Mask</option>
                            ${maskOptionsHtml}
                        </select>
                    </div>
                </div>
                <div class="layer-actions">
                    <button class="icon-btn copy-mods" title="Copy Modifiers">📄</button>
                    <button class="icon-btn paste-mods" title="Paste Modifiers">📋</button>
                    <button class="icon-btn delete-layer" title="Delete Layer">🗑️</button>
                </div>
            `;"""
l_rep = """            const dragHandle = document.createElement('div');
            dragHandle.className = 'layer-drag-handle';
            dragHandle.textContent = '≡';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'layer-content';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'layer-name-input';
            nameInput.value = layer.name;
            contentDiv.appendChild(nameInput);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'layer-controls';

            const visBtn = document.createElement('button');
            visBtn.className = 'icon-btn toggle-visibility';
            visBtn.title = 'Toggle Visibility';
            visBtn.textContent = layer.isVisible ? '👁️' : '👁️‍🗨️';
            controlsDiv.appendChild(visBtn);

            const typeSelect = document.createElement('select');
            typeSelect.className = 'layer-type-select';
            typeSelect.title = 'Layer Type';
            const optNormal = document.createElement('option');
            optNormal.value = 'normal';
            optNormal.textContent = 'Normal';
            if (layer.type === 'normal') optNormal.selected = true;
            const optZone = document.createElement('option');
            optZone.value = 'zone';
            optZone.textContent = 'Zone';
            if (layer.type === 'zone') optZone.selected = true;
            typeSelect.appendChild(optNormal);
            typeSelect.appendChild(optZone);
            controlsDiv.appendChild(typeSelect);

            const opInput = document.createElement('input');
            opInput.type = 'range';
            opInput.className = 'layer-opacity';
            opInput.min = '0';
            opInput.max = '1';
            opInput.step = '0.1';
            opInput.value = layer.opacity;
            opInput.title = 'Opacity';
            controlsDiv.appendChild(opInput);

            const blendSelect = document.createElement('select');
            blendSelect.className = 'layer-blend-mode';
            blendSelect.title = 'Blend Mode';
            const blends = [['source-over', 'Normal'], ['multiply', 'Multiply'], ['screen', 'Screen'], ['overlay', 'Overlay']];
            blends.forEach(([val, text]) => {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = text;
                if (layer.blendMode === val) opt.selected = true;
                blendSelect.appendChild(opt);
            });
            controlsDiv.appendChild(blendSelect);

            const maskSelect = document.createElement('select');
            maskSelect.className = 'layer-mask-select';
            maskSelect.title = 'Mask Layer';
            const optNoMask = document.createElement('option');
            optNoMask.value = '';
            optNoMask.textContent = 'No Mask';
            maskSelect.appendChild(optNoMask);

            const planter = this.#callbacks.getPlanter();
            const stack = planter.getLayerStack();
            const currentIndex = stack.findIndex((l) => l.id === layer.id);
            const lowerLayers = stack.slice(0, currentIndex);
            lowerLayers.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.id;
                opt.textContent = `Mask: ${l.name}`;
                if (layer.maskLayerId == l.id) opt.selected = true;
                maskSelect.appendChild(opt);
            });
            controlsDiv.appendChild(maskSelect);

            contentDiv.appendChild(controlsDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'layer-actions';
            const btnCopy = document.createElement('button');
            btnCopy.className = 'icon-btn copy-mods';
            btnCopy.title = 'Copy Modifiers';
            btnCopy.textContent = '📄';
            actionsDiv.appendChild(btnCopy);

            const btnPaste = document.createElement('button');
            btnPaste.className = 'icon-btn paste-mods';
            btnPaste.title = 'Paste Modifiers';
            btnPaste.textContent = '📋';
            actionsDiv.appendChild(btnPaste);

            const btnDel = document.createElement('button');
            btnDel.className = 'icon-btn delete-layer';
            btnDel.title = 'Delete Layer';
            btnDel.textContent = '🗑️';
            actionsDiv.appendChild(btnDel);

            item.appendChild(dragHandle);
            item.appendChild(contentDiv);
            item.appendChild(actionsDiv);"""
replace_in_file('src/ui/LayerPanel.js', l_target, l_rep)
