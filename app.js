window.onload = function() {

var journal = [];
var contacts = [];

try { journal = JSON.parse(localStorage.getItem('nrdo_j') || '[]'); } catch(e) {}
try { contacts = JSON.parse(localStorage.getItem('nrdo_c') || '[]'); } catch(e) {}

function lsSave(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

// Dates auto
var now = new Date();
var el = document.getElementById('j-dt');
if(el) el.value = now.toISOString().split('T')[0];
el = document.getElementById('j-hr');
if(el) el.value = now.toTimeString().slice(0,5);

// ── JOURNAL ──────────────────────────────────────────────────────────────
function drawJ() {
  var sec = document.getElementById('j-section');
  var list = document.getElementById('j-list');
  var nb = document.getElementById('j-nb');
  if(!sec||!list) return;
  if(!journal.length){ sec.style.display='none'; return; }
  sec.style.display='block';
  if(nb) nb.textContent = journal.length;
  var html = '';
  for(var i=0;i<journal.length;i++){
    var e=journal[i];
    html += '<div class="ji">';
    html += '<div class="jh"><span class="jd">'+(e.dt||'-')+' '+(e.hr||'')+'</span>';
    html += '<span class="jt">'+(e.ty||'Autre')+'</span></div>';
    html += '<div class="jb">'+(e.au?e.au+' - ':'')+e.de+'</div>';
    if(e.te) html += '<div style="font-size:11px;color:#a09098;margin-top:3px">Temoin : '+e.te+'</div>';
    html += '<button class="jdl" data-id="'+e.id+'">Supprimer</button>';
    html += '</div>';
  }
  list.innerHTML = html;
  var dels = list.querySelectorAll('.jdl');
  for(var d=0;d<dels.length;d++){
    dels[d].onclick = function(){
      var id = parseInt(this.getAttribute('data-id'));
      if(!confirm('Supprimer ?')) return;
      journal = journal.filter(function(x){ return x.id!==id; });
      lsSave('nrdo_j',journal); drawJ();
    };
  }
}

var btnJ = document.getElementById('b-j-add');
if(btnJ) btnJ.onclick = function(){
  var de = document.getElementById('j-de').value.trim();
  if(!de){ alert('Veuillez decrire le fait.'); return; }
  journal.unshift({
    id:Date.now(),
    dt:document.getElementById('j-dt').value,
    hr:document.getElementById('j-hr').value,
    ty:document.getElementById('j-ty').value,
    au:document.getElementById('j-au').value.trim(),
    de:de,
    te:document.getElementById('j-te').value.trim()
  });
  lsSave('nrdo_j',journal);
  document.getElementById('j-de').value='';
  document.getElementById('j-au').value='';
  document.getElementById('j-te').value='';
  drawJ();
};

var btnJEx = document.getElementById('b-j-ex');
if(btnJEx) btnJEx.onclick = function(){
  if(!journal.length){ alert('Aucun incident.'); return; }
  var txt='JOURNAL DES FAITS\n'+new Date().toLocaleString('fr-FR')+'\n'+'='.repeat(50)+'\n\n';
  for(var i=0;i<journal.length;i++){
    var e=journal[i];
    txt+='Incident #'+(i+1)+'\nDate : '+(e.dt||'-')+' '+(e.hr||'')+'\nType : '+(e.ty||'-')+'\nAuteur : '+(e.au||'-')+'\nFaits : '+e.de+'\nTemoin : '+(e.te||'-')+'\n'+'-'.repeat(30)+'\n\n';
  }
  var a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));
  a.download='journal-'+Date.now()+'.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

drawJ();

// ── CONTACTS ──────────────────────────────────────────────────────────────
function drawC(){
  var grid=document.getElementById('c-grid');
  var form=document.getElementById('c-form');
  if(!grid) return;
  var html='';
  for(var i=0;i<contacts.length;i++){
    var c=contacts[i];
    if(!c.tl) continue;
    var tel=c.tl.replace(/[^0-9+]/g,'');
    if(tel.charAt(0)==='0'&&tel.length===10) tel='+33'+tel.slice(1);
    html+='<div class="cc">';
    html+='<button class="cdl" data-id="'+c.id+'">&times;</button>';
    html+='<div class="cav">'+(c.nm?c.nm.charAt(0).toUpperCase():'?')+'</div>';
    html+='<div class="cnm">'+c.nm+'</div>';
    html+='<div class="crl">'+(c.rl||'')+'</div>';
    html+='<span class="cnum">'+c.tl+'</span>';
    html+='<button class="ccall" data-tel="'+tel+'">&#128222; Appeler</button>';
    html+='<button class="cpos" data-tel="'+tel+'" data-nom="'+c.nm+'" style="display:block;width:100%;padding:8px;background:rgba(224,85,85,.15);border:1px solid rgba(224,85,85,.3);color:#f4a0a0;border-radius:20px;font-size:12px;font-weight:500;text-align:center;cursor:pointer;margin-top:6px;font-family:sans-serif">&#128205; Envoyer ma position</button>';
    html+='</div>';
  }
  grid.innerHTML=html;
  if(form) form.style.display=contacts.length>=5?'none':'block';
  var dels=grid.querySelectorAll('.cdl');
  for(var d=0;d<dels.length;d++){
    dels[d].onclick=function(){
      var id=parseInt(this.getAttribute('data-id'));
      if(!confirm('Supprimer ?')) return;
      contacts=contacts.filter(function(x){ return x.id!==id; });
      lsSave('nrdo_c',contacts); drawC();
    };
  }
  var calls=grid.querySelectorAll('.ccall');
  for(var cc=0;cc<calls.length;cc++){
    calls[cc].onclick=function(){
      window.location.href='tel:'+this.getAttribute('data-tel');
    };
  }
  var posbtns=grid.querySelectorAll('.cpos');
  for(var pp=0;pp<posbtns.length;pp++){
    posbtns[pp].onclick=function(){
      var tel=this.getAttribute('data-tel');
      var nom=this.getAttribute('data-nom');
      if(!navigator.geolocation){
        alert('GPS non disponible sur cet appareil.');
        return;
      }
      var btn=this;
      btn.textContent='Localisation...';
      btn.disabled=true;
      navigator.geolocation.getCurrentPosition(
        function(pos){
          var lat=pos.coords.latitude;
          var lng=pos.coords.longitude;
          var mapsUrl='https://maps.google.com/?q='+lat+','+lng;
          var msg='SOS - J ai besoin d aide MAINTENANT. Ma position : '+mapsUrl+' - Appelle-moi ! ('+new Date().toLocaleTimeString('fr-FR')+')';
          var smsUrl='sms:'+tel+'?body='+encodeURIComponent(msg);
          window.location.href=smsUrl;
          btn.textContent='Envoyer position';
          btn.disabled=false;
        },
        function(err){
          // Si GPS refuse, ouvrir quand meme SMS sans position
          var msg='SOS URGENT - J ai besoin d aide MAINTENANT. Appelle-moi immediatement ! ('+new Date().toLocaleTimeString('fr-FR')+') - Envoye depuis Ne restez pas dans l ombre';
          var smsUrl='sms:'+tel+'?body='+encodeURIComponent(msg);
          window.location.href=smsUrl;
          btn.textContent='Envoyer position';
          btn.disabled=false;
        },
        {enableHighAccuracy:true,timeout:8000,maximumAge:0}
      );
    };
  }
}

var btnC=document.getElementById('b-c-add');
if(btnC) btnC.onclick=function(){
  var nm=document.getElementById('c-nm').value.trim();
  var tl=document.getElementById('c-tl').value.trim();
  if(!nm){ alert('Entrez un nom.'); return; }
  if(!tl){ alert('Entrez un numero.'); return; }
  if(tl.replace(/[^0-9]/g,'').length<6){ alert('Numero invalide.'); return; }
  if(contacts.length>=5){ alert('Maximum 5 contacts.'); return; }
  contacts.push({id:Date.now(),nm:nm,rl:document.getElementById('c-rl').value.trim(),tl:tl});
  lsSave('nrdo_c',contacts);
  document.getElementById('c-nm').value='';
  document.getElementById('c-rl').value='';
  document.getElementById('c-tl').value='';
  drawC();
};

drawC();

// ── ENREGISTREUR ──────────────────────────────────────────────────────────
var mr=null,ch=[],ti=null,sc=0,bl=null,st=null;

function fmt(){
  if(!window.MediaRecorder) return null;
  var f=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'];
  for(var i=0;i<f.length;i++) if(MediaRecorder.isTypeSupported(f[i])) return f[i];
  return '';
}

function rSt(msg,col){
  var el=document.getElementById('rec-st');
  if(el){ el.textContent=msg; el.style.color=col||'#a09098'; }
}

var bRG=document.getElementById('b-rec-go');
var bRS=document.getElementById('b-rec-st');
var bRV=document.getElementById('b-rec-sv');

if(bRG) bRG.onclick=function(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    rSt('Microphone non disponible.','#e05555'); return;
  }
  rSt("Demande autorisation...",'#c9a96e');
  navigator.mediaDevices.getUserMedia({audio:true,video:false})
  .then(function(stream){
    st=stream; ch=[];
    var f=fmt(); var opt=(f&&f!=='')?{mimeType:f}:{};
    try{ mr=new MediaRecorder(stream,opt); }catch(e){ mr=new MediaRecorder(stream); }
    mr.ondataavailable=function(e){ if(e.data&&e.data.size>0) ch.push(e.data); };
    mr.start(500);
    bRG.disabled=true; bRS.disabled=false;
    document.getElementById('rec-tm').style.display='block';
    sc=0;
    ti=setInterval(function(){
      sc++;
      var m=String(Math.floor(sc/60)).padStart(2,'0');
      var s=String(sc%60).padStart(2,'0');
      document.getElementById('rec-tm').textContent=m+':'+s;
      rSt('Enregistrement '+m+':'+s,'#e05555');
    },1000);
  })
  .catch(function(err){
    var msg='Acces refuse. ';
    if(err.name==='NotAllowedError') msg+='iPhone : Reglages > Safari > Microphone > Autoriser.';
    else msg+=err.name;
    rSt(msg,'#e05555');
  });
};

if(bRS) bRS.onclick=function(){
  if(!mr) return;
  clearInterval(ti);
  mr.onstop=function(){
    var mime=mr.mimeType||'audio/webm';
    bl=new Blob(ch,{type:mime});
    if(st) st.getTracks().forEach(function(t){t.stop();});
    bRS.disabled=true; bRV.disabled=false; bRG.disabled=false;
    document.getElementById('rec-tm').style.display='none';
    rSt('Termine ('+(bl.size/1024).toFixed(0)+' Ko) - Sauvegarder','#5bab7e');
  };
  try{ mr.stop(); }catch(e){}
};

if(bRV) bRV.onclick=function(){
  if(!bl) return;
  var mime=bl.type||'audio/webm';
  var ext=mime.indexOf('mp4')>-1?'m4a':mime.indexOf('ogg')>-1?'ogg':'webm';
  var url=URL.createObjectURL(bl);
  var ts=new Date().toLocaleString('fr-FR');
  var item=document.createElement('div'); item.className='ri';
  var meta=document.createElement('span'); meta.style.cssText='font-size:12px;color:#a09098'; meta.textContent=ts;
  var audio=document.createElement('audio'); audio.controls=true; audio.src=url;
  var a=document.createElement('a'); a.href=url; a.download='enreg-'+Date.now()+'.'+ext;
  a.className='bsm'; a.style.textDecoration='none'; a.textContent='Telecharger';
  item.appendChild(meta); item.appendChild(audio); item.appendChild(a);
  document.getElementById('rec-list').appendChild(item);
  bRV.disabled=true; rSt('Pret a enregistrer'); bl=null;
};

// ── GPS ────────────────────────────────────────────────────────────────────
var gw=null,gp=[];

function gLine(txt,cls){
  var log=document.getElementById('gps-log');
  if(!log) return;
  log.style.display='block';
  var d=document.createElement('div');
  if(cls) d.className=cls;
  d.textContent=txt;
  log.appendChild(d); log.scrollTop=log.scrollHeight;
}

var bGG=document.getElementById('b-gps-go');
var bGS=document.getElementById('b-gps-st');
var bGE=document.getElementById('b-gps-ex');

if(bGG) bGG.onclick=function(){
  if(!navigator.geolocation){ gLine('GPS non disponible.','ger'); return; }
  gp=[]; document.getElementById('gps-log').innerHTML='';
  gLine("Demande autorisation GPS...");
  bGG.style.display='none'; bGS.style.display='inline-block';
  if(bGE) bGE.style.display='none';
  gw=navigator.geolocation.watchPosition(
    function(pos){
      var t=new Date().toLocaleTimeString('fr-FR');
      var lat=pos.coords.latitude,lng=pos.coords.longitude,acc=Math.round(pos.coords.accuracy);
      gp.push({t:t,lat:lat,lng:lng,acc:acc});
      gLine(t+' - '+lat.toFixed(6)+', '+lng.toFixed(6)+' (+-'+acc+'m)','gok');
    },
    function(err){
      var msg='GPS refuse.';
      if(err.code===1) msg='GPS refuse. iPhone : Reglages > Confidentialite > Service de localisation > Safari > Autoriser.';
      gLine(msg,'ger');
    },
    {enableHighAccuracy:true,maximumAge:5000,timeout:15000}
  );
};

if(bGS) bGS.onclick=function(){
  if(gw!==null){ navigator.geolocation.clearWatch(gw); gw=null; }
  bGG.style.display='inline-block'; bGS.style.display='none';
  if(gp.length&&bGE) bGE.style.display='inline-block';
  gLine('Suivi arrete. '+gp.length+' point(s).');
};

if(bGE) bGE.onclick=function(){
  if(!gp.length) return;
  var txt='TRAJET - '+new Date().toLocaleString('fr-FR')+'\n'+'='.repeat(40)+'\n';
  for(var i=0;i<gp.length;i++) txt+=gp[i].t+' | '+gp[i].lat+','+gp[i].lng+' +-'+gp[i].acc+'m\n';
  var a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  a.download='trajet-'+Date.now()+'.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

// ── ONGLETS ────────────────────────────────────────────────────────────────
var tabs=document.getElementById('tabs');
if(tabs) tabs.onclick=function(e){
  var b=e.target;
  if(!b.classList.contains('tab')) return;
  var t=b.getAttribute('data-t');
  document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('on'); });
  document.querySelectorAll('.tp').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on');
  var p=document.getElementById('t-'+t); if(p) p.classList.add('on');
};

// ── FORMULAIRE ─────────────────────────────────────────────────────────────
var mf=document.getElementById('mf');
if(mf) mf.onsubmit=function(e){
  e.preventDefault();
  var prenom = document.getElementById('f-prenom').value.trim();
  var situation = document.getElementById('f-situation').value;
  var message = document.getElementById('f-message').value.trim();
  if(!message){ alert('Veuillez ecrire un message.'); return; }
  var sujet = 'Ne restez pas dans l\'ombre - ' + (situation || 'Message');
  var corps = '';
  if(prenom) corps += 'De : ' + prenom + '\n\n';
  corps += 'Situation : ' + situation + '\n\n';
  corps += 'Message :\n' + message;
  var mailto = 'mailto:contact.kesug@gmail.com'
    + '?subject=' + encodeURIComponent(sujet)
    + '&body=' + encodeURIComponent(corps);
  window.location.href = mailto;
  mf.style.display='none';
  document.getElementById('mc').style.display='block';
};

// ── SORTIE RAPIDE ──────────────────────────────────────────────────────────
var exitBtn=document.getElementById('exit-btn');
if(exitBtn) exitBtn.onclick=function(){ window.location.replace('https://www.google.com/search?q=meteo+france'); };

};
