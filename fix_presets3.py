html = open('public/team-static.html', encoding='utf-8').read()

# Fix preset HTML - find and replace preset-row
old = """<div class="preset-row">
      <div class="preset on" onclick="selectPreset('1',this)" data-i="pr1">\u0641\u0631\u062F\u064A</div>
      <div class="preset" onclick="selectPreset('4',this)" data-i="pr4">\u0662\u2013\u0665</div>
      <div class="preset" onclick="selectPreset('all',this)" data-i="prAll">\u0627\u0644\u0643\u0644</div>
    </div>"""

new = """<div class="preset-row">
      <div class="preset on" onclick="selectPreset('1',this)" data-i="pr1">\u0641\u0631\u062F\u064A</div>
      <div class="preset" onclick="selectPreset('all',this)" data-i="prAll">\u0639\u0627\u0645</div>
      <div class="preset" onclick="selectPreset('selectall',this)">\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0643\u0644</div>
    </div>"""

if old in html:
    html = html.replace(old, new)
    print('Preset row fixed')
else:
    print('Not found - searching for preset-row')
    idx = html.find('preset-row')
    if idx >= 0:
        print(repr(html[idx:idx+400]))

open('public/team-static.html', 'w', encoding='utf-8').write(html)