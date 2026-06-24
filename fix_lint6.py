import re

with open('src/UIManager.js', 'r') as f:
    content = f.read()

content = content.replace(
'''    #handleBrushStrokeCallback(data) {
        if (!this.#activeLayerId) return;

        const { x: canvasX, y: canvasY, brushSize, tool, symmetry } = data;
        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        const { pixelSize } = layer.config;''',
'''    #handleBrushStrokeCallback(data) {
        if (!this.#activeLayerId) return;

        const { x: canvasX, y: canvasY, brushSize, tool, symmetry } = data;
        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        const { size, pixelSize } = layer.config;''')

with open('src/UIManager.js', 'w') as f:
    f.write(content)
