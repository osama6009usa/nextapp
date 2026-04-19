html = open('public/team-static.html', encoding='utf-8').read()
lines = html.split('\n')
for i, line in enumerate(lines):
    if 'textarea' in line.lower() or 'rq-area' in line.lower():
        print(f'Line {i+1}: {line.strip()}')
