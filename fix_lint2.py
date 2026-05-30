import re

with open('src/Planter.js', 'r') as f:
    content = f.read()

# Removing #generateLayerWithContext probably left some syntax error
content = re.sub(r'    #applyMask\(targetGrid, maskGrid\) \{', '    /**\n     * Applies a mask to a target grid.\n     */\n    #applyMask(targetGrid, maskGrid) {', content)
# It's probably easier to just replace the broken chunk manually if we find it.

with open('src/Planter.js', 'w') as f:
    f.write(content)

with open('src/UIManager.js', 'r') as f:
    content = f.read()

content = content.replace('const { pixelSize } = layer.config;', 'const { size, pixelSize } = layer.config;')
content = content.replace('#handleFloodFillCallback(data) {', '#handleFloodFillCallback(data) { // eslint-disable-next-line no-unused-vars')
# actually, let's fix the parameters
content = re.sub(r'#handleFloodFillCallback\(\{ type, data \}\) \{', '#handleFloodFillCallback(data) {', content)

with open('src/UIManager.js', 'w') as f:
    f.write(content)

with open('src/ui/LayerPanel.js', 'r') as f:
    content = f.read()
content = re.sub(r'            const otherLayers = layerStack\.filter\(\(l\) => l\.id !== layer\.id\);\n            const maskOptions = otherLayers', '', content)
with open('src/ui/LayerPanel.js', 'w') as f:
    f.write(content)

with open('src/ui/SettingsPanel.js', 'r') as f:
    content = f.read()
# put back the declarations
content = content.replace('    #generatorParamsContainer;', '    #container;\n    #onChange;\n    #generatorParamsContainer;')
with open('src/ui/SettingsPanel.js', 'w') as f:
    f.write(content)
