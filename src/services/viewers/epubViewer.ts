
import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function epubViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    const bg = (settings.background as string) || '#ffffff';
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);
  
    const extraStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&family=EB+Garamond:wght@400;700&family=Inter:wght@400;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Playfair+Display:wght@400;700&display=swap');

        /* Stage and Book Stage */
        #s-c { 
            position: absolute; 
            inset: 60px 0 80px 0; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            perspective: 3500px; 
            overflow: hidden; 
            transition: opacity 0.5s ease, inset 0.4s, height 0.4s; 
            width: 100%; 
        }
        body.full-mode #s-c { inset: 0 !important; height: 100dvh !important; }

        #b-t { 
            position: relative; 
            width: 98%; 
            height: 98%; 
            transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease; 
            transform-style: preserve-3d; 
            opacity: 0; 
            pointer-events: none; 
        }
        #b-t.open { opacity: 1; pointer-events: auto; }
        
        #b-v { 
            width: 100%; 
            height: 100%; 
            background: white; 
            box-shadow: none; 
            position: relative; 
            border-left: 6px solid #e0e0e0; 
            border-right: 6px solid #e0e0e0; 
            transition: transform 0.15s ease, opacity 0.15s ease; 
        }
        #spine { 
            position: absolute; 
            left: 50%; 
            top: 0; 
            bottom: 0; 
            width: 60px; 
            transform: translateX(-50%); 
            background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0) 100%); 
            pointer-events: none; 
            z-index: 50; 
            mix-blend-mode: multiply; 
        }
        @media(max-width:768px){ #spine { display: none; } }
        
        /* Cover Flipping */
        .c-b { 
            position: absolute; 
            z-index: 200; 
            width: 45vh; 
            height: 65vh; 
            transform-style: preserve-3d; 
            transition: transform 0.5s ease; 
            cursor: pointer; 
            border: none !important; 
            outline: none !important; 
            background: transparent; 
        }
        .c-v { 
            width: 100%; 
            height: 100%; 
            object-fit: contain; 
            border-radius: 4px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.5); 
            background: transparent; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            text-align: center; 
            padding: 0; 
            font-weight: bold; 
            overflow: hidden; 
            border: none !important; 
        }
        .c-b::before { 
            content: ''; 
            position: absolute; 
            inset: 0 0 0 -30px; 
            transform: rotateY(-90deg); 
            transform-origin: right; 
            background: linear-gradient(to right, #333, #111, #333); 
            border-radius: 4px 0 0 4px; 
            opacity: 0; 
            transition: opacity 0.3s; 
        }
        .c-b:hover::before { opacity: 1; }
        
        .a-f-o { animation: fO 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; pointer-events: none; }
        .a-f-c { animation: fC 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; }
        .a-b-a { animation: bA 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; }
        .a-b-h { animation: bH 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; pointer-events: none; }

        @keyframes fO { 0% { transform: rotateY(0); opacity: 1; } 40% { transform: rotateY(-60deg) translateZ(50px); opacity: 1; } 100% { transform: rotateY(-180deg) translateZ(200px) scale(1.5); opacity: 0; } }
        @keyframes fC { 0% { transform: rotateY(-180deg) translateZ(200px) scale(1.5); opacity: 0; } 60% { transform: rotateY(-60deg) translateZ(50px); opacity: 1; } 100% { transform: rotateY(0); opacity: 1; } }
        @keyframes bA { 0% { transform: rotateY(180deg) translateZ(200px) scale(1.5); opacity: 0; } 60% { transform: rotateY(60deg) translateZ(50px); opacity: 1; } 100% { transform: rotateY(0); opacity: 1; } }
        @keyframes bH { 0% { transform: rotateY(0); opacity: 1; } 40% { transform: rotateY(60deg) translateZ(50px); opacity: 1; } 100% { transform: rotateY(180deg) translateZ(200px) scale(1.5); opacity: 0; } }
        
        /* Highlighting Menu */
        #hl-menu { 
            position: absolute; 
            z-index: 1000; 
            background: rgba(30,30,30,0.95); 
            backdrop-filter: blur(10px); 
            padding: 8px; 
            border-radius: 50px; 
            display: none; 
            gap: 8px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
            border: 1px solid rgba(255,255,255,0.1); 
            transform: translateX(-50%); 
        }
        .hl-btn { 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            border: 2px solid rgba(255,255,255,0.2); 
            cursor: pointer; 
            transition: transform 0.2s; 
        }
        .hl-btn:hover { transform: scale(1.2); border-color: white; }

        /* Highlights Colors */
        .hl-yellow { background-color: rgba(255, 235, 59, 0.4); border-bottom: 2px solid #fdd835; cursor: pointer; }
        .hl-green { background-color: rgba(165, 214, 167, 0.4); border-bottom: 2px solid #66bb6a; cursor: pointer; }
        .hl-blue { background-color: rgba(144, 202, 249, 0.4); border-bottom: 2px solid #42a5f5; cursor: pointer; }
        .hl-pink { background-color: rgba(244, 143, 177, 0.4); border-bottom: 2px solid #ec407a; cursor: pointer; }
        .hl-purple { background-color: rgba(206, 147, 216, 0.4); border-bottom: 2px solid #ab47bc; cursor: pointer; }

        /* Sidebar Tabs */
        .chat-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }
        .chat-tab { flex: 1; padding: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; cursor: pointer; opacity: 0.5; border-bottom: 2px solid transparent; transition: 0.2s; }
        .chat-tab.active { opacity: 1; border-color: ${accent}; background: rgba(255,255,255,0.02); }
        .chat-tab-c { display: none; width: 100%; flex-direction: column; }
        .chat-tab-c.active { display: flex; }
        
        .search-item { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; border-radius: 8px; transition: 0.2s; }
        .search-item:hover { background: rgba(255,255,255,0.05); }
        .search-match { color: ${accent}; font-weight: bold; background: rgba(255,165,0,0.2); }

        .del-btn, .edit-btn { transition: opacity 0.2s; background: transparent; border: none; cursor: pointer; font-size: 11px; padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
        .del-btn { color: #ff5252; }
        .edit-btn { color: ${accent}; }
        
        /* Night Shift */
        body.night-shift { filter: sepia(0.6) brightness(0.9); }
        
        /* Modal Customizations */
        .modal-c select { background: #222; color: #fff; border: 1px solid #444; padding: 6px; border-radius: 4px; font-size: 12px; }
        
        /* Nav Areas */
        #nav-l, #nav-r { position: fixed; top: 60px; bottom: 80px; width: 15%; z-index: 600; cursor: pointer; }
        #nav-l { left: 0; }
        #nav-r { right: 0; }
        @media(max-width:768px){ 
            #nav-l, #nav-r { top: 60px; bottom: 80px; width: 25%; } 
            #s-c { inset: 60px 0 80px 0; }
        }

        #pi { transition: opacity 0.3s; opacity: 0; pointer-events: none; }
        #pi.v { opacity: 0.7; }

        /* End Controls */
        #end-controls { position: absolute; bottom: 15%; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; opacity: 0; pointer-events: none; transition: 0.5s; z-index: 300; }
        #end-controls.v { opacity: 1; pointer-events: auto; }
        .eb { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 11px; text-transform: uppercase; }
        .eb:hover { background: white; color: black; }

        /* Back Cover Styles */
        .bc-c { background: linear-gradient(135deg, #ffcfd2 0%, #d1d1f9 50%, #c1e1c1 100%); border: 1px solid rgba(0,0,0,0.05); color: #1a1a1a; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .bc-t { font-size: 32px; font-weight: 900; margin: 0; color: #111; letter-spacing: -1px; text-transform: uppercase; line-height: 1; }
        .bc-st { font-size: 11px; margin-top: 10px; opacity: 0.5; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; line-height: 1.4; }
        .bc-btns { display: flex; gap: 12px; margin-top: 40px; justify-content: center; width: 100%; position: absolute; bottom: 40px; }
        .eb-btn { padding: 12px 24px; border-radius: 30px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .eb-btn.p { background: #1a1a1a; color: white; }
        .eb-btn.p:hover { background: ${accent}; transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .eb-btn.s { background: white; color: #1a1a1a; border: 1px solid rgba(0,0,0,0.1); }
        .eb-btn.s:hover { background: #f8f9fa; transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        
        .eb-f { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); color: white; padding: 10px 24px; border-radius: 30px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.2); z-index: 100; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: 0.3s; }
        .c-b:hover .eb-f { background: ${accent}; border-color: transparent; }
        
        /* Search Modal Styles */
        #search-m { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 2500; display: none; align-items: center; justify-content: center; }
        #search-m.o { display: flex; }
        .search-modal-c { background: #1c1c1c; width: 90%; max-width: 500px; max-height: 85vh; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); color: #eee; display: flex; flex-direction: column; overflow: hidden; }
        #s-q { width: 100%; padding: 16px; background: transparent; border-bottom: 1px solid rgba(255,255,255,0.1); outline: none; }
    `;

    const extraHtml = `
        <div id="s-c">
            <div id="c-b" class="c-b" onclick="window.openBook()">
                <div class="c-v" id="c-v-inner">
                    ${coverUrl ? '<img src="' + coverUrl + '" style="width:100%;height:100%;object-fit:contain;background:transparent;">' : '<div class="flex flex-col gap-2"><span>' + safeTitle + '</span><span class="text-[9px] opacity-40">READ NOW</span></div>'}
                    <div class="eb-f"><i class="fas fa-book-open"></i> Flip Open</div>
                </div>
            </div>
            <div id="back-c" class="c-b" style="display: none;" onclick="window.openFromBack()">
                <div class="c-v bc-c">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <h2 class="bc-t">THE END</h2>
                        <p class="bc-st">Thank you for reading</p>
                    </div>
                    <div class="bc-btns" onclick="event.stopPropagation()">
                        <button class="eb-btn p" onclick="window.openFromBack()">Flip Open</button>
                        <button class="eb-btn s" onclick="window.restartBook()">Start Over</button>
                    </div>
                </div>
            </div>
            <div id="end-controls"></div>
            <div id="b-t">
                <div id="b-v"></div>
                <div id="spine"></div>
            </div>
        </div>

        <div id="nav-l" onclick="window.prev()"></div>
        <div id="nav-r" onclick="window.next()"></div>

        <div id="hl-menu">
             <div class="hl-btn" style="background:#ffeb3b" onclick="window.addHighlight('yellow')"></div>
             <div class="hl-btn" style="background:#a5d6a7" onclick="window.addHighlight('green')"></div>
             <div class="hl-btn" style="background:#90caf9" onclick="window.addHighlight('blue')"></div>
             <div class="hl-btn" style="background:#f48fb1" onclick="window.addHighlight('pink')"></div>
             <div class="hl-btn" style="background:#ce93d8" onclick="window.addHighlight('purple')"></div>
        </div>

        <div id="search-m" onclick="window.toggleSearch()">
            <div class="search-modal-c" onclick="event.stopPropagation()">
                <input type="text" id="s-q" placeholder="Search in book..." onkeyup="if(event.key==='Enter')window.doSearch()">
                <div id="s-r" class="p-2 overflow-y-auto flex-1 max-h-[400px]"></div>
            </div>
        </div>
    `;

    const footerHtml = `
        <button id="prev-btn" class="nav-button" onclick="window.prev()"><i class="fas fa-chevron-left"></i></button>
        <div id="pi" class="page-info">Page -- / --</div>
        <button id="next-btn" class="nav-button" onclick="window.next()"><i class="fas fa-chevron-right"></i></button>
    `;

    const settingsHtml = `
        <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
            <div class="set-label" style="margin-bottom:10px; color:#888;">Typography</div>
            <div class="set-opt-row">
                <span class="set-label">Font Family</span>
                <select onchange="window.setFF(this.value)" style="width: 140px;">
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Lora', serif">Lora</option>
                    <option value="'EB Garamond', serif">Garamond</option>
                    <option value="'Inter', sans-serif">Inter</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="Monaco, monospace">Monaco</option>
                </select>
            </div>
            <div class="set-opt-row">
                <span class="set-label">Font Size</span>
                <div style="display:flex; gap:5px; align-items:center;">
                    <button class="header-icon" style="width:24px; height:24px;" onclick="window.changeFontSize(-10)">-</button>
                    <span id="fs-v" style="font-size:11px; min-width:30px; text-align:center;">100%</span>
                    <button class="header-icon" style="width:24px; height:24px;" onclick="window.changeFontSize(10)">+</button>
                </div>
            </div>
            <div class="set-opt-row">
                <span class="set-label">Line Height</span>
                <input type="range" min="1" max="2.5" step="0.1" value="1.6" oninput="window.setLH(this.value)" style="width:80px;">
            </div>
        </div>

        <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
            <div class="set-opt-row">
                <span class="set-label">Night Shift</span>
                <button id="ns-toggle" onclick="window.toggleNight()" class="header-icon" style="width:auto; padding:0 10px; border-radius:12px; font-size:10px; background:#444;">OFF</button>
            </div>
            <div class="set-opt-row">
                <span class="set-label">Ambient Sound</span>
                <select id="amb-s" onchange="window.playAmbient(this.value)" style="width: 120px;">
                    <option value="none">None</option>
                    <option value="rain">Rain</option>
                    <option value="fire">Fire</option>
                    <option value="library">Library</option>
                </select>
            </div>
            <div class="set-opt-row">
                <button onclick="window.toggleSearch()" style="width:100%; padding:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; font-size:11px; color:white; cursor:pointer;">
                    <i class="fas fa-search" style="margin-right:5px;"></i> Search Book
                </button>
            </div>
        </div>
    `;

    const extraScripts = `
        const FU='${fileUrl}';
        let book=null, rend=null, isAnimating=false;
        let z=100, fz=100, lh=1.6, ff='Georgia, serif';
        let highlights = [];
        try{ highlights = JSON.parse(localStorage.getItem('fr_hi_'+FU)) || []; }catch(e){}
        let syn = window.speechSynthesis, utter, speaking=false, ttsPaused=false;
        let startingIndex = 0;
        let amb = null;
        let useFullHeight = false;

        function injectFitToggle() {
            const headerIcons = document.getElementById('header-icons');
            if(!headerIcons) return;
            const btn = document.createElement('button');
            btn.className = 'header-icon';
            btn.id = 'fit-toggle-btn';
            btn.title = 'Toggle Fit Mode';
            btn.innerHTML = '<i class="fas fa-expand"></i>';
            
            const shareBtn = document.getElementById('share-twitter-btn');
            if(shareBtn && headerIcons.contains(shareBtn)) {
                headerIcons.insertBefore(btn, shareBtn);
            } else {
                headerIcons.appendChild(btn);
            }
            
            btn.onclick = () => {
                useFullHeight = !useFullHeight;
                document.body.classList.toggle('full-mode', useFullHeight);
                const icon = btn.querySelector('i');
                if (useFullHeight) {
                    icon.classList.remove('fa-expand');
                    icon.classList.add('fa-compress');
                } else {
                    icon.classList.remove('fa-compress');
                    icon.classList.add('fa-expand');
                }
                if(rend) rend.resize();
            };
        }

        // Custom Sidebar Setup
        function setupEpubSidebar() {
            const sidebar = document.getElementById('chat-w');
            if(!sidebar) return;
            
            sidebar.innerHTML = \`
                <div class="chat-h">
                    <span style="font-size:10px; text-transform:uppercase; letter-spacing:1px;">Personal Desk</span>
                    <button class="close-chat-btn" id="close-notes-btn">✕</button>
                </div>
                <div class="chat-tabs">
                    <div class="chat-tab active" data-tab="chat-notes" onclick="window.switchSidebarTab(this)">Notes</div>
                    <div class="chat-tab" data-tab="chat-highlights" onclick="window.switchSidebarTab(this)">Highlights</div>
                </div>
                <div class="chat-b">
                    <div id="chat-notes" class="chat-tab-c active"></div>
                    <div id="chat-highlights" class="chat-tab-c">
                        <div id="hi-l" class="flex flex-col"></div>
                    </div>
                </div>
                <div class="chat-f" id="chat-footer">
                    <textarea id="note-input" placeholder="Add a multi-line note..." class="chat-i"></textarea>
                    <button id="send-note-btn" class="chat-s"><i class="fas fa-paper-plane"></i></button>
                </div>
            \`;

            document.getElementById('close-notes-btn').onclick = () => sidebar.classList.remove('open');
            document.getElementById('send-note-btn').onclick = () => window.sendNote();
            document.getElementById('note-input').onkeydown = (e) => {
                if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendNote(); }
            };
        }

        async function init(){
            try {
                const response = await fetch(FU);
                const arrayBuffer = await response.arrayBuffer();
                book = ePub(arrayBuffer);
                rend = book.renderTo("b-v", { width: "100%", height: "100%", spread: "always" });
                await rend.display();

                book.ready.then(() => {
                    document.getElementById('loading').style.display='none';
                    
                    // Generate Spine
                    const si = book.spine.spineItems;
                    const sc = document.getElementById('spine');
                    if(sc) {
                        si.forEach((it, i) => {
                            const l = (i/si.length)*100;
                            const d = document.createElement('div');
                            d.style.cssText = \`position:absolute;top:\${l}%;left:0;right:0;height:1px;background:rgba(0,0,0,0.1);pointer-events:none;\`;
                            sc.appendChild(d);
                        });
                    }

                    // Table of Contents
                    const toc = book.navigation.toc;
                    const tl = document.getElementById('index-list');
                    if(tl) {
                        function parseToc(items, level=0){
                            items.forEach(i => {
                                const d = document.createElement('div');
                                d.className = 'index-item';
                                d.style.paddingLeft = (15 + level*15) + 'px';
                                d.innerHTML = '<span>'+i.label+'</span>';
                                d.onclick = () => { rend.display(i.href); document.getElementById('index-modal').style.display='none'; };
                                tl.appendChild(d);
                                if(i.subitems && i.subitems.length) parseToc(i.subitems, level+1);
                            });
                        }
                        parseToc(toc);
                    }
                    
                    book.locations.generate(1000).then(() => {
                        updateFooter();
                    }); 
                    
                    // Restore Highlights
                    highlights.forEach(h => {
                        try { rend.annotations.add("highlight", h.cfi, {}, null, 'hl-' + (h.c || 'yellow')); } catch(e){}
                    });
                    renderHighlights();
                });

                rend.on("relocated", (l) => {
                    window.lastLoc = l;
                    updateFooter(l);
                    if(l.atEnd) document.getElementById('end-controls').classList.add('v');
                    else document.getElementById('end-controls').classList.remove('v');
                });

                rend.on("selected", (cfiRange, contents) => {
                    book.getRange(cfiRange).then(range => {
                        const sel = contents.window.getSelection();
                        if(!sel.rangeCount) return;
                        const rect = sel.getRangeAt(0).getBoundingClientRect();
                        const menu = document.getElementById('hl-menu');
                        const iframe = document.querySelector('#b-v iframe');
                        const iframeRect = iframe.getBoundingClientRect();
                        menu.style.top = (iframeRect.top + rect.top - 50) + 'px';
                        menu.style.left = (iframeRect.left + rect.left + rect.width/2) + 'px';
                        menu.style.display = 'flex';
                        window.currentSelection = { cfiRange, text: range.toString(), contents };
                    });
                });

                rend.hooks.content.register(contents => {
                    contents.document.body.onclick = () => {
                        if(contents.window.getSelection().toString().length > 0) return;
                        document.getElementById('hl-menu').style.display = 'none';
                    };
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
                    applyStyles();
                });
            } catch(e) { console.error(e); }
        }

        function updateFooter(l) {
            const prevBtns = [document.getElementById('prev-btn'), document.getElementById('mobile-prev-btn')];
            const nextBtns = [document.getElementById('next-btn'), document.getElementById('mobile-next-btn')];
            const cb = document.getElementById('c-b');
            const bc = document.getElementById('back-c');
            const isFrontCover = cb && cb.style.display !== 'none';
            const isBackCover = bc && bc.style.display !== 'none';

            prevBtns.forEach(b => b && (b.disabled = isFrontCover));
            nextBtns.forEach(b => b && (b.disabled = isBackCover));

            if(!rend) return;
            if(!l) l = rend.currentLocation();
            if(!l || !l.start || !l.start.displayed) return;
            const info = document.getElementById('pi');
            if(!info) return;
            const curr = l.start.displayed.page;
            const total = l.start.displayed.total;
            if (total <= 0) { info.textContent = "Loc " + l.start.location; return; }
            let text = "Page " + curr;
            if (window.innerWidth > 768 && curr > 1 && curr < total) {
                const startPage = curr % 2 === 0 ? curr : curr - 1;
                text = "Pages " + startPage + "-" + Math.min(startPage + 1, total);
            }
            info.textContent = text + " / " + total;
            info.classList.add('v');
        }

        window.openBook = () => {
            const cb = document.getElementById('c-b');
            const bt = document.getElementById('b-t');
            cb.classList.add('a-f-o');
            setTimeout(() => {
                cb.style.display = 'none';
                bt.classList.add('open');
                document.getElementById('pi').classList.add('v');
                if(rend.currentLocation().start.index === 0) rend.next();
            }, 800);
        };

        window.prev = () => flip('p');
        window.next = () => flip('n');
        async function flip(d) {
            if(!rend || isAnimating) return;
            const loc = rend.currentLocation();
            if(d === 'p' && loc.atStart) { closeToFront(); return; }
            if(d === 'n' && loc.atEnd) { closeToBack(); return; }
            isAnimating = true;
            const bv = document.getElementById('b-v');
            const mobile = window.innerWidth <= 768;
            if(mobile) {
                bv.style.transform = d === 'n' ? 'translateX(-100%)' : 'translateX(100%)';
                bv.style.opacity = '0.7';
            } else {
                bv.style.transform = d === 'n' ? 'rotateY(90deg)' : 'rotateY(-90deg)';
            }
            await (d === 'n' ? rend.next() : rend.prev());
            setTimeout(() => {
                bv.style.transition = 'none';
                bv.style.transform = mobile ? (d === 'n' ? 'translateX(100%)' : 'translateX(-100%)') : (d === 'n' ? 'rotateY(-90deg)' : 'rotateY(90deg)');
                void bv.offsetWidth;
                bv.style.transition = 'all 0.2s ease-out';
                bv.style.transform = 'none';
                bv.style.opacity = '1';
                isAnimating = false;
            }, 200);
        }

        function closeToFront() {
            const cb = document.getElementById('c-b');
            const bt = document.getElementById('b-t');
            document.getElementById('pi').classList.remove('v');
            cb.style.display = 'block';
            bt.classList.remove('open');
            cb.classList.remove('a-f-o');
            cb.classList.add('a-f-c');
            setTimeout(() => cb.classList.remove('a-f-c'), 1200);
        }

        function closeToBack() {
             const b = document.getElementById('back-c');
             const bt = document.getElementById('b-t');
             document.getElementById('pi').classList.remove('v');
             bt.classList.remove('open');
             b.style.display = 'block';
             b.classList.add('a-b-a');
        }

        window.openFromBack = () => {
            const b = document.getElementById('back-c');
            const bt = document.getElementById('b-t');
            b.classList.add('a-b-h');
            setTimeout(() => {
                b.style.display = 'none';
                b.classList.remove('a-b-a', 'a-b-h');
                bt.classList.add('open');
                document.getElementById('pi').classList.add('v');
            }, 1200);
        };

        window.restartBook = () => {
            rend.display(0);
            document.getElementById('back-c').style.display = 'none';
            document.getElementById('b-t').classList.remove('open');
            document.getElementById('c-b').style.display = 'block';
            document.getElementById('c-b').classList.remove('a-f-o');
        };

        window.addHighlight = (color) => {
            const sel = window.currentSelection;
            if(!sel) return;
            document.getElementById('hl-menu').style.display='none';
            rend.annotations.add("highlight", sel.cfiRange, {}, null, 'hl-' + color);
            sel.contents.window.getSelection().removeAllRanges();
            highlights.push({t: sel.text, cfi: sel.cfiRange, d: new Date().toLocaleDateString(), c: color});
            localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
            renderHighlights();
        };

        window.deleteHighlight = (i) => {
            if(!confirm('Delete highlight?')) return;
            rend.annotations.remove(highlights[i].cfi, "highlight");
            highlights.splice(i, 1);
            localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
            renderHighlights();
        };

        function renderHighlights() {
            const container = document.getElementById('hi-l');
            if(!container) return;
            container.innerHTML = highlights.map((h, i) => \`
                <div class="search-item" onclick="rend.display('\${h.cfi}')">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="width:8px; height:8px; border-radius:50%; background:var(--hl-\${h.c||'yellow'})"></div>
                        <button class="del-btn" onclick="event.stopPropagation();window.deleteHighlight(\${i})"><i class="fas fa-trash"></i></button>
                    </div>
                    <p class="text-xs opacity-80 italic mt-1">"\${h.t}"</p>
                    <p class="text-[9px] opacity-40">\${h.d}</p>
                </div>
            \`).join('');
        }

        window.switchSidebarTab = (el) => {
            const tabId = el.getAttribute('data-tab');
            document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.chat-tab-c').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            document.getElementById('chat-footer').style.display = tabId === 'chat-highlights' ? 'none' : 'flex';
        };

        let editingNoteIndex = -1;
        window.sendNote = () => {
            const i = document.getElementById('note-input'), v = i.value.trim();
            if(!v) return;
            let notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
            if(editingNoteIndex > -1) {
                notes[editingNoteIndex].text = v;
                editingNoteIndex = -1;
                document.getElementById('send-note-btn').innerHTML = '<i class="fas fa-paper-plane"></i>';
            } else {
                notes.push({text: v, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})});
            }
            localStorage.setItem('fr_nt_'+FU, JSON.stringify(notes));
            i.value = '';
            window.renderNotes();
        };

        window.renderNotes = () => {
            const b = document.getElementById('chat-notes');
            if(!b) return;
            const notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
            b.innerHTML = notes.map((n, i) => \`
                <div class="search-item group">
                    <div style="display:flex; justify-content:space-between;">
                        <span class="text-[9px] opacity-30">\${n.time}</span>
                        <div class="flex gap-2">
                            <button class="edit-btn" onclick="window.editNote(\${i})"><i class="fas fa-edit"></i></button>
                            <button class="del-btn" onclick="window.deleteNote(\${i})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <p class="text-xs mt-1 whitespace-pre-wrap">\${n.text}</p>
                </div>
            \`);
            b.scrollTop = b.scrollHeight;
        };

        window.editNote = (i) => {
            const notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
            document.getElementById('note-input').value = notes[i].text;
            editingNoteIndex = i;
            document.getElementById('send-note-btn').innerHTML = '<i class="fas fa-check"></i>';
        };

        window.deleteNote = (i) => {
            if(!confirm('Delete note?')) return;
            let notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
            notes.splice(i, 1);
            localStorage.setItem('fr_nt_'+FU, JSON.stringify(notes));
            window.renderNotes();
        };

        window.toggleSearch = () => document.getElementById('search-m').classList.toggle('o');
        window.doSearch = async () => {
            const q = document.getElementById('s-q').value, res = document.getElementById('s-r');
            if(!q) return;
            res.innerHTML = '<p class="text-xs text-center p-4">Searching...</p>';
            const results = await Promise.all(book.spine.spineItems.map(item => item.load(book.load.bind(book)).then(doc => {
                const text = doc.body.innerText;
                const matches = [];
                const regex = new RegExp(q.replace(/[.*+?^\\\${}()|[\\\]\\\\]/g, '\\\\$&'), 'gi');
                let m;
                while((m = regex.exec(text)) !== null) {
                    matches.push({ cfi: item.cfiFromElement(doc.body), excerpt: text.substring(Math.max(0, m.index-40), Math.min(text.length, m.index+60)) });
                    if(matches.length > 5) break;
                }
                item.unload();
                return matches;
            })));
            const flat = results.flat();
            res.innerHTML = flat.length ? flat.map(r => \`
                <div class="search-item" onclick="rend.display('\${r.cfi}'); window.toggleSearch();">
                    <p class="text-xs opacity-80">...\${r.excerpt.replace(new RegExp(q,'gi'), '<span class="search-match">$&</span>')}...</p>
                </div>
            \`).join('') : '<p class="text-xs text-center p-4">No results.</p>';
        };

        window.toggleTTS = () => { if(speaking || ttsPaused) stopTTS(); else startTTS(); };
        window.togglePlayPauseTTS = () => { if(syn.paused) { syn.resume(); ttsPaused=false; speaking=true; } else { syn.pause(); ttsPaused=true; speaking=false; } updateTTSUI(); };
        window.stopTTS = () => { syn.cancel(); speaking=false; ttsPaused=false; document.getElementById('tts-ctrls').classList.add('hidden'); updateTTSUI(); };
        function startTTS() {
            const contents = rend.getContents();
            if(!contents || !contents[0]) return;
            const text = contents[0].document.body.innerText;
            utter = new SpeechSynthesisUtterance(text);
            utter.onend = stopTTS;
            utter.onstart = () => { speaking=true; ttsPaused=false; updateTTSUI(); };
            syn.cancel();
            setTimeout(() => syn.speak(utter), 100);
            document.getElementById('tts-ctrls').classList.remove('hidden');
        }
        function updateTTSUI() {
            const pp = document.getElementById('tts-pp-i');
            if(pp) pp.className = ttsPaused ? 'fas fa-play' : 'fas fa-pause';
            const btn = document.getElementById('tts-btn');
            if(btn) {
                btn.classList.toggle('tts-playing', speaking);
                btn.classList.toggle('tts-paused', ttsPaused);
            }
        }

        window.playAmbient = (type) => {
            if(amb) amb.pause();
            if(type === 'none') return;
            const urls = { rain: 'https://cdn.pixabay.com/audio/2022/03/10/audio_51307b0f69.mp3', fire: 'https://cdn.pixabay.com/audio/2021/08/09/audio_65b750170a.mp3', library: 'https://cdn.pixabay.com/audio/2023/10/24/audio_985b8c9d0d.mp3' };
            amb = new Audio(urls[type]);
            amb.loop = true;
            amb.play();
        };

        window.toggleNight = () => {
            const active = document.body.classList.toggle('night-shift');
            const btn = document.getElementById('ns-toggle');
            btn.innerText = active ? 'ON' : 'OFF';
            btn.style.background = active ? '#4CAF50' : '#444';
        };

        window.setFF = (v) => { ff=v; applyStyles(); };
        window.setLH = (v) => { lh=v; applyStyles(); };
        window.changeFontSize = (v) => { fz=Math.max(50, Math.min(200, fz+v)); applyStyles(); };
        function applyStyles() {
            if(rend) {
                rend.getContents().forEach(c => {
                    c.addStylesheetRules({ "body": { "font-family": ff + " !important", "font-size": fz + "% !important", "line-height": lh + " !important" } });
                });
            }
            document.getElementById('fs-v').textContent = fz + "%";
        }

        // Bridge listeners for viewerBase buttons
        document.addEventListener('DOMContentLoaded', () => {
            setupEpubSidebar();
            injectFitToggle();
            
            const idxModal = document.getElementById('index-modal');
            const idxBtn = document.getElementById('index-btn');
            if(idxBtn) idxBtn.onclick = () => idxModal.style.display = 'flex';
            const idxClose = document.getElementById('index-close-btn');
            if(idxClose) idxClose.onclick = () => idxModal.style.display = 'none';
            idxModal.onclick = (e) => { if(e.target === idxModal) idxModal.style.display = 'none'; };

            const sModal = document.getElementById('settings-modal');
            const setBtn = document.getElementById('bg-settings-btn');
            if(setBtn) setBtn.onclick = () => sModal.classList.add('open');
            const setBtnMob = document.getElementById('bg-settings-btn-mob');
            if(setBtnMob) setBtnMob.onclick = () => sModal.classList.add('open');
            const setClose = document.getElementById('settings-close-btn');
            if(setClose) setClose.onclick = () => sModal.classList.remove('open');
            sModal.onclick = (e) => { if(e.target === sModal) sModal.classList.remove('open'); };

            window.setBg = (c) => {
                 document.body.style.background = c;
                 localStorage.setItem('fr_bg', c);
                 document.querySelectorAll('.bg-option').forEach(opt => {
                    if(opt.getAttribute('data-bg') === c) opt.classList.add('active');
                    else opt.classList.remove('active');
                 });
            };
            document.querySelectorAll('.bg-option').forEach(opt => {
                opt.onclick = () => window.setBg(opt.getAttribute('data-bg'));
            });

            const texBtn = document.getElementById('tex-toggle');
            if(texBtn) {
                texBtn.onclick = () => {
                    const active = document.body.classList.toggle('textured');
                    texBtn.innerText = active ? 'ON' : 'OFF';
                    texBtn.style.background = active ? '#4CAF50' : '#444';
                    localStorage.setItem('fr_tex', active);
                };
            }

            const nBtn = document.getElementById('notes-btn');
            if(nBtn) nBtn.onclick = () => { document.getElementById('chat-w').classList.toggle('open'); window.renderNotes(); };
            const nBtnMob = document.getElementById('notes-btn-mob');
            if(nBtnMob) nBtnMob.onclick = () => { document.getElementById('chat-w').classList.toggle('open'); window.renderNotes(); };

            // Initialize from localstorage
            const sb = localStorage.getItem('fr_bg');
            if(sb) window.setBg(sb);
            const st = localStorage.getItem('fr_tex');
            if(st === 'true') {
                 document.body.classList.add('textured');
                 if(texBtn) { texBtn.innerText = 'ON'; texBtn.style.background = '#4CAF50'; }
            }

            init();
        });
    `;

    return getViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        extraStyles,
        extraHtml,
        footerHtml,
        extraScripts,
        settingsHtml,
        dependencies: [
            'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js',
            'https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js'
        ],
        showZoom: false,
        showWebViewLink: true,
        showTTS: true
    });
}
