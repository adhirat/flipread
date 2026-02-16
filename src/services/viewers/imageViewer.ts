
import { escapeHtml } from './viewerUtils';

export function imageViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = ''): string {
  const bg = (settings.background as string) || '#0a0a0f';
  const accent = (settings.accent_color as string) || '#4f46e5';
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>${safeTitle} — FlipRead</title>
    <link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
    <link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">
    <meta property="og:title" content="${safeTitle} — FlipRead">
    <meta property="og:description" content="Read this interactive flipbook on FlipRead.">
    <meta property="og:image" content="${coverUrl || fileUrl || logoUrl || '/logo.png'}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;overflow:hidden;background:${bg};height:100dvh;width:100vw;position:fixed;transition:background 0.3s ease;display:flex;align-items:center;justify-content:center}

        #img-container{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden}
        #main-img{max-width:90vw;max-height:85vh;object-fit:contain;border-radius:4px;transition:transform 0.3s ease;cursor:zoom-in;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
        #main-img.zoomed{cursor:grab;max-width:none;max-height:none}
        #main-img.zoomed.dragging{cursor:grabbing}

        .hdr{display:flex;align-items:center;justify-content:space-between;padding:0 15px;background:linear-gradient(to bottom,rgba(0,0,0,0.8),transparent);color:#fff;height:50px;z-index:1500;position:fixed;top:0;left:0;width:100%;pointer-events:auto;transition:all 0.4s}
        .ft{display:flex;align-items:center;justify-content:center;gap:15px;padding:10px;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);position:fixed;bottom:0;left:0;width:100%;z-index:1500;pointer-events:auto;transition:all 0.4s}
        body.light-ui .hdr{background:linear-gradient(to bottom,rgba(255,255,255,0.9),transparent);color:#1a1a1a}
        body.light-ui .ft{background:linear-gradient(to top,rgba(255,255,255,0.9),transparent);color:#1a1a1a}

        body.full-mode .hdr{transform:translateY(-100%);opacity:0}
        body.full-mode .ft{transform:translateY(100%);opacity:0}
        body.full-mode .hdr:hover,body.full-mode .ft:hover{transform:translateY(0);opacity:1}

        .nb{background:rgba(255,255,255,0.1);width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px;color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);transition:all .3s;border:none}
        .nb:hover{background:rgba(255,255,255,0.23);transform:scale(1.1)}
        body.light-ui .nb{background:rgba(0,0,0,0.05);color:#1a1a1a}
        body.light-ui .nb:hover{background:rgba(0,0,0,0.1)}

        .modal{position:fixed;inset:0;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;z-index:2500;backdrop-filter:blur(8px)}
        .modal.o{display:flex}
        .modal-c{background:#1c1c1c;border-radius:16px;width:95%;max-width:400px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);color:#fff;overflow:hidden;border:1px solid rgba(255,255,255,0.1)}
        body.light-ui .modal-c{background:#ffffff;color:#1a1a1a;border-color:rgba(0,0,0,0.1)}

        .br{position:fixed;bottom:60px;right:15px;z-index:200;font-size:10px;color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.2s}
        .br:hover{color:rgba(255,255,255,0.6)}

        .img-info{position:fixed;bottom:60px;left:15px;z-index:200;font-size:10px;color:rgba(255,255,255,0.4);display:flex;flex-direction:column;gap:2px}
        body.light-ui .img-info{color:rgba(0,0,0,0.4)}

        #zoom-cluster{display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.3);padding:2px 8px;border-radius:12px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1)}
        body.light-ui #zoom-cluster{background:rgba(255,255,255,0.8);border-color:rgba(0,0,0,0.1)}

        @media(max-width:768px){
            #main-img{max-width:95vw;max-height:80vh}
            #zoom-cluster{display:none!important}
        }
    </style>
</head>
<body>
    <div id="ld" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
        </div>
        <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Loading Image...</p>
    </div>

    <header class="hdr" id="main-hdr">
        <div class="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <img src="${logoUrl || '/logo.png'}" alt="Logo" class="h-6 w-6 object-contain rounded-sm" />
            <div class="font-bold text-xs sm:text-sm truncate opacity-90">${safeTitle}</div>
        </div>
        <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            <div id="zoom-cluster" class="flex items-center gap-1">
                <button id="zo" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition text-[10px]"><i class="fas fa-minus"></i></button>
                <div id="ztxt" class="text-[10px] font-mono w-[32px] text-center opacity-80">100%</div>
                <button id="zi" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition text-[10px]"><i class="fas fa-plus"></i></button>
            </div>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition hidden sm:flex" id="m-btn" title="Fullscreen"><i class="fas fa-expand text-xs"></i></button>
        </div>
    </header>

    <div id="img-container">
        <img id="main-img" src="${fileUrl}" alt="${safeTitle}" draggable="false">
    </div>

    <div class="ft !justify-between px-4" id="main-ft">
        <button class="nb" onclick="toggleModal('bg-modal')" title="Settings"><i class="fas fa-cog"></i></button>
        <button class="nb" onclick="downloadImg()" title="Download"><i class="fas fa-download"></i></button>
    </div>

    <div class="img-info" id="img-info"></div>

    <div id="bg-modal" class="modal" onclick="toggleModal('bg-modal')">
        <div class="modal-c !w-[500px] !max-w-[95vw]" onclick="event.stopPropagation()">
            <div class="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <span class="text-[11px] uppercase font-bold tracking-[0.2em] opacity-60">Viewer Settings</span>
                <button onclick="toggleModal('bg-modal')" class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition opacity-60 hover:opacity-100"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <p class="text-[11px] uppercase opacity-60 mb-4 tracking-widest font-bold text-white/50">Backgrounds</p>
                <div class="grid grid-cols-5 gap-3 mb-6">
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="Dark" style="background:#0a0a0f" onclick="setBg('#0a0a0f',true)"></div>
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="Charcoal" style="background:#1a1a1a" onclick="setBg('#1a1a1a',true)"></div>
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="Midnight" style="background:#0f172a" onclick="setBg('#0f172a',true)"></div>
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="White" style="background:#ffffff" onclick="setBg('#ffffff',false)"></div>
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="Light Grey" style="background:#f3f4f6" onclick="setBg('#f3f4f6',false)"></div>
                </div>
                <div class="pt-4 border-t border-white/10">
                    <button class="w-full py-3 bg-white/10 hover:bg-red-500/20 rounded-xl text-[11px] uppercase font-bold tracking-widest transition border border-white/10" onclick="resetSettings()">
                        <i class="fas fa-undo mr-2"></i> Reset
                    </button>
                </div>
            </div>
        </div>
    </div>

    ${showBranding ? '<a class="br" href="https://flipread.pages.dev" target="_blank">FlipRead</a>' : ''}

    <script>
        const FU='${fileUrl}';
        const img = document.getElementById('main-img');
        let zoom = 1;
        let isDragging = false;
        let dragStart = {x:0, y:0};
        let imgPos = {x:0, y:0};

        img.onload = () => {
            document.getElementById('ld').style.opacity='0';
            setTimeout(()=>document.getElementById('ld').style.display='none', 500);
            document.getElementById('img-info').innerHTML =
                img.naturalWidth + ' x ' + img.naturalHeight + ' px';
        };
        img.onerror = () => {
            document.getElementById('ld').innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i><p class="mt-4">Error Loading Image</p>';
        };

        // Zoom
        function applyZoom() {
            img.style.transform = 'translate('+imgPos.x+'px,'+imgPos.y+'px) scale('+zoom+')';
            document.getElementById('ztxt').textContent = Math.round(zoom*100)+'%';
            img.classList.toggle('zoomed', zoom > 1);
        }
        document.getElementById('zi').onclick = () => { zoom = Math.min(zoom+0.25, 5); applyZoom(); };
        document.getElementById('zo').onclick = () => { zoom = Math.max(zoom-0.25, 0.25); if(zoom<=1){imgPos={x:0,y:0}} applyZoom(); };

        // Click to zoom
        img.addEventListener('click', (e) => {
            if(isDragging) return;
            if(zoom > 1) { zoom = 1; imgPos = {x:0,y:0}; }
            else { zoom = 2; }
            applyZoom();
        });

        // Drag when zoomed
        img.addEventListener('mousedown', (e) => {
            if(zoom <= 1) return;
            isDragging = true;
            img.classList.add('dragging');
            dragStart = {x: e.clientX - imgPos.x, y: e.clientY - imgPos.y};
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if(!isDragging) return;
            imgPos = {x: e.clientX - dragStart.x, y: e.clientY - dragStart.y};
            applyZoom();
        });
        document.addEventListener('mouseup', () => { isDragging = false; img.classList.remove('dragging'); });

        // Touch drag
        let touchStart = null;
        img.addEventListener('touchstart', (e) => {
            if(zoom <= 1 || e.touches.length !== 1) return;
            touchStart = {x: e.touches[0].clientX - imgPos.x, y: e.touches[0].clientY - imgPos.y};
        }, {passive:true});
        img.addEventListener('touchmove', (e) => {
            if(!touchStart || zoom <= 1) return;
            imgPos = {x: e.touches[0].clientX - touchStart.x, y: e.touches[0].clientY - touchStart.y};
            applyZoom();
        }, {passive:true});
        img.addEventListener('touchend', () => { touchStart = null; }, {passive:true});

        // Mouse wheel zoom
        document.getElementById('img-container').addEventListener('wheel', (e) => {
            e.preventDefault();
            if(e.deltaY < 0) zoom = Math.min(zoom + 0.15, 5);
            else zoom = Math.max(zoom - 0.15, 0.25);
            if(zoom <= 1) imgPos = {x:0,y:0};
            applyZoom();
        }, {passive:false});

        // Layout
        document.getElementById('m-btn').onclick = () => {
            document.body.classList.toggle('full-mode');
            document.getElementById('m-btn').innerHTML = document.body.classList.contains('full-mode') ? '<i class="fas fa-compress-alt text-xs"></i>' : '<i class="fas fa-expand text-xs"></i>';
        };

        window.downloadImg = () => {
            const a = document.createElement('a');
            a.href = FU; a.download = '${safeTitle}'; a.click();
        };

        window.toggleModal = (id) => document.getElementById(id).classList.toggle('o');
        window.setBg = (c, isDark) => { document.body.style.background = c; document.body.classList.toggle('light-ui', !isDark); };
        window.resetSettings = () => { if(confirm('Reset?')) { localStorage.clear(); location.reload(); } };
    </script>
</body>
</html>`;
}
