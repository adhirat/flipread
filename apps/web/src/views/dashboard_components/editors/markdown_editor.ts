
export const markdownView = `
<div id="composer-md" class="composer-pane card" style="display:none;margin-top:24px;padding:0;overflow:hidden;border:1px solid var(--border)">
    <!-- Visual Toolbar for MD -->
    <div class="editor-toolbar" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:2">
        <h3 style="margin:0;font-size:16px"><i class="fab fa-markdown text-secondary"></i> Pro Markdown Editor</h3>
        <div class="toolbar-group" style="display:flex;gap:4px;border-left:1px solid var(--border);padding-left:12px;margin-left:8px">
            <button class="btn-tool" onclick="insertMd('**','**')" title="Bold"><i class="fas fa-bold"></i></button>
            <button class="btn-tool" onclick="insertMd('*','*')" title="Italic"><i class="fas fa-italic"></i></button>
            <button class="btn-tool" onclick="insertMd('# ','')" title="H1"><i class="fas fa-heading"></i>1</button>
            <button class="btn-tool" onclick="insertMd('> ','')" title="Quote"><i class="fas fa-quote-left"></i></button>
            <button class="btn-tool" onclick="insertMd('- ','')" title="List"><i class="fas fa-list-ul"></i></button>
            <button class="btn-tool" onclick="insertMd('[Link Text](',')')" title="Link"><i class="fas fa-link"></i></button>
        </div>
        <div style="flex:1"></div>
        <button class="btn-outline" style="padding:6px 12px;font-size:12px;" onclick="downloadMd()"><i class="fas fa-download"></i> Export .md</button>
    </div>

    <!-- PPT Visual Split Layout -->
    <div style="display:flex;height:700px;background:var(--bg-secondary)">
        <!-- LEFT: Editor -->
        <div style="flex:1;border-right:1px solid var(--border);display:flex;flex-direction:column;background:#fff">
            <textarea id="md-editor-textarea" oninput="updateMdPreview()" style="flex:1;width:100%;border:none;padding:24px;font-family:ui-monospace,monospace;font-size:14px;line-height:1.6;outline:none;resize:none" placeholder="# Welcome to Shopublish Markdown..."></textarea>
        </div>

        <!-- RIGHT: Live Preview -->
        <div style="flex:1;overflow-y:auto;background:var(--bg-base);padding:32px">
            <div id="md-preview-container" class="md-preview" style="background:#fff;padding:40px;border-radius:12px;box-shadow:var(--shadow-sm);min-height:100%">
                <!-- Progress placeholder -->
                <p class="text-secondary">Preview will appear here...</p>
            </div>
        </div>
    </div>
</div>
`;

export const markdownScript = `
function updateMdPreview() {
    const val = document.getElementById('md-editor-textarea').value;
    const container = document.getElementById('md-preview-container');
    if (window.marked) {
        container.innerHTML = marked.parse(val || '_Start typing to see preview..._');
    } else {
        container.innerText = val;
    }
}

function insertMd(prefix, suffix) {
    const textarea = document.getElementById('md-editor-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    updateMdPreview();
}

function downloadMd() {
    const val = document.getElementById('md-editor-textarea').value;
    if (!val) { alert('Editor is empty'); return; }
    const blob = new Blob([val], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
}

// Initial content for testing
setTimeout(() => {
    const textarea = document.getElementById('md-editor-textarea');
    if (textarea && !textarea.value) {
        textarea.value = '# Shopublish Markdown Editor\\n\\nWelcome to your advanced markdown editing experience.\\n\\n## Features\\n- **Real-time preview**\\n- **Formatting tools**\\n- **Clean layout**\\n- **Easy export**\\n\\nEnjoy crafting your content!';
        updateMdPreview();
    }
}, 500);
`;
