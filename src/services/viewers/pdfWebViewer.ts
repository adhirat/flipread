
import { getWebViewerBase } from './webViewerBase';

export function pdfWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    const accent = (settings.accent_color as string) || '#4f46e5';

    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: false,
        showFullMode: false,
        showNightShift: true,
        dependencies: [
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
        ],
        showZoom: false,
        showHighlights: false,
        extraStyles: `
            /* Hide zoom controls */
            #zoom-controls, .zoom-controls { display: none !important; }
            
            /* Hide desktop footer if any */
            @media (min-width: 769px) { #main-footer { display: none !important; } }

            #content-wrapper { width: 100%; max-width: 900px; margin: 0 auto; min-height: 100vh; position: relative; transition: filter 0.3s ease; }
            .page-content canvas { border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.3s ease; }
            
            .textLayer {
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                overflow: hidden;
                opacity: 0.2;
                line-height: 1.0;
                pointer-events: none;
            }
            .textLayer > span {
                color: transparent;
                position: absolute;
                white-space: pre;
                cursor: text;
                transform-origin: 0% 0%;
            }

            /* Modern Settings Styles */
            .set-section { margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.06); }
            .set-label-group { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; color: #888; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; }
            .set-label-group i { font-size: 14px; opacity: 0.5; }

            .set-opt-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; min-height: 44px; width: 100%; gap: 15px; }
            .set-label { font-size: 14px; font-weight: 500; color: #444; flex: 1; text-align: left; }

            .modern-stepper { display: flex; align-items: center; background: rgba(0,0,0,0.04); border-radius: 16px; padding: 4px; border: 1px solid rgba(0,0,0,0.08); width: fit-content; flex-shrink: 0; }
            .modern-stepper button { width: 34px; height: 34px; border-radius: 12px; border: none; background: white; color: #111; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
            .modern-stepper button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
            .modern-stepper span { font-size: 13px; font-weight: 800; min-width: 60px; text-align: center; color: #111; }
            
            .modern-toggle { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); color: #333; padding: 10px 22px; border-radius: 25px; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); width: auto; line-height: 1; letter-spacing: 0.8px; flex-shrink: 0; }

            body.night-shift #content-wrapper { filter: sepia(0.6) brightness(0.9) contrast(0.95); }
            
            #set-m-c { border-top-left-radius: 36px; border-bottom-left-radius: 36px; overflow: hidden; width: 360px; box-shadow: -20px 0 60px rgba(0,0,0,0.15); }
            @media (max-width: 640px) { #set-m-c { border-radius: 0; width: 100% !important; max-width: 100vw !important; } }
            
            .appearance-label { font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
            .appearance-label::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.04); }
        `,
        settingsHtml: `
            <div id="set-m" onclick="toggleSettings()">
                <div id="set-m-c" onclick="event.stopPropagation()">
                    <div class="set-m-h" style="padding: 28px 28px 20px 28px; border-bottom: 1px solid rgba(0,0,0,0.04);">
                        <div style="font-weight:900; text-transform:uppercase; letter-spacing:2px; font-size:14px; color:#111; display:flex; align-items:center; gap:10px;">
                            <i class="fas fa-sliders-h" style="font-size: 16px; color: ${accent};"></i>
                            Reader Settings
                        </div>
                        <button class="header-icon" onclick="toggleSettings()" style="width:40px; height:40px; color:#555; background:rgba(0,0,0,0.05); border:none; font-size: 14px; border-radius: 50%; transition: 0.3s;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="set-m-b" style="padding: 28px; overflow-y: overlay;">
                        <span class="appearance-label">Canvas Control</span>
                        
                        <div class="set-opt-row">
                            <span class="set-label">Zoom level</span>
                            <div class="modern-stepper">
                                <button onclick="window.changeZoom(-0.1)"><i class="fas fa-minus"></i></button>
                                <span id="zoom-v">1.5x</span>
                                <button onclick="window.changeZoom(0.1)"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>

                        <div class="set-section">
                            <div class="set-label-group">
                                <i class="fas fa-wind"></i>
                                <span>Immersion</span>
                            </div>

                            <div class="set-opt-row">
                                <span class="set-label">Reading Tint</span>
                                <button id="ns-toggle" onclick="window.toggleNight()" class="modern-toggle">OFF</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        extraScripts: `
            let pdfScale = 1.5;
            let syn = window.speechSynthesis;
            let utter = null;
            let speaking = false;
            let ttsPaused = false;
            let currentPdfBlob = FU;

            window.init = async () => {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    await renderPDF(FU);
                    setupHeaderZoom();

                    const sn = localStorage.getItem('fr_web_ns_pdf');
                    if(sn === 'true') {
                        document.body.classList.add('night-shift');
                        const nsToggle = document.getElementById('ns-toggle');
                        if(nsToggle) { 
                            nsToggle.innerText = 'ON'; 
                            if(typeof accent !== 'undefined') {
                                nsToggle.style.background = '${accent}'; 
                                nsToggle.style.color = 'white'; 
                                nsToggle.style.borderColor = 'transparent';
                            }
                        }
                    }

                    const ld = document.getElementById('ld');
                    if(ld) {
                        ld.style.opacity = '0';
                        setTimeout(() => ld.style.display = 'none', 500);
                    }
                } catch(e) {
                    console.error(e);
                    const ld = document.getElementById('ld');
                    if(ld) ld.innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            };

            let pdfDoc = null;
            let pageStates = new Map(); 
            let observer = null;
            let activePages = new Set();
            const MAX_ACTIVE = 6;

            async function renderPDF(source) {
                if (pdfDoc) {
                    try { await pdfDoc.destroy(); } catch(e) {}
                }
                if (observer) observer.disconnect();
                
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                
                pdfDoc = await pdfjsLib.getDocument({
                    url: source,
                    disableAutoFetch: true,
                    disableStream: false,
                    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
                    cMapPacked: true,
                }).promise;

                const container = document.getElementById('content-wrapper');
                const tocList = document.getElementById('toc-list');
                if(tocList) tocList.innerHTML = '';
                if(container) container.innerHTML = '';
                pageStates.clear();
                activePages.clear();

                observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        const pageIdx = parseInt(entry.target.getAttribute('data-page'));
                        if (entry.isIntersecting) {
                            renderPageOnDemand(pageIdx);
                        }
                    });
                }, { rootMargin: '200% 0px 200% 0px', threshold: 0 });

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    const section = document.createElement('div');
                    section.id = 'page-' + i;
                    section.className = 'page-content mb-12 flex flex-col items-center relative';
                    section.setAttribute('data-page', i);
                    section.style.minHeight = '500px'; 
                    
                    const head = document.createElement('div');
                    head.className = 'section-header mb-4';
                    head.innerHTML = '<div class="pg-elegant text-xs opacity-40">' + i + '</div>';
                    section.appendChild(head);

                    const canvasWrapper = document.createElement('div');
                    canvasWrapper.className = 'canvas-wrapper relative shadow-2xl rounded-sm overflow-hidden';
                    canvasWrapper.style.minWidth = '200px';
                    canvasWrapper.style.minHeight = '300px';
                    
                    section.appendChild(canvasWrapper);
                    if(container) container.appendChild(section);
                    observer.observe(section);

                    if(tocList) {
                        const item = document.createElement('div');
                        item.className = 'toc-item';
                        item.innerText = 'Page ' + i;
                        item.onclick = () => {  
                            const p = document.getElementById('page-'+i);
                            if(p) p.scrollIntoView({behavior:'smooth'});
                            if(typeof toggleTOC === 'function') toggleTOC();
                        };
                        tocList.appendChild(item);
                    }
                    
                    pageStates.set(i, { status: 'empty' });
                }

                try {
                    const firstPage = await pdfDoc.getPage(1);
                    const vp = firstPage.getViewport({ scale: pdfScale });
                    const ratio = vp.height / vp.width;
                    const containerWidth = container ? container.clientWidth : 900;
                    const w = Math.min(window.innerWidth - 40, containerWidth);
                    
                    document.querySelectorAll('.page-content').forEach(s => {
                        s.style.minHeight = (w * ratio) + 'px';
                        const cw = s.querySelector('.canvas-wrapper');
                        if(cw) {
                            cw.style.width = w + 'px';
                            cw.style.height = (w * ratio) + 'px';
                        }
                    });
                } catch(e) { console.error("Error setting aspect ratios:", e); }
            }

            async function renderPageOnDemand(i) {
                const state = pageStates.get(i);
                if (!state || state.status === 'rendered' || state.status === 'loading') return;

                if (activePages.size >= MAX_ACTIVE) {
                    let furthestPage = -1;
                    let maxDist = -1;
                    activePages.forEach(p => {
                        const dist = Math.abs(p - i);
                        if (dist > maxDist) {
                            maxDist = dist;
                            furthestPage = p;
                        }
                    });
                    if (furthestPage !== -1) purgePage(furthestPage);
                }

                pageStates.set(i, { status: 'loading' });
                activePages.add(i);

                try {
                    const page = await pdfDoc.getPage(i);
                    const section = document.getElementById('page-' + i);
                    if (!section) return;
                    const wrapper = section.querySelector('.canvas-wrapper');
                    
                    const vp = page.getViewport({ scale: pdfScale });
                    const canvas = document.createElement('canvas');
                    canvas.className = 'max-w-full h-auto block';
                    canvas.width = vp.width;
                    canvas.height = vp.height;
                    wrapper.appendChild(canvas);

                    const textLayer = document.createElement('div');
                    textLayer.className = 'textLayer absolute inset-0';
                    wrapper.appendChild(textLayer);

                    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
                    
                    const textContent = await page.getTextContent();
                    pdfjsLib.renderTextLayer({
                        textContent: textContent,
                        container: textLayer,
                        viewport: vp,
                        textDivs: []
                    });

                    pageStates.set(i, { status: 'rendered', canvas, textLayer });
                    page.cleanup();
                    pdfDoc.cleanup();
                } catch (e) {
                    console.error("Error rendering page " + i, e);
                    pageStates.set(i, { status: 'empty' });
                    activePages.delete(i);
                }
            }

            function purgePage(i) {
                const state = pageStates.get(i);
                if (!state || (state.status !== 'rendered' && state.status !== 'loading')) return;

                const section = document.getElementById('page-' + i);
                if (section) {
                    if (state.canvas) {
                        state.canvas.width = 0;
                        state.canvas.height = 0;
                        state.canvas.remove();
                    }
                    if (state.textLayer) state.textLayer.remove();
                }
                
                activePages.delete(i);
                pageStates.set(i, { status: 'empty' });
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                if(!m) return;
                const isOpen = m.classList.toggle('o');
                document.body.style.overflow = isOpen ? 'hidden' : '';

                const hdr = document.getElementById('main-header');
                const ftr = document.getElementById('main-footer');
                if(hdr) { hdr.classList.remove('down'); hdr.classList.add('up'); }
                if(ftr) { ftr.classList.remove('down'); ftr.classList.add('up'); }
            };

            window.changeZoom = (d) => {
                pdfScale = Math.max(0.5, Math.min(3.0, pdfScale + d));
                const txt = pdfScale.toFixed(1) + 'x';
                const el1 = document.getElementById('zoom-v');
                const el2 = document.getElementById('zoom-v-hdr');
                if(el1) el1.textContent = txt;
                if(el2) el2.textContent = txt;
                if(currentPdfBlob) renderPDF(currentPdfBlob);
            };

            window.toggleNight = () => {
                const active = document.body.classList.toggle('night-shift');
                localStorage.setItem('fr_web_ns_pdf', active);
                const btn = document.getElementById('ns-toggle');
                if(btn) {
                    btn.innerText = active ? 'ON' : 'OFF';
                    btn.style.background = active ? '${accent}' : 'rgba(0,0,0,0.04)';
                    btn.style.color = active ? 'white' : '#333';
                    btn.style.borderColor = active ? 'transparent' : 'rgba(0,0,0,0.08)';
                }
            };

            function setupHeaderZoom() {
                const zi = document.getElementById('zoom-in');
                const zo = document.getElementById('zoom-out');
                if(zi) zi.onclick = () => window.changeZoom(0.1);
                if(zo) zo.onclick = () => window.changeZoom(-0.1);
                const hdrV = document.getElementById('zoom-v-hdr');
                if(hdrV) hdrV.textContent = pdfScale.toFixed(1) + 'x';
            }

            window.toggleTTS = () => { if(speaking || ttsPaused) stopTTS(); else startTTS(); };
            window.startTTS = () => {
                const layers = document.querySelectorAll('.textLayer');
                let text = '';
                layers.forEach(layer => { text += layer.innerText + ' '; });
                if(!text.trim()) {
                    layers.forEach(layer => {
                        const spans = layer.querySelectorAll('span');
                        spans.forEach(s => text += s.innerText + ' ');
                    });
                }
                if(!text.trim()) return;
                utter = new SpeechSynthesisUtterance(text);
                utter.onend = () => { stopTTS(); };
                utter.onstart = () => { speaking = true; ttsPaused = false; updateTTSUI(); };
                syn.cancel(); 
                setTimeout(() => { syn.resume(); syn.speak(utter); }, 100);
                const ctrls = document.getElementById('tts-ctrls');
                if(ctrls) ctrls.classList.remove('hidden');
            };
            window.togglePlayPauseTTS = () => {
                if (syn.paused) { syn.resume(); ttsPaused = false; speaking = true; }
                else { syn.pause(); ttsPaused = true; speaking = false; }
                updateTTSUI();
            };
            window.stopTTS = () => {
                syn.cancel(); speaking = false; ttsPaused = false;
                const ctrls = document.getElementById('tts-ctrls');
                if(ctrls) ctrls.classList.add('hidden');
                updateTTSUI();
            };
            window.updateTTSUI = () => {
                const pp = document.getElementById('tts-pp-i');
                const btn = document.getElementById('tts-btn');
                if (pp) pp.className = ttsPaused ? 'fas fa-play' : 'fas fa-pause';
                if (btn) {
                    btn.classList.toggle('tts-playing', speaking);
                    btn.classList.toggle('tts-paused', ttsPaused);
                }
            };
        `
    });
}
