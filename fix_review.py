import re

html = open('public/team-static.html', encoding='utf-8').read()

new_fn = """function sendReviewMsg(inputId,bodyId,typingId,repliesAr,repliesEn){
  var inp=document.getElementById(inputId);
  var body=document.getElementById(bodyId);
  var ti=document.getElementById(typingId);
  var txt=inp.value.trim(); if(!txt) return;
  var um=document.createElement('div'); um.className='msg user anim';
  um.innerHTML='<div class="msg-av uav">'+(ar?'أس':'U')+'</div><div><div class="msg-bubble">'+txt+'</div><div class="msg-time">'+gT()+'</div></div>';
  body.insertBefore(um,ti); inp.value='';
  ti.style.display='flex'; body.scrollTop=body.scrollHeight;
  var msgId='rev-'+Date.now();
  var rm=document.createElement('div'); rm.className='msg spec anim';
  rm.innerHTML='<div class="msg-av">🫀</div><div><div class="msg-bubble" id="'+msgId+'"></div><div class="msg-time">'+gT()+'</div></div>';
  body.insertBefore(rm,ti);
  fetch('/api/team/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({specialistId:'AT',messages:[{role:'user',content:txt}],lang:ar?'ar':'en',userId:'static-user'})
  }).then(function(res){
    ti.style.display='none';
    var reader=res.body.getReader();
    var decoder=new TextDecoder();
    var el=document.getElementById(msgId);
    function read(){
      reader.read().then(function(r){
        if(r.done){body.scrollTop=body.scrollHeight;return;}
        if(el)el.textContent+=decoder.decode(r.value,{stream:true});
        body.scrollTop=body.scrollHeight;
        read();
      });
    }
    read();
  }).catch(function(){
    ti.style.display='none';
    var el=document.getElementById(msgId);
    if(el)el.textContent=ar?'حدث خطأ، حاول مرة أخرى':'Error, please try again.';
  });
}"""

pattern = r'function sendReviewMsg\(inputId,bodyId,typingId,repliesAr,repliesEn\)\{.*?\}(?=\nfunction )'
match = re.search(pattern, html, re.DOTALL)
if match:
    html = html[:match.start()] + new_fn + html[match.end():]
    open('public/team-static.html', 'w', encoding='utf-8').write(html)
    print('Done')
else:
    print('Pattern not found')