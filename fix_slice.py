html = open('public/team-static.html', encoding='utf-8').read()

# Fix slice limit in startSession
old1 = "var active=selectedSpecs.slice(0,4);"
new1 = "var active=selectedSpecs.slice(0,14);"

# Fix slice in showResultsReal
old2 = "selectedSpecs.slice(0,4).forEach(function(id){"
new2 = "selectedSpecs.slice(0,14).forEach(function(id){"

count = 0
if old1 in html:
    html = html.replace(old1, new1)
    count += 1
    print('Fixed startSession slice')

if old2 in html:
    html = html.replace(old2, new2)
    count += 1
    print('Fixed showResultsReal slice')

open('public/team-static.html', 'w', encoding='utf-8').write(html)
print('Total fixed:', count)