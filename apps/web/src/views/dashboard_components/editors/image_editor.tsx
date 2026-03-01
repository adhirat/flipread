/** @jsxImportSource hono/jsx */

export const imageView = (
    <div id="composer-image" class="composer-pane card" style="display:none;margin-top:24px;padding:0;overflow:hidden;border:1px solid var(--border)">
        {/* Visual Toolbar for Image Editor */}
        <div class="editor-toolbar" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:2">
            <h3 style="margin:0;font-size:16px"><i class="fas fa-image text-secondary"></i> Advanced Image Editor (Filerobot)</h3>
            <div style="flex:1"></div>
            <button class="btn" style="padding:6px 12px;font-size:12px;" x-on:click="window.initFilerobot()"><i class="fas fa-magic"></i> Launch Editor</button>
        </div>

        {/* Main Image Editor Container */}
        <div id="filerobot-editor-container" style="width:100%; height:700px; background:var(--bg-secondary);">
            <div id="filerobot-placeholder" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; background:#fff; height:100%">
               <i class="fas fa-images" style="font-size:48px;color:var(--border)"></i>
               <p class="text-secondary" style="font-size:14px">Professional image editing with filters, annotations, and transformations.</p>
               <button class="btn" x-on:click="window.initFilerobot()">Load Image Editor</button>
            </div>
            <div id="filerobot-root" style="width:100%; height:100%; display:none;"></div>
        </div>
    </div>
);

export const imageScript = `
let filerobotInstance = null;
function initFilerobot() {
    if (filerobotInstance) return;
    
    if (!window.FilerobotImageEditor) {
        alert('Image editor library is still loading. Please try again in a moment.');
        return;
    }
    
    document.getElementById('filerobot-placeholder').style.display = 'none';
    document.getElementById('filerobot-root').style.display = 'block';

    const { FilerobotImageEditor } = window;
    const container = document.getElementById('filerobot-root');

    filerobotInstance = new FilerobotImageEditor(container, {
        source: 'https://scaleflex.cloudimg.io/v7/demo/river.png', // Default demo image
        onSave: (info, items) => {
            console.log('Image saved:', info, items);
            showToast('Image changes saved to console (preview mode)');
        },
        annotationsCommon: {
            fill: '#6366f1',
        },
        Text: { text: 'Shopublish...' },
        TabsIds: ['ADJUST', 'ANNOTATE', 'WATERMARK', 'FILTERS', 'FINETUNE'],
        defaultTabId: 'ANNOTATE',
    });

    filerobotInstance.render();
}
`;
