import { getWebViewerBase } from './webViewerBase';

export function docxWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
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
                padding: 100px 0 200px 0; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
            }
            
            #docx-container {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            /* Customizing docx-preview output */
            .docx-wrapper {
                background: transparent !important;
                padding: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                gap: 60px !important;
                width: 100% !important;
            }

            .docx-wrapper > section.docx {
                background: white !important;
                box-shadow: 
                    0 10px 30px rgba(0,0,0,0.05),
                    0 1px 8px rgba(0,0,0,0.1),
                    0 40px 100px rgba(0,0,0,0.08) !important;
                margin-bottom: 0 !important;
                border: 1px solid rgba(0,0,0,0.05) !important;
                position: relative;
                width: 850px !important;
                max-width: 95vw !important;
                min-height: 1100px;
                padding: 90px !important;
                background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png') !important;
                box-sizing: border-box !important;
                transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                border-radius: 2px;
            }
            
            .docx-wrapper > section.docx:hover {
                transform: translateY(-8px) scale(1.01);
                box-shadow: 0 50px 120px rgba(0,0,0,0.12) !important;
            }

            /* Fix for paragraphs and content spacing inside pages */
            .docx p { margin-bottom: 1.25em !important; line-height: 1.6 !important; }
            .docx h1, .docx h2, .docx h3 { margin-top: 1.5em !important; margin-bottom: 0.75em !important; }

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
