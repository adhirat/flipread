import { getWebViewerBase } from './webViewerBase';

export function docxWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'ShoPublish'): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: true,
        showFullMode: true,
        showNightShift: true,
        dependencies: [
            'https://unpkg.com/jszip/dist/jszip.min.js',
            'https://unpkg.com/docx-preview/dist/docx-preview.min.js'
        ],
        extraStyles: `
            body {
                background: #eef2f6;
                background-image: 
                    radial-gradient(#d1d5db 0.8px, transparent 0.8px), 
                    radial-gradient(#d1d5db 0.8px, #eef2f6 0.8px);
                background-size: 24px 24px;
                background-position: 0 0, 12px 12px;
            }
            #content-wrapper { 
                padding: 60px 0 120px 0; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                background: #f3f4f6;
            }
            
            #docx-container {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            /* Standard A4 Page Layout */
            .docx-wrapper {
                background: transparent !important;
                padding: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                gap: 40px !important;
                width: 100% !important;
            }

            .docx-wrapper > section.docx {
                background: white !important;
                width: 210mm !important;
                min-height: 297mm !important;
                margin: 0 !important;
                padding: 20mm 25mm !important; /* Standard Word Margins */
                box-shadow: 
                    0 0 1px rgba(0,0,0,0.15),
                    0 10px 30px rgba(0,0,0,0.08),
                    0 30px 70px rgba(0,0,0,0.1) !important;
                border: none !important;
                position: relative;
                box-sizing: border-box !important;
                background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png') !important;
                transition: transform 0.3s ease;
                border-radius: 2px;
                overflow: hidden;
            }
            
            @media (max-width: 210mm) {
                .docx-wrapper > section.docx {
                    width: 95vw !important;
                    padding: 15mm !important;
                    min-height: auto !important;
                }
            }

            .docx-wrapper > section.docx:hover {
                transform: translateY(-5px);
                box-shadow: 0 40px 100px rgba(0,0,0,0.15) !important;
            }

            /* Typography refinement for A4 feel */
            .docx p { line-height: 1.6 !important; margin-bottom: 1em !important; }

            #settings-btn { display: none !important; }
        `,
        extraScripts: `
            async function init() {
                try {
                    const res = await fetch(FU);
                    if(!res.ok) throw new Error('Failed to load');
                    const blob = await res.blob();
                    
                    const container = document.getElementById('content-wrapper');
                    const docxDiv = document.createElement('div');
                    docxDiv.id = 'docx-container';
                    container.appendChild(docxDiv);

                    await docx.renderAsync(blob, docxDiv, null, {
                        className: "docx",
                        inWrapper: true,
                        ignoreWidth: false,
                        ignoreHeight: false, 
                        breakPages: true,
                        ignoreLastRenderedPageBreak: false,
                        experimental: true,
                        debug: false
                    });
                    
                    // Hide loading popups
                    const ld = document.getElementById('ld');
                    if(ld) ld.style.display = 'none';
                    const globalLd = document.getElementById('loading');
                    if(globalLd) globalLd.style.display = 'none';

                    // ToC Logic
                    setTimeout(() => {
                        const headers = docxDiv.querySelectorAll('h1, h2, h3');
                        const tocList = document.getElementById('toc-list');
                        if(tocList) {
                            tocList.innerHTML = '';
                            if(headers.length === 0) {
                                tocList.innerHTML = '<div class="p-4 text-xs opacity-50 text-center">No sections found.</div>';
                                return;
                            }
                            headers.forEach((h, i) => {
                                const id = 'h-' + i;
                                h.id = id;
                                const item = document.createElement('div');
                                item.className = 'toc-item text-gray-700 hover:text-indigo-600';
                                item.style.paddingLeft = (h.tagName === 'H1' ? '12px' : h.tagName === 'H2' ? '24px' : '36px');
                                item.innerHTML = '<span class="truncate">' + h.innerText + '</span>';
                                item.onclick = () => {
                                    h.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    if(window.toggleTOC) window.toggleTOC();
                                    else document.getElementById('toc-menu').classList.remove('open');
                                };
                                tocList.appendChild(item);
                            });
                        }
                    }, 800);
                } catch(e) {
                    console.error(e);
                    const ld = document.getElementById('ld');
                    if(ld) ld.innerHTML = '<div class="text-red-500 font-bold uppercase tracking-widest text-[10px]">Failed to render document</div>';
                }
            }

            // TTS Logic
            let syn = window.speechSynthesis, utter, speaking=false, ttsPaused=false;
            window.toggleTTS = () => { if(speaking || ttsPaused) stopTTS(); else startTTS(); };
            window.togglePlayPauseTTS = () => { if(syn.paused) { syn.resume(); ttsPaused=false; speaking=true; } else { syn.pause(); ttsPaused=true; speaking=false; } updateTTSUI(); };
            window.stopTTS = () => { syn.cancel(); speaking=false; ttsPaused=false; document.getElementById('tts-ctrls')?.classList.add('hidden'); updateTTSUI(); };
            
            function startTTS() {
                const text = document.getElementById('docx-container')?.innerText;
                if(!text) return;
                utter = new SpeechSynthesisUtterance(text);
                utter.onend = stopTTS;
                utter.onstart = () => { speaking=true; ttsPaused=false; updateTTSUI(); };
                syn.cancel();
                setTimeout(() => syn.speak(utter), 100);
                document.getElementById('tts-ctrls')?.classList.remove('hidden');
            }
            
            function updateTTSUI() {
                const pp = document.getElementById('tts-pp-i');
                if(pp) pp.className = ttsPaused ? 'fas fa-play' : 'fas fa-pause';
                const btn = document.getElementById('tts-btn');
                if(btn) {
                    btn.classList.toggle('bg-green-600', speaking);
                    btn.classList.toggle('bg-yellow-600', ttsPaused);
                }
            }

            init();
        `
    });
}
