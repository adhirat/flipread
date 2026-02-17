
import { getWebViewerBase } from './webViewerBase';

export function textWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        dependencies: [
            'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
        ],
        extraStyles: `
            #text-container { max-width: 800px; margin: 0 auto; padding: 20px; white-space: pre-wrap; font-family: inherit; }
            .markdown-body { background: transparent !important; color: inherit !important; }
        `,
        extraScripts: `
            async function init() {
                try {
                    const res = await fetch(FU);
                    const text = await res.text();
                    const container = document.getElementById('content-wrapper');
                    const textDiv = document.createElement('div');
                    textDiv.id = 'text-container';
                    
                    if (FU.endsWith('.md')) {
                        textDiv.className = 'markdown-body';
                        textDiv.innerHTML = marked.parse(text);
                    } else {
                        textDiv.innerText = text;
                    }
                    
                    container.appendChild(textDiv);
                    
                    // TOC for Markdown
                    if (FU.endsWith('.md')) {
                        const headers = textDiv.querySelectorAll('h1, h2, h3');
                        const tocList = document.getElementById('toc-list');
                        headers.forEach((h, i) => {
                            h.id = 'h-' + i;
                            const item = document.createElement('div');
                            item.className = 'toc-item';
                            item.innerText = h.innerText;
                            item.onclick = () => { h.scrollIntoView({behavior:'smooth'}); toggleTOC(); };
                            tocList.appendChild(item);
                        });
                    } else {
                         document.getElementById('toc-list').innerHTML = '<div class="p-4 text-xs opacity-50">Plain text file.</div>';
                    }

                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }
        `
    });
}
