// Viewer HTML template generators

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function pdfViewerHTML(title: string, fileUrl: string, settings: Record<string, unknown>, showBranding: boolean): string {
  const bg = (settings.background as string) || '#1a1a1a';
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>${safeTitle} — FlipRead</title>
<meta name="description" content="Read ${safeTitle} as an interactive flipbook">
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js"><\/script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;overflow:hidden;background:${bg};height:100dvh;width:100vw;position:fixed}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:0 15px;background:linear-gradient(to bottom,rgba(0,0,0,.8),transparent);color:#fff;height:60px;z-index:100;position:fixed;top:0;left:0;width:100%;pointer-events:none}
.hdr-l{display:flex;align-items:center;gap:10px;pointer-events:auto}
.hdr-t{font-size:16px;font-weight:600;text-shadow:0 2px 4px rgba(0,0,0,.5);max-width:50vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hdr-r{display:flex;gap:10px;align-items:center;pointer-events:auto}
.ib{width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:14px;border:1px solid rgba(255,255,255,.1);transition:all .2s}
.ib:hover{background:rgba(255,255,255,.2);transform:scale(1.05)}
.zc{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.4);padding:4px 12px;border-radius:20px;backdrop-filter:blur(4px)}
.zt{color:#fff;font-size:12px;min-width:35px;text-align:center}
.mc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:1}
#fc{position:relative;transform-origin:center}
.pg{background:#fff;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,.2);cursor:grab}
.pg:active{cursor:grabbing}.pg.--hard{background:#f2f2f2;border:1px solid #ccc}
.pc{width:100%;height:100%;display:flex;justify-content:center;align-items:center;position:relative}
.pg canvas{width:100%;height:100%;object-fit:fill;display:block;pointer-events:none}
.ft{display:flex;align-items:center;justify-content:center;gap:15px;padding:15px;background:linear-gradient(to top,rgba(0,0,0,.8),transparent);position:fixed;bottom:0;left:0;width:100%;z-index:100;pointer-events:none}
.sl{flex:1;max-width:300px;-webkit-appearance:none;height:4px;background:rgba(255,255,255,.3);border-radius:2px;outline:none;pointer-events:auto}
.sl::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:#4CAF50;border-radius:50%;cursor:pointer}
.nb{background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.2);width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px;color:#fff;display:flex;align-items:center;justify-content:center;pointer-events:auto;backdrop-filter:blur(4px);transition:all .3s}
.nb:hover:not(:disabled){background:rgba(255,255,255,.2);transform:scale(1.1)}
.nb:disabled{opacity:.3;cursor:not-allowed}
.pi{color:#ddd;font-size:12px;min-width:60px;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.8)}
.ld{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:16px;z-index:1000;background:rgba(0,0,0,.8);padding:15px 25px;border-radius:30px;display:flex;align-items:center;gap:10px}
.br{position:fixed;bottom:60px;right:15px;z-index:200;font-size:11px;color:rgba(255,255,255,.4);text-decoration:none;pointer-events:auto}
.br:hover{color:rgba(255,255,255,.7)}
@media(max-width:768px){.zc{display:none!important}}
</style>
</head>
<body>
<header class="hdr"><div class="hdr-l"><div class="hdr-t">${safeTitle}</div></div>
<div class="hdr-r"><div class="zc"><button class="ib" id="zo" style="width:28px;height:28px;font-size:12px"><i class="fas fa-minus"></i></button><div class="zt" id="ztxt">100%</div><button class="ib" id="zi" style="width:28px;height:28px;font-size:12px"><i class="fas fa-plus"></i></button></div>
<button class="ib" id="fs" title="Fit"><i class="fas fa-compress"></i></button></div></header>
<div class="mc" id="mc"><div class="ld" id="ld"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div><div id="fc"></div></div>
<div class="ft"><button id="pb" class="nb"><i class="fas fa-chevron-left"></i></button><input type="range" id="ps" class="sl" min="0" max="0" value="0"><button id="nb" class="nb"><i class="fas fa-chevron-right"></i></button><div class="pi" id="pi">-- / --</div></div>
${showBranding ? '<a class="br" href="https://flipread.pages.dev" target="_blank">Powered by FlipRead</a>' : ''}
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const FU='${fileUrl}';
class FV{constructor(){this.pdf=null;this.pf=null;this.tp=0;this.rp=new Set;this.rq=new Set;this.ir=false;this.ti=0;this.mc=document.getElementById('mc');this.init()}
async init(){this.setupCtrl();await this.load(FU)}
async load(u){try{this.pdf=await pdfjsLib.getDocument(u).promise;this.tp=this.pdf.numPages;document.getElementById('ps').max=this.tp-1;await this.build(0);document.getElementById('ld').style.display='none'}catch(e){document.getElementById('ld').innerHTML='<i class="fas fa-exclamation-triangle"></i> Failed to load'}}
async build(ip=0){if(!this.pdf)return;if(this.pf){this.pf.destroy();this.pf=null}let o=document.getElementById('fc');if(o)o.remove();let c=document.createElement('div');c.id='fc';this.mc.appendChild(c);this.rp.clear();this.rq.clear();
let p=await this.pdf.getPage(1),v=p.getViewport({scale:1}),ar=v.width/v.height,d=this.sz(ar),m=window.innerWidth<=768;
c.style.width=m?d.w+'px':(d.w*2)+'px';c.style.height=d.h+'px';
for(let i=1;i<=this.tp;i++){let e=document.createElement('div');e.className=(i===1||i===this.tp)?'pg --hard':'pg --simple';e.innerHTML='<div class="pc" id="pc-'+i+'"></div>';c.appendChild(e)}
this.pf=new St.PageFlip(c,{width:d.w,height:d.h,size:'fixed',maxShadowOpacity:.5,showCover:true,mobileScrollSupport:false,useMouseEvents:true});
this.pf.loadFromHTML(document.querySelectorAll('.pg'));this.pf.on('flip',e=>{this.uc();this.qp(e.data)});
if(ip>0)this.pf.flip(ip);this.uc();this.qp(ip)}
sz(ar){let m=40,aw=window.innerWidth,ah=window.innerHeight-130-m,h=ah,w=h*ar;
if(window.innerWidth>768){if(w*2>aw-m){w=(aw-m)/2;h=w/ar}}else{if(w>aw-20){w=aw-20;h=w/ar}}
let wf=Math.floor(w);if(wf%2!==0)wf--;return{w:wf,h:Math.floor(h)}}
qp(i){this.ti=i;let s=Math.max(0,i-5),e=Math.min(this.tp-1,i+5);for(let j=s;j<=e;j++)if(!this.rp.has(j+1))this.rq.add(j+1);this.pq()}
async pq(){if(this.ir)return;this.ir=true;while(this.rq.size>0){let a=[...this.rq];a.sort((x,y)=>Math.abs((x-1)-this.ti)-Math.abs((y-1)-this.ti));let n=a[0];this.rq.delete(n);if(this.rp.has(n))continue;let el=document.getElementById('pc-'+n);if(!el){this.ir=false;return}
try{let pg=await this.pdf.getPage(n),vp=pg.getViewport({scale:2}),cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;el.innerHTML='';el.appendChild(cv);this.rp.add(n)}catch(e){}}this.ir=false}
uc(){if(!this.pf)return;let c=this.pf.getCurrentPageIndex();document.getElementById('pi').textContent=(c+1)+' / '+this.tp;document.getElementById('ps').value=c;document.getElementById('pb').disabled=c===0;document.getElementById('nb').disabled=c>=this.tp-1}
setupCtrl(){document.getElementById('pb').onclick=()=>{if(this.pf)this.pf.flipPrev()};document.getElementById('nb').onclick=()=>{if(this.pf)this.pf.flipNext()};
document.getElementById('ps').oninput=e=>{if(this.pf)this.pf.flip(+e.target.value)};
let z=1;document.getElementById('zi').onclick=()=>{z=Math.min(z+.1,2);document.getElementById('fc').style.transform='scale('+z+')';document.getElementById('ztxt').textContent=Math.round(z*100)+'%'};
document.getElementById('zo').onclick=()=>{z=Math.max(z-.1,.5);document.getElementById('fc').style.transform='scale('+z+')';document.getElementById('ztxt').textContent=Math.round(z*100)+'%'};
document.getElementById('fs').onclick=()=>{z=1;document.getElementById('fc').style.transform='scale(1)';document.getElementById('ztxt').textContent='100%'};
document.onkeydown=e=>{if(e.key==='ArrowLeft'&&this.pf)this.pf.flipPrev();if(e.key==='ArrowRight'&&this.pf)this.pf.flipNext()};
let sx=0;document.ontouchstart=e=>{sx=e.touches[0].clientX};document.ontouchend=e=>{let d=sx-e.changedTouches[0].clientX;if(Math.abs(d)>50){d>0?this.pf?.flipNext():this.pf?.flipPrev()}}}}
new FV();
<\/script></body></html>`;
}

export function epubViewerHTML(title: string, fileUrl: string, settings: Record<string, unknown>, showBranding: boolean): string {
  const bg = (settings.background as string) || '#f3f0e8';
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeTitle} — FlipRead</title>
<meta name="description" content="Read ${safeTitle} as an interactive flipbook">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js"><\/script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:${bg};height:100vh;overflow:hidden}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:0 15px;background:rgba(0,0,0,.6);backdrop-filter:blur(12px);color:#fff;height:48px;position:fixed;top:0;left:0;width:100%;z-index:100;border-bottom:1px solid rgba(255,255,255,.05)}
.hdr-t{font-size:14px;font-weight:600;opacity:.9}
.hdr-r{display:flex;gap:8px}
.hb{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.1);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.hb:hover{background:rgba(255,255,255,.2)}
#ra{position:absolute;top:48px;bottom:48px;left:0;right:0}
#bv{width:100%;height:100%;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.ft{display:flex;align-items:center;justify-content:center;gap:30px;padding:0 15px;background:rgba(0,0,0,.6);backdrop-filter:blur(12px);color:#fff;height:48px;position:fixed;bottom:0;left:0;width:100%;z-index:100;border-top:1px solid rgba(255,255,255,.05)}
.nb{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-size:16px}
.nb:hover{background:rgba(255,255,255,.25);transform:scale(1.1)}
.pi{font-size:12px;color:rgba(255,255,255,.7);min-width:80px;text-align:center}
.ld{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000;color:#fff;gap:15px}
.sp{width:40px;height:40px;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.br{position:fixed;bottom:52px;right:12px;z-index:200;font-size:11px;color:rgba(0,0,0,.3);text-decoration:none}
.br:hover{color:rgba(0,0,0,.6)}
.mb{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:500;display:none}
.mb.o{display:block}
.tm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(30,30,30,.95);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.1);border-radius:12px;width:380px;max-width:90vw;max-height:80vh;z-index:600;display:none;flex-direction:column;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.tm.o{display:flex}
.th{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center;color:#fff}
.tl{overflow-y:auto;padding:8px}
.ti{padding:10px 12px;cursor:pointer;color:#aaa;font-size:14px;border-bottom:1px solid rgba(255,255,255,.05);transition:all .2s;border-radius:6px}
.ti:hover{background:rgba(255,255,255,.1);color:#fff}
</style>
</head>
<body>
<div class="ld" id="ld"><div class="sp"></div><div>Loading book...</div></div>
<header class="hdr"><div class="hdr-t">${safeTitle}</div><div class="hdr-r"><button class="hb" id="tb" title="Contents"><i class="fas fa-list"></i></button></div></header>
<div id="ra"><div id="bv"></div></div>
<footer class="ft"><button class="nb" id="pb"><i class="fas fa-chevron-left"></i></button><div class="pi" id="pi">Loading...</div><button class="nb" id="nb"><i class="fas fa-chevron-right"></i></button></footer>
${showBranding ? '<a class="br" href="https://flipread.pages.dev" target="_blank">Powered by FlipRead</a>' : ''}
<div class="mb" id="mb"></div>
<div class="tm" id="tm"><div class="th"><strong>Contents</strong><button class="hb" id="tc" style="width:28px;height:28px">✕</button></div><div class="tl" id="tl"></div></div>
<script>
const FU='${fileUrl}';let book,rend;
async function init(){try{let r=await fetch(FU),d=await r.arrayBuffer();book=ePub(d);rend=book.renderTo('bv',{width:'100%',height:'100%',spread:window.innerWidth>768?'auto':'none'});await rend.display();document.getElementById('ld').style.display='none';
let nav=await book.loaded.navigation,tl=document.getElementById('tl');nav.toc.forEach(c=>{let i=document.createElement('div');i.className='ti';i.textContent=c.label.trim();i.onclick=()=>{rend.display(c.href);ct()};tl.appendChild(i)});
rend.on('relocated',l=>{let p=document.getElementById('pi');if(l.start?.displayed)p.textContent='Page '+l.start.displayed.page+' / '+l.start.displayed.total})}catch(e){document.getElementById('ld').innerHTML='<div style="color:#ff6b6b">Failed to load</div>'}}
document.getElementById('pb').onclick=()=>{if(rend)rend.prev()};document.getElementById('nb').onclick=()=>{if(rend)rend.next()};
document.onkeydown=e=>{if(e.key==='ArrowLeft'&&rend)rend.prev();if(e.key==='ArrowRight'&&rend)rend.next()};
function ct(){document.getElementById('tm').classList.remove('o');document.getElementById('mb').classList.remove('o')}
document.getElementById('tb').onclick=()=>{document.getElementById('tm').classList.toggle('o');document.getElementById('mb').classList.toggle('o')};
document.getElementById('tc').onclick=ct;document.getElementById('mb').onclick=ct;
let sx=0;document.ontouchstart=e=>{sx=e.touches[0].clientX};document.ontouchend=e=>{let d=sx-e.changedTouches[0].clientX;if(Math.abs(d)>50){d>0?rend.next():rend.prev()}};
init();
<\/script></body></html>`;
}

export function passwordPage(slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Password Required — FlipRead</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh}.c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:90%}h2{margin-bottom:10px;font-size:22px}p{margin-bottom:25px;color:#94a3b8;font-size:14px}input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:14px;margin-bottom:15px;outline:none}input:focus{border-color:#3b82f6}button{width:100%;padding:12px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;cursor:pointer}button:hover{background:#2563eb}</style>
</head><body><div class="c"><div style="font-size:48px;margin-bottom:20px">🔒</div><h2>Password Required</h2><p>This book is protected. Enter the password to continue.</p>
<form onsubmit="event.preventDefault();location.href='/read/${slug}?p='+encodeURIComponent(document.getElementById('pw').value)">
<input type="password" id="pw" placeholder="Enter password" autofocus><button type="submit">Unlock Book</button></form></div></body></html>`;
}

export function errorPage(title: string, message: string): string {
  const safeTitle = escapeHtml(title);
  const safeMsg = escapeHtml(message);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeTitle} — FlipRead</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh}.c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:90%}h2{margin-bottom:10px;color:#f87171}p{color:#94a3b8;line-height:1.6}a{color:#3b82f6;text-decoration:none;margin-top:20px;display:inline-block}</style>
</head><body><div class="c"><div style="font-size:48px;margin-bottom:20px">📖</div><h2>${safeTitle}</h2><p>${safeMsg}</p><a href="/">← Back to FlipRead</a></div></body></html>`;
}
