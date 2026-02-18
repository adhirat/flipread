
import { getWebViewerBase } from './webViewerBase';

export function spreadsheetWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: false,
        dependencies: [
            'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js'
        ],
        settingsHtml: `
            <div id="set-m">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">Table View</h3>
                    <button onclick="toggleSettings()" class="md:hidden text-lg">✕</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Text Size</label>
                        <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                            <button onclick="changeFontSize(-1)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">-</button>
                            <span id="wfz-v" class="flex-1 text-center font-bold text-sm">13px</span>
                            <button onclick="changeFontSize(1)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        extraStyles: `
            #sheet-container { overflow-x: auto; padding: 20px; }
            table { border-collapse: collapse; width: 100%; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; position: sticky; top: 0; }
            .sheet-tabs { display: flex; gap: 4px; padding: 10px 20px; background: #f9f9f9; border-bottom: 1px solid #ddd; overflow-x: auto; }
            .sheet-tab { padding: 6px 15px; background: white; border: 1px solid #ddd; border-bottom: none; cursor: pointer; font-size: 12px; white-space: nowrap; }
            .sheet-tab.active { background: var(--accent); color: white; border-color: var(--accent); }
        `,
        extraScripts: `
            let workbook = null;
            let currentFontSize = 13;
            let syn = window.speechSynthesis;
            let utter = null;
            let speaking = false;
            let ttsPaused = false;

            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const storedSize = localStorage.getItem('fr_web_ss_fs');
                    if(storedSize) {
                        currentFontSize = parseInt(storedSize);
                        document.getElementById('wfz-v').textContent = currentFontSize + 'px';
                    }

                    const res = await fetch(FU);
                    const arrayBuffer = await res.arrayBuffer();
                    workbook = XLSX.read(arrayBuffer);
                    
                    const container = document.getElementById('content-wrapper');
                    const tabs = document.createElement('div');
                    tabs.className = 'sheet-tabs';
                    container.appendChild(tabs);
                    
                    const sheetDiv = document.createElement('div');
                    sheetDiv.id = 'sheet-container';
                    container.appendChild(sheetDiv);
                    
                    const tocList = document.getElementById('toc-list');

                    workbook.SheetNames.forEach((name, i) => {
                        const tab = document.createElement('div');
                        tab.className = 'sheet-tab' + (i === 0 ? ' active' : '');
                        tab.innerText = name;
                        tab.onclick = () => {
                            document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
                            tab.classList.add('active');
                            renderSheet(name);
                        };
                        tabs.appendChild(tab);
                        
                        const item = document.createElement('div');
                        item.className = 'toc-item';
                        item.innerText = name;
                        item.onclick = () => { renderSheet(name); tab.click(); toggleTOC(); };
                        tocList.appendChild(item);
                    });
                    
                    renderSheet(workbook.SheetNames[0]);

                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            function renderSheet(name) {
                const sheet = workbook.Sheets[name];
                const html = XLSX.utils.sheet_to_html(sheet);
                const container = document.getElementById('sheet-container');
                container.innerHTML = html;
                container.querySelector('table').style.fontSize = currentFontSize + 'px';
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
            };

            window.changeFontSize = (d) => {
                currentFontSize = Math.max(8, Math.min(30, currentFontSize + d));
                document.getElementById('wfz-v').textContent = currentFontSize + 'px';
                localStorage.setItem('fr_web_ss_fs', currentFontSize);
                const table = document.querySelector('#sheet-container table');
                if(table) table.style.fontSize = currentFontSize + 'px';
            };

            window.toggleTTS = () => {
                if(speaking || ttsPaused) {
                    stopTTS();
                } else {
                    startTTS();
                }
            };
            window.startTTS = () => {
                const container = document.getElementById('sheet-container');
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
                    ctrls.classList.add('flex');
                    ctrls.classList.remove('hidden');
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
                    ctrls.classList.remove('flex');
                    ctrls.classList.add('hidden');
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
        `
    });
}
