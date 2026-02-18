
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
            let currentPdfBlob = null;

            async function init() {
                try {
                    injectFullscreen();
                    document.getElementById('settings-btn').style.display = 'flex';
                    
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    await renderPDF(blob);

                    // Initial state from localstorage
                    const sn = localStorage.getItem('fr_web_ns_pdf');
                    if(sn === 'true') {
                        document.body.classList.add('night-shift');
                        const nsToggle = document.getElementById('ns-toggle');
                        if(nsToggle) { 
                            nsToggle.innerText = 'ON'; 
                            nsToggle.style.background = '${accent}'; 
                            nsToggle.style.color = 'white'; 
                            nsToggle.style.borderColor = 'transparent';
                        }
                    }

                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            async function renderPDF(blob) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                const data = await blob.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(data).promise;
                const container = document.getElementById('content-wrapper');
                const tocList = document.getElementById('toc-list');
                tocList.innerHTML = '';
                container.innerHTML = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const section = document.createElement('div');
                    section.id = 'page-' + i;
                    section.className = 'page-content mb-12 flex flex-col items-center relative';
                    
                    const head = document.createElement('div');
                    head.className = 'section-header mb-4';
                    head.innerHTML = '<div class="pg-elegant text-xs opacity-40">' + i + '</div>';
                    section.appendChild(head);

                    const canvasWrapper = document.createElement('div');
                    canvasWrapper.className = 'relative shadow-2xl rounded-sm overflow-hidden';
                    
                    const canvas = document.createElement('canvas');
                    canvas.className = 'max-w-full h-auto block';
                    canvasWrapper.appendChild(canvas);
                    
                    const textLayer = document.createElement('div');
                    textLayer.className = 'textLayer absolute inset-0';
                    canvasWrapper.appendChild(textLayer);
                    
                    section.appendChild(canvasWrapper);
                    container.appendChild(section);

                    pdf.getPage(i).then(async (page) => {
                        const vp = page.getViewport({ scale: pdfScale });
                        canvas.width = vp.width;
                        canvas.height = vp.height;
                        
                        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
                        
                        const textContent = await page.getTextContent();
                        pdfjsLib.renderTextLayer({
                            textContent: textContent,
                            container: textLayer,
                            viewport: vp,
                            textDivs: []
                        });
                    });

                    const item = document.createElement('div');
                    item.className = 'toc-item';
                    item.innerText = 'Page ' + i;
                    item.onclick = () => {  
                        document.getElementById('page-'+i).scrollIntoView({behavior:'smooth'});
                        toggleTOC();
                    };
                    tocList.appendChild(item);
                }
                currentPdfBlob = blob;
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                const isOpen = m.classList.toggle('o');
                
                // Block/Unblock background scroll
                document.body.style.overflow = isOpen ? 'hidden' : '';

                // Ensure header and footer are visible when modal opens
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
                btn.innerText = active ? 'ON' : 'OFF';
                btn.style.background = active ? '${accent}' : 'rgba(0,0,0,0.04)';
                btn.style.color = active ? 'white' : '#333';
                btn.style.borderColor = active ? 'transparent' : 'rgba(0,0,0,0.08)';
            };

            function setupHeaderZoom() {
                const zi = document.getElementById('zoom-in');
                const zo = document.getElementById('zoom-out');
                if(zi) zi.onclick = () => window.changeZoom(0.1);
                if(zo) zo.onclick = () => window.changeZoom(-0.1);
                const hdrV = document.getElementById('zoom-v-hdr');
                if(hdrV) hdrV.textContent = pdfScale.toFixed(1) + 'x';
            }

            function injectFullscreen() {
                const hdr = document.getElementById('header-icons');
                const btn = document.createElement('button');
                btn.className = 'header-icon';
                btn.title = 'Toggle Fullscreen';
                btn.innerHTML = '<i class="fas fa-expand"></i>';
                
                const zoomCtrl = document.getElementById('zoom-controls');
                if(zoomCtrl) hdr.insertBefore(btn, zoomCtrl);
                else hdr.appendChild(btn);
                
                btn.onclick = () => {
                    if(!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                        btn.innerHTML = '<i class="fas fa-compress"></i>';
                    } else {
                        document.exitFullscreen();
                        btn.innerHTML = '<i class="fas fa-expand"></i>';
                    }
                };
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
                document.getElementById('tts-ctrls').classList.remove('hidden');
            };
            window.togglePlayPauseTTS = () => {
                if (syn.paused) { syn.resume(); ttsPaused = false; speaking = true; }
                else { syn.pause(); ttsPaused = true; speaking = false; }
                updateTTSUI();
            };
            window.stopTTS = () => {
                syn.cancel(); speaking = false; ttsPaused = false;
                document.getElementById('tts-ctrls').classList.add('hidden');
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
