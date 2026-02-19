
export const getPDFControllerStyles = () => `
    /* Smart Dark Mode Filter */
    body.smart-dark #content-wrapper,
    body.smart-dark #flipbook-container,
    body.smart-dark .page-content { 
        filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1) !important; 
    }
    
    /* Preserve image natural colors in smart dark mode if possible */
    /* Note: This is tricky with pure CSS filters on the whole container, 
       but we can try to un-invert images if they are separate elements. 
       In PDF.js, they are part of the canvas, so we can't easily target them. 
       However, the hue-rotate(180deg) helps keep skin tones etc. relatively sane. */
    
    .toc-item, .index-item {
        cursor: pointer;
        padding: 10px 15px;
        transition: all 0.2s;
        border-radius: 8px;
        margin-bottom: 4px;
        line-height: 1.4;
    }
    .toc-item:hover, .index-item:hover {
        background: rgba(0,0,0,0.05);
    }
`;

export const getPDFControllerScripts = (accent: string) => `
    class PDFController {
        constructor() {
            this.pdfDoc = null;
            this.activePages = new Set();
            this.MAX_ACTIVE = 6;
            this.pageStates = new Map();
        }

        async loadDocument(url) {
            console.log("PDFController: Loading document " + url);
            
            // Ensure worker is set up correctly
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            }

            if (this.pdfDoc) {
                console.log("PDFController: Destroying existing document");
                await this.pdfDoc.destroy();
                this.pdfDoc = null;
            }
            this.activePages.clear();
            this.pageStates.clear();
            
            try {
                const loadingTask = pdfjsLib.getDocument({
                    url: url,
                    disableAutoFetch: true,
                    disableStream: false,
                    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
                    cMapPacked: true,
                });
                this.pdfDoc = await loadingTask.promise;
                console.log("PDFController: Document loaded successfully");
                return this.pdfDoc;
            } catch (e) {
                console.error("PDFController: Error loading document", e);
                throw e;
            }
        }

        async getNavigation() {
            if (!this.pdfDoc) return [];
            const outline = await this.pdfDoc.getOutline();
            if (outline && outline.length > 0) return outline;
            
            // Fallback to page numbers
            const fallback = [];
            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                fallback.push({ title: 'Page ' + i, dest: { num: i }, items: [] });
            }
            return fallback;
        }

        async resolvePageIndex(dest) {
            if (!dest) return -1;
            try {
                if (typeof dest === 'string') {
                    const d = await this.pdfDoc.getDestination(dest);
                    return await this.pdfDoc.getPageIndex(d[0]);
                }
                // Check if it's already a page ref/num
                if (dest && typeof dest === 'object' && dest.num !== undefined) return dest.num - 1;
                if (Array.isArray(dest)) return await this.pdfDoc.getPageIndex(dest[0]);
                return -1;
            } catch (e) { return -1; }
        }

        async renderPage(i, wrapper, scale, onRendered) {
            // Check if we already have this page in cache
            const existingState = this.pageStates.get(i);
            if (existingState) {
                console.log("Re-attaching cached page " + i);
                wrapper.innerHTML = '';
                if (existingState.canvas) wrapper.appendChild(existingState.canvas);
                if (existingState.textLayer) wrapper.appendChild(existingState.textLayer);
                this.activePages.add(i); // Ensure it's marked as active
                if (onRendered) onRendered(i);
                return;
            }

            if (this.activePages.has(i)) return;

            // Limit check
            if (this.activePages.size >= this.MAX_ACTIVE) {
                let furthest = -1, maxD = -1;
                this.activePages.forEach(p => {
                    const d = Math.abs(p - i);
                    if (d > maxD) { maxD = d; furthest = p; }
                });
                if (furthest !== -1) this.purgePage(furthest);
            }

            this.activePages.add(i);
            try {
                const page = await this.pdfDoc.getPage(i);
                const dpr = window.devicePixelRatio || 1;
                const vp = page.getViewport({ scale: scale * dpr });
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = vp.width;
                canvas.height = vp.height;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.display = 'block';
                
                wrapper.innerHTML = '';
                wrapper.appendChild(canvas);

                const textLayer = document.createElement('div');
                textLayer.className = 'textLayer absolute inset-0';
                wrapper.appendChild(textLayer);

                await page.render({ canvasContext: ctx, viewport: vp }).promise;
                
                const uiVp = page.getViewport({ scale: scale });
                const textContent = await page.getTextContent();
                
                // Using textContentSource to satisfy deprecation warning
                const renderTask = pdfjsLib.renderTextLayer({
                    textContentSource: textContent,
                    container: textLayer,
                    viewport: uiVp,
                    textDivs: []
                });
                
                if (renderTask.promise) await renderTask.promise;

                this.pageStates.set(i, { canvas, textLayer });
                page.cleanup();
                this.pdfDoc.cleanup();
                if (onRendered) onRendered(i);
            } catch (e) {
                console.error("Render error", e);
                this.activePages.delete(i);
            }
        }

        purgePage(i) {
            const state = this.pageStates.get(i);
            if (state) {
                if (state.canvas) {
                    state.canvas.width = 0;
                    state.canvas.height = 0;
                    state.canvas.remove();
                }
                if (state.textLayer) state.textLayer.remove();
                this.pageStates.delete(i);
            }
            this.activePages.delete(i);
        }
    }
    
    window.pdfCtrl = new PDFController();
    
    window.toggleSmartDark = () => {
        const active = document.body.classList.toggle('smart-dark');
        localStorage.setItem('fr_web_smart_dark', active);
        const btn = document.getElementById('sd-toggle');
        if (btn) {
            btn.innerText = active ? 'ON' : 'OFF';
            btn.style.background = active ? '${accent}' : 'rgba(0,0,0,0.04)';
            btn.style.color = active ? 'white' : '#333';
        }
    };
    
    // Auto-init smart dark mode if saved
    if (localStorage.getItem('fr_web_smart_dark') === 'true') {
        document.body.classList.add('smart-dark');
        setTimeout(() => {
            const btn = document.getElementById('sd-toggle');
            if (btn) {
                btn.innerText = 'ON';
                btn.style.background = '${accent}';
                btn.style.color = 'white';
            }
        }, 100);
    }
`;
