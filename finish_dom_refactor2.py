import re

with open('src/UIManager.js', 'r') as f:
    content = f.read()

# Instead of literal match, we use regex substitution again because it's more robust to whitespace.

content = re.sub(r'this\.#presetGallery\.innerHTML = \'<p>Could not load presets\.<\/p>\';',
'''this.#presetGallery.textContent = '';
                const p = document.createElement('p');
                p.textContent = 'Could not load presets.';
                this.#presetGallery.appendChild(p);''', content)

content = re.sub(r'this\.#presetGallery\.innerHTML = \'\';', 'this.#presetGallery.textContent = \'\';', content)

content = re.sub(r'item\.innerHTML = `[^`]+`;',
'''            const nameDiv = document.createElement('div');
            nameDiv.className = 'preset-name';
            nameDiv.textContent = preset.name;

            const descDiv = document.createElement('div');
            descDiv.className = 'preset-desc';
            descDiv.textContent = preset.description;

            item.appendChild(nameDiv);
            item.appendChild(descDiv);''', content)

content = re.sub(r'this\.#controls\.generatorSelect\.innerHTML = names[^;]+;',
'''        this.#controls.generatorSelect.textContent = '';
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            this.#controls.generatorSelect.appendChild(opt);
        });''', content)

content = re.sub(r'this\.#controls\.paletteSelect\.innerHTML = names[^;]+;',
'''        this.#controls.paletteSelect.textContent = '';
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            this.#controls.paletteSelect.appendChild(opt);
        });''', content)

content = re.sub(r'this\.#modifiersContainer\.innerHTML = names[^;]+;',
'''        this.#modifiersContainer.textContent = '';
        names.forEach(name => {
            const label = document.createElement('label');
            label.className = 'modifier-checkbox';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.setAttribute('data-modifier-name', name);

            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + name));
            this.#modifiersContainer.appendChild(label);
        });''', content)

with open('src/UIManager.js', 'w') as f:
    f.write(content)

with open('src/ui/SettingsPanel.js', 'r') as f:
    sp_content = f.read()

sp_content = sp_content.replace('this.#generatorParamsContainer.innerHTML = \'\';', 'this.#generatorParamsContainer.textContent = \'\';')
sp_content = sp_content.replace('this.#modifierParamsContainer.innerHTML = \'\';', 'this.#modifierParamsContainer.textContent = \'\';')

sp_content = re.sub(r'input\.innerHTML = options[^;]+;',
'''                input.textContent = '';
                options.forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt;
                    optionEl.textContent = opt;
                    if (opt === currentValue) optionEl.selected = true;
                    input.appendChild(optionEl);
                });''', sp_content)

with open('src/ui/SettingsPanel.js', 'w') as f:
    f.write(sp_content)


with open('src/ui/LayerPanel.js', 'r') as f:
    lp_content = f.read()

lp_content = lp_content.replace('this.#container.innerHTML = \'\';', 'this.#container.textContent = \'\';')

lp_content = re.sub(r'item\.innerHTML = `[^`]+`;',
'''            const dragHandle = document.createElement('div');
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
            item.appendChild(actionsDiv);''', lp_content)

lp_content = re.sub(r'const maskOptionsHtml = [^;]+;', '', lp_content)


with open('src/ui/LayerPanel.js', 'w') as f:
    f.write(lp_content)
