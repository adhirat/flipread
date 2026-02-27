import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function audioViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'ShoPublish'): string {
    const safeTitle = escapeHtml(title);
    const accent = (settings.accent_color as string) || '#4f46e5';
    const albumFiles = settings.album_files as {name: string, key: string, type: string}[] | undefined;
    const isAlbum = albumFiles && albumFiles.length > 0;
    
    let audioUrls = [fileUrl];
    let audioNames = [safeTitle];
    if (isAlbum) {
        audioUrls = albumFiles.map((_, i) => `${fileUrl}?i=${i}`);
        audioNames = albumFiles.map(f => escapeHtml(f.name.replace(/\.[^.]+$/, '')));
    }

    const extraStyles = `
        #audio-container {
            position: relative; width: 100%; height: 100%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            overflow-y: auto; overflow-x: hidden; padding: 20px;
        }
        .player-card {
            background: var(--bg-elevated); border-radius: 24px; padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); width: 100%; max-width: 500px;
            display: flex; flex-direction: column; align-items: center; gap: 24px;
        }
        .cover-art {
            width: 250px; height: 250px; border-radius: 20px; object-fit: cover;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .track-info { text-align: center; }
        .track-title { font-size: 24px; font-weight: 700; color: var(--text-base); margin-bottom: 8px; }
        .track-author { font-size: 14px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
        
        audio { width: 100%; outline: none; }
        audio::-webkit-media-controls-panel { background: var(--bg-base); }
        audio::-webkit-media-controls-current-time-display,
        audio::-webkit-media-controls-time-remaining-display { color: var(--text-base); }

        .playlist {
            width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 8px; margin-top: 24px;
        }
        .playlist-header {
            display: flex; justify-content: space-between; align-items: center; cursor: pointer;
            padding: 12px 16px; background: var(--bg-elevated); border-radius: 12px;
            font-size: 14px; font-weight: 600; color: var(--text-base);
        }
        .playlist-tracks {
            display: ${isAlbum ? 'flex' : 'none'}; flex-direction: column; gap: 4px; padding: 8px 0;
            max-height: 300px; overflow-y: auto;
        }
        .track-item {
            padding: 12px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;
            font-size: 14px; color: var(--text-muted); transition: all 0.2s;
        }
        .track-item:hover { background: var(--bg-elevated); color: var(--text-base); }
        .track-item.active { background: ${accent}22; color: ${accent}; font-weight: 600; }
        
        #ld-audio {
            position: absolute; inset: 0; background: rgba(10,10,15,0.95);
            z-index: 1000; display: flex; flex-direction: column;
            align-items: center; justify-content: center; color: white; gap: 24px;
        }
    `;

    const playlistHtml = isAlbum ? `
        <div class="playlist">
            <div class="playlist-header" onclick="togglePlaylist()">
                <span><i class="fas fa-list-ul mr-2"></i> Playlist (${albumFiles.length} tracks)</span>
                <i id="playlist-icon" class="fas fa-chevron-up transition-transform"></i>
            </div>
            <div id="playlist-tracks" class="playlist-tracks">
                ${audioNames.map((name, i) => `
                    <div class="track-item ${i === 0 ? 'active' : ''}" onclick="playTrack(${i})">
                        <span>${i + 1}. ${name}</span>
                        ${i === 0 ? '<i class="fas fa-volume-up"></i>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    const extraHtml = `
        <div id="ld-audio">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60 mt-4">Preparing Audio...</p>
        </div>

        <div id="audio-container">
            <div class="player-card">
                ${coverUrl ? `<img src="${coverUrl}" class="cover-art" alt="Cover">` : `<div class="cover-art flex items-center justify-center bg-gray-100 dark:bg-gray-800"><i class="fas fa-music text-6xl opacity-20"></i></div>`}
                <div class="track-info">
                    <div id="current-title" class="track-title">${audioNames[0]}</div>
                    <div class="track-author">${storeName}</div>
                </div>
                <audio id="main-audio" controls autoplay>
                    <source src="${audioUrls[0]}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
            ${playlistHtml}
        </div>
    `;

    const footerHtml = `
        <button class="header-icon" id="download-btn" title="Download"><i class="fas fa-download"></i></button>
    `;

    const extraScripts = `
        const audioUrls = ${JSON.stringify(audioUrls)};
        const audioNames = ${JSON.stringify(audioNames)};
        const audio = document.getElementById('main-audio');
        let currentTrack = 0;

        audio.oncanplay = () => {
            const ld = document.getElementById('ld-audio');
            if(ld) {
                ld.style.opacity = '0';
                setTimeout(() => ld.style.display = 'none', 500);
            }
        };
        
        // Hide loader after a timeout in case oncanplay doesn't fire
        setTimeout(() => {
            const ld = document.getElementById('ld-audio');
            if(ld) {
                ld.style.opacity = '0';
                setTimeout(() => ld.style.display = 'none', 500);
            }
        }, 2000);

        audio.onended = () => {
            if (currentTrack < audioUrls.length - 1) {
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
            audio.src = audioUrls[index];
            document.getElementById('current-title').textContent = audioNames[index];
            audio.play();

            // Update playlist UI
            const items = document.querySelectorAll('.track-item');
            if (items.length > 0) {
                items.forEach((item, i) => {
                    item.className = 'track-item' + (i === index ? ' active' : '');
                    const icon = item.querySelector('.fas.fa-volume-up');
                    if(icon) icon.remove();
                    if(i === index) item.innerHTML += '<i class="fas fa-volume-up"></i>';
                });
            }
        };

        const dBtn = document.getElementById('download-btn');
        if(dBtn) dBtn.onclick = () => {
             const a = document.createElement('a');
             a.href = audioUrls[currentTrack]; a.download = audioNames[currentTrack]; a.click();
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
