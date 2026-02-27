
import { getViewerBase } from './viewerBase';
import { COMMON_READER_SCRIPTS, escapeHtml } from './viewerUtils';

export function epubViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'ShoPublish'): string {
    const bg = (settings.background as string) || '#ffffff';
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);
  
    const extraStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&family=EB+Garamond:wght@400;700&family=Inter:wght@400;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Playfair+Display:wght@400;700&display=swap');

        :root {
            --reader-bg: ${bg};
            --reader-accent: ${accent};
            --reader-text: #1a1a1a;
        }

        /* Stage and Book Stage */
        #s-c { 
            position: absolute; 
            inset: 60px 0 80px 0; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            perspective: 3500px; 
            overflow: hidden; 
            transition: opacity 0.5s ease; 
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
            background: var(--reader-bg); 
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

        /* Modern Settings Styles */
        .set-section { margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); }
        .set-label-group { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #888; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .set-label-group i { font-size: 12px; opacity: 0.6; }

        .modern-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px 12px; border-radius: 10px; font-size: 12px; outline: none; width: 140px; cursor: pointer; transition: all 0.2s ease; }
        .modern-select:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }

        .modern-stepper { display: flex; align-items: center; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 4px; border: 1px solid rgba(255,255,255,0.1); }
        .modern-stepper button { width: 28px; height: 28px; border-radius: 8px; border: none; background: transparent; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .modern-stepper button:hover { background: rgba(255,255,255,0.1); }
        .modern-stepper span { font-size: 11px; font-weight: 700; min-width: 45px; text-align: center; }

        .modern-toggle { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 6px 16px; border-radius: 20px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.3s; width: auto; line-height: 1; }
        
        .modern-range { flex: 1; max-width: 120px; display: flex; align-items: center; }
        .modern-range input { -webkit-appearance: none; width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none; }
        .modern-range input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: white; border-radius: 50%; cursor: pointer; box-shadow: 0 0 10px rgba(0,0,0,0.5); border: 2px solid ${accent}; }
        
        /* Mobile Page Indicator */
        #mobile-pi {
            position: absolute;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.5);
            color: white;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.3s, bottom 0.3s;
            pointer-events: none;
            backdrop-filter: blur(4px);
        }
        #mobile-pi.v { opacity: 0.7; }
        body.full-mode #mobile-pi {
            bottom: 12px;
        }
    `;

    const extraHtml = `
        <div id="s-c">
            <div id="mobile-pi">Page -- / --</div>
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
        <div class="set-section">
            <div class="set-label-group">
                <i class="fas fa-font"></i>
                <span>Typography</span>
            </div>
            
            <div class="set-opt-row">
                <span class="set-label">Font Family</span>
                <select class="modern-select" onchange="window.setFF(this.value)">
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
                <div class="modern-stepper">
                    <button onclick="window.changeFontSize(-10)"><i class="fas fa-minus"></i></button>
                    <span id="fs-v">100%</span>
                    <button onclick="window.changeFontSize(10)"><i class="fas fa-plus"></i></button>
                </div>
            </div>

            <div class="set-opt-row">
                <span class="set-label">Line Height</span>
                <div class="modern-range">
                    <input type="range" min="1" max="2.5" step="0.1" value="1.6" oninput="window.setLH(this.value)">
                </div>
            </div>
        </div>

        <div class="set-section">
            <div class="set-label-group">
                <i class="fas fa-sliders-h"></i>
                <span>Experience</span>
            </div>

            <div class="set-opt-row">
                <span class="set-label">Night Shift</span>
                <button id="ns-toggle" onclick="window.toggleNight()" class="modern-toggle">OFF</button>
            </div>

            <div class="set-opt-row">
                <span class="set-label">Ambient Sound</span>
                <select id="amb-s" class="modern-select" onchange="window.playAmbient(this.value)">
                    <option value="none">None</option>
                    <option value="rain">Rain</option>
                    <option value="fire">Fire</option>
                    <option value="library">Library</option>
                </select>
            </div>
        </div>
    `;

    const extraScripts = `
        function escapeHtml(unsafe) { return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
        const FU='${fileUrl}'.split('?')[0];

        ${COMMON_READER_SCRIPTS}

        let book=null, rend=null, isAnimating=false;
        let z=100, fz=parseInt(window.getReaderSetting('fs', '100')), lh=parseFloat(window.getReaderSetting('lh', '1.6')), ff=window.getReaderSetting('ff', 'Georgia, serif');
        let highlights = [];
        try{ highlights = JSON.parse(localStorage.getItem('fr_hi_'+FU)) || []; }catch(e){}
        let syn = window.speechSynthesis, utter, speaking=false, ttsPaused=false;
        let startingIndex = 0;
        let useFullHeight = false;

        document.addEventListener('DOMContentLoaded', () => {
            const fb = document.getElementById('full-mode-btn');
            if(fb) {
                fb.addEventListener('click', () => {
                   if(rend) {
                        rend.resize();
                        setTimeout(() => rend.resize(), 100);
                   }
                });
            }
        });

        // Personal Desk handled by viewerBase

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
                                d.onclick = () => { 
                                    rend.display(i.href); 
                                    setTimeout(() => {
                                        const modal = document.getElementById('index-modal');
                                        if(modal) modal.classList.remove('open');
                                    }, 100);
                                };
                                tl.appendChild(d);
                                if(i.subitems && i.subitems.length) parseToc(i.subitems, level+1);
                            });
                        }
                        parseToc(toc);
                    }
                    
                    const savedLocs = localStorage.getItem('fr_locs_' + FU);
                    if (savedLocs) {
                        try {
                            book.locations.load(savedLocs);
                            updateFooter();
                        } catch(e) {
                            console.error("Error loading locations", e);
                            generateLocs();
                        }
                    } else {
                        generateLocs();
                    }

                    function generateLocs() {
                        book.locations.generate(1600).then(() => {
                            localStorage.setItem('fr_locs_' + FU, book.locations.save());
                            updateFooter();
                            const mobilePi = document.getElementById('mobile-pi');
                            if (mobilePi && rend.currentLocation()) {
                                const l = rend.currentLocation();
                                if (l.start.displayed.total > 0) {
                                    mobilePi.textContent = "Page " + l.start.displayed.page + " / " + l.start.displayed.total;
                                    mobilePi.classList.add('v');
                                }
                            }
                        }); 
                    }
                    
                    // Restore Highlights
                    highlights.forEach(h => {
                        try { rend.annotations.add("highlight", h.cfi, {}, null, 'hl-' + (h.c || 'yellow')); } catch(e){}
                    });
                    renderHighlights();
                });

                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        if(rend) {
                            rend.resize();
                            updateFooter();
                        }
                    }, 250);
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
                const startPage = curr % 2 !== 0 ? curr : curr - 1;
                text = "Pages " + startPage + "-" + Math.min(startPage + 1, total);
            }
            info.textContent = text + " / " + total;
            info.classList.add('v');
            
            // Mobile single-page indicator
            const mobilePi = document.getElementById('mobile-pi');
            if (mobilePi) {
                const isMobile = window.innerWidth <= 768;
                if (isMobile && !isFrontCover && !isBackCover && total > 0) {
                    mobilePi.textContent = "Page " + curr + " / " + total;
                    mobilePi.classList.add('v');
                } else {
                    mobilePi.classList.remove('v');
                }
            }
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
                // Update mobile indicator after opening book
                setTimeout(() => updateFooter(), 900);
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

        // Personal Desk Logic (Restored for EPUB interaction)
        window.deleteHighlight = (i) => {
            if(!confirm('Delete highlight?')) return;
            rend.annotations.remove(highlights[i].cfi, "highlight");
            highlights.splice(i, 1);
            localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
            window.renderHighlights();
        };

        window.renderHighlights = () => {
            const container = document.getElementById('hi-list');
            if(!container) return;
            container.innerHTML = highlights.map((h, i) => \`
                <div class="chat-item cursor-pointer hover:bg-gray-50 transition-colors" onclick="rend.display('\${h.cfi}')">
                    <div class="flex justify-between items-center mb-1">
                        <div class="w-3 h-3 rounded-full bg-[var(--hl-\${h.c||'yellow'})]" style="background:var(--hl-\${h.c||'yellow'})"></div>
                        <button class="chat-del text-xs" onclick="event.stopPropagation();window.deleteHighlight(\${i})"><i class="fas fa-trash"></i></button>
                    </div>
                    <p class="text-xs opacity-80 italic italic leading-relaxed">"\${h.t}"</p>
                    <p class="text-[9px] opacity-40 mt-1 uppercase tracking-tighter">${escapeHtml(safeTitle.substring(0,20))} • ${new Date().toLocaleDateString()}</p>
                </div>
            \`).join('');
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

        window.toggleNight = () => {
            const active = document.body.classList.toggle('night-shift');
            const btn = document.getElementById('ns-toggle');
            btn.innerText = active ? 'ON' : 'OFF';
            btn.style.background = active ? '#4CAF50' : '#444';
            window.setReaderSetting('ns', active);
        };

        window.setFF = (v) => { ff=v; window.setReaderSetting('ff', v); applyStyles(); };
        window.setLH = (v) => { lh=v; window.setReaderSetting('lh', v); applyStyles(); };
        window.changeFontSize = (v) => { 
            fz = Math.max(50, Math.min(200, fz+v)); 
            window.setReaderSetting('fs', fz);
            applyStyles(); 
        };
        function applyStyles() {
            if(rend) {
                rend.getContents().forEach(c => {
                    c.addStylesheetRules({ "body": { "font-family": ff + " !important", "font-size": fz + "% !important", "line-height": lh + " !important" } });
                });
            }
            document.getElementById('fs-v').textContent = fz + "%";
        }

        // Initialize from reader settings
        const sb = window.getReaderSetting('bg');
        if(sb) window.setBg(sb);
        
        const st = window.getReaderSetting('tex');
        if(st === 'true') {
             document.body.classList.add('textured');
             const texBtn = document.getElementById('tex-toggle');
             if(texBtn) { texBtn.innerText = 'ON'; texBtn.style.background = '#4CAF50'; }
        }
        
        const sn = window.getReaderSetting('ns');
        if(sn === 'true') {
            document.body.classList.add('night-shift');
            const nsToggle = document.getElementById('ns-toggle');
            if(nsToggle) { nsToggle.innerText = 'ON'; nsToggle.style.background = '#4CAF50'; }
        }

        document.addEventListener('DOMContentLoaded', () => {
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
            'https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js',
            'https://cdn.tailwindcss.com'
        ],
        showZoom: false,
        showWebViewLink: true,
        showTTS: true,
        showFullMode: true,
        showNightShift: true
    });
}
