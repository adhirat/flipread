
import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function documentViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = ''): string {
    const safeTitle = escapeHtml(title);

    const extraStyles = `
        #doc-v { width: 100%; height: 100%; overflow: auto; display: flex; justify-content: center; padding: 40px 20px; -webkit-overflow-scrolling: touch; }
        #doc-c { background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.15); padding: 50px; min-height: 1000px; transform-origin: top center; transition: transform 0.2s; margin-bottom: 100px; border-radius: 4px; }
        
        .side-nav { position: fixed; top: 50%; transform: translateY(-50%); z-index: 1000; width: 44px; height: 44px; background: rgba(0,0,0,0.2); border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.3; transition: 0.3s; }
        .side-nav:hover { opacity: 1; background: rgba(0,0,0,0.4); }
        #side-prev { left: 24px; }
        #side-next { right: 24px; }

        @media (max-width: 768px) {
            #doc-v { padding: 20px 10px; }
            #doc-c { width: 100%; padding: 20px; box-shadow: none; }
            .side-nav { display: none; }
        }
    `;

    const extraHtml = `
        <div id="ld-doc" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60 mt-4">Rendering Document...</p>
        </div>

        <div id="doc-v">
            <div id="doc-c"></div>
        </div>
        
        <button id="side-prev" class="side-nav" onclick="prevDoc()"><i class="fas fa-chevron-left"></i></button>
        <button id="side-next" class="side-nav" onclick="nextDoc()"><i class="fas fa-chevron-right"></i></button>
    `;

    const extraScripts = `
        let zoom = 1;

        async function initDoc() {
            try {
                const res = await fetch(FILE_URL);
                if(!res.ok) throw new Error('Failed to load');
                const blob = await res.blob();
                
                const opts = { className: "docx", inWrapper: false, ignoreWidth: false, ignoreHeight: false };
                await docx.renderAsync(blob, document.getElementById('doc-c'), null, opts);
                
                const ld = document.getElementById('ld-doc');
                if(ld) { ld.style.opacity='0'; setTimeout(()=>ld.style.display='none', 500); }
            } catch(e) {
                console.error(e);
                const ld = document.getElementById('ld-doc');
                if(ld) ld.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i><p class="mt-4">Error Loading Document</p>';
            }
        }

        function applyZoom() {
            document.getElementById('doc-c').style.transform = 'scale(' + zoom + ')';
            const ztxt = document.getElementById('zoom-text');
            if(ztxt) ztxt.textContent = Math.round(zoom * 100) + '%';
        }

        const zi = document.getElementById('zoom-in');
        const zo = document.getElementById('zoom-out');
        if(zi) zi.onclick = () => { zoom = Math.min(zoom + 0.1, 3); applyZoom(); };
        if(zo) zo.onclick = () => { zoom = Math.max(zoom - 0.1, 0.5); applyZoom(); };

        window.prevDoc = () => {
            const container = document.getElementById('doc-v');
            const pages = document.getElementById('doc-c').children;
            if(pages.length > 0) {
                let current = 0;
                const sTop = container.scrollTop;
                for(let i=0; i<pages.length; i++) if(pages[i].offsetTop - 100 <= sTop) current = i;
                if(current > 0) pages[current-1].scrollIntoView({behavior: 'smooth'});
            }
        };

        window.nextDoc = () => {
            const container = document.getElementById('doc-v');
            const pages = document.getElementById('doc-c').children;
            if(pages.length > 0) {
                let current = 0;
                const sTop = container.scrollTop;
                for(let i=0; i<pages.length; i++) if(pages[i].offsetTop - 100 <= sTop) current = i;
                if(current < pages.length - 1) pages[current+1].scrollIntoView({behavior: 'smooth'});
            }
        };

        initDoc();
    `;

    return getViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl,
        extraStyles,
        extraHtml,
        footerHtml: '',
        extraScripts,
        settingsHtml: '',
        dependencies: [
            'https://unpkg.com/jszip/dist/jszip.min.js',
            'https://unpkg.com/docx-preview/dist/docx-preview.min.js'
        ],
        showZoom: true,
        showWebViewLink: true
    });
}
