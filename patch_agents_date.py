import re
from datetime import datetime

with open('AGENTS.md', 'r') as f:
    content = f.read()

# Replace $(date +%Y-%m-%d) with actual date
content = content.replace('$(date +%Y-%m-%d)', datetime.now().strftime('%Y-%m-%d'))

with open('AGENTS.md', 'w') as f:
    f.write(content)
