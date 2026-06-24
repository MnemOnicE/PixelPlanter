import re

# LayerPanel fix
with open('src/ui/LayerPanel.js', 'r') as f:
    content = f.read()

content = content.replace('this.#callbacks.getPlanter()', 'this.#planter')
# we might have messed up with other variables, let's fix it

with open('src/ui/LayerPanel.js', 'w') as f:
    f.write(content)


# UIManager fix
with open('src/UIManager.js', 'r') as f:
    content = f.read()

content = re.sub(r'\n    #isBrushing = false;', '', content)
content = re.sub(r'#handleFloodFillCallback\(\{ type, data \}\) \{', '#handleFloodFillCallback(data) {', content)
content = re.sub(r'const \{ size, pixelSize \} = layer.config;', 'const { pixelSize } = layer.config;', content)

with open('src/UIManager.js', 'w') as f:
    f.write(content)

# FilterModifier fix
with open('src/modifiers/FilterModifier.js', 'r') as f:
    content = f.read()

content = content.replace('    apply(dataGrid, config = {}, prng, readBelowGrid = null, activeMask = null) {', '    apply(dataGrid, config = {}, prng, _readBelowGrid = null, activeMask = null) {')

with open('src/modifiers/FilterModifier.js', 'w') as f:
    f.write(content)


# Planter fix
with open('src/Planter.js', 'r') as f:
    content = f.read()

content = re.sub(r'''    /\*\*\n     \* Helper to generate a single layer with context.[\s\S]*?\}''', '', content)

with open('src/Planter.js', 'w') as f:
    f.write(content)

# SettingsPanel fix
with open('src/ui/SettingsPanel.js', 'r') as f:
    content = f.read()

content = content.replace('    #container;', '')
content = content.replace('    #onChange;', '')

with open('src/ui/SettingsPanel.js', 'w') as f:
    f.write(content)
