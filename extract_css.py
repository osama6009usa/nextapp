import re

html = open('ui/biosovereignty-Team.html', encoding='utf-8').read()
match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if match:
    css = match.group(1)
    with open('extracted_team.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print('CSS extracted: ' + str(len(css)) + ' chars')
else:
    print('No CSS found')
