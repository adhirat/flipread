
import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function pdfViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    const safeTitle = escapeHtml(title);

    const extraStyles = `
        /* PDF Viewer Specific Styles */
        #flipbook-container {
            position: relative;
            transform-origin: center center;
            margin: 0 auto;
        }
        
        .page {
            background-color: white;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            cursor: grab;
        }
        .page:active { cursor: grabbing; }
        .stf__item { cursor: grab; }
        .stf__item:active { cursor: grabbing; }
        
        .page.--hard { background-color: #f2f2f2; border: 1px solid #ccc; }
        .page.--simple { background-color: white; }
        
        .page-content {
            width: 100%; height: 100%;
            display: flex; justify-content: center; align-items: center;
            position: relative;
        }
        
        .page canvas {
            width: 100%; height: 100%;
            object-fit: fill;
            display: block;
            pointer-events: none;
        }

        /* Error Container */
        .error-container {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #252525; padding: 30px; border-radius: 8px; text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); max-width: 90%; z-index: 2000;
        }
        .error-icon { font-size: 32px; color: #ff6b6b; margin-bottom: 15px; }
        .error-title { color: white; font-size: 18px; margin-bottom: 8px; }
        
        .btn-primary {
            background: #4CAF50; color: white; border: none; padding: 10px 20px;
            border-radius: 4px; font-size: 14px; cursor: pointer; font-weight: 500;
            transition: background 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { background: #45a049; }
    `;

    const extraHtml = `
        <div id="flipbook-container"></div>
        
        <div class="error-container" id="error-container" style="display: none;">
            <div class="error-icon"><i class="fas fa-book-open"></i></div>
            <div class="error-title" id="error-title">File Not Found</div>
            <div style="margin-bottom: 20px; color: #aaa;">Please select a PDF file.</div>
            <button class="btn-primary" onclick="window.location.reload()">
                <i class="fas fa-sync"></i> Retry
            </button>
        </div>

        <input type="file" id="file-upload" accept=".pdf" style="display: none;">
    `;

    const footerHtml = `
        <button id="prev-btn" class="nav-button"><i class="fas fa-chevron-left"></i></button>
        <input type="range" id="page-slider" class="page-slider" min="0" max="0" value="0">
        <button id="next-btn" class="nav-button"><i class="fas fa-chevron-right"></i></button>
        <div class="page-info" id="page-info">-- / --</div>
    `;

    const extraScripts = `
        // PDF Worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Unique Key
        const FU = '${fileUrl}'.split('?')[0];

        // Background Logic
        window.setBg = (c) => {
             document.body.style.background = c;
             document.body.style.color = (c.includes('#f') || c.includes('#e') || c.includes('#d')) ? '#333' : '#fff';
             
             // Update active state in UI
             document.querySelectorAll('.bg-option').forEach(opt => {
                if(opt.getAttribute('data-bg') === c) opt.classList.add('active');
                else opt.classList.remove('active');
             });
             
             localStorage.setItem('fr_bg', c);
        };
        
        window.toggleTexture = () => {
             document.body.classList.toggle('textured');
             const on = document.body.classList.contains('textured');
             const btn = document.getElementById('tex-toggle');
             if(btn) {
                 btn.innerText = on ? 'ON' : 'OFF';
                 btn.style.background = on ? '#4CAF50' : '#444';
             }
             localStorage.setItem('fr_tex', on);
        };

        class RealFlipbook {
            constructor() {
                this.pdfDoc = null;
                this.pageFlip = null;
                this.totalPages = 0;
                this.currentUrl = null; 
                this.useFullHeight = false;

                // Zoom & Pan
                this.zoom = 1;
                this.panX = 0;
                this.panY = 0;
                this.isDragging = false;
                this.startX = 0;
                this.startY = 0;
                this.currentX = 0;
                this.currentY = 0;
                this.startTime = 0;

                this.centerOffset = 0;
                this.pageWidth = 0;
                this.pageHeight = 0;

                this.renderedPages = new Set();
                this.renderingQueue = new Set();
                this.isRendering = false;
                this.targetPageIndex = 0;

                this.container = null;
                this.mainContent = document.getElementById('main-content');
                this.header = document.getElementById('main-header');
                this.footer = document.getElementById('main-footer');
                this.fileInput = document.getElementById('file-upload');

                this.init();
            }

            init() {
                this.injectFitToggle();
                this.setupEventListeners();
                this.setupNotes();
                this.setupSettings();
                
                // Initialize settings state
                const sBg = localStorage.getItem('fr_bg');
                if(sBg) window.setBg(sBg);
                const sTex = localStorage.getItem('fr_tex');
                if(sTex === 'true') {
                     document.body.classList.add('textured');
                     const btn = document.getElementById('tex-toggle');
                     if(btn) {
                         btn.innerText = 'ON';
                         btn.style.background = '#4CAF50';
                     }
                }
                
                // Index Modal
                const idxBtn = document.getElementById('index-btn');
                if(idxBtn) idxBtn.onclick = () => document.getElementById('index-modal').classList.add('open');
                document.getElementById('index-close-btn').onclick = () => document.getElementById('index-modal').classList.remove('open');

                // Initial Load
                this.loadPDF('${fileUrl}');
            }
            
            injectFitToggle() {
                const headerIcons = document.getElementById('header-icons');
                const btn = document.createElement('button');
                btn.className = 'header-icon';
                btn.id = 'fit-toggle-btn';
                btn.title = 'Toggle Fullscreen';
                btn.innerHTML = '<i class="fas fa-expand"></i>';
                
                const zoomCtrl = document.getElementById('zoom-controls');
                if(zoomCtrl && headerIcons.contains(zoomCtrl)) {
                    headerIcons.insertBefore(btn, zoomCtrl);
                } else {
                    headerIcons.appendChild(btn);
                }
                
                btn.onclick = () => this.toggleFitMode(btn);
            }
            
            toggleFitMode(btn) {
                this.useFullHeight = !this.useFullHeight;
                document.body.classList.toggle('full-mode', this.useFullHeight);
                
                const icon = btn.querySelector('i');
                if (this.useFullHeight) {
                    icon.classList.remove('fa-expand');
                    icon.classList.add('fa-compress');
                } else {
                    icon.classList.remove('fa-compress');
                    icon.classList.add('fa-expand');
                }

                this.zoom = 1;
                this.panX = 0;
                this.panY = 0;
                this.updateZoomDisplay();

                let curr = 0;
                if (this.pageFlip) { try { curr = this.pageFlip.getCurrentPageIndex(); } catch (e) { } }
                this.rebuildBook(curr);
            }
            
            setupSettings() {
                const opts = document.querySelectorAll('.bg-option');
                opts.forEach(opt => {
                    opt.onclick = () => window.setBg(opt.getAttribute('data-bg'));
                });
                
                const texBtn = document.getElementById('tex-toggle');
                if(texBtn) texBtn.onclick = window.toggleTexture;
                
                const sBtn = document.getElementById('bg-settings-btn');
                const sModal = document.getElementById('settings-modal');
                const sClose = document.getElementById('settings-close-btn');
                
                if(sBtn) sBtn.onclick = () => sModal.classList.add('open');
                if(sClose) sClose.onclick = () => sModal.classList.remove('open');
                sModal.onclick = (e) => { if(e.target === sModal) sModal.classList.remove('open'); };
                
                const mSet = document.getElementById('bg-settings-btn-mob');
                if(mSet) mSet.onclick = () => sModal.classList.add('open');
            }

            setupNotes() {
                this.editingNoteIndex = -1;
                this.notesSidebar = document.getElementById('chat-w');
                this.notesList = document.getElementById('notes-list');
                this.noteInput = document.getElementById('note-input');
                this.sendBtn = document.getElementById('send-note-btn');
                
                const onNotesToggle = () => this.notesSidebar.classList.toggle('open');
                const nBtn = document.getElementById('notes-btn');
                if(nBtn) nBtn.onclick = onNotesToggle;
                const mnBtn = document.getElementById('notes-btn-mob');
                if(mnBtn) mnBtn.onclick = onNotesToggle;
                document.getElementById('close-notes-btn').onclick = () => this.notesSidebar.classList.remove('open');
                
                if(this.sendBtn) this.sendBtn.onclick = () => this.sendNote();
                if(this.noteInput) this.noteInput.onkeydown = (e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendNote();
                    }
                };
                this.renderNotes();
            }
            
            sendNote() {
                const v = this.noteInput.value.trim();
                if(!v) return;
                let notes = [];
                try { notes = JSON.parse(localStorage.getItem('fr_nt_' + FU)) || []; } catch(e) {}
                
                if(this.editingNoteIndex > -1) {
                    if(notes[this.editingNoteIndex]) notes[this.editingNoteIndex].text = v;
                    this.editingNoteIndex = -1;
                    this.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                } else {
                    notes.push({ text: v, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
                }
                localStorage.setItem('fr_nt_' + FU, JSON.stringify(notes));
                this.noteInput.value = '';
                this.renderNotes();
            }

            renderNotes() {
                if(!this.notesList) return;
                let notes = [];
                try { notes = JSON.parse(localStorage.getItem('fr_nt_' + FU)) || []; } catch(e) {}
                
                this.notesList.innerHTML = notes.map((n, i) => 
                     '<div class="chat-item">' +
                     '<div class="chat-text">' + this.escapeHtml(n.text) + '</div>' +
                     '<div class="chat-meta">' +
                         '<span>' + n.time + '</span>' +
                         '<div class="chat-actions">' +
                             '<i class="fas fa-edit chat-action-btn chat-edit" data-idx="'+i+'"></i>' +
                             '<i class="fas fa-trash chat-action-btn chat-del" data-idx="'+i+'"></i>' +
                         '</div>' +
                     '</div>' +
                     '</div>'
                ).join('');
                
                this.notesList.querySelectorAll('.chat-edit').forEach(el => el.onclick = () => this.editNote(parseInt(el.dataset.idx)));
                this.notesList.querySelectorAll('.chat-del').forEach(el => el.onclick = () => this.deleteNote(parseInt(el.dataset.idx)));
                this.notesList.scrollTop = this.notesList.scrollHeight;
            }
            
            editNote(i) {
                let notes = JSON.parse(localStorage.getItem('fr_nt_' + FU)) || [];
                if(!notes[i]) return;
                this.noteInput.value = notes[i].text;
                this.noteInput.focus();
                this.editingNoteIndex = i;
                this.sendBtn.innerHTML = '<i class="fas fa-check"></i>';
            }
            
            deleteNote(i) {
                if(!confirm('Delete note?')) return;
                let notes = JSON.parse(localStorage.getItem('fr_nt_' + FU)) || [];
                notes.splice(i, 1);
                localStorage.setItem('fr_nt_' + FU, JSON.stringify(notes));
                this.renderNotes();
                if(this.editingNoteIndex === i) {
                    this.editingNoteIndex = -1;
                    this.noteInput.value = '';
                    this.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                }
            }
            
            escapeHtml(unsafe) {
                return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            }
            
            async loadPDF(urlOrData) {
                try {
                    this.showLoading(true);
                    this.hideError();
                    this.pdfDoc = await pdfjsLib.getDocument(urlOrData).promise;
                    this.totalPages = this.pdfDoc.numPages;
                    const sl = document.getElementById('page-slider');
                    if(sl) sl.max = this.totalPages - 1;
                    await this.rebuildBook(0);
                    this.showLoading(false);
                } catch (error) {
                    console.error('Load Error:', error);
                    this.showLoading(false);
                    this.showError();
                }
            }
            
            showLoading(show) { 
                const l = document.getElementById('loading');
                if(l) l.style.display = show ? 'flex' : 'none';
            }
            
            hideError() { document.getElementById('error-container').style.display = 'none'; }
            showError() { document.getElementById('error-container').style.display = 'block'; }

            async rebuildBook(initialPage = 0) {
                if (!this.pdfDoc) return;
                if (this.pageFlip) { this.pageFlip.destroy(); this.pageFlip = null; }
                const old = document.getElementById('flipbook-container');
                if (old) old.remove();

                this.container = document.createElement('div');
                this.container.id = 'flipbook-container';
                this.mainContent.appendChild(this.container);

                this.renderedPages.clear();
                this.renderingQueue.clear();
                this.isRendering = false;

                const p1 = await this.pdfDoc.getPage(1);
                const vp = p1.getViewport({ scale: 1 });
                const aspectRatio = vp.width / vp.height;
                const dims = this.calculateOptimalSize(aspectRatio);
                this.pageWidth = dims.width;
                this.pageHeight = dims.height;

                const isMobile = window.innerWidth <= 768;
                this.container.style.width = isMobile ? (dims.width + 'px') : (dims.width * 2 + 'px');
                this.container.style.height = dims.height + 'px';

                for (let i = 1; i <= this.totalPages; i++) {
                    const div = document.createElement('div');
                    div.className = (i === 1 || i === this.totalPages) ? 'page --hard' : 'page --simple';
                    div.innerHTML = '<div class="page-content" id="page-content-' + i + '"></div>';
                    this.container.appendChild(div);
                }

                this.pageFlip = new St.PageFlip(this.container, {
                    width: dims.width,
                    height: dims.height,
                    size: 'fixed',
                    minWidth: 200, maxWidth: 2000, minHeight: 300, maxHeight: 2000,
                    maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false, useMouseEvents: true
                });

                this.pageFlip.loadFromHTML(this.container.querySelectorAll('.page'));

                this.pageFlip.on('flip', (e) => {
                    this.updateControls();
                    this.updateCenterOffset(e.data);
                    this.queueNearbyPages(e.data);
                });

                this.generateIndex();
                if (initialPage > 0 && initialPage < this.totalPages) this.pageFlip.flip(initialPage);

                this.updateControls();
                this.updateCenterOffset(initialPage);
                this.queueNearbyPages(initialPage);
            }
            
            calculateOptimalSize(aspectRatio) {
                const headerH = this.useFullHeight ? 0 : (this.header.offsetHeight || 60);
                const footerH = this.useFullHeight ? 0 : (this.footer.offsetHeight || 70);
                const margin = this.useFullHeight ? 20 : 40;
                const availW = window.innerWidth;
                const availH = window.innerHeight - headerH - footerH - margin;
                let height = availH;
                let width = height * aspectRatio;

                if (window.innerWidth > 768) {
                    if ((width * 2) > (availW - margin)) {
                        width = (availW - margin) / 2;
                        height = width / aspectRatio;
                    }
                } else {
                    if (width > (availW - 20)) {
                        width = availW - 20;
                        height = width / aspectRatio;
                    }
                }
                let w = Math.floor(width);
                if (w % 2 !== 0) w--;
                return { width: w, height: Math.floor(height) };
            }

            queueNearbyPages(currentIndex) {
                this.targetPageIndex = currentIndex; 
                const range = 10;
                const start = Math.max(0, currentIndex - range);
                const end = Math.min(this.totalPages - 1, currentIndex + range);
                for (let i = start; i <= end; i++) {
                    const pageNum = i + 1;
                    if (!this.renderedPages.has(pageNum)) this.renderingQueue.add(pageNum);
                }
                this.processRenderQueue();
            }

            async processRenderQueue() {
                if (this.isRendering) return;
                this.isRendering = true;
                while (this.renderingQueue.size > 0) {
                    const queueArray = Array.from(this.renderingQueue);
                    queueArray.sort((a, b) => {
                        const distA = Math.abs((a - 1) - this.targetPageIndex);
                        const distB = Math.abs((b - 1) - this.targetPageIndex);
                        return distA - distB;
                    });
                    const pageNum = queueArray[0];
                    this.renderingQueue.delete(pageNum);
                    if (this.renderedPages.has(pageNum)) continue;

                    const container = document.getElementById('page-content-' + pageNum);
                    if (!container) { this.isRendering = false; return; }

                    try { await this.renderPageContent(pageNum); this.renderedPages.add(pageNum); } 
                    catch (e) { console.error("Render Error Page " + pageNum, e); }
                    await new Promise(r => setTimeout(r, 10));
                }
                this.isRendering = false;
            }

            async renderPageContent(pageNum) {
                const container = document.getElementById('page-content-' + pageNum);
                if (!container) return;
                if (container.innerHTML.includes('loader')) container.innerHTML = '';
                const page = await this.pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width; canvas.height = viewport.height;
                container.appendChild(canvas);
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            }

            updateCenterOffset(targetIndex) {
                if (window.innerWidth <= 768) {
                    this.centerOffset = 0;
                    if (this.container) {
                        this.container.style.transition = 'none';
                        this.applyTransform();
                    }
                    return;
                }
                let index = targetIndex !== undefined ? targetIndex : this.pageFlip.getCurrentPageIndex();
                if (index === 0) this.centerOffset = -this.pageWidth / 2;
                else if (index === this.totalPages - 1 && this.totalPages % 2 === 0) this.centerOffset = this.pageWidth / 2;
                else this.centerOffset = 0;

                if (this.container) {
                    this.container.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                    this.applyTransform();
                }
            }

            updateControls() {
                if (!this.pageFlip) return;
                const index = this.pageFlip.getCurrentPageIndex();
                const pageNum = index + 1;
                let text = (window.innerWidth <= 768 || index === 0 || index === this.totalPages - 1)
                    ? \`Page \${pageNum}\` : \`Pages \${pageNum}-\${pageNum + 1}\`;
                
                const info = document.getElementById('page-info');
                if(info) info.textContent = \`\${text} / \${this.totalPages}\`;
                
                const sl = document.getElementById('page-slider');
                if(sl) sl.value = index;
                
                const pBtn = document.getElementById('prev-btn');
                if(pBtn) pBtn.disabled = index === 0;
                
                const nBtn = document.getElementById('next-btn');
                if(nBtn) nBtn.disabled = index >= this.totalPages - 1;
                
                const mpBtn = document.getElementById('mobile-prev-btn');
                if(mpBtn) {
                    mpBtn.disabled = index === 0;
                    mpBtn.style.opacity = index === 0 ? '0.3' : '1';
                }
                const mnBtn = document.getElementById('mobile-next-btn');
                if(mnBtn) {
                    mnBtn.disabled = index >= this.totalPages - 1;
                    mnBtn.style.opacity = index >= this.totalPages - 1 ? '0.3' : '1';
                }
            }
            
            generateIndex() {
                const list = document.getElementById('index-list');
                if(!list) return;
                list.innerHTML = '';
                for(let i=1; i<=this.totalPages; i++) {
                     const item = document.createElement('div');
                     item.className = 'index-item';
                     item.innerHTML = '<span>Page ' + i + '</span>';
                     item.onclick = () => {
                         this.pageFlip.flip(i-1);
                         document.getElementById('index-modal').classList.remove('open');
                     };
                     list.appendChild(item);
                }
                const setItem = (selector, action) => {
                    const el = document.querySelector(selector);
                    if(el) el.onclick = action;
                };
            }
            
            updateZoomDisplay() {
                const zt = document.getElementById('zoom-text');
                if(zt) zt.innerText = Math.round(this.zoom * 100) + '%';
            }

            setupEventListeners() {
                const pBtn = document.getElementById('prev-btn');
                if(pBtn) pBtn.onclick = () => this.pageFlip.flipPrev();
                const nBtn = document.getElementById('next-btn');
                if(nBtn) nBtn.onclick = () => this.pageFlip.flipNext();
                const sl = document.getElementById('page-slider');
                if(sl) sl.oninput = (e) => this.pageFlip.flip(parseInt(e.target.value));
                
                const mpBtn = document.getElementById('mobile-prev-btn');
                if(mpBtn) mpBtn.onclick = () => this.pageFlip.flipPrev();
                const mnBtn = document.getElementById('mobile-next-btn');
                if(mnBtn) mnBtn.onclick = () => this.pageFlip.flipNext();
                
                // Bridge for viewerBase mobile buttons
                window.prev = () => this.pageFlip.flipPrev();
                window.next = () => this.pageFlip.flipNext();

                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        if (this.pdfDoc) {
                            this.resetZoom();
                            let curr = 0;
                            if (this.pageFlip) { try { curr = this.pageFlip.getCurrentPageIndex(); } catch (e) { } }
                            this.rebuildBook(curr);
                        }
                    }, 500);
                });

                window.addEventListener('keydown', (e) => {
                    if (!this.pageFlip) return;
                    if (e.key === 'ArrowLeft') this.pageFlip.flipPrev();
                    if (e.key === 'ArrowRight') this.pageFlip.flipNext();
                });
                
                const zi = document.getElementById('zoom-in');
                if(zi) zi.onclick = () => this.handleZoom(0.25);
                const zo = document.getElementById('zoom-out');
                if(zo) zo.onclick = () => this.handleZoom(-0.25);
                
                this.mainContent.addEventListener('mousedown', (e) => {
                    if (this.zoom > 1) { this.startPan(e, e.clientX, e.clientY); return; }
                    const isUI = e.target.closest('.header') || e.target.closest('.controls') || e.target.closest('.index-modal') || e.target.closest('#chat-w');
                    const isBook = e.target.closest('.page') || e.target.closest('.stf__wrapper');
                    if (!isUI && !isBook && !e.target.closest('#error-container')) {
                        if (this.pageFlip) {
                            if (e.clientX > window.innerWidth / 2) this.pageFlip.flipNext();
                            else this.pageFlip.flipPrev();
                            this.blockClick = true;
                        }
                    }
                });
                window.addEventListener('mousemove', (e) => this.movePan(e.clientX, e.clientY));
                window.addEventListener('mouseup', (e) => this.endPan());
                
                this.mainContent.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 1) this.startPan(e, e.touches[0].clientX, e.touches[0].clientY);
                }, { passive: false });
                this.mainContent.addEventListener('touchmove', (e) => {
                    if (e.touches.length === 1) {
                        if (this.isDragging) e.preventDefault();
                        this.movePan(e.touches[0].clientX, e.touches[0].clientY);
                    }
                }, { passive: false });
                this.mainContent.addEventListener('touchend', (e) => this.endPan());
                
                this.mainContent.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    this.handleZoom(delta);
                }, { passive: false });
            }
            
            handleZoom(delta) {
                const newZoom = this.zoom + delta;
                if (newZoom >= 0.5 && newZoom <= 3.0) {
                    this.zoom = newZoom;
                    if (this.zoom <= 1) { this.panX = 0; this.panY = 0; }
                    this.updateCenterOffset();
                    this.updateZoomDisplay();
                    if (this.zoom > 1) {
                        this.container.style.pointerEvents = 'none';
                        this.mainContent.style.cursor = 'grab';
                    } else {
                        this.container.style.pointerEvents = 'auto';
                        this.mainContent.style.cursor = 'default';
                    }
                }
            }
            resetZoom() {
                this.zoom = 1; this.panX = 0; this.panY = 0;
                if (this.container) this.container.style.pointerEvents = 'auto';
                this.mainContent.style.cursor = 'default';
                this.updateCenterOffset();
                this.updateZoomDisplay();
            }
            startPan(e, x, y) {
                const isBook = e.target.closest('.page') || e.target.closest('.stf__wrapper');
                if (this.zoom > 1) {
                    this.isDragging = true; this.startX = x; this.startY = y; this.currentX = x; this.currentY = y; this.startTime = Date.now();
                    if (this.container) this.container.style.transition = 'none';
                    this.mainContent.style.cursor = 'grabbing';
                } else if (!isBook) {
                    this.isDragging = true; this.startX = x; this.startY = y; this.currentX = x; this.currentY = y; this.startTime = Date.now();
                }
            }
            movePan(x, y) {
                if (!this.isDragging) return;
                if (this.zoom > 1) {
                    const dx = x - this.currentX; const dy = y - this.currentY;
                    this.panX += dx; this.panY += dy;
                    this.applyTransform();
                }
                this.currentX = x; this.currentY = y;
            }
            endPan() {
                if (!this.isDragging) return;
                if (this.zoom === 1) {
                    const diffX = this.currentX - this.startX;
                    const timeDiff = Date.now() - this.startTime;
                    if (Math.abs(diffX) > 50 && timeDiff < 300) {
                        if (diffX > 0) this.pageFlip.flipPrev(); else this.pageFlip.flipNext();
                    }
                }
                this.isDragging = false;
                if (this.zoom > 1) this.mainContent.style.cursor = 'grab';
            }
            applyTransform() {
                if (!this.container) return;
                const x = this.panX + this.centerOffset;
                this.container.style.transform = 'translate(' + x + 'px, ' + this.panY + 'px) scale(' + this.zoom + ')';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
             setTimeout(() => new RealFlipbook(), 100);
        });
    `;

    return getViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        extraStyles,
        extraHtml,
        footerHtml,
        extraScripts,
        settingsHtml: '',
        dependencies: [
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
            'https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js'
        ],
        showZoom: true,
        showWebViewLink: true
    });
}
