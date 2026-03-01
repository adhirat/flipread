
export const sheetsView = `
<div id="composer-sheet" class="composer-pane card" style="display:none;margin-top:24px;padding:0;overflow:hidden;border:1px solid var(--border)">
    <!-- Visual Toolbar for Sheets -->
    <div class="editor-toolbar" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:2">
        <h3 style="margin:0;font-size:16px"><i class="fas fa-file-excel text-secondary"></i> Advanced Sheet Editor (Univer)</h3>
        <div style="flex:1"></div>
        <button class="btn" style="padding:6px 12px;font-size:12px;" onclick="initUniver()"><i class="fas fa-play"></i> Initialize Sheets</button>
    </div>

    <!-- Main Sheets Visual Area -->
    <div style="background:var(--bg-secondary);padding:0;min-height:700px;display:flex;flex-direction:column">
        <div id="univer-container" style="width:100%; height:700px; display:none;"></div>
        <div id="univer-placeholder" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; background:#fff">
           <i class="fas fa-th" style="font-size:48px;color:var(--border)"></i>
           <p class="text-secondary" style="font-size:14px">Visual spreadsheet engine. Create formulas, charts, and more.</p>
           <button class="btn" onclick="initUniver()">Load Full Sheet Engine</button>
        </div>
    </div>
</div>
`;

export const sheetsScript = `
let univerInitialized = false;
async function initUniver() {
    if (univerInitialized) return;
    
    if (!window.UniverCore) {
         alert('Univer libraries are still loading. Please try again in a moment.');
         return;
    }
    
    document.getElementById('univer-placeholder').style.display = 'none';
    document.getElementById('univer-container').style.display = 'block';

    try {
        const { Univer, LocaleType } = window.UniverCore;
        const lang = (LocaleType && LocaleType.EN_US) ? LocaleType.EN_US : 'en-US';

        const locales = {
            [lang]: {
                ...(window.UniverDesign?.enUS || {}),
                ...(window.UniverUI?.enUS || {}),
                ...(window.UniverDocsUI?.enUS || {}),
                ...(window.UniverSheetsUI?.enUS || {}),
            }
        };

        const univer = new Univer({
            theme: window.UniverDesign?.defaultTheme || {},
            locale: lang,
            locales: locales,
        });

        if (window.UniverEngineRender) univer.registerPlugin(window.UniverEngineRender.UniverRenderEnginePlugin);
        if (window.UniverEngineFormula) univer.registerPlugin(window.UniverEngineFormula.UniverFormulaEnginePlugin);
        
        if (window.UniverUI) {
            univer.registerPlugin(window.UniverUI.UniverUIPlugin, {
                container: 'univer-container',
                header: true,
                footer: true,
            });
        }
        
        if (window.UniverDocs) {
            univer.registerPlugin(window.UniverDocs.UniverDocsPlugin, {
                hasScroll: false,
            });
            if (window.UniverDocsUI) univer.registerPlugin(window.UniverDocsUI.UniverDocsUIPlugin);
        }

        if (window.UniverSheets) {
            univer.registerPlugin(window.UniverSheets.UniverSheetsPlugin);
            if (window.UniverSheetsUI) univer.registerPlugin(window.UniverSheetsUI.UniverSheetsUIPlugin);
            if (window.UniverSheetsFormula) univer.registerPlugin(window.UniverSheetsFormula.UniverSheetsFormulaPlugin);
            if (window.UniverSheetsNumfmt) univer.registerPlugin(window.UniverSheetsNumfmt.UniverSheetsNumfmtPlugin);
        }

        try {
            univer.createUniverSheet({});
        } catch {
            const type = (window.UniverCore.UniverInstanceType && window.UniverCore.UniverInstanceType.UNIVER_SHEET) ? window.UniverCore.UniverInstanceType.UNIVER_SHEET : 1;
            univer.createUnit(type, {});
        }
        univerInitialized = true;
    } catch (err) {
        console.error('Univer initialization failed:', err);
    }
}
`;
