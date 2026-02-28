import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function videoViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'SHOPUBLISH'): string {
    const safeTitle = escapeHtml(title);
    const accent = (settings.accent_color as string) || '#4f46e5';
    const albumFiles = settings.album_files as {name: string, key: string, type: string}[] | undefined;
    const isAlbum = albumFiles && albumFiles.length > 0;
    
    let videoUrls = [fileUrl];
    let videoNames = [safeTitle];
    if (isAlbum) {
        videoUrls = albumFiles.map((_, i) => `${fileUrl}?i=${i}`);
        videoNames = albumFiles.map(f => escapeHtml(f.name.replace(/\.[^.]+$/, '')));
    }

    const extraStyles = `
        #video-container {
            position: relative; width: 100%; height: 100%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            overflow-y: auto; overflow-x: hidden; padding: 20px;
        }
        .player-card {
            background: var(--bg-elevated); border-radius: 12px; padding: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); width: 100%; max-width: 800px;
            display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .track-info { text-align: left; width: 100%; }
        .track-title { font-size: 20px; font-weight: 700; color: var(--text-base); margin-bottom: 4px; }
        .track-author { font-size: 12px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
        
        video { width: 100%; border-radius: 8px; outline: none; background: black; max-height: 60vh; }

        .playlist {
            width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 8px; margin-top: 16px;
        }
        .playlist-header {
            display: flex; justify-content: space-between; align-items: center; cursor: pointer;
            padding: 12px 16px; background: var(--bg-elevated); border-radius: 8px;
            font-size: 14px; font-weight: 600; color: var(--text-base);
        }
        .playlist-tracks {
            display: ${isAlbum ? 'flex' : 'none'}; flex-direction: column; gap: 4px; padding: 8px 0;
            max-height: 250px; overflow-y: auto;
        }
        .track-item {
            padding: 12px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;
            font-size: 14px; color: var(--text-muted); transition: all 0.2s;
        }
        .track-item:hover { background: var(--bg-elevated); color: var(--text-base); }
        .track-item.active { background: ${accent}22; color: ${accent}; font-weight: 600; }
        
        #ld-video {
            position: absolute; inset: 0; background: rgba(10,10,15,0.95);
            z-index: 1000; display: flex; flex-direction: column;
            align-items: center; justify-content: center; color: white; gap: 24px;
        }
    `;

    const playlistHtml = isAlbum ? `
        <div class="playlist">
            <div class="playlist-header" onclick="togglePlaylist()">
                <span><i class="fas fa-list-ul mr-2"></i> Playlist (${albumFiles.length} videos)</span>
                <i id="playlist-icon" class="fas fa-chevron-up transition-transform"></i>
            </div>
            <div id="playlist-tracks" class="playlist-tracks">
                ${videoNames.map((name, i) => `
                    <div class="track-item ${i === 0 ? 'active' : ''}" onclick="playTrack(${i})">
                        <span>${i + 1}. ${name}</span>
                        ${i === 0 ? '<i class="fas fa-play"></i>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    const extraHtml = `
        <div id="ld-video">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60 mt-4">Preparing Video...</p>
        </div>

        <div id="video-container">
            <div class="player-card">
                <video id="main-video" controls ${coverUrl ? `poster="${coverUrl}"` : ''}>
                    <source src="${videoUrls[0]}" type="video/mp4">
                    Your browser does not support the video element.
                </video>
                <div class="track-info">
                    <div id="current-title" class="track-title">${videoNames[0]}</div>
                    <div class="track-author">${storeName}</div>
                </div>
            </div>
            ${playlistHtml}
        </div>
    `;

    const footerHtml = `
        <button class="header-icon" id="download-btn" title="Download"><i class="fas fa-download"></i></button>
    `;

    const extraScripts = `
        const videoUrls = ${JSON.stringify(videoUrls)};
        const videoNames = ${JSON.stringify(videoNames)};
        const video = document.getElementById('main-video');
        let currentTrack = 0;

        video.oncanplay = () => {
            const ld = document.getElementById('ld-video');
            if(ld) {
                ld.style.opacity = '0';
                setTimeout(() => ld.style.display = 'none', 500);
            }
        };
        
        setTimeout(() => {
            const ld = document.getElementById('ld-video');
            if(ld) {
                ld.style.opacity = '0';
                setTimeout(() => ld.style.display = 'none', 500);
            }
        }, 2000);

        video.onended = () => {
            if (currentTrack < videoUrls.length - 1) {
                playTrack(currentTrack + 1);
            }
        };

        window.togglePlaylist = () => {
            const tracks = document.getElementById('playlist-tracks');
            const icon = document.getElementById('playlist-icon');
            if (tracks.style.display === 'none') {
                tracks.style.display = 'flex';
                icon.style.transform = 'rotate(0deg)';
            } else {
                tracks.style.display = 'none';
                icon.style.transform = 'rotate(180deg)';
            }
        };

        window.playTrack = (index) => {
            currentTrack = index;
            video.src = videoUrls[index];
            document.getElementById('current-title').textContent = videoNames[index];
            video.play();

            const items = document.querySelectorAll('.track-item');
            if (items.length > 0) {
                items.forEach((item, i) => {
                    item.className = 'track-item' + (i === index ? ' active' : '');
                    const icon = item.querySelector('.fas.fa-play');
                    if(icon) icon.remove();
                    if(i === index) item.innerHTML += '<i class="fas fa-play"></i>';
                });
            }
        };

        const dBtn = document.getElementById('download-btn');
        if(dBtn) dBtn.onclick = () => {
             const a = document.createElement('a');
             a.href = videoUrls[currentTrack]; a.download = videoNames[currentTrack]; a.click();
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
        showZoom: false,
        showWebViewLink: true,
        showFullMode: true,
        showNightShift: true
    });
}
