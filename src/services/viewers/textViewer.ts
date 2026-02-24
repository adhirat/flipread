import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function textViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead', fileType: string = 'txt'): string {
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);

    const extraStyles = `
        #text-v { width: 100%; height: 100%; overflow-y: auto; padding: 60px 20px 100px; -webkit-overflow-scrolling: touch; }
        #text-c { background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 12px; max-width: 800px; margin: 0 auto; padding: 48px; line-height: 1.8; font-size: 16px; color: #1e293b; min-height: 60vh; transition: font-size 0.2s, font-family 0.2s; }

        /* Markdown styles */
        #text-c h1 { font-size: 2em; font-weight: 700; margin: 0.8em 0 0.4em; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
        #text-c h2 { font-size: 1.6em; font-weight: 600; margin: 0.8em 0 0.3em; color: #1e293b; }
        #text-c h3 { font-size: 1.3em; font-weight: 600; margin: 0.6em 0 0.3em; color: #334155; }
        #text-c p { margin: 0.8em 0; }
        #text-c a { color: ${accent}; text-decoration: underline; }
        #text-c code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: 'SF Mono', Consolas, monospace; }
        #text-c pre { background: #0f172a; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 1em 0; line-height: 1.5; }
        #text-c pre code { background: none; padding: 0; color: inherit; }
        #text-c blockquote { border-left: 4px solid ${accent}; padding: 12px 20px; margin: 1em 0; background: rgba(79,70,229,0.04); border-radius: 0 8px 8px 0; color: #475569; }
        #text-c ul, #text-c ol { padding-left: 1.5em; margin: 0.8em 0; }
        #text-c img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
        #text-c hr { border: none; border-top: 2px solid #e2e8f0; margin: 2em 0; }

        .plain-text { white-space: pre-wrap; font-family: 'SF Mono', Consolas, 'Courier New', monospace; font-size: 14px; line-height: 1.7; color: #334155; }
        
        @media (max-width: 768px) {
            #text-v { padding: 40px 10px 80px; }
            #text-c { padding: 24px; border-radius: 0; }
        }
    `;

    const extraHtml = `
        <div id="ld-text" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
            </div>
            <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Loading Text...</p>
        </div>

        <div id="text-v">
            <div id="text-c"></div>
        </div>
    `;

    const extraScripts = `
        const FILE_TYPE = "${fileType}";
        const isMarkdown = FILE_TYPE === 'md' || FILE_URL.match(/\\.(md|markdown)$/i) || TITLE.match(/\\.(md|markdown)$/i);
        const isHtml = FILE_TYPE === 'html' || FILE_URL.match(/\\.html?$/i) || TITLE.match(/\\.html?$/i);

        async function initText() {
            try {
                const res = await fetch(FILE_URL);
                if(!res.ok) throw new Error('Failed to load');
                const text = await res.text();
                const el = document.getElementById('text-c');

                if(isHtml) {
                    el.innerHTML = text;
                } else if(FILE_TYPE === 'rtf' || TITLE.match(/\\.rtf$/i)) {
                    try {
                        const buf = await (await fetch(FILE_URL)).arrayBuffer();
                        const doc = new RTFJS.Document(buf);
                        const htmlEls = await doc.render();
                        el.innerHTML = '';
                        htmlEls.forEach(h => el.appendChild(h));
                    } catch(re) {
                        console.error("RTF Render Error:", re);
                        el.textContent = text;
                        el.classList.add('plain-text');
                    }
                } else if(isMarkdown) {
                    marked.setOptions({ 
                        breaks: true, 
                        gfm: true, 
                        highlight: function(code, lang) {
                            if(lang && hljs.getLanguage(lang)) return hljs.highlight(code, {language: lang}).value;
                            return hljs.highlightAuto(code).value;
                        }
                    });
                    el.innerHTML = marked.parse(text);
                } else {
                    el.textContent = text;
                    el.classList.add('plain-text');
                }

                const ld = document.getElementById('ld-text');
                if(ld) {
                    ld.style.opacity='0';
                    setTimeout(()=>ld.style.display='none', 500);
                }
            } catch(e) {
                console.error(e);
                const ld = document.getElementById('ld-text');
                if(ld) ld.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i><p class="mt-4">Error Loading Document</p>';
            }
        }

        // Bridge to settings
        window.setFontSize = (px) => { document.getElementById('text-c').style.fontSize = px + 'px'; };
        window.setFont = (f) => { document.getElementById('text-c').style.fontFamily = f; };

        initText();
    `;

    const settingsHtml = `
        <div class="set-section">
            <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Typography</label>
            <div class="space-y-4">
                <div>
                    <label class="text-xs opacity-60 mb-1 block">Font Size</label>
                    <input type="range" min="12" max="32" value="16" oninput="setFontSize(this.value)" class="w-full">
                </div>
                <div>
                    <label class="text-xs opacity-60 mb-1 block">Font Family</label>
                    <select onchange="setFont(this.value)" class="w-full bg-gray-50 border p-2 rounded text-sm outline-none">
                        <option value="'Inter', sans-serif">Modern Sans</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Courier New', monospace">Monospace</option>
                        <option value="'Palatino Linotype', serif">Palatino</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    return getViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: true,
        showZoom: false,
        showWebViewLink: true,
        showFullMode: true,
        showNightShift: true,
        extraStyles,
        extraHtml,
        extraScripts,
        settingsHtml,
        dependencies: [
            'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
            'https://unpkg.com/rtf.js/dist/WMFJS.bundle.js',
            'https://unpkg.com/rtf.js/dist/EMFJS.bundle.js',
            'https://unpkg.com/rtf.js/dist/RTFJS.bundle.js'
        ]
    });
}
