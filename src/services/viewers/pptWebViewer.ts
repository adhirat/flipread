
import { getWebViewerBase } from './webViewerBase';

export function pptWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        dependencies: [
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.js'
        ],
        extraStyles: `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.css">
        `,
        extraScripts: `
            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'none';
                    await renderPPTX(FU);
                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            async function renderPPTX(url) {
                 const container = document.getElementById('content-wrapper');
                 $(container).pptxToHtml({
                     pptxFileUrl: url,
                     slideMode: false,
                     slidesScale: "100%",
                     keyBoardShortCut: false
                 });
                 setTimeout(() => {
                     const slides = container.querySelectorAll('.slide');
                     const tocList = document.getElementById('toc-list');
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
        `
    });
}
