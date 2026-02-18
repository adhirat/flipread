
import { getWebViewerBase } from './webViewerBase';

export function textWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl,
        showTTS: false,
        dependencies: [
            'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
        ],
        settingsHtml: `
            <div id="set-m">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">Typography</h3>
                    <button onclick="toggleSettings()" class="md:hidden text-lg">✕</button>
                </div>
                <div class="space-y-4">
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
        `,
        extraStyles: `
            #text-container { max-width: 800px; margin: 0 auto; padding: 20px; white-space: pre-wrap; font-family: inherit; }
            .markdown-body { background: transparent !important; color: inherit !important; }
        `,
        extraScripts: `
            let wfz = 100;
            let syn = window.speechSynthesis;
            let utter = null;
            let speaking = false;
            let ttsPaused = false;

            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const ff = localStorage.getItem('fr_web_ff');
                    const fs = localStorage.getItem('fr_web_fs');
                    if(ff) setFont(ff);
                    if(fs) { wfz = parseInt(fs); changeFontSize(0); }

                    const res = await fetch(FU);
                    const text = await res.text();
                    const container = document.getElementById('content-wrapper');
                    const textDiv = document.createElement('div');
                    textDiv.id = 'text-container';
                    
                    if (FU.endsWith('.md')) {
                        textDiv.className = 'markdown-body';
                        textDiv.innerHTML = marked.parse(text);
                    } else {
                        textDiv.innerText = text;
                    }
                    
                    container.appendChild(textDiv);
                    
                    // TOC for Markdown
                    if (FU.endsWith('.md')) {
                        const headers = textDiv.querySelectorAll('h1, h2, h3');
                        const tocList = document.getElementById('toc-list');
                        headers.forEach((h, i) => {
                            h.id = 'h-' + i;
                            const item = document.createElement('div');
                            item.className = 'toc-item';
                            item.innerText = h.innerText;
                            item.onclick = () => { h.scrollIntoView({behavior:'smooth'}); toggleTOC(); };
                            tocList.appendChild(item);
                        });
                    } else {
                         document.getElementById('toc-list').innerHTML = '<div class="p-4 text-xs opacity-50">Plain text file.</div>';
                    }

                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
                document.getElementById('wfz-v').textContent = (window.wfz || 100) + '%';
            };

            window.changeFontSize = (d) => {
                wfz = Math.max(50, Math.min(200, wfz + d));
                document.getElementById('wfz-v').textContent = wfz + '%';
                localStorage.setItem('fr_web_fs', wfz);
                const container = document.getElementById('text-container');
                if(container) container.style.fontSize = (wfz/100) + 'em';
            };

            window.setFont = (f) => {
                localStorage.setItem('fr_web_ff', f);
                const container = document.getElementById('text-container');
                if(container) container.style.fontFamily = f;
                const select = document.getElementById('wff-s');
                if(select) select.value = f;
            };

            window.toggleTTS = () => { if(speaking || ttsPaused) stopTTS(); else startTTS(); };
            window.startTTS = () => {
                const container = document.getElementById('text-container');
                if(!container) return;
                const text = container.innerText;
                if(!text || text.trim().length === 0) return;
                utter = new SpeechSynthesisUtterance(text);
                utter.onend = stopTTS;
                utter.onstart = () => { speaking = true; ttsPaused = false; updateTTSUI(); };
                if (syn.paused) syn.resume();
                syn.cancel(); 
                setTimeout(() => { if (syn.paused) syn.resume(); syn.speak(utter); }, 150);
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
