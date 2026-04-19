html = open('public/team-static.html', encoding='utf-8').read()

old = """function selectPreset(type,el){
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

new = """function selectPreset(type,el){
  document.querySelectorAll('.preset').forEach(function(p){p.classList.remove('on');}); el.classList.add('on');
  if(type==='1'){
    selectedSpecs=['AT'];
    window._presetMode='solo';
  } else if(type==='selectall'){
    selectedSpecs=SPECS.map(function(s){return s.id;});
    window._presetMode='general';
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
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done')
else:
    print('Not found')