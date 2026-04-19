html = open('public/team-static.html', encoding='utf-8').read()

old = """function selectPreset(type,el){
  document.querySelectorAll('.preset').forEach(function(p){p.classList.remove('on');}); el.classList.add('on');
  if(type==='1') selectedSpecs=['AT'];
  else if(type==='4') selectedSpecs=['AT','PL','CE','IR'];
  else selectedSpecs=SPECS.map(function(s){return s.id;});
  document.querySelectorAll('.spec-sel').forEach(function(d){
    d.classList.toggle('on',selectedSpecs.indexOf(d.dataset.id)!==-1);
  });
  updateSelCount(); updateSessionAvs();
}"""

new = """function selectPreset(type,el){
  document.querySelectorAll('.preset').forEach(function(p){p.classList.remove('on');}); el.classList.add('on');
  if(type==='1'){
    selectedSpecs=['AT'];
    window._presetMode='solo';
  } else {
    selectedSpecs=[];
    window._presetMode='general';
  }
  document.querySelectorAll('.spec-sel').forEach(function(d){
    d.classList.toggle('on',selectedSpecs.indexOf(d.dataset.id)!==-1);
  });
  updateSelCount(); updateSessionAvs();
}"""

if old in html:
    html = html.replace(old, new)
    print('selectPreset fixed')
else:
    print('Not found - searching...')
    idx = html.find('function selectPreset')
    if idx >= 0:
        print(repr(html[idx:idx+300]))

open('public/team-static.html', 'w', encoding='utf-8').write(html)