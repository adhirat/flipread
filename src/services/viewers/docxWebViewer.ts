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
        showTTS: true,
        showFullMode: true,
        showNightShift: true,
        dependencies: [
            'https://unpkg.com/docx-preview/dist/docx-preview.min.js'
        ],
        settingsHtml: `
            <div id="set-m" class="modal" onclick="toggleSettings()">
                <div id="set-m-c" class="modal-c" onclick="event.stopPropagation()">
                    <div class="set-m-h">
                        <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">DOCX Options</h3>
                        <button onclick="toggleSettings()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">✕</button>
                    </div>
                    <div class="set-m-b">
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
            </div>
        `,
        extraStyles: `
            #content-wrapper { padding: 80px 20px 200px; display: flex; flex-direction: column; align-items: center; }
            #docx-wrapper { width: 100%; max-width: 850px; background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; transform-origin: top center; transition: transform 0.2s; }
            .docx { padding: 40px !important; }
        `,
        extraScripts: `
            let docxZoom = 100;

            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    await renderDOCX(blob);
                    const ld = document.getElementById('ld');
                    if(ld) {
                        ld.style.opacity = '0';
                        setTimeout(() => ld.style.display = 'none', 500);
                    }
                } catch(e) {
                    console.error(e);
                    const ld = document.getElementById('ld');
                    if(ld) ld.innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            function renderDOCX(blob) {
                const container = document.getElementById('content-wrapper');
                const wrapper = document.createElement('div');
                wrapper.id = 'docx-wrapper';
                container.appendChild(wrapper);
                docx.renderAsync(blob, wrapper);
                
                setTimeout(() => {
                    const headers = wrapper.querySelectorAll('h1, h2, h3');
                    const tocList = document.getElementById('toc-list');
                    if(tocList) {
                        tocList.innerHTML = '';
                        if(headers.length === 0) {
                             tocList.innerHTML = '<div class="p-4 text-xs opacity-50">No sections found.</div>';
                        } else {
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
                    }
                }, 1000);
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.classList.toggle('o');
            };

            window.changeZoom = (d) => {
                docxZoom = Math.max(50, Math.min(200, docxZoom + d));
                document.getElementById('zoom-v').textContent = docxZoom + '%';
                const wrapper = document.getElementById('docx-wrapper');
                if(wrapper) wrapper.style.transform = 'scale(' + (docxZoom / 100) + ')';
            };

            // Enhanced TTS
            window.toggleTTS = () => {
                const wrapper = document.getElementById('docx-wrapper');
                if(!wrapper) return;
                const text = wrapper.innerText;
                if(!text) return;
                
                if(window.speaking || window.ttsPaused) {
                    window.stopTTS();
                } else {
                    window.startTTS(text);
                }
            };
        `
    });
}
