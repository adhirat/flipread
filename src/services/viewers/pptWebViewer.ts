import { getWebViewerBase } from './webViewerBase';

export function pptWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
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
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.js'
        ],
        settingsHtml: `
            <div id="set-m" class="modal" onclick="toggleSettings()">
                <div id="set-m-c" class="modal-c" onclick="event.stopPropagation()">
                    <div class="set-m-h">
                        <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">PPT Options</h3>
                        <button onclick="toggleSettings()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">✕</button>
                    </div>
                    <div class="set-m-b">
                        <div>
                            <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Slide Scale</label>
                            <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                                <button onclick="changeScale(-10)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">-</button>
                                <span id="scale-v" class="flex-1 text-center font-bold text-sm">100%</span>
                                <button onclick="changeScale(10)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        extraStyles: `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.css">
            #content-wrapper { padding-top: 80px; }
            .pptx-div { margin: 0 auto !important; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
        `,
        extraScripts: `
            let pptScale = 100;

            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    await renderPPTX(FU);
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

            function renderPPTX(url) {
                 const container = document.getElementById('content-wrapper');
                 $(container).pptxToHtml({
                     pptxFileUrl: url,
                     slideMode: false,
                     slidesScale: pptScale + "%",
                     keyBoardShortCut: false
                 });
                 setTimeout(() => {
                     const slides = container.querySelectorAll('.pptx-div');
                     const tocList = document.getElementById('toc-list');
                     if(tocList) tocList.innerHTML = '';
                     slides.forEach((s, i) => {
                         let title = "Slide " + (i+1);
                         const t = s.innerText.substring(0, 30).trim();
                         if(t.length > 5) title = t + "...";
                         s.id = 'slide-' + i;
                         const item = document.createElement('div');
                         item.className = 'toc-item';
                         item.innerText = title;
                         item.onclick = () => { s.scrollIntoView({behavior:'smooth'}); toggleTOC(); };
                         tocList.appendChild(item);
                     });
                 }, 3000);
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.classList.toggle('o');
            };

            window.changeScale = (d) => {
                pptScale = Math.max(50, Math.min(200, pptScale + d));
                document.getElementById('scale-v').textContent = pptScale + '%';
                const container = document.getElementById('content-wrapper');
                container.innerHTML = '';
                renderPPTX(FU);
            };

            // Enhanced TTS for PPT Web
            const baseToggleTTS = window.toggleTTS;
            window.toggleTTS = () => {
                const container = document.getElementById('content-wrapper');
                if(!container) return;
                const text = container.innerText;
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
