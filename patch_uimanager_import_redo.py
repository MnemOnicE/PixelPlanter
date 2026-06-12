import re

with open('src/UIManager.js', 'r') as f:
    content = f.read()

import_target = "import { SettingsPanel } from './ui/SettingsPanel.js';"
import_insert = """import { SettingsPanel } from './ui/SettingsPanel.js';
import { TutorialManager } from './ui/TutorialManager.js';"""

if import_target in content:
    content = content.replace(import_target, import_insert)
    with open('src/UIManager.js', 'w') as f:
        f.write(content)
    print("Added TutorialManager import to UIManager.js.")
else:
    print("Could not find the target to insert import in UIManager.js.")
