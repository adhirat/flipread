
import { getWebViewerBase } from './webViewerBase';

export function docxWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        dependencies: [
            'https://unpkg.com/docx-preview/dist/docx-preview.min.js'
        ],
        extraScripts: `
            async function init() {
                try {
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    document.getElementById('settings-btn').style.display = 'none';
                    await renderDOCX(blob);
                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            async function renderDOCX(blob) {
                const container = document.getElementById('content-wrapper');
                const wrapper = document.createElement('div');
                container.appendChild(wrapper);
                await docx.renderAsync(blob, wrapper);
                
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
        `
    });
}
