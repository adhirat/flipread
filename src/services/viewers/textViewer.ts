
import { escapeHtml } from './viewerUtils';

export function textViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = ''): string {
  const bg = (settings.background as string) || '#f3f0e8';
  const accent = (settings.accent_color as string) || '#4f46e5';
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${safeTitle} — FlipRead</title>
    <link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
    <link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">
    <meta property="og:title" content="${safeTitle} — FlipRead">
    <meta property="og:description" content="Read this interactive flipbook on FlipRead.">
    <meta property="og:image" content="${coverUrl || logoUrl || '/logo.png'}">
    <meta name="twitter:card" content="summary_large_image">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;overflow:hidden;background:${bg};background-size:cover;background-position:center;height:100dvh;width:100vw;position:fixed;transition:background 0.3s ease}

        #text-v{width:100%;height:100%;overflow-y:auto;padding:60px 20px 80px;-webkit-overflow-scrolling:touch}
        #text-c{background:white;box-shadow:0 10px 30px rgba(0,0,0,0.1);border-radius:12px;max-width:800px;margin:0 auto;padding:48px;line-height:1.8;font-size:16px;color:#1e293b;min-height:60vh}

        /* Markdown styles */
        #text-c h1{font-size:2em;font-weight:700;margin:0.8em 0 0.4em;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:0.3em}
        #text-c h2{font-size:1.6em;font-weight:600;margin:0.8em 0 0.3em;color:#1e293b}
        #text-c h3{font-size:1.3em;font-weight:600;margin:0.6em 0 0.3em;color:#334155}
        #text-c h4,#text-c h5,#text-c h6{font-size:1.1em;font-weight:600;margin:0.5em 0 0.2em;color:#475569}
        #text-c p{margin:0.8em 0}
        #text-c a{color:${accent};text-decoration:underline}
        #text-c code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:0.9em;font-family:'SF Mono',Consolas,monospace}
        #text-c pre{background:#0f172a;color:#e2e8f0;padding:20px;border-radius:8px;overflow-x:auto;margin:1em 0;line-height:1.5}
        #text-c pre code{background:none;padding:0;color:inherit}
        #text-c blockquote{border-left:4px solid ${accent};padding:12px 20px;margin:1em 0;background:rgba(79,70,229,0.04);border-radius:0 8px 8px 0;color:#475569}
        #text-c ul,#text-c ol{padding-left:1.5em;margin:0.8em 0}
        #text-c li{margin:0.3em 0}
        #text-c img{max-width:100%;border-radius:8px;margin:1em 0}
        #text-c table{width:100%;border-collapse:collapse;margin:1em 0}
        #text-c th,#text-c td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}
        #text-c th{background:#f8fafc;font-weight:600}
        #text-c hr{border:none;border-top:2px solid #e2e8f0;margin:2em 0}

        /* Plain text mode */
        #text-c.plain-text{white-space:pre-wrap;font-family:'SF Mono',Consolas,'Courier New',monospace;font-size:14px;line-height:1.7;color:#334155}

        .hdr{display:flex;align-items:center;justify-content:space-between;padding:0 15px;background:linear-gradient(to bottom,rgba(0,0,0,0.8),transparent);color:#fff;height:50px;z-index:1500;position:fixed;top:0;left:0;width:100%;pointer-events:auto;transition:all 0.4s}
        .ft{display:flex;align-items:center;justify-content:center;gap:15px;padding:10px;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);position:fixed;bottom:0;left:0;width:100%;z-index:1500;pointer-events:auto;transition:all 0.4s}
        body.light-ui .hdr{background:linear-gradient(to bottom,rgba(0,0,0,0.1),transparent);color:#1a1a1a}
        body.light-ui .ft{background:linear-gradient(to top,rgba(0,0,0,0.1),transparent);color:#1a1a1a}

        body.full-mode .hdr{transform:translateY(-100%);opacity:0}
        body.full-mode .ft{transform:translateY(100%);opacity:0}
        body.full-mode .hdr:hover,body.full-mode .ft:hover{transform:translateY(0);opacity:1}

        .nb{background:rgba(255,255,255,0.1);width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px;color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);transition:all .3s;border:none}
        .nb:hover{background:rgba(255,255,255,0.23);transform:scale(1.1)}

        .modal{position:fixed;inset:0;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;z-index:2500;backdrop-filter:blur(8px)}
        .modal.o{display:flex}
        .modal-c{background:#1c1c1c;border-radius:16px;width:95%;max-width:400px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);color:#fff;overflow:hidden;border:1px solid rgba(255,255,255,0.1)}

        .br{position:fixed;bottom:60px;right:15px;z-index:200;font-size:10px;color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.2s}
        .br:hover{color:rgba(255,255,255,0.6)}

        body.light-ui .modal-c{background:#ffffff;color:#1a1a1a;border-color:rgba(0,0,0,0.1)}

        .font-ctl{display:flex;align-items:center;gap:8px;margin-bottom:16px}
        .font-ctl label{font-size:11px;text-transform:uppercase;opacity:60%;font-weight:600;letter-spacing:0.5px;min-width:60px}
        .font-ctl select,.font-ctl input[type=range]{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;color:inherit;outline:none}

        /* Chat Sidebar */
        #chat-w{position:fixed;right:-400px;top:0;bottom:0;width:350px;background:rgba(20,20,20,0.85);backdrop-filter:blur(20px);z-index:2100;border-left:1px solid rgba(255,255,255,0.1);transition:right 0.4s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;color:white}
        #chat-w.o{right:0;box-shadow:-20px 0 50px rgba(0,0,0,0.5)}
        .chat-h{padding:20px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center}
        .chat-b{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
        .chat-f{padding:15px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:8px;background:rgba(0,0,0,0.2)}
        .chat-i{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px 15px;color:#fff;outline:none;font-size:13px}
        .chat-i:focus{border-color:${accent}}
        .chat-s{width:38px;height:38px;border-radius:10px;background:${accent};color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:transform 0.2s}
        .chat-s:hover{transform:scale(1.05)}
        .search-item{border-radius:12px;border:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.03);padding:12px}
        body.light-ui #chat-w{background:rgba(248,248,248,0.95);color:#1a1a1a;border-left-color:rgba(0,0,0,0.1)}
        body.light-ui .chat-h{border-bottom-color:rgba(0,0,0,0.1)}
        body.light-ui .search-item{background:white;border-color:rgba(0,0,0,0.1)}
        body.light-ui .chat-f{background:rgba(0,0,0,0.05);border-top-color:rgba(0,0,0,0.1)}
        body.light-ui .chat-i{background:#fff;border-color:rgba(0,0,0,0.2);color:#111}

        @media(max-width:768px){
            #text-v{padding:50px 10px 70px}
            #text-c{padding:24px;font-size:15px;border-radius:0}
        }

        #tts-ctrls { display: none; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; backdrop-filter: blur(10px); margin-right: 8px; }
        .tts-active { color: #facc15 !important; background: rgba(250, 204, 21, 0.2) !important; border-color: rgba(250, 204, 21, 0.4) !important; }
        .tts-playing i { animation: pulse-tts 2s infinite; }
        @keyframes pulse-tts { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    </style>
</head>
<body class="light-ui" style="background:#ffffff">
    <div id="ld" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
        </div>
        <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Loading Document...</p>
    </div>

    <header class="hdr" id="main-hdr">
        <div class="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <a href="${storeUrl}"><img src="${logoUrl || '/logo.png'}" alt="Logo" class="h-6 w-6 object-contain rounded-sm" /></a>
            <div class="font-bold text-xs sm:text-sm truncate opacity-90">${safeTitle}</div>
        </div>
        <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            <div id="tts-ctrls" class="hidden sm:flex">
                <button onclick="togglePlayPauseTTS()" class="text-white hover:text-indigo-300 transition w-6 h-6 flex items-center justify-center">
                    <i id="tts-pp-i" class="fas fa-pause"></i>
                </button>
                <div class="w-[1px] h-3 bg-white/20"></div>
                <button onclick="stopTTS()" class="text-white hover:text-red-400 transition w-6 h-6 flex items-center justify-center">
                    <i class="fas fa-stop text-[10px]"></i>
                </button>
            </div>
            <button class="nb !bg-transparent" id="tts-btn" onclick="toggleTTS()" title="Listen (TTS)">
                <i class="fas fa-volume-up"></i>
            </button>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition hidden sm:flex" id="m-btn" title="Fullscreen"><i class="fas fa-expand text-xs"></i></button>
        </div>
    </header>

    <div id="text-v">
        <div id="text-c"></div>
    </div>

    <div class="ft !justify-between px-4" id="main-ft">
        <button class="nb" onclick="toggleModal('bg-modal')" title="Settings"><i class="fas fa-cog"></i></button>
        <button class="nb" onclick="toggleChat()"><i class="fas fa-comment-dots"></i></button>
    </div>

    <div id="chat-w">
        <div class="chat-h">
            <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">Notes</span>
            <button onclick="toggleChat()" class="opacity-40 hover:opacity-100">&#x2715;</button>
        </div>
        <div class="chat-b" id="chat-notes"></div>
        <div class="chat-f">
            <textarea id="chat-i" placeholder="Add a note..." class="chat-i" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendNote()}"></textarea>
            <button onclick="sendNote()" class="chat-s"><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>

    <div id="bg-modal" class="modal" onclick="toggleModal('bg-modal')">
        <div class="modal-c !w-[500px] !max-w-[95vw]" onclick="event.stopPropagation()">
            <div class="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <span class="text-[11px] uppercase font-bold tracking-[0.2em] opacity-60">Reader Settings</span>
                <button onclick="toggleModal('bg-modal')" class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition opacity-60 hover:opacity-100"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <p class="text-[11px] uppercase opacity-60 mb-4 tracking-widest font-bold text-white/50">Typography</p>
                <div class="font-ctl">
                    <label>Size</label>
                    <input type="range" min="12" max="24" value="16" oninput="setFontSize(this.value)">
                </div>
                <div class="font-ctl">
                    <label>Font</label>
                    <select onchange="setFont(this.value)">
                        <option value="'Segoe UI',system-ui,sans-serif">System UI</option>
                        <option value="Georgia,serif">Georgia</option>
                        <option value="'Courier New',monospace">Monospace</option>
                        <option value="'Palatino Linotype',serif">Palatino</option>
                        <option value="'Comic Sans MS',cursive">Casual</option>
                    </select>
                </div>
                <p class="text-[11px] uppercase opacity-60 mb-4 mt-6 tracking-widest font-bold text-white/50">Backgrounds</p>
                <div class="grid grid-cols-5 gap-3 mb-6">
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="White" style="background:#ffffff" onclick="setBg('#ffffff',false)"></div>
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="Cream" style="background:#fdfbf7" onclick="setBg('#fdfbf7',false)"></div>
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="Sepia" style="background:#f5f0e1" onclick="setBg('#f5f0e1',false)"></div>
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="Dark" style="background:#1a1a1a" onclick="setBg('#1a1a1a',true)"></div>
                    <div class="w-10 h-10 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-2 hover:ring-white/50 transition shadow-lg" title="Midnight" style="background:#0f172a" onclick="setBg('#0f172a',true)"></div>
                </div>
                <div class="pt-4 border-t border-white/10 flex gap-3">
                    <a href="?mode=web" class="flex-1 text-center py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] uppercase font-bold tracking-widest transition border border-white/10">
                        <i class="fas fa-globe mr-2"></i> Web View
                    </a>
                    <button class="flex-1 py-3 bg-white/10 hover:bg-red-500/20 rounded-xl text-[11px] uppercase font-bold tracking-widest transition border border-white/10" onclick="resetSettings()">
                        <i class="fas fa-undo mr-2"></i> Reset
                    </button>
                </div>
            </div>
        </div>
    </div>

    ${showBranding ? '<a class="br" href="https://flipread.pages.dev" target="_blank">FlipRead</a>' : ''}

    <script>
        const FU='${fileUrl}';
        let syn = window.speechSynthesis;
        let utter = null;
        let speaking = false;
        let ttsPaused = false;

        const isMarkdown = FU.match(/\\.(md|markdown)$/i) || '${safeTitle}'.match(/\\.(md|markdown)$/i);
        const isRtf = FU.match(/\\.rtf$/i) || '${safeTitle}'.match(/\\.rtf$/i);
        const isHtml = FU.match(/\\.html?$/i) || '${safeTitle}'.match(/\\.html?$/i);

        async function initText() {
            try {
                const res = await fetch(FU);
                if(!res.ok) throw new Error('Failed to load');
                const text = await res.text();
                const el = document.getElementById('text-c');

                if(isHtml) {
                    // Render HTML in a sandboxed way
                    el.innerHTML = text;
                } else if(isMarkdown) {
                    // Render markdown
                    marked.setOptions({ breaks: true, gfm: true, highlight: function(code, lang) {
                        if(lang && hljs.getLanguage(lang)) return hljs.highlight(code, {language: lang}).value;
                        return hljs.highlightAuto(code).value;
                    }});
                    el.innerHTML = marked.parse(text);
                } else if(isRtf) {
                    // Basic RTF: strip RTF commands and show as plain text
                    const plain = text.replace(/\\\\[a-z]+[-]?\\d*\\s?/g, '').replace(/[{}]/g, '').replace(/\\\\'/g, "'");
                    el.textContent = plain;
                    el.classList.add('plain-text');
                } else {
                    // Plain text
                    el.textContent = text;
                    el.classList.add('plain-text');
                }

                document.getElementById('ld').style.opacity='0';
                setTimeout(()=>document.getElementById('ld').style.display='none', 500);
            } catch(e) {
                console.error(e);
                document.getElementById('ld').innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i><p class="mt-4">Error Loading Document</p>';
            }
        }

        // Typography controls
        window.setFontSize = (px) => { document.getElementById('text-c').style.fontSize = px + 'px'; };
        window.setFont = (f) => { document.getElementById('text-c').style.fontFamily = f; };

        // Layout
        document.getElementById('m-btn').onclick = () => {
            document.body.classList.toggle('full-mode');
            const btn = document.getElementById('m-btn');
            btn.innerHTML = document.body.classList.contains('full-mode') ? '<i class="fas fa-compress-alt text-xs"></i>' : '<i class="fas fa-expand text-xs"></i>';
        };

        // Shared utils
        window.toggleModal = (id) => document.getElementById(id).classList.toggle('o');
        window.setBg = (c, isDark) => { document.body.style.background = c; document.body.classList.toggle('light-ui', !isDark); };
        window.resetSettings = () => { if(confirm('Reset?')) { localStorage.clear(); location.reload(); } };
        window.toggleChat = () => { const w = document.getElementById('chat-w'); w.classList.toggle('o'); if(w.classList.contains('o')) renderNotes(); };
        window.sendNote = () => {
            const i = document.getElementById('chat-i'), v = i.value.trim();
            if(!v) return;
            let notes = [];
            try { notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || []; if(!Array.isArray(notes)) notes = []; } catch{ notes = []; }
            notes.push({text:v,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
            localStorage.setItem('fr_nt_'+FU, JSON.stringify(notes));
            i.value = '';
            renderNotes();
        };
        window.renderNotes = () => {
            const b = document.getElementById('chat-notes');
            let notes = [];
            try { notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || []; if(!Array.isArray(notes)) notes = []; } catch{ notes = []; }
            b.innerHTML = notes.map(n =>
                '<div class="search-item"><p class="text-xs leading-relaxed opacity-90 break-words" style="border-left:2px solid ${accent};padding-left:8px">' + n.text.replace(/\\n/g,'<br>') + '</p><p class="text-[9px] opacity-40 mt-1 pl-2">' + n.time + '</p></div>'
            ).join('');
            b.scrollTop = b.scrollHeight;
        };

        window.toggleTTS = () => {
            if(speaking || ttsPaused) {
                stopTTS();
            } else {
                startTTS();
            }
        };
        window.startTTS = () => {
            const container = document.getElementById('text-c');
            if(!container) return;
            
            const text = container.innerText;
            if(!text) return;

            utter = new SpeechSynthesisUtterance(text);
            utter.onend = () => { stopTTS(); };
            utter.onstart = () => {
                speaking = true;
                ttsPaused = false;
                updateTTSUI();
            };
            
            syn.cancel(); 
            setTimeout(() => {
                syn.resume();
                syn.speak(utter);
            }, 100);
            
            const ctrls = document.getElementById('tts-ctrls');
            if(ctrls) {
                ctrls.style.display = 'flex';
            }
        };
        window.togglePlayPauseTTS = () => {
            if (syn.paused) {
                syn.resume();
                ttsPaused = false;
                speaking = true;
            } else {
                syn.pause();
                ttsPaused = true;
                speaking = false;
            }
            updateTTSUI();
        };
        window.stopTTS = () => {
            syn.cancel();
            speaking = false;
            ttsPaused = false;
            const ctrls = document.getElementById('tts-ctrls');
            if(ctrls) {
                ctrls.style.display = 'none';
            }
            updateTTSUI();
        };
        window.updateTTSUI = () => {
            const ppIcon = document.getElementById('tts-pp-i');
            const ttsBtn = document.getElementById('tts-btn');
            
            if (ppIcon) {
                ppIcon.className = ttsPaused ? 'fas fa-play ml-0.5' : 'fas fa-pause';
            }
            
            if (ttsBtn) {
                ttsBtn.classList.remove('tts-playing', 'tts-paused-state', 'tts-active');
                if (speaking || ttsPaused) {
                    if (ttsPaused) {
                        ttsBtn.classList.add('tts-paused-state');
                    } else {
                        ttsBtn.classList.add('tts-playing', 'tts-active');
                    }
                }
            }
        };

        initText();
    </script>
</body>
</html>`;
}
