/** @jsxImportSource hono/jsx */

export const docxView = (
    <div id="composer-doc" class="composer-pane card" style="margin-top:24px;padding:0;overflow:hidden;border:1px solid var(--border)">
        {/* Visual Toolbar */}
        <div class="editor-toolbar" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:2">
            <div class="toolbar-group" style="display:flex;gap:4px;border-right:1px solid var(--border);padding-right:8px">
                <button class="btn-tool" x-on:click="window.execCmd('bold')" title="Bold"><i class="fas fa-bold"></i></button>
                <button class="btn-tool" x-on:click="window.execCmd('italic')" title="Italic"><i class="fas fa-italic"></i></button>
                <button class="btn-tool" x-on:click="window.execCmd('underline')" title="Underline"><i class="fas fa-underline"></i></button>
                <button class="btn-tool" x-on:click="window.execCmd('strikeThrough')" title="Strike"><i class="fas fa-strikethrough"></i></button>
            </div>
            <div class="toolbar-group" style="display:flex;gap:4px;border-right:1px solid var(--border);padding-right:8px">
                <button class="btn-tool" x-on:click="window.execCmd('formatBlock','H1')" title="Heading 1"><i class="fas fa-heading"></i>1</button>
                <button class="btn-tool" x-on:click="window.execCmd('formatBlock','H2')" title="Heading 2"><i class="fas fa-heading"></i>2</button>
                <button class="btn-tool" x-on:click="window.execCmd('formatBlock','P')" title="Paragraph"><i class="fas fa-paragraph"></i></button>
            </div>
            <div class="toolbar-group" style="display:flex;gap:4px;border-right:1px solid var(--border);padding-right:8px">
                <button class="btn-tool" x-on:click="window.execCmd('insertUnorderedList')" title="Bullet List"><i class="fas fa-list-ul"></i></button>
                <button class="btn-tool" x-on:click="window.execCmd('insertOrderedList')" title="Numbered List"><i class="fas fa-list-ol"></i></button>
            </div>
            <div class="toolbar-group" style="display:flex;gap:4px;border-right:1px solid var(--border);padding-right:8px">
                <button class="btn-tool" x-on:click="window.execCmd('justifyLeft')" title="Align Left"><i class="fas fa-align-left"></i></button>
                <button class="btn-tool" x-on:click="window.execCmd('justifyCenter')" title="Align Center"><i class="fas fa-align-center"></i></button>
                <button class="btn-tool" x-on:click="window.execCmd('justifyRight')" title="Align Right"><i class="fas fa-align-right"></i></button>
            </div>
            <div class="toolbar-group" style="display:flex;gap:4px">
                <button class="btn-tool" x-on:click="window.insertLinkPrompt()" title="Link"><i class="fas fa-link"></i></button>
                <button class="btn-tool" x-on:click="window.insertImagePrompt()" title="Image"><i class="fas fa-image"></i></button>
                <button class="btn-tool" x-on:click="window.execCmd('removeFormat')" title="Clear formatting"><i class="fas fa-eraser"></i></button>
            </div>
            <div style="flex:1"></div>
            <button class="btn" style="padding:6px 12px;font-size:12px;" x-on:click="window.generateDocx()"><i class="fas fa-download"></i> Export DOCX</button>
        </div>

        {/* Main Canvas Area */}
        <div style="background:var(--bg-secondary);padding:40px;min-height:700px;display:flex;justify-content:center">
            <div id="docx-visual-canvas" contentEditable={true} style="padding:80px;background:#fff;width:210mm;min-height:297mm;box-shadow:0 10px 30px rgba(0,0,0,0.1);outline:none;color:#333;font-family:'Times New Roman',serif;font-size:16px;line-height:1.6">
                <h1>Untitled Document</h1>
                <p>Start typing your content here or use the toolbar above to style the text.</p>
            </div>
        </div>
    </div>
);

export const docxScript = `
function execCmd(cmd, val=null) {
    document.execCommand(cmd, false, val);
}

function insertLinkPrompt() {
    const url = prompt('Enter the link URL:');
    if(url) execCmd('createLink', url);
}

function insertImagePrompt() {
    const url = prompt('Enter image URL:');
    if(url) execCmd('insertImage', url);
}

async function generateDocx() {
    if (!window.docx) {
        alert('DOCX library not loaded yet. Please wait.');
        return;
    }
    
    // We parse the HTML canvas into DOCX structure
    const canvas = document.getElementById('docx-visual-canvas');
    const title = canvas.querySelector('h1')?.innerText || 'Exported Document';
    
    // Generate sections from child nodes
    const children = [];
    canvas.childNodes.forEach(node => {
        if(node.nodeType === 3) { // Text
            if(node.textContent.trim()) {
                children.push(new docx.Paragraph({ text: node.textContent.trim() }));
            }
        } else if(node.nodeType === 1) { // Element
            const tag = node.tagName;
            if(tag === 'H1') {
                children.push(new docx.Paragraph({ text: node.innerText, heading: docx.HeadingLevel.HEADING_1 }));
            } else if (tag === 'H2') {
                children.push(new docx.Paragraph({ text: node.innerText, heading: docx.HeadingLevel.HEADING_2 }));
            } else if (tag === 'DIV' || tag === 'P') {
                children.push(new docx.Paragraph({ text: node.innerText }));
            } else if (tag === 'UL') {
                node.querySelectorAll('li').forEach(li => {
                    children.push(new docx.Paragraph({ text: li.innerText, bullet: { level: 0 } }));
                });
            } else if (tag === 'OL') {
                node.querySelectorAll('li').forEach((li, idx) => {
                    children.push(new docx.Paragraph({ text: li.innerText, numbering: { reference: 'main-numbering', level: 0 } }));
                });
            }
        }
    });

    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: children.length > 0 ? children : [new docx.Paragraph({ text: "Empty document" })],
        }],
    });
    
    docx.Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = title.slice(0, 30) + '.docx';
        a.click();
        URL.revokeObjectURL(url);
    });
}
`;
