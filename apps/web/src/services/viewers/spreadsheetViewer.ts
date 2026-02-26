import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function spreadsheetViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'ShoPublish'): string {
  const accent = (settings.accent_color as string) || '#4f46e5';
  const safeTitle = escapeHtml(title);

  const extraStyles = `
        #sheet-v { width:100%;height:100%;overflow:auto;padding:60px 20px 80px;-webkit-overflow-scrolling:touch }
        #sheet-c { background:white;box-shadow:0 10px 30px rgba(0,0,0,0.1);border-radius:8px;max-width:1200px;margin:0 auto;overflow-x:auto;transform-origin: top center; transition: transform 0.2s; }
        #sheet-c table { width:100%;border-collapse:collapse;font-size:13px }
        #sheet-c th { background:#f8fafc;padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;border-bottom:2px solid #e2e8f0;position:sticky;top:0;z-index:10 }
        #sheet-c td { padding:8px 14px;border-bottom:1px solid #f1f5f9;color:#334155;white-space:nowrap }
        #sheet-c tr:hover td { background:#f8fafc }
        #sheet-c tr:nth-child(even) td { background:#fafbfc }

        .sheet-tabs { display:flex;gap:4px;padding:12px 20px;background:rgba(0,0,0,0.03);border-top:1px solid rgba(0,0,0,0.06);overflow-x:auto;max-width:1200px;margin:0 auto }
        .sheet-tab { padding:8px 16px;font-size:12px;font-weight:600;cursor:pointer;border-radius:8px;transition:all .2s;color:#64748b;white-space:nowrap;border:1px solid transparent }
        .sheet-tab.active { background:white;color:#0f172a;border-color:#e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.06) }
        .sheet-tab:hover { color:#0f172a }
        
        @media(max-width:768px){
            #sheet-v{padding:50px 10px 70px}
            #sheet-c{border-radius:0}
            #sheet-c td,#sheet-c th{padding:6px 10px;font-size:11px}
        }
  `;

  const extraHtml = `
    <div id="ld-sheet" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
        </div>
        <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Loading Spreadsheet...</p>
    </div>

    <div id="sheet-v">
        <div id="sheet-c"></div>
        <div id="sheet-tabs" class="sheet-tabs"></div>
    </div>
  `;

  const extraScripts = `
        let workbook = null;
        let currentSheet = 0;

        async function initSheet() {
            try {
                const res = await fetch(FILE_URL);
                if(!res.ok) throw new Error('Failed to load');
                const buf = await res.arrayBuffer();

                const ct = res.headers.get('content-type') || '';
                const isText = ct.includes('text/') || FILE_URL.match(/\\.(csv|tsv|txt)$/i);

                if(isText) {
                    const text = new TextDecoder().decode(buf);
                    workbook = XLSX.read(text, { type: 'string' });
                } else {
                    workbook = XLSX.read(buf, { type: 'array' });
                }

                renderSheetTabs();
                renderSheet(0);
                const ld = document.getElementById('ld-sheet');
                if(ld) {
                  ld.style.opacity='0';
                  setTimeout(()=>ld.style.display='none', 500);
                }
            } catch(e) {
                console.error(e);
                const ld = document.getElementById('ld-sheet');
                if(ld) ld.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i><p class="mt-4">Error Loading Spreadsheet</p>';
            }
        }

        function renderSheetTabs() {
            const tabs = document.getElementById('sheet-tabs');
            if(workbook.SheetNames.length <= 1) { tabs.style.display = 'none'; return; }
            tabs.innerHTML = workbook.SheetNames.map((name, i) =>
                '<div class="sheet-tab' + (i === 0 ? ' active' : '') + '" onclick="switchSheet(' + i + ')">' + name + '</div>'
            ).join('');
        }

        window.switchSheet = (idx) => {
            currentSheet = idx;
            document.querySelectorAll('.sheet-tab').forEach((t,i) => t.classList.toggle('active', i === idx));
            renderSheet(idx);
        };

        function renderSheet(idx) {
            const name = workbook.SheetNames[idx];
            const sheet = workbook.Sheets[name];
            const html = XLSX.utils.sheet_to_html(sheet, { id: 'sheet-table', editable: false });
            document.getElementById('sheet-c').innerHTML = html;
        }

        // Override applyZoom
        const baseApplyZoom = window.applyZoom;
        window.applyZoom = () => {
            if(typeof baseApplyZoom === 'function') baseApplyZoom();
            const c = document.getElementById('sheet-c');
            if(c) c.style.transform = 'scale(' + (window.zoom || 1) + ')';
        };

        initSheet();
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
      showZoom: true,
      showWebViewLink: true,
      showFullMode: true,
      showNightShift: true,
      extraStyles,
      extraHtml,
      extraScripts,
      dependencies: [
          'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'
      ]
  });
}
