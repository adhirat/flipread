
import { getWebViewerBase } from './webViewerBase';

export function spreadsheetWebViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, any>, showBranding: boolean, logoUrl: string = ''): string {
    return getWebViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        dependencies: [
            'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js'
        ],
        extraStyles: `
            #sheet-container { overflow-x: auto; padding: 20px; }
            table { border-collapse: collapse; width: 100%; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; position: sticky; top: 0; }
            .sheet-tabs { display: flex; gap: 4px; padding: 10px 20px; background: #f9f9f9; border-bottom: 1px solid #ddd; overflow-x: auto; }
            .sheet-tab { padding: 6px 15px; background: white; border: 1px solid #ddd; border-bottom: none; cursor: pointer; font-size: 12px; white-space: nowrap; }
            .sheet-tab.active { background: var(--accent); color: white; border-color: var(--accent); }
        `,
        extraScripts: `
            let workbook = null;
            async function init() {
                try {
                    const res = await fetch(FU);
                    const arrayBuffer = await res.arrayBuffer();
                    workbook = XLSX.read(arrayBuffer);
                    
                    const container = document.getElementById('content-wrapper');
                    const tabs = document.createElement('div');
                    tabs.className = 'sheet-tabs';
                    container.appendChild(tabs);
                    
                    const sheetDiv = document.createElement('div');
                    sheetDiv.id = 'sheet-container';
                    container.appendChild(sheetDiv);
                    
                    const tocList = document.getElementById('toc-list');

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
                        
                        const item = document.createElement('div');
                        item.className = 'toc-item';
                        item.innerText = name;
                        item.onclick = () => { renderSheet(name); tab.click(); toggleTOC(); };
                        tocList.appendChild(item);
                    });
                    
                    renderSheet(workbook.SheetNames[0]);

                    document.getElementById('ld').style.opacity = '0';
                    setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
                } catch(e) {
                    console.error(e);
                    document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
                }
            }

            function renderSheet(name) {
                const sheet = workbook.Sheets[name];
                const html = XLSX.utils.sheet_to_html(sheet);
                document.getElementById('sheet-container').innerHTML = html;
            }
        `
    });
}
