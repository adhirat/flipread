
import { escapeHtml } from './viewerUtils';

export function pdfViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = ''): string {
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
        
        #s-c { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; perspective: 4000px; overflow: hidden; z-index: 10; width: 100vw; height: 100dvh; }
        #s-c.full { inset: 0 !important; z-index: 2000; height: 100dvh !important; }
        #b-t { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease; transform-style: preserve-3d; opacity: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; }
        #b-t.open { opacity: 1; pointer-events: auto; }
        #fc { position: relative; transform-origin: center center; }

        .c-b { position: absolute; z-index: 200; width: 45vh; height: 65vh; transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); cursor: pointer; }
        .c-b:hover { transform: scale(1.03) rotateY(-5deg); }
        .c-v { width: 100%; height: 100%; object-fit: contain; border-radius: 2px 4px 4px 2px; box-shadow: -15px 15px 40px rgba(0,0,0,0.5); background: ${accent}; display: flex; align-items: center; justify-content: center; color: white; text-align: center; padding: 20px; font-weight: bold; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
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

        /* Chat Sidebar */
        #chat-w { position: fixed; right: -400px; top: 0; bottom: 0; width: 350px; background: rgba(20,20,20,0.85); backdrop-filter: blur(20px); z-index: 2100; border-left: 1px solid rgba(255,255,255,0.1); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; box-shadow: -20px 0 50px rgba(0,0,0,0.5); color: white; }
        #chat-w.o { right: 0; }
        .chat-h { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .chat-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }
        .chat-tab { flex: 1; padding: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; cursor: pointer; opacity: 0.5; border-bottom: 2px solid transparent; transition: 0.2s; }
        .chat-tab.active { opacity: 1; border-color: ${accent}; background: rgba(255,255,255,0.02); }
        .chat-b { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .chat-tab-c { display: none; }
        .chat-tab-c.active { display: flex; flex-direction: column; gap: 12px; }
        .chat-m { background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 16px; font-size: 13px; line-height: 1.5; color: #eee; max-width: 90%; align-self: flex-start; position: relative; border: 1px solid rgba(255,255,255,0.05); }
        .chat-t { font-size: 9px; opacity: 0.3; margin-top: 4px; display: block; text-align: right; }
        .chat-f { padding: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 12px; background: rgba(0,0,0,0.2); }
        .chat-i-w { position: relative; display: flex; gap: 10px; }
        .chat-i { flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 15px; color: #fff; outline: none; font-size: 13px; resize: none; min-height: 40px; max-height: 150px; }
        .chat-i:focus { border-color: ${accent}; }
        .chat-s { width: 40px; height: 40px; min-width: 40px; border-radius: 12px; background: ${accent}; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; align-self: flex-end; }
        
        body.light-ui #chat-w { background: rgba(248, 248, 248, 0.9); color: #1a1a1a; border-left-color: rgba(0,0,0,0.1); }
        body.light-ui .chat-h, body.light-ui .chat-tabs { border-bottom-color: rgba(0,0,0,0.05); }
        body.light-ui .chat-tab { color: #111; }
        body.light-ui .chat-m { background: white; color: #333; border-color: rgba(0,0,0,0.05); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        body.light-ui .chat-f { background: rgba(0,0,0,0.02); border-top-color: rgba(0,0,0,0.05); }
        body.light-ui .chat-i { background: #fff; border-color: rgba(0,0,0,0.1); color: #111; }
    </style>
        #chat-w.o { right: 0; }
        .chat-h { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
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

    <header class="hdr" id="main-hdr">
        <div class="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition" onclick="toggleModal('index-modal')"><i class="fas fa-list-ul text-sm"></i></button>
            <div class="flex items-center gap-2 min-w-0">
                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-6 w-6 object-contain rounded-sm" />` : ''}
                <div class="font-bold text-xs sm:text-sm truncate opacity-90">${safeTitle}</div>
            </div>
        </div>
        <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            <div class="flex bg-white/5 rounded-full p-0.5 gap-0.5 items-center border border-white/10 backdrop-blur-md mx-1">
                <button id="zo" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition text-[10px]"><i class="fas fa-minus"></i></button>
                <div id="ztxt" class="text-[10px] font-mono w-[32px] text-center hidden sm:block opacity-80">100%</div>
                <button id="zi" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition text-[10px]"><i class="fas fa-plus"></i></button>
            </div>
            
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition" onclick="toggleModal('bg-modal')"><i class="fas fa-palette text-xs"></i></button>
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition hidden sm:flex" id="m-btn" title="Toggle Layout"><i class="fas fa-expand text-xs"></i></button>
        </div>
    </header>

    <div id="s-c">
        <div id="c-b" class="c-b" onclick="openBook()">
            <div class="c-v" id="c-v-inner">
                ${coverUrl ? '<img src="' + coverUrl + '" style="width:100%;height:100%;object-fit:contain;background:#1a1a1a;">' : '<div class="flex flex-col gap-2"><span>' + safeTitle + '</span><span class="text-[9px] opacity-40">FLIP TO OPEN</span></div>'}
            </div>
        </div>
        <div id="b-t">
            <div id="fc"></div>
        </div>
    </div>

    <div class="ft" id="main-ft">
        <button id="pb" class="nb"><i class="fas fa-chevron-left"></i></button>
        <div class="flex flex-col items-center gap-1 flex-1 max-w-[300px]">
            <input type="range" id="ps" class="sl" min="0" max="0" value="0">
            <div class="pi" id="pi">-- / --</div>
        </div>
        <button id="nb" class="nb"><i class="fas fa-chevron-right"></i></button>
        <button class="nb !ml-2" onclick="toggleChat()"><i class="fas fa-comment-dots"></i></button>
    </div>

    <div id="chat-w">
        <div class="chat-h">
            <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">Personal Desk</span>
            <button onclick="toggleChat()" class="opacity-40 hover:opacity-100">✕</button>
        </div>
        <div class="chat-tabs">
            <div class="chat-tab active" data-tab="chat-notes" onclick="switchSidebarTab(this)">Notes</div>
            <div class="chat-tab" data-tab="chat-highlights" onclick="switchSidebarTab(this)">Highlights</div>
        </div>
        <div class="chat-b">
            <div id="chat-notes" class="chat-tab-c active"></div>
            <div id="chat-highlights" class="chat-tab-c">
                <p class="text-[10px] text-center opacity-40 py-10 mt-20">Highlights feature coming soon for PDF.</p>
            </div>
        </div>
        <div class="chat-f" id="chat-footer">
            <div class="chat-i-w">
                <textarea id="chat-i" placeholder="Add a multi-line note..." class="chat-i" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendNote()}"></textarea>
                <button onclick="sendNote()" class="chat-s"><i class="fas fa-paper-plane"></i></button>
            </div>
            <button onclick="exportNotes()" class="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] uppercase font-bold tracking-widest transition">
                <i class="fas fa-file-export mr-2"></i> Export All Notes
            </button>
        </div>
    </div>


    <div id="index-modal" class="modal">
        <div class="modal-c">
            <div class="modal-h"><strong class="text-xs uppercase tracking-widest opacity-70">Contents</strong><button class="hdr-i" onclick="toggleModal('index-modal')" style="width:30px;height:30px">✕</button></div>
            <div class="modal-b" id="index-list"></div>
        </div>
    </div>

    <div id="bg-modal" class="modal" onclick="toggleModal('bg-modal')">
        <div class="modal-c !w-[450px]" onclick="event.stopPropagation()">
            <div class="flex border-b border-white/10 px-4">
                <div class="tab-btn active" onclick="switchTab(event, 'p-bg')">Appearance</div>
                <div class="tab-btn" onclick="switchTab(event, 'p-am')">Experience</div>
            </div>
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <div id="p-bg" class="tab-content active">
                    <p class="text-[9px] uppercase opacity-40 mb-4 tracking-widest font-bold">Backgrounds</p>
                    <div class="grid grid-cols-5 gap-3 mb-6">
                        <!-- Light -->
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Clean White" style="background:#ffffff" onclick="setBg('#ffffff')"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Light Grey" style="background:#f3f4f6" onclick="setBg('#f3f4f6')"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Cream" style="background:#fdfbf7" onclick="setBg('#fdfbf7')"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Paper Gradient" style="background:linear-gradient(135deg, #fdfbf7 0%, #ebedee 100%)" onclick="setBg('linear-gradient(135deg, #fdfbf7 0%, #ebedee 100%)')"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Light Wood" style="background:url('https://www.transparenttextures.com/patterns/wood-pattern.png') #e4d5b7" onclick="setBg('url(https://www.transparenttextures.com/patterns/wood-pattern.png) #e4d5b7')"></div>
                        
                        <!-- Dark -->
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Dark" style="background:#1a1a1a" onclick="setBg('#1a1a1a')"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Charcoal" style="background:#2c3e50" onclick="setBg('#2c3e50')"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Midnight" style="background:#0f172a" onclick="setBg('#0f172a')"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Metal" style="background:linear-gradient(135deg, #2c3e50 0%, #000000 100%)" onclick="setBg('linear-gradient(135deg, #2c3e50 0%, #000000 100%)')"></div>
                        <div class="w-8 h-8 rounded-full cursor-pointer ring-1 ring-white/10" title="Dark Wood" style="background:url('https://www.transparenttextures.com/patterns/wood-pattern.png') #2d241e" onclick="setBg('url(https://www.transparenttextures.com/patterns/wood-pattern.png) #2d241e')"></div>
                    </div>
                </div>
                <div id="p-am" class="tab-content">
                    <p class="text-[9px] uppercase opacity-40 mb-4 tracking-widest font-bold">Atmosphere</p>
                    <div class="flex flex-col gap-4">
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
                <div class="pt-4 border-t border-white/5 flex flex-col gap-4">
                    <p class="text-[9px] uppercase opacity-40 tracking-widest font-bold text-center mt-2">Personal Desk Integrated</p>
                    <button class="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase font-bold tracking-widest transition" onclick="toggleChat();toggleModal('bg-modal')">
                        <i class="fas fa-comments mr-2"></i> Open Personal Desk
                    </button>
                    <a href="?mode=web" class="w-full text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase font-bold tracking-widest transition">
                        <i class="fas fa-globe mr-2"></i> Try Web View (Experimental)
                    </a>
                </div>
                <div class="pt-4 border-t border-white/5 flex gap-2">
                    <input type="file" id="bg-in" class="hidden" accept="image/*" onchange="loadBg(event)">
                    <button class="flex-1 py-3 bg-white/5 hover:bg-white/20 rounded-xl text-[10px] uppercase font-bold tracking-widest transition" onclick="document.getElementById('bg-in').click()">
                        <i class="fas fa-image mr-2"></i> Wallpaper
                    </button>
                    <button class="flex-1 py-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-[10px] uppercase font-bold tracking-widest transition" onclick="resetSettings()">
                        <i class="fas fa-undo mr-2"></i> Reset
                    </button>
                </div>
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
                this.panX = 0; this.panY = 0; this.isDragging = false; this.startX = 0; this.startY = 0;
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
                    
                    if (!'${coverUrl}') {
                        const pg = await this.pdf.getPage(1);
                        const vp = pg.getViewport({scale:1});
                        const cv = document.createElement('canvas');
                        cv.width = vp.width; cv.height = vp.height;
                        await pg.render({canvasContext:cv.getContext('2d'), viewport:vp}).promise;
                        document.getElementById('c-v-inner').innerHTML = \`<img src="\${cv.toDataURL()}" style="width:100%;height:100%;object-fit:contain;background:#1a1a1a;">\`;
                    }
                    
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
                    flippingTime: 800, autoCenter: true
                });
                this.pf.loadFromHTML(document.querySelectorAll('.pg'));
                this.pf.on('flip', e => { this.update(); this.queue(e.data); });
                this.update(); this.queue(0);
            }
            calcDims(ar) {
                const headH = this.full ? 0 : 50, footH = this.full ? 0 : 70, margin = this.full ? 10 : 40;
                let h = window.innerHeight - headH - footH - margin, w = h * ar, aw = window.innerWidth;
                if(aw > 768) { if(w*2 > aw-40) { w = (aw-40)/2; h = w/ar; } }
                else { if(w > aw-20) { w = aw-20; h = w/ar; } }
                let wf = Math.floor(w); if(wf%2!==0) wf--; 
                return { w: wf, h: Math.floor(h) };
            }
            queue(i) {
                this.target = i;
                for(let j=Math.max(0,i-10); j<=Math.min(this.tp-1,i+10); j++) {
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
                document.getElementById('pb').onclick = () => { if(this.zoom===1) this.pf.flipPrev(); };
                document.getElementById('nb').onclick = () => { if(this.zoom===1) this.pf.flipNext(); };
                document.getElementById('ps').oninput = e => { if(this.zoom===1) this.pf.flip(+e.target.value); };
                document.getElementById('zi').onclick = () => { this.zoom = Math.min(this.zoom+0.5, 3); this.applyZoom(); };
                document.getElementById('zo').onclick = () => { this.zoom = Math.max(this.zoom-0.5, 1); if(this.zoom===1) { this.panX=0; this.panY=0; } this.applyZoom(); };
                document.getElementById('m-btn').onclick = () => this.toggleLayout();
                
                window.onmousemove = (e) => {
                    if(this.isDragging) {
                        e.preventDefault();
                        this.panX = e.clientX - this.startX;
                        this.panY = e.clientY - this.startY;
                        this.applyZoom();
                        return;
                    }
                    if(!this.full) return;
                    if(e.clientY < 70) this.showUI(true);
                    else if(e.clientY > window.innerHeight - 70) this.showUI(true);
                    else this.showUI(false);
                };
                
                window.onmousedown = (e) => {
                    if(this.zoom > 1) {
                        this.isDragging = true;
                        this.startX = e.clientX - this.panX;
                        this.startY = e.clientY - this.panY;
                        document.body.style.cursor = 'grabbing';
                    }
                };
                
                window.onmouseup = () => {
                    this.isDragging = false;
                    if(this.zoom > 1) document.body.style.cursor = 'grab';
                    else document.body.style.cursor = 'default';
                };

                window.addEventListener('wheel', (e) => {
                    if(e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const d = -Math.sign(e.deltaY) * 0.2;
                        const newZoom = Math.min(Math.max(1, this.zoom + d), 3);
                        if(newZoom !== this.zoom) {
                            this.zoom = newZoom;
                            if(this.zoom === 1) { this.panX = 0; this.panY = 0; }
                            this.applyZoom();
                        }
                    }
                }, {passive: false});

                document.onkeydown = e => { 
                    if(this.zoom > 1) return;
                    if(e.key==='ArrowLeft') this.pf.flipPrev();
                    if(e.key==='ArrowRight') this.pf.flipNext();
                    if(e.key==='f') this.toggleLayout();
                };
                let sx=0; document.ontouchstart=e=> { sx=e.touches[0].clientX; };
                document.ontouchend=e=>{
                    if(this.zoom > 1) return;
                    let dx=sx-e.changedTouches[0].clientX;
                    if(Math.abs(dx)>50) dx>0?this.pf.flipNext():this.pf.flipPrev();
                };
                window.onresize = () => this.build();
            }
            toggleLayout() {
                this.full = !this.full;
                document.body.classList.toggle('full-mode', this.full);
                document.getElementById('m-btn').innerHTML = this.full ? '<i class="fas fa-compress-alt"></i>' : '<i class="fas fa-expand"></i>';
                this.zoom = 1; this.panX = 0; this.panY = 0; this.applyZoom(); this.build();
            }
            showUI(v) { if(this.full) { document.getElementById('main-hdr').classList.toggle('v', v); document.getElementById('main-ft').classList.toggle('v', v); } }
            applyZoom() {
                const nav = document.getElementById('b-t');
                nav.style.transform = \`translate(\${this.panX}px, \${this.panY}px) scale(\${this.zoom})\`;
                document.getElementById('ztxt').textContent = Math.round(this.zoom*100)+'%';
                
                // Smart lock: Toggle pointer events on book container to disable drag-flip when zoomed
                document.getElementById('fc').style.pointerEvents = this.zoom > 1 ? 'none' : 'auto';
                document.body.style.cursor = this.zoom > 1 ? 'grab' : 'default';
            }
        }
        window.openBook = () => {
            document.getElementById('c-b').classList.add('a-f-o');
            setTimeout(() => {
                document.getElementById('c-b').style.display='none';
                document.getElementById('b-t').classList.add('open');
            }, 800);
        }
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
             try { notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || []; } catch(e) {}

             b.innerHTML = notes.map(n => 
                 '<div class=\"search-item flex justify-between items-start group\">' +
                 '<div>' +
                 '<p class=\"text-xs leading-relaxed opacity-90 break-words w-full\" style=\"border-left: 2px solid #ffffff; padding-left: 8px\">' + n.text.replace(/\\n/g, '<br>') + '</p>' +
                 '<p class=\"text-[9px] opacity-40 mt-1 pl-2\">' + n.time + '</p></div>' +
                 '</div>'
             ).join('');
             b.scrollTop = b.scrollHeight;
        };
        window.loadBg = (e) => {
            const f = e.target.files[0];
            if(!f) return;
            const r = new FileReader();
            r.onload = (ev) => document.body.style.background = 'url('+ev.target.result+') center/cover fixed';
            r.readAsDataURL(f);
        };
        window.resetZoom = () => { if(pdfViewer) { pdfViewer.zoom = 1; pdfViewer.applyZoom(); } };
        window.bgClick = (e) => {
            if(e.target.id !== 's-c' || !pdfViewer || pdfViewer.zoom > 1) return;
            // Center is roughly window.innerWidth/2
            if(e.clientX < window.innerWidth/2) pdfViewer.pf.flipPrev();
            else pdfViewer.pf.flipNext();
        };
        document.getElementById('s-c').onclick = bgClick;
        let pdfViewer;
        window.setBg = (c) => document.body.style.background = c;
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
        pdfViewer = new PDFViewer();
    </script>
</body>
</html>`;
}
