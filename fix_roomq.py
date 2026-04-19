html = open('public/team-static.html', encoding='utf-8').read()

old = "var question = document.getElementById('rmArea') ? document.getElementById('rmArea').value.trim() : '';"
new = "var question = document.getElementById('roomQ') ? document.getElementById('roomQ').value.trim() : '';"

if old in html:
    html = html.replace(old, new)
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done')
else:
    print('Not found')