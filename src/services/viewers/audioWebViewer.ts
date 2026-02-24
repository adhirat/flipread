import { getWebViewerBase } from './webViewerBase';
import { escapeHtml } from './viewerUtils';

export function audioWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    const albumFiles = settings.album_files as {name: string, key: string, type: string}[] | undefined;
    const isAlbum = albumFiles && albumFiles.length > 0;
    
    let audioUrls = [fileUrl];
    let audioNames = [escapeHtml(title)];
    if (isAlbum) {
        audioUrls = albumFiles.map((_, i) => `${fileUrl}?i=${i}`);
        audioNames = albumFiles.map(f => escapeHtml(f.name.replace(/\.[^.]+$/, '')));
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
            #audio-container { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; gap: 40px; }
            .audio-item { width: 100%; max-width: 600px; padding: 20px; background: var(--bg-elevated); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .audio-title { font-weight: bold; margin-bottom: 12px; font-size: 16px; color: var(--text-base); }
            audio { width: 100%; outline: none; }
        `,
        extraScripts: `
            const audioUrls = ${JSON.stringify(audioUrls)};
            const audioNames = ${JSON.stringify(audioNames)};
            let currentWidth = 100;
            async function init() {
                try {
                    const container = document.getElementById('content-wrapper');
                    const div = document.createElement('div');
                    div.id = 'audio-container';
                    
                    for (let i = 0; i < audioUrls.length; i++) {
                        const item = document.createElement('div');
                        item.className = 'audio-item';
                        item.innerHTML = \`<div class="audio-title">\${i + 1}. \${audioNames[i]}</div>
                                          <audio controls preload="none">
                                              <source src="\${audioUrls[i]}" type="audio/mpeg">
                                          </audio>\`;
                        div.appendChild(item);
                    }
                    
                    container.appendChild(div);
                    
                    document.getElementById('toc-list').innerHTML = '<div class="p-4 text-xs opacity-50">${isAlbum ? `Album (${albumFiles.length} tracks)` : 'Audio file.'}</div>';

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
