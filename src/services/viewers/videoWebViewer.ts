import { getWebViewerBase } from './webViewerBase';
import { escapeHtml } from './viewerUtils';

export function videoWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'ShoPublish'): string {
    const albumFiles = settings.album_files as {name: string, key: string, type: string}[] | undefined;
    const isAlbum = albumFiles && albumFiles.length > 0;
    
    let videoUrls = [fileUrl];
    let videoNames = [escapeHtml(title)];
    if (isAlbum) {
        videoUrls = albumFiles.map((_, i) => `${fileUrl}?i=${i}`);
        videoNames = albumFiles.map(f => escapeHtml(f.name.replace(/\.[^.]+$/, '')));
    }

    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showFullMode: true,
        showNightShift: true,
        settingsHtml: ``,
        extraStyles: `
            #video-container { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; gap: 40px; }
            .video-item { width: 100%; max-width: 800px; padding: 20px; background: var(--bg-elevated); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .video-title { font-weight: bold; margin-bottom: 12px; font-size: 16px; color: var(--text-base); }
            video { width: 100%; border-radius: 8px; outline: none; background: black; }
        `,
        extraScripts: `
            const videoUrls = ${JSON.stringify(videoUrls)};
            const videoNames = ${JSON.stringify(videoNames)};
            const coverUrl = '${coverUrl}';
            async function init() {
                try {
                    const container = document.getElementById('content-wrapper');
                    const div = document.createElement('div');
                    div.id = 'video-container';
                    
                    for (let i = 0; i < videoUrls.length; i++) {
                        const item = document.createElement('div');
                        item.className = 'video-item';
                        item.innerHTML = \`<div class="video-title">\${i + 1}. \${videoNames[i]}</div>
                                          <video controls preload="metadata" \${coverUrl ? 'poster="' + coverUrl + '"' : ''}>
                                              <source src="\${videoUrls[i]}" type="video/mp4">
                                          </video>\`;
                        div.appendChild(item);
                    }
                    
                    container.appendChild(div);
                    
                    document.getElementById('toc-list').innerHTML = '<div class="p-4 text-xs opacity-50">${isAlbum ? `Album (${albumFiles.length} videos)` : 'Video file.'}</div>';

                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }
        `
    });
}
