
import { getWebViewerBase } from './webViewerBase';

export function imageWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl,
        settingsHtml: `
            <div id="set-m">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">Image View</h3>
                    <button onclick="toggleSettings()" class="md:hidden text-lg">✕</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Image Width</label>
                        <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                            <button onclick="changeWidth(-10)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">-</button>
                            <span id="width-v" class="flex-1 text-center font-bold text-sm">100%</span>
                            <button onclick="changeWidth(10)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        extraStyles: `
            #image-container { display: flex; justify-content: center; padding: 40px 20px; transition: all 0.3s ease; }
            #image-container img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); transition: all 0.3s ease; }
        `,
        extraScripts: `
            let currentWidth = 100;
            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const container = document.getElementById('content-wrapper');
                    const div = document.createElement('div');
                    div.id = 'image-container';
                    const img = document.createElement('img');
                    img.id = 'main-img';
                    img.src = FU;
                    img.alt = 'Content Image';
                    div.appendChild(img);
                    container.appendChild(div);
                    
                    document.getElementById('toc-list').innerHTML = '<div class="p-4 text-xs opacity-50">Image file.</div>';

                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
            };

            window.changeWidth = (d) => {
                currentWidth = Math.max(20, Math.min(200, currentWidth + d));
                document.getElementById('width-v').textContent = currentWidth + '%';
                const img = document.getElementById('main-img');
                if(img) img.style.maxWidth = currentWidth + '%';
            };
        `
    });
}
