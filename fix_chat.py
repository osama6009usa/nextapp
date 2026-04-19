html = open('public/team-static.html', encoding='utf-8').read()

old = '''function sendMessage(){
  var inp=document.getElementById('chatInput');
  var txt=inp.value.trim(); if(!txt) return;
  var body=document.getElementById('chatBody');
  var ti=document.getElementById('typingInd');
  var em=currentSpec?currentSpec.em:'\uD83E\uDEAC';
  var um=document.createElement('div'); um.className='msg user anim';
  um.innerHTML='<div class="msg-av uav">'+t('userAv')+'</div><div><div class="msg-bubble">'+txt+'</div><div class="msg-time">'+gT()+'</div></div>';
  body.insertBefore(um,ti); inp.value='';
  ti.style.display='flex'; body.scrollTop=body.scrollHeight;
  setTimeout(function(){
    ti.style.display='none';
    var replies=ar?AI_AR:AI_EN;
    var rep=replies[Math.floor(Math.random()*replies.length)];
    var rm=document.createElement('div'); rm.className='msg spec anim';
    rm.innerHTML='<div class="msg-av">'+em+'</div><div><div class="msg-bubble">'+rep+'</div>'+
      '<div class="conf-bar"><div class="conf-pips">'+
      '<div class="conf-pip" style="background:var(--grn);"></div>'.repeat(3)+
      '<div class="conf-pip" style="background:var(--brd);"></div></div>'+
      '<span class="conf-text" style="color:var(--gtx);">🟢 '+(ar?'\u0639\u0627\u0644\u064A':'High')+'</span>'+
      '<span class="conf-src">'+(ar?'\u0628\u064A\u0627\u0646\u0627\u062A\u0643':'Your data')+'</span></div>'+
      '<div class="msg-time">'+gT()+'</div></div>';
    body.insertBefore(rm,ti); body.scrollTop=body.scrollHeight;
  },1700);
}'''

new_fn = '''var chatMessages = [];
function sendMessage(){
  var inp=document.getElementById('chatInput');
  var txt=inp.value.trim(); if(!txt) return;
  var body=document.getElementById('chatBody');
  var ti=document.getElementById('typingInd');
  var em=currentSpec?currentSpec.em:'\uD83E\uDEAC';
  var um=document.createElement('div'); um.className='msg user anim';
  um.innerHTML='<div class="msg-av uav">'+(ar?'\u0623\u0633':'U')+'</div><div><div class="msg-bubble">'+txt+'</div><div class="msg-time">'+gT()+'</div></div>';
  body.insertBefore(um,ti); inp.value='';
  chatMessages.push({role:'user',content:txt});
  ti.style.display='flex'; body.scrollTop=body.scrollHeight;
  var rm=document.createElement('div'); rm.className='msg spec anim';
  rm.innerHTML='<div class="msg-av">'+em+'</div><div><div class="msg-bubble" id="streaming-msg"></div><div class="msg-time">'+gT()+'</div></div>';
  body.insertBefore(rm,ti);
  var specId = currentSpec ? currentSpec.id : 'AT';
  var lang = ar ? 'ar' : 'en';
  fetch('/api/team/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({specialistId:specId, messages:chatMessages, lang:lang, userId:'static-user'})
  }).then(function(res){
    ti.style.display='none';
    var reader=res.body.getReader();
    var decoder=new TextDecoder();
    var el=document.getElementById('streaming-msg');
    function read(){
      reader.read().then(function(r){
        if(r.done){ chatMessages.push({role:'assistant',content:el.textContent}); body.scrollTop=body.scrollHeight; return; }
        el.textContent += decoder.decode(r.value,{stream:true});
        body.scrollTop=body.scrollHeight;
        read();
      });
    }
    read();
  }).catch(function(){
    ti.style.display='none';
    var el=document.getElementById('streaming-msg');
    if(el) el.textContent = ar?'\u062D\u062F\u062B \u062E\u0637\u0623\u060C \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649':'Error occurred, please try again.';
  });
}'''

if old in html:
    html = html.replace(old, new_fn)
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done - sendMessage updated')
else:
    print('Pattern not found - trying partial match')
    if 'AI_AR' in html and 'AI_EN' in html:
        print('AI arrays found in file')
    print('File length: ' + str(len(html)))
