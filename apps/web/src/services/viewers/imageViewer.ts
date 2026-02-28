import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function imageViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'SHOPUBLISH'): string {
    const safeTitle = escapeHtml(title);
    const accent = (settings.accent_color as string) || '#4f46e5';
    const albumFiles = settings.album_files as {name: string, key: string, type: string}[] | undefined;
    const isAlbum = albumFiles && albumFiles.length > 0;

    let extraStyles = `
        #img-container {
            position: relative; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            overflow-y: auto; overflow-x: hidden;
            padding: 20px;
        }
    `;

    let extraHtml = '';
    let extraScripts = '';

    if (isAlbum) {
        extraStyles += `
            .masonry-grid {
                column-count: 1;
                column-gap: 16px;
                width: 100%;
                max-width: 1200px;
                margin: 0 auto;
            }
            @media (min-width: 600px) { .masonry-grid { column-count: 2; } }
            @media (min-width: 900px) { .masonry-grid { column-count: 3; } }
            @media (min-width: 1200px) { .masonry-grid { column-count: 4; } }
            
            .masonry-item {
                break-inside: avoid;
                margin-bottom: 16px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
                background: var(--bg-elevated);
                cursor: pointer;
            }
            .masonry-item:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0,0,0,0.2);
            }
            .masonry-item img {
                width: 100%;
                display: block;
                object-fit: cover;
            }
            
            /* Lightbox styles */
            #lightbox {
                position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999;
                display: none; align-items: center; justify-content: center;
            }
            #lightbox.active { display: flex; }
            #lightbox img { max-width: 95vw; max-height: 95vh; object-fit: contain; border-radius: 8px; }
            #lb-close { position: absolute; top: 20px; right: 20px; color: white; font-size: 30px; cursor: pointer; background: rgba(0,0,0,0.5); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        `;

        const itemsHtml = albumFiles.map((file, i) => `
            <div class="masonry-item" onclick="openLightbox('${fileUrl}?i=${i}')">
                <img src="${fileUrl}?i=${i}" alt="${safeTitle} - Image ${i + 1}" loading="lazy">
            </div>
        `).join('');

        extraHtml = `
            <div id="img-container">
                <div class="masonry-grid">
                    ${itemsHtml}
                </div>
            </div>
            <div id="lightbox">
                <div id="lb-close" onclick="closeLightbox()">&times;</div>
                <img id="lb-img" src="" alt="">
            </div>
        `;

        extraScripts = `
            function openLightbox(url) {
                const lb = document.getElementById('lightbox');
                document.getElementById('lb-img').src = url;
                lb.classList.add('active');
            }
            function closeLightbox() {
                document.getElementById('lightbox').classList.remove('active');
                document.getElementById('lb-img').src = '';
            }
            document.getElementById('lightbox').onclick = function(e) {
                if(e.target === this) closeLightbox();
            };
        `;
    } else {
        extraStyles += `
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

        extraHtml = `
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

        extraScripts = `
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
        `;
    }

    const footerHtml = `
        <button class="header-icon" id="download-btn" title="Download"><i class="fas fa-download"></i></button>
    `;

    extraScripts += `
        // Download
        const dBtn = document.getElementById('download-btn');
        if(dBtn) dBtn.onclick = () => {
             const a = document.createElement('a');
             a.href = '${fileUrl}'; a.download = '${safeTitle}'; a.click();
        };
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
            'https://cdn.tailwindcss.com'
        ],
        showZoom: !isAlbum,
        showWebViewLink: true,
        showFullMode: true,
        showNightShift: true
    });
}
