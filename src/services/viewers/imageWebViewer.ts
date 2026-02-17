
import { getWebViewerBase } from './webViewerBase';

export function imageWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        extraStyles: `
            #image-container { display: flex; justify-content: center; padding: 40px 20px; }
            #image-container img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); }
        `,
        extraScripts: `
            async function init() {
                try {
                    const container = document.getElementById('content-wrapper');
                    const div = document.createElement('div');
                    div.id = 'image-container';
                    const img = document.createElement('img');
                    img.src = FU;
                    img.alt = 'Content Image';
                    div.appendChild(img);
                    container.appendChild(div);
                    
                    document.getElementById('toc-list').innerHTML = '<div class="p-4 text-xs opacity-50">Image file.</div>';
                    document.getElementById('settings-btn').style.display = 'none';

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
