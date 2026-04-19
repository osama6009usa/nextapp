html = open('public/team-static.html', encoding='utf-8').read()
idx = html.find('preset on')
if idx >= 0:
    print(repr(html[idx-50:idx+300]))
