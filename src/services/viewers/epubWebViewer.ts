
import { getWebViewerBase } from './webViewerBase';

export function epubWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
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
            #content-wrapper { width: 100%; max-width: 900px; margin: 0 auto; min-height: 100vh; position: relative; }
            #content-wrapper iframe { width: 100% !important; border: none !important; margin: 0 !important; padding: 0 !important; }
            .epub-container { height: auto !important; width: 100% !important; overflow: visible !important; }
        `,
        settingsHtml: `
            <div id="set-m" onclick="toggleSettings()">
                <div id="set-m-c" onclick="event.stopPropagation()">
                    <div class="set-m-h">
                        <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">Typography</h3>
                        <button onclick="toggleSettings()" class="text-lg opacity-40 hover:opacity-100">✕</button>
                    </div>
                    <div class="set-m-b">
                        <div>
                            <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Font Size</label>
                            <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                                <button onclick="changeFontSize(-10)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">-</button>
                                <span id="wfz-v" class="flex-1 text-center font-bold text-sm">100%</span>
                                <button onclick="changeFontSize(10)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">+</button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Font Family</label>
                            <select id="wff-s" onchange="setFont(this.value)" class="w-full bg-gray-50 border p-2 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500">
                                <option value="'Inter', sans-serif">Modern Sans (Inter)</option>
                                <option value="'Lora', serif">Literary Serif (Lora)</option>
                                <option value="'EB Garamond', serif">Elegant Garamond</option>
                                <option value="'Crimson Pro', serif">Journal Serif (Crimson)</option>
                                <option value="'Merriweather', serif">Classic Serif</option>
                                <option value="'Playfair Display', serif">Display Serif</option>
                                <option value="'Open Sans', sans-serif">Clean Sans</option>
                                <option value="'Montserrat', sans-serif">Sharp Sans</option>
                                <option value="system-ui">System Default</option>
                            </select>
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

            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    await renderEPUB(blob);
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
                    const storedFF = localStorage.getItem('fr_web_ff');
                    const storedFS = localStorage.getItem('fr_web_fs');
                    if(storedFF) contents.addStylesheetRules({"body": {"font-family": storedFF + " !important"}});
                    if(storedFS) contents.addStylesheetRules({"body": {"font-size": storedFS + "% !important"}});

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
                          
                          // Correctly calculate position relative to the main document
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
                    });
                });

                let resizeTimer;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => { if(bookRender) bookRender.resize(); }, 250);
                });
                
                book.ready.then(() => {
                    const fs = localStorage.getItem('fr_web_fs');
                    const ff = localStorage.getItem('fr_web_ff');
                    if(fs) changeFontSize(0);
                    if(ff) setFont(ff);
                });
            }

            window.addHighlight = (c) => {
                if(!window.currentSelection) return;
                const { cfiRange, text, contents } = window.currentSelection;
                bookRender.annotations.add("highlight", cfiRange, {}, null, 'hl-' + c);
                highlights.push({ cfi: cfiRange, text, c });
                localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
                document.getElementById('hl-menu').style.display = 'none';
                contents.window.getSelection().removeAllRanges();
                renderHighlights();
            };

            window.changeFontSize = (d) => {
                wfz = Math.max(50, Math.min(200, (parseInt(localStorage.getItem('fr_web_fs') || '100')) + d));
                document.getElementById('wfz-v').textContent = wfz + '%';
                localStorage.setItem('fr_web_fs', wfz);
                if(bookRender) {
                    bookRender.themes.fontSize(wfz + "%");
                    bookRender.getContents().forEach(c => {
                        c.addStylesheetRules({"body": {"font-size": wfz + "% !important"}});
                    });
                }
            };
            
            window.setFont = (f) => {
                localStorage.setItem('fr_web_ff', f);
                if(bookRender) {
                    bookRender.themes.font(f);
                    bookRender.getContents().forEach(c => {
                        c.addStylesheetRules({"body": {"font-family": f + " !important"}});
                    });
                }
            };

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.classList.toggle('o');
                document.getElementById('wfz-v').textContent = (window.wfz || 100) + '%';
            };

            window.toggleTTS = () => { if(speaking || ttsPaused) stopTTS(); else startTTS(); };
            window.startTTS = () => {
                if(!bookRender) return;
                const contents = bookRender.getContents();
                if(!contents || contents.length === 0) return;
                
                // Get text from all visible content chunks in scrolled mode
                let text = contents.map(c => c.document.body.innerText).join(' ');
                if(!text || text.trim().length === 0) return;

                utter = new SpeechSynthesisUtterance(text);
                utter.onend = stopTTS;
                utter.onstart = () => { speaking = true; ttsPaused = false; updateTTSUI(); };
                
                // Safety: cancel any current speech and ensure resume is called 
                // to unstick some browser speech engines
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
        `
    });
}
