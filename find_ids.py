html = open('public/team-static.html', encoding='utf-8').read()
import re
matches = re.findall(r'id=["\']rm[^"\']*["\']', html)
for m in set(matches):
    print(m)
