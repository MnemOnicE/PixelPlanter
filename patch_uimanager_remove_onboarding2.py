import re

with open('src/UIManager.js', 'r') as f:
    content = f.read()

# Replace the whole startOnboardingTour block including its invocation
pattern = re.compile(r'\s+this\.#startOnboardingTour\(\);\n\s+\}\n\n\s+/\*\*\n\s+\* Starts the guided onboarding tour for new users using `driver\.js`\.\n\s+\* Checks localStorage to prevent showing it repeatedly\.\n\s+\* @private\n\s+\*/\n\s+#startOnboardingTour\(\) \{\n\s+const hasBeenOnboarded = localStorage\.getItem\(\'pixelPlanterOnboarded\'\);\n\s+if \(hasBeenOnboarded\) \{\n\s+return;\n\s+\}\n\n\s+const driverObj = driver\(\{\n\s+showProgress: true,\n\s+steps: \[\n\s+\{\n\s+element: \'#generator-select\',\n\s+popover: \{\n\s+title: \'1\. Pick a Generator\',\n\s+description:\n\s+\'This is the main algorithm used to create your art\. Try \"noise\" or \"cellular\" to start\.\',\n\s+\},\n\s+\},\n\s+\{\n\s+element: \'#palette-select\',\n\s+popover: \{ title: \'2\. Pick a Palette\', description: \'Choose a color scheme for your creation\.\' \},\n\s+\},\n\s+\{\n\s+element: \'#generate-btn\',\n\s+popover: \{\n\s+title: \'3\. Generate!\',\n\s+description:\n\s+\'Click here to create your artwork\. You can click it again to get a new variation with the same settings\.\',\n\s+\},\n\s+\},\n\s+\{\n\s+element: \'#randomize-btn\',\n\s+popover: \{\n\s+title: \'Roll the Dice\',\n\s+description: \'This button will randomize all settings for a surprise result\.\',\n\s+\},\n\s+\},\n\s+\{\n\s+element: \'#mode-toggle-container\',\n\s+popover: \{\n\s+title: \'Unlock More Power\',\n\s+description:\n\s+\'When you\\\'re ready, switch to \"Advanced\" mode to unlock layers, modifiers, and more!\',\n\s+\},\n\s+\},\n\s+\],\n\s+\}\);\n\n\s+driverObj\.drive\(\);\n\s+localStorage\.setItem\(\'pixelPlanterOnboarded\', \'true\'\);\n\s+\}', re.MULTILINE | re.DOTALL)

content = pattern.sub('\n    }', content)

with open('src/UIManager.js', 'w') as f:
    f.write(content)

print("Removed startOnboardingTour successfully.")
