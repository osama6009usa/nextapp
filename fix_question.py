html = open('public/team-static.html', encoding='utf-8').read()

old = "var question = document.getElementById('rmQuestion') ? document.getElementById('rmQuestion').value : '';\n  if(!question) question = ar ? '\u0645\u0627 \u0631\u0623\u064A\u0643 \u0641\u064A \u0628\u064A\u0627\u0646\u0627\u062A\u064A \u0627\u0644\u062D\u0627\u0644\u064A\u0629\u061F' : 'What do you think of my current data?';"

new = "var question = document.getElementById('rmArea') ? document.getElementById('rmArea').value.trim() : '';\n  if(!question){ alert(ar?'\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0623\u0648\u0644\u0627\u064B':'Please write your question first'); sessionRunning=false; return; }"

if old in html:
    html = html.replace(old, new)
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done')
else:
    print('Not found - checking...')
    idx = html.find('rmQuestion')
    print('rmQuestion at:', idx)