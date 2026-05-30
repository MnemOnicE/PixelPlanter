with open('src/ui/SettingsPanel.js', 'r') as f:
    content = f.read()

content = content.replace('    #container;\n', '')
# onChange is used. Wait, eslint said it's not used.
# Let's check if it is used.
