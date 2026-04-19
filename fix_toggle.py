html = open('public/team-static.html', encoding='utf-8').read()

old = """    div.onclick=function(){
      var idx=selectedSpecs.indexOf(s.id);
      if(idx>-1){if(selectedSpecs.length>1)selectedSpecs.splice(idx,1);}
      else selectedSpecs.push(s.id);
      div.classList.toggle('on',selectedSpecs.indexOf(s.id)!==-1);
      updateSelCount(); updateSessionAvs();
    };"""

new = """    div.onclick=function(){
      var idx=selectedSpecs.indexOf(s.id);
      var mode=window._presetMode||'general';
      if(mode==='solo'){
        selectedSpecs=[s.id];
        document.querySelectorAll('.spec-sel').forEach(function(d){
          d.classList.toggle('on',d.dataset.id===s.id);
        });
      } else {
        if(idx>-1){if(selectedSpecs.length>1)selectedSpecs.splice(idx,1);}
        else selectedSpecs.push(s.id);
        div.classList.toggle('on',selectedSpecs.indexOf(s.id)!==-1);
      }
      updateSelCount(); updateSessionAvs();
    };"""

if old in html:
    html = html.replace(old, new)
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done')
else:
    print('Not found')