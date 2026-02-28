import { getWebViewerBase } from './webViewerBase';

export function spreadsheetWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'SHOPUBLISH'): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: true,
        dependencies: [
            'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js'
        ],
        settingsHtml: `
            <div id="set-m" class="modal" onclick="toggleSettings()">
                <div id="set-m-c" class="modal-c" onclick="event.stopPropagation()">
                    <div class="set-m-h">
                        <h3 class="font-bold text-xs uppercase tracking-widest opacity-60">Table Options</h3>
                        <button onclick="toggleSettings()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">✕</button>
                    </div>
                    <div class="set-m-b">
                        <div>
                            <label class="text-[10px] font-bold uppercase opacity-40 mb-2 block">Text Size</label>
                            <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                                <button onclick="changeFontSize(-1)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">-</button>
                                <span id="wfz-v" class="flex-1 text-center font-bold text-sm">13px</span>
                                <button onclick="changeFontSize(1)" class="w-8 h-8 bg-white border rounded shadow-sm hover:bg-gray-50">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        extraStyles: `
            #content-wrapper { padding: 80px 20px 200px; }
            #sheet-container { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            table { border-collapse: collapse; width: 100%; font-size: 13px; }
            th, td { border: 1px solid #eee; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #475569; position: sticky; top: 0; }
            .sheet-tabs { display: flex; gap: 4px; padding: 10px 20px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; overflow-x: auto; border-radius: 8px 8px 0 0; }
            .sheet-tab { padding: 8px 16px; background: white; border: 1px solid #e2e8f0; border-bottom: none; cursor: pointer; font-size: 12px; white-space: nowrap; border-radius: 6px 6px 0 0; color: #64748b; transition: 0.2s; }
            .sheet-tab.active { background: var(--accent); color: white; border-color: var(--accent); }
        `,
        extraScripts: `
            let workbook = null;
            let currentFontSize = 13;

            async function init() {
                try {
                    document.getElementById('settings-btn').style.display = 'flex';
                    const storedSize = localStorage.getItem('fr_web_ss_fs');
                    if(storedSize) {
                        currentFontSize = parseInt(storedSize);
                        document.getElementById('wfz-v').textContent = currentFontSize + 'px';
                    }

                    const res = await fetch(FU);
                    const buf = await res.arrayBuffer();
                    
                    const ct = res.headers.get('content-type') || '';
                    const isText = ct.includes('text/') || FU.match(/\\.(csv|tsv|txt)$/i);

                    if(isText) {
                        const text = new TextDecoder().decode(buf);
                        workbook = XLSX.read(text, { type: 'string' });
                    } else {
                        workbook = XLSX.read(buf, { type: 'array' });
                    }
                    
                    const container = document.getElementById('content-wrapper');
                    const tabs = document.createElement('div');
                    tabs.className = 'sheet-tabs';
                    container.appendChild(tabs);
                    
                    const sheetDiv = document.createElement('div');
                    sheetDiv.id = 'sheet-container';
                    container.appendChild(sheetDiv);
                    
                    const tocList = document.getElementById('toc-list');
                    if(tocList) tocList.innerHTML = '';

                    workbook.SheetNames.forEach((name, i) => {
                        const tab = document.createElement('div');
                        tab.className = 'sheet-tab' + (i === 0 ? ' active' : '');
                        tab.innerText = name;
                        tab.onclick = () => {
                            document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
                            tab.classList.add('active');
                            renderSheet(name);
                        };
                        tabs.appendChild(tab);
                        
                        if(tocList) {
                            const item = document.createElement('div');
                            item.className = 'toc-item';
                            item.innerText = name;
                            item.onclick = () => { renderSheet(name); tab.click(); toggleTOC(); };
                            tocList.appendChild(item);
                        }
                    });
                    
                    renderSheet(workbook.SheetNames[0]);

                    const ld = document.getElementById('ld');
                    if(ld) {
                        ld.style.opacity = '0';
                        setTimeout(() => ld.style.display = 'none', 500);
                    }
                } catch(e) {
                    console.error(e);
                    const ld = document.getElementById('ld');
                    if(ld) ld.innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            function renderSheet(name) {
                const sheet = workbook.Sheets[name];
                const html = XLSX.utils.sheet_to_html(sheet);
                const container = document.getElementById('sheet-container');
                container.innerHTML = html;
                const table = container.querySelector('table');
                if(table) table.style.fontSize = currentFontSize + 'px';
            }

            window.toggleSettings = () => {
                const m = document.getElementById('set-m');
                m.classList.toggle('o');
            };

            window.changeFontSize = (d) => {
                currentFontSize = Math.max(8, Math.min(30, currentFontSize + d));
                document.getElementById('wfz-v').textContent = currentFontSize + 'px';
                localStorage.setItem('fr_web_ss_fs', currentFontSize);
                const table = document.querySelector('#sheet-container table');
                if(table) table.style.fontSize = currentFontSize + 'px';
            };

            window.toggleTTS = () => {
                const container = document.getElementById('sheet-container');
                if(!container) return;
                const text = container.innerText;
                if(!text) return;
                
                if(window.speaking || window.ttsPaused) {
                    window.stopTTS();
                } else {
                    window.startTTS(text);
                }
            };
        `
    });
}
