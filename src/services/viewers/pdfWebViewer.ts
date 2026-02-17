
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
        extraScripts: `
            async function init() {
                try {
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    document.getElementById('settings-btn').style.display = 'none';
                    await renderPDF(blob);
                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            async function renderPDF(blob) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                const data = await blob.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(data).promise;
                const container = document.getElementById('content-wrapper');
                const tocList = document.getElementById('toc-list');

                for (let i = 1; i <= pdf.numPages; i++) {
                    const section = document.createElement('div');
                    section.id = 'page-' + i;
                    section.className = 'page-content';
                    
                    const head = document.createElement('div');
                    head.className = 'section-header';
                    head.innerHTML = '<div class="pg-elegant">' + i + '</div>';
                    section.appendChild(head);

                    const canvas = document.createElement('canvas');
                    canvas.className = 'w-full h-auto shadow-lg';
                    section.appendChild(canvas);
                    container.appendChild(section);

                    pdf.getPage(i).then(page => {
                        const vp = page.getViewport({ scale: 1.5 });
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
            }
        `
    });
}
