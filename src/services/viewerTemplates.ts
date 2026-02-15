// Viewer HTML template generators

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function pdfViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean): string {
  const bg = (settings.background as string) || '#1a1a1a';
  const accent = (settings.accent_color as string) || '#4CAF50';
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${safeTitle} — FlipRead</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;overflow:hidden;background:${bg};background-size:cover;background-position:center;height:100dvh;width:100vw;position:fixed;transition:background 0.3s ease}
        
        #s-c { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; perspective: 4000px; overflow: hidden; z-index: 10; }
        #b-t { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease; transform-style: preserve-3d; opacity: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; }
        #b-t.open { opacity: 1; pointer-events: auto; }
        #fc { position: relative; transform-origin: center center; }

        .c-b { position: absolute; z-index: 200; width: 45vh; height: 65vh; transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); cursor: pointer; }
        .c-b:hover { transform: scale(1.03) rotateY(-5deg); }
        .c-v { width: 100%; height: 100%; object-fit: cover; border-radius: 2px 4px 4px 2px; box-shadow: -15px 15px 40px rgba(0,0,0,0.5); background: ${accent}; display: flex; align-items: center; justify-content: center; color: white; text-align: center; padding: 20px; font-weight: bold; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .c-b::before { content: ''; position: absolute; inset: 0 0 0 -30px; transform: rotateY(-90deg); transform-origin: right; background: linear-gradient(to right, #444, #222, #444); border-radius: 4px 0 0 4px; }
        
        .a-f-o { animation: fO 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; pointer-events: none; }
        @keyframes fO {
            0% { transform: rotateY(0) translateZ(0); opacity: 1; }
            40% { transform: rotateY(-70deg) translateZ(150px); opacity: 1; }
            100% { transform: rotateY(-180deg) translateZ(300px) scale(1.8); opacity: 0; }
        }

        .hdr{display:flex;align-items:center;justify-content:space-between;padding:0 15px;background:linear-gradient(to bottom,rgba(0,0,0,0.8),transparent);color:#fff;height:50px;z-index:100;position:fixed;top:0;left:0;width:100%;pointer-events:auto;transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1)}
        .ft{display:flex;align-items:center;justify-content:center;gap:15px;padding:10px;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);position:fixed;bottom:0;left:0;width:100%;z-index:100;pointer-events:auto;transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1)}
        
        body.full-mode .hdr { transform: translateY(-100%); opacity: 0; }
        body.full-mode .ft { transform: translateY(100%); opacity: 0; }
        body.full-mode .hdr:hover, body.full-mode .hdr.v, body.full-mode .ft:hover, body.full-mode .ft.v { transform: translateY(0); opacity: 1; }

        .hdr-l{display:flex;align-items:center;gap:10px}
        .hdr-t{font-size:14px;font-weight:600;text-shadow:0 2px 4px rgba(0,0,0,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40vw}
        .hdr-r{display:flex;gap:10px;align-items:center}
        .hdr-i{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;color:#fff;font-size:14px;border:none;backdrop-filter:blur(10px)}
        .hdr-i:hover{background:rgba(255,255,255,0.2);transform:scale(1.05)}
        
        .pg{background:#fff;box-shadow:0 0 20px rgba(0,0,0,0.3);cursor:grab}.pg:active{cursor:grabbing}
        .pg.--hard{background:#f8f9fa;border:1px solid #ddd}
        .pc{width:100%;height:100%;display:flex;justify-content:center;align-items:center;position:relative}
        .pg canvas{width:100%;height:100%;object-fit:fill;display:block;pointer-events:none}
        
        .sl{flex:1;max-width:250px;-webkit-appearance:none;appearance:none;height:4px;background:rgba(255,255,255,0.3);border-radius:2px;outline:none}
        .sl::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;background:${accent};border-radius:50%;cursor:pointer;box-shadow:0 0 5px rgba(0,0,0,0.5)}
        .nb{background:rgba(255,255,255,0.1);width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px;color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);transition:all .3s;border:none}
        .nb:hover:not(:disabled){background:rgba(255,255,255,0.23);transform:scale(1.1)}
        .nb:disabled{opacity:0.2;cursor:not-allowed}
        .pi{color:#fff;font-size:11px;min-width:60px;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.8);font-weight:600}
        
        .zc{display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.3);padding:2px 8px;border-radius:12px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1)}
        .zt{color:#fff;font-size:11px;min-width:35px;text-align:center;font-mono}
        
        .modal{position:fixed;inset:0;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;z-index:2000;backdrop-filter:blur(8px)}
        .modal.o{display:flex}
        .modal-c{background:#1c1c1c;border-radius:16px;width:95%;max-width:400px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);color:#fff;overflow:hidden;border:1px solid rgba(255,255,255,0.1)}
        .modal-h{padding:18px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center}
        .modal-b{overflow-y:auto;flex:1;padding:12px}
        .item{padding:14px;cursor:pointer;color:#aaa;border-bottom:1px solid rgba(255,255,255,0.03);display:flex;justify-content:space-between;transition:all 0.2s;border-radius:8px}
        .item:hover{background:rgba(255,255,255,0.05);color:#fff;padding-left:18px}
        
        .br{position:fixed;bottom:60px;right:15px;z-index:200;font-size:10px;color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.2s}
        .br:hover{color:rgba(255,255,255,0.6)}
        
        #detect-zone-top, #detect-zone-bottom { position: fixed; left: 0; right: 0; height: 60px; z-index: 95; }
        #detect-zone-top { top: 0; }
        #detect-zone-bottom { bottom: 0; }

        @media(max-width:768px){.zc,#f-btn{display:none!important}}
    </style>
</head>
<body class="fit-mode">
    <div id="ld" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
        </div>
        <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Initializing Reader...</p>
    </div>

    <div id="detect-zone-top"></div>
    <header class="hdr" id="main-hdr">
        <div class="hdr-l">
            <button class="hdr-i" onclick="toggleModal('index-modal')"><i class="fas fa-list-ul"></i></button>
            <div class="hdr-t">${safeTitle}</div>
        </div>
        <div class="hdr-r">
            <button class="hdr-i" onclick="toggleModal('bg-modal')"><i class="fas fa-palette"></i></button>
            <div class="zc">
                <button class="hdr-i" id="zo" style="width:26px;height:26px;font-size:10px"><i class="fas fa-minus"></i></button>
                <div class="zt" id="ztxt">100%</div>
                <button class="hdr-i" id="zi" style="width:26px;height:26px;font-size:10px"><i class="fas fa-plus"></i></button>
            </div>
            <button class="hdr-i" id="m-btn" title="Toggle Layout"><i class="fas fa-expand"></i></button>
        </div>
    </header>

    <div id="s-c">
        <div id="c-b" class="c-b" onclick="openBook()">
            <div class="c-v" id="c-v-inner">
                ${coverUrl ? '<img src="' + coverUrl + '" style="width:100%;height:100%;object-fit:cover;">' : '<div class="flex flex-col gap-2"><span>' + safeTitle + '</span><span class="text-[9px] opacity-40">FLIP TO OPEN</span></div>'}
            </div>
        </div>
        <div id="b-t">
            <div id="fc"></div>
        </div>
    </div>

    <div id="detect-zone-bottom"></div>
    <div class="ft" id="main-ft">
        <button id="pb" class="nb"><i class="fas fa-chevron-left"></i></button>
        <div class="flex flex-col items-center gap-1 flex-1 max-w-[300px]">
            <input type="range" id="ps" class="sl" min="0" max="0" value="0">
            <div class="pi" id="pi">-- / --</div>
        </div>
        <button id="nb" class="nb"><i class="fas fa-chevron-right"></i></button>
    </div>

    <div id="index-modal" class="modal">
        <div class="modal-c">
            <div class="modal-h"><strong class="text-xs uppercase tracking-widest opacity-70">Contents</strong><button class="hdr-i" onclick="toggleModal('index-modal')" style="width:30px;height:30px">✕</button></div>
            <div class="modal-b" id="index-list"></div>
        </div>
    </div>

    <div id="bg-modal" class="modal">
        <div class="modal-c">
            <div class="modal-h"><strong class="text-xs uppercase tracking-widest opacity-70">Appearance</strong><button class="hdr-i" onclick="toggleModal('bg-modal')" style="width:30px;height:30px">✕</button></div>
            <div class="modal-b p-6 grid grid-cols-3 gap-4">
                <div class="w-full aspect-square rounded-full cursor-pointer border-2 border-transparent hover:border-white transition" style="background:#1a1a1a" onclick="setBg('#1a1a1a')"></div>
                <div class="w-full aspect-square rounded-full cursor-pointer border-2 border-transparent hover:border-white transition" style="background:#ffffff" onclick="setBg('#ffffff')"></div>
                <div class="w-full aspect-square rounded-full cursor-pointer border-2 border-transparent hover:border-white transition" style="background:#3e2723" onclick="setBg('#3e2723')"></div>
                <div class="w-full aspect-square rounded-full cursor-pointer border-2 border-transparent hover:border-white transition" style="background:#111827" onclick="setBg('#111827')"></div>
                <div class="w-full aspect-square rounded-full cursor-pointer border-2 border-transparent hover:border-white transition" style="background:#f5f5f5" onclick="setBg('#f5f5f5')"></div>
                <div class="w-full aspect-square rounded-full cursor-pointer border-2 border-transparent hover:border-white transition" style="background:#000" onclick="setBg('#000')"></div>
            </div>
        </div>
    </div>

    ${showBranding ? '<a class="br" href="https://flipread.pages.dev" target="_blank">FlipRead</a>' : ''}

    <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const FU='${fileUrl}';

        class PDFViewer {
            constructor() {
                this.pdf = null; this.pf = null; this.tp = 0; this.zoom = 1; this.full = false;
                this.rp = new Set(); this.rq = new Set(); this.ir = false;
                this.init();
            }
            async init() {
                this.setup();
                await this.load(FU);
            }
            async load(u) {
                try {
                    this.pdf = await pdfjsLib.getDocument(u).promise;
                    this.tp = this.pdf.numPages;
                    document.getElementById('ps').max = this.tp - 1;
                    
                    // Attempt to extract cover and back if missing
                    if (!'${coverUrl}') {
                        const pg = await this.pdf.getPage(1);
                        const vp = pg.getViewport({scale:1});
                        const cv = document.createElement('canvas');
                        cv.width = vp.width; cv.height = vp.height;
                        await pg.render({canvasContext:cv.getContext('2d'), viewport:vp}).promise;
                        document.getElementById('c-v-inner').innerHTML = \`<img src="\${cv.toDataURL()}" style="width:100%;height:100%;object-fit:cover;">\`;
                    }
                    
                    // Extract last page for back cover feel
                    const lpg = await this.pdf.getPage(this.tp);
                    const lvp = lpg.getViewport({scale:1});
                    const lcv = document.createElement('canvas');
                    lcv.width = lvp.width; lcv.height = lvp.height;
                    await lpg.render({canvasContext:lcv.getContext('2d'), viewport:lvp}).promise;
                    this.backCoverData = lcv.toDataURL();

                    await this.build();
                    document.getElementById('ld').style.opacity='0';
                    setTimeout(()=>document.getElementById('ld').style.display='none', 500);
                    this.genIndex();
                } catch(e) {
                    document.getElementById('ld').innerHTML = '<i class="fas fa-exclamation-triangle text-red-500"></i><p>Connection Error</p>';
                }
            }
            async build() {
                if(!this.pdf) return;
                if(this.pf) this.pf.destroy();
                let container = document.getElementById('fc');
                container.innerHTML = '';
                this.rp.clear(); this.rq.clear();

                let p1 = await this.pdf.getPage(1), vp = p1.getViewport({scale:1}), ar = vp.width/vp.height;
                let dims = this.calcDims(ar);
                container.style.width = window.innerWidth <= 768 ? dims.w+'px' : (dims.w*2)+'px';
                container.style.height = dims.h+'px';

                for(let i=1; i<=this.tp; i++) {
                    let div = document.createElement('div');
                    div.className = (i===1 || i===this.tp) ? 'pg --hard' : 'pg --simple';
                    div.innerHTML = '<div class="pc" id="pc-'+i+'"></div>';
                    container.appendChild(div);
                }

                this.pf = new St.PageFlip(container, {
                    width: dims.w, height: dims.h, size: 'fixed',
                    maxShadowOpacity: 0.4, showCover: true,
                    mobileScrollSupport: false, useMouseEvents: true,
                    flippingTime: 800
                });
                this.pf.loadFromHTML(document.querySelectorAll('.pg'));
                this.pf.on('flip', e => { this.update(); this.queue(e.data); });
                this.update(); this.queue(0);
            }
            calcDims(ar) {
                const headH = this.full ? 0 : 50, footH = this.full ? 0 : 70, margin = 40;
                let h = window.innerHeight - headH - footH - margin, w = h * ar, aw = window.innerWidth;
                if(aw > 768) { if(w*2 > aw-40) { w = (aw-40)/2; h = w/ar; } }
                else { if(w > aw-20) { w = aw-20; h = w/ar; } }
                let wf = Math.floor(w); if(wf%2!==0) wf--; 
                return { w: wf, h: Math.floor(h) };
            }
            queue(i) {
                this.target = i;
                for(let j=Math.max(0,i-3); j<=Math.min(this.tp-1,i+3); j++) {
                    if(!this.rp.has(j+1)) this.rq.add(j+1);
                }
                this.process();
            }
            async process() {
                if(this.ir) return; this.ir = true;
                while(this.rq.size > 0) {
                    let q = [...this.rq].sort((a,b) => Math.abs((a-1)-this.target) - Math.abs((b-1)-this.target));
                    let n = q[0]; this.rq.delete(n);
                    let el = document.getElementById('pc-'+n);
                    if(!el || this.rp.has(n)) continue;
                    try {
                        let pg = await this.pdf.getPage(n), vp = pg.getViewport({scale:2}), cv = document.createElement('canvas');
                        cv.width = vp.width; cv.height = vp.height;
                        await pg.render({canvasContext:cv.getContext('2d'), viewport:vp}).promise;
                        el.innerHTML = ''; el.appendChild(cv); this.rp.add(n);
                    } catch(e) {}
                }
                this.ir = false;
            }
            update() {
                if(!this.pf) return;
                let i = this.pf.getCurrentPageIndex();
                document.getElementById('pi').textContent = (i+1) + " / " + this.tp;
                document.getElementById('ps').value = i;
                document.getElementById('pb').disabled = i === 0;
                document.getElementById('nb').disabled = i >= this.tp-1;
            }
            genIndex() {
                let list = document.getElementById('index-list');
                for(let i=1; i<=this.tp; i++) {
                    let d = document.createElement('div'); d.className = 'item';
                    d.innerHTML = '<span>Page ' + i + '</span><i class="fas fa-chevron-right text-[10px] opacity-20"></i>';
                    d.onclick = () => { this.pf.flip(i-1); toggleModal('index-modal'); };
                    list.appendChild(d);
                }
            }
            setup() {
                document.getElementById('pb').onclick = () => this.pf.flipPrev();
                document.getElementById('nb').onclick = () => this.pf.flipNext();
                document.getElementById('ps').oninput = e => this.pf.flip(+e.target.value);
                document.getElementById('zi').onclick = () => { this.zoom = Math.min(this.zoom+0.2, 3); this.applyZoom(); };
                document.getElementById('zo').onclick = () => { this.zoom = Math.max(this.zoom-0.2, 0.5); this.applyZoom(); };
                document.getElementById('m-btn').onclick = () => this.toggleLayout();
                
                document.getElementById('detect-zone-top').onmouseenter = () => this.showUI(true);
                document.getElementById('detect-zone-bottom').onmouseenter = () => this.showUI(true);
                document.getElementById('main-hdr').onmouseleave = () => this.showUI(false);
                document.getElementById('main-ft').onmouseleave = () => this.showUI(false);

                document.onkeydown = e => { 
                    if(e.key==='ArrowLeft') this.pf.flipPrev();
                    if(e.key==='ArrowRight') this.pf.flipNext();
                    if(e.key==='f') this.toggleLayout();
                };
                let sx=0; document.ontouchstart=e=>sx=e.touches[0].clientX;
                document.ontouchend=e=>{
                    let dx=sx-e.changedTouches[0].clientX;
                    if(Math.abs(dx)>50) dx>0?this.pf.flipNext():this.pf.flipPrev();
                };
                window.onresize = () => this.build();
            }
            toggleLayout() {
                this.full = !this.full;
                document.body.classList.toggle('full-mode', this.full);
                document.getElementById('m-btn').innerHTML = this.full ? '<i class="fas fa-compress-alt"></i>' : '<i class="fas fa-expand"></i>';
                this.zoom = 1; this.applyZoom(); this.build();
            }
            showUI(v) { if(this.full) { document.getElementById('main-hdr').classList.toggle('v', v); document.getElementById('main-ft').classList.toggle('v', v); } }
            applyZoom() {
                document.getElementById('b-t').style.transform = 'scale('+this.zoom+')';
                document.getElementById('ztxt').textContent = Math.round(this.zoom*100)+'%';
            }
        }
        window.openBook = () => {
            document.getElementById('c-b').classList.add('a-f-o');
            setTimeout(() => {
                document.getElementById('c-b').style.display='none';
                document.getElementById('b-t').classList.add('open');
            }, 800);
        }
        window.toggleModal = (id) => document.getElementById(id).classList.toggle('o');
        window.setBg = (c) => document.body.style.background = c;
        new PDFViewer();
    </script>
</body>
</html>`;
}

export function epubViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean): string {
  const bg = (settings.background as string) || '#f3f0e8';
  const accent = (settings.accent_color as string) || '#4f46e5';
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
    <title>${safeTitle} — FlipRead</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: ${bg}; background-size: cover; background-position: center; transition: background 0.5s ease; overflow: hidden; height: 100vh; font-family: sans-serif; }
        #s-c { position: absolute; inset: 50px 0; display: flex; align-items: center; justify-content: center; perspective: 3500px; overflow: hidden; transition: opacity 0.5s ease; width: 100%; height: calc(100vh - 100px); }
        #s-c.full { inset: 0 !important; }
        #b-t { position: relative; width: 98%; height: 98%; transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease; transform-style: preserve-3d; opacity: 0; pointer-events: none; }
        #b-t.open { opacity: 1; pointer-events: auto; }
        #b-v { width: 100%; height: 100%; background: white; box-shadow: 0 30px 70px rgba(0,0,0,0.4); position: relative; border-left: 6px solid #e0e0e0; border-right: 6px solid #e0e0e0; transition: transform 0.15s ease, opacity 0.15s ease; }
        #spine { position: absolute; left: 50%; top: 0; bottom: 0; width: 60px; transform: translateX(-50%); background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0) 100%); pointer-events: none; z-index: 50; mix-blend-mode: multiply; }
        @media(max-width:768px){ #spine { display: none; } }
        
        .c-b { position: absolute; z-index: 200; width: 45vh; height: 65vh; transform-style: preserve-3d; transition: transform 0.5s ease; cursor: pointer; border: none !important; outline: none !important; }
        .c-v { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; box-shadow: -15px 15px 40px rgba(0,0,0,0.5); background: #1a1a1a; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 0; font-weight: bold; overflow: hidden; border: none !important; }
        .c-b::before { content: ''; position: absolute; inset: 0 0 0 -30px; transform: rotateY(-90deg); transform-origin: right; background: linear-gradient(to right, #333, #111, #333); border-radius: 4px 0 0 4px; }
        
        .a-f-o { animation: fO 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; pointer-events: none; }
        .a-f-c { animation: fC 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; }
        .a-b-a { animation: bA 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; }
        .a-b-h { animation: bH 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; pointer-events: none; }

        @keyframes fO { 0% { transform: rotateY(0); opacity: 1; } 40% { transform: rotateY(-60deg) translateZ(50px); opacity: 1; } 100% { transform: rotateY(-180deg) translateZ(200px) scale(1.5); opacity: 0; } }
        @keyframes fC { 0% { transform: rotateY(-180deg) translateZ(200px) scale(1.5); opacity: 0; } 60% { transform: rotateY(-60deg) translateZ(50px); opacity: 1; } 100% { transform: rotateY(0); opacity: 1; } }
        @keyframes bA { 0% { transform: rotateY(180deg) translateZ(200px) scale(1.5); opacity: 0; } 60% { transform: rotateY(60deg) translateZ(50px); opacity: 1; } 100% { transform: rotateY(0); opacity: 1; } }
        @keyframes bH { 0% { transform: rotateY(0); opacity: 1; } 40% { transform: rotateY(60deg) translateZ(50px); opacity: 1; } 100% { transform: rotateY(180deg) translateZ(200px) scale(1.5); opacity: 0; } }
        
        #h-m { position: fixed; z-index: 1000; background: ${accent}; color: white; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; display: none; box-shadow: 0 10px 20px rgba(0,0,0,0.3); transform: translateX(-50%); }
        #h-m::after { content: ''; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: ${accent} transparent transparent transparent; }
        
        #f-l { position: absolute; inset: 0; background: #fff; z-index: 100; pointer-events: none; display: none; transform-style: preserve-3d; background: linear-gradient(to right, #eee 0%, #fff 10%, #fff 90%, #ddd 100%); border-radius: 2px; }
        .f-n { display: block !important; width: 50%; right: 0; transform-origin: left; animation: fn 0.8s forwards; }
        @keyframes fn { 0% { transform: rotateY(0); } 100% { transform: rotateY(-180deg); } }
        
        .hdr { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; transition: all 0.4s; }
        .ft { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; height: 48px; display: flex; align-items: center; justify-content: center; gap: 40px; transition: all 0.4s; opacity: 0; pointer-events: none; }
        .ft.open-state { opacity: 1; pointer-events: auto; }
        
        /* Tabs */
        .tab-btn { padding: 8px 16px; font-size: 10px; font-weight: bold; text-transform: uppercase; cursor: pointer; border-bottom: 2px solid transparent; opacity: 0.5; transition: 0.2s; }
        .tab-btn.active { opacity: 1; border-color: ${accent}; }
        .tab-content { display: none; padding: 20px 0; }
        .tab-content.active { display: block; }
        
        /* Night Shift & Texture */
        body.night-shift { filter: sepia(0.6) brightness(0.9); }
        #texture-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 10; opacity: 0.05; background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png'); display: none; }
        body.textured #texture-overlay { display: block; }

        .search-item { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; border-radius: 8px; transition: 0.2s; }
        .search-item:hover { background: rgba(255,255,255,0.05); }
        .search-match { color: ${accent}; font-weight: bold; background: rgba(255,165,0,0.2); }

        /* Full Screen Styles */
        body.full-mode .hdr { transform: translateY(-100%); opacity: 0; pointer-events: none; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); color: white; border-bottom: 1px solid rgba(255,255,255,0.1); }
        body.full-mode .ft { transform: translateY(100%); opacity: 0; pointer-events: none; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); color: white; border-top: 1px solid rgba(255,255,255,0.1); }
        body.full-mode .hdr.v, body.full-mode .ft.v { transform: translateY(0); opacity: 1; pointer-events: auto; }
        body.full-mode .ib { background: rgba(255,255,255,0.1); color: white; }
        body.full-mode .zoom-pill { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); color: white; }

        #detect-zone-top, #detect-zone-bottom { position: fixed; left: 0; right: 0; height: 50px; z-index: 95; }
        #detect-zone-top { top: 0; }
        #detect-zone-bottom { bottom: 0; }

        .ib { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: all 0.2s; outline: none !important; }
        .ib:hover { transform: scale(1.05); }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 500; display: none; align-items: center; justify-content: center; }
        .modal.o { display: flex; }
        .modal-c { background: #1c1c1c; width: 90%; max-width: 400px; max-height: 85vh; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); color: #eee; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); }
        @media(min-width:1024px){ 
            .modal-c { max-width: 500px; }
            .modal-c select, .modal-c button, .modal-c .text-[11px] { font-size: 13px !important; }
            .modal-c .tab-btn { font-size: 11px !important; padding: 12px 20px; }
            .modal-c p.text-[9px] { font-size: 10px !important; }
        }
        .br { position: fixed; bottom: 52px; right: 12px; z-index: 200; font-size: 10px; color: rgba(255,255,255,0.2); text-decoration: none; }
        
        #end-controls { position: absolute; bottom: 15%; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; opacity: 0; pointer-events: none; transition: 0.5s; z-index: 300; }
        #end-controls.v { opacity: 1; pointer-events: auto; }
        .eb { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 11px; text-transform: uppercase; }
        .eb:hover { background: white; color: black; }

        @media(max-width:768px){ #b-v { border-right: none; } #f-l { display:none; } }
    </style>
</head>
<body class="fit-mode">
    <div id="texture-overlay"></div>
    <div id="ld" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
        </div>
        <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Preparing Book...</p>
    </div>

    <div id="detect-zone-top"></div>
    <header class="hdr" id="main-hdr">
        <div class="flex items-center gap-4">
            <button class="ib" onclick="toggleTOC()"><i class="fas fa-list-ul"></i></button>
            <h1 class="font-bold text-xs truncate max-w-[150px] sm:max-w-none opacity-80">${safeTitle}</h1>
        </div>
        <div class="flex items-center gap-2">
            <button class="ib" onclick="toggleSearch()" title="Search Box"><i class="fas fa-search"></i></button>
            <button class="ib" onclick="toggleTTS()" id="tts-btn" title="Text to Speech"><i class="fas fa-volume-up"></i></button>
            <button class="ib" onclick="toggleModal('bg-m')" title="Reader Settings"><i class="fas fa-cog"></i></button>
            <div class="flex rounded-full px-2 py-1 gap-2 items-center zoom-pill">
                <button onclick="zoom(-10)" class="px-1 text-xs">-</button>
                <span id="z-v" class="text-[10px] font-mono min-w-[30px] text-center">100%</span>
                <button onclick="zoom(10)" class="px-1 text-xs">+</button>
                <button onclick="resetZoom()" class="ml-1 opacity-40 hover:opacity-100 flex items-center justify-center" style="height: 100%;" title="Reset Zoom"><i class="fas fa-redo-alt text-[8px]"></i></button>
            </div>
            <button class="ib" id="m-btn" onclick="toggleLayout()"><i class="fas fa-expand"></i></button>
        </div>
    </header>

    <div id="s-c">
        <div id="c-b" class="c-b" onclick="openBook()">
            <div class="c-v" id="c-v-inner">
                ${coverUrl ? '<img src="' + coverUrl + '" style="width:100%;height:100%;object-fit:cover;">' : '<div class="flex flex-col gap-2"><span>' + safeTitle + '</span><span class="text-[9px] opacity-40">READ NOW</span></div>'}
            </div>
        </div>
        <div id="back-c" class="c-b !hidden" onclick="openFromBack()">
            <div class="c-v" style="background: linear-gradient(135deg, #ffcfd2 0%, #d1d1f9 50%, #c1e1c1 100%); border: 1px solid rgba(0,0,0,0.05); color: #1a1a1a; display: flex; flex-direction: column;">
                <div class="flex-1 flex flex-col items-center justify-center pt-10">
                    <span class="text-2xl mb-2 font-black tracking-tighter opacity-80">THE END</span>
                    <span class="text-[10px] opacity-40 uppercase tracking-[0.3em] font-medium">Thank you for reading</span>
                </div>
                <div class="flex gap-2 mb-8 justify-center px-4" onclick="event.stopPropagation()">
                    <button class="eb !bg-black/90 !text-white !border-none !px-4" onclick="openFromBack()">Flip Open</button>
                    <button class="eb !bg-white/90 !text-black !border-black/5 !px-4" onclick="restartBook()">Start Over</button>
                </div>
            </div>
        </div>
        <div id="end-controls"></div>
        <div id="b-t">
            <div id="b-v"></div>
            <div id="spine"></div>
        </div>
    </div>

    <div id="detect-zone-bottom"></div>
    <div id="nav-l" class="fixed top-[50px] bottom-[50px] left-0 w-[15%] z-[80] cursor-pointer" onclick="prev()"></div>
    <div id="nav-r" class="fixed top-[50px] bottom-[50px] right-0 w-[15%] z-[80] cursor-pointer" onclick="next()"></div>
    <footer class="ft" id="main-ft">
        <button class="ib rounded-full" onclick="prev()"><i class="fas fa-chevron-left"></i></button>
        <div id="pi" class="text-[10px] opacity-70 font-bold tracking-widest uppercase">Page -- / --</div>
        <button class="ib rounded-full" onclick="next()"><i class="fas fa-chevron-right"></i></button>
    </footer>

    ${showBranding ? '<a class="br" href="https://flipread.pages.dev" target="_blank">FlipRead</a>' : ''}
    <div id="h-m"><i class="fas fa-highlighter mr-1"></i> Highlight</div>

    <div id="toc-m" class="modal" onclick="toggleTOC()">
        <div class="modal-c" onclick="event.stopPropagation()">
            <div class="p-4 border-b border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                Contents <button onclick="toggleTOC()">✕</button>
            </div>
            <div id="t-l" class="p-2 overflow-y-auto flex-1"></div>
        </div>
    </div>

    <div id="bg-m" class="modal" onclick="toggleModal('bg-m')">
        <div class="modal-c !w-[450px]" onclick="event.stopPropagation()">
             <div class="flex border-b border-white/10 px-4">
                <div class="tab-btn active" onclick="switchTab(event, 't-ty')">Display</div>
                <div class="tab-btn" onclick="switchTab(event, 't-am')">Experience</div>
                <div class="tab-btn" onclick="switchTab(event, 't-hi')">Highlights</div>
             </div>
             <div class="p-6 overflow-y-auto max-h-[60vh]">
                <!-- Display Tab -->
                <div id="t-ty" class="tab-content active">
                    <p class="text-[9px] uppercase opacity-40 mb-4 tracking-widest font-bold">Typography</p>
                    <div class="flex flex-col gap-4 mb-8">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px]">Font Size</span>
                            <div class="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
                                <button onclick="changeFontSize(-10)" class="px-3 py-1 hover:bg-white/10 text-xs border-r border-white/10">-</button>
                                <span id="fs-v" class="px-3 py-1 text-[10px] min-w-[45px] text-center">100%</span>
                                <button onclick="changeFontSize(10)" class="px-3 py-1 hover:bg-white/10 text-xs">+</button>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[11px]">Line Height</span>
                            <input type="range" min="1" max="2.5" step="0.1" value="1.6" oninput="setLH(this.value)" class="w-24 accent-${accent}">
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[11px]">Font Style</span>
                            <select onchange="setFF(this.value)" class="bg-black/40 text-[10px] border border-white/10 rounded px-2 py-1 outline-none">
                                <option value="Georgia, serif">Serif (Georgia)</option>
                                <option value="Inter, sans-serif">Sans (Inter)</option>
                                <option value="Monaco, monospace">Mono (Clean)</option>
                                <option value="'OpenDyslexic', sans-serif">OpenDyslexic</option>
                            </select>
                        </div>
                    </div>
                    <p class="text-[9px] uppercase opacity-40 mb-4 tracking-widest font-bold">Backgrounds</p>
                    <div class="grid grid-cols-6 gap-2 mb-4">
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" style="background:#ffffff" onclick="setBg('#ffffff', false)"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" style="background:#f3f0e8" onclick="setBg('#f3f0e8', false)"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" style="background:#fafafa" onclick="setBg('#fafafa', false)"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" style="background:#111827" onclick="setBg('#111827', true)"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" style="background:#1a1a1a" onclick="setBg('#1a1a1a', true)"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" style="background:#000000" onclick="setBg('#000000', true)"></div>
                    </div>
                </div>

                <!-- Experience Tab -->
                <div id="t-am" class="tab-content">
                    <p class="text-[9px] uppercase opacity-40 mb-4 tracking-widest font-bold">Atmosphere</p>
                    <div class="flex flex-col gap-4 mb-6">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px]">Night Shift</span>
                            <button onclick="toggleNight()" id="ns-btn" class="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-bold uppercase transition">NOT ACTIVE</button>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[11px]">Paper Texture</span>
                            <button onclick="toggleTexture()" id="pt-btn" class="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-bold uppercase transition">OFF</button>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="text-[11px]">Ambient Sound</span>
                            <select id="amb-s" onchange="playAmbient(this.value)" class="bg-black/40 text-[10px] border border-white/10 rounded px-2 py-2 outline-none">
                                <option value="none">None (Silent)</option>
                                <option value="rain">Gentle Rain</option>
                                <option value="fire">Crackling Fire</option>
                                <option value="library">Library Ambience</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Highlights Tab -->
                <div id="t-hi" class="tab-content">
                    <div id="hi-l" class="flex flex-col gap-3">
                        <p class="text-[10px] text-center opacity-40 py-10">No highlights yet. Select text in the book to add them.</p>
                    </div>
                </div>
                
                <div class="pt-4 border-t border-white/5">
                    <input type="file" id="bg-in" class="hidden" accept="image/*" onchange="loadBg(event)">
                    <button class="w-full py-3 bg-white/5 hover:bg-white/20 rounded-xl text-[10px] uppercase font-bold tracking-widest transition" onclick="document.getElementById('bg-in').click()">
                        <i class="fas fa-image mr-2"></i> Custom Wallpaper
                    </button>
                </div>
             </div>
        </div>
    </div>

    <!-- Search Modal -->
    <div id="search-m" class="modal" onclick="toggleSearch()">
        <div class="modal-c !w-[400px]" onclick="event.stopPropagation()">
            <div class="p-4 border-b border-white/10 flex gap-3">
                <input type="text" id="s-q" placeholder="Search in book..." class="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none" onkeyup="if(event.key==='Enter')doSearch()">
                <button onclick="doSearch()" class="px-5 bg-${accent} text-white rounded-lg font-bold text-xs uppercase">Find</button>
            </div>
            <div id="s-r" class="p-4 overflow-y-auto max-h-[60vh] flex flex-col gap-2">
                <p class="text-center opacity-40 text-xs py-10">Results will appear here...</p>
            </div>
        </div>
    </div>

    <script>
        const FU='${fileUrl}', SLD='fr_pos_${fileUrl}'; let book, rend, z=100, full=false, isAnimating = false;
        let fz = 100, ff = "Georgia, serif", lh = 1.6;
        let highlights = JSON.parse(localStorage.getItem('fr_hi_'+FU) || '[]');
        let syn = window.speechSynthesis, speaking = false, utter;
        let amb;

        async function init(){
            try {
                let r=await fetch(FU),d=await r.arrayBuffer();
                book=ePub(d);
                
                if (!'${coverUrl}') {
                    let cov=await book.coverUrl();
                    if(cov) document.getElementById('c-v-inner').innerHTML = '<img src="'+cov+'" style="width:100%;height:100%;object-fit:cover;">';
                }

                rend=book.renderTo('b-v',{width:'100%',height:'100%',spread:window.innerWidth>768?'auto':'none'});
                
                rend.on('relocated', l => {
                    localStorage.setItem(SLD, l.start.cfi);
                    const start = l.start.displayed.page || 1;
                    const total = book.locations.total || '--';
                    const isSpread = window.innerWidth > 768;
                    const end = (isSpread && l.end?.displayed) ? l.end.displayed.page : null;
                    document.getElementById('pi').textContent = 'Page ' + start + (end ? '-' + end : '') + ' / ' + total;
                    if(rend) rend.resize();
                });

                const savedPos = localStorage.getItem(SLD);
                await (savedPos ? rend.display(savedPos) : rend.display());
                
                document.getElementById('ld').style.opacity='0';
                setTimeout(()=>document.getElementById('ld').style.display='none', 500);
                
                let nav=await book.loaded.navigation, tl=document.getElementById('t-l');
                nav.toc.forEach(c => {
                    let i=document.createElement('div'); i.className='p-4 hover:bg-white/5 cursor-pointer rounded-xl transition text-sm text-white/60 hover:text-white';
                    i.textContent=c.label; i.onclick=()=>{rend.display(c.href); toggleTOC();};
                    tl.appendChild(i);
                });

                rend.hooks.content.register(contents => {
                    contents.addStylesheetRules({
                        "body": { "font-family": ff + " !important", "font-size": fz + "% !important", "line-height": lh + " !important", "padding": "25px 20px !important" },
                        "img": { "max-width": "100%", "height": "auto" }
                    });
                    const hm = document.getElementById('h-m');
                    const checkSelection = (e) => {
                        const sel = contents.window.getSelection();
                        const t = sel.toString().trim();
                        if(t.length > 3) {
                            const rect = sel.getRangeAt(0).getBoundingClientRect();
                            const iframe = document.querySelector('iframe');
                            const irect = iframe.getBoundingClientRect();
                            hm.style.left = (irect.left + rect.left + rect.width/2) + 'px';
                            hm.style.top = (irect.top + rect.top - 40) + 'px';
                            hm.style.display = 'block';
                            hm.onclick = () => {
                                addHighlight(t, rend.currentLocation().start.cfi);
                                hm.style.display = 'none';
                                sel.removeAllRanges();
                            };
                        } else {
                            hm.style.display = 'none';
                        }
                    };
                    contents.document.addEventListener('mouseup', checkSelection);
                    contents.document.addEventListener('touchend', checkSelection);
                    contents.document.addEventListener('mousedown', () => hm.style.display = 'none');
                });
                book.ready.then(() => {
                    book.locations.generate(1000).then(() => {
                        const loc = rend.currentLocation();
                        if(loc) {
                            const total = book.locations.total || '--';
                            document.getElementById('pi').textContent = 'Page ' + loc.start.displayed.page + ' / ' + total;
                        }
                    });
                });
                renderHighlights();
            } catch(e) { console.error(e); }
        }

        function openBook(){
            document.getElementById('c-b').classList.remove('a-f-c');
            document.getElementById('c-b').classList.add('a-f-o');
            setTimeout(() => {
                document.getElementById('c-b').style.display='none';
                document.getElementById('b-t').classList.add('open');
                document.getElementById('main-ft').classList.add('open-state');
            }, 800);
        }
        function closeToBack(){
            document.getElementById('b-t').classList.remove('open');
            document.getElementById('main-ft').classList.remove('open-state');
            const bc = document.getElementById('back-c');
            bc.classList.remove('!hidden', 'a-b-h');
            bc.style.display = 'flex';
            bc.classList.add('a-b-a');
        }
        function openFromBack(){
            const bc = document.getElementById('back-c');
            bc.classList.remove('a-b-a');
            bc.classList.add('a-b-h');
            setTimeout(() => {
                bc.style.display='none';
                document.getElementById('b-t').classList.add('open');
                document.getElementById('main-ft').classList.add('open-state');
            }, 800);
        }
        function closeToFront(){
            document.getElementById('b-t').classList.remove('open');
            document.getElementById('main-ft').classList.remove('open-state');
            const cb = document.getElementById('c-b');
            cb.style.display = 'flex';
            cb.classList.remove('a-f-o');
            cb.classList.add('a-f-c');
        }
        function restartBook(){ closeToFront(); document.getElementById('back-c').style.display='none'; rend.display(); }

        function toggleLayout() {
            full = !full;
            document.body.classList.toggle('full-mode', full);
            document.getElementById('s-c').classList.toggle('full', full);
            document.getElementById('m-btn').innerHTML = full ? '<i class="fas fa-compress-alt"></i>' : '<i class="fas fa-expand"></i>';
            if(full) {
                window.onmousemove = (e) => {
                    if(!full) return;
                    if(e.clientY < 60) document.getElementById('main-hdr').classList.add('v');
                    else if(e.clientY > window.innerHeight - 60) document.getElementById('main-ft').classList.add('v');
                    else {
                        document.getElementById('main-hdr').classList.remove('v');
                        document.getElementById('main-ft').classList.remove('v');
                    }
                };
            } else {
                window.onmousemove = null;
                document.getElementById('main-hdr').classList.remove('v');
                document.getElementById('main-ft').classList.remove('v');
            }
            setTimeout(() => { if (rend) rend.resize(); }, 500);
        }

        function addHighlight(t, cfi){
            highlights.push({t, cfi, d: new Date().toLocaleDateString()});
            localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
            renderHighlights();
        }
        function renderHighlights(){
            const container = document.getElementById('hi-l');
            if(highlights.length === 0) return;
            container.innerHTML = highlights.map(h => 
                '<div class="search-item" onclick="rend.display(\\\'' + h.cfi + '\\\')">' +
                '<p class="text-xs line-clamp-2 italic opacity-80">"' + h.t + '"</p>' +
                '<p class="text-[9px] opacity-40 mt-1">' + h.d + '</p>' +
                '</div>'
            ).join('');
        }
        
        function switchTab(e, id){
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(id).classList.add('active');
        }

        function toggleSearch(){ document.getElementById('search-m').classList.toggle('o'); }
        async function doSearch(){
            const q = document.getElementById('s-q').value, res = document.getElementById('s-r');
            if(!q) return;
            res.innerHTML = '<p class="text-center py-10 opacity-40 animate-pulse text-xs">Hunting for words...</p>';
            const results = await Promise.all(
                book.spine.spineItems.map(item => item.load(book.load.bind(book)).then(doc => {
                    const matches = [], regex = new RegExp(q, 'gi');
                    let text = doc.body.innerText;
                    let m;
                    while((m = regex.exec(text)) !== null) {
                        matches.push({
                            cfi: item.cfiFromElement(doc.body),
                            excerpt: text.substring(Math.max(0, m.index - 40), Math.min(text.length, m.index + 60))
                        });
                        if(matches.length > 5) break;
                    }
                    item.unload();
                    return matches;
                }))
            );
            const flat = results.flat();
            res.innerHTML = flat.length ? flat.map(r => 
                '<div class="search-item" onclick="rend.display(\\\'' + r.cfi + '\\\');toggleSearch();">' +
                '<p class="text-xs opacity-80">...' + r.excerpt.replace(new RegExp(q, 'gi'), '<span class="search-match">$&</span>') + '...</p>' +
                '</div>'
            ).join('') : '<p class="text-center py-10 opacity-40 text-xs">No matches found.</p>';
        }

        function toggleTTS(){
            if(speaking) { syn.cancel(); speaking = false; document.getElementById('tts-btn').classList.remove('text-indigo-400'); return; }
            const text = rend.getContents()[0].document.body.innerText;
            utter = new SpeechSynthesisUtterance(text);
            utter.onend = () => { speaking = false; document.getElementById('tts-btn').classList.remove('text-indigo-400'); };
            syn.speak(utter); speaking = true;
            document.getElementById('tts-btn').classList.add('text-indigo-400');
        }

        function playAmbient(type){
            if(amb) { amb.pause(); amb = null; }
            if(type === 'none') return;
            const urls = {
                rain: 'https://ia802901.us.archive.org/32/items/RainSoundEffect/RainSoundEffect.mp3',
                fire: 'https://ia800908.us.archive.org/29/items/fireplace-crackling-sound-1.mp3/fireplace-crackling-sound-1.mp3',
                library: 'https://ia601202.us.archive.org/25/items/coffe-shop-ambience-loop-14-min/COFFE%20SHOP%20AMBIENCE%20LOOP%2014%20min.mp3'
            };
            amb = new Audio(urls[type]);
            amb.loop = true; amb.play().catch(e => console.error('Audio failed:', e));
        }

        function toggleNight() { 
            const active = document.body.classList.toggle('night-shift');
            document.getElementById('ns-btn').textContent = active ? 'ACTIVE' : 'NOT ACTIVE';
        }
        function toggleTexture() { 
            const active = document.body.classList.toggle('textured');
            document.getElementById('pt-btn').textContent = active ? 'ON' : 'OFF';
        }

        function setFF(v){ ff=v; applyStyles(); }
        function setLH(v){ lh=v; applyStyles(); }
        function changeFontSize(v){ fz=Math.max(50,Math.min(200,fz+v)); applyStyles(); }
        
        function applyStyles(){
            if(rend){
                rend.display(rend.currentLocation()?.start?.cfi);
            }
            document.getElementById('fs-v').textContent = fz + "%";
        }

        function setBg(c, isDark){ 
            document.body.style.background = c; document.body.style.backgroundImage = 'none';
            document.body.classList.toggle('light-ui', isDark);
        }
        function loadBg(e){
            const f = e.target.files[0]; if(!f) return;
            const r = new FileReader();
            r.onload = (ev) => {
                document.body.style.backgroundImage = 'url(' + ev.target.result + ')';
                document.body.style.backgroundSize = 'cover';
                document.body.classList.add('light-ui'); toggleModal('bg-m');
            };
            r.readAsDataURL(f);
        }

        function zoom(v){ z=Math.max(50,Math.min(200,z+v)); document.getElementById('b-t').style.transform='scale('+(z/100)+')'; document.getElementById('z-v').textContent=z+'%'; }
        function resetZoom(){ z=100; document.getElementById('b-t').style.transform='scale(1)'; document.getElementById('z-v').textContent='100%'; }
        
        function prev(){ flip('p'); } function next(){ flip('n'); }
        function flip(d){
            if(!rend || isAnimating) return;
            const loc = rend.currentLocation();
            if(!loc) return;
            if(d === 'p' && loc.atStart && loc.start.index <= 0) { closeToFront(); return; }
            if(d === 'n' && loc.atEnd && loc.end.index >= book.spine.length - 1) { closeToBack(); return; }
            isAnimating = true;
            const mobile = window.innerWidth < 768;
            const bv = document.getElementById('b-v');
            if (mobile) {
                bv.style.transition = 'transform 0.15s ease-in, opacity 0.15s ease-in';
                bv.style.transform = d === 'n' ? 'translateX(-120%)' : 'translateX(120%)';
                bv.style.opacity = '0.8';
                setTimeout(() => {
                    const action = d === 'n' ? rend.next() : rend.prev();
                    action.then(() => {
                        bv.style.transition = 'none'; bv.style.transform = d === 'n' ? 'translateX(120%)' : 'translateX(-120%)';
                        void bv.offsetWidth; bv.style.transition = 'transform 0.15s ease-out, opacity 0.15s ease-out';
                        bv.style.transform = 'translateX(0)'; bv.style.opacity = '1'; isAnimating = false;
                    });
                }, 150);
            } else {
                bv.style.transition = 'transform 0.15s ease-in';
                bv.style.transform = d === 'n' ? 'rotateY(90deg)' : 'rotateY(-90deg)';
                setTimeout(() => {
                    const action = d === 'n' ? rend.next() : rend.prev();
                    action.then(() => {
                        bv.style.transition = 'none'; bv.style.transform = d === 'n' ? 'rotateY(-90deg)' : 'rotateY(90deg)';
                        void bv.offsetWidth; bv.style.transition = 'transform 0.15s ease-out'; bv.style.transform = 'rotateY(0)'; isAnimating = false;
                    });
                }, 150);
            }
        }

        function toggleTOC(){ 
            const m = document.getElementById('toc-m');
            if(!m.classList.contains('o')) {
                if(document.getElementById('b-t').style.opacity === '0' || !document.getElementById('b-t').classList.contains('open')) openBook();
            }
            m.classList.toggle('o'); 
        }
        function toggleModal(id){ document.getElementById(id).classList.toggle('o'); }
        
        document.onkeydown=e=>{ if(e.key==='ArrowLeft')prev(); if(e.key==='ArrowRight')next(); if(e.key==='f')toggleLayout(); };
        document.addEventListener('wheel', e => { if(e.ctrlKey) { e.preventDefault(); e.deltaY < 0 ? zoom(10) : zoom(-10); } }, { passive: false });

        let rt; window.addEventListener('resize', () => {
            clearTimeout(rt); rt = setTimeout(() => { if (rend) { rend.settings.spread = window.innerWidth <= 768 ? 'none' : 'auto'; rend.resize(); } }, 250);
        });

        init();
    </script>
</body>
</html>`;
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
