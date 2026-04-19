html = open('public/team-static.html', encoding='utf-8').read()

old1 = """document.addEventListener('mouseover', function(e){
  var icon = e.target.closest('.info-tip');"""

new1 = """document.addEventListener('mouseover', function(e){
  if(!e.target || !e.target.closest) return;
  var icon = e.target.closest('.info-tip');"""

old2 = """document.addEventListener('mouseenter', function(e){
  var icon = e.target.closest('.info-tip');"""

new2 = """document.addEventListener('mouseenter', function(e){
  if(!e.target || !e.target.closest) return;
  var icon = e.target.closest('.info-tip');"""

old3 = """document.addEventListener('mouseleave', function(e){
  var icon = e.target.closest('.info-tip');"""

new3 = """document.addEventListener('mouseleave', function(e){
  if(!e.target || !e.target.closest) return;
  var icon = e.target.closest('.info-tip');"""

count = 0
for old, new in [(old1,new1),(old2,new2),(old3,new3)]:
    if old in html:
        html = html.replace(old, new)
        count += 1

open('public/team-static.html', 'w', encoding='utf-8').write(html)
print('Fixed:', count, 'occurrences')