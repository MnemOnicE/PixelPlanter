import re
with open('src/ui/LayerPanel.js', 'r') as f:
    content = f.read()

content = re.sub(r'                \.map\(\(l\) => `<option value="\$\{l\.id\}" \$\{layer\.maskLayerId == l\.id \? \'selected\' : \'\'\}>\$\{l\.name\}<\/option>`\)\n                \.join\(\'\'\);', '', content)

with open('src/ui/LayerPanel.js', 'w') as f:
    f.write(content)
