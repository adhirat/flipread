import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function documentViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);

    const extraStyles = `
        #doc-v { width: 100%; height: 100%; overflow: auto; display: flex; justify-content: center; padding: 60px 20px; -webkit-overflow-scrolling: touch; }
        #doc-c { background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.15); padding: 50px; min-height: 1000px; transform-origin: top center; transition: transform 0.2s; margin-bottom: 100px; border-radius: 4px; width: 100%; max-width: 850px; }
        
        .side-nav { position: fixed; top: 50%; transform: translateY(-50%); z-index: 1000; width: 44px; height: 44px; background: rgba(0,0,0,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.3; transition: 0.3s; }
        .side-nav:hover { opacity: 1; background: rgba(0,0,0,0.15); transform: translateY(-50%) scale(1.1); }
        #side-prev { left: 24px; }
        #side-next { right: 24px; }

        body.light-ui .side-nav { background: rgba(0,0,0,0.05); color: #000; border-color: rgba(0,0,0,0.1); }
        body.light-ui .side-nav:hover { background: rgba(0,0,0,0.1); }

        @media (max-width: 768px) {
            #doc-v { padding: 40px 10px; }
            #doc-c { width: 95%; padding: 20px; box-shadow: none; }
            .side-nav { display: none; }
        }
        
        /* docx-preview fixes */
        .docx { margin: 0 auto !important; width: 100% !important; }
    `;

    const extraHtml = `
        <div id="ld-doc" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
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
        async function initDoc() {
            try {
                const res = await fetch(FILE_URL);
                if(!res.ok) throw new Error('Failed to load');
                const blob = await res.blob();
                
                const isOdt = FILE_URL.match(/\\.odt$/i) || TITLE.match(/\\.odt$/i);
                
                if (isOdt) {
                    // ODT rendering logic could be added here if a library is found.
                    // For now, we attempt rendering with docx-preview as a fallback or show error.
                    await docx.renderAsync(blob, document.getElementById('doc-c'), null, { className: "docx" });
                } else {
                    const opts = { className: "docx", inWrapper: false, ignoreWidth: false, ignoreHeight: false };
                    await docx.renderAsync(blob, document.getElementById('doc-c'), null, opts);
                }
                
                const ld = document.getElementById('ld-doc');
                if(ld) { ld.style.opacity='0'; setTimeout(()=>ld.style.display='none', 500); }
            } catch(e) {
                console.error(e);
                const ld = document.getElementById('ld-doc');
                const isOdt = FILE_URL.match(/\\.odt$/i) || TITLE.match(/\\.odt$/i);
                if(ld) {
                    ld.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i><p class="mt-4">' + (isOdt ? 'ODT Rendering Limited' : 'Error Loading Document') + '</p>';
                }
            }
        }

        // Override applyZoom
        const baseApplyZoom = window.applyZoom;
        window.applyZoom = () => {
            if(typeof baseApplyZoom === 'function') baseApplyZoom();
            const c = document.getElementById('doc-c');
            if(c) c.style.transform = 'scale(' + (window.zoom || 1) + ')';
        };

        window.prevDoc = () => {
            const container = document.getElementById('doc-v');
            container.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
        };

        window.nextDoc = () => {
            const container = document.getElementById('doc-v');
            container.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
        };
        
        // Touch Swiping
        let ts=0, ty=0;
        document.addEventListener('touchstart', e => { ts = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive: true});
        document.addEventListener('touchend', e => {
            if(!ts || (window.zoom || 1) > 1) return;
            const te = e.changedTouches[0].clientX;
            const tye = e.changedTouches[0].clientY;
            const dx = ts - te;
            const dy = ty - tye;
            
            if(Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
                const el = e.target.closest('#chat-w') || e.target.closest('.modal-c');
                if(!el) {
                    if(dx > 0) nextDoc();
                    else if(dx < 0) prevDoc();
                }
            }
            ts = 0; ty = 0;
        }, {passive: true});

        initDoc();
    `;

    return getViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: true,
        showZoom: true,
        showWebViewLink: true,
        showFullMode: true,
        showNightShift: true,
        extraStyles,
        extraHtml,
        extraScripts,
        dependencies: [
            'https://unpkg.com/jszip/dist/jszip.min.js',
            'https://unpkg.com/docx-preview/dist/docx-preview.min.js'
        ]
    });
}
