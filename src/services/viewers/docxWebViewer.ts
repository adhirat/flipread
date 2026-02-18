
import { getWebViewerBase } from './webViewerBase';

export function docxWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl,
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
        `
    });
}
