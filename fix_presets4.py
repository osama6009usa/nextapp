html = open('public/team-static.html', encoding='utf-8').read()

old = """<div class="preset on" onclick="selectPreset('4',this)" data-i="pr4">\u0662\u2013\u0665</div>
              <div class="preset" onclick="selectPreset('all',this)" data-i="prAll">\u0627\u0644\u0643\u0644</div>"""

new = """<div class="preset" onclick="selectPreset('all',this)" data-i="prAll">\u0639\u0627\u0645</div>
              <div class="preset" onclick="selectPreset('selectall',this)">\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0643\u0644</div>"""

if old in html:
    html = html.replace(old, new)
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done')
else:
    print('Not found')