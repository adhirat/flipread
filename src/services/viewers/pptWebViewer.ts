
import { getWebViewerBase } from './webViewerBase';

export function pptWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl,
        dependencies: [
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.js'
        ],
        settingsHtml: `
            <div id="set-m">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">PPT Options</h3>
                    <button onclick="toggleSettings()" class="md:hidden text-lg">✕</button>
                </div>
                <div class="space-y-4">
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
        `,
        extraStyles: `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.css">
        `,
        extraScripts: `
            let pptScale = 100;
            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    await renderPPTX(FU);
                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
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
                     const slides = container.querySelectorAll('.slide');
                     const tocList = document.getElementById('toc-list');
                     if(tocList) tocList.innerHTML = '';
                     slides.forEach((s, i) => {
                         let title = "Slide " + (i+1);
                         const t = s.innerText.substring(0, 20).trim();
                         if(t.length > 2) title = t + "...";
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
                m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
            };

            window.changeScale = (d) => {
                pptScale = Math.max(50, Math.min(200, pptScale + d));
                document.getElementById('scale-v').textContent = pptScale + '%';
                renderPPTX(FU);
            };
        `
    });
}
