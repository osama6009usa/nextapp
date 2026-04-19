import re

html = open('public/team-static.html', encoding='utf-8').read()

new_fn = """function startSession(){
  if(sessionRunning) return; sessionRunning=true;
  var question = document.getElementById('rmQuestion') ? document.getElementById('rmQuestion').value : '';
  if(!question) question = ar ? 'ما رأيك في بياناتي الحالية؟' : 'What do you think of my current data?';
  document.getElementById('rmDefault2').style.display='none';
  document.getElementById('rmLoading').style.display='block';
  document.getElementById('rmResults').style.display='none';
  var badge=document.getElementById('rmBadge');
  badge.style.background='var(--abg)'; badge.style.color='var(--atx)'; badge.textContent=t('bdRunning');
  document.getElementById('rmStatus').textContent=t('rmGathering');
  var ll=document.getElementById('rmLoadList'); ll.innerHTML='';
  var active=selectedSpecs.slice(0,4);
  active.forEach(function(id){
    var s=SPECS.find(function(x){return x.id===id;});
    var localName = ar ? s.nameAr : s.name;
    var row=document.createElement('div');
    row.id='rl_'+id;
    row.style.cssText='display:flex;align-items:center;gap:9px;padding:9px 11px;background:var(--surf2);border-radius:8px;transition:all .3s;';
    row.innerHTML='<span style="font-size:18px;">'+s.em+'</span>'+
      '<div style="flex:1;"><div style="font-size:11px;font-weight:600;">'+(ar?'د. ':'Dr. ')+localName+'</div>'+
      '<div id="rs_'+id+'" style="font-size:9px;color:var(--t3);margin-top:1px;">'+t('analyzeLabel')+'</div></div>'+
      '<div id="rsp_'+id+'" style="width:16px;height:16px;border:2px solid '+s.color+';border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;"></div>';
    ll.appendChild(row);
  });
  var meetResponses = {};
  var remaining = active.length;
  active.forEach(function(id){
    var s=SPECS.find(function(x){return x.id===id;});
    fetch('/api/team/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({specialistId:id,messages:[{role:'user',content:question}],lang:ar?'ar':'en',userId:'static-user'})
    }).then(function(res){
      var reader=res.body.getReader();
      var decoder=new TextDecoder();
      var full='';
      function read(){
        reader.read().then(function(r){
          if(r.done){
            meetResponses[id]=full;
            var sp=document.getElementById('rsp_'+id);
            var rs=document.getElementById('rs_'+id);
            var rw=document.getElementById('rl_'+id);
            if(sp) sp.outerHTML='<span style="color:var(--grn);">✓</span>';
            if(rs) rs.textContent=t('doneLabel');
            if(rw) rw.style.background='var(--gbg)';
            remaining--;
            if(remaining===0) setTimeout(function(){ showResultsReal(meetResponses); },400);
            return;
          }
          full+=decoder.decode(r.value,{stream:true});
          read();
        });
      }
      read();
    }).catch(function(){
      remaining--;
      meetResponses[id]=ar?'حدث خطأ':'Error occurred';
      if(remaining===0) setTimeout(function(){ showResultsReal(meetResponses); },400);
    });
  });
}

function showResultsReal(responses){
  sessionRunning=false;
  document.getElementById('rmLoading').style.display='none';
  var rs=document.getElementById('rmResults'); rs.style.display='flex'; rs.innerHTML='';
  var badge=document.getElementById('rmBadge');
  badge.style.background='var(--gbg)'; badge.style.color='var(--gtx)'; badge.textContent=t('bdDone');
  document.getElementById('rmStatus').textContent=t('bdDone');
  var grid=document.createElement('div'); grid.className='responses-grid';
  selectedSpecs.slice(0,4).forEach(function(id){
    var s=SPECS.find(function(x){return x.id===id;}); if(!s) return;
    var localName = ar ? s.nameAr : s.name;
    var card=document.createElement('div'); card.className='resp-card anim';
    card.innerHTML=
      '<div class="resp-head">'+
        '<div class="resp-av" style="background:'+s.color+'18;">'+s.em+'</div>'+
        '<div><div class="resp-name">'+(ar?'د. ':'Dr. ')+localName+'</div><div class="resp-role">'+tv(s.role)+'</div></div>'+
      '</div>'+
      '<div class="resp-body">'+(responses[id]||'')+'</div>';
    grid.appendChild(card);
  });
  rs.appendChild(grid);
  var verdict=document.createElement('div'); verdict.className='verdict-card anim';
  verdict.innerHTML=
    '<div class="vd-lbl">'+t('verdDecision')+'</div>'+
    '<div class="vd-head"><div class="vd-icon">🎯</div><div class="vd-title">'+t('verdTitle')+'</div></div>'+
    '<div class="vd-txt">'+t('verdTxt')+'</div>'+
    '<div class="vd-actions">'+
      '<button class="va va-w" onclick="alert(ar?\'تم تطبيق القرار وحفظه\':\\\'Decision applied and saved\\\')">'+t('applyDecision')+'</button>'+
      '<button class="va va-g">'+t('archiveBtn')+'</button>'+
      '<button class="va va-g" onclick="resetSession()">'+t('newSession')+'</button>'+
    '</div>';
  rs.appendChild(verdict);
}"""

pattern = r'function startSession\(\)\{.*?\}(?=\nfunction )'
match = re.search(pattern, html, re.DOTALL)
if match:
    html = html[:match.start()] + new_fn + html[match.end():]
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done')
else:
    print('Pattern not found')