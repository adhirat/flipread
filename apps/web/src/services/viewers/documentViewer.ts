import { getViewerBase } from './viewerBase';
import { escapeHtml, COMMON_READER_SCRIPTS } from './viewerUtils';

export function documentViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'SHOPUBLISH'): string {
    const bg = (settings.background as string) || '#ffffff';
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);

    const extraStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

        :root {
            --reader-bg: ${bg};
            --reader-accent: ${accent};
        }

        /* Stage and Book Stage */
        #s-c { 
            position: absolute; 
            inset: 60px 0 80px 0; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            perspective: 3500px; 
            overflow: hidden; 
            width: 100%; 
            z-index: 50;
        }
        body.full-mode #s-c { inset: 0 !important; height: 100dvh !important; }

        #b-t { 
            position: relative; 
            width: 95%; 
            height: 90%; 
            max-width: 1300px;
            transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease; 
            transform-style: preserve-3d; 
            opacity: 0; 
            pointer-events: none; 
            display: flex;
        }
        #b-t.open { opacity: 1; pointer-events: auto; }
        
        #b-v { 
            width: 100%; 
            height: 100%; 
            background: #e5e7eb; 
            box-shadow: 0 40px 100px rgba(0,0,0,0.3); 
            position: relative; 
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* A4 Page Canvas Styling */
        .docx-wrapper {
            background: transparent !important;
            padding: 40px 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 30px !important;
            width: 100% !important;
        }

        .docx-wrapper > section.docx {
            background: white !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            padding: 20mm 25mm !important;
            box-shadow: 
                0 0 1px rgba(0,0,0,0.2),
                0 10px 40px rgba(0,0,0,0.1) !important;
            box-sizing: border-box !important;
            position: relative;
            background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png') !important;
        }

        @media (min-width: 1100px) {
            .docx-wrapper {
                flex-direction: row !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                padding: 60px 40px !important;
            }
        }

        @media (max-width: 210mm) {
            .docx-wrapper > section.docx {
                width: 92vw !important;
                padding: 15mm !important;
                min-height: auto !important;
            }
        }

        /* Middle Crease / Spine Effect - only for book look */
        #b-v::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            background: rgba(0,0,0,0.05);
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
            z-index: 20;
            pointer-events: none;
            display: none; /* Hidden by default in canvas mode */
        }

        /* docx-preview fixes */
        .docx { margin: 0 !important; width: 100% !important; padding: 0 !important; background: transparent !important; }
        .docx p { margin-bottom: 20px !important; line-height: 1.6 !important; }

        /* Cover Flipping */
        .c-b { 
            position: absolute; 
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 200; 
            width: 40vh; 
            height: 60vh; 
            transform-style: preserve-3d; 
            transition: transform 1s cubic-bezier(0.645, 0.045, 0.355, 1); 
            cursor: pointer; 
            border: none !important; 
        }
        .c-v { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            border-radius: 8px; 
            box-shadow: 0 30px 60px rgba(0,0,0,0.4); 
            background: #2c3e50; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            text-align: center; 
            font-weight: bold; 
            overflow: hidden; 
        }
        
        .a-f-o { animation: fO 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; pointer-events: none; }
        .a-f-c { animation: fC 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; }

        @keyframes fO { 0% { transform: translate(-50%, -50%) rotateY(0); opacity: 1; } 40% { transform: translate(-80%, -50%) rotateY(-60deg) translateZ(50px); opacity: 1; } 100% { transform: translate(-100%, -50%) rotateY(-180deg) translateZ(200px) scale(1.1); opacity: 0; } }
        @keyframes fC { 0% { transform: translate(-100%, -50%) rotateY(-180deg) translateZ(200px) scale(1.1); opacity: 0; } 60% { transform: translate(-80%, -50%) rotateY(-60deg) translateZ(50px); opacity: 1; } 100% { transform: translate(-50%, -50%) rotateY(0); opacity: 1; } }

        #nav-l, #nav-r { position: fixed; top: 100px; bottom: 100px; width: 15%; z-index: 600; cursor: pointer; }
        #nav-l { left: 0; }
        #nav-r { right: 0; }

        .eb-f { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); color: white; padding: 12px 28px; border-radius: 30px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.2); z-index: 100; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); transition: 0.3s; }
        .c-b:hover .eb-f { background: ${accent}; transform: translateX(-50%) scale(1.05); }

        /* Night Shift */
        body.night-shift { filter: sepia(0.6) brightness(0.9); }
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
                </div>
            </div>
        </div>

        <div id="nav-l" onclick="window.prev()"></div>
        <div id="nav-r" onclick="window.next()"></div>
    `;

    const extraScripts = `
        ${COMMON_READER_SCRIPTS}

        async function initDoc() {
            try {
                // Use FILE_URL and TITLE from global scope (injected by viewerBase)
                const res = await fetch(FILE_URL);
                if(!res.ok) throw new Error('Failed to load');
                const blob = await res.blob();
                
                const isOdt = FILE_URL.match(/\\.odt$/i) || TITLE.match(/\\.odt$/i);
                
                const container = document.getElementById('doc-c');
                if (isOdt) {
                    await docx.renderAsync(blob, container, null, { className: "docx" });
                } else {
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
                }
                
                // Hide both loading popups
                const ldDoc = document.getElementById('ld-doc');
                if(ldDoc) ldDoc.style.display = 'none';
                const globalLd = document.getElementById('loading');
                if(globalLd) globalLd.style.display = 'none';
            } catch(e) {
                console.error(e);
                const ld = document.getElementById('ld-doc');
                if(ld) {
                    ld.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i><p class="mt-4">Error Loading Document</p>';
                }
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

        window.prev = () => {
            const bv = document.getElementById('b-v');
            if(bv.scrollTop === 0) {
                closeToFront();
            } else {
                bv.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
            }
        };

        window.next = () => {
            const bv = document.getElementById('b-v');
            bv.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
        };

        function closeToFront() {
            const cb = document.getElementById('c-b');
            const bt = document.getElementById('b-t');
            cb.style.display = 'block';
            bt.classList.remove('open');
            cb.classList.remove('a-f-o');
            cb.classList.add('a-f-c');
            setTimeout(() => cb.classList.remove('a-f-c'), 1200);
        }

        // Night Shift
        window.toggleNight = () => {
            const active = document.body.classList.toggle('night-shift');
            const btn = document.getElementById('ns-toggle');
            if(btn) btn.innerText = active ? 'ON' : 'OFF';
            window.setReaderSetting('ns', active);
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

