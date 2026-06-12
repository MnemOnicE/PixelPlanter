import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace the buttons block to make sure Tutorials is actually there
old_block = """                <div style="display: flex; gap: 5px; margin-top: 10px">
                    <button id="show-presets-btn" class="secondary">Presets</button>
                    <button id="show-factory-btn" class="secondary">Factory</button>
                </div>"""

new_block = """                <div style="display: flex; gap: 5px; margin-top: 10px">
                    <button id="show-presets-btn" class="secondary">Presets</button>
                    <button id="show-factory-btn" class="secondary">Factory</button>
                    <button id="show-tutorials-btn" class="secondary">Tutorials</button>
                </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)

# Add tutorials modal
if 'id="tutorials-modal"' not in content:
    factory_modal_target = """        <div id="factory-modal" class="modal">"""
    tutorials_modal_insert = """        <div id="tutorials-modal" class="modal">
            <div class="modal-content">
                <span class="close-button" style="float: right; cursor: pointer; font-size: 1.5em">&times;</span>
                <h2>Tutorials</h2>
                <div
                    id="tutorial-gallery"
                    style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px"
                ></div>
            </div>
        </div>

        <div id="factory-modal" class="modal">"""

    content = content.replace(factory_modal_target, tutorials_modal_insert)

with open('index.html', 'w') as f:
    f.write(content)

print("Patched index.html fully.")
