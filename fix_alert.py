html = open('public/team-static.html', encoding='utf-8').read()

old = """      '<button class="va va-w" onclick="alert(ar?\'تم تطبيق القرار وحفظه\':\\\'Decision applied and saved\\\')">'+t('applyDecision')+'</button>'+"""

new = """      '<button class="va va-w" onclick="toast(t(\\'applyToast\\'),\\'green\\')">'+t('applyDecision')+'</button>'+"""

if old in html:
    html = html.replace(old, new)
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done')
else:
    print('Not found - trying alternative')
    idx = html.find('applyDecision')
    lines = html.split('\n')
    for i, line in enumerate(lines):
        if 'applyDecision' in line and 'alert' in line:
            print(f'Line {i+1}: {repr(line)}')