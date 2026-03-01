/** @jsxImportSource hono/jsx */

export const pdfView = (
    <div id="composer-pdf" class="composer-pane card" style="display:none;margin-top:24px;padding:0;overflow:hidden;border:1px solid var(--border)">
        {/* Visual Toolbar for PDF */}
        <div class="editor-toolbar" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:2">
            <div class="toolbar-group" style="display:flex;gap:4px;border-right:1px solid var(--border);padding-right:8px">
                <button class="btn-tool" x-on:click="window.addPdfText()" title="Add Text Box"><i class="fas fa-font"></i> Add Text</button>
                <button class="btn-tool" x-on:click="window.addPdfImage()" title="Add Image"><i class="fas fa-image"></i> Add Image</button>
            </div>
            <div style="flex:1"></div>
            <button class="btn" style="padding:6px 12px;font-size:12px;" x-on:click="window.generatePdf()"><i class="fas fa-file-pdf"></i> Export PDF</button>
        </div>

        {/* Main PDF Visual Canvas Area */}
        <div id="pdf-container-scroller" style="background:var(--bg-secondary);padding:40px;height:700px;overflow:auto;display:flex;flex-direction:column;align-items:center">
            {/* Visual Layout Manager */}
            <div id="pdf-visual-canvas" style="position:relative;background:#fff;width:210mm;height:297mm;box-shadow:0 10px 30px rgba(0,0,0,0.1);user-select:none;border:1px dashed #ccc;overflow:hidden">
                <div style="position:absolute;top:50px;left:50px;font-size:32px;font-weight:700;cursor:move" class="pdf-el" contentEditable={true}>Heading Document</div>
                <div style="position:absolute;top:120px;left:50px;font-size:16px;width:600px;line-height:1.6;cursor:move" class="pdf-el" contentEditable={true}>Start editing your visual PDF. You can move elements around or add new ones.</div>
            </div>
        </div>
    </div>
);

export const pdfScript = `
function addPdfText() {
    const el = document.createElement('div');
    el.className = 'pdf-el';
    el.contentEditable = true;
    el.style.position = 'absolute';
    el.style.top = '200px';
    el.style.left = '50px';
    el.style.fontSize = '18px';
    el.style.width = '200px';
    el.innerText = 'New Text Box';
    el.style.cursor = 'move';
    document.getElementById('pdf-visual-canvas').appendChild(el);
}

function addPdfImage() {
    const url = prompt('Enter image URL:');
    if(!url) return;
    const img = document.createElement('img');
    img.className = 'pdf-el';
    img.src = url;
    img.style.position = 'absolute';
    img.style.top = '300px';
    img.style.left = '50px';
    img.style.width = '200px';
    img.style.cursor = 'move';
    document.getElementById('pdf-visual-canvas').appendChild(img);
}

async function generatePdf() {
    if (!window.PDFLib) {
        alert('PDF library not loaded yet. Please wait.');
        return;
    }

    const { PDFDocument, rgb } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    
    // We traverse all .pdf-el in the visual canvas
    const els = document.querySelectorAll('#pdf-visual-canvas .pdf-el');
    for(let el of els) {
        const rect = el.getBoundingClientRect();
        const canvasRect = document.getElementById('pdf-visual-canvas').getBoundingClientRect();
        
        // Scale factor (PDF is roughly 72dpi, screen A4 is 210mm = ~794px at 96dpi)
        const scale = 595 / 794; 
        
        const x = (rect.left - canvasRect.left) * scale;
        const y = height - ((rect.top - canvasRect.top) * scale) - (rect.height * scale);

        if(el.tagName === 'DIV') {
            const fontSize = parseInt(window.getComputedStyle(el).fontSize) * scale;
            page.drawText(el.innerText, {
                x: x,
                y: y,
                size: fontSize,
                maxWidth: rect.width * scale,
                lineHeight: fontSize * 1.2
            });
        } else if (el.tagName === 'IMG') {
            try {
                const imgBytes = await fetch(el.src).then(r => r.arrayBuffer());
                const img = el.src.includes('.png') ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
                page.drawImage(img, {
                    x: x,
                    y: y,
                    width: rect.width * scale,
                    height: rect.height * scale
                });
            } catch(e) { console.error('Failed to embed image:', e); }
        }
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visual_document.pdf';
    a.click();
    URL.revokeObjectURL(url);
}
`;
