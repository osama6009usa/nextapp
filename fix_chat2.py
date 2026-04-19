import re

html = open('public/team-static.html', encoding='utf-8').read()

new_fn = '''var chatMessages = [];
function sendMessage(){
  var inp=document.getElementById('chatInput');
  var txt=inp.value.trim(); if(!txt) return;
  var body=document.getElementById('chatBody');
  var ti=document.getElementById('typingInd');
  var em=currentSpec?currentSpec.em:'\u{1FAC2}';
  var um=document.createElement('div'); um.className='msg user anim';
  um.innerHTML='<div class="msg-av uav">'+(ar?'\u0623\u0633':'U')+'</div><div><div class="msg-bubble">'+txt+'</div><div class="msg-time">'+gT()+'</div></div>';
  body.insertBefore(um,ti); inp.value='';
  chatMessages.push({role:'user',content:txt});
  ti.style.display='flex'; body.scrollTop=body.scrollHeight;
  var rm=document.createElement('div'); rm.className='msg spec anim';
  var msgId='msg-'+Date.now();
  rm.innerHTML='<div class="msg-av">'+em+'</div><div><div class="msg-bubble" id="'+msgId+'"></div><div class="msg-time">'+gT()+'</div></div>';
  body.insertBefore(rm,ti);
  var specId=currentSpec?currentSpec.id:'AT';
  fetch('/api/team/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({specialistId:specId,messages:chatMessages,lang:ar?'ar':'en',userId:'static-user'})
  }).then(function(res){
    ti.style.display='none';
    var reader=res.body.getReader();
    var decoder=new TextDecoder();
    var el=document.getElementById(msgId);
    var full='';
    function read(){
      reader.read().then(function(r){
        if(r.done){chatMessages.push({role:'assistant',content:full});body.scrollTop=body.scrollHeight;return;}
        var chunk=decoder.decode(r.value,{stream:true});
        full+=chunk;
        if(el)el.textContent+=chunk;
        body.scrollTop=body.scrollHeight;
        read();
      });
    }
    read();
  }).catch(function(){
    ti.style.display='none';
    var el=document.getElementById(msgId);
    if(el)el.textContent=ar?'\u062D\u062F\u062B \u062E\u0637\u0623\u060C \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649':'Error, please try again.';
  });
}'''

pattern = r'function sendMessage\(\)\{.*?\}(?=\nfunction )'
match = re.search(pattern, html, re.DOTALL)
if match:
    html = html[:match.start()] + new_fn + html[match.end():]
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done - replaced successfully')
else:
    print('Pattern not found')
