
import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function imageViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = ''): string {
    const safeTitle = escapeHtml(title);
    const accent = (settings.accent_color as string) || '#4f46e5';

    const extraStyles = `
        #img-container {
            position: relative; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }
        #main-img {
            max-width: 90vw; max-height: 85vh; object-fit: contain;
            border-radius: 4px; transition: transform 0.3s ease;
            cursor: zoom-in; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        #main-img.zoomed { cursor: grab; max-width: none; max-height: none; }
        #main-img.zoomed.dragging { cursor: grabbing; }

        .img-info {
            position: fixed; bottom: 80px; left: 20px;
            z-index: 200; font-size: 10px; color: rgba(255,255,255,0.4);
            display: flex; flex-direction: column; gap: 2px;
            pointer-events: none;
        }

        #ld-img {
            position: absolute; inset: 0; background: rgba(10,10,15,0.95);
            z-index: 1000; display: flex; flex-direction: column;
            items-center justify-center text-white gap-6;
        }
        
        @media (max-width: 768px) {
            #main-img { max-width: 95vw; max-height: 80vh; }
            .img-info { display: none; }
        }
    `;

    const extraHtml = `
        <div id="ld-img" class="flex flex-col items-center justify-center">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60 mt-4">Preparing View...</p>
        </div>

        <div id="img-container">
            <img id="main-img" src="${fileUrl}" alt="${safeTitle}" draggable="false">
        </div>
        <div class="img-info" id="img-info"></div>
    `;

    const footerHtml = `
        <button class="header-icon" id="download-btn" title="Download"><i class="fas fa-download"></i></button>
    `;

    const extraScripts = `
        const img = document.getElementById('main-img');
        let zoom = 1;
        let isDragging = false;
        let dragStart = {x:0, y:0};
        let imgPos = {x:0, y:0};

        img.onload = () => {
            const ld = document.getElementById('ld-img');
            if(ld) {
                ld.style.opacity = '0';
                setTimeout(() => ld.style.display = 'none', 500);
            }
            document.getElementById('img-info').innerHTML = img.naturalWidth + ' x ' + img.naturalHeight + ' px';
        };

        function applyZoom() {
            img.style.transform = 'translate(' + imgPos.x + 'px,' + imgPos.y + 'px) scale(' + zoom + ')';
            const ztxt = document.getElementById('zoom-text');
            if(ztxt) ztxt.textContent = Math.round(zoom * 100) + '%';
            img.classList.toggle('zoomed', zoom > 1);
            
            // Toggle container pointer events to allow panning vs base click
            const cont = document.getElementById('img-container');
            if(zoom > 1) {
                cont.style.cursor = 'grab';
            } else {
                cont.style.cursor = 'default';
            }
        }

        // Zoom Controls (Base provides zoom-in/out buttons)
        const zi = document.getElementById('zoom-in');
        const zo = document.getElementById('zoom-out');
        if(zi) zi.onclick = () => { zoom = Math.min(zoom + 0.25, 5); applyZoom(); };
        if(zo) zo.onclick = () => { zoom = Math.max(zoom - 0.25, 0.25); if(zoom <= 1) imgPos = {x:0,y:0}; applyZoom(); };

        // Click to zoom
        img.addEventListener('click', (e) => {
            if(isDragging) return;
            if(zoom > 1) { zoom = 1; imgPos = {x:0,y:0}; }
            else { zoom = 2; }
            applyZoom();
        });

        // Drag when zoomed
        img.addEventListener('mousedown', (e) => {
            if(zoom <= 1) return;
            isDragging = true;
            img.classList.add('dragging');
            dragStart = {x: e.clientX - imgPos.x, y: e.clientY - dragStart.y};
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if(!isDragging) return;
            imgPos = {x: e.clientX - dragStart.x, y: e.clientY - dragStart.y};
            applyZoom();
        });
        document.addEventListener('mouseup', () => { isDragging = false; img.classList.remove('dragging'); });

        // Touch drag
        let touchStart = null;
        img.addEventListener('touchstart', (e) => {
            if(zoom <= 1 || e.touches.length !== 1) return;
            touchStart = {x: e.touches[0].clientX - imgPos.x, y: e.touches[0].clientY - imgPos.y};
        }, {passive:true});
        img.addEventListener('touchmove', (e) => {
            if(!touchStart || zoom <= 1) return;
            imgPos = {x: e.touches[0].clientX - touchStart.x, y: e.touches[0].clientY - touchStart.y};
            applyZoom();
        }, {passive:true});
        img.addEventListener('touchend', () => { touchStart = null; }, {passive:true});

        // Mouse wheel zoom
        document.getElementById('img-container').addEventListener('wheel', (e) => {
            e.preventDefault();
            if(e.deltaY < 0) zoom = Math.min(zoom + 0.15, 5);
            else zoom = Math.max(zoom - 0.15, 0.25);
            if(zoom <= 1) imgPos = {x:0,y:0};
            applyZoom();
        }, {passive:false});

        // Download
        const dBtn = document.getElementById('download-btn');
        if(dBtn) dBtn.onclick = () => {
             const a = document.createElement('a');
             a.href = FILE_URL; a.download = TITLE; a.click();
        };

        // UI Hooks
        const setupUI = () => {
            const sBtn = document.getElementById('bg-settings-btn');
            const sModal = document.getElementById('settings-modal');
            const sClose = document.getElementById('settings-close-btn');
            if(sBtn) sBtn.onclick = () => sModal.classList.add('open');
            if(sClose) sClose.onclick = () => sModal.classList.remove('open');
            
            const nBtn = document.getElementById('notes-btn');
            const nSidebar = document.getElementById('chat-w');
            if(nBtn) nBtn.onclick = () => nSidebar.classList.toggle('open');
            document.getElementById('close-notes-btn').onclick = () => nSidebar.classList.remove('open');
            
            // Full Mode Toggle (Injecting into header)
            const hdr = document.getElementById('header-icons');
            const fitBtn = document.createElement('button');
            fitBtn.className = 'header-icon';
            fitBtn.id = 'fit-toggle-btn';
            fitBtn.innerHTML = '<i class="fas fa-expand"></i>';
            hdr.appendChild(fitBtn);
            
            fitBtn.onclick = () => {
                document.body.classList.toggle('full-mode');
                const on = document.body.classList.contains('full-mode');
                fitBtn.innerHTML = on ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
            };
        };
        
        setupUI();
        
        // Settings / Bg Unification
        window.setBg = (c) => {
             document.body.style.background = c;
             localStorage.setItem('fr_bg_img', c);
        };
        const savedBg = localStorage.getItem('fr_bg_img');
        if(savedBg) window.setBg(savedBg);

        document.querySelectorAll('.bg-option').forEach(opt => {
            opt.onclick = () => window.setBg(opt.getAttribute('data-bg'));
        });
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
        footerHtml,
        extraScripts,
        settingsHtml: '',
        dependencies: [
            'https://cdn.tailwindcss.com'
        ],
        showZoom: true,
        showWebViewLink: true
    });
}
