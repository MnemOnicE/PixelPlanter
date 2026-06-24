import re
with open('src/Planter.js', 'r') as f:
    content = f.read()

content = re.sub(r' allLayers - The full stack of layers\.[\s\S]*?\}', '', content)
with open('src/Planter.js', 'w') as f:
    f.write(content)
