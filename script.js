/*
 * Trama — lógica principal da aplicação.
 *
 * Organização: estado e persistência; cálculos; cartões; navegação e gráficos;
 * Cofre, baús e metas; planejamento; autenticação e perfil.
 * Mantido como script clássico porque a interface atual chama funções globais
 * pelos atributos onclick/onchange do HTML. Separe módulos somente junto de uma
 * migração dos eventos, para preservar a ordem de execução e o comportamento.
 */
const $=s=>document.querySelector(s);
const fmt=n=>(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const pv=v=>{v=String(v).trim();if(v.includes(','))v=v.replace(/\./g,'').replace(',','.');return parseFloat(v)};
const dv=(n,s)=>n?(s*n).toFixed(2).replace('.',','):'';
const DEF=['Contas','Comida','Entretenimento','Saúde','Salário','Imprevisto','Outros'];
const COL=['var(--pc)','var(--pa)','var(--chart-rend, #3ddc97)','#38bdf8','#fbbf24','#fb7185'];
let S={cor:{plan:'azul',cx:'azul',cart:'azul'},tx:[],boxes:[],cards:[],cc:[],ccp:{},ov:{},categories:[],hiddenCategories:[],cdi:10.65,red:10,gs:'mes',theme:null,m:null,tab:'plan',glass:72,profile:{name:'',email:''},reminderSent:[],goals:[]};
try{const r=localStorage.getItem('meupatrimonio_clean_v1');if(r)Object.assign(S,JSON.parse(r))}catch(e){}
// Preparação da versão: categorias fixas, sem edição pela tela de configurações.
try{if(localStorage.getItem('fintrama_v138_ready')!=='1'){S.cards=[];S.cc=[];S.ccp={};S.hiddenCategories=[];localStorage.setItem('fintrama_v138_ready','1');localStorage.setItem('meupatrimonio_clean_v1',JSON.stringify(S))}}catch(e){S.cards=[];S.cc=[];S.ccp={};S.hiddenCategories=[]}
if(!S.theme)S.theme='dark';
S.cor=Object.assign({plan:'azul',cx:'azul',cart:'azul'},S.cor||{});
S.globalPalette=S.globalPalette||S.cor.plan||'azul';
S.categories=Array.isArray(S.categories)?S.categories:[];
S.hiddenCategories=Array.isArray(S.hiddenCategories)?S.hiddenCategories:[];
S.profile=Object.assign({name:'',email:''},S.profile||{});
S.reminderSent=Array.isArray(S.reminderSent)?S.reminderSent:[];
S.goals=Array.isArray(S.goals)?S.goals:[];
S.glass=Math.min(94,Math.max(20,Number(S.glass)||72));
const d0=new Date();if(!S.m)S.m=d0.getFullYear()+'-'+String(d0.getMonth()+1).padStart(2,'0');
let CL=null,last='';
// Grupos começam recolhidos para manter o Planejamento compacto.
let planGroupOpen={gastei:false,ganhei:false,guardei:false};
const planGroupMotionHandlers=new WeakMap();
const snap=()=>{const{ts,tab,m,theme,...r}=S;return JSON.stringify(r)};
const STX={cloud:'Salvo na sua conta',saving:'Salvando…',local:'Só neste navegador',err:'Falha ao salvar na nuvem',bad:'Arquivo inválido'};
const stat=k=>{const e=$('#cs');if(e)e.textContent=STX[k]};
const DK=['tx','ov','boxes','cdi','cards','cc','ccp','goals'];
const dsnapK=()=>{const o={};DK.forEach(k=>o[k]=JSON.stringify(S[k]));return o};
const H={u:[],r:[],cur:dsnapK()};
const UIC='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">';
function ur(){document.querySelectorAll('.ut').forEach(e=>{const t=e.dataset.t;e.innerHTML=`<button class="ub" onclick="undo('${t}')" ${H.u.some(x=>x.tab===t)?'':'disabled'} aria-label="Desfazer" title="Desfazer">${UIC}<path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button><button class="ub" onclick="redo('${t}')" ${H.r.some(x=>x.tab===t)?'':'disabled'} aria-label="Refazer" title="Refazer">${UIC}<path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>`})}
const hlast=(a,t)=>{for(let i=a.length-1;i>=0;i--)if(a[i].tab===t)return i;return -1};
function happ(e,w){for(const k in e[w]){S[k]=JSON.parse(e[w][k]);H.cur[k]=e[w][k]}fcr();R()}
function undo(t){const i=hlast(H.u,t);if(i<0)return;const e=H.u.splice(i,1)[0];H.r.push(e);happ(e,'prev')}
function redo(t){const i=hlast(H.r,t);if(i<0)return;const e=H.r.splice(i,1)[0];H.u.push(e);happ(e,'next')}
const save=()=>{const nd=dsnapK(),ch=DK.filter(k=>nd[k]!==H.cur[k]);
 if(ch.length){const e={tab:S.tab,prev:{},next:{}};ch.forEach(k=>{e.prev[k]=H.cur[k];e.next[k]=nd[k];H.cur[k]=nd[k]});H.u.push(e);if(H.u.length>100)H.u.shift();H.r=H.r.filter(x=>x.tab!==e.tab)}
 ur();
 try{localStorage.setItem('meupatrimonio_clean_v1',JSON.stringify(S))}catch(e){}
 if(CL){const j=snap();if(j!==last){last=j;S.ts=Date.now();stat('saving');clearTimeout(save.t);save.t=setTimeout(()=>CL.set({json:j,ts:S.ts}).then(()=>stat('cloud')).catch(()=>stat('err')),700)}}};
async function bk(){const data=JSON.stringify(S,null,1);
 try{if(typeof claude!=='undefined'){const d=await claude.use('downloads');if(d){await d.save({filename:'meu-patrimonio-backup.json',data});return}}}catch(e){}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='meu-patrimonio-backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function rs(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.tx)||!Array.isArray(d.boxes))throw 0;delete d.ts;Object.assign(S,d);fcr();R();stat(CL?'saving':'local')}catch(e){stat('bad')}};r.readAsText(f)}
async function cloud(){try{const[u,db]=await Promise.all([claude.use('user'),claude.use('db')]);if(!u||!db){stat('local');return}
 const id=await u.id();CL=db.doc('data/users/'+id+'/state');const sn=await CL.get();
 if(sn.exists){const c=sn.data();if((c.ts||0)>(S.ts||0)){Object.assign(S,JSON.parse(c.json),{ts:c.ts});last=snap();H.u=[];H.r=[];H.cur=dsnapK();fcr();R();stat('cloud');return}}
 last='';stat('saving');save()}catch(e){CL=null;stat('local')}}
const shift=(m,d)=>{const[y,o]=m.split('-').map(Number),t=new Date(y,o-1+d,1);return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')};
const lab=m=>{const[y,o]=m.split('-').map(Number),t=new Date(y,o-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});return t[0].toUpperCase()+t.slice(1)};
const ml=m=>m.slice(5)+'/'+m.slice(2,4);
const tm=m=>S.tx.filter(t=>t.m===m);
const sum=(a,k)=>a.reduce((s,t)=>s+(+t[k]||0),0);
const minM=()=>[...S.tx.map(t=>t.m),...Object.keys(S.ov),...S.cc.map(x=>x.m0)].sort()[0]||S.m;
function ant(m,k){const o=S.ov[m];if(o&&o[k]!=null)return +o[k];if(m<=minM())return 0;return tot(shift(m,-1),k)}
function tot(m,k){const L=tm(m),f=x=>sum(L.filter(t=>t.tipo===x),k);return ant(m,k)+f('receita')-f('despesa')-f('guardar')-cardsM(m).reduce((a,x)=>a+(k==='plan'?x.f:x.p),0)}
const mdiff=(a,b)=>(+b.slice(0,4)-+a.slice(0,4))*12+(+b.slice(5)-+a.slice(5));
const pr=(x,i)=>{const p=Math.round(x.total/x.parc*100)/100;return i===x.parc-1?+(x.total-p*(x.parc-1)).toFixed(2):p};
const fat=(c,m)=>S.cc.filter(x=>x.card===c).reduce((a,x)=>{const i=mdiff(x.m0,m);return a+(i>=0&&i<x.parc?pr(x,i):0)},0);
const todayISO=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function formatPurchaseDate(dateISO){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(dateISO||'')))return '—';
 const [y,m,d]=dateISO.split('-');return `${d}/${m}/${y}`;
}
const cardsM=m=>S.cards.map(c=>({c,f:fat(c.id,m),p:+S.ccp[c.id+'|'+m]||0})).filter(x=>x.f>0||x.p>0);
function ccpay(id,v){S.ccp[id+'|'+S.m]=Math.abs(pv(v))||0;R()}
// Paletas dos acabamentos dos cartões: isoladas das cores gerais das abas.
const CARD_PALETTES={
 'ultravioleta':{pc:'#7200a8',pl:'#c084fc',pd:'#31004f',ac2:'#a855f7'},
 'violeta':{pc:'#7200a8',pl:'#c084fc',pd:'#31004f',ac2:'#a855f7'},
 'roxo':{pc:'#7c3aed',pl:'#a78bfa',pd:'#3b0764',ac2:'#8b5cf6'},
 'laranja':{pc:'#ea580c',pl:'#fdba74',pd:'#7c2d12',ac2:'#fb923c'},
 'azul':{pc:'#0369a1',pl:'#38bdf8',pd:'#082f49',ac2:'#0ea5e9'},
 'azul-neon':{pc:'#0647ff',pl:'#00e5ff',pd:'#071a52',ac2:'#00d9ff'},
 'verde-neon':{pc:'#16a34a',pl:'#a3ff12',pd:'#052e16',ac2:'#7cff00'},
 'vermelho':{pc:'#b91c1c',pl:'#f87171',pd:'#450a0a',ac2:'#ef4444'},
 'preto':{pc:'#27272a',pl:'#71717a',pd:'#09090b',ac2:'#a1a1aa'},
 'preto-fosco':{pc:'#171717',pl:'#525252',pd:'#080808',ac2:'#737373'},
 'branco-arcoiris':{pc:'#c4b5fd',pl:'#67e8f9',pd:'#a78bfa',ac2:'#f9a8d4'},
 'metalico':{pc:'#a1a1aa',pl:'#e4e4e7',pd:'#52525b',ac2:'#d4d4d8'},
 'cinza-metalico':{pc:'#9ca3af',pl:'#e5e7eb',pd:'#3f4650',ac2:'#cbd0d6'}
};
const cardPaletteForColor=k=>CARD_PALETTES[k]||CARD_PALETTES.ultravioleta;
function setCardModalMessage(text,isError=true){const el=$('#card-modal-message');if(!el)return;el.textContent=text||'';el.className='ms card-modal-message'+(isError?' e':'');}
function updateCardPreview(){
 const name=String($('#card-modal-name')?.value||'').trim()||'Nome do cartão';
 const bank=String($('#card-modal-bank')?.value||'').trim()||'Banco emissor';
 const color=$('#card-modal-color')?.value||'ultravioleta';
 const palette=cardPaletteForColor(color),preview=$('#card-live-preview');
 const nameEl=$('#card-preview-name'),bankEl=$('#card-preview-bank');
 if(nameEl)nameEl.textContent=name;if(bankEl)bankEl.textContent=bank;
 if(preview){preview.className=`cv card-live-preview skin-${String(color).replace(/[^a-z0-9-]/gi,'')}`;preview.style.setProperty('--card-pc',palette.pc);preview.style.setProperty('--card-pl',palette.pl);preview.style.setProperty('--card-pd',palette.pd);preview.style.setProperty('--card-accent',palette.ac2);}
}
function openCardModal(){
 if(S.cards.length>=3){msg('Você já cadastrou o limite de 3 cartões. Exclua um cartão para criar outro.',1);return;}
 const modal=$('#card-modal'),form=$('#card-create-form');if(!modal||!form)return;
 form.reset();setCardModalMessage('',false);
 $('#card-modal-color').value='ultravioleta';updateCardPreview();
 modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('card-modal-open');
 requestAnimationFrame(()=>$('#card-modal-name')?.focus());
}
function closeCardModal(){
 const modal=$('#card-modal');if(!modal)return;
 modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('card-modal-open');setCardModalMessage('',false);
}
function addCard(e){
 e.preventDefault();
 const name=String($('#card-modal-name')?.value||'').trim();
 const bank=String($('#card-modal-bank')?.value||'').trim();
 const cor=$('#card-modal-color')?.value||'ultravioleta';
 if(S.cards.length>=3){setCardModalMessage('Você já cadastrou 3 cartões no total. Exclua um cartão para liberar espaço.');return;}
 if(!name){$('#card-modal-name')?.focus();setCardModalMessage('Informe um nome para o cartão.');return;}
 if(!bank){$('#card-modal-bank')?.focus();setCardModalMessage('Informe o banco emissor.');return;}
 const card={id:uid(),nome:name,banco:bank,cor};
 S.cards.push(card);selectedCardId=card.id;closeCardModal();R();
}

function selectCard(id){selectedCardId=id;document.querySelectorAll('#kcs .cv').forEach(el=>{const active=el.dataset.cardId===id;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',active?'true':'false')})}
let pendingDeleteCardId=null;
let pendingDeleteBoxId=null;
let pendingDeleteGoalId=null;
let activeCofreResgateBoxId=null;
function delCard(id){
 const card=S.cards.find(c=>c.id===id);
 if(!card)return;
 pendingDeleteCardId=id;
 const purchases=S.cc.filter(x=>x.card===id).length;
 const detail=purchases?` Também serão removidas ${purchases} compra(s) associada(s) a este cartão.`:'';
 const dialog=$('#delete-confirm');
 $('#delete-confirm-title').textContent='Excluir cartão?';
 $('#delete-confirm-desc').textContent=`Tem certeza de que deseja excluir o cartão “${card.nome}”?${detail} Esta ação não pode ser desfeita.`;
 dialog.hidden=false;
 dialog.setAttribute('aria-hidden','false');
 document.body.classList.add('dialog-open');
 $('#delete-confirm-no').focus();
}
function closeDeleteConfirm(){
 const dialog=$('#delete-confirm');
 dialog.hidden=true;dialog.setAttribute('aria-hidden','true');document.body.classList.remove('dialog-open');
 pendingDeleteCardId=null;pendingDeleteBoxId=null;pendingDeleteGoalId=null;
 $('#delete-confirm-title').textContent='Excluir cartão?';$('#delete-confirm-yes').textContent='Sim, excluir cartão';$('#delete-confirm-no').textContent='Não, manter cartão';
}
function confirmDeleteCard(){
 if(pendingDeleteGoalId){
  const id=pendingDeleteGoalId;S.goals=S.goals.filter(g=>g.id!==id);closeDeleteConfirm();R();return;
 }
 if(pendingDeleteBoxId){
  const id=pendingDeleteBoxId;
  S.boxes=S.boxes.filter(b=>b.id!==id);
  S.tx=S.tx.filter(t=>t.box!==id&&t.resgateBoxId!==id);
  closeDeleteConfirm();fcr();R();return;
 }
 if(!pendingDeleteCardId)return closeDeleteConfirm();
 const id=pendingDeleteCardId;
 S.cards=S.cards.filter(c=>c.id!==id);S.cc=S.cc.filter(x=>x.card!==id);
 Object.keys(S.ccp).forEach(k=>{if(k.startsWith(id+'|'))delete S.ccp[k]});
 closeDeleteConfirm();R();
}

let KST=[];
let selectedCardId=null;
function kstg(){
 const c=$('#kcd').value,d=$('#kd').value.trim(),cat=$('#kcat').value.trim(),v=+$('#kv').value||0;
 const n=Math.min(60,Math.max(1,Math.floor(+$('#kp').value||1))),m=$('#km').value||S.m,date=todayISO(),card=S.cards.find(card=>card.id===c),x=$('#kms');x.className='ms e';
 if(!c||!card){x.textContent='Crie ou selecione um cartão primeiro.';return false}
 if(!m||!/^\d{4}-\d{2}$/.test(m)){x.textContent='Escolha a primeira fatura.';return false}
 if(!d||!(v>0)){x.textContent='Informe a descrição e um valor total maior que zero.';return false}
 if(!DEF.includes(cat)){x.textContent='Selecione uma categoria para a compra.';return false}
 KST.push({card:c,desc:d,cat,total:v,parc:n,m0:m,date});$('#kd').value='';$('#kv').value='';$('#kp').value='1';x.className='ms';x.textContent='';krST();return true
}
function kadd(e){e.preventDefault();kstg()}
function krm(i){KST.splice(i,1);krST()}
function kcl(){KST=[];krST()}
function krST(){
 const el=$('#kst');$('#kcb').textContent=KST.length?'Lançar '+KST.length+' compra(s)':'Lançar compras na fatura';
 if(!KST.length){el.innerHTML='';return}
 el.innerHTML='<div class="ov purchase-queue" style="margin-top:10px"><table><thead><tr><th>Compra</th><th>Categoria</th><th>Parcelas</th><th style="text-align:right">Total</th><th></th></tr></thead><tbody>'+KST.map((x,i)=>{const c=S.cards.find(c=>c.id===x.card);return `<tr><td>${esc(x.desc)}<br><small style="color:var(--mu)">${esc(c?c.nome:'')} · 1ª fatura ${lab(x.m0)}</small></td><td>${esc(x.cat||'Outros')}</td><td>${x.parc}x de ${fmt(pr(x,0))}</td><td style="text-align:right">${fmt(x.total)}</td><td><button type="button" class="x" onclick="krm(${i})" aria-label="Remover da lista">✕</button></td></tr>`}).join('')+'</tbody></table></div><button type="button" class="ib purchase-clear" style="margin-top:8px" onclick="kcl()">Limpar lista</button>';
}
function kcommit(){const x=$('#kms');if(($('#kd').value.trim()||+$('#kv').value)&&!kstg())return;
 if(!KST.length){x.className='ms e';x.textContent='Adicione ao menos uma compra.';return}
 const k=KST.length;KST.forEach(i=>S.cc.push({id:uid(),...i}));KST=[];krST();if($('#km'))$('#km').value=S.m;x.className='ms';x.textContent=k>1?k+' compras lançadas na fatura':'Compra lançada na fatura';R()}
function tgh(){const w=$('#hw');w.hidden=!w.hidden;$('#hbt').classList.toggle('open',!w.hidden)}
function delCc(id){S.cc=S.cc.filter(x=>x.id!==id);R()}
let KSEL=null;
function bar1(ms,V,sel){const W=600,H=210,p=30,hasValues=V.some(v=>v>0),mx=Math.max(...V,1),bw=(W-2*p)/ms.length;
 return `<svg viewBox="0 0 ${W} ${H}" style="cursor:pointer"><defs><linearGradient id="creditInvoiceBarGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pa)"/><stop offset="1" stop-color="var(--pc)"/></linearGradient><filter id="creditInvoiceBarGlow" x="-60%" y="-30%" width="220%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`+ms.map((m,i)=>{const h=(H-2*p-14)*V[i]/mx,x=p+i*bw+bw*.15,w=bw*.7,on=m===sel,fill=sel?(on?'url(#creditInvoiceBarGradient)':'var(--mu)'):'var(--pc)',op=sel&&!on?.3:1;
  return `<g onclick="ksel('${m}')"><rect x="${p+i*bw}" y="0" width="${bw}" height="${H-p+8}" fill="transparent"/><rect x="${x}" y="${H-p-h}" width="${w}" height="${Math.max(h,2)}" rx="4" fill="${fill}" opacity="${op}" ${on?'filter="url(#creditInvoiceBarGlow)"':''} style="transition:all .3s"><title>${ml(m)}: ${fmt(V[i])}</title></rect>${on?`<text x="${x+w/2}" y="${H-p-h-8}" text-anchor="middle" style="font-size:11px;font-weight:800;fill:var(--tx)">${fmt(V[i])}</text>`:''}<text x="${x+w/2}" y="${H-10}" text-anchor="middle" class="ax"${on?' style="font-weight:800;fill:var(--tx)"':''}>${ml(m)}</text></g>`}).join('')+`<text x="${p}" y="12" class="ax">${hasValues?fmt(mx):fmt(0)}</text></svg>`}
function kgr(){const ms=[...Array(12)].map((_,i)=>shift(S.m,i)),V=ms.map(m=>S.cards.reduce((a,c)=>a+fat(c.id,m),0)),sel=ms.includes(KSEL)?KSEL:null;let h=bar1(ms,V,sel);if(!S.cards.length||!V.some(v=>v>0)){KSEL=null;return h+'<p class="chart-empty-note">Seus gráficos serão preenchidos automaticamente quando você criar um cartão e lançar compras.</p>'}
 if(sel){const i=ms.indexOf(sel),it=S.cc.filter(x=>{const j=mdiff(x.m0,sel);return j>=0&&j<x.parc}),rows=S.cards.map(c=>({n:c.nome,v:fat(c.id,sel)})).filter(r=>r.v>0);
  h+=`<div class="ro"><div><div class="lb2">Fatura de ${lab(sel).toLowerCase()}</div><div class="vl2">${fmt(V[i])}</div></div><div class="rl">${rows.map(r=>`<span>${esc(r.n)} <b>${fmt(r.v)}</b></span>`).join('')}</div></div>`;
  h+=it.length?`<div class="ov" style="margin-top:10px"><table><thead><tr><th>Descrição</th><th>Cartão</th><th>Parcela</th><th style="text-align:right">Valor</th></tr></thead><tbody>${it.map(x=>{const j=mdiff(x.m0,sel),c=S.cards.find(c=>c.id===x.card);return `<tr><td>${esc(x.desc)}</td><td>${esc(c?c.nome:'')}</td><td>${j+1}/${x.parc}</td><td style="text-align:right">${fmt(pr(x,j))}</td></tr>`}).join('')}<tr class="tt"><td colspan="3">Total da fatura</td><td style="text-align:right">${fmt(V[i])}</td></tr></tbody></table></div>`:'<div class="em">Nenhuma parcela neste mês.</div>'}
 return h}
function ksel(m){KSEL=KSEL===m?null:m;$('#kg').innerHTML=kgr()}
function bs(b,up,md){const rate=(b.tipo==='cdi'?S.cdi*b.taxa/100:+b.taxa)/100,r=(Math.pow(1+rate,1/12)-1)*0.99,mine=S.tx.filter(t=>t.box===b.id);
 let m=[b.m0,...mine.map(t=>t.m)].sort()[0],bal=+b.saldo0||0,o=[],n=0;
 for(;m<=up&&n<400;m=shift(m,1),n++){const apo=mine.filter(t=>t.m===m).reduce((s,t)=>s+(md?(+t.pago||+t.plan||0):(+t.pago||0)),0),rend=bal*r+apo*r/2;bal+=apo+rend;o.push({m,apo,rend,bal})}
 return{o,rate,mine}}
function cur(b){const{o,rate,mine}=bs(b,S.m,0),l=o[o.length-1],ok=l&&l.m===S.m;return{b,rate,bal:ok?l.bal:0,rend:ok?l.rend:0,apo:ok?l.apo:0,plan:sum(mine.filter(t=>t.m===S.m),'plan')}}
function go(t){if(t!=='cx')closeCofreGoalsModal();S.tab=t;applyCor();document.querySelectorAll('.tab').forEach(e=>e.hidden=e.id!==t);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));save();scrollTo(0,0)}
const MOON='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',SUN='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
const thi=()=>{const e=$('#th'),d=S.theme==='dark';if(e)e.innerHTML=(d?MOON:SUN)+'<span class="tl">'+(d?'Modo escuro':'Modo claro')+'</span>'};
function hm(e){e.stopPropagation();$('.act').classList.toggle('open')}
function mn(e){
 e.stopPropagation();
 const p=$('#pop');
 if(!p)return;
 p.hidden=!p.hidden;
 const toggle=$('.app-menu-toggle');if(toggle)toggle.setAttribute('aria-expanded',String(!p.hidden));
}
document.addEventListener('click',e=>{
 const p=$('#pop'),cfg=$('.cfg'),act=$('.act');
 if(p&&!p.hidden&&!p.contains(e.target)&&!cfg?.contains(e.target))p.hidden=true;
 if(act&&!act.contains(e.target))act.classList.remove('open');
});
const fOpen=()=>Boolean($('#fx')?.classList.contains('open'));
const GS={m:0};
const gsum=(m,k)=>sum(S.tx.filter(t=>t.m===m&&t.tipo==='guardar'),k);
function gdata(){const g=S.tx.filter(t=>t.tipo==='guardar').map(t=>t.m).sort(),st=[g[0]||S.m,S.m].sort()[0],en=[g[g.length-1]||S.m,shift(S.m,11)].sort().pop(),ms=[];
 for(let m=st,n=0;m<=en&&n<60;m=shift(m,1),n++)ms.push(m);
 let ap=0,al=0;return ms.map(m=>{const p=gsum(m,'pago'),l=gsum(m,'plan');ap+=p;al+=l;return{m,p,l,ap,al}})}
/* Gráfico mensal real x planejado: mantém eixo cronológico e legenda fora de cartões externos. */
function gch(D){const W=1000,H=170,p=30,n=D.length,mx=Math.max(...D.map(d=>Math.max(d.ap,d.al)),1),x=i=>p+(W-2*p)*(n<2?.5:i/(n-1)),y=v=>H-p-(H-2*p-8)*v/mx,pl=D.map((d,i)=>x(i)+','+y(d.al)).join(' '),re=D.map((d,i)=>x(i)+','+y(d.ap)).join(' '),ci=D.findIndex(d=>d.m===S.m);
 return `<svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pa)" stop-opacity=".45"/><stop offset="1" stop-color="var(--pa)" stop-opacity="0"/></linearGradient></defs>${ci>=0?`<line x1="${x(ci)}" y1="10" x2="${x(ci)}" y2="${H-p}" stroke="var(--ac2)" stroke-dasharray="3 4" opacity=".7"/>`:''}<path d="M${x(0)},${H-p} L${re.split(' ').join(' L')} L${x(n-1)},${H-p}Z" fill="url(#gg)"/><polyline points="${pl}" fill="none" stroke="var(--mu)" stroke-width="2" stroke-dasharray="5 4"/><polyline points="${re}" fill="none" stroke="var(--pa)" stroke-width="2.6" stroke-linejoin="round"/>${D.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d.ap)}" r="3.2" fill="var(--pa)"><title>${ml(d.m)}: real ${fmt(d.ap)} · planejado ${fmt(d.al)}</title></circle>`).join('')}<text x="${p}" y="${H-8}" class="ax">${ml(D[0].m)}</text><text x="${W-p}" y="${H-8}" text-anchor="end" class="ax">${ml(D[n-1].m)}</text><text x="${p}" y="10" class="ax">${fmt(mx)}</text></svg><div class="lgd"><span><i style="background:var(--pa)"></i>Acumulado real</span><span><i style="background:var(--mu)"></i>Acumulado planejado</span></div>`}
/* Renderiza os quatro indicadores e cartões mensais em páginas de três. */
function rG(){
 const D=gdata(),c=D.find(d=>d.m===S.m)||D[0],df=c.ap-c.al,gs=$('#gs');
 $('#gk').innerHTML=`<div class="st"><small>Guardado em ${lab(S.m).toLowerCase()}</small><b>${fmt(c.p)}</b><i>planejado ${fmt(c.l)}</i></div><div class="st"><small>Acumulado real</small><b class="pos">${fmt(c.ap)}</b><i>até este mês, só o pago</i></div><div class="st"><small>Acumulado planejado</small><b>${fmt(c.al)}</b><i>até este mês</i></div><div class="st"><small>Real − planejado</small><b class="${df<0?'neg':'pos'}">${fmt(df)}</b><i>${df<0?'abaixo do planejado':'em dia ou à frente'}</i></div>`;
 $('#gc').innerHTML=gch(D);
 if(gs){
  gs.innerHTML=D.map(d=>`<article class="gm${d.m===S.m?' cur':''}" onclick="gopen('${d.m}')" tabindex="0" role="button" aria-label="Abrir ${esc(lab(d.m))}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();gopen('${d.m}')}"><div class="gh">${lab(d.m)}</div><div class="gm-body"><div class="gl">Guardado</div><div class="gv">${fmt(d.p)}</div><div class="gp">planejado ${fmt(d.l)}</div><div class="ga"><div class="gl">Acumulado</div><div class="gv2">${fmt(d.ap)}</div><div class="gp">planejado ${fmt(d.al)}</div></div></div></article>`).join('');
  // Ao redesenhar, enquadra o mês ativo em uma página de três cards, sem abrir em um ponto arbitrário.
  const activeIndex=Math.max(0,D.findIndex(d=>d.m===S.m));
  requestAnimationFrame(()=>{if(gs.isConnected&&gs.clientWidth)cxSetMonthPage(activeIndex)});
 }
}
/* Paginação do histórico: alinha a primeira carta de cada grupo sem cortar cartões.
   Em desktop mostra três meses; em telas muito estreitas, dois para preservar leitura. */
function cxMonthsPerPage(){return window.matchMedia('(max-width:480px)').matches?2:3}
function cxSetMonthPage(firstIndex,behavior='auto'){
 const el=$('#gs');if(!el||!el.children.length)return;
 const size=cxMonthsPerPage(),idx=Math.max(0,Math.min(el.children.length-1,Math.floor(firstIndex/size)*size));
 const first=el.children[0],target=el.children[idx];
 el.scrollTo({left:Math.max(0,target.offsetLeft-first.offsetLeft),behavior});
}
function tf(){const x=$('#fx');if(!x)return;x.classList.add('open');rG();const i=Math.max(0,[...($('#gs')?.children||[])].findIndex(e=>e.classList.contains('cur')));requestAnimationFrame(()=>cxSetMonthPage(i))}
function fsc(d){const el=$('#gs');if(!el||!el.children.length)return;const size=cxMonthsPerPage();const step=(el.children[1]?.offsetLeft-el.children[0].offsetLeft)||el.clientWidth/size;const page=Math.max(0,Math.min(Math.ceil(el.children.length/size)-1,Math.round(el.scrollLeft/step/size)+d));cxSetMonthPage(page*size,'smooth')}
function gopen(m){if(GS.m<6)gm(m)}
function gm(m){S.m=m;$('#fx')?.classList.add('open');$('#cx').classList.remove('po');$('#fbt')?.setAttribute('aria-expanded','true');R();scrollTo({top:0,behavior:'smooth'})}
const PAL={
 roxo:{n:'Roxo',pc:'#A10BFE',pl:'#C96AFF',pd:'#6B00AF',ac2:'#B84EFF',pa:'#E2BDFF',bt:'#7600B9',on:'#fff',d:{bt:'#D8B2FF'}},
 laranja:{n:'Laranja',pc:'#e8650a',pl:'#ff8a1f',pd:'#a64300',ac2:'#f08a24',pa:'#ffab5e',bt:'#9a3d00',on:'#fff',d:{bt:'#ffb066'}},
 vermelho:{n:'Vermelho',pc:'#F73B3B',pl:'#FF7777',pd:'#A91F2A',ac2:'#FF5656',pa:'#FFC2C2',bt:'#A91F2A',on:'#fff',d:{bt:'#FFA0A0'}},
 verde:{n:'Verde neon',pc:'#12d65f',pl:'#4dff95',pd:'#087a37',ac2:'#25f07c',pa:'#5dff9f',bt:'#0a7a37',on:'#04130a',d:{bt:'#5dff9f'}},
 azul:{n:'Azul Trama',pc:'#7276E9',pl:'#9A9DFF',pd:'#494EAD',ac2:'#8589F4',pa:'#C4C6FF',bt:'#4C50B4',on:'#fff',d:{bt:'#BEC0FF'}},
 azulescuro:{n:'Azul escuro elegante',pc:'#1f3f9e',pl:'#2f56c4',pd:'#0f2250',ac2:'#3d63d0',pa:'#7f9fff',bt:'#1e3a8a',on:'#fff',d:{bt:'#9db8ff'}},
 azulneon:{n:'Azul claro neon',pc:'#00c8f5',pl:'#4de3ff',pd:'#0086ad',ac2:'#19d8ff',pa:'#6fe6ff',bt:'#006b8a',on:'#031418',d:{bt:'#6fe6ff'}},
 itau:{n:'Itaú',pc:'#F58220',pl:'#FFB45C',pd:'#174A78',ac2:'#ED8B24',pa:'#FFD09A',bt:'#A95100',on:'#fff',d:{bt:'#FFB45C'}},
 bradesco:{n:'Bradesco',pc:'#CC092F',pl:'#F05273',pd:'#77051C',ac2:'#E02A4E',pa:'#FF91A8',bt:'#980522',on:'#fff',d:{bt:'#FF91A8'}},
 santander:{n:'Santander',pc:'#E32636',pl:'#FF6874',pd:'#8F111C',ac2:'#F04452',pa:'#FFA0A7',bt:'#A20F1D',on:'#fff',d:{bt:'#FFA0A7'}},
 mercadopago:{n:'Mercado Pago',pc:'#009EE3',pl:'#4BC5FF',pd:'#006DA3',ac2:'#118ACB',pa:'#8BD8FF',bt:'#00699D',on:'#fff',d:{bt:'#8BD8FF'}},
 personalizada:{n:'Personalizada',pc:'#7276E9',pl:'#9A9DFF',pd:'#494EAD',ac2:'#8589F4',pa:'#C4C6FF',bt:'#4C50B4',on:'#fff',d:{bt:'#BEC0FF'}},
 'preto-fosco':{n:'Preto fosco',pc:'#413947',pl:'#65596D',pd:'#211C25',ac2:'#766782',pa:'#A99EAF',bt:'#302834',on:'#fff',d:{pc:'#413947',pl:'#65596D',pd:'#211C25',ac2:'#8A7B96',pa:'#C0B5C7',bt:'#BBAFC3'}},
 preto:{n:'Preto',pc:'#242428',pl:'#505057',pd:'#08080A',ac2:'#74747E',pa:'#B3B3BE',bt:'#171719',on:'#fff',d:{pc:'#333339',pl:'#55555F',pd:'#0A0A0D',ac2:'#8A8A96',pa:'#D0D0D8',bt:'#D0D0D8'}}};
const CORS=Object.keys(PAL),TABS=[['plan','Planejamento'],['cx','Cofre'],['cart','Cartão de crédito']];
const SETUP_PALETTE_KEYS=['azul','roxo','vermelho','laranja','preto-fosco'];
const EDIT_PALETTE_KEYS=['azul','roxo','vermelho','laranja','preto-fosco'];
const CUSTOM_TAB_COLORS=()=>S.customThemePalettes||(S.customThemePalettes={});
const palOf=(k,tab=S.tab||'plan')=>{const custom=S.customThemePalettes?.[tab]||(k==='personalizada'?S.customThemePalette:null);const c=(k==='personalizada'&&custom)?Object.assign({},PAL.personalizada,custom):PAL[k]||PAL.azul;return Object.assign({},c,S.theme==='dark'&&c.d?c.d:{})};
function applyCor(){const key=S.globalPalette||(S.cor||{}).global||(S.cor||{}).plan||'azul';const o=palOf(key,'plan'),r=document.documentElement.style;[['--pc',o.pc],['--ac',o.pc],['--pl',o.pl],['--pd',o.pd],['--pa',o.pa],['--ac2',o.ac2],['--bt',o.bt],['--on',o.on]].forEach(([k,v])=>r.setProperty(k,v))}
function hexMix(a,b,ratio){
 const toRgb=h=>{h=String(h||'#7276E9').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]};
 const x=toRgb(a),y=toRgb(b),c=x.map((v,i)=>Math.round(v+(y[i]-v)*ratio));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
}
const CHK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 2px rgba(0,0,0,.8))"><path d="M5 12l5 5 9-10"/></svg>';
let ED={palette:'azul',mode:'preset',customColor:'#7276E9',tab:'plan'};
function customPaletteFromColor(color){
 const c=String(color||'#7276E9');
 return {n:'Personalizada',pc:c,pl:hexMix(c,'#FFFFFF',.26),pd:hexMix(c,'#111018',.48),ac2:hexMix(c,'#FFFFFF',.13),pa:hexMix(c,'#FFFFFF',.45),bt:hexMix(c,'#111018',.28),on:'#FFFFFF',d:{bt:hexMix(c,'#FFFFFF',.18)}};
}
function rEd(){
 const cur=ED.mode==='custom'?'personalizada':(ED.palette||'azul');
 const o=ED.mode==='custom'?customPaletteFromColor(ED.customColor):palOf(cur,'plan');
 const customBtn=$('#ed-custom-mode'),customControls=$('#ed-custom-panel'),customPicker=$('#ed-custom-color'),selectedName=$('#ed-selected-name');
 if(customBtn){customBtn.classList.toggle('is-active',ED.mode==='custom');customBtn.setAttribute('aria-pressed',String(ED.mode==='custom'));}
 if(customControls)customControls.hidden=ED.mode!=='custom';
 if(customPicker&&customPicker.value.toLowerCase()!==String(ED.customColor).toLowerCase())customPicker.value=ED.customColor;
 if(selectedName)selectedName.textContent=ED.mode==='custom'?'Personalizada':(PAL[ED.palette]?.n||'Roxo');
 const swatches=$('#edw');
 if(swatches){
   swatches.hidden=false;
   swatches.innerHTML=EDIT_PALETTE_KEYS.map(k=>{const p=palOf(k,'plan'),active=ED.mode==='preset'&&ED.palette===k;return `<button type="button" class="swb${active?' on':''}" style="--s1:${p.pl};--s2:${p.pd}" onclick="edSet('${k}')" aria-label="${esc(PAL[k].n)}" title="${esc(PAL[k].n)}">${active?CHK:''}</button>`}).join('');
 }
 const preview=$('#edp');if(!preview)return;
 preview.style.cssText=`--pc:${o.pc};--pl:${o.pl};--pd:${o.pd};--pa:${o.pa};--ac2:${o.ac2};--bt:${o.bt};--on:${o.on};`;
 preview.innerHTML=`<div class="editor-preview-shell">
   <div class="editor-preview-context"><strong>Visão geral</strong><span>Planejamento</span><small>Exemplo de aparência</small></div>
   <div class="global-table-preview">
     <div class="global-table-month"><button type="button" aria-hidden="true">‹</button><div><strong>Outubro de 2026</strong></div><button type="button" aria-hidden="true">›</button></div>
     <div class="global-table-columns"><span>Descrição</span><span>Planejado</span><span>Pago</span></div>
     <div class="global-table-row opening"><span>Saldo anterior</span><span>R$ 7.935,64</span><span>R$ 297,70</span></div>
     <div class="global-table-row income"><span>Salário</span><span class="positive">4.600,00</span><span>4.600,00</span></div>
     <div class="global-table-row"><span>Faculdade</span><span class="negative">−137,47</span><span>−137,47</span></div>
     <div class="global-table-row saving"><span>Aporte</span><span class="guard">−500,00</span><span>0,00</span></div>
     <div class="global-table-row total"><span>Total</span><strong>R$ 3.962,53</strong><strong>R$ 3.962,53</strong></div>
   </div>
   <div class="editor-preview-bottom"><div class="editor-preview-actions"><span>Adicionar</span><span>Guardado</span></div><div class="editor-preview-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>
 </div>`;
}
function edColorMode(mode){
 ED.mode=mode==='custom'?'custom':'preset';
 if(ED.mode==='custom'&&!ED.customColor)ED.customColor=(PAL[ED.palette]||PAL.roxo).pc;
 rEd();
}
function edSet(k){if(!EDIT_PALETTE_KEYS.includes(k))return;ED.palette=k;ED.customColor=PAL[k].pc;ED.mode='preset';rEd()}
function edSetCustomColor(color){ED.customColor=String(color||'#7276E9');ED.palette='personalizada';ED.mode='custom';rEd()}
function edAll(){const k=ED.mode==='custom'?'personalizada':ED.palette;S.globalPalette=k;S.cor={...(S.cor||{}),global:k,plan:k,cx:k,cart:k};if(k==='personalizada'){const c=customPaletteFromColor(ED.customColor);S.customThemePalette=c;S.customThemePalettes={...(S.customThemePalettes||{}),plan:c,cx:c,cart:c};}else{delete S.customThemePalette;delete S.customThemePalettes;}applyCor();rEd();save()}
function setGlass(value,commit=false){
 const n=Math.min(94,Math.max(20,Number(value)||72));
 const root=document.documentElement;
 const transparency=(100-n)/74; // normalize the current 20–94% glass range
 root.style.setProperty('--glass-opacity',n+'%');
 root.style.setProperty('--glass-inverse',(100-n)+'%');
 root.style.setProperty('--glass-alpha',((100-n)/100).toFixed(2));
 // As surfaces become more transparent, increase text contrast and glass highlights.
 root.style.setProperty('--glass-text-boost',Math.max(0,Math.min(1,transparency)).toFixed(3));
 root.style.setProperty('--glass-text-color',`rgb(${Math.round(224+31*transparency)} ${Math.round(231+24*transparency)} ${Math.round(242+13*transparency)})`);
 root.style.setProperty('--glass-muted-color',`rgb(${Math.round(169+48*transparency)} ${Math.round(180+46*transparency)} ${Math.round(198+38*transparency)})`);
 root.style.setProperty('--glass-highlight-alpha',(0.08+0.20*transparency).toFixed(3));
 const out=$('#glass-value'),range=$('#glass-range');
 if(out)out.textContent=n+'%';
 if(range&&Number(range.value)!==n)range.value=n;
 if(commit){S.glass=n;save()}
}
function oe(mode='color'){
 const current=S.globalPalette||(S.cor||{}).global||(S.cor||{}).plan||'azul';
 const normalized=EDIT_PALETTE_KEYS.includes(current)?current:({azulescuro:'azul',azulneon:'azul',itau:'laranja',santander:'vermelho',bradesco:'vermelho',preto:'preto-fosco',ultravioleta:'roxo'}[current]||'azul');
 ED={palette:normalized,mode:current==='personalizada'?'custom':'preset',customColor:S.customThemePalette?.pc||S.customThemePalettes?.plan?.pc||PAL[normalized]?.pc||'#7276E9'};
 const modal=$('#ed'),title=modal.querySelector('.mdh h2'),desc=modal.querySelector('.mdc > .sub');
 modal.classList.toggle('glass-mode',mode==='glass');
 modal.classList.toggle('color-mode',mode!=='glass');
 title.textContent=mode==='glass'?'Configurar Liquid Glass':'Personalizar cores';
 modal.querySelector('.mdc').setAttribute('aria-label',mode==='glass'?'Configurar Liquid Glass':'Personalizar cores');
 if(desc)desc.textContent=mode==='glass'?'Ajuste a transparência e a presença do vidro em todo o site.':'Escolha a cor do seu banco. Ela será aplicada à tabela e aos controles funcionais, sem alterar a identidade Azul Trama.';
 rEd();modal.hidden=false;setGlass(S.glass);
}
function ce(){setGlass(S.glass);$('#ed').hidden=true}
function ca(){
 const modal=$('#ed');
 if(modal.classList.contains('glass-mode')){
   S.glass=Math.min(94,Math.max(20,Number($('#glass-range')?.value)||72));
   setGlass(S.glass);save();ce();return;
 }
 const key=ED.mode==='custom'?'personalizada':ED.palette;
 S.globalPalette=key;S.cor={...(S.cor||{}),global:key,plan:key,cx:key,cart:key};
 if(key==='personalizada'){
   const palette=customPaletteFromColor(ED.customColor);
   S.customThemePalette=palette;S.customThemePalettes={...(S.customThemePalettes||{}),plan:palette,cx:palette,cart:palette};
 }else{delete S.customThemePalette;delete S.customThemePalettes;}
 applyCor();save();ce();R();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')ce()});
function tg(){const c=document.documentElement.dataset.theme;S.theme=c==='dark'?'light':'dark';document.documentElement.dataset.theme=S.theme;thi();applyCor();save()}
function pjn(n){S.pj=shift(S.m,n);R()}
function mv(d){S.m=shift(S.m,d);R()}
// Navegação mensal do Cofre; atualiza o mesmo mês global para manter as abas sincronizadas.
function changeCofreMonth(d){S.m=shift(S.m,d);cofreSelectedMonth=S.m;cofreSelectedRiseMonth=null;R()}
function msg(t,e){const x=$('#ms');x.textContent=t;x.className='ms'+(e?' e':'')}
function rpt(){const on=$('#fr').checked;$('#rpt').classList.toggle('on',on);if(on){if(!$('#fa').value)$('#fa').value=S.m;if(!$('#fz').value)$('#fz').value=shift(S.m,11)}}
function activeCategories(){return [...DEF]}
function toggleReminderOptions(){
 const enabled=!!$('#fremind')?.checked,options=$('#reminder-options'),note=$('#reminder-support-note');
 if(options)options.hidden=!enabled;
 if(!enabled)return;
 if(!('Notification' in window)){if(note)note.textContent='Este navegador não oferece notificações do sistema. A integração por e-mail ainda não está conectada.';return}
 if(Notification.permission==='granted'){if(note)note.textContent='Notificações ativadas. A Trama avisará na data escolhida enquanto estiver aberta.';return}
 if(Notification.permission==='denied'){if(note)note.textContent='As notificações estão bloqueadas nas permissões do navegador. Você pode liberá-las nas configurações do site.';return}
 if(note)note.textContent='O navegador solicitará permissão para enviar notificações. Elas aparecem enquanto a Trama estiver aberta.';
 Notification.requestPermission().then(permission=>{
  if(!note)return;
  note.textContent=permission==='granted'?'Notificações ativadas neste navegador.':permission==='denied'?'Permissão negada. Libere as notificações nas configurações do navegador.':'Permissão não concedida; nenhum aviso será exibido.';
  if(permission==='granted')checkDueReminders();
 }).catch(()=>{if(note)note.textContent='Não foi possível solicitar permissão agora. Verifique as configurações do navegador.'});
}
// Alterna os campos conforme o tipo, sem alterar as categorias/baús existentes.
function fcr(){
 const t=$('#ft').value,isSaving=t==='guardar',isExpense=t==='despesa',description=$('#fd');
 description.hidden=isSaving;description.setAttribute('aria-hidden',String(isSaving));
 description.placeholder='Descrição';
 if(isSaving)description.value='';
 const reminderFields=$('#expense-reminder-fields');if(reminderFields)reminderFields.hidden=!isExpense;
 $('#fcw').innerHTML=isSaving
  ? '<select id="fc" aria-label="Baú que receberá o valor guardado">'+(S.boxes.length?S.boxes.map(b=>`<option value="${b.id}">${esc(b.nome)}</option>`).join(''):'<option value="">Crie um baú na aba Cofre</option>')+'</select>'
  : '<select id="fc" aria-label="Categoria do lançamento" style="width:160px"><option value="">Categoria</option>'+activeCategories().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')+'</select>';
}
let ST=[];
function stg(){
 const t=$('#ft').value,manualDesc=$('#fd').value.trim(),categoryOrBox=$('#fc')?.value.trim()||'',p=+$('#fp').value||0;
 let d=manualDesc;
 if(t==='guardar'){
  const selectedBox=S.boxes.find(b=>b.id===categoryOrBox);
  if(!selectedBox){msg('Crie um baú na aba Cofre primeiro.',1);return false}
  d=selectedBox.nome;
 }else if(!d){msg('Informe a descrição.',1);return false}
 if(!p){msg('Informe o valor planejado.',1);return false}
 const dueDate=t==='despesa'?($('#fdue')?.value||''):'';
 const remind=t==='despesa'&&!!$('#fremind')?.checked;
 if(remind&&!dueDate){msg('Escolha a data em que deseja receber o lembrete.',1);$('#fdue')?.focus();return false}
 if(remind&&(!('Notification' in window)||Notification.permission!=='granted')){
  msg('O lançamento será salvo, mas as notificações deste navegador não estão ativadas.',1);
 }
 let ms=[S.m];if($('#fr').checked){const a=$('#fa').value,z=$('#fz').value;if(!a||!z||a>z){msg('Escolha um período válido (de ≤ até).',1);return false}ms=[];for(let m=a,n=0;m<=z&&n<120;m=shift(m,1),n++)ms.push(m)}
 ST.push({tipo:t,desc:d,cat:t==='guardar'?'':(categoryOrBox||'Outros'),box:t==='guardar'?categoryOrBox:null,plan:p,ms,dueDate:dueDate||null,reminder:remind,reminderChannel:remind?($('#fchannel')?.value||'browser'):'none'});
 $('#fd').value=$('#fp').value='';if($('#fdue'))$('#fdue').value='';if($('#fremind'))$('#fremind').checked=false;if($('#reminder-options'))$('#reminder-options').hidden=true;msg('');rST();return true;
}
function add(e){e.preventDefault();stg()}
function rmST(i){ST.splice(i,1);rST()}
function clST(){ST=[];rST()}
function rST(){const el=$('#st');$('#cb').textContent=ST.length?'Lançar '+ST.length+' na tabela':'Lançar na tabela';
 if(!ST.length){el.innerHTML='';return}
 el.innerHTML='<div class="ov"><table><thead><tr><th>Lista para lançar</th><th>Categoria / baú</th><th>Período</th><th style="text-align:right">Planejado</th><th></th></tr></thead><tbody>'+ST.map((x,i)=>{const boxName=x.tipo==='guardar'?(S.boxes.find(b=>b.id===x.box)||{nome:'(baú removido)'}).nome:'',cn=x.tipo==='guardar'?'—':esc(x.cat),pe=x.ms.length>1?ml(x.ms[0])+' a '+ml(x.ms[x.ms.length-1])+' ('+x.ms.length+')':ml(x.ms[0]);
  const typeLabel=x.tipo==='guardar'?'Guardei':x.tipo==='receita'?'Ganhei':'Gastei';
  const label=x.tipo==='guardar'?`<b class="k">${typeLabel}</b> · ${esc(boxName)}`:`<b class="${x.tipo==='receita'?'pos':'neg'}">${typeLabel}</b> · ${esc(x.desc)}${x.dueDate?`<small class="queue-due-date">Vencimento: ${formatPurchaseDate(x.dueDate)}${x.reminder?' · lembrete ativado':''}</small>`:''}`;
  return `<tr><td>${label}</td><td>${cn}</td><td>${pe}</td><td style="text-align:right">${fmt(x.plan)}</td><td><button type="button" class="x" onclick="rmST(${i})" aria-label="Remover da lista">✕</button></td></tr>`}).join('')+'</tbody></table></div><button type="button" class="ib" style="margin-top:8px" onclick="clST()">Limpar lista</button>'}
function dueDateForMonth(referenceDate,month){
 if(!referenceDate)return null;
 const day=Number(String(referenceDate).slice(8,10)),parts=month.split('-').map(Number),lastDay=new Date(parts[0],parts[1],0).getDate();
 return `${month}-${String(Math.min(day,lastDay)).padStart(2,'0')}`;
}
function commit(){if(($('#fd').value.trim()||+$('#fp').value)&&!stg())return;
 if(!ST.length){msg('Adicione ao menos um lançamento.',1);return}
 const k=ST.length;let n=0;ST.forEach(x=>x.ms.forEach(m=>{n++;const dueDate=x.dueDate?(x.ms.length>1?dueDateForMonth(x.dueDate,m):x.dueDate):null;S.tx.push({id:uid(),m,desc:x.desc,tipo:x.tipo,cat:x.cat,box:x.box,plan:x.plan,pago:0,dueDate,reminder:!!x.reminder,reminderChannel:x.reminderChannel||'none'})}));
 ST=[];rST();msg(k>1?k+' lançamentos adicionados à tabela':(n>1?'Adicionado em '+n+' meses':'Adicionado'));R()}
function checkDueReminders(){
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 const today=todayISO(),sent=Array.isArray(S.reminderSent)?S.reminderSent:(S.reminderSent=[]);
 S.tx.filter(t=>t.tipo==='despesa'&&t.reminder&&t.reminderChannel==='browser'&&t.dueDate&&t.dueDate<=today&&(+t.pago||0)<(+t.plan||0)).forEach(t=>{
  const key=`${t.id}|${t.dueDate}`;if(sent.includes(key))return;
  const overdue=t.dueDate<today,title=overdue?'Conta em atraso · Trama':'Vencimento hoje · Trama';
  const dateLabel=formatPurchaseDate(t.dueDate),body=`${t.desc} · ${fmt(Math.max(0,(+t.plan||0)-(+t.pago||0)))}${overdue?' · venceu em '+dateLabel:' · vence hoje'}.`;
  try{const note=new Notification(title,{body,icon:'./trama-simbolo.png',tag:key});note.onclick=()=>{window.focus();go('plan');note.close()};sent.push(key);if(sent.length>500)sent.splice(0,sent.length-500);save()}
  catch(e){/* O navegador pode bloquear notificações fora de HTTPS/localhost. */}
 });
}
setInterval(checkDueReminders,60000);
function cpy(id){
 const t=S.tx.find(t=>t.id===id);if(!t||t.resgateBoxId||t.resgateReturnOf)return;
 t.pago=t.plan;R();
}
function cpc(id){
 const x=cardsM(S.m).find(x=>x.c.id===id);if(!x)return;
 S.ccp[id+'|'+S.m]=x.f;R();
}
function ed(id,k,v){const t=S.tx.find(t=>t.id===id);if(!t||t.resgateBoxId||t.resgateReturnOf)return;t[k]=k==='desc'?v:(Math.abs(pv(v))||0);R()}
function del(id){
 const t=S.tx.find(x=>x.id===id);if(!t)return;
 if(t.resgateBoxId){
  // Excluir o resgate apaga também a devolução associada, se já foi feita.
  S.tx=S.tx.filter(x=>x.id!==id&&x.resgateReturnOf!==id);
 }else if(t.resgateReturnOf){
  // Excluir a devolução reabre a ação Guardar no resgate original.
  const original=S.tx.find(x=>x.id===t.resgateReturnOf);if(original)original.resgateDevolvido=false;
  S.tx=S.tx.filter(x=>x.id!==id);
 }else S.tx=S.tx.filter(x=>x.id!==id);
 R();
}
function ovs(k,v){S.ov[S.m]=S.ov[S.m]||{};const n=pv(v);S.ov[S.m][k]=v.trim()===''||isNaN(n)?null:n;R()}
/* === COFRE: saldo sem rendimentos ==========================================
   Somente lançamentos Guardar pagos entram no saldo. Saldos iniciais de caixas
   legadas são preservados, mas não se calcula nem se exibe rentabilidade.
============================================================================= */
function cofreOpeningThrough(m){
 return S.boxes.reduce((a,b)=>a+((!b.m0||b.m0<=m)?(+b.saldo0||0):0),0);
}
function cofreSavedThrough(m){
 const paid=S.tx.filter(t=>t.tipo==='guardar'&&t.m<=m).reduce((a,t)=>a+(+t.pago||0),0);
 const withdrawn=S.tx.filter(t=>t.resgateBoxId&&t.m<=m).reduce((a,t)=>a+(+t.pago||0),0);
 return Math.max(0,paid+cofreOpeningThrough(m)-withdrawn);
}
function cofreBoxSaved(box,m){
 const opening=(!box.m0||box.m0<=m)?(+box.saldo0||0):0;
 const deposits=S.tx.filter(t=>t.tipo==='guardar'&&t.box===box.id&&t.m<=m).reduce((a,t)=>a+(+t.pago||0),0);
 const withdrawn=S.tx.filter(t=>t.resgateBoxId===box.id&&t.m<=m).reduce((a,t)=>a+(+t.pago||0),0);
 return Math.max(0,opening+deposits-withdrawn);
}
function toggleTabHelp(btn){
 const pop=btn?.parentElement?.querySelector('.tab-help-pop');if(!pop)return;
 const opening=pop.hidden;
 document.querySelectorAll('.tab-help-pop').forEach(p=>{p.hidden=true});
 document.querySelectorAll('.tab-help-btn').forEach(b=>b.setAttribute('aria-expanded','false'));
 pop.hidden=!opening;
 btn.setAttribute('aria-expanded',String(opening));
}
// Compatibilidade para qualquer referência legada ao antigo botão informativo do Cofre.
function toggleSavedInfo(btn){toggleTabHelp(btn)}
document.addEventListener('click',e=>{
 if(e.target.closest('.tab-help-control'))return;
 document.querySelectorAll('.tab-help-pop').forEach(p=>p.hidden=true);
 document.querySelectorAll('.tab-help-btn').forEach(b=>b.setAttribute('aria-expanded','false'));
});
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 document.querySelectorAll('.tab-help-pop').forEach(p=>p.hidden=true);
 document.querySelectorAll('.tab-help-btn').forEach(b=>b.setAttribute('aria-expanded','false'));
});
let cofreSelectedMonth=null,cofreSelectedRiseMonth=null,cofreChartWasRevealed=false,cofreChartHadValues=false,cofreChartObserver=null;
function cofreShortMoney(v){if(v>=1000000)return 'R$ '+(v/1000000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mi';if(v>=1000)return 'R$ '+(v/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mil';return fmt(v)}
function renderCofreChart(){
 const host=$('#cofre-chart');if(!host)return;
 const months=Array.from({length:12},(_,i)=>shift(S.m,i-11));
 const values=months.map(cofreSavedThrough),actualMax=Math.max(0,...values),max=actualMax||1,W=1000,H=330,left=76,right=22,top=26,base=H-46,plotH=base-top,slot=(W-left-right)/months.length,bw=Math.min(38,slot*.55),depth=7;
 const tickStops=actualMax>0?[0,.25,.5,.75,1]:[0];
 const ticks=tickStops.map(p=>{const y=base-plotH*p;return `<g class="cofre-grid-row"><line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}"/><text x="${left-12}" y="${y+4}" text-anchor="end">${cofreShortMoney(actualMax*p)}</text></g>`}).join('');
 if(!months.includes(cofreSelectedMonth))cofreSelectedMonth=S.m;
 const selectedIndex=Math.max(0,months.indexOf(cofreSelectedMonth));
 const bars=months.map((m,i)=>{
  const value=values[i],height=value>0?Math.max(2,plotH*value/max):0,x=left+i*slot+(slot-bw-depth)/2,y=base-height,active=m===cofreSelectedMonth;
  const front=value>0?`<rect class="cofre-bar-front" x="${x}" y="${y}" width="${bw}" height="${height}" rx="2.5"/>`:`<line class="cofre-zero-line" x1="${x}" y1="${base}" x2="${x+bw}" y2="${base}"/>`;
  const side=value>0?`<path class="cofre-bar-side" d="M${x+bw},${y} L${x+bw+depth},${y-depth} L${x+bw+depth},${base-depth} L${x+bw},${base} Z"/>`:'';
  const topFace=value>0?`<path class="cofre-bar-top" d="M${x},${y} L${x+depth},${y-depth} L${x+bw+depth},${y-depth} L${x+bw},${y} Z"/>`:'';
  const riseOnSelect=cofreSelectedRiseMonth===m;
  return `<g class="cofre-month-hit ${active?'selected':''} ${riseOnSelect?'selected-rising':''}" data-month="${m}" tabindex="0" role="button" aria-pressed="${active?'true':'false'}" aria-label="${esc(lab(m))}: ${fmt(value)}. Selecionar mês" onclick="selectCofreMonth('${m}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCofreMonth('${m}')}" style="--bar-delay:${i*48}ms"><rect class="cofre-hit-area" x="${left+i*slot}" y="${top-8}" width="${slot}" height="${base-top+18}"/>${`<g class="cofre-bar-prism" style="--bar-delay:${i*48}ms">${side}${front}${topFace}</g>`}<text class="cofre-month-label" x="${left+i*slot+slot/2}" y="${H-17}" text-anchor="middle">${ml(m)}</text><title>${esc(lab(m))}: ${fmt(value)}</title></g>`;
 }).join('');
 // A primeira aparição anima todas as barras; ao selecionar um mês, apenas a barra ativa sobe novamente.
 const hasSavedValues=values.some(v=>v>0),selMonth=months[selectedIndex],selValue=values[selectedIndex],monthSaved=S.tx.filter(t=>t.tipo==='guardar'&&t.m===selMonth).reduce((a,t)=>a+(+t.pago||0),0),revealed=cofreChartWasRevealed?' is-visible'+(cofreChartHadValues&&hasSavedValues?' cofre-bars-settled':''):'';
 cofreChartHadValues=hasSavedValues;
 host.innerHTML=`<svg id="cofre-balance-chart" class="cofre-bars-chart${revealed}" viewBox="0 0 ${W} ${H}" role="group" aria-label="Evolução do saldo guardado nos últimos 12 meses"><defs><linearGradient id="cofre-front-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pl)"/><stop offset="1" stop-color="var(--pc)"/></linearGradient><linearGradient id="cofre-side-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--pd)"/><stop offset="1" stop-color="var(--pc)"/></linearGradient><linearGradient id="cofre-top-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--pa)"/><stop offset="1" stop-color="var(--pl)"/></linearGradient></defs>${ticks}<line class="cofre-axis-line" x1="${left}" y1="${base}" x2="${W-right}" y2="${base}"/>${bars}</svg><div class="cofre-chart-insight-grid" aria-live="polite"><div class="cofre-chart-insight-item paid-this-month"><small>Saldo guardado · ${esc(lab(selMonth))}</small><strong>${fmt(monthSaved)}</strong><span>Valor pago neste mês</span></div><div class="cofre-chart-insight-item accumulated"><small>Saldo acumulado até ${esc(lab(selMonth))}</small><strong>${fmt(selValue)}</strong><span>Total guardado até o mês selecionado</span></div></div>${values.every(v=>v===0)?'<p class="cofre-chart-empty">O gráfico será preenchido conforme você registrar lançamentos “Guardar” e marcá-los como pagos no Planejamento.</p>':''}`;
 cofreSelectedRiseMonth=null;
 observeCofreChart();
}
function selectCofreMonth(m){if(!m)return;cofreSelectedMonth=m;cofreSelectedRiseMonth=m;renderCofreChart()}
function observeCofreChart(){
 const section=$('#cofre-chart-section'),svg=$('#cofre-balance-chart');if(!section||!svg)return;
 if(cofreChartWasRevealed){svg.classList.add('is-visible');return}
 if(cofreChartObserver)cofreChartObserver.disconnect();
 if(!('IntersectionObserver' in window)){cofreChartWasRevealed=true;svg.classList.add('is-visible');return}
 cofreChartObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){cofreChartWasRevealed=true;const chart=$('#cofre-balance-chart');if(chart)chart.classList.add('is-visible');cofreChartObserver.disconnect()}},{threshold:.18});
 cofreChartObserver.observe(section);
}

function closeCofreGoalsModal(restoreFocus=false){
 const modal=$('#cofre-goals-modal'),button=$('#cofre-plans-toggle');
 if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true')}
 document.body.classList.remove('cofre-goals-modal-open');
 if(button){button.setAttribute('aria-expanded','false');button.classList.remove('is-active');if(restoreFocus)button.focus()}
}
function toggleCofrePanel(which){
 const panels={create:$('#cofre-create-card'),list:$('#cofre-box-list-card')};
 const buttons={create:$('#cofre-create-toggle'),list:$('#cofre-list-toggle'),plans:$('#cofre-plans-toggle')};
 const activeButton=buttons[which];
 if(which==='plans'){
  const modal=$('#cofre-goals-modal');if(!modal)return;
  const opening=modal.hidden;
  Object.values(panels).forEach(p=>{if(p)p.hidden=true});
  ['create','list'].forEach(k=>{const b=buttons[k];if(b){b.setAttribute('aria-expanded','false');b.classList.remove('is-active')}});
  if(!opening){closeCofreGoalsModal();return}
  closeCofreGoalsModal();
  modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('cofre-goals-modal-open');
  if(activeButton){activeButton.setAttribute('aria-expanded','true');activeButton.classList.add('is-active')}
  updateCofreGoalFormAvailability();
  requestAnimationFrame(()=>{const target=S.goals.length>=3?modal.querySelector('.cofre-goals-modal-card .ib'):$('#cofre-goal-target');target?.focus()});
  return;
 }
 const target=panels[which];if(!target)return;
 const opening=target.hidden;
 closeCofreGoalsModal();
 Object.values(panels).forEach(p=>{if(p)p.hidden=true});
 Object.values(buttons).forEach(b=>{if(b){b.setAttribute('aria-expanded','false');b.classList.remove('is-active')}});
 if(opening){target.hidden=false;if(activeButton){activeButton.setAttribute('aria-expanded','true');activeButton.classList.add('is-active')}
  if(which==='create')requestAnimationFrame(()=>$('#cn')?.focus());
 }
}

function refreshCofreGoalBoxSelect(){
 const select=$('#cofre-goal-box');if(!select)return;
 const signature=JSON.stringify(S.boxes.map(b=>[b.id,b.nome]));
 if(select.dataset.boxSignature===signature)return;
 const previous=select.value;
 const placeholder=S.boxes.length?'Selecione um baú':'Crie um baú primeiro';
 select.innerHTML=`<option value="" selected disabled>${placeholder}</option>`+S.boxes.map(b=>`<option value="${esc(b.id)}">${esc(b.nome)}</option>`).join('');
 select.dataset.boxSignature=signature;
 select.required=true;
 if(S.boxes.some(b=>b.id===previous))select.value=previous;else select.value='';
 select.disabled=!S.boxes.length;
}
function getCofreGoalContext(boxId=''){
 if(boxId){
  const box=S.boxes.find(b=>b.id===boxId);
  if(!box)return {current:0,plannedMonthly:0,boxLabel:'Baú não encontrado'};
  return {current:cofreBoxSaved(box,S.m),plannedMonthly:S.tx.filter(t=>t.tipo==='guardar'&&t.box===boxId&&t.m===S.m).reduce((a,t)=>a+(+t.plan||0),0),boxLabel:box.nome};
 }
 return {current:cofreSavedThrough(S.m),plannedMonthly:S.tx.filter(t=>t.tipo==='guardar'&&t.m===S.m).reduce((a,t)=>a+(+t.plan||0),0),boxLabel:'Todos os baús'};
}
function cofreDurationLabel(months){
 const n=Math.max(0,Math.ceil(Number(months)||0));if(n===0)return 'Meta já alcançada';
 const years=Math.floor(n/12),left=n%12,parts=[];
 if(years)parts.push(years+' '+(years===1?'ano':'anos'));
 if(left)parts.push(left+' '+(left===1?'mês':'meses'));
 return parts.join(' e ')||'Menos de um mês';
}
function calculateCofreGoal(target,months,boxId,monthlyOverride){
 const context=getCofreGoalContext(boxId||''),goal=Math.max(0,Number(target)||0),current=Math.max(0,context.current),remaining=Math.max(0,goal-current),duration=Number(months)>0?Math.min(600,Math.ceil(Number(months))):null;
 const override=Number(monthlyOverride)>0?Number(monthlyOverride):0;
 const planned=Math.max(0,context.plannedMonthly||0);
 let monthly=null,estimatedMonths=null,method='none';
 if(remaining<=0){monthly=override||0;estimatedMonths=0;method='reached'}
 else if(override>0){monthly=override;estimatedMonths=Math.ceil(remaining/monthly);method='manual-rate'}
 else if(duration){monthly=Math.ceil((remaining/duration)*100-1e-8)/100;estimatedMonths=duration;method='deadline'}
 else if(planned>0){monthly=planned;estimatedMonths=Math.ceil(remaining/monthly);method='current-plan'}
 const progress=goal>0?Math.max(0,Math.min(100,current/goal*100)):0;
 return {target:goal,current,remaining,monthly,estimatedMonths,method,progress,context,deadlineMonths:duration};
}
function renderCofreGoalResult(calc,emptyMessage=''){
 if(!calc)return `<p class="cofre-goal-preview-empty">${emptyMessage||'Informe o valor do objetivo para ver sua projeção.'}</p>`;
 const progress=Math.round(calc.progress*10)/10;
 const status=calc.remaining<=0?'Você já alcançou essa meta. Parabéns!':calc.estimatedMonths?(calc.deadlineMonths&&calc.method==='manual-rate'?(calc.estimatedMonths<=calc.deadlineMonths?`O aporte informado permite cumprir o prazo de ${cofreDurationLabel(calc.deadlineMonths)}.`:`O aporte informado levará ${cofreDurationLabel(calc.estimatedMonths)}; prazo desejado: ${cofreDurationLabel(calc.deadlineMonths)}.`):`Estimativa: ${cofreDurationLabel(calc.estimatedMonths)}.`):'Informe o valor mensal para estimar o prazo.';
 const monthlyLabel=calc.method==='deadline'?'Necessário para cumprir o prazo':'Guardar por mês';
 const monthlyValue=calc.monthly==null?'—':fmt(calc.monthly);
 const timeValue=calc.estimatedMonths==null?'Informe um aporte mensal':cofreDurationLabel(calc.estimatedMonths);
 const monthlyNote=calc.method==='deadline'?'Calculado para cumprir o prazo escolhido':calc.method==='current-plan'?'Com base no Planejamento deste mês':calc.method==='manual-rate'?'Com base no aporte informado':calc.method==='reached'?'Nenhum aporte adicional necessário':'Defina um prazo ou um aporte mensal';
 return `<div class="cofre-goal-result-top"><div><small>Falta para alcançar a meta</small><strong>${fmt(calc.remaining)}</strong></div><span class="cofre-goal-progress-label">${progress.toLocaleString('pt-BR',{maximumFractionDigits:1})}% alcançado</span></div><div class="cofre-goal-progress" role="progressbar" aria-label="Progresso da meta" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><i style="width:${progress}%"></i></div><div class="cofre-goal-result-metrics"><div><small>${monthlyLabel}</small><b>${monthlyValue}</b><span>${monthlyNote}</span></div><div><small>Tempo estimado</small><b>${esc(timeValue)}</b><span>${esc(status)}</span></div><div><small>Já acumulado</small><b>${fmt(calc.current)}</b><span>Saldo real dos baús até ${esc(lab(S.m))}</span></div></div>`;
}
function updateCofreGoalPreview(){
 const out=$('#cofre-goal-preview');if(!out)return;
 const target=Number($('#cofre-goal-target')?.value||0),months=$('#cofre-goal-months')?.value||'',boxId=$('#cofre-goal-box')?.value||'',monthly=$('#cofre-goal-monthly')?.value||'';
 if(!S.boxes.length){out.innerHTML=renderCofreGoalResult(null,'Crie um baú antes de montar um plano.');return}
 if(!boxId||!S.boxes.some(b=>b.id===boxId)){out.innerHTML=renderCofreGoalResult(null,'Selecione um baú já criado e informe o valor da meta para ver a projeção.');return}
 if(!(target>0)){out.innerHTML=renderCofreGoalResult(null);return}
 const calc=calculateCofreGoal(target,months,boxId,monthly);
 out.innerHTML=renderCofreGoalResult(calc);
}
function clearCofreGoalFeedback(){const el=$('#cofre-goal-feedback');if(el){el.hidden=true;el.textContent='';el.classList.remove('is-error','is-success')}}
function setCofreGoalFeedback(text,type='error'){const el=$('#cofre-goal-feedback');if(!el)return;el.textContent=text||'';el.hidden=!text;el.classList.toggle('is-error',type==='error');el.classList.toggle('is-success',type==='success')}
function updateCofreGoalFormAvailability(){
 const full=(Array.isArray(S.goals)?S.goals.length:0)>=3,noBoxes=!Array.isArray(S.boxes)||S.boxes.length===0,blocked=full||noBoxes,form=$('#cofre-goal-form'),limit=$('#cofre-goal-limit-message'),submit=$('#cofre-goal-submit');
 if(form)form.querySelectorAll('input,select').forEach(el=>{el.disabled=blocked});
 if(submit)submit.disabled=blocked;
 if(limit){limit.hidden=!blocked;limit.textContent=full?'Você já criou os três planos disponíveis. Remova um plano para criar outro.':noBoxes?'Crie um baú primeiro para vinculá-lo à sua meta.':''}
}
function saveCofreGoal(e){
 e.preventDefault();
 if((Array.isArray(S.goals)?S.goals.length:0)>=3){setCofreGoalFeedback('Você já criou os três planos disponíveis. Remova um plano para criar outro.');updateCofreGoalFormAvailability();return}
 if(!Array.isArray(S.boxes)||!S.boxes.length){setCofreGoalFeedback('Crie um baú antes de cadastrar uma meta.');updateCofreGoalFormAvailability();return}
 const target=Number($('#cofre-goal-target')?.value||0),months=$('#cofre-goal-months')?.value||'',boxId=$('#cofre-goal-box')?.value||'',monthly=Number($('#cofre-goal-monthly')?.value||0);
 if(!(target>0)){setCofreGoalFeedback('Informe um valor válido para a meta.');$('#cofre-goal-target')?.focus();return}
 if(!boxId||!S.boxes.some(b=>b.id===boxId)){setCofreGoalFeedback('Selecione um baú que já foi criado.');$('#cofre-goal-box')?.focus();return}
 if(!(monthly>0)){setCofreGoalFeedback('Informe quanto pretende guardar por mês.');$('#cofre-goal-monthly')?.focus();return}
 S.goals.push({id:uid(),target:+target.toFixed(2),months:Number(months)>0?Math.min(600,Math.ceil(Number(months))):null,boxId,monthly:+monthly.toFixed(2),createdAt:todayISO()});
 $('#cofre-goal-form')?.reset();refreshCofreGoalBoxSelect();updateCofreGoalPreview();closeCofreGoalsModal();R();msg('Plano criado. Ele já está disponível abaixo das ações do Cofre.');
}
function renderSavedCofreGoals(){
 const host=$('#cofre-saved-goals'),section=$('#cofre-saved-goals-section');if(!host||!section)return;
 const goals=Array.isArray(S.goals)?S.goals:[];
 if(!goals.length){host.innerHTML='';host.classList.remove('goals-count-1','goals-count-2','goals-count-3');section.hidden=true;updateCofreGoalFormAvailability();return}
 section.hidden=false;
 host.classList.remove('goals-count-1','goals-count-2','goals-count-3');
 host.classList.add(goals.length===1?'goals-count-1':goals.length===2?'goals-count-2':'goals-count-3');
 host.innerHTML=goals.map(goal=>{
  const boxExists=!goal.boxId||S.boxes.some(b=>b.id===goal.boxId),boxId=boxExists?(goal.boxId||''):'__missing__';
  const calc=calculateCofreGoal(goal.target,goal.months,boxId,goal.monthly);
  const boxLabel=boxExists?(goal.boxId?(S.boxes.find(b=>b.id===goal.boxId)?.nome||'Baú selecionado'):'Todos os baús'):'Baú removido';
  const monthly=calc.monthly==null?'—':fmt(calc.monthly),time=calc.estimatedMonths==null?'Sem estimativa':cofreDurationLabel(calc.estimatedMonths),progress=Math.round(calc.progress*10)/10;
  return `<article class="cofre-saved-goal"><div class="cofre-saved-goal-top"><div><strong>Meta de ${fmt(goal.target)}</strong><small>${esc(boxLabel)}</small></div><button type="button" class="x cofre-goal-delete" onclick="deleteCofreGoal('${goal.id}')" aria-label="Remover plano de ${fmt(goal.target)}" title="Remover plano">✕</button></div><div class="cofre-goal-progress" role="progressbar" aria-label="Progresso da meta ${fmt(goal.target)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><i style="width:${progress}%"></i></div><div class="cofre-saved-goal-metrics"><div><small>Já acumulado</small><b>${fmt(calc.current)}</b></div><div><small>Guardar por mês</small><b>${monthly}</b></div><div><small>Prazo estimado</small><b>${esc(time)}</b></div></div><div class="cofre-saved-goal-remaining">${calc.remaining<=0?'Objetivo alcançado!':`Faltam ${fmt(calc.remaining)} para a meta.`}</div></article>`;
 }).join('');
 updateCofreGoalFormAvailability();
}
function deleteCofreGoal(id){
 const goal=S.goals.find(g=>g.id===id);if(!goal)return;
 pendingDeleteCardId=null;pendingDeleteBoxId=null;pendingDeleteGoalId=id;
 $('#delete-confirm-title').textContent='Remover plano?';
 $('#delete-confirm-desc').textContent=`Deseja remover a meta de ${fmt(goal.target)}? Os baús e lançamentos associados serão preservados.`;
 $('#delete-confirm-yes').textContent='Sim, remover plano';$('#delete-confirm-no').textContent='Não, manter plano';
 const dialog=$('#delete-confirm');dialog.hidden=false;dialog.setAttribute('aria-hidden','false');document.body.classList.add('dialog-open');$('#delete-confirm-no').focus();
}

function addBox(e){
 e.preventDefault();const input=$('#cn'),n=input.value.trim();if(!n)return;
 if(S.boxes.some(b=>String(b.nome||'').trim().toLocaleLowerCase('pt-BR')===n.toLocaleLowerCase('pt-BR'))){input.setCustomValidity('Já existe um baú com esse nome.');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return}
 // Baús novos guardam apenas o nome; o saldo vem dos lançamentos pagos no Planejamento.
 S.boxes.push({id:uid(),nome:n,m0:S.m,saldo0:0,tipo:'manual',taxa:0});input.value='';fcr();R();
}
function delBox(id){
 const box=S.boxes.find(b=>b.id===id);if(!box)return;
 pendingDeleteCardId=null;pendingDeleteBoxId=id;
 const linked=S.tx.filter(t=>t.box===id||t.resgateBoxId===id).length;
 const linkedText=linked?(linked===1?' 1 lançamento associado a esse baú também será removido.':` ${linked} lançamentos associados a esse baú também serão removidos.`):'';
 $('#delete-confirm-title').textContent='Excluir baú?';
 $('#delete-confirm-desc').textContent=`Tem certeza de que deseja excluir o baú “${box.nome}”?${linkedText} Esta ação não pode ser desfeita.`;
 $('#delete-confirm-yes').textContent='Sim, excluir baú';$('#delete-confirm-no').textContent='Não, manter baú';
 const dialog=$('#delete-confirm');dialog.hidden=false;dialog.setAttribute('aria-hidden','false');document.body.classList.add('dialog-open');$('#delete-confirm-no').focus();
}
const mnav=()=>`<div class="mnv card cofre-month-switch cart-month-switch" style="padding:6px" aria-label="Mês do cartão de crédito"><button class="ib" type="button" onclick="mv(-1)" aria-label="Mês anterior do cartão">‹</button><b id="cart-active-month" aria-live="polite">${lab(S.m)}</b><button class="ib" type="button" onclick="mv(1)" aria-label="Próximo mês do cartão">›</button></div>`;
const cls=n=>n<0?'neg':'pos';
function lineSvg(ms,vals){const W=600,H=200,p=34,mx=Math.max(...vals,1),x=i=>p+(W-2*p)*(ms.length<2?.5:i/(ms.length-1)),y=v=>H-p-(H-2*p)*v/mx,pts=vals.map((v,i)=>x(i)+','+y(v));
 return `<svg viewBox="0 0 ${W} ${H}" class="cx-chart cx-line" role="img" aria-label="Evolução mensal do saldo guardado"><defs><linearGradient id="cx-line-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--chart-line)" stop-opacity=".32"/><stop offset="1" stop-color="var(--chart-line)" stop-opacity=".015"/></linearGradient></defs><path d="M${x(0)},${H-p} L${pts.join(' L')} L${x(vals.length-1)},${H-p}Z" fill="url(#cx-line-gradient)"/><polyline points="${pts.join(' ')}" fill="none" stroke="var(--pc)" stroke-width="2.8" stroke-linejoin="round"/>${vals.map((v,i)=>`<circle class="cx-point" data-chart-label="${esc(lab(ms[i]))}" data-chart-value="${esc(fmt(v))}" tabindex="0" role="button" aria-label="${esc(lab(ms[i]))}: ${esc(fmt(v))}" cx="${x(i)}" cy="${y(v)}" r="4.5" fill="var(--pc)"><title>${ml(ms[i])}: ${fmt(v)}</title></circle>`).join('')}<text x="${p}" y="${H-8}" class="ax">${ml(ms[0])}</text><text x="${W-p}" y="${H-8}" text-anchor="end" class="ax">${ml(ms[ms.length-1])}</text><text x="${p}" y="12" class="ax">${fmt(mx)}</text></svg><div class="chart-insight" aria-live="polite"><span class="chart-insight-rule"></span><div><small>Saldo guardado</small><b>${esc(lab(ms[ms.length-1]))}</b><strong>${fmt(vals[vals.length-1])}</strong></div></div>`}
function barSvg(ms,A,Rr){const W=600,H=200,p=34,mx=Math.max(...A.map((a,i)=>a+Rr[i]),1),bw=(W-2*p)/ms.length,y=v=>(H-2*p)*v/mx;
 return `<svg viewBox="0 0 ${W} ${H}" class="cx-chart cx-bars" role="img" aria-label="Aportes e rendimentos por mês">${ms.map((m,i)=>{const x=p+i*bw+bw*.15,w=bw*.7,ha=y(A[i]),hr=y(Rr[i]);return `<rect class="cx-bar" data-chart-label="${esc(lab(m))} · Aporte" data-chart-value="${esc(fmt(A[i]))}" tabindex="0" role="button" aria-label="${esc(lab(m))}, aporte ${esc(fmt(A[i]))}" x="${x}" y="${H-p-ha}" width="${w}" height="${Math.max(ha,1)}" rx="3" fill="var(--pc)"><title>${ml(m)} · aporte ${fmt(A[i])}</title></rect><rect class="cx-bar" data-chart-label="${esc(lab(m))} · Rendimento" data-chart-value="${esc(fmt(Rr[i]))}" tabindex="0" role="button" aria-label="${esc(lab(m))}, rendimento ${esc(fmt(Rr[i]))}" x="${x}" y="${H-p-ha-hr}" width="${w}" height="${Math.max(hr,1)}" rx="3" fill="var(--pa)"><title>${ml(m)} · rendimento ${fmt(Rr[i])}</title></rect>`}).join('')}<text x="${p}" y="${H-8}" class="ax">${ml(ms[0])}</text><text x="${W-p}" y="${H-8}" text-anchor="end" class="ax">${ml(ms[ms.length-1])}</text><text x="${p}" y="12" class="ax">${fmt(mx)}</text></svg><div class="lgd"><span><i style="background:var(--pc)"></i>Aporte</span><span><i style="background:var(--pa)"></i>Rendimento</span></div><div class="chart-insight" aria-live="polite"><span class="chart-insight-rule"></span><div><small>Selecione uma barra</small><b>Valor por mês</b><strong>Toque ou passe o cursor nos dados</strong></div></div>`}
function donut(it){const T=it.reduce((s,i)=>s+i.v,0)||1,C=2*Math.PI*60;let off=0;
 return `<svg viewBox="0 0 160 160" class="cx-chart cx-donut" role="img" aria-label="Composição do saldo dos baús"><g transform="rotate(-90 80 80)">${it.map((a,i)=>{const l=a.v/T*C,color=SPAL[i%SPAL.length],s=`<circle class="cx-slice" data-chart-label="${esc(a.n)}" data-chart-value="${esc(fmt(a.v)+' · '+(a.v/T*100).toFixed(1)+'%')}" tabindex="0" role="button" aria-label="${esc(a.n)}: ${esc(fmt(a.v))}" cx="80" cy="80" r="60" fill="none" stroke="${color}" stroke-width="22" stroke-dasharray="${l} ${C-l}" stroke-dashoffset="${-off}"><title>${esc(a.n)}: ${fmt(a.v)}</title></circle>`;off+=l;return s}).join('')}</g><text x="80" y="84" text-anchor="middle" class="ax" style="font-size:11px;fill:var(--tx)">${fmt(T)}</text></svg><div class="lgd">${it.map((a,i)=>`<button type="button" class="cx-legend-item" data-chart-label="${esc(a.n)}" data-chart-value="${esc(fmt(a.v)+' · '+(a.v/T*100).toFixed(1)+'%')}"><i style="background:${SPAL[i%SPAL.length]}"></i>${esc(a.n)} · ${(a.v/T*100).toFixed(0)}%</button>`).join('')}</div><div class="chart-insight" aria-live="polite"><span class="chart-insight-rule"></span><div><small>Composição dos baús</small><b>Saldo total</b><strong>${fmt(T)}</strong></div></div>`}
/* === GRÁFICOS DOS BAÚS ==================================================
   - Aporte usa --pc (cor global escolhida nas configurações).
   - Rendimento usa --ok (verde do tema), sem cores pretas fixas.
   - A pizza é composta por setores SVG sólidos; o setor ativo se expande e os
     demais ficam cinza para deixar o foco visual inequívoco.
============================================================================= */
/* Composição dos baús: donut interativo com transições iguais às usadas em Gastos. */
const CX_PIE_COLORS=['var(--pc)','var(--pa)','var(--ac2)','var(--ok)','color-mix(in srgb,var(--pc) 48%, #38bdf8)','color-mix(in srgb,var(--pa) 48%, #f59e0b)','color-mix(in srgb,var(--pc) 68%, #ec4899)'];
let cxPieSelected=null,cxPieData=[],cxBarSelected={index:0,type:'aporte'};
function cxMonthTotals(){
 const months=[];for(let offset=0;offset<12;offset++)months.push(shift(S.m,offset));
 return months.map(m=>{let aporte=0,rendimento=0;S.boxes.forEach(b=>{const {o}=bs(b,m,1),row=o.find(x=>x.m===m);if(row){aporte+=row.apo;rendimento+=row.rend}});return {m,aporte,rendimento}});
}
function cxSliceFill(index){return CX_PIE_COLORS[index%CX_PIE_COLORS.length]}
function cxPieCircle(item,index,share,total,offset){
 const C=2*Math.PI*62,len=share*C,gap=Math.min(3,Math.max(0,len*.2)),draw=Math.max(.15,len-gap),remainder=C-draw;
 const active=cxPieSelected===index,dim=cxPieSelected!==null&&!active,color=cxSliceFill(index);
 return `<circle class="cx-pie-slice ${active?'selected':''} ${dim?'dimmed':''}" data-pie-index="${index}" data-base-color="${color}" cx="90" cy="90" r="62" fill="none" stroke="${dim?'#c9cbd3':color}" stroke-width="${active?25:20}" stroke-dasharray="${draw} ${remainder}" stroke-dashoffset="${-offset}" stroke-linecap="round" opacity="${dim?'.48':'1'}" tabindex="0" role="button" aria-pressed="${active?'true':'false'}" aria-label="Selecionar ${esc(item.n)}" onclick="selectCxPie(${index})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCxPie(${index})}"><title>${esc(item.n)} · ${fmt(item.v)} · ${total?(share*100).toFixed(1):'0.0'}%</title></circle>`;
}
function renderCxCharts(){
 const root=$('#chs');if(!root)return;
 const series=cxMonthTotals(),W=760,H=244,left=20,right=18,top=16,base=H-34,innerW=W-left-right,innerH=base-top,bw=innerW/series.length;
 const max=Math.max(1,...series.map(x=>x.aporte+x.rendimento)),scale=innerH/max;
 const grid=[0,.5,1].map(t=>{const y=base-innerH*t;return `<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}" class="cx-gridline"/>`}).join('');
 const selectedIndex=Math.max(0,Math.min(series.length-1,cxBarSelected?.index??series.length-1));
 const selectedType=cxBarSelected?.type==='rendimento'?'rendimento':'aporte';cxBarSelected={index:selectedIndex,type:selectedType};
 const bars=series.map((x,i)=>{
  const barW=Math.min(27,bw*.58),xp=left+i*bw+(bw-barW)/2,ha=x.aporte*scale,hr=x.rendimento*scale,activeA=selectedIndex===i&&selectedType==='aporte',activeR=selectedIndex===i&&selectedType==='rendimento';
  const contribution=x.aporte>0?`<rect class="cx-bar ${activeA?'chart-active':''}" data-chart-type="aporte" x="${xp}" y="${base-ha}" width="${barW}" height="${Math.max(1,ha)}" rx="3" fill="var(--pc)" tabindex="0" role="button" aria-label="${esc(lab(x.m))}, aporte ${esc(fmt(x.aporte))}" onclick="selectCxBar(${i},'aporte')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCxBar(${i},'aporte')}"><title>${esc(lab(x.m))} · Aporte: ${fmt(x.aporte)}</title></rect>`:'';
  const yieldBar=x.rendimento>0?`<rect class="cx-bar ${activeR?'chart-active':''}" data-chart-type="rendimento" x="${xp}" y="${base-ha-hr}" width="${barW}" height="${Math.max(1,hr)}" rx="3" fill="var(--ok)" tabindex="0" role="button" aria-label="${esc(lab(x.m))}, rendimento ${esc(fmt(x.rendimento))}" onclick="selectCxBar(${i},'rendimento')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCxBar(${i},'rendimento')}"><title>${esc(lab(x.m))} · Rendimento: ${fmt(x.rendimento)}</title></rect>`:'';
  const label=(i%2===0||i===series.length-1)?`<text x="${xp+barW/2}" y="${H-9}" text-anchor="middle" class="ax">${ml(x.m)}</text>`:'';
  return `<g class="cx-month-bar">${contribution}${yieldBar}${label}</g>`;
 }).join('');
 const selectedSeries=series[selectedIndex],selectedValue=selectedSeries[selectedType];
 const insight=`<div class="cx-chart-insight" aria-live="polite"><span class="cx-chart-insight-dot ${selectedType}"></span><div><small>${selectedType==='aporte'?'Aporte':'Rendimento estimado'}</small><b>${esc(lab(selectedSeries.m))}</b></div><strong>${fmt(selectedValue)}</strong><span class="cx-chart-insight-hint">Clique em outra barra para comparar</span></div>`;
 cxPieData=S.boxes.map(b=>{const {o}=bs(b,S.m,1),last=o[o.length-1];return {id:b.id,n:b.nome,v:last&&last.m===S.m?last.bal:(+b.saldo0||0)}}).filter(x=>x.v>0);
 const total=cxPieData.reduce((a,x)=>a+x.v,0);if(cxPieSelected!==null&&cxPieSelected>=cxPieData.length)cxPieSelected=null;
 let offset=0;const pieSlices=cxPieData.map((item,i)=>{const share=total?item.v/total:0,html=cxPieCircle(item,i,share,total,offset);offset+=share*2*Math.PI*62;return html}).join('');
 const legend=cxPieData.map((item,i)=>{const active=cxPieSelected===i,dim=cxPieSelected!==null&&!active,color=dim?'#c9cbd3':cxSliceFill(i);return `<button type="button" class="cx-pie-item ${active?'selected':''} ${dim?'dimmed':''}" data-pie-legend-index="${i}" onclick="selectCxPie(${i})" aria-pressed="${active?'true':'false'}"><i style="background:${color}"></i><span>${esc(item.n)}</span><b>${total?(item.v/total*100).toFixed(1):'0.0'}%</b><small>${fmt(item.v)}</small></button>`}).join('');
 const active=cxPieSelected===null?null:cxPieData[cxPieSelected];
 root.innerHTML=`<div class="cx-charts-grid">
   <section class="card cx-chart-card cx-evolution-card" aria-labelledby="cx-evolution-title"><div class="cx-section-heading"><div><h2 id="cx-evolution-title">Evolução do saldo guardado</h2><p class="sub">Aportes planejados e rendimento estimado, do mês atual aos próximos 11 meses.</p></div><span class="cx-chart-tag">12 meses</span></div>
    <svg viewBox="0 0 ${W} ${H}" class="cx-monthly-bars" role="img" aria-label="Gráfico de barras de aportes e rendimentos, do mês atual aos próximos 11 meses"><g>${grid}</g><line x1="${left}" y1="${base}" x2="${W-right}" y2="${base}" class="cx-axis-line"/>${bars}</svg><div class="cx-chart-legend"><span><i class="cx-legend-contribution"></i>Aporte</span><span><i class="cx-legend-yield"></i>Rendimento</span></div>${insight}
   </section>
   <section class="card cx-chart-card cx-composition-card" aria-labelledby="cx-composition-title"><div class="cx-section-heading"><div><h2 id="cx-composition-title">Composição dos baús</h2><p class="sub">Toque em uma fatia para destacá-la.</p></div></div>
    ${cxPieData.length?`<div class="cx-composition-layout"><div class="cx-pie-wrap"><svg viewBox="0 0 180 180" class="cx-pie" role="group" aria-label="Gráfico circular da composição do saldo"><g transform="rotate(-90 90 90)">${pieSlices}</g><text x="90" y="84" text-anchor="middle" class="cx-pie-center-label">SALDO TOTAL</text><text x="90" y="103" text-anchor="middle" class="cx-pie-center-total">${fmt(total)}</text></svg></div><div class="cx-pie-legend">${legend}</div></div>`:`<div class="cx-empty">Crie um baú e guarde algum valor para visualizar a composição do saldo.</div>`}
    ${cxPieData.length?`<div class="cx-pie-selected" id="cx-pie-selected" aria-live="polite"><small>${active?'BAÚ EM DESTAQUE':'INTERAÇÃO'}</small><b id="cx-pie-selected-name">${active?esc(active.n):'Selecione uma fatia'}</b>${active?`<strong id="cx-pie-selected-value">${fmt(active.v)}</strong><span id="cx-pie-selected-pct">${total?(active.v/total*100).toFixed(1):'0.0'}% do saldo total</span>`:'<span id="cx-pie-selected-hint">Toque em uma fatia para ver saldo e percentual.</span>'}</div>`:''}
   </section></div>`;
}
function selectCxBar(index,type){cxBarSelected={index,type};renderCxCharts()}
function selectCxPie(index){
 if(!Number.isInteger(index)||index<0||index>=cxPieData.length)return;
 cxPieSelected=index;const total=cxPieData.reduce((sum,item)=>sum+item.v,0),item=cxPieData[index];
 document.querySelectorAll('#cx .cx-pie-slice').forEach((slice,i)=>{const active=i===index,baseColor=slice.dataset.baseColor;slice.classList.toggle('selected',active);slice.classList.toggle('dimmed',!active);slice.setAttribute('aria-pressed',String(active));slice.style.stroke=active?baseColor:'#c9cbd3';slice.style.strokeWidth=active?'25':'20';slice.style.opacity=active?'1':'.48';slice.style.filter=active?'drop-shadow(0 0 5px color-mix(in srgb,var(--pc) 48%,transparent))':'none'});
 document.querySelectorAll('#cx .cx-pie-item').forEach((row,i)=>{const active=i===index;row.classList.toggle('selected',active);row.classList.toggle('dimmed',!active);row.setAttribute('aria-pressed',String(active));const dot=row.querySelector('i');if(dot)dot.style.background=active?cxSliceFill(i):'#c9cbd3'});
 const summary=$('#cx-pie-selected');if(summary)summary.innerHTML=`<small>BAÚ EM DESTAQUE</small><b id="cx-pie-selected-name">${esc(item.n)}</b><strong id="cx-pie-selected-value">${fmt(item.v)}</strong><span id="cx-pie-selected-pct">${total?(item.v/total*100).toFixed(1):'0.0'}% do saldo total</span>`;
}

/* === MEU PLANO INTELIGENTE =================================================
   Preserva os valores digitados durante novos lançamentos e calcula o prazo sem
   supor rendimentos futuros, para não transformar projeção em promessa.
============================================================================= */
let cxGoalState={type:'Financiar uma casa',target:'',monthly:'',initialized:false};
function updateCxGoal(){
 const out=$('#cx-goal-result'),typeEl=$('#cx-goal-type'),targetEl=$('#cx-goal-target'),monthlyEl=$('#cx-goal-monthly');
 if(!out||!typeEl||!targetEl||!monthlyEl)return;
 cxGoalState.type=typeEl.value;cxGoalState.target=targetEl.value;cxGoalState.monthly=monthlyEl.value;
 const target=Number(targetEl.value),monthly=Number(monthlyEl.value);
 if(!(target>0&&monthly>0)){out.innerHTML='<span>Seu plano aparecerá aqui.</span><small>Informe o valor da meta e quanto pretende guardar por mês.</small>';return}
 const saved=S.boxes.reduce((sum,b)=>{const {o}=bs(b,S.m,1),last=o[o.length-1];return sum+(last&&last.m===S.m?last.bal:(+b.saldo0||0))},0);
 const remaining=Math.max(0,target-saved),months=Math.ceil(remaining/monthly),date=shift(S.m,months),goal=typeEl.value;
 if(remaining===0){out.innerHTML=`<b>Meta alcançada! 🎉</b><span>Seu saldo estimado de ${fmt(saved)} já cobre ${esc(goal.toLowerCase())}.</span><small>Confira se esse saldo está disponível para o objetivo escolhido.</small>`;return}
 const monthText=months===1?'1 mês':`${months} meses`;
 out.innerHTML=`<div class="cx-goal-result-top"><b>${monthText}</b><strong>${lab(date)}</strong></div><span>Guardando ${fmt(monthly)} por mês para ${esc(goal.toLowerCase())}, você pode alcançar sua meta neste período.</span><div class="cx-goal-progress"><i style="width:${Math.max(0,Math.min(100,saved/target*100)).toFixed(1)}%"></i></div><small>Saldo atual estimado: ${fmt(saved)} · Falta juntar ${fmt(remaining)}. Prazo calculado sem rendimento futuro.</small>`;
}

/* Accordion do formulário Planejar: animação suave e estado acessível no botão. */
function toggleCxPlan(){
 const panel=$('#cx-goal-disclosure'),button=$('#cx-plan-btn');if(!panel||!button)return;
 const opening=!panel.classList.contains('open');panel.classList.toggle('open',opening);button.classList.toggle('open',opening);
 button.setAttribute('aria-expanded',String(opening));panel.setAttribute('aria-hidden',String(!opening));
 if(opening){updateCxGoal();const first=panel.querySelector('select,input');if(first)first.focus({preventScroll:true});}
}

/* Os gráficos novos usam ações explícitas por barra/fatia; este inicializador fica por compatibilidade. */
function initCxChartInteractions(){return;}

/* Uma cor exclusiva para cada categoria fixa — sempre na mesma ordem arco-íris. */
const CATEGORY_COLORS={
 'contas':'#ef4444','comida':'#f97316','entretenimento':'#facc15',
 'saúde':'#22c55e','salário':'#3b82f6','imprevisto':'#6366f1','outros':'#a855f7',
 // Categoria agregada exclusiva para o gráfico Gastos do Planejamento; magenta-violeta não repete o arco-íris fixo.
 'cartão de crédito':'#c026d3'
};
const SPAL=['#ef4444','#f97316','#facc15','#22c55e','#3b82f6','#6366f1','#a855f7'];
function categoryColor(name){return CATEGORY_COLORS[String(name||'').trim().toLocaleLowerCase('pt-BR')]||'#94a3b8'}
let spendSelected=0;
function spendPick(i){spendSelected=i;renderSpend()}
function renderSpend(){
 const el=$('#spend-content');if(!el)return;
 const rows=S.tx.filter(t=>t.m===S.m&&t.tipo==='despesa').reduce((a,t)=>{const name=(t.cat||'Sem categoria').trim()||'Sem categoria';const val=Math.abs(+t.pago||+t.plan||0);if(val){a[name]=(a[name]||0)+val}return a},{});
 // Inclui a fatura corrente como categoria agregada, sem duplicar nas despesas manuais: cartões são guardados em S.cc/S.cards, não em S.tx.
 const cardSpend=S.cards.reduce((total,card)=>total+fat(card.id,S.m),0);
 if(cardSpend>0)rows['Cartão de crédito']=(rows['Cartão de crédito']||0)+cardSpend;
 const data=Object.entries(rows).map(([n,v])=>({n,v,color:categoryColor(n)})).sort((a,b)=>b.v-a.v),total=data.reduce((a,x)=>a+x.v,0);
 if(!data.length){el.innerHTML='<div class="em">Ainda não há despesas com valores neste mês. Adicione despesas e selecione uma categoria na tabela para ver a análise.</div>';return}
 spendSelected=Math.min(spendSelected,data.length-1);const selected=data[spendSelected],pct=x=>total?x.v/total*100:0;
 const bars=data.map((x,i)=>`<button type="button" class="spend-row ${i===spendSelected?'active':''}" onclick="spendPick(${i})"><span class="spend-dot" style="--spc:${x.color};background:${x.color}"></span><span class="spend-name">${esc(x.n)}</span><span class="spend-track"><i style="width:${pct(x).toFixed(2)}%;--spc:${x.color};background:${x.color}"></i></span><b>${pct(x).toFixed(1)}%</b><small>${fmt(x.v)}</small></button>`).join('');
 let off=0;const C=2*Math.PI*62;
 const donut=data.map((x,i)=>{const len=pct(x)/100*C,active=i===spendSelected;const out=`<circle class="spend-slice ${active?'active':''}" data-index="${i}" cx="90" cy="90" r="62" fill="none" stroke="${x.color}" stroke-width="${active?24:20}" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" tabindex="0" role="button" aria-label="Selecionar ${esc(x.n)}" onclick="spendPick(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();spendPick(${i})}"><title>${esc(x.n)} · ${pct(x).toFixed(1)}%</title></circle>`;off+=len;return out}).join('');
 el.innerHTML=`<div class="spend-layout"><div class="spend-bars"><div class="spend-selected"><span class="spend-rule" style="--spc:${selected.color};background:${selected.color}"></span><div><small>Categoria em destaque</small><h3>${esc(selected.n)}</h3><b>${pct(selected).toFixed(1)}%</b><span>${fmt(selected.v)} de ${fmt(total)}</span></div></div>${bars}</div><div class="spend-donut"><svg viewBox="0 0 180 180" role="img" aria-label="Distribuição percentual dos gastos por categoria"><g transform="rotate(-90 90 90)">${donut}</g><text x="90" y="86" text-anchor="middle" class="ax" style="font-size:10px">TOTAL</text><text x="90" y="103" text-anchor="middle" style="fill:var(--tx);font-size:12px;font-weight:800">${fmt(total)}</text></svg><div class="spend-selected-mini"><span class="spend-dot" style="--spc:${selected.color};background:${selected.color}"></span><b>${esc(selected.n)}</b><span>${pct(selected).toFixed(1)}%</span></div></div></div>`;
}
/* === GASTOS NO CARTÃO =======================================================
   Agrupa a parcela de cada compra pela categoria escolhida no lançamento.
============================================================================= */
let cartSpendSelected=0;
function cartSpendPick(i){cartSpendSelected=i;renderCartSpend()}
function renderCartSpend(){
 const el=$('#cart-spend-content');if(!el)return;
 const grouped={};
 S.cc.forEach(purchase=>{
  const installmentIndex=mdiff(purchase.m0,S.m);if(installmentIndex<0||installmentIndex>=purchase.parc)return;
  const category=DEF.find(c=>c.toLocaleLowerCase('pt-BR')===String(purchase.cat||'Outros').trim().toLocaleLowerCase('pt-BR'))||'Outros';
  const value=pr(purchase,installmentIndex);if(value>0)grouped[category]=(grouped[category]||0)+value;
 });
 const data=Object.entries(grouped).map(([n,v])=>({n,v,color:categoryColor(n)})).sort((a,b)=>b.v-a.v),total=data.reduce((a,x)=>a+x.v,0);
 if(!data.length){el.innerHTML='<div class="em">Ainda não há parcelas de compras nesta fatura. Lance uma compra e escolha a categoria para acompanhar os gastos.</div>';return}
 cartSpendSelected=Math.min(cartSpendSelected,data.length-1);const selected=data[cartSpendSelected],pct=x=>total?x.v/total*100:0;
 const rows=data.map((x,i)=>`<button type="button" class="spend-row ${i===cartSpendSelected?'active':''}" onclick="cartSpendPick(${i})"><span class="spend-dot" style="--spc:${x.color};background:${x.color}"></span><span class="spend-name">${esc(x.n)}</span><span class="spend-track"><i style="width:${pct(x).toFixed(2)}%;--spc:${x.color};background:${x.color}"></i></span><b>${pct(x).toFixed(1)}%</b><small>${fmt(x.v)}</small></button>`).join('');
 let offset=0;const C=2*Math.PI*62;
 const slices=data.map((x,i)=>{const len=pct(x)/100*C,active=i===cartSpendSelected;const html=`<circle class="spend-slice ${active?'active':''}" cx="90" cy="90" r="62" fill="none" stroke="${x.color}" stroke-width="${active?24:20}" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-offset}" tabindex="0" role="button" aria-label="Selecionar ${esc(x.n)}" onclick="cartSpendPick(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();cartSpendPick(${i})}"><title>${esc(x.n)} · ${pct(x).toFixed(1)}% · ${fmt(x.v)}</title></circle>`;offset+=len;return html}).join('');
 el.innerHTML=`<div class="spend-layout"><div class="spend-bars"><div class="spend-selected"><span class="spend-rule" style="--spc:${selected.color};background:${selected.color}"></span><div><small>Categoria em destaque</small><h3>${esc(selected.n)}</h3><b>${pct(selected).toFixed(1)}%</b><span>${fmt(selected.v)} de ${fmt(total)}</span></div></div>${rows}</div><div class="spend-donut"><svg viewBox="0 0 180 180" role="img" aria-label="Distribuição de gastos no cartão por categoria"><g transform="rotate(-90 90 90)">${slices}</g><text x="90" y="86" text-anchor="middle" class="ax" style="font-size:10px">FATURA</text><text x="90" y="103" text-anchor="middle" style="fill:var(--tx);font-size:12px;font-weight:800">${fmt(total)}</text></svg><div class="spend-selected-mini"><span class="spend-dot" style="--spc:${selected.color};background:${selected.color}"></span><b>${esc(selected.n)}</b><span>${pct(selected).toFixed(1)}%</span></div></div></div>`;
}
function toggleCartSpend(){const panel=$('#cart-spend-fx'),button=$('#cart-spend-btn');if(!panel||!button)return;const opening=!panel.classList.contains('open');panel.classList.toggle('open',opening);button.setAttribute('aria-expanded',String(opening));if(opening)renderCartSpend()}

function toggleSpend(){const x=$('#spend-fx'),o=!x.classList.contains('open');x.classList.toggle('open',o);$('#spend-btn').setAttribute('aria-expanded',String(o));if(o)renderSpend()}

function toggleYieldInfo(btn){const pop=btn.closest('.yield-stat')?.querySelector('.yield-info-pop');if(!pop)return;const opening=pop.hidden;pop.hidden=!opening;btn.setAttribute('aria-expanded',String(opening));}


function renderCofreBoxList(){
 const host=$('#bx');if(!host)return;
 if(!S.boxes.length){host.innerHTML='<div class="cofre-empty"><span aria-hidden="true"><img src="./trama-bau-flaticon.png" alt="" width="58" height="58" loading="lazy"></span><b>Nenhum baú criado ainda</b><p>Use “Criar baú” para começar e depois associe-o aos lançamentos “Guardar” do Planejamento.</p></div>';return;}
 host.innerHTML=S.boxes.map(box=>{
  const accumulated=cofreBoxSaved(box,S.m);
  return `<article class="cofre-box-row" data-cofre-box-id="${esc(box.id)}"><button type="button" class="cofre-box-summary" onclick="openCofreResgate('${box.id}')" aria-label="Abrir baú ${esc(box.nome)} e consultar resgate"><span class="cofre-box-name"><b>${esc(box.nome)}</b><small>Toque para consultar e resgatar</small></span><span class="cofre-box-amount"><strong>${fmt(accumulated)}</strong><small>Saldo disponível</small></span></button><button type="button" class="x cofre-box-delete" onclick="delBox('${box.id}')" aria-label="Excluir baú ${esc(box.nome)}" title="Excluir baú">✕</button></article>`;
 }).join('');
}

function clearCofreResgateFeedback(){
 const feedback=$('#cofre-resgate-feedback');if(feedback){feedback.hidden=true;feedback.textContent=''}
}
function showCofreResgateFeedback(message){
 const feedback=$('#cofre-resgate-feedback');if(feedback){feedback.textContent=message;feedback.hidden=false}
}
function openCofreResgate(boxId){
 const box=S.boxes.find(b=>b.id===boxId),modal=$('#cofre-resgate-modal');
 if(!box||!modal)return;
 activeCofreResgateBoxId=box.id;
 const balance=Math.round(cofreBoxSaved(box,S.m)*100)/100;
 $('#cofre-resgate-title').textContent='Resgatar do baú';
 $('#cofre-resgate-box-name').textContent=box.nome;
 $('#cofre-resgate-balance-value').textContent=fmt(balance);
 const amountInput=$('#cofre-resgate-amount');
 if(amountInput){amountInput.value='';amountInput.max=String(balance);amountInput.placeholder=balance>0?'Ex.: 150,00':'Sem saldo disponível';amountInput.disabled=balance<=0;}
 const amountHelp=$('#cofre-resgate-amount-help');if(amountHelp)amountHelp.textContent=`Você pode resgatar até ${fmt(balance)}.`;
 const submit=$('#cofre-resgate-submit');
 if(submit){submit.disabled=balance<=0;submit.textContent='Resgatar'}
 clearCofreResgateFeedback();
 modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('cofre-resgate-modal-open');
 requestAnimationFrame(()=>$('#cofre-resgate-amount')?.focus());
}
function closeCofreResgateModal(restoreFocus=false){
 const modal=$('#cofre-resgate-modal');if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true')}
 document.body.classList.remove('cofre-resgate-modal-open');
 const id=activeCofreResgateBoxId;activeCofreResgateBoxId=null;
 if(restoreFocus&&id){const row=Array.from(document.querySelectorAll('#bx [data-cofre-box-id]')).find(el=>el.dataset.cofreBoxId===id);row?.querySelector('.cofre-box-summary')?.focus()}
}
function confirmCofreResgate(){
 const box=S.boxes.find(b=>b.id===activeCofreResgateBoxId);if(!box){closeCofreResgateModal();return}
 const balance=Math.round(cofreBoxSaved(box,S.m)*100)/100;
 const raw=$('#cofre-resgate-amount')?.value||'';
 const parsed=pv(raw);
 if(!(Number.isFinite(parsed)&&parsed>0)){
  showCofreResgateFeedback('Informe um valor maior que zero para resgatar.');
  $('#cofre-resgate-amount')?.focus();return;
 }
 const amount=Math.round(parsed*100)/100;
 if(!(amount>0)){
  showCofreResgateFeedback('O valor do resgate deve ser de pelo menos R$ 0,01.');
  $('#cofre-resgate-amount')?.focus();return;
 }
 if(amount>balance){
  showCofreResgateFeedback(`O valor informado não pode ser maior que o saldo disponível (${fmt(balance)}).`);
  $('#cofre-resgate-amount')?.focus();return;
 }
 // O resgate vira uma receita paga e deduz somente o valor solicitado do saldo do baú.
 S.tx.push({id:uid(),m:S.m,desc:'Resgatado',tipo:'receita',cat:'Outros',box:null,plan:amount,pago:amount,resgateBoxId:box.id,resgateBoxName:box.nome});
 planGroupOpen.ganhei=true;
 closeCofreResgateModal();R();msg(`${fmt(amount)} resgatados de “${box.nome}” para Ganhei.`);
}
function returnCofreResgate(id){
 const t=S.tx.find(x=>x.id===id&&x.resgateBoxId&&x.tipo==='receita');if(!t||t.resgateDevolvido)return;
 const box=S.boxes.find(b=>b.id===t.resgateBoxId);if(!box){msg('O baú relacionado não foi encontrado. Não foi possível devolver o valor.',1);return}
 const amount=Math.round((+t.pago||+t.plan||0)*100)/100;if(!(amount>0))return;
 // Mantém o resgate original em Ganhei e cria um depósito compensatório em Guardei.
 // Assim, a receita e o aporte de retorno se anulam no saldo principal e no baú.
 t.resgateDevolvido=true;
 S.tx.push({id:uid(),m:t.m,desc:box.nome,tipo:'guardar',cat:'',box:box.id,plan:amount,pago:amount,resgateReturnOf:t.id});
 planGroupOpen.ganhei=true;planGroupOpen.guardei=true;
 R();msg(`${fmt(amount)} devolvidos ao baú “${box.nome}”.`);
}

function togglePlanGroup(key){
 if(!(key in planGroupOpen))return;
 const opening=!planGroupOpen[key];
 planGroupOpen[key]=opening;
 const button=Array.from(document.querySelectorAll('#tb .plan-group-toggle'))
  .find(el=>el.getAttribute('aria-controls')===`plan-group-panel-${key}`);
 const section=button?.closest('.plan-group');
 const panel=button?document.getElementById(button.getAttribute('aria-controls')):null;
 if(!button||!section||!panel){R();return;}
 // Evita que o cabeçalho pareça selecionado após o clique enquanto o cursor
 // permanece sobre ele. O hover volta ao normal assim que o ponteiro sair do grupo.
 if(button.matches(':hover')){
  section.classList.add('plan-group--suppress-hover');
  section.onpointerleave=()=>{
   section.classList.remove('plan-group--suppress-hover');
   section.onpointerleave=null;
  };
 }else{
  section.classList.remove('plan-group--suppress-hover');
  section.onpointerleave=null;
 }
 button.setAttribute('aria-expanded',String(opening));
 section.classList.toggle('is-open',opening);
 const previousHandler=planGroupMotionHandlers.get(panel);
 if(previousHandler)panel.removeEventListener('transitionend',previousHandler);
 const reduceMotion=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 if(reduceMotion){
  panel.hidden=!opening;
  panel.style.height='';panel.style.opacity='';panel.style.overflow='';panel.style.transition='';
  return;
 }
 panel.hidden=false;
 panel.style.boxSizing='border-box';
 panel.style.overflow='hidden';
 panel.style.transition='none';
 if(opening){
  panel.style.height='0px';
  panel.style.opacity='0';
  void panel.offsetHeight;
  const targetHeight=panel.scrollHeight;
  const finish=event=>{
   if(event.target!==panel||event.propertyName!=='height')return;
   if(planGroupOpen[key])panel.style.height='auto';
   panel.style.overflow='';panel.style.opacity='';panel.style.transition='';
   panel.removeEventListener('transitionend',finish);planGroupMotionHandlers.delete(panel);
  };
  planGroupMotionHandlers.set(panel,finish);
  panel.addEventListener('transitionend',finish);
  panel.style.transition='height 240ms cubic-bezier(.2,.72,.28,1), opacity 190ms ease';
  panel.style.height=`${targetHeight}px`;
  panel.style.opacity='1';
 }else{
  panel.style.height=`${panel.scrollHeight}px`;
  panel.style.opacity='1';
  void panel.offsetHeight;
  const finish=event=>{
   if(event.target!==panel||event.propertyName!=='height')return;
   if(!planGroupOpen[key])panel.hidden=true;
   panel.style.height='';panel.style.overflow='';panel.style.opacity='';panel.style.transition='';
   panel.removeEventListener('transitionend',finish);planGroupMotionHandlers.delete(panel);
  };
  planGroupMotionHandlers.set(panel,finish);
  panel.addEventListener('transitionend',finish);
  panel.style.transition='height 220ms cubic-bezier(.2,.72,.28,1), opacity 170ms ease';
  panel.style.height='0px';
  panel.style.opacity='0';
 }
}
function R(){
 updatePlanGreeting();
 const L=tm(S.m),o=S.ov[S.m]||{},CM=cardsM(S.m);
 const expenseRows=L.filter(t=>t.tipo==='despesa'),incomeRows=L.filter(t=>t.tipo==='receita'),savingRows=L.filter(t=>t.tipo==='guardar');
 const fmtCount=n=>`${n} ${n===1?'lançamento':'lançamentos'}`;
 const renderTransaction=(t,tp)=>{
  const sign=tp==='receita'?1:-1,c=tp==='receita'?'pos':tp==='despesa'?'neg':'gu';
  const isResgate=tp==='receita'&&!!t.resgateBoxId;
  const isRetorno=tp==='guardar'&&!!t.resgateReturnOf;
  const boxName=isResgate?(t.resgateBoxName||(S.boxes.find(b=>b.id===t.resgateBoxId)||{nome:'Baú não encontrado'}).nome):(S.boxes.find(b=>b.id===t.box)||{nome:'Baú não encontrado'}).nome;
  const rowLabel=tp==='guardar'?boxName:(t.cat||'Sem categoria');
  let descriptionCell;
  if(isResgate){
   descriptionCell=`<span class="resgate-launch-title">Resgatado</span><small class="row-cat-label">${esc(boxName)}</small>${t.resgateDevolvido?'<small class="resgate-returned-status">Valor devolvido ao baú</small>':`<button type="button" class="plan-resgate-return" onclick="returnCofreResgate('${t.id}')" aria-label="Guardar de volta no baú ${esc(boxName)}">Guardar</button>`}`;
  }else if(tp==='guardar'){
   descriptionCell=`<span class="guard-box-name">${esc(rowLabel)}</span><small class="row-cat-label">${isRetorno?'Valor devolvido após resgate':'Baú selecionado'}</small>`;
  }else{
   descriptionCell=`<input class="desc-fit" value="${esc(t.desc)}" style="font-size:${Math.max(10,14-Math.max(0,String(t.desc||'').length-18)*.22)}px" onchange="ed('${t.id}','desc',this.value)"><small class="row-cat-label">${esc(rowLabel)}</small>`;
  }
  const dueLine=tp==='despesa'&&t.dueDate?`<small class="plan-due-line${t.reminder?' is-reminder':''}">${t.reminder?'◷ Lembrete':'Vencimento'}: ${formatPurchaseDate(t.dueDate)}${t.reminder&&t.reminderChannel==='browser'?' · navegador':''}</small>`:'';
  const lockValue=(isResgate||isRetorno)?' readonly tabindex="-1" aria-readonly="true"':'';
  const copyControl=(isResgate||isRetorno)?'':'<button type="button" class="cp" onclick="cpy(\''+t.id+'\',this)" title="Preencher o Pago com o valor planejado" aria-label="Copiar planejado para pago"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"/></svg></button>';
  return `<article class="plan-launch-row${tp==='receita'?' plan-launch-row--income':''}${isResgate?' plan-launch-row--resgate':''}${isRetorno?' plan-launch-row--resgate-return':''}"><div class="plan-launch-description">${descriptionCell}${dueLine}</div><div class="plan-launch-plan"><input class="v ${c}" value="${dv(t.plan,sign)}" placeholder="0,00"${lockValue} aria-label="${esc(t.desc||rowLabel)} — planejado" onchange="ed('${t.id}','plan',this.value)"></div><div class="plan-launch-copy">${copyControl}</div><div class="plan-launch-paid"><input class="v ${c}" value="${dv(t.pago,sign)}" placeholder="0,00"${lockValue} aria-label="${esc(t.desc||rowLabel)} — pago" onchange="ed('${t.id}','pago',this.value)"></div><div class="plan-launch-delete"><button class="x" onclick="del('${t.id}')" aria-label="Excluir lançamento">✕</button></div></article>`;
 };
 const renderCardTransaction=x=>`<article class="plan-launch-row plan-launch-row--card"><div class="plan-launch-description"><div class="plan-card-desc"><strong>Cartão de crédito</strong><small>${esc(x.c.nome)} · fatura automática</small></div></div><div class="plan-launch-plan"><input class="v neg" readonly tabindex="-1" value="${dv(x.f,-1)}" aria-label="Fatura planejada de ${esc(x.c.nome)}"></div><div class="plan-launch-copy"><button type="button" class="cp" onclick="cpc('${x.c.id}',this)" title="Preencher o Pago com o valor da fatura" aria-label="Copiar planejado para pago"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"/></svg></button></div><div class="plan-launch-paid"><input class="v neg" value="${dv(x.p,-1)}" placeholder="0,00" onchange="ccpay('${x.c.id}',this.value)" aria-label="Fatura paga de ${esc(x.c.nome)}"></div><div class="plan-launch-delete" aria-hidden="true"></div></article>`;
 const renderLaunchList=(rows,type,extraRows=[])=>{
  if(!rows.length&&!extraRows.length)return '<div class="plan-group-empty">Nenhum lançamento nesta categoria para este mês.</div>';
  return `<div class="plan-launch-list">${rows.map(t=>renderTransaction(t,type)).join('')}${extraRows.join('')}</div>`;
 };
 const incomePlan=sum(incomeRows,'plan'),incomePaid=sum(incomeRows,'pago');
 const expensePlan=sum(expenseRows,'plan')+sum(CM,'f'),expensePaid=sum(expenseRows,'pago')+sum(CM,'p');
 const savingPlan=sum(savingRows,'plan'),savingPaid=sum(savingRows,'pago');
 const cardRows=CM.map(renderCardTransaction);
 const groups=[
  {key:'ganhei',label:'Ganhei',tone:'income',count:incomeRows.length,planned:incomePlan,paid:incomePaid,body:renderLaunchList(incomeRows,'receita')},
  {key:'gastei',label:'Gastei',tone:'expense',count:expenseRows.length+CM.length,planned:expensePlan,paid:expensePaid,body:renderLaunchList(expenseRows,'despesa',cardRows)},
  {key:'guardei',label:'Guardei',tone:'saved',count:savingRows.length,planned:savingPlan,paid:savingPaid,body:renderLaunchList(savingRows,'guardar')}
 ];
 let h=`<div class="nh"><button class="ar" onclick="mv(-1)" aria-label="Mês anterior">‹</button><div class="nt">${lab(S.m)}</div><button class="ar" onclick="mv(1)" aria-label="Próximo mês">›</button></div>`;
 h+=`<div class="plan-balance-row"><div class="plan-balance-title"><span>Saldo anterior</span><small>Valor que veio do mês anterior</small></div><label><small>Planejado</small><input class="v" aria-label="Saldo anterior planejado" value="${o.plan!=null?dv(Math.abs(o.plan),Math.sign(o.plan)):''}" placeholder="${dv(Math.abs(ant(S.m,'plan'))||0.001,Math.sign(ant(S.m,'plan'))||1)||'0,00'}" onchange="ovs('plan',this.value)"></label><label><small>Pago</small><input class="v" aria-label="Saldo anterior pago" value="${o.pago!=null?dv(Math.abs(o.pago),Math.sign(o.pago)):''}" placeholder="${dv(Math.abs(ant(S.m,'pago'))||0.001,Math.sign(ant(S.m,'pago'))||1)||'0,00'}" onchange="ovs('pago',this.value)"></label></div>`;
 h+='<div class="plan-accordion" aria-label="Lançamentos do mês">';
 groups.forEach(g=>{
  const isOpen=!!planGroupOpen[g.key];
  h+=`<section class="plan-group plan-group--${g.tone}${isOpen?' is-open':''}"><button type="button" class="plan-group-toggle" onclick="togglePlanGroup('${g.key}')" aria-expanded="${isOpen?'true':'false'}" aria-controls="plan-group-panel-${g.key}"><span class="plan-group-title"><strong>${g.label}</strong><small>${fmtCount(g.count)}</small></span><span class="plan-group-values"><span><small>Planejado</small><b>${fmt(g.planned)}</b></span><span><small>Pago</small><b>${fmt(g.paid)}</b></span></span></button><div id="plan-group-panel-${g.key}" class="plan-group-panel" ${isOpen?'':'hidden'}>${g.body}</div></section>`;
 });
 h+='</div>';
 const totalPlan=tot(S.m,'plan'),totalPaid=tot(S.m,'pago');
 h+=`<div class="plan-total-summary"><div class="plan-total-label"><span>Total do mês</span><small>Saldo após os lançamentos</small></div><div><small>Planejado</small><strong class="${cls(totalPlan)}">${fmt(totalPlan)}</strong></div><div><small>Pago</small><strong class="${cls(totalPaid)}">${fmt(totalPaid)}</strong></div></div>`;
 $('#tb').innerHTML=h;
 $('#cats').innerHTML=activeCategories().map(c=>`<option value="${esc(c)}">`).join('');
 // Cofre: os valores exibidos são pagos, sem juros ou rendimentos estimados.
 // Atualiza o seletor mensal junto ao gráfico; a navegação continua sincronizada com S.m.
 const cofreMonthLabel=$('#cofre-active-month');if(cofreMonthLabel)cofreMonthLabel.textContent=lab(S.m);
 renderCofreBoxList();
 renderCofreChart();
 refreshCofreGoalBoxSelect();updateCofreGoalPreview();renderSavedCofreGoals();
 // cartao
 $('#n4').innerHTML=mnav();
 const fT=CM.reduce((a,x)=>a+x.f,0),pT=CM.reduce((a,x)=>a+x.p,0);let rest=0;S.cc.forEach(x=>{for(let j=Math.max(mdiff(x.m0,S.m)+1,0);j<x.parc;j++)rest+=pr(x,j)});
 $('#kc').innerHTML=`<article class="st card-stat card-stat--planned"><small>Fatura do mês</small><b class="neg">${fmt(fT)}</b><i>planejada</i></article><article class="st card-stat card-stat--paid"><small>Pago no mês</small><b>${fmt(pT)}</b><i>marcado no planejamento</i></article><article class="st card-stat card-stat--future"><small>Parcelas futuras</small><b>${fmt(rest)}</b><i>depois deste mês</i></article>`;
 $('#kcs').innerHTML=S.cards.map(c=>{
  const f=fat(c.id,S.m),p=+S.ccp[c.id+'|'+S.m]||0,w=f>0?Math.min(100,p/f*100):0,palette=cardPaletteForColor(c.cor);
  return `<div class="cv skin-${String(c.cor||'ultravioleta').replace(/[^a-z0-9-]/gi,'')}${c.id===selectedCardId?' selected':''}" data-card-id="${c.id}" role="button" tabindex="0" aria-pressed="${c.id===selectedCardId?'true':'false'}" onclick="selectCard('${c.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCard('${c.id}') }" style="--card-pc:${palette.pc};--card-pl:${palette.pl};--card-pd:${palette.pd};--card-accent:${palette.ac2}"><div class="top"><span class="chip" aria-hidden="true"><i></i></span><button type="button" class="card-delete" onclick="event.stopPropagation();delCard('${c.id}')" aria-label="Excluir cartão ${esc(c.nome)}" title="Excluir cartão">✕</button></div><div><div class="lb">Fatura de ${lab(S.m).toLowerCase()}</div><div class="vl">${fmt(f)}</div><div class="pg"><i style="width:${w}%"></i></div><div class="lb" style="margin-top:6px;letter-spacing:.06em">pago ${fmt(p)}</div></div><div class="nm">${esc(c.nome)}<small class="card-bank">${esc(c.banco||'Banco não informado')}</small></div></div>`;
}).join('')+(S.cards.length>=3?`<div class="cn card-limit"><span class="lb">Limite atingido</span><p class="sub" style="margin:6px 0 0">Você já cadastrou 3 cartões no total. Exclua um cartão para adicionar outro.</p></div>`:`<button class="cn card-create-trigger${S.cards.length===0?' card-create-trigger--solo':''}" type="button" onclick="openCardModal()" aria-label="Criar cartão de crédito"><span class="card-create-plus" aria-hidden="true">＋</span><strong>Criar cartão</strong><span class="card-create-copy">Adicione um cartão e personalize o acabamento</span><span class="card-create-limit">Até 3 cartões no total</span></button>`);
 const kv=$('#kcd').value;$('#kcd').innerHTML=S.cards.length?S.cards.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join(''):'<option value="">Crie um cartão acima</option>';if(S.cards.some(c=>c.id===kv))$('#kcd').value=kv;
 if(!$('#km').value)$('#km').value=S.m;
 $('#kg').innerHTML=kgr();
 const hf=$('#hf'),hv=hf.value;hf.innerHTML='<option value="">Todos os cartões</option>'+S.cards.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('');if(S.cards.some(c=>c.id===hv))hf.value=hv;
 const HL=S.cc.filter(x=>!hf.value||x.card===hf.value);
 $('#hct').textContent=S.cc.length?'· '+S.cc.length+(S.cc.length>1?' compras':' compra'):'';
 $('#ka').innerHTML=HL.length?'<table><thead><tr><th>Descrição</th><th>Categoria</th><th>Cartão</th><th style="text-align:right">Total</th><th>Parcelas</th><th>Registrada em</th><th>1ª fatura</th><th></th></tr></thead><tbody>'+HL.map(x=>{const c=S.cards.find(c=>c.id===x.card);return `<tr><td>${esc(x.desc)}</td><td>${esc(x.cat||'Outros')}</td><td>${esc(c?c.nome:'')}</td><td style="text-align:right">${fmt(x.total)}</td><td>${x.parc}x de ${fmt(pr(x,0))}</td><td>${formatPurchaseDate(x.date)}</td><td>${lab(x.m0)}</td><td><button class="x" onclick="delCc('${x.id}')" aria-label="Excluir">✕</button></td></tr>`}).join('')+'</tbody></table>':'<div class="em">Nenhuma compra no histórico.</div>';
 // Atualiza os dois painéis de gastos por categoria.
 renderSpend();renderCartSpend();
 document.documentElement.dataset.theme=S.theme;thi();applyCor();save();checkDueReminders()}
document.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height),d=document.createElement('span');d.className='rp';d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.appendChild(d);setTimeout(()=>d.remove(),650)});
// O carrossel Guardado foi removido do Cofre; não registrar handlers para elementos ausentes.
// Inicialização principal: a estrutura da aba Baús está definida no HTML, sem mover painéis via JS.
setGlass(S.glass);fcr();R();go('plan');stat('local');






/* Delegated handlers work even though the confirmation dialog markup follows this script. */
document.addEventListener('click',e=>{
 const yes=e.target.closest('#delete-confirm-yes');
 const no=e.target.closest('#delete-confirm-no');
 if(yes){e.preventDefault();confirmDeleteCard();return}
 if(no){e.preventDefault();closeDeleteConfirm();return}
 if(e.target.id==='delete-confirm')closeDeleteConfirm();
});
document.addEventListener('keydown',e=>{
 const dialog=$('#delete-confirm');
 if(e.key==='Escape' && dialog && !dialog.hidden)closeDeleteConfirm();
});


/* Interação 3D muito sutil: somente enquanto segura com mouse; toque e teclado permanecem intactos. */
(()=>{
 let activeCard=null;
 const resetTilt=()=>{
  if(!activeCard)return;
  activeCard.classList.remove('tilting');
  activeCard.style.removeProperty('transform');
  activeCard=null;
 };
 document.addEventListener('pointerdown',e=>{
  const card=e.target.closest('#kcs .cv');
  if(!card||e.pointerType!=='mouse'||e.button!==0||e.target.closest('button'))return;
  resetTilt();activeCard=card;card.classList.add('tilting');
 });
 document.addEventListener('pointermove',e=>{
  if(!activeCard||e.pointerType!=='mouse'||!(e.buttons&1))return;
  const r=activeCard.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const nx=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
  const ny=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
  const lift=activeCard.classList.contains('selected')?-3:-2;
  activeCard.style.transform=`perspective(900px) translateY(${lift}px) rotateX(${-ny*2.2}deg) rotateY(${nx*2.2}deg) scale(1.012)`;
 });
 document.addEventListener('pointerup',resetTilt);
 document.addEventListener('pointercancel',resetTilt);
 window.addEventListener('blur',resetTilt);
})();

// A tecla Escape fecha a janela de criação sem alterar os dados atuais.
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const goalsModal=document.querySelector('#cofre-goals-modal');if(goalsModal&&!goalsModal.hidden)closeCofreGoalsModal(true);const resgateModal=document.querySelector('#cofre-resgate-modal');if(resgateModal&&!resgateModal.hidden)closeCofreResgateModal(true);const modal=document.querySelector('#card-modal');if(modal&&!modal.hidden)closeCardModal();const profile=document.querySelector('#profile-modal');if(profile&&!profile.hidden)closeProfile();const setup=document.querySelector('#setup-overlay');if(setup&&!setup.hidden&& !pendingRegistration)closeSetupOverlay();}});


/* ── Entrada da Trama: protótipo visual do cadastro/login, antes de ligar ao provedor de autenticação. ── */
function toggleAuthPassword(id,button){const input=$('#'+id);if(!input)return;const visible=input.type==='password';input.type=visible?'text':'password';button.setAttribute('aria-label',visible?'Ocultar senha':'Mostrar senha');button.classList.toggle('is-visible',visible)}
let pendingRegistration=null,authSetupFinished=false; // Senhas nunca são persistidas no navegador.
let setupCurrentStep=1,setupPalette='azul',setupColorMode='preset',setupCustomColor='#7276E9';
function setAuthMode(mode){
 const register=mode==='register',access=$('.auth-access-card');
 const overlay=$('#setup-overlay');if(overlay){overlay.hidden=true;overlay.setAttribute('aria-hidden','true')}
 access?.classList.remove('auth-onboarding-active');
 $('#auth-login-form').hidden=register;$('#auth-register-form').hidden=!register;
 const l=$('#auth-tab-login'),r=$('#auth-tab-register');l.classList.toggle('is-active',!register);r.classList.toggle('is-active',register);l.setAttribute('aria-selected',String(!register));r.setAttribute('aria-selected',String(register));
 const social=$('#auth-social-block');if(social)social.hidden=false;
 clearAuthFeedback();
 const inner=document.querySelector('.auth-side');if(inner)inner.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function showAuthFeedback(message,type='info'){
 const box=$('#auth-feedback');if(!box)return;box.hidden=false;box.className='auth-feedback '+(type==='error'?'is-error':'is-info');box.textContent=message;
}
function clearAuthFeedback(){const box=$('#auth-feedback');if(box){box.hidden=true;box.textContent='';box.className='auth-feedback'}}
function setupFeedback(message,type='error',target='setup-feedback'){
 const box=$('#'+target);if(!box)return;box.hidden=!message;box.textContent=message||'';box.className='auth-feedback'+(type==='error'?' is-error':' is-info');
}
function handleAuthLogin(event){
 event.preventDefault();
 // Protótipo: login real deve ser validado pelo provedor antes de liberar a conta.
 const email=$('#auth-login-email')?.value.trim()||'',password=$('#auth-login-password')?.value||'';
 if(!email||!password){showAuthFeedback('Informe seu e-mail e sua senha.','error');return}
 if($('#auth-login-password'))$('#auth-login-password').value='';
 enterLocalTrama();
}
function handleAuthRegister(event){
 event.preventDefault();
 const name=$('#auth-register-name')?.value.trim()||'',email=$('#auth-register-email')?.value.trim()||'',password=$('#auth-register-password')?.value||'',confirm=$('#auth-register-password-confirm')?.value||'';
 if(!name||!email||password.length<8||!confirm){showAuthFeedback('Preencha nome, e-mail, senha e confirmação. A senha precisa ter pelo menos 8 caracteres.','error');return}
 if(password!==confirm){showAuthFeedback('As senhas não coincidem. Confira os dois campos e tente novamente.','error');$('#auth-register-password-confirm')?.focus();return}
 // Senhas são descartadas; o primeiro objetivo será respondido dentro do aplicativo.
 pendingRegistration={name,email,objective:''};
 $('#auth-register-password').value='';$('#auth-register-password-confirm').value='';
 clearAuthFeedback();
 enterLocalTrama({showSetup:true});
}
function authProviderNotice(provider){showAuthFeedback('O acesso com '+provider+' está preparado visualmente, mas ainda precisa ser conectado a um provedor seguro. Nenhuma autenticação externa foi realizada.');}
function authForgotPassword(){showAuthFeedback('A recuperação será feita por link no e-mail depois que o serviço seguro de autenticação estiver conectado. Nenhum e-mail foi enviado nesta prévia.');}
function enterLocalTrama(options={}){
 const landing=$('#auth-landing');if(landing)landing.hidden=true;
 document.body.classList.remove('auth-active');
 const loginPassword=$('#auth-login-password');if(loginPassword)loginPassword.value='';
 clearAuthFeedback();
 applyCor();updatePlanGreeting();go('plan');
 if(options.showSetup)openSetupOverlay();
}
function exitTrama(){
 // Em protótipo local, Sair retorna à tela inicial sem apagar o orçamento salvo neste navegador.
 $('#pop').hidden=true;closeCardModal();closeProfile();closeSetupOverlay();pendingRegistration=null;authSetupFinished=false;
 const landing=$('#auth-landing');if(landing)landing.hidden=false;
 document.body.classList.add('auth-active');
 const loginPassword=$('#auth-login-password');if(loginPassword)loginPassword.value='';
 setAuthMode('login');clearAuthFeedback();
 const side=$('.auth-side');if(side)side.scrollTo({top:0,behavior:'auto'});
}
function updatePlanGreeting(){
 const name=String(S.profile?.name||'').trim(),first=name?name.split(/\s+/)[0]:'';
 const root=$('#plan-greeting'),label=$('#plan-first-name');if(label)label.textContent=first;if(root)root.hidden=!first;
}
function renderSetupPalettes(){
 const host=$('#setup-palette-options');if(!host)return;
 const current=setupColorMode==='custom'?'__custom__':setupPalette;
 host.innerHTML=SETUP_PALETTE_KEYS.map(k=>{
  const p=palOf(k,'plan'),active=current===k;
  return `<button type="button" class="setup-palette-option${active?' is-selected':''}" onclick="selectSetupPalette('${k}')" aria-pressed="${active?'true':'false'}"><i style="--palette-chip:${p.pc};--palette-chip-light:${p.pl}"></i><span>${esc(PAL[k].n)}</span>${active?'<b aria-hidden="true">✓</b>':''}</button>`;
 }).join('');
 const picker=$('#setup-custom-color');if(picker&&picker.value.toLowerCase()!==setupCustomColor.toLowerCase())picker.value=setupCustomColor;
 const hex=$('#setup-custom-color-hex');if(hex)hex.textContent=setupCustomColor.toUpperCase();
}
function updateSetupColorPreview(){
 const p=setupColorMode==='custom'?customPaletteFromColor(setupCustomColor):palOf(setupPalette,'plan'),root=$('#setup-color-preview');
 if(root){root.style.setProperty('--setup-pc',p.pc);root.style.setProperty('--setup-pl',p.pl);root.style.setProperty('--setup-pd',p.pd);root.style.setProperty('--setup-on',p.on||'#fff')}
 const name=$('#setup-color-bank-name');if(name)name.textContent='Prévia da Trama';
 renderSetupPalettes();
}
function selectSetupPalette(key){if(!SETUP_PALETTE_KEYS.includes(key))return;setupPalette=key;setupColorMode='preset';updateSetupColorPreview()}
function setSetupCustomColor(color){setupCustomColor=String(color||'#7276E9');setupColorMode='custom';updateSetupColorPreview()}
function openSetupOverlay(){
 const modal=$('#setup-overlay');if(!modal)return;
 setupCurrentStep=1;
 $('#setup-step-objective').hidden=false;$('#setup-step-personalize').hidden=true;
 $('#setup-step-count').textContent='ETAPA 1 DE 2';$('#setup-title').textContent='Vamos começar pelo seu objetivo';$('#setup-description').textContent='Duas etapas rápidas para preparar seu espaço financeiro.';
 const objective=$('#setup-objective');if(objective)objective.value='';
 setupPalette=SETUP_PALETTE_KEYS.includes(S.globalPalette)?S.globalPalette:(SETUP_PALETTE_KEYS.includes(S.cor?.plan)?S.cor.plan:'azul');
 setupCustomColor=S.customThemePalette?.pc||S.customThemePalettes?.plan?.pc||PAL[setupPalette].pc;
 setupColorMode=(S.globalPalette==='personalizada'||S.cor?.plan==='personalizada')?'custom':'preset';
 modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('setup-open');updateSetupColorPreview();
 requestAnimationFrame(()=>objective?.focus());
}
function closeSetupOverlay(){const modal=$('#setup-overlay');if(!modal)return;modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('setup-open')}
function setupNextStep(){
 if(setupCurrentStep!==1)return;
 const objective=$('#setup-objective')?.value||'';
 if(!objective){setupFeedback('Escolha o motivo pelo qual você quer se organizar.','error','setup-feedback-objective');$('#setup-objective')?.focus();return}
 if(pendingRegistration)pendingRegistration.objective=objective;
 setupFeedback('','info','setup-feedback-objective');setupCurrentStep=2;
 $('#setup-step-objective').hidden=true;$('#setup-step-personalize').hidden=false;
 $('#setup-step-count').textContent='ETAPA 2 DE 2';$('#setup-title').textContent='Escolha a cor do seu banco principal';$('#setup-description').textContent='Você pode escolher a cor do seu banco principal para se orientar da melhor forma.';
 setupPalette=SETUP_PALETTE_KEYS.includes(S.globalPalette)?S.globalPalette:(SETUP_PALETTE_KEYS.includes(S.cor?.plan)?S.cor.plan:'azul');
 setupCustomColor=S.customThemePalette?.pc||S.customThemePalettes?.plan?.pc||PAL[setupPalette].pc;
 setupColorMode=(S.globalPalette==='personalizada'||S.cor?.plan==='personalizada')?'custom':'preset';
 updateSetupColorPreview();requestAnimationFrame(()=>$('#setup-palette-options button')?.focus());
}
function setupPreviousStep(){
 if(setupCurrentStep===2){setupCurrentStep=1;$('#setup-step-objective').hidden=false;$('#setup-step-personalize').hidden=true;$('#setup-step-count').textContent='ETAPA 1 DE 2';$('#setup-title').textContent='Vamos começar pelo seu objetivo';$('#setup-description').textContent='Duas etapas rápidas para preparar seu espaço financeiro.';requestAnimationFrame(()=>$('#setup-objective')?.focus())}
}
function finishAuthSetup(){
 if(authSetupFinished)return;
 if(!pendingRegistration){setupFeedback('O cadastro não está disponível nesta sessão. Volte à tela inicial e crie seu perfil novamente.','error','setup-feedback-personalize');return}
 if(setupCurrentStep!==2){setupFeedback('Conclua as duas etapas da configuração.','error','setup-feedback-personalize');return}
 const custom=setupColorMode==='custom',paletteKey=custom?'personalizada':setupPalette;
 const p=custom?customPaletteFromColor(setupCustomColor):palOf(setupPalette,'plan');
 S.profile={...(S.profile||{}),name:String(pendingRegistration.name||'').trim(),email:String(pendingRegistration.email||'').trim(),objective:String(pendingRegistration.objective||''),themeColor:p.pc,themePalette:paletteKey};
 delete S.profile.bankName;delete S.bankSetup;
 // A cor inicial escolhida pela pessoa é global nas três abas.
 S.cor={...(S.cor||{}),global:paletteKey,plan:paletteKey,cx:paletteKey,cart:paletteKey};S.globalPalette=paletteKey;
 if(!S.customThemePalettes)S.customThemePalettes={};
 if(custom){S.customThemePalettes={...S.customThemePalettes,plan:p,cx:p,cart:p};S.customThemePalette=p;}
 else {delete S.customThemePalettes.plan;delete S.customThemePalettes.cx;delete S.customThemePalettes.cart;delete S.customThemePalette;}
 S.onboardingComplete=true;
 pendingRegistration=null;authSetupFinished=true;save();applyCor();updatePlanGreeting();stat('local');closeSetupOverlay();
}
let profileEditKind='';
function openProfile(){
 const modal=$('#profile-modal');if(!modal)return;
 const name=$('#profile-current-name'),email=$('#profile-current-email');
 if(name)name.textContent=String(S.profile?.name||'Não informado');
 if(email)email.textContent=String(S.profile?.email||'Não informado');
 cancelProfileEdit();
 modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('profile-modal-open');
}
function closeProfile(){
 const modal=$('#profile-modal');if(!modal)return;modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('profile-modal-open');cancelProfileEdit();
}
function showProfileFeedback(message,type='info'){
 const f=$('#profile-feedback');if(!f)return;f.hidden=false;f.className='auth-feedback '+(type==='error'?'is-error':'is-info');f.textContent=message;
}
function showProfileGlobalFeedback(message,type='info'){
 const f=$('#profile-global-feedback');if(!f)return;f.hidden=false;f.className='profile-global-feedback '+(type==='error'?'is-error':'is-info');f.textContent=message;
}
function cancelProfileEdit(){
 profileEditKind='';const globalFeedback=$('#profile-global-feedback');if(globalFeedback){globalFeedback.hidden=true;globalFeedback.textContent='';globalFeedback.className='profile-global-feedback'}
 const section=$('#profile-editor-section');if(section)section.hidden=true;
 const fields=$('#profile-editor-fields');if(fields)fields.innerHTML='';
 const feedback=$('#profile-feedback');if(feedback){feedback.hidden=true;feedback.textContent='';feedback.className='auth-feedback'}
 const note=$('#profile-editor-note');if(note)note.textContent='';
}
function openProfileEditor(kind){
 if(!['name','email','password'].includes(kind))return;
 const globalFeedback=$('#profile-global-feedback');if(globalFeedback){globalFeedback.hidden=true;globalFeedback.textContent='';globalFeedback.className='profile-global-feedback'}
 profileEditKind=kind;
 const section=$('#profile-editor-section'),title=$('#profile-editor-title'),host=$('#profile-editor-fields'),note=$('#profile-editor-note');
 const configs={
  name:{title:'Atualizar nome',note:'O nome será atualizado nesta prévia do aplicativo.',fields:`<label class="auth-field">Novo nome<input id="profile-editor-new" type="text" maxlength="80" autocomplete="name" required placeholder="Seu nome"></label>`},
  email:{title:'Atualizar e-mail',note:'Será necessário confirmar o novo endereço. Nenhum e-mail será enviado até a integração de autenticação.',fields:`<label class="auth-field">Novo e-mail<input id="profile-editor-new" type="email" autocomplete="email" required placeholder="novo@exemplo.com"></label><label class="auth-field">Confirme o novo e-mail<input id="profile-editor-confirm" type="email" autocomplete="email" required placeholder="Digite o e-mail novamente"></label>`},
  password:{title:'Atualizar senha',note:'A senha será solicitada duas vezes e nunca será guardada nesta prévia. A confirmação por e-mail depende da integração segura.',fields:`<label class="auth-field">Nova senha<input id="profile-editor-new" type="password" autocomplete="new-password" minlength="8" required placeholder="Pelo menos 8 caracteres"></label><label class="auth-field">Confirme a nova senha<input id="profile-editor-confirm" type="password" autocomplete="new-password" minlength="8" required placeholder="Digite a senha novamente"></label>`}
 };
 const config=configs[kind];if(title)title.textContent=config.title;if(host)host.innerHTML=config.fields;if(note)note.textContent=config.note;
 const feedback=$('#profile-feedback');if(feedback){feedback.hidden=true;feedback.textContent='';feedback.className='auth-feedback'}
 if(section)section.hidden=false;requestAnimationFrame(()=>$('#profile-editor-new')?.focus());
}
// Ponto único de integração futura: o serviço deverá enviar link e concluir a troca após validação.
function requestCredentialChange(kind){return {configured:false,kind}}
function submitProfileChange(event){
 event.preventDefault();const value=String($('#profile-editor-new')?.value||'').trim(),confirm=String($('#profile-editor-confirm')?.value||'');
 if(profileEditKind==='name'){
  if(!value){showProfileFeedback('Informe seu nome.','error');$('#profile-editor-new')?.focus();return}
  S.profile={...(S.profile||{}),name:value};save();updatePlanGreeting();
  const name=$('#profile-current-name');if(name)name.textContent=value;
  cancelProfileEdit();showProfileGlobalFeedback('Nome atualizado nesta prévia.');return;
 }
 if(profileEditKind==='email'){
  if(!value||!confirm){showProfileFeedback('Preencha e confirme o novo e-mail.','error');return}
  if(value.toLowerCase()!==confirm.trim().toLowerCase()){showProfileFeedback('Os e-mails não coincidem. Confira os dois campos.','error');$('#profile-editor-confirm')?.focus();return}
  if(value.toLowerCase()===(S.profile?.email||'').toLowerCase()){showProfileFeedback('O novo e-mail precisa ser diferente do atual.','error');return}
  requestCredentialChange('email');
  $('#profile-editor-new').value='';$('#profile-editor-confirm').value='';
  showProfileFeedback('Solicitação preparada para integração. Nenhum link foi enviado e o e-mail atual não foi alterado.','info');return;
 }
 if(profileEditKind==='password'){
  const password=$('#profile-editor-new')?.value||'';
  if(password.length<8){showProfileFeedback('A senha precisa ter pelo menos 8 caracteres.','error');$('#profile-editor-new')?.focus();return}
  if(!confirm){showProfileFeedback('Confirme a nova senha no segundo campo.','error');$('#profile-editor-confirm')?.focus();return}
  if(password!==confirm){showProfileFeedback('As senhas não coincidem. Confira os dois campos.','error');$('#profile-editor-confirm')?.focus();return}
  requestCredentialChange('password');$('#profile-editor-new').value='';$('#profile-editor-confirm').value='';
  showProfileFeedback('Solicitação preparada para integração. Nenhum link foi enviado e a senha não foi alterada.','info');
 }
}
// A antiga inicialização selectAuthBank foi removida junto do seletor bancário visual.


// Prévia de desenvolvimento somente em arquivo local ou localhost, solicitada por ?preview=1.
// Não há botão público de demonstração; em produção HTTPS esse atalho não tem efeito.
function enableLocalPreviewIfRequested(){
 const localHost=location.protocol==='file:'||['localhost','127.0.0.1','::1'].includes(location.hostname);
 const requested=new URLSearchParams(location.search).get('preview')==='1';
 if(localHost&&requested)enterLocalTrama();
}
enableLocalPreviewIfRequested();
