import { getViewerBase } from './viewerBase';
import { escapeHtml, COMMON_READER_SCRIPTS } from './viewerUtils';

export function documentViewerHTML(title: string, file_url: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    const bg = (settings.background as string) || '#f8fafc';
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);

    const extraStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Crimson+Pro:wght@400;700&display=swap');

        :root {
            --reader-bg: ${bg};
            --reader-accent: ${accent};
            --page-width: 210mm;
            --page-height: 297mm;
        }

        #s-c { 
            position: absolute; 
            inset: 0; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            perspective: 3000px; 
            overflow: hidden; 
            background: var(--reader-bg);
        }

        #b-t { 
            position: relative; 
            width: 95vw; 
            height: 90vh; 
            max-width: 1800px;
            transition: transform 0.8s cubic-bezier(0.2, 1, 0.2, 1), opacity 0.5s ease; 
            transform-style: preserve-3d; 
            opacity: 0; 
            pointer-events: none; 
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #b-t.open { opacity: 1; pointer-events: auto; }
        
        #b-v { 
            width: 100%; 
            height: 100%; 
            position: relative; 
            overflow: hidden;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e2e8f0;
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.3);
        }

        #doc-c {
            width: 100%;
            height: 100%;
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -ms-overflow-style: none;
            transition: 0.5s;
        }
        #doc-c::-webkit-scrollbar { display: none; }

        .docx-wrapper {
            background: transparent !important;
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            padding: 40px !important;
            gap: 40px !important;
            height: 100% !important;
            width: max-content !important;
            align-items: center !important;
        }

        .docx-wrapper > section.docx {
            background: white !important;
            width: var(--page-width) !important;
            height: var(--page-height) !important;
            min-height: var(--page-height) !important;
            margin: 0 !important;
            padding: 25mm 30mm !important;
            box-shadow: 
                0 0 1px rgba(0,0,0,0.2),
                0 10px 30px rgba(0,0,0,0.1) !important;
            box-sizing: border-box !important;
            position: relative;
            background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png') !important;
            flex-shrink: 0;
            overflow: hidden;
            display: block !important;
            border-radius: 2px;
            scroll-snap-align: center;
        }

        /* Spine */
        #spine {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 40px;
            transform: translateX(-50%);
            background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0) 100%);
            pointer-events: none;
            z-index: 100;
            mix-blend-mode: multiply;
            display: none;
        }

        @media (min-width: 1100px) {
            #spine { display: block; }
        }

        @media (max-width: 1100px) {
            :root { --page-width: 90vw; --page-height: auto; }
            .docx-wrapper { gap: 20px !important; padding: 20px !important; }
            .docx-wrapper > section.docx { padding: 15mm !important; }
        }

        /* Cover */
        .c-b { 
            position: absolute; 
            z-index: 200; 
            width: 45vh; 
            height: 65vh; 
            transform-style: preserve-3d; 
            transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1); 
            cursor: pointer; 
        }
        .c-v { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            border-radius: 6px; 
            box-shadow: 0 40px 80px rgba(0,0,0,0.4); 
            background: #1e293b; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            padding: 20px;
            text-align: center; 
        }
        
        .a-f-o { animation: fO 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .a-f-c { animation: fC 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        @keyframes fO { 0% { transform: rotateY(0); opacity: 1; } 100% { transform: rotateY(-160deg) translateZ(300px) scale(1.4); opacity: 0; } }
        @keyframes fC { 0% { transform: rotateY(-160deg) translateZ(300px) scale(1.4); opacity: 0; } 100% { transform: rotateY(0); opacity: 1; } }

        #nav-l, #nav-r { position: fixed; top: 0; bottom: 0; width: 20%; z-index: 500; cursor: pointer; }
        #nav-l { left: 0; }
        #nav-r { right: 0; }
        
        .eb-f { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); color: white; padding: 12px 28px; border-radius: 30px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.2); z-index: 100; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); transition: 0.3s; }
        .c-b:hover .eb-f { background: ${accent}; transform: translateX(-50%) scale(1.05); }

        .docx-wrapper section.docx:first-child::before {
            content: "";
            position: absolute;
            left: 0; top: 0; bottom: 0; width: 10px;
            background: linear-gradient(to right, rgba(0,0,0,0.05), transparent);
        }

        /* docx-preview fixes */
        .docx { margin: 0 !important; width: 100% !important; padding: 0 !important; background: transparent !important; }
        .docx p { margin-bottom: 20px !important; line-height: 1.6 !important; }
    `;

    const extraHtml = `
        <div id="ld-doc" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
            </div>
            <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Rendering Document...</p>
        </div>

        <div id="s-c">
            <div id="c-b" class="c-b" onclick="window.openBook()">
                <div class="c-v">
                    ${coverUrl ? '<img src="' + coverUrl + '" style="width:100%;height:100%;object-fit:cover;">' : '<div class="p-8"><span>' + safeTitle + '</span><br/><span class="text-[9px] opacity-40 uppercase tracking-widest mt-4 block">Open Document</span></div>'}
                    <div class="eb-f"><i class="fas fa-book-open"></i> Open</div>
                </div>
            </div>
            <div id="b-t">
                <div id="b-v">
                    <div id="doc-c"></div>
                    <div id="spine"></div>
                </div>
            </div>
        </div>

        <div id="nav-l" onclick="window.prev()"></div>
        <div id="nav-r" onclick="window.next()"></div>
    `;

    const footerHtml = `
        <div class="flex items-center gap-4 py-2">
            <button class="nav-button" onclick="window.prev()" title="Previous Page"><i class="fas fa-chevron-left"></i></button>
            <div class="flex flex-col items-center gap-1">
                <input type="range" class="page-slider" id="ps" min="0" value="0" oninput="window.jumpToPage(this.value)" style="width: 200px;">
                <div class="page-info" id="pi" style="font-size: 10px; opacity: 0.6;">0 / 0</div>
            </div>
            <button class="nav-button" onclick="window.next()" title="Next Page"><i class="fas fa-chevron-right"></i></button>
        </div>
    `;

    const extraScripts = `
        ${COMMON_READER_SCRIPTS}

        let isAnimating = false;
        let currentPage = 0;
        let totalPages = 0;

        async function initDoc() {
            try {
                const res = await fetch(FILE_URL);
                if(!res.ok) throw new Error('Failed to load');
                const blob = await res.blob();
                
                const container = document.getElementById('doc-c');
                
                const opts = { 
                    className: "docx", 
                    inWrapper: true, 
                    ignoreWidth: false, 
                    ignoreHeight: false, 
                    useImageWidth: true,
                    breakPages: true,
                    ignoreLastRenderedPageBreak: false,
                    experimental: true
                };

                await docx.renderAsync(blob, container, null, opts);
                
                // Calculate total pages after rendering
                setTimeout(() => {
                    const sections = container.querySelectorAll('section.docx');
                    totalPages = sections.length;
                    const ps = document.getElementById('ps');
                    if(ps) {
                        ps.max = totalPages - 1;
                    }
                    updatePageInfo();
                }, 800);

                // Hide loading
                document.getElementById('ld-doc').style.display = 'none';
                document.getElementById('loading').style.display = 'none';

                // Table of Contents
                const headers = container.querySelectorAll('h1, h2, h3');
                const indexList = document.getElementById('index-list');
                if(indexList && headers.length) {
                    indexList.innerHTML = '';
                    headers.forEach((h, i) => {
                        h.id = 'h-' + i;
                        const item = document.createElement('div');
                        item.className = 'index-item';
                        item.innerHTML = '<span>' + h.innerText + '</span>';
                        item.onclick = () => {
                            h.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
                            window.toggleIndex();
                        };
                        indexList.appendChild(item);
                    });
                }
            } catch(e) {
                console.error(e);
                document.getElementById('ld-doc').innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i><p class="mt-4">Error Loading Document</p>';
            }
        }

        window.openBook = () => {
            const cb = document.getElementById('c-b');
            const bt = document.getElementById('b-t');
            cb.classList.add('a-f-o');
            setTimeout(() => {
                cb.style.display = 'none';
                bt.classList.add('open');
            }, 800);
        };

        window.prev = () => flip('p');
        window.next = () => flip('n');
        window.jumpToPage = (val) => {
            currentPage = parseInt(val);
            gotoPage(currentPage);
        };

        async function flip(d) {
            if(isAnimating) return;
            const container = document.getElementById('doc-c');
            const sections = container.querySelectorAll('section.docx');
            if(!sections.length) return;

            const isDesktop = window.innerWidth > 1100;
            const step = isDesktop ? 2 : 1;

            if(d === 'p' && currentPage === 0) {
                closeToFront();
                return;
            }

            if(d === 'n' && currentPage >= totalPages - step) return;

            isAnimating = true;
            const bv = document.getElementById('b-v');
            bv.style.transform = d === 'n' ? 'rotateY(10deg)' : 'rotateY(-10deg)';

            const pageIdx = d === 'n' ? currentPage + step : currentPage - step;
            currentPage = Math.max(0, Math.min(totalPages - 1, pageIdx));
            
            gotoPage(currentPage);

            setTimeout(() => {
                bv.style.transform = 'none';
                isAnimating = false;
            }, 600);
        }

        function gotoPage(idx) {
            const container = document.getElementById('doc-c');
            const sections = container.querySelectorAll('section.docx');
            if(sections[idx]) {
                sections[idx].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
            }
            updatePageInfo();
        }

        function updatePageInfo() {
            const pi = document.getElementById('pi');
            const ps = document.getElementById('ps');
            if(pi && totalPages > 0) {
                const isDesktop = window.innerWidth > 1100;
                const end = isDesktop ? Math.min(currentPage + 2, totalPages) : currentPage + 1;
                pi.textContent = (currentPage + 1) + (isDesktop && end > currentPage + 1 ? "-" + end : "") + " / " + totalPages;
                if(ps) ps.value = currentPage;
            }
        }

        function closeToFront() {
            const cb = document.getElementById('c-b');
            const bt = document.getElementById('b-t');
            cb.style.display = 'block';
            bt.classList.remove('open');
            cb.classList.remove('a-f-o');
            cb.classList.add('a-f-c');
            setTimeout(() => cb.classList.remove('a-f-c'), 1200);
        }

        initDoc();
    `;

    return getViewerBase({
        title,
        fileUrl: file_url,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: true,
        showZoom: false,
        showWebViewLink: true,
        showFullMode: true,
        showNightShift: true,
        extraStyles,
        extraHtml,
        extraScripts,
        footerHtml,
        dependencies: [
            'https://unpkg.com/jszip/dist/jszip.min.js',
            'https://unpkg.com/docx-preview/dist/docx-preview.min.js'
        ]
    });
}
