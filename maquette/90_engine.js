(function(){
"use strict";
var root=document.documentElement, app=document.getElementById('app');
var nf=new Intl.NumberFormat('fr-FR');
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

/* ================= PERSONAS & PERMISSIONS (FIXTURES §2) ================= */
var VIEW_FIN=['finance.*.view'], VIEW_CORE_BASE=['core.notifications.view','core.incidents.view'];
var PERSONAS=[
 {id:'sa',user:'Saliou Doucouré',short:'S. Doucouré',av:'SD',profile:'Super Admin',entity:'MG',cat:'Interne — Employé',perms:['core.*','finance.*']},
 {id:'sa-mlc',user:'Saliou Doucouré',short:'S. Doucouré',av:'SD',profile:'Directeur financier MLC',entity:'MLC',cat:'Interne — Employé',perms:[],off:'Entité MLC à migrer : ce profil ne peut pas être activé'},
 {id:'dg',user:'Ousmane Seck',short:'O. Seck',av:'OS',profile:'DG Mata',entity:'MG',cat:'Interne — Employé',perms:['core.entites.view','core.utilisateurs.view','core.demandes.view','core.demandes.valider','core.audit.view','core.agents.view','core.notifications.view','core.alertes.view','core.incidents.view'].concat(VIEW_FIN,['finance.transferts.initier','finance.transferts.valider','finance.validations.agir','finance.ajustements.valider','finance.reconciliation.valider','finance.comptes.desactiver','finance.export','core.export'])},
 {id:'dirops',user:'Fatou Sarr',short:'F. Sarr',av:'FS',profile:'Directeur des Opérations',entity:'MG',cat:'Interne — Employé',perms:VIEW_CORE_BASE.concat(['core.demandes.view','core.demandes.initier','finance.dashboard.view','finance.comptes.view','finance.depenses.view','finance.depenses.creer','finance.depenses.modifier','finance.fournisseurs.view','finance.fournisseurs.payer','finance.creances.view','finance.creances.accorder','finance.creances.facturer','finance.reconciliation.view','finance.transferts.view','finance.transferts.initier','finance.validations.view','finance.pnl.view','finance.charges.view','finance.historique.view','finance.stock.view','finance.declarations.view','finance.declarations.declarer'])},
 {id:'caisse',user:'Moussa Diop',short:'M. Diop',av:'MD',profile:'Gestionnaire de caisse',entity:'MG',cat:'Interne — Employé',perms:VIEW_CORE_BASE.concat(['finance.declarations.view','finance.declarations.declarer','finance.comptes.view','finance.depenses.view','finance.depenses.creer','finance.reconciliation.view'])},
 {id:'collecteur',user:'Abdou Ndiaye',short:'A. Ndiaye',av:'AN',profile:'Collecteur',entity:'MG',cat:'Interne — Employé',perms:VIEW_CORE_BASE.concat(['finance.declarations.view','finance.declarations.declarer','finance.reconciliation.view'])},
 {id:'invest',user:'Ibrahima Kane',short:'I. Kane',av:'IK',profile:'Investisseur',entity:'MG',cat:'Externe — Investisseur',perms:['core.notifications.view','finance.dashboard.view','finance.pnl.view','finance.historique.view'],readonly:true},
 {id:'compta',user:'Coumba Mbaye',short:'C. Mbaye',av:'CM',profile:'Comptable externe',entity:'MG',cat:'Externe — Comptable · accès temporaire jusqu’au 30/09/2026',perms:['core.notifications.view','finance.comptes.view','finance.depenses.view','finance.fournisseurs.view','finance.pnl.view','finance.historique.view'],readonly:true,expires:'30/09/2026'},
 {id:'maas',user:'Babacar Fall',short:'B. Fall',av:'BF',profile:'Gérant MaaS Keur Massar',entity:'MAAS-KM',cat:'Externe — MaaS',perms:['core.notifications.view','core.demandes.view','core.demandes.initier','finance.creances.view','finance.declarations.view','finance.declarations.declarer']}
];
var ENTITIES=[
 {id:'MG',name:'Mata Group',type:'Entité mère',st:'ok',lbl:'Active'},
 {id:'MLC',name:'MLC',type:'Filiale',st:'mut',lbl:'À migrer',off:'Référentiels MLC à migrer avant activation'},
 {id:'MV',name:'Mata Volaille',type:'Filiale',st:'mut',lbl:'À migrer',off:'Fork historique à resynchroniser avant activation'},
 {id:'KB',name:'Keur Bally',type:'Filiale (franchise)',st:'mut',lbl:'À activer',off:'Activation par configuration, sans fork applicatif'},
 {id:'MAAS-KM',name:'MaaS Keur Massar',type:'MaaS',st:'mut',lbl:'À activer',off:'Instance MaaS activable ultérieurement par configuration'},
 {id:'MAAS-ALL',name:'11 autres MaaS',type:'MaaS',st:'mut',lbl:'À activer',off:'Ouakam, Pikine, Rufisque, Grand Yoff, Parcelles, Médina, Yoff, Ngor, Thiaroye, Guédiawaye, HLM'}
];
var NOTIFS=[
 {t:'21:15',crit:true,ic:'alert',cls:'bad',txt:'Écart −25 000 sur Sous-caisse Marché (déclaré par M. Diop)',go:'fin-reconciliation'},
 {t:'19:02',crit:true,ic:'check',cls:'warn',txt:'Ajustement +180 000 Caisse générale : 2e validation requise',go:'fin-validations'},
 {t:'18:05',crit:true,ic:'swap',cls:'info',txt:'Transfert 600 000 BOA → Caisse générale proposé par F. Sarr',go:'fin-validations'},
 {t:'17:30',crit:true,ic:'clock',cls:'bad',txt:'Échéance dépassée : MATA VOLAILLE ŒUFS 1 150 000 (25/08)',go:'fin-fournisseurs'},
 {t:'15:24',crit:false,ic:'alert',cls:'warn',txt:'Plafond d’encours dépassé : AGNEAUX 12,4 M / 10 M',go:'fin-fournisseurs'},
 {t:'12:00',crit:true,ic:'clock',cls:'warn',txt:'Relais « Bictorys → Banque » ouvert depuis 3 jours (seuil 2 j)',go:'fin-comptes'}
];
var MODULE_LABEL={core:'Mata Core',finance:'Mata Finance'};
var state={persona:PERSONAS[0],module:'',screen:'hub'};
var registry={},inited={};

function permMatch(pattern,perm){
  var p=pattern.split('.'),q=perm.split('.');
  for(var i=0;i<p.length;i++){
    if(p[i]==='*'){ if(i===p.length-1)return true; if(q[i]===undefined)return false; continue; }
    if(p[i]!==q[i])return false;
  }
  return p.length===q.length;
}
function hasPerm(perm){
  if(!perm)return true;
  return state.persona.perms.some(function(pt){return permMatch(pt,perm);});
}
function denyReason(perm){return 'Refus par défaut : la permission « '+perm+' » n’est pas accordée au profil '+state.persona.profile+'.';}

/* ================= TOAST / FORMAT ================= */
var toastEl=$('.toast'),toastT=null;
function toast(msg){
  toastEl.innerHTML='<svg class="ok-ic" style="width:14px;height:14px;display:inline-block"><use href="#i-check"/></svg>'+msg;
  toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on');},3600);
}
function fmt(n){return (n<0?'−':'')+nf.format(Math.abs(n));}
function formatAmounts(scope){
  $$('[data-amt]',scope||document).forEach(function(el){
    var raw=el.getAttribute('data-amt');
    if(el.dataset.done===raw)return; el.dataset.done=raw;
    var v=parseInt(raw,10); if(isNaN(v))return;
    el.textContent=fmt(v); el.classList.toggle('neg',v<0);
    if(!el.hasAttribute('data-nocur')){var c=document.createElement('span');c.className='cur';c.textContent='FCFA';el.appendChild(c);}
  });
}

/* ================= PERMISSIONS → DOM ================= */
function applyPerms(){
  $$('[data-perm]').forEach(function(el){
    if(el.classList.contains('scr'))return;
    var ok=hasPerm(el.getAttribute('data-perm'));
    var init=el.getAttribute('data-initiator');
    var selfBlock=init&&(init===state.persona.short||init===state.persona.user);
    var vb=el.getAttribute('data-validated-by');
    var dupBlock=vb&&vb.split(',').some(function(n){n=n.trim();return n===state.persona.short||n===state.persona.user;});
    var deny=!ok||selfBlock||dupBlock;
    el.classList.toggle('denied',deny);
    if((el.tagName==='BUTTON'||el.tagName==='SELECT'||el.tagName==='INPUT')&&!el.classList.contains('ni'))el.disabled=deny;
    if(deny){el.title=selfBlock?'Séparation des responsabilités : l’initiateur ne valide jamais sa propre opération.':(dupBlock?'Double validation : les deux validateurs doivent être distincts, vous avez déjà donné la première validation.':denyReason(el.getAttribute('data-perm')));}
    else el.removeAttribute('title');
    if(el.classList.contains('ni')){
      var ic=$('.deny-ic',el);
      if(deny&&!ic){ic=document.createElementNS('http://www.w3.org/2000/svg','svg');ic.setAttribute('class','deny-ic');ic.innerHTML='<use href="#i-lock"/>';el.appendChild(ic);}
      if(!deny&&ic)ic.remove();
    }
  });
  if(state.persona.readonly){
    $$('.scr .btn.pri').forEach(function(b){ if(!b.hasAttribute('data-perm')&&!b.hasAttribute('data-close')&&!b.closest('.mback')){b.disabled=true;b.classList.add('denied');b.title='Profil externe en lecture seule : aucune écriture possible.';} });
  }
  updateBadges();
}
function updateBadges(){
  var map={valid:hasPerm('finance.validations.agir')?4:(hasPerm('finance.validations.view')?1:0),recon:hasPerm('finance.reconciliation.view')?3:0,decl:hasPerm('finance.declarations.declarer')?(state.persona.id==='caisse'?1:2):0,demandes:hasPerm('core.demandes.valider')?1:(hasPerm('core.demandes.initier')?1:0),notifs:hasPerm('core.notifications.view')?6:0};
  Object.keys(map).forEach(function(k){var b=$('[data-bdg="'+k+'"]');if(b){b.textContent=String(map[k]);b.classList.toggle('zero',map[k]===0);}});
}

/* ================= NAVIGATION ================= */
function setModule(m){
  state.module=m;app.setAttribute('data-module',m);app.classList.toggle('hub-mode',!m);
  $$('.nav [data-nav-group]').forEach(function(h){h.hidden=h.getAttribute('data-nav-group')!==m;});
  $$('.nav .ni[data-module]').forEach(function(n){n.hidden=n.getAttribute('data-module')!==m;});
  var lbl=$('[data-sb-module]');if(lbl)lbl.textContent=MODULE_LABEL[m]||'Accueil';
  var cr=$('[data-crumb]');if(cr)cr.textContent=m?'ERP Mata · '+MODULE_LABEL[m]:'ERP Mata';
}
function firstAllowed(m){var n=$$('.nav .ni[data-module="'+m+'"]').filter(function(x){return hasPerm(x.getAttribute('data-perm'));})[0];return n?n.getAttribute('data-screen'):null;}
function go(id){
  var sec=$('.scr[data-scr="'+id+'"]');
  if(!sec){toast('Écran « '+id+' » : non inclus dans cette version de la maquette');return;}
  var perm=sec.getAttribute('data-perm');
  if(perm&&!hasPerm(perm)){toast(denyReason(perm));return;}
  if(id==='hub')setModule('');else setModule(sec.getAttribute('data-module')||state.module);
  $$('.scr').forEach(function(s){var on=s===sec;s.classList.toggle('on',on);s.hidden=!on;});
  $$('.nav .ni').forEach(function(n){var on=n.getAttribute('data-screen')===id;n.classList.toggle('on',on);if(on)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});
  var nav=$('.nav .ni[data-screen="'+id+'"]');
  var h1=$('[data-h1]');if(h1)h1.textContent=id==='hub'?'Accueil':(nav?nav.getAttribute('data-title').replace(/&amp;/g,'&'):($('h2',sec)?$('h2',sec).textContent:id));
  state.screen=id;closeDrawerNav();window.scrollTo({top:0});
  try{history.replaceState(null,'',location.pathname+(id==='hub'?'':'#'+id));}catch(x){}
  if(!inited[id]){inited[id]=true;formatAmounts(sec);if(registry[id]){try{registry[id](sec,ctx);}catch(e){console.error('init '+id,e);}}}
  drawCharts(sec);setTimeout(function(){drawCharts(sec);},60);
}

/* ================= HUB / PERSONA ================= */
function renderHub(){
  ['core','finance'].forEach(function(m){
    var all=$$('.nav .ni[data-module="'+m+'"]'),ok=all.filter(function(n){return hasPerm(n.getAttribute('data-perm'));});
    var c=$('[data-hub-count="'+m+'"]');if(c)c.textContent=ok.length+' / '+all.length+' écrans';
    var card=$('[data-hub="'+m+'"]');if(card)card.classList.toggle('soon',ok.length===0);
  });
  var r=$('[data-hub-rights]');
  if(r){
    var p=state.persona,items=[];
    items.push(['Profil actif',p.profile+(p.expires?' · expire le '+p.expires:'')]);
    items.push(['Catégorie',p.cat]);
    items.push(['Écriture financière',p.readonly?'Interdite (Externe, lecture seule)':(hasPerm('finance.depenses.creer')?'Autorisée selon permissions':'Non accordée')]);
    items.push(['Validations',hasPerm('finance.validations.agir')?'Peut valider les opérations d’autrui, jamais les siennes':'Aucun droit de validation']);
    items.push(['Export',hasPerm('finance.export')||hasPerm('core.export')?'Autorisé (permission distincte de Consulter)':'Refusé : Consulter n’implique pas Exporter']);
    items.push(['Audit',hasPerm('core.audit.view')?'Consultation du journal central':'Journal central non accessible']);
    r.innerHTML=items.map(function(it){return '<div class="due"><span>'+it[0]+'</span><span class="hint" style="text-align:right;max-width:60%">'+it[1]+'</span></div>';}).join('');
  }
  var td=$('[data-hub-todo]');
  if(td){
    var rows=[];
    if(hasPerm('finance.validations.agir'))rows.push(['4 validations en attente','Transfert, ajustement, correction, désactivation','fin-validations','warn','À valider']);
    if(hasPerm('finance.declarations.declarer'))rows.push([state.persona.id==='collecteur'?'Collecte du 27/08 à déclarer ce soir':'Caisse générale à déclarer','Réconciliation en aveugle avant 23:59','fin-declarations','mut','À déclarer']);
    if(hasPerm('finance.reconciliation.view'))rows.push(['Écart Sous-caisse Marché −25 000','Investigation puis Ajustement si nécessaire','fin-reconciliation','bad','Écart']);
    if(hasPerm('finance.fournisseurs.view'))rows.push(['2 échéances fournisseurs dépassées','1 950 000 · ŒUFS et Aliments Sénégal','fin-fournisseurs','bad','Dépassées']);
    if(hasPerm('core.demandes.valider'))rows.push(['DEM-031 en attente','Création utilisateur demandée par B. Fall','core-demandes','warn','À traiter']);
    if(hasPerm('core.demandes.initier')&&!hasPerm('core.demandes.valider'))rows.push(['DEM-030 retournée','Préciser date de fin et périmètre','core-demandes','warn','À corriger']);
    if(!rows.length)rows.push(['Rien à traiter pour ce profil','Lecture seule sur votre périmètre','hub','mut','—']);
    td.innerHTML=rows.map(function(x){return '<div class="row"><div class="nm">'+x[0]+'<small>'+x[1]+'</small></div><button class="st '+x[3]+'" data-goto="'+x[2]+'" style="border:none;cursor:pointer">'+x[4]+'</button></div>';}).join('');
  }
}
function setPersona(p){
  state.persona=p;
  var ent=ENTITIES.filter(function(e){return e.id===p.entity;})[0]||ENTITIES[0];
  $$('[data-user-av]').forEach(function(e){e.textContent=p.av;});
  $$('[data-user-name]').forEach(function(e){e.textContent=p.user;});
  $$('[data-user-profile]').forEach(function(e){e.textContent=p.profile+' · '+ent.name;});
  $$('[data-profile-name],[data-hub-profile]').forEach(function(e){e.textContent=p.profile+' — '+p.short;});
  $$('[data-entity-name],[data-hub-entity],[data-sb-entity]').forEach(function(e){e.textContent=ent.name;});
  var hc=$('[data-hub-cat]');if(hc)hc.textContent=p.cat;
  applyPerms();renderHub();renderPops();
  try{document.dispatchEvent(new CustomEvent('erp:profile',{detail:p}));}catch(e){}
  var cur=$('.scr[data-scr="'+state.screen+'"]');
  if(cur&&cur.getAttribute('data-perm')&&!hasPerm(cur.getAttribute('data-perm'))){go('hub');toast('Profil '+p.profile+' : l’écran précédent n’est pas dans votre périmètre, retour à l’accueil.');}
  else if(setPersona.ready)toast('Profil actif : '+p.profile+' — menu et permissions recalculés');
  setPersona.ready=true;
}
function renderPops(){
  var pl=$('[data-profile-list]');
  if(pl)pl.innerHTML=PERSONAS.map(function(p){
    var on=p===state.persona,off=!!p.off;
    return '<button class="pi'+(on?' on':'')+(off?' off':'')+'" data-persona="'+p.id+'"'+(off?' title="'+p.off+'"':'')+'><span class="av">'+p.av+'</span><span><b>'+p.profile+'</b><small>'+p.user+' · '+p.cat.split(' ·')[0]+'</small></span>'+(off?'<span class="st mut">Non activable</span>':(on?'<span class="st ok">Actif</span>':''))+'</button>';
  }).join('');
  var el=$('[data-entity-list]');
  if(el)el.innerHTML=ENTITIES.map(function(e){
    var on=e.id===state.persona.entity,sel=!e.off||on;
    return '<button class="pi'+(on?' on':'')+(sel?'':' off')+'" data-entity="'+e.id+'"'+(e.off&&!on?' title="'+e.off+'"':'')+'><span class="av" style="background:var(--card-3);color:var(--ink-2)">'+e.id.slice(0,2)+'</span><span><b>'+e.name+'</b><small>'+e.type+'</small></span><span class="st '+e.st+'">'+e.lbl+'</span></button>';
  }).join('');
  var nl=$('[data-notif-list]');
  if(nl)nl.innerHTML=NOTIFS.map(function(n){
    var bg={bad:'var(--bad-bg)',warn:'var(--warn-bg)',info:'var(--red-tint)'}[n.cls],fg={bad:'var(--bad)',warn:'var(--warn)',info:'var(--red)'}[n.cls];
    return '<button class="ni2" data-goto="'+n.go+'"><div style="width:26px;height:26px;border-radius:7px;display:grid;place-items:center;background:'+bg+';color:'+fg+';flex:none"><svg style="width:13px;height:13px"><use href="#i-'+n.ic+'"/></svg></div><div style="font-size:12px;line-height:1.45"><b>'+n.txt+'</b><small style="display:block;color:var(--mut);font-size:10.5px">'+n.t+(n.crit?' · critique, non désactivable':'')+'</small></div></button>';
  }).join('');
}

/* ================= OVERLAYS (délégation) ================= */
function openOv(id){var ov=$('[data-ov="'+id+'"]');if(!ov)return;ov.classList.add('on');var bk=$('[data-ov-back="'+id+'"]');if(bk)bk.classList.add('on');var i=$('input:not([type=hidden]),select',ov);if(i&&ov.classList.contains('mback'))setTimeout(function(){i.focus();},60);}
function closeOv(ov){if(!ov)return;ov.classList.remove('on');var id=ov.getAttribute('data-ov');var bk=id&&$('[data-ov-back="'+id+'"]');if(bk)bk.classList.remove('on');}
function closeAll(){$$('.mback.on,.drawer.on,.notifpop.on,.pop.on').forEach(function(o){o.classList.remove('on');});$$('.dback.on').forEach(function(b){b.classList.remove('on');});}
function closeDrawerNav(){var sb=$('.sb');if(sb)sb.classList.remove('open');var sc=$('[data-scrim]');if(sc)sc.classList.remove('on');}
document.addEventListener('click',function(e){
  var t=e.target;
  var op=t.closest('[data-open]');
  if(op){e.stopPropagation();if(op.classList.contains('denied')){toast(op.title);return;}openOv(op.getAttribute('data-open'));return;}
  var cl=t.closest('[data-close]');
  if(cl){closeOv(cl.closest('.mback,.drawer,.notifpop,.pop'));return;}
  if(t.classList.contains('mback')){closeOv(t);return;}
  if(t.hasAttribute('data-ov-back')){closeAll();return;}
  var gt=t.closest('[data-goto]');
  if(gt){closeAll();go(gt.getAttribute('data-goto'));return;}
  var nav=t.closest('.nav .ni');
  if(nav){var perm=nav.getAttribute('data-perm');if(perm&&!hasPerm(perm)){toast(denyReason(perm));return;}go(nav.getAttribute('data-screen'));return;}
  var hub=t.closest('[data-hub]');
  if(hub){var m=hub.getAttribute('data-hub'),f=firstAllowed(m);if(!f){toast('Aucun écran de '+MODULE_LABEL[m]+' n’est accessible au profil '+state.persona.profile);return;}go(f);return;}
  var sel=t.closest('[data-sel]');
  if(sel){e.stopPropagation();var pop=$('[data-pop="'+sel.getAttribute('data-sel')+'"]');var was=pop.classList.contains('on');closeAll();if(!was){var r=sel.getBoundingClientRect();pop.style.top=(r.bottom+8)+'px';pop.style.left=Math.max(8,Math.min(r.left,window.innerWidth-348))+'px';pop.classList.add('on');}return;}
  var per=t.closest('[data-persona]');
  if(per){var p=PERSONAS.filter(function(x){return x.id===per.getAttribute('data-persona');})[0];if(p.off){toast(p.off);return;}closeAll();setPersona(p);return;}
  var ent=t.closest('[data-entity]');
  if(ent){var en=ENTITIES.filter(function(x){return x.id===ent.getAttribute('data-entity');})[0];if(en.id!==state.persona.entity){toast(en.off||'Entité non sélectionnable');return;}closeAll();return;}
  var bell=t.closest('[data-notif]');
  if(bell){e.stopPropagation();var np=$('[data-notifpop]');var w=np.classList.contains('on');closeAll();if(!w){var rb=bell.getBoundingClientRect();np.style.top=(rb.bottom+8)+'px';np.style.left=Math.max(8,Math.min(rb.right-330,window.innerWidth-338))+'px';np.classList.add('on');}return;}
  if(t.closest('[data-burger]')){var sb=$('.sb'),sc=$('[data-scrim]');var o=sb.classList.toggle('open');sc.classList.toggle('on',o);return;}
  if(t.hasAttribute('data-scrim')){closeDrawerNav();return;}
  if(t.closest('[data-theme-toggle]')){var dark=root.getAttribute('data-theme')==='dark'||(!root.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);root.setAttribute('data-theme',dark?'light':'dark');try{localStorage.setItem('erp-theme',dark?'light':'dark');}catch(x){}$('.ic-moon',app).style.display=dark?'':'none';$('.ic-sun',app).style.display=dark?'none':'';setTimeout(function(){drawCharts(document);},0);return;}
  if(t.closest('[data-sig-send]')){closeAll();toast('Incident créé (Ouvert) — contexte technique et fonctionnel joint automatiquement');return;}
  if(!t.closest('.pop,.notifpop,[data-sel],[data-notif]'))$$('.pop.on,.notifpop.on').forEach(function(o){o.classList.remove('on');});
  if(t.closest('.denied')&&!t.closest('.ni')){var d=t.closest('.denied');if(d.title)toast(d.title);}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});
document.addEventListener('click',function(e){var o=e.target.closest('[data-open="ov-signaler"]');if(o){var c=$('[data-sig-ctx]');if(c)c.textContent=(MODULE_LABEL[state.module]||'Accueil')+' · '+state.screen+' · '+state.persona.profile+' · '+state.persona.entity+' · v0.9.0';}},true);

/* ================= INFOBULLES FORMULE ================= */
var tip=$('.ftip'),tipFor=null;
function showTip(btn){
  tipFor=btn;$('[data-tip-f]',tip).textContent=btn.getAttribute('data-f')||'';
  var c=btn.getAttribute('data-c'),s=btn.getAttribute('data-src');
  $('[data-tip-ct]',tip).hidden=!c;$('[data-tip-c]',tip).hidden=!c;$('[data-tip-c]',tip).textContent=c||'';
  $('[data-tip-st]',tip).hidden=!s;$('[data-tip-s]',tip).hidden=!s;$('[data-tip-s]',tip).textContent=s||'';
  tip.hidden=false;tip.classList.add('on');
  var r=btn.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
  var x=Math.min(Math.max(8,r.left+r.width/2-tw/2),window.innerWidth-tw-8),y=r.top-th-9;if(y<8)y=r.bottom+9;
  tip.style.left=x+'px';tip.style.top=y+'px';
}
function hideTip(){tip.classList.remove('on');tipFor=null;setTimeout(function(){if(!tipFor)tip.hidden=true;},160);}
document.addEventListener('mouseover',function(e){var b=e.target.closest('.fx');if(b&&tipFor!==b)showTip(b);});
document.addEventListener('mouseout',function(e){var b=e.target.closest('.fx');if(b&&!b.contains(e.relatedTarget))hideTip();});
document.addEventListener('focusin',function(e){var b=e.target.closest('.fx');if(b)showTip(b);});
document.addEventListener('focusout',function(e){if(e.target.closest&&e.target.closest('.fx'))hideTip();});
document.addEventListener('click',function(e){var b=e.target.closest('.fx');if(b){e.stopPropagation();if(tipFor===b)hideTip();else showTip(b);}else if(tipFor)hideTip();},true);

/* ================= GRAPHIQUES ================= */
var BASE=new Date(2026,7,27);
function lblDate(i,n){var d=new Date(BASE);d.setDate(d.getDate()-(n-1-i));return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2);}
var SERIES={
 treso:{name:'Trésorerie totale contrôlée',c:'--d1',dash:false,v:[48.2,49.1,47.8,50.3,51.0,50.1,52.2,53.6,52.4,51.7,53.2,54.8,53.9,55.4,54.6,56.1,55.2,54.4,56.6,57.8,56.9,55.7,57.2,58.4,57.6,59.1,58.2,59.8,60.4,61.3]},
 dettes:{name:'Dettes fournisseurs',c:'--d2',dash:false,v:[19.8,20.1,20.4,20.0,20.9,21.3,21.0,21.6,22.0,21.8,22.3,22.1,22.6,22.9,22.4,22.8,23.1,22.7,23.0,23.4,23.2,22.9,23.3,23.6,23.1,23.4,23.0,23.2,23.1,23.25]},
 creances:{name:'Créances clients',c:'--d3',dash:false,v:[16.9,17.2,17.0,17.6,17.9,17.5,18.1,18.4,18.2,18.0,18.6,18.9,18.5,19.0,18.8,19.3,19.1,18.9,19.4,19.7,19.5,19.2,19.6,19.9,19.7,20.0,19.8,20.1,19.9,20.075]},
 pnl:{name:'P&L Global (cumul)',c:'--d1',dash:true,v:[1.1,2.0,2.8,3.9,4.7,5.6,6.8,7.5,8.6,9.4,10.3,11.5,12.2,13.4,14.1,15.3,16.0,16.8,17.9,18.9,19.6,20.4,21.5,22.3,23.2,23.9,24.4,25.1,25.5,25.835]},
 ventes:{name:'Ventes Mata (cumul)',c:'--d2',dash:true,v:[16,32,49,66,82,99,116,133,149,165,182,199,215,232,249,265,282,299,316,332,349,366,382,399,416,424,433,441,447,452]},
 burn:{name:'Cash burn (cumul dépenses)',c:'--d3',dash:true,v:[15.2,30.4,46.1,61.8,77.0,93.1,109.0,124.6,140.1,155.7,171.4,187.2,202.6,218.4,234.1,249.6,265.5,281.2,296.9,312.4,328.3,344.0,359.5,375.2,390.8,398.6,405.9,412.7,417.9,421.5]}
};
var NS='http://www.w3.org/2000/svg';
function E(n,a){var el=document.createElementNS(NS,n);for(var k in a)el.setAttribute(k,a[k]);return el;}
function colorOf(tok){return getComputedStyle(app).getPropertyValue(tok).trim();}
function drawSeries(box,keys){
  if(box.clientHeight<40&&!box.style.height)box.style.height='220px';
  var W=box.clientWidth,H=box.clientHeight;if(W<40||H<40)return;
  var grid=colorOf('--grid')||'rgba(0,0,0,.08)',mut=colorOf('--mut')||'#888';
  box.innerHTML='';
  var P={t:14,r:14,b:24,l:44},n=30,all=[];
  keys.forEach(function(k){all=all.concat(SERIES[k].v);});
  if(!all.length)return;
  var min=0,max=Math.ceil(Math.max.apply(null,all)*1.05);
  if(keys.length===1){var mn=Math.min.apply(null,all);min=Math.max(0,Math.floor(mn*0.9));}
  function X(i){return P.l+(W-P.l-P.r)*i/(n-1);}
  function Y(v){return P.t+(H-P.t-P.b)*(1-(v-min)/(max-min||1));}
  var svg=E('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H,role:'img','aria-label':keys.map(function(k){return SERIES[k].name;}).join(', ')+' sur 30 jours, en millions de FCFA'});
  for(var g=0;g<=4;g++){var gv=min+(max-min)*g/4,gy=Y(gv);svg.appendChild(E('line',{x1:P.l,x2:W-P.r,y1:gy,y2:gy,stroke:grid,'stroke-width':1}));var t=E('text',{x:P.l-7,y:gy+3.5,'text-anchor':'end','font-size':10,fill:mut,'font-family':"'Fira Code',monospace"});t.textContent=Math.round(gv)+' M';svg.appendChild(t);}
  [0,15,29].forEach(function(i){var t=E('text',{x:X(i),y:H-7,'text-anchor':i===0?'start':(i===29?'end':'middle'),'font-size':10,fill:mut,'font-family':"'Fira Code',monospace"});t.textContent=lblDate(i,n);svg.appendChild(t);});
  var dots=[];
  keys.forEach(function(k,ki){
    var s=SERIES[k],c=colorOf(s.c),d='';
    for(var i=0;i<n;i++)d+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(s.v[i]).toFixed(1);
    if(keys.length===1){var gid='g'+Math.floor(Math.abs(W*H))+ki;var defs=E('defs',{}),lg=E('linearGradient',{id:gid,x1:0,y1:0,x2:0,y2:1});var s1=E('stop',{offset:'0%'});s1.style.stopColor=c;s1.style.stopOpacity='.16';var s2=E('stop',{offset:'100%'});s2.style.stopColor=c;s2.style.stopOpacity='0';lg.appendChild(s1);lg.appendChild(s2);defs.appendChild(lg);svg.appendChild(defs);svg.appendChild(E('path',{d:d+'L'+X(n-1).toFixed(1)+' '+(H-P.b)+'L'+X(0).toFixed(1)+' '+(H-P.b)+'Z',fill:'url(#'+gid+')'}));}
    svg.appendChild(E('path',{d:d,fill:'none',stroke:c,'stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round','stroke-dasharray':s.dash?'5 4':'none'}));
    svg.appendChild(E('circle',{cx:X(n-1),cy:Y(s.v[n-1]),r:3.4,fill:c}));
    var dot=E('circle',{r:4,fill:c,stroke:'#fff','stroke-width':1.5,opacity:0});dots.push({dot:dot,s:s});svg.appendChild(dot);
  });
  var cross=E('line',{x1:0,x2:0,y1:P.t,y2:H-P.b,stroke:mut,'stroke-width':1,'stroke-dasharray':'3 3',opacity:0});svg.appendChild(cross);
  box.appendChild(svg);
  var ct=document.createElement('div');ct.className='ctip';box.appendChild(ct);
  function move(ev){var r=box.getBoundingClientRect(),cx=(ev.touches?ev.touches[0].clientX:ev.clientX)-r.left;var i=Math.max(0,Math.min(n-1,Math.round((cx-P.l)/((W-P.l-P.r)/(n-1)))));var px=X(i);cross.setAttribute('x1',px);cross.setAttribute('x2',px);cross.setAttribute('opacity',.6);var html='<span class="dt">'+lblDate(i,n)+'/2026</span>';dots.forEach(function(o){o.dot.setAttribute('cx',px);o.dot.setAttribute('cy',Y(o.s.v[i]));o.dot.setAttribute('opacity',1);html+='<br>'+o.s.name.split(' (')[0]+' <b>'+String(o.s.v[i]).replace('.',',')+' M</b>';});ct.innerHTML=html;ct.style.left=Math.max(70,Math.min(W-70,px))+'px';ct.style.top='4px';ct.style.opacity=1;}
  function leave(){cross.setAttribute('opacity',0);dots.forEach(function(o){o.dot.setAttribute('opacity',0);});ct.style.opacity=0;}
  box.addEventListener('mousemove',move);box.addEventListener('mouseleave',leave);box.addEventListener('touchstart',move,{passive:true});box.addEventListener('touchmove',move,{passive:true});box.addEventListener('touchend',leave);
}
function drawCharts(scope){
  $$('.linechart',scope||document).forEach(function(b){if(b.closest('.scr')&&!b.closest('.scr').classList.contains('on'))return;var k=(b.getAttribute('data-series')||'treso').split(',').filter(function(x){return SERIES[x];});drawSeries(b,k);});
  $$('.multichart',scope||document).forEach(function(b){var sec=b.closest('.scr');if(sec&&!sec.classList.contains('on'))return;var keys=$$('[data-series-toggle]',sec||document).filter(function(c){return c.checked&&SERIES[c.getAttribute('data-series-toggle')];}).map(function(c){return c.getAttribute('data-series-toggle');});if(!keys.length)keys=(b.getAttribute('data-series')||'treso').split(',');drawSeries(b,keys);});
}
document.addEventListener('change',function(e){if(e.target.hasAttribute('data-series-toggle')){var sec=e.target.closest('.scr');drawCharts(sec);}});
var rT=null;window.addEventListener('resize',function(){clearTimeout(rT);rT=setTimeout(function(){drawCharts(document);},120);});

/* ================= API ÉCRANS ================= */
function filterRows(tbody,attr,value){$$('tr',tbody).forEach(function(r){var v=r.getAttribute('data-'+attr);if(v===null)return;r.hidden=!(value==='tous'||v===value);});}
var ctx={get profile(){return state.persona;},get entity(){return state.persona.entity;},hasPerm:hasPerm,toast:toast,fmt:fmt,formatAmounts:formatAmounts,go:go,open:openOv,close:function(id){closeOv($('[data-ov="'+id+'"]'));},filterRows:filterRows,on:function(el,ev,fn){if(el)el.addEventListener(ev,fn);},applyPerms:applyPerms,drawCharts:drawCharts,series:SERIES};
var pre=window.ERP;
window.ERP={register:function(id,fn){registry[id]=fn;},go:go,toast:toast,hasPerm:hasPerm,ctx:ctx,state:state};
if(pre&&pre._q)pre._q.forEach(function(x){registry[x[0]]=x[1];});

/* ================= INIT ================= */
var savedTheme=null;try{savedTheme=localStorage.getItem('erp-theme');}catch(x){}
root.setAttribute('data-theme',savedTheme==='dark'?'dark':'light');
if(savedTheme==='dark'){$('.ic-moon',app).style.display='none';$('.ic-sun',app).style.display='';}
formatAmounts(document);
setPersona(PERSONAS[0]);
setModule('');
inited.hub=true;
/* Lien profond depuis index.html : ?m=core|finance ouvre le premier écran autorisé du module, #id ouvre l'écran */
function fromUrl(){
  var h=(location.hash||'').replace(/^#/,''),m=(location.search.match(/[?&]m=([a-z]+)/)||[])[1];
  if(h&&$('.scr[data-scr="'+h+'"]')){go(h);return;}
  if(m&&MODULE_LABEL[m]){var f=firstAllowed(m);if(f)go(f);else toast('Aucun écran de '+MODULE_LABEL[m]+' n’est accessible au profil '+state.persona.profile);}
}
fromUrl();
window.addEventListener('hashchange',function(){var h=location.hash.replace(/^#/,'');if(h&&h!==state.screen&&$('.scr[data-scr="'+h+'"]'))go(h);else if(!h&&state.screen!=='hub')go('hub');});
})();
