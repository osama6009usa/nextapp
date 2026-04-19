html = open('public/team-static.html', encoding='utf-8').read()
idx = html.find('function sendMessage')
if idx >= 0:
    print(repr(html[idx:idx+200]))
else:
    print('Not found')
