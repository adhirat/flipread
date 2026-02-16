
import { escapeHtml } from './viewerUtils';

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
          body { background: ${bg}; background-size: cover; background-position: center; transition: background 0.5s ease; overflow: hidden; height: 100dvh; font-family: sans-serif; }
          #s-c { position: absolute; inset: 50px 0; display: flex; align-items: center; justify-content: center; perspective: 3500px; overflow: hidden; transition: opacity 0.5s ease, inset 0.4s, height 0.4s; width: 100%; height: calc(100dvh - 100px); }
          #s-c.full { inset: 0 !important; height: 100dvh !important; }
          #b-t { position: relative; width: 98%; height: 98%; transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease; transform-style: preserve-3d; opacity: 0; pointer-events: none; }
          #b-t.open { opacity: 1; pointer-events: auto; }
          #b-v { width: 100%; height: 100%; background: white; box-shadow: 0 30px 70px rgba(0,0,0,0.4); position: relative; border-left: 6px solid #e0e0e0; border-right: 6px solid #e0e0e0; transition: transform 0.15s ease, opacity 0.15s ease; }
          #spine { position: absolute; left: 50%; top: 0; bottom: 0; width: 60px; transform: translateX(-50%); background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0) 100%); pointer-events: none; z-index: 50; mix-blend-mode: multiply; }
          @media(max-width:768px){ #spine { display: none; } }
          
          .c-b { position: absolute; z-index: 200; width: 45vh; height: 65vh; transform-style: preserve-3d; transition: transform 0.5s ease; cursor: pointer; border: none !important; outline: none !important; }
          .c-v { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; box-shadow: -15px 15px 60px rgba(0,0,0,0.8); background: #111111; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 0; font-weight: bold; overflow: hidden; border: none !important; }
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
          
          .hdr { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; transition: all 0.4s; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); color: white; }
          .ft { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; height: 48px; display: flex; align-items: center; justify-content: center; gap: 40px; transition: all 0.4s; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; }
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
          body.full-mode .hdr { transform: translateY(0); opacity: 0; pointer-events: none; background: transparent; backdrop-filter: none; border-bottom: none; }
          body.full-mode .ft { transform: translateY(0); opacity: 0; pointer-events: none; background: transparent; backdrop-filter: none; border-top: none; }
          body.full-mode .hdr.v, body.full-mode .ft.v { opacity: 1; pointer-events: auto; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); }
          body.full-mode .ib { background: rgba(255,255,255,0.2); color: white; }
          body.full-mode .zoom-pill { background: rgba(255,255,255,0.2); color: white; }
  
          #detect-zone-top, #detect-zone-bottom { position: fixed; left: 0; right: 0; height: 50px; z-index: 95; }
          #detect-zone-top { top: 0; }
          #detect-zone-bottom { bottom: 0; }
  
          .ib { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: all 0.2s; outline: none !important; background: rgba(255,255,255,0.1); color: white; }
          .ib:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }
          .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 500; display: none; align-items: center; justify-content: center; }
          .modal.o { display: flex; }
          .modal-c { background: #1c1c1c; width: 90%; max-width: 400px; max-height: 85vh; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); color: #eee; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); }
          @media(min-width:1024px){ 
              .modal-c { max-width: 600px; }
              .modal-c select, .modal-c button, .modal-c .text-[11px] { font-size: 15px !important; }
              .modal-c .tab-btn { font-size: 12px !important; padding: 16px 24px; }
              .modal-c p.text-[9px] { font-size: 11px !important; }
              .modal-c .p-6 { padding: 40px !important; }
          }
          .br { position: fixed; bottom: 52px; right: 12px; z-index: 200; font-size: 10px; color: rgba(255,255,255,0.2); text-decoration: none; }
          
          #end-controls { position: absolute; bottom: 15%; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; opacity: 0; pointer-events: none; transition: 0.5s; z-index: 300; }
          #end-controls.v { opacity: 1; pointer-events: auto; }
          .eb { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 11px; text-transform: uppercase; }
          .eb:hover { background: white; color: black; }
  
          @media(max-width:768px){ #b-v { border-right: none; } #f-l { display:none; } }
  
          /* Chat Sidebar */
          #chat-w { position: fixed; right: -400px; top: 0; bottom: 0; width: 350px; background: rgba(20,20,20,0.85); backdrop-filter: blur(20px); z-index: 2100; border-left: 1px solid rgba(255,255,255,0.1); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; box-shadow: -20px 0 50px rgba(0,0,0,0.5); color: white; }
          #chat-w.o { right: 0; }
          .chat-h { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
          .chat-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }
          .chat-tab { flex: 1; padding: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; cursor: pointer; opacity: 0.5; border-bottom: 2px solid transparent; transition: 0.2s; }
          .chat-tab.active { opacity: 1; border-color: ${accent}; background: rgba(255,255,255,0.02); }
          .chat-b { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; }
          .chat-tab-c { display: none; width: 100%; }
          .chat-tab-c.active { display: flex; flex-direction: column; gap: 10px; width: 100%; }
          .chat-m { background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 16px; font-size: 13px; line-height: 1.5; color: #eee; width: 100%; position: relative; border: 1px solid rgba(255,255,255,0.05); }
          .chat-b .search-item { border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin: 0; width: 100%; background: rgba(255,255,255,0.03); }
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
      <style>
          /* ... existing styles ... */
          .hl-yellow { background-color: rgba(255, 235, 59, 0.4); border-bottom: 2px solid #fdd835; cursor: pointer; }
          .hl-green { background-color: rgba(165, 214, 167, 0.4); border-bottom: 2px solid #66bb6a; cursor: pointer; }
          .hl-blue { background-color: rgba(144, 202, 249, 0.4); border-bottom: 2px solid #42a5f5; cursor: pointer; }
          .hl-pink { background-color: rgba(244, 143, 177, 0.4); border-bottom: 2px solid #ec407a; cursor: pointer; }
          .hl-purple { background-color: rgba(206, 147, 216, 0.4); border-bottom: 2px solid #ab47bc; cursor: pointer; }
          
          #hl-menu { position: absolute; z-index: 1000; background: rgba(30,30,30,0.95); backdrop-filter: blur(10px); padding: 8px; border-radius: 50px; display: none; gap: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); transform: translateX(-50%); }
          .hl-btn { width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: transform 0.2s; }
          .hl-btn:hover { transform: scale(1.2); border-color: white; }
          
          .del-btn { opacity: 0; transition: opacity 0.2s; background: transparent; border: none; color: #ff5252; cursor: pointer; font-size: 12px; padding: 4px; }
          .search-item:hover .del-btn, .chat-m:hover .del-btn { opacity: 1; }

          @media(max-width:768px){ 
              #chat-w { width: 100vw !important; right: -100vw !important; border-left: none; } 
              #chat-w.o { right: 0 !important; }
              
              /* Swipe Actions */
              .search-item, .chat-m { transition: transform 0.2s; touch-action: pan-y; position: relative; }
              .search-item.swiped, .chat-m.swiped { transform: translateX(-50px); }
              .swipe-del { position: absolute; right: -50px; top: 0; bottom: 0; width: 50px; background: #ff5252; color: white; display: flex; align-items: center; justify-content: center; border-radius: 0 8px 8px 0; }
          }
          @media(min-width:769px) {
              .swipe-del { display: none !important; }
              .del-btn { opacity: 1 !important; color: #ff5252; background: rgba(255, 82, 82, 0.1); border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-left: 8px; transition: 0.2s; }
              .del-btn:hover { background: #ff5252; color: white; }
          }
          #pi { transition: opacity 0.5s; opacity: 0; }
          #pi.v { opacity: 0.7; }
      </style>
  </head>
  <body class="fit-mode">
      <div id="texture-overlay"></div>
      <script>
        // Touch Handlers for Swipe Deletion
        let ts=0;
        document.addEventListener('touchstart', e => { ts = e.touches[0].clientX; }, {passive: true});
        document.addEventListener('touchmove', e => {
            if(!ts) return;
            const te = e.touches[0].clientX;
            const diff = ts - te;
            if(Math.abs(diff) < 10) return;
            
            const el = e.target.closest('.search-item') || e.target.closest('.chat-m');
            if(el) {
                if(diff > 50) el.classList.add('swiped');
                else if(diff < -50) el.classList.remove('swiped');
            }
            ts = 0;
        }, {passive: true});
      </script>
      <div id="hl-menu">
           <div class="hl-btn" style="background:#ffeb3b" onclick="addHighlight('yellow')"></div>
           <div class="hl-btn" style="background:#a5d6a7" onclick="addHighlight('green')"></div>
           <div class="hl-btn" style="background:#90caf9" onclick="addHighlight('blue')"></div>
           <div class="hl-btn" style="background:#f48fb1" onclick="addHighlight('pink')"></div>
           <div class="hl-btn" style="background:#ce93d8" onclick="addHighlight('purple')"></div>
      </div>
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
              <button class="ib" onclick="toggleTTS()" id="tts-btn" title="Text to Speech"><i class="fas fa-volume-up"></i></button>
              <button class="ib" onclick="toggleModal('bg-m')" title="Reader Settings"><i class="fas fa-palette"></i></button>
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
          <button class="ib rounded-full !ml-2" onclick="toggleChat()"><i class="fas fa-comment-dots"></i></button>
      </footer>
  
      <div id="chat-w">
          <div class="chat-h">
              <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">Personal Desk</span>
              <div class="flex gap-4">
                  <button onclick="exportAll()" class="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 hover:text-${accent} transition"><i class="fas fa-file-export mr-1"></i> Export</button>
                  <button onclick="toggleChat()" class="opacity-40 hover:opacity-100">✕</button>
              </div>
          </div>
          <div class="chat-tabs">
              <div class="chat-tab active" data-tab="chat-notes" onclick="switchSidebarTab(this)">Notes</div>
              <div class="chat-tab" data-tab="chat-highlights" onclick="switchSidebarTab(this)">Highlights</div>
          </div>
          <div class="chat-b">
              <div id="chat-notes" class="chat-tab-c active"></div>
              <div id="chat-highlights" class="chat-tab-c">
                  <div id="hi-l" class="flex flex-col">
                      <p class="text-[10px] text-center opacity-40 py-10">No highlights yet. Select text in the book to add them.</p>
                  </div>
                  <div class="px-4 pb-4">
                      <button id="ex-hi-btn" class="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] uppercase font-bold tracking-widest transition hidden" onclick="exportHighlights()">
                          <i class="fas fa-file-export mr-2"></i> Export Highlights
                      </button>
                  </div>
              </div>
          </div>
          <div class="chat-f" id="chat-footer">
              <div class="chat-i-w">
                  <textarea id="chat-i" placeholder="Add a multi-line note..." class="chat-i" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendNote()}"></textarea>
                  <button onclick="sendNote()" class="chat-s"><i class="fas fa-paper-plane"></i></button>
              </div>

          </div>
      </div>
  
  
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
  
                  <div class="pt-4 border-t border-white/5 flex flex-col gap-4">
                      <p class="text-[9px] uppercase opacity-40 tracking-widest font-bold text-center mt-2">Personal Desk Integrated</p>
                      <button class="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase font-bold tracking-widest transition" onclick="toggleChat();toggleModal('bg-m')">
                          <i class="fas fa-comments mr-2"></i> Open Personal Desk
                      </button>
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
  
      <div id="search-m" class="modal" onclick="toggleSearch()">
          <div class="modal-c" onclick="event.stopPropagation()">
              <input type="text" id="s-q" placeholder="What are you looking for?" class="w-full p-4 bg-transparent border-b border-white/10 outline-none text-white text-sm" autofocus onkeyup="if(event.key==='Enter')doSearch()">
              <div id="s-r" class="p-2 overflow-y-auto flex-1 max-h-[400px]"></div>
          </div>
      </div>
  
      <script>
          const FU='${fileUrl}';
          let book=null, rend=null, isAnimating=false;
          let z=100, fz=100, lh=1.6, ff='Georgia, serif';
          let highlights = [];
          try{ highlights = JSON.parse(localStorage.getItem('fr_hi_'+FU)) || []; }catch(e){}
          let syn = window.speechSynthesis, utter, speaking=false;
  
          async function init(){
              try {
                  if(!FU || FU === 'undefined') throw new Error("Invalid book URL");
                  const response = await fetch(FU);
                  if (!response.ok) throw new Error('Failed to fetch book file');
                  const arrayBuffer = await response.arrayBuffer();
                  book = ePub(arrayBuffer);
              rend = book.renderTo("b-v", { width: "100%", height: "100%", spread: "always" });
              await rend.display();
  
              book.ready.then(() => {
                  document.getElementById('ld').style.opacity='0';
                  setTimeout(()=>document.getElementById('ld').style.display='none', 500);
                  
                  // Generate Spine
                  const si = book.spine.spineItems;
                  const sc = document.getElementById('spine');
                  si.forEach((it, i) => {
                      const l = (i/si.length)*100;
                      const d = document.createElement('div');
                      d.style.cssText = \`position:absolute;top:\${l}%;left:0;right:0;height:1px;background:rgba(0,0,0,0.1);pointer-events:none;\`;
                      sc.appendChild(d);
                  });
  
                  // Generate TOC
                  const toc = book.navigation.toc;
                  const tl = document.getElementById('t-l');
                  function parseToc(items, level=0){
                      items.forEach(i => {
                          const d = document.createElement('div');
                          d.className = 'item';
                          d.style.paddingLeft = (14 + level*15) + 'px';
                          d.innerHTML = '<span>'+i.label+'</span><i class="fas fa-chevron-right text-[10px] opacity-20"></i>';
                          d.onclick = () => { rend.display(i.href); toggleTOC(); };
                          tl.appendChild(d);
                          if(i.subitems && i.subitems.length) parseToc(i.subitems, level+1);
                      });
                  }
                  parseToc(toc);
                  if(toc.length===0) tl.innerHTML = '<p class="text-center py-10 opacity-40 text-xs">No table of contents found.</p>';
                  
                  // Trigger location generation for accurate page numbers
                  book.locations.generate(1000); 
                  
                  // Restore Highlights
                  highlights.forEach(h => {
                      try {
                          rend.annotations.add("highlight", h.cfi, {}, null, 'hl-' + (h.c || 'yellow'));
                      } catch(e){ console.warn("Failed to restore highlight", h, e); }
                  });
                  renderHighlights();
              });
  
              rend.on("relocated", (l) => {
                  // Ensure locations are generated for accurate page numbers
                  if (!book.locations.length()) {
                       // If locations aren't generated, we can't show "Page X of Y" accurately.
                       // We'll show a "Calculating..." state or just the location once.
                       // But usually valid page numbers require book.locations.generate().
                       // We'll check if we should trigger generation.
                       // For now, let's use what we have, but cleaner.
                  }
                  
                  // Check spread mode based on window width or rendered logic
                  // Ideally checks if book.renderer.settings.width > specific breakpoint for spreads
                  const isSpread = window.innerWidth > 768; 
                  
                  let text = 'Location ' + l.start.displayed.page;
                  if (l.start.displayed.page && l.start.displayed.total > 0) {
                      if (isSpread && l.end && l.end.displayed && l.end.displayed.page > l.start.displayed.page) {
                          text = \`Page \${l.start.displayed.page}-\${l.end.displayed.page} / \${l.start.displayed.total}\`;
                      } else {
                          text = \`Page \${l.start.displayed.page} / \${l.start.displayed.total}\`;
                      }
                  }
                  
                  document.getElementById('pi').textContent = text;
                  document.getElementById('nav-l').style.display = l.atStart ? 'none' : 'block';
                  
                  // Check end
                  if(l.atEnd) {
                      document.getElementById('end-controls').classList.add('v');
                  } else {
                      document.getElementById('end-controls').classList.remove('v');
                  }
              });
  
              rend.on("selected", (cfiRange, contents) => {
                  book.getRange(cfiRange).then(range => {
                      const sel = contents.window.getSelection();
                      if(!sel.rangeCount) return;
                      const rect = sel.getRangeAt(0).getBoundingClientRect();
                      const menu = document.getElementById('hl-menu');
                      
                      // Calculate position relative to the main window
                      const iframe = document.querySelector('#b-v iframe');
                      const iframeRect = iframe.getBoundingClientRect();
                      
                      menu.style.top = (iframeRect.top + rect.top - 50) + 'px';
                      menu.style.left = (iframeRect.left + rect.left + rect.width/2) + 'px';
                      menu.style.display = 'flex';
                      
                      // Store temporary selection data
                      window.currentSelection = { cfiRange, text: range.toString(), contents };
                  });
              });
  
              rend.hooks.content.register(contents => {
                  contents.document.body.onclick = () => {
                      const full = document.body.classList.contains('full-mode');
                      if(full) {
                           const h = document.getElementById('main-hdr'), f = document.getElementById('main-ft');
                           h.classList.toggle('v'); f.classList.toggle('v');
                      }
                      document.getElementById('hl-menu').style.display = 'none';
                  };
                  
                  // Inject Stylesheet
                  const style = contents.document.createElement('style');
                  style.innerHTML = \`
                      ::selection { background: rgba(255, 165, 0, 0.3); }
                      .hl-yellow { background-color: rgba(255, 235, 59, 0.4); border-bottom: 2px solid #fdd835; cursor: pointer; }
                      .hl-green { background-color: rgba(165, 214, 167, 0.4); border-bottom: 2px solid #66bb6a; cursor: pointer; }
                      .hl-blue { background-color: rgba(144, 202, 249, 0.4); border-bottom: 2px solid #42a5f5; cursor: pointer; }
                      .hl-pink { background-color: rgba(244, 143, 177, 0.4); border-bottom: 2px solid #ec407a; cursor: pointer; }
                      .hl-purple { background-color: rgba(206, 147, 216, 0.4); border-bottom: 2px solid #ab47bc; cursor: pointer; }
                  \`;
                  contents.document.head.appendChild(style);
              });
              } catch(e) {
                  console.error("Init Error", e);
                  document.getElementById('ld').innerHTML = '<div class="flex flex-col items-center gap-4 text-center p-8"><i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-2"></i><p class="opacity-70 text-sm">Failed to load book.</p><button onclick="location.reload()" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded mt-4 text-xs font-bold uppercase tracking-widest transition">Retry</button></div>';
              }
          }
  
          function openFromBack() {
              const b = document.getElementById('back-c');
              const bt = document.getElementById('b-t');
              
              b.style.display = 'block';
              b.classList.remove('!hidden'); 
              // Force reflow
              void b.offsetWidth;
              b.classList.remove('a-b-a');
              b.classList.add('a-b-h'); // Hide back cover
              setTimeout(() => {
                  b.classList.add('!hidden');
                  b.classList.remove('a-b-h');
                  b.style.display = 'none';
                  bt.classList.add('open'); // Show book after animation
                  document.getElementById('pi').classList.add('v'); // Show page number
              }, 1200);
          }
          function closeToBack() {
              const b = document.getElementById('back-c');
              const bt = document.getElementById('b-t');
              
              document.getElementById('pi').classList.remove('v'); // Hide page number
              bt.classList.remove('open'); // Hide book before animation
              
              b.style.display = 'block';
              b.classList.remove('!hidden');
              b.classList.remove('a-b-h');
              b.classList.add('a-b-a'); // Show back cover
              
              setTimeout(() => {
                  b.classList.remove('a-b-a');
              }, 1200);
          }
          function restartBook() {
              rend.display(0);
              const b = document.getElementById('back-c');
              const cb = document.getElementById('c-b');
              const bt = document.getElementById('b-t');
              
              b.style.display = 'none';
              b.classList.remove('a-b-a', 'a-b-h');
              bt.classList.remove('open');
              document.getElementById('pi').classList.remove('v');
              
              cb.style.display = 'block';
              cb.classList.remove('a-f-o', 'a-f-c');
          }
          
          function closeToFront() {
              const cb = document.getElementById('c-b');
              const bt = document.getElementById('b-t');
              
              document.getElementById('pi').classList.remove('v'); // Hide page number
              
              cb.style.display = 'block';
              bt.classList.remove('open');
              cb.classList.remove('a-f-o');
              cb.classList.add('a-f-c');
              setTimeout(() => {
                  cb.classList.remove('a-f-c');
              }, 1200);
          }
  
          function openBook() {
              const cb = document.getElementById('c-b');
              const bt = document.getElementById('b-t');
              cb.classList.add('a-f-o');
              setTimeout(() => {
                  cb.style.display = 'none';
                  bt.classList.add('open');
                  document.getElementById('pi').classList.add('v'); // Show page number
              }, 800);
          }
  
          function toggleLayout() {
              const b = document.body; b.classList.toggle('full-mode');
              const full = b.classList.contains('full-mode');
              document.getElementById('s-c').classList.toggle('full', full);
              document.getElementById('m-btn').innerHTML = full ? '<i class="fas fa-compress-alt"></i>' : '<i class="fas fa-expand"></i>';
              
              const h = document.getElementById('main-hdr'), f = document.getElementById('main-ft');
              if(full) {
                  h.classList.remove('v'); f.classList.remove('v');
                  window.onmousemove = (e) => {
                      if(e.clientY < 60) h.classList.add('v'); else h.classList.remove('v');
                      if(e.clientY > window.innerHeight - 60) f.classList.add('v'); else f.classList.remove('v');
                  };
              } else {
                  window.onmousemove = null; h.classList.remove('v'); f.classList.remove('v');
              }
              setTimeout(() => { if (rend) rend.resize(); }, 500);
          }
  
          window.addHighlight = (color) => {
              const sel = window.currentSelection;
              if(!sel) return;
              document.getElementById('hl-menu').style.display='none';
              
              // Add annotation to viewer
              rend.annotations.add("highlight", sel.cfiRange, {}, null, 'hl-' + color);
              sel.contents.window.getSelection().removeAllRanges();
              
              highlights.push({t: sel.text, cfi: sel.cfiRange, d: new Date().toLocaleDateString(), c: color});
              localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
              renderHighlights();
          };
          
          window.deleteHighlight = (i) => {
              if(!confirm('Delete this highlight?')) return;
              const h = highlights[i];
              rend.annotations.remove(h.cfi, "highlight");
              highlights.splice(i, 1);
              localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
              renderHighlights();
          };

          function renderHighlights(){
              const container = document.getElementById('hi-l');
              const sideContainer = document.getElementById('chat-highlights');
              const exBtn = document.getElementById('ex-hi-btn');
              if(highlights.length === 0) {
                  exBtn?.classList.add('hidden');
                  if(sideContainer) sideContainer.innerHTML = '<p class=\"text-[10px] text-center opacity-40 py-10 mt-20\">No highlights yet.</p>';
                  return;
              }
              exBtn?.classList.remove('hidden');
              
              // Re-apply annotations just in case (e.g. page reload)
              if(rend) {
                  // Clear existing to avoid duplicates if called multiple times (though rend.annotations.add handles it usually, unsafe to clear all blindly without tracking)
                  // For now, assume renderHighlights called after load.
                  // Ideally we track added annotations. simpler: just re-add all, library handles duplicates or we check.
              }
              // Actually, we should only add annotations on init. This function updates UI. 
              
              const html = highlights.map((h, i) => 
                  '<div class=\"search-item flex justify-between items-start group\" onclick=\"rend.display(\\\'' + h.cfi + '\\\')\">' +
                  '<div><div class=\"w-2 h-2 rounded-full mb-2\" style=\"background: var(--hl-' + (h.c||'yellow') + ')\"></div>' +
                  '<p class=\"text-xs line-clamp-2 italic opacity-80\" style=\"border-left: 2px solid ' + getColorCode(h.c) + '; padding-left: 8px\">\"' + h.t + '\"</p>' +
                  '<p class=\"text-[9px] opacity-40 mt-1\">' + h.d + '</p></div>' +
                  '<div class=\"swipe-del\" onclick=\"event.stopPropagation();deleteHighlight(' + i + ')\"><i class=\"fas fa-trash\"></i></div>' +
                  '<button class=\"del-btn\" onclick=\"event.stopPropagation();deleteHighlight(' + i + ')\" title=\"Delete Highlight\"><i class=\"fas fa-trash\"></i></button>' +
                  '</div>'
              ).join('');
              
              if(container) container.innerHTML = html;
              if(sideContainer) sideContainer.innerHTML = html;
          }
          
          function getColorCode(c) {
              const map = { yellow:'#fdd835', green:'#66bb6a', blue:'#42a5f5', pink:'#ec407a', purple:'#ab47bc' };
              return map[c] || map['yellow'];
          }
          
          window.switchSidebarTab = (el) => {
              const tabId = el.getAttribute('data-tab');
              document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
              document.querySelectorAll('.chat-tab-c').forEach(c => c.classList.remove('active'));
              el.classList.add('active');
              document.getElementById(tabId).classList.add('active');
              
              // Hide footer if on highlights tab
              document.getElementById('chat-footer').style.display = tabId === 'chat-highlights' ? 'none' : 'flex';
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
              b.innerHTML = notes.map((n, i) => 
                  '<div class=\"search-item flex justify-between items-start group w-full\">' +
                  '<div class=\"flex-1 pr-2\">' +
                  '<div class=\"w-2 h-2 rounded-full mb-2\" style=\"background: #ffffff\"></div>' +
                  '<p class=\"text-xs leading-relaxed opacity-90 break-words w-full\" style=\"border-left: 2px solid #ffffff; padding-left: 8px\">' + n.text.replace(/\\n/g, '<br>') + '</p>' +
                  '<p class=\"text-[9px] opacity-40 mt-1 pl-2\">' + n.time + '</p></div>' +
                  '<div class=\"flex shrink-0\">' +
                  '<div class=\"swipe-del\" onclick=\"deleteNote(' + i + ')\"><i class=\"fas fa-trash\"></i></div>' +
                  '<button class=\"del-btn\" onclick=\"deleteNote(' + i + ')\" title=\"Delete Note\"><i class=\"fas fa-trash\"></i></button>' +
                  '</div>' +
                  '</div>'
              ).join('');
              b.scrollTop = b.scrollHeight;
          };
          
          window.deleteNote = (i) => {
              if(!confirm('Delete this note?')) return;
              let notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
              notes.splice(i, 1);
              localStorage.setItem('fr_nt_'+FU, JSON.stringify(notes));
              renderNotes();
          };
          
          window.exportAll = () => {
              let content = "--- FLIPREAD EXPORT ---\\n\\n";
              
              content += "--- HIGHLIGHTS ---\\n";
              const h = highlights.map(x => '[' + (x.d||'') + '] \"' + x.t + '\" (' + (x.c||'yellow') + ')').join('\\n\\n');
              content += h + "\\n\\n";
              
              content += "--- NOTES ---\\n";
              let notes = [];
              try { notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || []; } catch(e) {}
              const n = notes.map(x => '[' + x.time + '] ' + x.text).join('\\n\\n');
              content += n;

              const blob = new Blob([content], {type: 'text/plain'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = '${safeTitle}_export.txt'; a.click();
          };
          
          function switchTab(e, id){
              document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
              document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
              e.target.classList.add('active');
              document.getElementById(id).classList.add('active');
          }
          window.toggleModal = (id) => document.getElementById(id).classList.toggle('o');
          function toggleTOC(){ document.getElementById('bg-modal').classList.toggle('o'); }
          function toggleSearch(){ document.getElementById('search-m').classList.toggle('o'); }
          async function doSearch(){
              const q = document.getElementById('s-q').value, res = document.getElementById('s-r');
              if(!q) return;
              res.innerHTML = '<p class="text-center py-10 opacity-40 animate-pulse text-xs">Hunting for words...</p>';
              
              try {
                  // Use EPUB.js built-in search if available or iterate manually
                  // Since standard search might be limited, we'll iterate spine items
                   const results = await Promise.all(
                      book.spine.spineItems.map(item => item.load(book.load.bind(book)).then(doc => {
                          const matches = [];
                          // Escape regex special chars
                          const safeQ = q.replace(/[.*+?^$\{}()|[\\]\\\\]/g, '\\\\$&'); 
                          const regex = new RegExp(safeQ, 'gi');
                          
                          if(!doc || !doc.body) return [];
                          
                          // Simple text extraction
                          let text = doc.body.innerText || doc.body.textContent; 
                          let m;
                          
                          while((m = regex.exec(text)) !== null) {
                              // We need a CFI for the specific text node match if possible, 
                              // but item.cfiFromElement gives CFI for the whole element usually.
                              // For simplicity in this lightweight viewer, we jump to the section (item).
                              // Ideally, we'd use find method of epub.js but it can be flaky.
                              
                              matches.push({
                                  cfi: item.cfiFromElement(doc.body), // Jumps to start of chapter containing match
                                  excerpt: text.substring(Math.max(0, m.index - 40), Math.min(text.length, m.index + 60))
                              });
                              if(matches.length > 5) break; 
                          }
                          item.unload();
                          return matches;
                      }).catch(e => { console.warn("Search error on item", e); return []; }))
                  );
                  
                  const flat = results.flat();
                  res.innerHTML = flat.length ? flat.map(r => 
                      '<div class="search-item" onclick="rend.display(\\\'' + r.cfi + '\\\');toggleSearch();">' +
                      '<p class="text-xs opacity-80 mb-1 leading-relaxed">...' + r.excerpt.replace(new RegExp(q, 'gi'), '<span class="search-match">$&</span>') + '...</p>' +
                      '</div>'
                  ).join('') : '<p class="text-center py-10 opacity-40 text-xs">No matches found.</p>';
                  
              } catch(e) {
                  console.error(e);
                  res.innerHTML = '<p class="text-center py-10 opacity-40 text-xs">Search failed.</p>';
              }
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
                  rain: 'https://cdn.pixabay.com/audio/2022/03/10/audio_51307b0f69.mp3',
                  fire: 'https://cdn.pixabay.com/audio/2021/08/09/audio_65b750170a.mp3',
                  library: 'https://cdn.pixabay.com/audio/2023/10/24/audio_985b8c9d0d.mp3'
              };
              amb = new Audio(urls[type]);
              amb.crossOrigin = "anonymous";
              amb.loop = true; amb.play().catch(e => {
                  console.error('Audio failed:', e);
                  // Fallback attempt if first fails
                  amb.src = urls[type].replace('https://ia', 'https://archive.org/download/');
                  amb.play().catch(ex => alert('Sound could not be loaded. Please check your browser audio settings.'));
              });
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
                  rend.getContents().forEach(c => {
                      c.addStylesheetRules({
                          "body": { "font-family": ff + " !important", "font-size": fz + "% !important", "line-height": lh + " !important" }
                      });
                  });
              }
              document.getElementById('fs-v').textContent = fz + "%";
              localStorage.setItem('fr_fz', fz);
              localStorage.setItem('fr_ff', ff);
              localStorage.setItem('fr_lh', lh);
          }
  
          function resetSettings(){
              localStorage.removeItem('fr_fz'); localStorage.removeItem('fr_ff'); localStorage.removeItem('fr_lh');
              location.reload();
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
              clearTimeout(rt); rt = setTimeout(() => { 
                  if (rend && rend.manager) { 
                      rend.settings.spread = window.innerWidth <= 768 ? 'none' : 'auto'; 
                      try { rend.resize(); } catch(e){}
                  } 
              }, 250);
          });
  
          async function initViewer(){
              if(localStorage.getItem('fr_fz')) fz = parseInt(localStorage.getItem('fr_fz'));
              if(localStorage.getItem('fr_ff')) ff = localStorage.getItem('fr_ff');
              if(localStorage.getItem('fr_lh')) lh = localStorage.getItem('fr_lh');
              
              const noteArea = document.getElementById('t-nt-a');
              if(noteArea) noteArea.value = ''; // Deprecated UI
              
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
              window.switchSidebarTab = (el) => {
                  const tabId = el.getAttribute('data-tab');
                  document.querySelectorAll('#chat-w .chat-tab').forEach(t => t.classList.remove('active'));
                  document.querySelectorAll('#chat-w .chat-tab-c').forEach(c => c.classList.remove('active'));
                  el.classList.add('active');
                  document.getElementById(tabId).classList.add('active');
                  document.getElementById('chat-footer').style.display = tabId === 'chat-highlights' ? 'none' : 'flex';
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
                  b.innerHTML = notes.map((n, i) => 
                      '<div class=\"chat-m group flex flex-col items-start\">' + 
                      '<div>' + n.text.replace(/\\n/g, '<br>') + '</div>' + 
                      '<div class=\"flex justify-between w-full items-center mt-1\">' +
                      '<span class=\"chat-t\">' + n.time + '</span>' +
                      '<button class=\"del-btn\" onclick=\"deleteNote(' + i + ')\"><i class=\"fas fa-trash\"></i></button>' +
                      '</div></div>'
                  ).join('');
                  b.scrollTop = b.scrollHeight;
              };
              // window.exportNotes removed here as it is redefined below
              
              await init(); // Load the book
              applyStyles();
          }
          initViewer();
      </script>
  </body>
  </html>`;
}
