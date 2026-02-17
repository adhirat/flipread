
import { getWebViewerBase } from './webViewerBase';

export function pdfWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        dependencies: [
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
        ],
        settingsHtml: `
            <div id="set-m">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">PDF Options</h3>
                    <button onclick="toggleSettings()" class="md:hidden text-lg">✕</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Zoom Level</label>
                        <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                            <button onclick="changeZoom(-0.1)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">-</button>
                            <span id="zoom-v" class="flex-1 text-center font-bold text-sm">1.5x</span>
                            <button onclick="changeZoom(0.1)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        extraScripts: `
            let pdfScale = 1.5;
            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    await renderPDF(blob);
                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            function renderPDF(blob) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                const data = await blob.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(data).promise;
                const container = document.getElementById('content-wrapper');
                const tocList = document.getElementById('toc-list');
                tocList.innerHTML = '';
                container.innerHTML = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const section = document.createElement('div');
                    section.id = 'page-' + i;
                    section.className = 'page-content mb-8 flex flex-col items-center';
                    
                    const head = document.createElement('div');
                    head.className = 'section-header mb-2';
                    head.innerHTML = '<div class="pg-elegant text-xs opacity-40">PAGE ' + i + '</div>';
                    section.appendChild(head);

                    const canvas = document.createElement('canvas');
                    canvas.className = 'shadow-2xl max-w-full h-auto';
                    section.appendChild(canvas);
                    container.appendChild(section);

                    pdf.getPage(i).then(page => {
                        const vp = page.getViewport({ scale: pdfScale });
                        canvas.width = vp.width;
                        canvas.height = vp.height;
                        page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
                    });

                    const item = document.createElement('div');
                    item.className = 'toc-item';
                    item.innerText = 'Page ' + i;
                    item.onclick = () => {  
                        document.getElementById('page-'+i).scrollIntoView({behavior:'smooth'});
                        toggleTOC();
                    };
                    tocList.appendChild(item);
                }
                window.currentPdfBlob = blob;
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
            };

            window.changeZoom = (d) => {
                pdfScale = Math.max(0.5, Math.min(3.0, pdfScale + d));
                document.getElementById('zoom-v').textContent = pdfScale.toFixed(1) + 'x';
                if(window.currentPdfBlob) renderPDF(window.currentPdfBlob);
            };
        `
    });
}
