
import { getWebViewerBase } from './webViewerBase';

export function pdfWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl,
        showTTS: true,
        dependencies: [
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
        ],
        extraStyles: `
            .textLayer {
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                overflow: hidden;
                opacity: 0.2;
                line-height: 1.0;
                pointer-events: auto;
            }
            .textLayer > span {
                color: transparent;
                position: absolute;
                white-space: pre;
                cursor: text;
                transform-origin: 0% 0%;
            }
            ::selection { background: rgba(79, 70, 229, 0.3); }
        `,
        settingsHtml: `
            <div id="set-m">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">PDF Options</h3>
                    <button onclick="toggleSettings()" class="md:hidden text-lg">✕</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Zoom Level</label>
                        <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                            <button onclick="changeZoom(-0.1)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">-</button>
                            <span id="zoom-v" class="flex-1 text-center font-bold text-sm">1.5x</span>
                            <button onclick="changeZoom(0.1)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">+</button>
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

            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const res = await fetch(FU);
                    const blob = await res.blob();
                    await renderPDF(blob);
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
                    section.className = 'page-content mb-8 flex flex-col items-center relative';
                    
                    const head = document.createElement('div');
                    head.className = 'section-header mb-2';
                    head.innerHTML = '<div class="pg-elegant text-xs opacity-40">' + i + '</div>';
                    section.appendChild(head);

                    const canvasWrapper = document.createElement('div');
                    canvasWrapper.className = 'relative shadow-2xl';
                    
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
                window.currentPdfBlob = blob;
            }

            // Selection Handling for PDF
            document.addEventListener('mouseup', () => {
                const sel = window.getSelection();
                if (!sel.rangeCount || sel.isCollapsed) {
                    document.getElementById('hl-menu').style.display = 'none';
                    return;
                }
                
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const menu = document.getElementById('hl-menu');
                
                // Position above selection
                menu.style.top = (window.scrollY + rect.top - 60) + 'px';
                menu.style.left = (window.scrollX + rect.left + rect.width / 2) + 'px';
                menu.style.display = 'flex';
                
                window.currentSelection = {
                    text: sel.toString(),
                    range: range
                };
            });

            window.addHighlight = (color) => {
                if(!window.currentSelection) return;
                const { range, text } = window.currentSelection;
                
                const span = document.createElement('span');
                span.className = 'hl-' + color;
                try {
                    range.surroundContents(span);
                    highlights.push({ text, c: color });
                    localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
                    renderHighlights();
                } catch(e) {
                    // fall back if range is too complex (cross divs)
                    console.warn("Could not surround selection precisely", e);
                }
                
                document.getElementById('hl-menu').style.display = 'none';
                window.getSelection().removeAllRanges();
            };

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
            };

            window.changeZoom = (d) => {
                pdfScale = Math.max(0.5, Math.min(3.0, pdfScale + d));
                document.getElementById('zoom-v').textContent = pdfScale.toFixed(1) + 'x';
                if(window.currentPdfBlob) renderPDF(window.currentPdfBlob);
            };

            window.toggleTTS = () => {
                if(speaking || ttsPaused) {
                    stopTTS();
                } else {
                    startTTS();
                }
            };
            window.startTTS = () => {
                const layers = document.querySelectorAll('.textLayer');
                let text = '';
                layers.forEach(layer => {
                    text += layer.innerText + ' ';
                });
                
                if(!text.trim()) {
                    // Fallback to searching for spans if innerText is empty (sometimes happens with absolute positioning)
                    layers.forEach(layer => {
                        const spans = layer.querySelectorAll('span');
                        spans.forEach(s => text += s.innerText + ' ');
                    });
                }
                
                if(!text.trim()) return;

                utter = new SpeechSynthesisUtterance(text);
                utter.onend = () => { stopTTS(); };
                utter.onstart = () => {
                    speaking = true;
                    ttsPaused = false;
                    updateTTSUI();
                };
                
                syn.cancel(); 
                setTimeout(() => {
                    syn.resume();
                    syn.speak(utter);
                }, 100);
                
                const ctrls = document.getElementById('tts-ctrls');
                if(ctrls) {
                    ctrls.classList.add('flex');
                    ctrls.classList.remove('hidden');
                }
            };
            window.togglePlayPauseTTS = () => {
                if (syn.paused) {
                    syn.resume();
                    ttsPaused = false;
                    speaking = true;
                } else {
                    syn.pause();
                    ttsPaused = true;
                    speaking = false;
                }
                updateTTSUI();
            };
            window.stopTTS = () => {
                syn.cancel();
                speaking = false;
                ttsPaused = false;
                const ctrls = document.getElementById('tts-ctrls');
                if(ctrls) {
                    ctrls.classList.remove('flex');
                    ctrls.classList.add('hidden');
                }
                updateTTSUI();
            };
            window.updateTTSUI = () => {
                const ppIcon = document.getElementById('tts-pp-i');
                const ttsBtn = document.getElementById('tts-btn');
                
                if (ppIcon) {
                    ppIcon.className = ttsPaused ? 'fas fa-play ml-0.5' : 'fas fa-pause';
                }
                
                if (ttsBtn) {
                    ttsBtn.classList.remove('tts-playing', 'tts-paused-state', 'tts-active');
                    if (speaking || ttsPaused) {
                        if (ttsPaused) {
                            ttsBtn.classList.add('tts-paused-state');
                        } else {
                            ttsBtn.classList.add('tts-playing', 'tts-active');
                        }
                    }
                }
            };
        `
    });
}
