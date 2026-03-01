/** @jsxImportSource hono/jsx */

export const sheetsView = (
    <div id="composer-sheet" class="composer-pane card" style="display:none;margin-top:24px;padding:0;overflow:hidden;border:1px solid var(--border)">
        {/* Visual Toolbar for Sheets */}
        <div class="editor-toolbar" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:2">
            <h3 style="margin:0;font-size:16px"><i class="fas fa-file-excel text-secondary"></i> Advanced Sheet Editor (Univer)</h3>
            <div style="flex:1"></div>
            <button class="btn" style="padding:6px 12px;font-size:12px;" x-on:click="window.initUniver()"><i class="fas fa-play"></i> Initialize Sheets</button>
        </div>

        {/* Main Sheets Visual Area */}
        <div style="background:var(--bg-secondary);padding:0;min-height:700px;display:flex;flex-direction:column">
            <div id="univer-container" style="width:100%; height:700px; display:none;"></div>
            <div id="univer-placeholder" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; background:#fff">
               <i class="fas fa-th" style="font-size:48px;color:var(--border)"></i>
               <p class="text-secondary" style="font-size:14px">Visual spreadsheet engine. Create formulas, charts, and more.</p>
               <button class="btn" x-on:click="window.initUniver()">Load Full Sheet Engine</button>
            </div>
        </div>
    </div>
);

export const sheetsScript = `
let univerInitialized = false;
let univerLoading = false;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load: ' + src));
        document.head.appendChild(s);
    });
}

function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

async function initUniver() {
    if (univerInitialized) return;
    if (univerLoading) { alert('Univer is still loading, please wait...'); return; }
    univerLoading = true;

    document.getElementById('univer-placeholder').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:12px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--border)"></i><p class="text-secondary">Loading spreadsheet engine...</p></div>';

    try {
        // 1. Load CSS
        loadCSS('https://cdn.jsdelivr.net/npm/@univerjs/design@0.1.14/lib/index.css');
        loadCSS('https://cdn.jsdelivr.net/npm/@univerjs/ui@0.1.14/lib/index.css');
        loadCSS('https://cdn.jsdelivr.net/npm/@univerjs/docs-ui@0.1.14/lib/index.css');
        loadCSS('https://cdn.jsdelivr.net/npm/@univerjs/sheets-ui@0.1.14/lib/index.css');
        loadCSS('https://cdn.jsdelivr.net/npm/@univerjs/sheets-numfmt@0.1.14/lib/index.css');

        // 2. Load peer dependencies first (React, RxJS, clsx)
        if (!window.React) await loadScript('https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js');
        if (!window.ReactDOM) await loadScript('https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js');
        if (!window.rxjs) await loadScript('https://cdn.jsdelivr.net/npm/rxjs@7.8.1/dist/bundles/rxjs.umd.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/clsx@2.0.0/dist/clsx.min.js');

        // Set aliases that Univer UMD expects
        window.rxjs = window.rxjs || window.Rx;
        window.react = window.React;
        window['react-dom'] = window.ReactDOM;

        // 3. Load Univer packages in strict dependency order
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/core@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/design@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/engine-render@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/engine-formula@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/ui@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/docs@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/docs-ui@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/sheets@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/sheets-ui@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/sheets-formula@0.1.14/lib/umd/index.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@univerjs/sheets-numfmt@0.1.14/lib/umd/index.js');

        // Resolve globals
        window.UniverCore = window.UniverCore || window.univer || window.Univer;
        window.UniverDesign = window.UniverDesign || window['univer-design'];
        window.UniverEngineRender = window.UniverEngineRender || window['univer-engine-render'];
        window.UniverEngineFormula = window.UniverEngineFormula || window['univer-engine-formula'];
        window.UniverUI = window.UniverUI || window['univer-ui'];
        window.UniverDocs = window.UniverDocs || window['univer-docs'];
        window.UniverDocsUI = window.UniverDocsUI || window['univer-docs-ui'];
        window.UniverSheets = window.UniverSheets || window['univer-sheets'];
        window.UniverSheetsUI = window.UniverSheetsUI || window['univer-sheets-ui'];
        window.UniverSheetsFormula = window.UniverSheetsFormula || window['univer-sheets-formula'];
        window.UniverSheetsNumfmt = window.UniverSheetsNumfmt || window['univer-sheets-numfmt'];

        if (!window.UniverCore) {
            throw new Error('UniverCore failed to load');
        }

        // 4. Initialize
        document.getElementById('univer-placeholder').style.display = 'none';
        document.getElementById('univer-container').style.display = 'block';

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
            univer.registerPlugin(window.UniverDocs.UniverDocsPlugin, { hasScroll: false });
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
        document.getElementById('univer-placeholder').innerHTML = '<div style="text-align:center;padding:40px"><i class="fas fa-exclamation-triangle" style="font-size:32px;color:#ef4444;margin-bottom:12px;display:block"></i><p style="color:var(--text-secondary)">Failed to load spreadsheet engine. Please refresh and try again.</p><p style="font-size:12px;color:var(--text-muted);margin-top:8px">' + err.message + '</p></div>';
    } finally {
        univerLoading = false;
    }
}
`;
