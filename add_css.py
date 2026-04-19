import os

css = open('extracted_team.css', encoding='utf-8').read()

# Find globals.css
paths = [
    'app/globals.css',
    'src/app/globals.css',
    'styles/globals.css',
]

target = None
for p in paths:
    if os.path.exists(p):
        target = p
        break

if not target:
    target = 'app/globals.css'

existing = open(target, encoding='utf-8').read() if os.path.exists(target) else ''

with open(target, 'w', encoding='utf-8') as f:
    f.write(existing)
    f.write('\n\n/* ===== TEAM PAGE CSS ===== */\n')
    f.write(css)

print('Added to: ' + target)
