import re

with open('src/ui/SettingsPanel.js', 'r') as f:
    content = f.read()

content = content.replace('    #container;\n', '')
content = content.replace('    #onChange;\n', '')
content = content.replace('        this.#onChange = onChange;\n', '')

with open('src/ui/SettingsPanel.js', 'w') as f:
    f.write(content)

with open('src/UIManager.js', 'r') as f:
    content = f.read()

content = re.sub(r'#handleFloodFillCallback\(data\) \{ \/\/ eslint-disable-next-line no-unused-vars', '#handleFloodFillCallback(data) {', content)
content = re.sub(r'const \{ size, pixelSize \} = layer.config;', 'const { pixelSize } = layer.config;', content)

with open('src/UIManager.js', 'w') as f:
    f.write(content)
