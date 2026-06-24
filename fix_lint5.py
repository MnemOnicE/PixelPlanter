import re

with open('src/UIManager.js', 'r') as f:
    content = f.read()

content = content.replace(
'''    #handleBrushStrokeCallback({ x, y, brushSize, tool, symmetry }) {
        if (!this.#activeLayerId) return;

        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        const { pixelSize } = layer.config;''',
'''    #handleBrushStrokeCallback({ x, y, brushSize, tool, symmetry }) {
        if (!this.#activeLayerId) return;

        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        const { size, pixelSize } = layer.config;''')

with open('src/UIManager.js', 'w') as f:
    f.write(content)


with open('src/ui/SettingsPanel.js', 'r') as f:
    content2 = f.read()

content2 = content2.replace('constructor(planter, generatorContainer, modifierContainer, onChange) {', 'constructor(planter, generatorContainer, modifierContainer) {')

with open('src/ui/SettingsPanel.js', 'w') as f:
    f.write(content2)
