
import { escapeHtml } from './viewerUtils';

export function documentViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = ''): string {
  const bg = (settings.background as string) || '#f3f0e8';
  const accent = (settings.accent_color as string) || '#4f46e5';
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${safeTitle} — FlipRead</title>
    <script src="https://unpkg.com/jszip/dist/jszip.min.js"></script>
    <script src="https://unpkg.com/docx-preview/dist/docx-preview.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;overflow:hidden;background:${bg};background-size:cover;background-position:center;height:100dvh;width:100vw;position:fixed;transition:background 0.3s ease}
        
        #doc-v { width: 100%; height: 100%; overflow: auto; display: flex; justify-content: center; padding: 50px 20px; -webkit-overflow-scrolling: touch; }
        #doc-c { background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 40px; min-height: 1000px; transform-origin: top center; transition: transform 0.1s ease-out; margin-bottom: 100px; }
        
        .hdr{display:flex;align-items:center;justify-content:space-between;padding:0 15px;background:linear-gradient(to bottom,rgba(0,0,0,0.8),transparent);color:#fff;height:50px;z-index:1500;position:fixed;top:0;left:0;width:100%;pointer-events:auto;transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1)}
        .ft{display:flex;align-items:center;justify-content:center;gap:15px;padding:10px;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);position:fixed;bottom:0;left:0;width:100%;z-index:1500;pointer-events:auto;transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1)}
        body.light-ui .hdr { background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent); color: #1a1a1a; }
        body.light-ui .ft { background: linear-gradient(to top, rgba(0,0,0,0.1), transparent); color: #1a1a1a; }
        body.light-ui .hdr-i { background: rgba(0,0,0,0.05); color: #1a1a1a; }
        body.light-ui #ztxt { color: #1a1a1a; }
        
        body.full-mode .hdr { transform: translateY(-100%); opacity: 0; }
        body.full-mode .ft { transform: translateY(100%); opacity: 0; }
        body.full-mode .hdr:hover, body.full-mode .hdr.v, body.full-mode .ft:hover, body.full-mode .ft.v { transform: translateY(0); opacity: 1; }

        .hdr-l{display:flex;align-items:center;gap:10px}
        .hdr-t{font-size:14px;font-weight:600;text-shadow:0 2px 4px rgba(0,0,0,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40vw}
        .hdr-r{display:flex;gap:10px;align-items:center}
        .hdr-i{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;color:#fff;font-size:14px;border:none;backdrop-filter:blur(10px)}
        .hdr-i:hover{background:rgba(255,255,255,0.2);transform:scale(1.05)}
        
        .nb{background:rgba(255,255,255,0.1);width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px;color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);transition:all .3s;border:none}
        .nb:hover{background:rgba(255,255,255,0.23);transform:scale(1.1)}
        
        .zc{display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.3);padding:2px 8px;border-radius:12px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1)}
        .zt{color:#fff;font-size:11px;min-width:35px;text-align:center;font-mono}
        
        .modal{position:fixed;inset:0;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;z-index:2500;backdrop-filter:blur(8px)}
        .modal.o{display:flex}
        .modal-c{background:#1c1c1c;border-radius:16px;width:95%;max-width:400px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);color:#fff;overflow:hidden;border:1px solid rgba(255,255,255,0.1)}
        .modal-h{padding:18px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center}
        .modal-b{overflow-y:auto;flex:1;padding:12px}
        
        .br{position:fixed;bottom:60px;right:15px;z-index:200;font-size:10px;color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.2s}
        .br:hover{color:rgba(255,255,255,0.6)}
        #zoom-cluster { display: flex; }
        
        .side-nav {
            position: fixed;
            top: 50.5%;
            transform: translateY(-50%);
            z-index: 1000;
            width: 44px;
            height: 44px;
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0.3;
        }
        .side-nav:hover {
            opacity: 1;
            background: rgba(255,255,255,0.15);
            transform: translateY(-50%) scale(1.1);
        }
        #side-prev { left: 24px; }
        #side-next { right: 24px; }
        @media(max-width:768px) {
            #doc-v { padding: 40px 15px; }
            #doc-c { width: 92%; padding: 20px; margin: 0 auto; box-shadow: none !important; }
            .side-nav { width: 36px; height: 36px; opacity: 0.15; }
            #side-prev { left: 12px; }
            #side-next { right: 12px; }
        }
        
        @media(max-width:768px){.zc,#f-btn,#zoom-cluster{display:none!important}}

        /* Chat Sidebar */
        #chat-w { position: fixed; right: -400px; top: 0; bottom: 0; width: 350px; background: rgba(20,20,20,0.85); backdrop-filter: blur(20px); z-index: 2100; border-left: 1px solid rgba(255,255,255,0.1); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; box-shadow: none; color: white; }
        #chat-w.o { right: 0; box-shadow: -20px 0 50px rgba(0,0,0,0.5); }
        .chat-h { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .chat-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }
        .chat-tab { flex: 1; padding: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; cursor: pointer; opacity: 0.5; border-bottom: 2px solid transparent; transition: 0.2s; }
        .chat-tab.active { opacity: 1; border-color: ${accent}; background: rgba(255,255,255,0.02); }
        .chat-b { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; }
        .chat-tab-c { display: none; width: 100%; }
        .chat-tab-c.active { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .chat-m { background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 16px; font-size: 13px; line-height: 1.5; color: #eee; width: 100%; position: relative; border: 1px solid rgba(255,255,255,0.05); }
        .search-item { border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin: 0; width: 100%; background: rgba(255,255,255,0.03); padding: 12px; }
        .chat-t { font-size: 9px; opacity: 0.3; margin-top: 4px; display: block; text-align: right; }
        .chat-f { padding: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 8px; background: rgba(0,0,0,0.2); }
        .chat-i { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 15px; color: #fff; outline: none; font-size: 13px; }
        .chat-i:focus { border-color: ${accent}; }
        .chat-s { width: 38px; height: 38px; border-radius: 10px; background: ${accent}; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: transform 0.2s; }
        .chat-s:hover { transform: scale(1.05); }
        body.light-ui #chat-w { background: rgba(248, 248, 248, 0.95); color: #1a1a1a; border-left-color: rgba(0,0,0,0.1); }
        body.light-ui .chat-h, body.light-ui .chat-tabs, body.light-ui .chat-export { border-bottom-color: rgba(0,0,0,0.1); }
        body.light-ui .chat-tab { color: #111; }
        body.light-ui .chat-m { background: white; color: #333; border-color: rgba(0,0,0,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        body.light-ui .chat-f { background: rgba(0,0,0,0.05); border-top-color: rgba(0,0,0,0.1); }
        body.light-ui .chat-i { background: #fff; border-color: rgba(0,0,0,0.2); color: #111; }
        
        body.light-ui .modal-c { background: #ffffff; color: #1a1a1a; border-color: rgba(0,0,0,0.1); box-shadow: 0 50px 100px -20px rgba(0,0,0,0.15); }
        body.light-ui .modal-c .tab-btn { color: #555; }
        body.light-ui .modal-c .tab-btn.active { color: #000; }
        body.light-ui .modal-c select { background: #f5f5f5; color: #111; border-color: rgba(0,0,0,0.1); }
        body.light-ui .modal-c .bg-white\/5 { background: rgba(0,0,0,0.05); }
        body.light-ui .modal-c .border-white\/10 { border-color: rgba(0,0,0,0.1); }
        body.light-ui .modal-c .text-white\/40, body.light-ui .modal-c .opacity-40 { opacity: 0.6; color: #666; }
        @media(max-width:768px){ 
            #bg-modal .modal-c { 
                width: 100vw !important; 
                height: 100dvh !important; 
                max-width: none !important; 
                max-height: none !important; 
                border-radius: 0 !important; 
            }
        }
    </style>
</head>
<body class="fit-mode light-ui" style="background: #ffffff">
    <div id="ld" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
        </div>
        <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Loading Document...</p>
    </div>

    <header class="hdr" id="main-hdr">
        <div class="flex items-center gap-3 flex-1 min-w-0 mr-2">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-6 w-6 object-contain rounded-sm" />` : ''}
            <div class="font-bold text-xs sm:text-sm truncate opacity-90">${safeTitle}</div>
        </div>
        <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            <div id="zoom-cluster" class="flex bg-white/5 rounded-full p-0.5 gap-0.5 items-center border border-white/10 backdrop-blur-md mx-1">
                <button id="zo" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition text-[10px]"><i class="fas fa-minus"></i></button>
                <div id="ztxt" class="text-[10px] font-mono w-[32px] text-center hidden sm:block opacity-80">100%</div>
                <button id="zi" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition text-[10px]"><i class="fas fa-plus"></i></button>
            </div>

            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition" onclick="toggleModal('bg-modal')" title="Settings"><i class="fas fa-cog text-xs"></i></button>
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition hidden sm:flex" id="m-btn" title="Toggle Layout"><i class="fas fa-expand text-xs"></i></button>
        </div>
    </header>

    <button id="side-prev" class="side-nav" onclick="prevDoc()"><i class="fas fa-chevron-left text-xs"></i></button>
    <button id="side-next" class="side-nav" onclick="nextDoc()"><i class="fas fa-chevron-right text-xs"></i></button>

    <div id="doc-v">
        <div id="doc-c"></div>
    </div>

    <div class="ft" id="main-ft">
        <button class="nb" onclick="toggleChat()"><i class="fas fa-comment-dots"></i></button>
    </div>

    <div id="chat-w">
        <div class="chat-h">
            <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">Personal Desk</span>
            <button onclick="toggleChat()" class="opacity-40 hover:opacity-100">✕</button>
        </div>
        <div class="chat-export px-5 py-2 border-b border-white/5 flex justify-end">
            <button onclick="exportNotes()" class="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 hover:text-${accent} transition"><i class="fas fa-file-export mr-1"></i> Export Data</button>
        </div>
        <div class="chat-tabs">
            <div class="chat-tab active" data-tab="chat-notes" onclick="switchSidebarTab(this)">Notes</div>
            <div class="chat-tab" data-tab="chat-highlights" onclick="switchSidebarTab(this)">Highlights</div>
        </div>
        <div class="chat-b">
            <div id="chat-notes" class="chat-tab-c active"></div>
            <div id="chat-highlights" class="chat-tab-c">
                <p class="text-[10px] text-center opacity-40 py-10 mt-20">Highlights feature coming soon for Documents.</p>
            </div>
        </div>
        <div class="chat-f" id="chat-footer">
            <div class="chat-i-w">
                <textarea id="chat-i" placeholder="Add a multi-line note..." class="chat-i" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendNote()}"></textarea>
                <button onclick="sendNote()" class="chat-s"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    </div>

    <div id="bg-modal" class="modal" onclick="toggleModal('bg-modal')">
        <div class="modal-c !w-[450px]" onclick="event.stopPropagation()">
            <div class="flex border-b border-white/10 px-4 items-center justify-between">
                <div class="flex overflow-x-auto no-scrollbar">
                    <div class="tab-btn active" onclick="switchTab(event, 'p-bg')">Appearance</div>
                    <div class="tab-btn" onclick="switchTab(event, 'p-am')">Experience</div>
                    <div class="tab-btn" onclick="switchTab(event, 'p-in')">Guide</div>
                </div>
                <button onclick="toggleModal('bg-modal')" class="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition mr-2">✕</button>
            </div>
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <div id="p-bg" class="tab-content active">
                    <p class="text-[9px] uppercase opacity-40 mb-4 tracking-widest font-bold">Backgrounds</p>
                    <div class="grid grid-cols-5 gap-3 mb-6">
                      <!-- Light -->
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Clean White" style="background:#ffffff" onclick="setBg('#ffffff', false)"></div>
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Light Grey" style="background:#f3f4f6" onclick="setBg('#f3f4f6', false)"></div>
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Cream" style="background:#fdfbf7" onclick="setBg('#fdfbf7', false)"></div>
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Paper Gradient" style="background:linear-gradient(135deg, #fdfbf7 0%, #ebedee 100%)" onclick="setBg('linear-gradient(135deg, #fdfbf7 0%, #ebedee 100%)', false)"></div>
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Light Wood" style="background:url('https://www.transparenttextures.com/patterns/wood-pattern.png') #e4d5b7" onclick="setBg('url(https://www.transparenttextures.com/patterns/wood-pattern.png) #e4d5b7', false)"></div>
                      
                      <!-- Dark -->
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Dark" style="background:#1a1a1a" onclick="setBg('#1a1a1a', true)"></div>
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Charcoal" style="background:#2c3e50" onclick="setBg('#2c3e50', true)"></div>
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Midnight" style="background:#0f172a" onclick="setBg('#0f172a', true)"></div>
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Metal" style="background:linear-gradient(135deg, #2c3e50 0%, #000000 100%)" onclick="setBg('linear-gradient(135deg, #2c3e50 0%, #000000 100%)', true)"></div>
                      <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Dark Wood" style="background:url('https://www.transparenttextures.com/patterns/wood-pattern.png') #2d241e" onclick="setBg('url(https://www.transparenttextures.com/patterns/wood-pattern.png) #2d241e', true)"></div>
                    </div>
                </div>
                    </div>
                </div>

                <!-- Guide Tab -->
                <div id="p-in" class="tab-content">
                    <p class="text-[9px] uppercase opacity-40 mb-4 tracking-widest font-bold">Quick Guide</p>
                    <div class="flex flex-col gap-4 text-[11px] leading-relaxed opacity-80">
                        <div class="flex gap-3">
                            <i class="fas fa-arrows-alt-v mt-1 text-${accent}"></i>
                            <p><b>Navigation:</b> Scroll vertically to read the document. You can also use the side arrows to jump sections.</p>
                        </div>
                        <div class="flex gap-3">
                            <i class="fas fa-magic mt-1 text-${accent}"></i>
                            <p><b>AI Chat:</b> Click the conversation bubble to ask the AI about the document, summarize pages, or clarify text.</p>
                        </div>
                        <div class="flex gap-3">
                            <i class="fas fa-cog mt-1 text-${accent}"></i>
                            <p><b>Customization:</b> Use this menu to adjust background colors and atmospheric focus sounds.</p>
                        </div>
                    </div>
                </div>
                <!-- Mobile Only Zoom -->
                <div class="sm:hidden px-6 pb-6 pt-2 border-t border-white/5">
                    <div class="flex items-center justify-between">
                        <span class="text-[11px]">Dynamic Zoom</span>
                        <div class="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
                            <button onclick="document.getElementById('zo').click()" class="px-4 py-2 hover:bg-white/10 text-xs border-r border-white/10">-</button>
                            <button onclick="document.getElementById('zi').click()" class="px-4 py-2 hover:bg-white/10 text-xs">+</button>
                        </div>
                    </div>
                </div>
                <div class="pt-4 border-t border-white/5 flex flex-col gap-4">
                    <p class="text-[9px] uppercase opacity-40 tracking-widest font-bold text-center mt-2">Personal Desk Integrated</p>
                    <button class="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase font-bold tracking-widest transition" onclick="toggleChat();toggleModal('bg-modal')">
                        <i class="fas fa-comments mr-2"></i> Open Personal Desk
                    </button>
                <div class="pt-4 border-t border-white/5 flex gap-2">
                    <input type="file" id="bg-in" class="hidden" accept="image/*" onchange="loadBg(event)">
                    <button class="flex-1 py-3 bg-white/5 hover:bg-white/20 rounded-xl text-[10px] uppercase font-bold tracking-widest transition" onclick="document.getElementById('bg-in').click()">
                        <i class="fas fa-image mr-2"></i> Wallpaper
                    </button>
                    <a href="?mode=web" class="flex-1 text-center py-3 bg-white/5 hover:bg-white/20 rounded-xl text-[10px] uppercase font-bold tracking-widest transition">
                        <i class="fas fa-globe mr-2"></i> Web View
                    </a>
                    <button class="flex-1 py-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-[10px] uppercase font-bold tracking-widest transition" onclick="resetSettings()">
                        <i class="fas fa-undo mr-2"></i> Reset
                    </button>
                </div>
            </div>
        </div>
    </div>

    ${showBranding ? '<a class="br" href="https://flipread.pages.dev" target="_blank">FlipRead</a>' : ''}

    <script>
        const FU='${fileUrl}';
        let zoom = 1;
        
        async function initDoc() {
            try {
                const res = await fetch(FU);
                if(!res.ok) throw new Error('Failed to load');
                const blob = await res.blob();
                await renderDoc(blob);
                document.getElementById('ld').style.opacity='0';
                setTimeout(()=>document.getElementById('ld').style.display='none', 500);
            } catch(e) {
                document.getElementById('ld').innerHTML = '<i class="fas fa-exclamation-triangle text-red-500"></i><p>Error Loading Document</p>';
            }
        }
        
        function renderDoc(blob) {
            const opts = { className: "docx", inWrapper: false, ignoreWidth: false, ignoreHeight: false };
            return docx.renderAsync(blob, document.getElementById('doc-c'), null, opts);
        }

        // Zoom Logic
        function prevDoc() {
            const container = document.getElementById('doc-v');
            const pages = document.getElementById('doc-c').children;
            if(pages.length > 0) {
                let current = 0;
                const sTop = container.scrollTop;
                for(let i=0; i<pages.length; i++) if(pages[i].offsetTop - 100 <= sTop) current = i;
                if(current > 0) pages[current-1].scrollIntoView({behavior: 'smooth'});
            }
        }
        function nextDoc() {
            const container = document.getElementById('doc-v');
            const pages = document.getElementById('doc-c').children;
            if(pages.length > 0) {
                let current = 0;
                const sTop = container.scrollTop;
                for(let i=0; i<pages.length; i++) if(pages[i].offsetTop - 100 <= sTop) current = i;
                if(current < pages.length - 1) pages[current+1].scrollIntoView({behavior: 'smooth'});
            }
        }

        function applyZoom() {
            document.getElementById('doc-c').style.transform = 'scale(' + zoom + ')';
            document.getElementById('ztxt').textContent = Math.round(zoom*100)+'%';
        }
        document.getElementById('zi').onclick = () => { zoom = Math.min(zoom+0.1, 3); applyZoom(); };
        document.getElementById('zo').onclick = () => { zoom = Math.max(zoom-0.1, 0.5); applyZoom(); };
        window.resetZoom = () => { zoom = 1; applyZoom(); };
        
        // Layout
        window.toggleLayout = () => {
            document.body.classList.toggle('full-mode');
            const btn = document.getElementById('m-btn');
            btn.innerHTML = document.body.classList.contains('full-mode') ? '<i class="fas fa-compress-alt"></i>' : '<i class="fas fa-expand"></i>';
        };
        document.getElementById('m-btn').onclick = toggleLayout;

        // Notes & Chat (Shared Logic)
        window.saveNotes = (v) => localStorage.setItem('fr_nt_' + FU, v);
        window.exportNotes = () => {
            const n = localStorage.getItem('fr_nt_' + FU) || '';
            const blob = new Blob([n], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = '${safeTitle}_notes.txt'; a.click();
            URL.revokeObjectURL(url);
        };
        window.toggleModal = (id) => document.getElementById(id).classList.toggle('o');
        
        // Touch Swiping for Document Pages/Sections
        let ts=0, ty=0;
        document.addEventListener('touchstart', e => { ts = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive: true});
        document.addEventListener('touchend', e => {
            if(!ts || zoom > 1) return;
            const te = e.changedTouches[0].clientX;
            const tye = e.changedTouches[0].clientY;
            const dx = ts - te;
            const dy = ty - tye;
            
            if(Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
                const el = e.target.closest('#chat-w') || e.target.closest('.modal-c');
                if(!el) {
                    const container = document.getElementById('doc-v');
                    const pages = document.getElementById('doc-c').children;
                    if(pages.length > 0) {
                        // Find current page based on scroll position
                        let current = 0;
                        const sTop = container.scrollTop;
                        for(let i=0; i<pages.length; i++) {
                            if(pages[i].offsetTop - 100 <= sTop) current = i;
                        }
                        
                        if(dx > 0 && current < pages.length - 1) {
                            pages[current+1].scrollIntoView({behavior: 'smooth'});
                        } else if(dx < 0 && current > 0) {
                            pages[current-1].scrollIntoView({behavior: 'smooth'});
                        }
                    }
                }
            }
            ts = 0; ty = 0;
        }, {passive: true});

        window.switchSidebarTab = (el) => {
            const tabId = el.getAttribute('data-tab');
            document.querySelectorAll('#chat-w .chat-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('#chat-w .chat-tab-c').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            document.getElementById('chat-footer').style.display = tabId === 'chat-highlights' ? 'none' : 'flex';
        };
        window.toggleChat = () => {
            const w = document.getElementById('chat-w');
            w.classList.toggle('o');
            if(w.classList.contains('o')) renderNotes();
        };
        window.sendNote = () => {
            const i = document.getElementById('chat-i'), v = i.value.trim();
            if(!v) return;
            let notes = [];
            try { 
                const raw = localStorage.getItem('fr_nt_'+FU);
                notes = JSON.parse(raw) || [];
                if(!Array.isArray(notes)) throw new Error();
            } catch(e) {
                const legacy = localStorage.getItem('fr_nt_'+FU);
                if(legacy) notes = [{text: legacy, time: 'Legacy'}];
            }
            notes.push({text: v, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})});
            localStorage.setItem('fr_nt_'+FU, JSON.stringify(notes));
            i.value = '';
            renderNotes();
        };
        window.renderNotes = () => {
            const b = document.getElementById('chat-notes');
            if(!b) return;
            let notes = [];
            try { 
                notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
                if(!Array.isArray(notes)) throw new Error();
            } catch(e) {
                const legacy = localStorage.getItem('fr_nt_'+FU);
                if(legacy) notes = [{text: legacy, time: 'Legacy'}];
            }
          b.innerHTML = notes.map(n => 
              '<div class=\"search-item flex justify-between items-start group\">' +
              '<div>' +
              '<p class=\"text-xs leading-relaxed opacity-90 break-words w-full\" style=\"border-left: 2px solid #ffffff; padding-left: 8px\">' + n.text.replace(/\\n/g, '<br>') + '</p>' +
              '<p class=\"text-[9px] opacity-40 mt-1 pl-2\">' + n.time + '</p></div>' +
              '</div>'
          ).join('');
            b.scrollTop = b.scrollHeight;
        };
        window.setBg = (c, isDark) => {
            document.body.style.background = c;
            document.body.classList.toggle('light-ui', !isDark);
        };
        window.loadBg = (e) => {
            const f = e.target.files[0];
            if(!f) return;
            const r = new FileReader();
            r.onload = (ev) => document.body.style.background = 'url('+ev.target.result+') center/cover fixed';
            r.readAsDataURL(f);
        };
        window.switchTab = (e, tabId) => {
            const m = e.target.closest('.modal-c');
            m.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            m.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            m.querySelector('#' + tabId).classList.add('active');
        };
        window.resetSettings = () => { if(confirm('Reset reader settings to default?')) { localStorage.clear(); location.reload(); } };
        let amb;
        window.playAmbient = (type) => {
            if(amb) { amb.pause(); amb = null; }
            if(type === 'none') return;
            const urls = {
                rain: 'https://cdn.pixabay.com/audio/2022/03/10/audio_51307b0f69.mp3',
                fire: 'https://cdn.pixabay.com/audio/2021/08/09/audio_65b750170a.mp3',
                library: 'https://cdn.pixabay.com/audio/2023/10/24/audio_985b8c9d0d.mp3'
            };
            amb = new Audio(urls[type]);
            amb.loop = true; amb.play();
        };
        
        initDoc();
    </script>
</body>
</html>`;
}
