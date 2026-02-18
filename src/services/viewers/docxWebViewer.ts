
import { getWebViewerBase } from './webViewerBase';

export function docxWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
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
            'https://unpkg.com/docx-preview/dist/docx-preview.min.js'
        ],
        settingsHtml: `
            <div id="set-m">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">DOCX View</h3>
                    <button onclick="toggleSettings()" class="md:hidden text-lg">✕</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Zoom Level</label>
                        <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                            <button onclick="changeZoom(-10)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">-</button>
                            <span id="zoom-v" class="flex-1 text-center font-bold text-sm">100%</span>
                            <button onclick="changeZoom(10)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        extraScripts: `
            let docxZoom = 100;
            let syn = window.speechSynthesis;
            let utter = null;
            let speaking = false;
            let ttsPaused = false;

            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    await renderDOCX(blob);
                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            function renderDOCX(blob) {
                const container = document.getElementById('content-wrapper');
                const wrapper = document.createElement('div');
                wrapper.id = 'docx-wrapper';
                container.appendChild(wrapper);
                docx.renderAsync(blob, wrapper);
                
                const headers = wrapper.querySelectorAll('h1, h2, h3');
                const tocList = document.getElementById('toc-list');
                if(headers.length === 0) {
                     tocList.innerHTML = '<div class="p-4 text-xs opacity-50">No sections found.</div>';
                     return;
                }
                headers.forEach((h, i) => {
                    h.id = 'section-' + i;
                    const item = document.createElement('div');
                    item.className = 'toc-item';
                    item.innerText = h.innerText;
                    item.style.paddingLeft = (parseInt(h.tagName[1]) * 10) + 'px';
                    item.onclick = () => { h.scrollIntoView({behavior:'smooth'}); toggleTOC(); };
                    tocList.appendChild(item);
                });
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
            };

            window.changeZoom = (d) => {
                docxZoom = Math.max(50, Math.min(200, docxZoom + d));
                document.getElementById('zoom-v').textContent = docxZoom + '%';
                const wrapper = document.getElementById('docx-wrapper');
                if(wrapper) wrapper.style.zoom = (docxZoom / 100);
            };

            window.toggleTTS = () => {
                if(speaking || ttsPaused) {
                    stopTTS();
                } else {
                    startTTS();
                }
            };
            window.startTTS = () => {
                const wrapper = document.getElementById('docx-wrapper');
                if(!wrapper) return;
                
                const text = wrapper.innerText;
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
