
import { getWebViewerBase } from './webViewerBase';

export function epubWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    const accent = (settings.accent_color as string) || '#4f46e5';

    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: true,
        dependencies: [
            'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js',
            'https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js'
        ],
        extraStyles: `
            /* Hide desktop footer if any */
            @media (min-width: 769px) { #main-footer { display: none !important; } }

            #content-wrapper { width: 100%; max-width: 850px; margin: 0 auto; min-height: 100vh; position: relative; transition: filter 0.3s ease; }
            #content-wrapper iframe { width: 100% !important; border: none !important; margin: 0 !important; padding: 0 !important; }
            .epub-container { height: auto !important; width: 100% !important; overflow: visible !important; }

            /* Modern Settings Styles */
            .set-section { margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.06); }
            .set-label-group { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; color: #888; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; }
            .set-label-group i { font-size: 14px; opacity: 0.5; }

            .set-opt-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; min-height: 44px; width: 100%; gap: 15px; }
            .set-label { font-size: 14px; font-weight: 500; color: #444; text-align: left; flex: 1; }

            .modern-select { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); color: #111; padding: 10px 36px 10px 16px; border-radius: 14px; font-size: 13px; font-weight: 600; outline: none; width: 190px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 14px; flex-shrink: 0; }
            .modern-select:hover { background-color: rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.15); }

            .modern-stepper { display: flex; align-items: center; background: rgba(0,0,0,0.04); border-radius: 16px; padding: 4px; border: 1px solid rgba(0,0,0,0.08); width: fit-content; flex-shrink: 0; }
            .modern-stepper button { width: 34px; height: 34px; border-radius: 12px; border: none; background: white; color: #111; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
            .modern-stepper button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
            .modern-stepper span { font-size: 13px; font-weight: 800; min-width: 55px; text-align: center; color: #111; }

            .modern-toggle { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); color: #333; padding: 10px 22px; border-radius: 25px; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); width: auto; line-height: 1; letter-spacing: 0.8px; flex-shrink: 0; }
            
            .modern-range { width: 150px; display: flex; align-items: center; flex-shrink: 0; }
            .modern-range input { -webkit-appearance: none; width: 100%; height: 6px; background: rgba(0,0,0,0.08); border-radius: 10px; outline: none; }
            .modern-range input::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; background: white; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.18); border: 3px solid ${accent}; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .modern-range input::-webkit-slider-thumb:hover { transform: scale(1.2); }

            .bg-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; padding: 12px 0; }
            .bg-option { aspect-ratio: 1; border-radius: 50%; cursor: pointer; border: 3px solid rgba(0,0,0,0.04); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 3px 8px rgba(0,0,0,0.04); position: relative; }
            .bg-option::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid transparent; transition: 0.3s; }
            .bg-option:hover { transform: scale(1.2); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
            .bg-option.active { border-color: white; transform: scale(1.15); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2), 0 8px 25px rgba(79, 70, 229, 0.15); }
            .bg-option.active::after { border-color: ${accent}; }

            body.night-shift #content-wrapper { filter: sepia(0.6) brightness(0.9) contrast(0.95); }
            
            #set-m-c { border-top-left-radius: 36px; border-bottom-left-radius: 36px; overflow: hidden; width: 360px; box-shadow: -20px 0 60px rgba(0,0,0,0.15); }
            @media (max-width: 640px) { #set-m-c { border-radius: 0; width: 100% !important; max-width: 100vw !important; } }

            .appearance-label { font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
            .appearance-label::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.04); }
        `,
        settingsHtml: `
            <div id="set-m" onclick="toggleSettings()">
                <div id="set-m-c" onclick="event.stopPropagation()">
                    <div class="set-m-h" style="padding: 28px 28px 20px 28px; border-bottom: 1px solid rgba(0,0,0,0.04);">
                        <div style="font-weight:900; text-transform:uppercase; letter-spacing:2px; font-size:14px; color:#111; display:flex; align-items:center; gap:10px;">
                            <i class="fas fa-sliders-h" style="font-size: 16px; color: ${accent};"></i>
                            Reader Settings
                        </div>
                        <button class="header-icon" onclick="toggleSettings()" style="width:40px; height:40px; color:#555; background:rgba(0,0,0,0.05); border:none; font-size: 14px; border-radius: 50%; transition: 0.3s;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="set-m-b" style="padding: 28px; overflow-y: overlay;">
                        <span class="appearance-label">Background Style</span>
                        <div class="bg-grid">
                            <div class="bg-option active" style="background: #ffffff;" data-bg="#ffffff" title="White"></div>
                            <div class="bg-option" style="background: #f8fafc;" data-bg="#f8fafc" title="Ice"></div>
                            <div class="bg-option" style="background: #fffbef;" data-bg="#fffbef" title="Cream"></div>
                            <div class="bg-option" style="background: #fdf6e3;" data-bg="#fdf6e3" title="Solarized"></div>
                            <div class="bg-option" style="background: #f2ede4;" data-bg="#f2ede4" title="Paper"></div>
                        </div>

                        <div class="set-section">
                            <div class="set-opt-row">
                                <span class="set-label" style="font-weight: 700; font-size: 14px;">Paper Texture</span>
                                <button id="tex-toggle" onclick="toggleTexture()" class="modern-toggle">OFF</button>
                            </div>
                        </div>

                        <div class="set-section">
                            <div class="set-label-group">
                                <i class="fas fa-font"></i>
                                <span>Typography</span>
                            </div>
                            
                            <div class="set-opt-row">
                                <span class="set-label">Font Family</span>
                                <select id="wff-s" class="modern-select" onchange="window.setFont(this.value)">
                                    <option value="'Inter', sans-serif">Modern Sans</option>
                                    <option value="'Lora', serif">Literary Serif</option>
                                    <option value="'EB Garamond', serif">Elegant Garamond</option>
                                    <option value="'Crimson Pro', serif">Journal Serif</option>
                                    <option value="'Merriweather', serif">Classic Serif</option>
                                    <option value="'Playfair Display', serif">Display Serif</option>
                                    <option value="'Open Sans', sans-serif">Clean Sans</option>
                                    <option value="'Montserrat', sans-serif">Sharp Sans</option>
                                    <option value="system-ui">System Default</option>
                                </select>
                            </div>

                            <div class="set-opt-row">
                                <span class="set-label">Text Size</span>
                                <div class="modern-stepper">
                                    <button onclick="window.changeFontSize(-10)"><i class="fas fa-minus"></i></button>
                                    <span id="wfz-v">100%</span>
                                    <button onclick="window.changeFontSize(10)"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>

                            <div class="set-opt-row">
                                <span class="set-label">Line Spacing</span>
                                <div class="modern-range">
                                    <input type="range" min="1" max="2.5" step="0.1" value="1.6" oninput="window.setLH(this.value)" id="wlh-s">
                                </div>
                            </div>
                        </div>

                        <div class="set-section">
                            <div class="set-label-group">
                                <i class="fas fa-wind"></i>
                                <span>Immersion</span>
                            </div>

                            <div class="set-opt-row">
                                <span class="set-label">Reading Tint</span>
                                <button id="ns-toggle" onclick="window.toggleNight()" class="modern-toggle">OFF</button>
                            </div>

                            <div class="set-opt-row">
                                <span class="set-label">Soundscape</span>
                                <select id="amb-s" class="modern-select" onchange="window.playAmbient(this.value)">
                                    <option value="none">Quiet</option>
                                    <option value="rain">Soft Rain</option>
                                    <option value="fire">Crackling Fire</option>
                                    <option value="library">Old Library</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        extraScripts: `
            let syn = window.speechSynthesis;
            let utter = null;
            let speaking = false;
            let ttsPaused = false;
            let amb = null;

            async function init() {
                try {
                    injectFullscreen();
                    document.getElementById('settings-btn').style.display = 'flex';
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    await renderEPUB(blob);
                    
                    // Initialize background options
                    document.querySelectorAll('.bg-option').forEach(opt => {
                        opt.onclick = () => window.setBg(opt.getAttribute('data-bg'));
                    });

                    // Initial state from localstorage
                    const sb = localStorage.getItem('fr_web_bg');
                    if(sb) window.setBg(sb);
                    
                    const st = localStorage.getItem('fr_web_tex');
                    if(st === 'true') {
                        document.body.classList.add('textured');
                        const texBtn = document.getElementById('tex-toggle');
                        if(texBtn) { 
                            texBtn.innerText = 'ON'; 
                            texBtn.style.background = '${accent}'; 
                            texBtn.style.color = 'white'; 
                            texBtn.style.borderColor = 'transparent';
                        }
                    }

                    const sn = localStorage.getItem('fr_web_ns');
                    if(sn === 'true') {
                        document.body.classList.add('night-shift');
                        const nsToggle = document.getElementById('ns-toggle');
                        if(nsToggle) { 
                            nsToggle.innerText = 'ON'; 
                            nsToggle.style.background = '${accent}'; 
                            nsToggle.style.color = 'white'; 
                            nsToggle.style.borderColor = 'transparent';
                        }
                    }

                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            async function renderEPUB(blob) {
                const container = document.getElementById('content-wrapper');
                container.innerHTML = '';
                const book = ePub(blob);
                const tocList = document.getElementById('toc-list');

                bookRender = book.renderTo(container, {
                    flow: "scrolled",
                    width: "100%",
                    manager: "continuous"
                });
                
                document.getElementById('settings-btn').style.display='flex';
                await bookRender.display();
                
                bookRender.hooks.content.register(contents => {
                    const doc = contents.document;
                    const win = contents.window;
                    
                    // Inject styles and fonts
                    const gFont = doc.createElement('link');
                    gFont.rel = 'stylesheet';
                    gFont.href = 'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&family=EB+Garamond:wght@400;700&family=Inter:wght@400;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Playfair+Display:wght@400;700&display=swap';
                    doc.head.appendChild(gFont);

                    const style = doc.createElement('style');
                    style.innerHTML = \`
                        body { 
                            margin: 0 !important; 
                            padding: 20px 40px !important; 
                            overflow-x: hidden !important; 
                            font-family: inherit;
                        }
                        html { height: auto !important; }
                        img { max-width: 100% !important; height: auto !important; }
                    \`;
                    doc.head.appendChild(style);

                    // Apply stored settings
                    applyAllStyles();

                    const resize = () => {
                        const iframe = win.frameElement;
                        if (iframe) {
                            iframe.style.height = '0';
                            iframe.style.height = doc.documentElement.scrollHeight + 'px';
                        }
                    };
                    
                    win.addEventListener('load', resize);
                    const ro = new ResizeObserver(resize);
                    ro.observe(doc.body);
                    setTimeout(resize, 100);
                });
                
                const navigation = await book.loaded.navigation;
                navigation.toc.forEach(chapter => {
                   const item = document.createElement('div');
                   item.className = 'toc-item';
                   item.innerText = chapter.label.trim();
                   item.onclick = () => { bookRender.display(chapter.href); toggleTOC(); };
                   tocList.appendChild(item);
                });
                
                bookRender.on("selected", (cfiRange, contents) => {
                      book.getRange(cfiRange).then(range => {
                          const sel = contents.window.getSelection();
                          if(!sel.rangeCount) return;
                          const menu = document.getElementById('hl-menu');
                          const iframe = contents.window.frameElement;
                          const iframeRect = iframe.getBoundingClientRect();
                          const rect = sel.getRangeAt(0).getBoundingClientRect();
                          
                          const top = window.scrollY + iframeRect.top + rect.top - 60;
                          const left = window.scrollX + iframeRect.left + rect.left + (rect.width / 2);
                          
                          menu.style.top = top + 'px';
                          menu.style.left = left + 'px';
                          menu.style.display = 'flex';
                          window.currentSelection = { cfiRange, text: range.toString(), contents };
                      });
                });
                
                bookRender.hooks.content.register(contents => {
                      const style = contents.document.createElement('style');
                      style.innerHTML = \`
                          ::selection { background: rgba(255, 165, 0, 0.3); }
                          .hl-yellow { background-color: rgba(255, 235, 59, 0.4); }
                          .hl-green { background-color: rgba(165, 214, 167, 0.4); }
                          .hl-blue { background-color: rgba(144, 202, 249, 0.4); }
                          .hl-pink { background-color: rgba(244, 143, 177, 0.4); }
                          .hl-purple { background-color: rgba(206, 147, 216, 0.4); }
                      \`;
                      contents.document.head.appendChild(style);
                      contents.document.body.onclick = () => { 
                          if(contents.window.getSelection().toString().length > 0) return;
                          document.getElementById('hl-menu').style.display = 'none'; 
                      };
                });
                
                book.ready.then(() => {
                    highlights.forEach(h => {
                        try { bookRender.annotations.add("highlight", h.cfi, {}, null, 'hl-' + (h.c || 'yellow')); } catch(e){}
                        
                        // Repair highlights with missing text (from previous schema)
                        if(!h.text && h.cfi) {
                            book.getRange(h.cfi).then(range => {
                                h.text = range.toString();
                                localStorage.setItem('fr_hi_' + FU, JSON.stringify(highlights));
                                if(window.renderHighlights) window.renderHighlights();
                            }).catch(err => console.error("Highlight repair error:", err));
                        }
                    });
                    
                    const fs = localStorage.getItem('fr_web_fs');
                    const ff = localStorage.getItem('fr_web_ff');
                    const lh = localStorage.getItem('fr_web_lh');
                    if(fs) window.changeFontSize(0);
                    if(ff) window.setFont(ff);
                    if(lh) window.setLH(lh);
                });

                let resizeTimer;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => { if(bookRender) bookRender.resize(); }, 250);
                });
            }

            window.setBg = (c) => {
                 document.body.style.background = c;
                 localStorage.setItem('fr_web_bg', c);
                 document.querySelectorAll('.bg-option').forEach(opt => {
                    if(opt.getAttribute('data-bg') === c) opt.classList.add('active');
                    else opt.classList.remove('active');
                 });
                 // If background is very dark, update UI colors
                 const isDark = c === '#1a1a1a' || c === '#333333' || c === '#0d1b2a' || c === '#1e1e1e' || c === '#2d3436' || c === '#0f172a' || c.includes('black');
                 const content = document.getElementById('set-m-c');
                 content.style.background = isDark ? 'rgba(30, 30, 30, 0.96)' : 'rgba(255, 255, 255, 0.98)';
                 content.style.backdropFilter = 'blur(25px)';
                 content.style.color = isDark ? '#eee' : '#111';
                 content.style.boxShadow = isDark ? '0 0 50px rgba(0,0,0,0.6)' : '0 0 50px rgba(0,0,0,0.1)';

                 const header = content.querySelector('.set-m-h div');
                 if(header) header.style.color = isDark ? 'white' : '#111';

                 const labels = document.querySelectorAll('.set-label, .modern-stepper span');
                 labels.forEach(l => {
                    l.style.color = isDark ? '#ccc' : '#333';
                 });
                 
                 const selects = document.querySelectorAll('.modern-select');
                 selects.forEach(s => {
                    s.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                    s.style.color = isDark ? 'white' : '#333';
                    s.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
                 });

                 const steppers = document.querySelectorAll('.modern-stepper');
                 steppers.forEach(s => {
                    s.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                    s.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
                    s.querySelectorAll('button').forEach(b => {
                        b.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'white';
                        b.style.color = isDark ? 'white' : '#111';
                    });
                 });

                 applyAllStyles();
             };

            window.toggleTexture = () => {
                const active = document.body.classList.toggle('textured');
                localStorage.setItem('fr_web_tex', active);
                const btn = document.getElementById('tex-toggle');
                btn.innerText = active ? 'ON' : 'OFF';
                btn.style.background = active ? '${accent}' : 'rgba(0,0,0,0.04)';
                btn.style.color = active ? 'white' : '#333';
                btn.style.borderColor = active ? 'transparent' : 'rgba(0,0,0,0.08)';
            };

            window.changeFontSize = (d) => {
                let current = parseInt(localStorage.getItem('fr_web_fs') || '100');
                let wfz = Math.max(50, Math.min(200, current + d));
                document.getElementById('wfz-v').textContent = wfz + '%';
                localStorage.setItem('fr_web_fs', wfz);
                applyAllStyles();
            };
            
            window.setFont = (f) => {
                localStorage.setItem('fr_web_ff', f);
                applyAllStyles();
            };

            window.setLH = (v) => {
                localStorage.setItem('fr_web_lh', v);
                const input = document.getElementById('wlh-s');
                if(input) input.value = v;
                applyAllStyles();
            };

            window.toggleNight = () => {
                const active = document.body.classList.toggle('night-shift');
                localStorage.setItem('fr_web_ns', active);
                const btn = document.getElementById('ns-toggle');
                btn.innerText = active ? 'ON' : 'OFF';
                btn.style.background = active ? '${accent}' : 'rgba(0,0,0,0.04)';
                btn.style.color = active ? 'white' : '#333';
                btn.style.borderColor = active ? 'transparent' : 'rgba(0,0,0,0.08)';
            };

            window.playAmbient = (type) => {
                if(amb) amb.pause();
                if(type === 'none') return;
                const urls = { 
                    rain: 'https://cdn.pixabay.com/audio/2022/03/10/audio_51307b0f69.mp3', 
                    fire: 'https://cdn.pixabay.com/audio/2021/08/09/audio_65b750170a.mp3', 
                    library: 'https://cdn.pixabay.com/audio/2023/10/24/audio_985b8c9d0d.mp3' 
                };
                amb = new Audio(urls[type]);
                amb.loop = true;
                amb.play();
            };

            function applyAllStyles() {
                if(!bookRender) return;
                const ff = localStorage.getItem('fr_web_ff') || "'Inter', sans-serif";
                const fs = localStorage.getItem('fr_web_fs') || "100";
                const lh = localStorage.getItem('fr_web_lh') || "1.6";
                
                const bg = localStorage.getItem('fr_web_bg') || '#ffffff';
                const isDark = bg === '#1a1a1a' || bg === '#333333' || bg === '#0d1b2a' || bg === '#1e1e1e' || bg === '#2d3436' || bg === '#0f172a' || bg.includes('black') || bg.includes('gradient');
                const textColor = isDark ? '#f8fafc' : '#1a1a1a';
                
                bookRender.getContents().forEach(c => {
                    c.addStylesheetRules({
                        "body": {
                            "font-family": ff + " !important",
                            "font-size": fs + "% !important",
                            "line-height": lh + " !important",
                            "color": textColor + " !important"
                        }
                    });
                });
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                const isOpen = m.classList.toggle('o');
                const fs = localStorage.getItem('fr_web_fs') || '100';
                document.getElementById('wfz-v').textContent = fs + '%';
                
                // Block/Unblock background scroll
                document.body.style.overflow = isOpen ? 'hidden' : '';

                // Ensure header and footer are visible when modal opens/closes
                const hdr = document.getElementById('main-header');
                const ftr = document.getElementById('main-footer');
                if(hdr) { hdr.classList.remove('down'); hdr.classList.add('up'); }
                if(ftr) { ftr.classList.remove('down'); ftr.classList.add('up'); }
                
                // Force layout recalculation to prevent footer disappearance
                setTimeout(() => {
                    if(ftr) ftr.style.display = 'flex';
                }, 100);
            };

            function injectFullscreen() {
                const hdr = document.getElementById('header-icons');
                const btn = document.createElement('button');
                btn.className = 'header-icon';
                btn.title = 'Toggle Fullscreen';
                btn.innerHTML = '<i class="fas fa-expand"></i>';
                const notesBtn = document.getElementById('notes-btn');
                if(notesBtn && hdr.contains(notesBtn)) hdr.insertBefore(btn, notesBtn.nextSibling);
                else hdr.appendChild(btn);
                
                btn.onclick = () => {
                    if(!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                        btn.innerHTML = '<i class="fas fa-compress"></i>';
                    } else {
                        document.exitFullscreen();
                        btn.innerHTML = '<i class="fas fa-expand"></i>';
                    }
                };
            }

            window.toggleTTS = () => { if(speaking || ttsPaused) stopTTS(); else startTTS(); };
            window.startTTS = () => {
                if(!bookRender) return;
                const contents = bookRender.getContents();
                if(!contents || contents.length === 0) return;
                let text = contents.map(c => c.document.body.innerText).join(' ');
                if(!text || text.trim().length === 0) return;
                utter = new SpeechSynthesisUtterance(text);
                utter.onend = stopTTS;
                utter.onstart = () => { speaking = true; ttsPaused = false; updateTTSUI(); };
                if (syn.paused) syn.resume();
                syn.cancel(); 
                setTimeout(() => {
                    if (syn.paused) syn.resume();
                    syn.speak(utter);
                }, 150);
                document.getElementById('tts-ctrls').classList.remove('hidden');
            };
            window.togglePlayPauseTTS = () => {
                if (syn.paused) { syn.resume(); ttsPaused = false; speaking = true; }
                else { syn.pause(); ttsPaused = true; speaking = false; }
                updateTTSUI();
            };
            window.stopTTS = () => {
                syn.cancel(); speaking = false; ttsPaused = false;
                document.getElementById('tts-ctrls').classList.add('hidden');
                updateTTSUI();
            };
            window.updateTTSUI = () => {
                const pp = document.getElementById('tts-pp-i');
                const btn = document.getElementById('tts-btn');
                if (pp) pp.className = ttsPaused ? 'fas fa-play' : 'fas fa-pause';
                if (btn) {
                    btn.classList.toggle('tts-playing', speaking);
                    btn.classList.toggle('tts-paused', ttsPaused);
                }
            };

            window.addHighlight = (color) => {
                if(!window.currentSelection) return;
                const { cfiRange, text, contents } = window.currentSelection;
                
                try {
                    bookRender.annotations.add("highlight", cfiRange, {}, null, 'hl-' + color);
                } catch(e) { console.error("Highlight error:", e); }
                
                highlights.push({ cfi: cfiRange, text, c: color });
                localStorage.setItem('fr_hi_' + FU, JSON.stringify(highlights));
                
                contents.window.getSelection().removeAllRanges();
                document.getElementById('hl-menu').style.display = 'none';
                
                if(window.renderHighlights) window.renderHighlights();
            };
        `
    });
}
