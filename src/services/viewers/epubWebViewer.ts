
import { getWebViewerBase } from './webViewerBase';

export function epubWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        dependencies: [
            'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js',
            'https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js'
        ],
        extraStyles: `
            .epub-container { height: calc(100vh - 60px) !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
            #content-wrapper iframe { border: none !important; }
        `,
        extraScripts: `
            async function init() {
                try {
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    await renderEPUB(blob);
                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            async function renderEPUB(blob) {
                const container = document.getElementById('content-wrapper');
                container.innerHTML = '';
                const book = ePub(blob);
                const tocList = document.getElementById('toc-list');

                bookRender = book.renderTo(container, {
                    flow: "scrolled",
                    manager: "continuous",
                    width: "100%"
                });
                document.getElementById('settings-btn').style.display='flex';
                await bookRender.display();
                
                bookRender.hooks.content.register(contents => {
                    const doc = contents.document;
                    const win = contents.window;
                    const style = doc.createElement('style');
                    style.innerHTML = \`
                        body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
                        html { height: auto !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
                        .epubjs-view { margin: 0 !important; padding: 0 !important; }
                    \`;
                    doc.head.appendChild(style);

                    const resize = () => {
                        const h = doc.documentElement.scrollHeight;
                        const iframe = win.frameElement;
                        if(iframe && h > 0) iframe.style.height = h + 'px';
                    };
                    
                    const ro = new ResizeObserver(resize);
                    ro.observe(doc.body);
                    resize();
                    win.addEventListener('load', resize);
                    Array.from(doc.images).forEach(img => { img.onload = resize; });
                });
                
                const navigation = await book.loaded.navigation;
                navigation.toc.forEach(chapter => {
                   const item = document.createElement('div');
                   item.className = 'toc-item';
                   item.innerText = chapter.label.trim();
                   item.onclick = () => { bookRender.display(chapter.href); toggleTOC(); };
                   tocList.appendChild(item);
                });
                
                bookRender.on("selected", (cfiRange, contents) => {
                      book.getRange(cfiRange).then(range => {
                          const sel = contents.window.getSelection();
                          if(!sel.rangeCount) return;
                          const iframe = container.querySelector('iframe');
                          const iframeRect = iframe.getBoundingClientRect();
                          const rect = sel.getRangeAt(0).getBoundingClientRect();
                          const menu = document.getElementById('hl-menu');
                          menu.style.top = (window.scrollY + iframeRect.top + rect.top - 50) + 'px';
                          menu.style.left = (iframeRect.left + rect.left + rect.width/2) + 'px';
                          menu.style.display = 'flex';
                          window.currentSelection = { cfiRange, text: range.toString(), contents };
                      });
                });
                
                bookRender.hooks.content.register(contents => {
                      const style = contents.document.createElement('style');
                      style.innerHTML = \`
                          ::selection { background: rgba(255, 165, 0, 0.3); }
                          .hl-yellow { background-color: rgba(255, 235, 59, 0.4); }
                          .hl-green { background-color: rgba(165, 214, 167, 0.4); }
                          .hl-blue { background-color: rgba(144, 202, 249, 0.4); }
                          .hl-pink { background-color: rgba(244, 143, 177, 0.4); }
                          .hl-purple { background-color: rgba(206, 147, 216, 0.4); }
                      \`;
                      contents.document.head.appendChild(style);
                      contents.document.body.onclick = () => { 
                          if(contents.window.getSelection().toString().length > 0) return;
                          document.getElementById('hl-menu').style.display = 'none'; 
                      };
                });
                
                book.ready.then(() => {
                    highlights.forEach(h => {
                        try { bookRender.annotations.add("highlight", h.cfi, {}, null, 'hl-' + (h.c || 'yellow')); } catch(e){}
                    });
                });

                let resizeTimer;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => { if(bookRender) bookRender.resize(); }, 250);
                });
                
                book.ready.then(() => {
                    const fs = localStorage.getItem('fr_web_fs');
                    const ff = localStorage.getItem('fr_web_ff');
                    if(fs) changeFontSize(0);
                    if(ff) setFont(ff);
                });
            }

            window.addHighlight = (c) => {
                if(!window.currentSelection) return;
                const { cfiRange, text, contents } = window.currentSelection;
                bookRender.annotations.add("highlight", cfiRange, {}, null, 'hl-' + c);
                highlights.push({ cfi: cfiRange, text, c });
                localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
                document.getElementById('hl-menu').style.display = 'none';
                contents.window.getSelection().removeAllRanges();
                renderHighlights();
            };

            window.changeFontSize = (d) => {
                wfz = Math.max(50, Math.min(200, (parseInt(localStorage.getItem('fr_web_fs') || '100')) + d));
                document.getElementById('wfz-v').textContent = wfz + '%';
                localStorage.setItem('fr_web_fs', wfz);
                if(bookRender) bookRender.themes.fontSize(wfz + "%");
            };
            
            window.setFont = (f) => {
                localStorage.setItem('fr_web_ff', f);
                if(bookRender) bookRender.themes.font(f);
            };
        `
    });
}
