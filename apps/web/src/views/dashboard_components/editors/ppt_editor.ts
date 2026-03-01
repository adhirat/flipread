
export const pptView = `
<div id="composer-ppt" class="composer-pane card" style="display:none;margin-top:24px;padding:0;overflow:hidden;border:1px solid var(--border)">
    <!-- Visual Toolbar for PPT -->
    <div class="editor-toolbar" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:2">
        <h3 style="margin:0;font-size:16px"><i class="fas fa-file-powerpoint text-secondary"></i> Visual Presentation Editor (Reveal.js)</h3>
        <div style="flex:1"></div>
        <button class="btn" style="padding:6px 12px;font-size:12px;" onclick="previewPpt()"><i class="fas fa-play"></i> Sync Preview</button>
        <button class="btn-outline" style="padding:6px 12px;font-size:12px;" onclick="generatePpt()"><i class="fas fa-download"></i> Export HTML</button>
    </div>

    <!-- PPT Visual Split Layout -->
    <div style="display:flex;height:700px;background:var(--bg-secondary)">
        <!-- LEFT: Slide Markdown Canvas -->
        <div style="flex:1;padding:32px;border-right:1px solid var(--border);display:flex;flex-direction:column;gap:16px;background:#fff">
           <div class="form-group" style="flex:1;display:flex;flex-direction:column">
              <label>Define Slide Content (Markdown)</label>
              <textarea id="ppt-markdown" style="flex:1;font-family:monospace;padding:16px;font-size:14px;line-height:1.5;border:1px solid var(--border);border-radius:8px;outline:none" placeholder="# Slide 1 Heading\\n\\nSlide 1 content.\\n\\n---\\n\\n# Slide 2 Heading\\n\\nSlide 2 content."># SHOPUBLISH Presentation\\n\\nAdvanced Visual Editor powered by Reveal.js\\n\\n---\\n\\n# Dynamic Transitions\\n\\nSupports markdown-based slide generation\\n\\n---\\n\\n# Multi-Platform\\n\\nResponsive and elegant</textarea>
           </div>
        </div>

        <!-- RIGHT: Visual Preview Canvas -->
        <div style="flex:1;padding:32px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg-secondary)">
           <div id="ppt-preview-container" style="width:100%; height:400px; border:1px solid var(--border); border-radius:12px; position:relative; overflow:hidden; background:#000; box-shadow:0 20px 50px rgba(0,0,0,0.3)">
              <div class="reveal" id="reveal-canvas">
                <div class="slides" id="ppt-slides-container"></div>
              </div>
           </div>
           <p style="margin-top:20px;font-size:12px;color:var(--text-muted)"><i class="fas fa-info-circle"></i> Slides are automatically generated based on "---" separator.</p>
        </div>
    </div>
</div>
`;

export const pptScript = `
let revealInitialized = false;

function previewPpt() {
    if (!window.Reveal) {
        alert('Reveal.js library not loaded. Please wait and try again.');
        return;
    }
    
    const markdown = document.getElementById('ppt-markdown').value || '';
    if (!markdown) return;

    const slidesContainer = document.getElementById('ppt-slides-container');
    slidesContainer.innerHTML = '';
    
    // Split on "---"
    const slides = markdown.split('\\n---\\n');
    slides.forEach(slideMd => {
        let htmlContent = slideMd
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
            .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
            .replace(/\\n/gim, '<br>');

        const section = document.createElement('section');
        section.innerHTML = htmlContent;
        slidesContainer.appendChild(section);
    });

    if (!revealInitialized) {
        window.Reveal.initialize({
            embedded: true,
            controls: true,
            progress: true,
            center: true,
            keyboard: true,
            hash: false
        }, document.querySelector('#reveal-canvas')).then(() => {
            window.Reveal.layout();
        });
        revealInitialized = true;
    } else {
        window.Reveal.sync();
        window.Reveal.slide(0);
    }
}

function generatePpt() {
    const markdown = document.getElementById('ppt-markdown').value || '';
    if (!markdown) {
        alert('Please enter some markdown to download.');
        return;
    }

    const slides = markdown.split('\\n---\\n');
    const slideHtmlElements = slides.map(slideMd => {
        let ht = slideMd
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
            .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
            .replace(/\\n/gim, '<br>');
        return '<section>' + ht + '</section>';
    }).join('\\n');

    const htmlDoc = \`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Presentation</title>
    <style>body { font-family: sans-serif; margin: 0; background: #000; }</style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/reveal.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/theme/black.min.css">
</head>
<body>
    <div class="reveal">
        <div class="slides">
            \${slideHtmlElements}
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/reveal.min.js"><\\/script>
    <script>
        Reveal.initialize({ controls: true, progress: true, center: true, hash: true });
    <\\/script>
</body>
</html>\`;

    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.html';
    a.click();
    URL.revokeObjectURL(url);
}
`;
