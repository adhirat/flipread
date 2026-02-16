
import { escapeHtml } from './viewerUtils';

export function webViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean): string {
    const bg = (settings.background as string) || '#ffffff';
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${safeTitle} — Web View</title>
    <!-- Dependencies for different formats -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
    <script src="https://unpkg.com/docx-preview/dist/docx-preview.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.css">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root { --accent: ${accent}; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; background: ${bg}; color: #333; overflow-x: hidden; }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 { font-weight: 700; line-height: 1.2; margin-bottom: 1em; color: #111; }
        p { line-height: 1.8; margin-bottom: 1.5em; font-size: 1.125rem; color: #374151; }
        
        /* Structure */
        #hero { 
            position: relative; height: 60vh; min-height: 400px; 
            background-size: cover; background-position: center; 
            display: flex; align-items: flex-end; justify-content: center;
            color: white; text-align: center;
        }
        #hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)); }
        #hero-content { position: relative; z-index: 10; padding: 40px 20px; max-width: 800px; }
        #hero-title { font-size: clamp(2rem, 5vw, 4rem); text-shadow: 0 4px 12px rgba(0,0,0,0.5); margin-bottom: 10px; }
        #hero-meta { opacity: 0.9; font-size: 1rem; text-transform: uppercase; letter-spacing: 2px; }

        /* Navigation */
        #sticky-nav {
            position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0,0,0,0.1);
            padding: 0 20px; transition: transform 0.3s;
        }
        #nav-content {
            max-width: 900px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 60px;
        }
        #nav-title { font-weight: 700; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        #nav-title.visible { opacity: 1; }
        
        #toc-btn {
            display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600;
            cursor: pointer; padding: 8px 16px; border-radius: 20px; background: rgba(0,0,0,0.05);
            transition: 0.2s;
        }
        #toc-btn:hover { background: rgba(0,0,0,0.1); }
        
        /* Main Content */
        #content-wrapper { max-width: 800px; margin: 0 auto; padding: 60px 20px 100px; min-height: 100vh; }
        
        /* Dynamic Sections */
        .section-header { 
            margin-top: 80px; margin-bottom: 40px; padding-bottom: 20px; 
            border-bottom: 1px solid rgba(0,0,0,0.1); 
        }
        .section-header h2 { font-size: 2rem; margin: 0; color: var(--accent); }
        
        /* Rendered Content Styles */
        .page-content { margin-bottom: 60px; }
        .page-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        /* TOC Menu */
        #toc-menu {
            position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
            opacity: 0; pointer-events: none; transition: opacity 0.3s;
        }
        #toc-menu.open { opacity: 1; pointer-events: auto; }
        #toc-panel {
            position: absolute; right: 0; top: 0; bottom: 0; width: 320px; max-width: 80vw;
            background: white; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex; flex-direction: column;
        }
        #toc-menu.open #toc-panel { transform: translateX(0); }
        
        #toc-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        #toc-list { flex: 1; overflow-y: auto; padding: 10px 0; }
        .toc-item { 
            padding: 12px 20px; font-size: 0.95rem; cursor: pointer; border-left: 3px solid transparent; 
            transition: 0.2s; color: #555;
        }
        .toc-item:hover { background: #f9f9f9; color: var(--accent); }
        .toc-item.active { border-left-color: var(--accent); background: #f0f0f0; font-weight: 600; color: black; }
        
        /* Format Specific Overrides */
        .docx-wrapper { background: transparent !important; padding: 0 !important; }
        .docx { box-shadow: none !important; margin-bottom: 0 !important; padding: 0 !important; }
        
        /* Loading */
        #ld { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; transition: opacity 0.5s; }
    </style>
</head>
<body>
    <div id="ld">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-${accent} rounded-full animate-spin"></div>
        <p class="text-xs font-bold tracking-widest uppercase opacity-50">Generating Web Experience...</p>
    </div>

    <div id="hero" style="background-image: url('${coverUrl || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80'}')">
        <div id="hero-content">
            <h1 id="hero-title">${safeTitle}</h1>
            <p id="hero-meta">SCROLL TO READ</p>
        </div>
    </div>

    <nav id="sticky-nav">
        <div id="nav-content">
            <div id="nav-title">${safeTitle}</div>
            <div id="toc-btn" onclick="toggleTOC()">
                <i class="fas fa-list-ul"></i>
                <span>Table of Contents</span>
            </div>
        </div>
    </nav>

    <div id="content-wrapper">
        <!-- Dynamic Content Injected Here -->
    </div>

    <!-- TOC Modal -->
    <div id="toc-menu" onclick="toggleTOC()">
        <div id="toc-panel" onclick="event.stopPropagation()">
            <div id="toc-header">
                <span class="font-bold text-sm uppercase tracking-wider">Contents</span>
                <button onclick="toggleTOC()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">✕</button>
            </div>
            <div id="toc-list"></div>
        </div>
    </div>
    
    ${showBranding ? '<a href="https://flipread.pages.dev" target="_blank" style="position:fixed;bottom:20px;right:20px;font-size:10px;text-decoration:none;opacity:0.5;color:black;">Powered by FlipRead</a>' : ''}

    <script>
        // Init Vars
        const FU='${fileUrl}';
        const TYPE = FU.split('.').pop().toLowerCase(); // Ideally passed from backend but inferred here
        // We actually need the type passed properly, lets assume the caller handles logic or extends 
        // Logic to detect type via fetch content-type if not explicit.
        // For this demo we'll try to detect based on file extension from URL or specific rendering logic.
        
        // Sticky Header Logic
        const navTitle = document.getElementById('nav-title');
        const hero = document.getElementById('hero');
        window.addEventListener('scroll', () => {
            const h = hero.getBoundingClientRect().height;
            if(window.scrollY > h - 100) navTitle.classList.add('visible');
            else navTitle.classList.remove('visible');
            
            // Highlight active TOC
            highlightActiveSection();
        });

        function toggleTOC() {
            document.getElementById('toc-menu').classList.toggle('open');
        }

        async function init() {
            try {
                const res = await fetch(FU);
                const blob = await res.blob();
                const type = res.headers.get('content-type');
                
                if(type.includes('pdf')) await renderPDF(blob);
                else if(type.includes('epub')) await renderEPUB(blob); // EpubJS usually takes url/arraybuffer
                else if(type.includes('document') || FU.endsWith('.docx') || FU.endsWith('.doc')) await renderDOCX(blob);
                else if(type.includes('presentation') || FU.endsWith('.pptx')) await renderPPTX(FU); // PPTXJS needs URL
                else await renderEPUB(blob); // Default fallback

                document.getElementById('ld').style.opacity = '0';
                setTimeout(() => document.getElementById('ld').style.display = 'none', 500);
            } catch(e) {
                console.error(e);
                document.getElementById('ld').innerHTML = '<p class="text-red-500">Error loading content.</p>';
            }
        }

        async function renderPDF(blob) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            const data = await blob.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(data).promise;
            const container = document.getElementById('content-wrapper');
            const tocList = document.getElementById('toc-list');

            for (let i = 1; i <= pdf.numPages; i++) {
                // Create Section
                const section = document.createElement('div');
                section.id = 'page-' + i;
                section.className = 'page-content';
                
                // Add header for 'Page X' treating it as a chapter
                const head = document.createElement('div');
                head.className = 'section-header';
                head.innerHTML = '<h2>Page ' + i + '</h2>';
                section.appendChild(head);

                const canvas = document.createElement('canvas');
                canvas.className = 'w-full h-auto shadow-lg';
                section.appendChild(canvas);
                container.appendChild(section);

                // Render
                pdf.getPage(i).then(page => {
                    const vp = page.getViewport({ scale: 1.5 });
                    canvas.width = vp.width;
                    canvas.height = vp.height;
                    page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
                });

                // Add TOC
                const item = document.createElement('div');
                item.className = 'toc-item';
                item.innerText = 'Page ' + i;
                item.onclick = () => {  
                    document.getElementById('page-'+i).scrollIntoView({behavior:'smooth'});
                    toggleTOC();
                };
                tocList.appendChild(item);
            }
        }

        async function renderDOCX(blob) {
            const container = document.getElementById('content-wrapper');
            // docx-preview renders everything into a div. We can't easily split by pages/sections purely.
            // But we can try to inject it and then maybe parse headers for TOC.
            
            const wrapper = document.createElement('div');
            container.appendChild(wrapper);
            
            await docx.renderAsync(blob, wrapper);
            
            // Post-process for TOC based on headers
            const headers = wrapper.querySelectorAll('h1, h2, h3');
            const tocList = document.getElementById('toc-list');
            
            if(headers.length === 0) {
                 tocList.innerHTML = '<div class="p-4 text-xs opacity-50">No sections found.</div>';
                 return;
            }

            headers.forEach((h, i) => {
                h.id = 'section-' + i;
                const item = document.createElement('div');
                item.className = 'toc-item';
                item.innerText = h.innerText;
                item.style.paddingLeft = (parseInt(h.tagName[1]) * 10) + 'px';
                item.onclick = () => {
                    h.scrollIntoView({behavior:'smooth'});
                    toggleTOC();
                };
                tocList.appendChild(item);
            });
        }
        
        async function renderPPTX(url) {
             const container = document.getElementById('content-wrapper');
             // PPTXJS renders typically as slides.
             // We will try to force it to render slides vertically?
             // pptxjs default is a slide container.
             // Limitation: customization is harder here without parsing manually.
             // For web view, let's just make it a list of slide images if possible or use the div method.
             
             // Since PPTXJS is mainly for slideshows, let's use a workaround:
             // We can't easily extract "one page website" feel from standard PPTX JS libs without converting to images.
             // Fallback: Just render the standard viewer logic but injected into our container
             $(container).pptxToHtml({
                 pptxFileUrl: url,
                 slideMode: false,
                 slidesScale: "100%",
                 keyBoardShortCut: false
             });
             
             // Wait for render then build TOC from slides
             setTimeout(() => {
                 const slides = container.querySelectorAll('.slide');
                 const tocList = document.getElementById('toc-list');
                 slides.forEach((s, i) => {
                     let title = "Slide " + (i+1);
                     // try to find text
                     const t = s.innerText.substring(0, 20);
                     if(t.length > 2) title = t + "...";
                     
                     s.id = 'slide-' + i;
                     
                     const item = document.createElement('div');
                     item.className = 'toc-item';
                     item.innerText = title;
                     item.onclick = () => {
                         s.scrollIntoView({behavior:'smooth'});
                         toggleTOC();
                     };
                     tocList.appendChild(item);
                 });
             }, 3000);
        }

        async function renderEPUB(blob) {
            const container = document.getElementById('content-wrapper');
            const book = ePub(blob);
            const tocList = document.getElementById('toc-list');
            
            // Web View for Epub is tricky because Epub.js is designed for pagination/spreads.
            // To make it continuous vertical scroll: 
            // We need to load each section (spine item) and append it to the DOM.
            // This is heavy for large books. "Flow: scrolled" might work but it's an iframe usually.
            
            // Approach: Load spine items one by one and append their content.
            
            await book.ready;
            const spine = book.spine;
            
            for (const item of spine.spineItems) {
                const doc = await item.load(book.load.bind(book));
                // Extract body content
                const content = document.createElement('div');
                content.className = 'page-content';
                content.id = 'chapter-' + item.index;
                
                // Sanitized injection? Epub content is usually safe-ish HTML, but be careful.
                // We'll trust the source for now or assume internal books.
                // Better: iterate body children and clone.
                const body = doc.body;
                
                // Fix image paths (they are relative in epub)
                // Epub.js handles this inside its renderer/iframe. Doing it manually is hard.
                // BETTER APPROACH: Use book.renderTo with flow: "scrolled-doc" if supported or multiple renderers.
                
                // Let's use the standard "scrolled" flow in a tall div.
                // Actually, simply using manager: "continuous" flow: "scrolled" in one big div 
                // is the official way for vertical scroll.
                break; // Switch strategy
            }
            
            // Correct Strategy for Vertical Scrolling Epub
            container.innerHTML = ''; // clear
            const rend = book.renderTo(container, {
                flow: "scrolled",
                manager: "continuous",
                width: "100%",
                height: "100%" 
            });
            await rend.display();
            
            // Generate TOC
            const toc = await book.loaded.navigation;
            toc.toc.forEach(chapter => {
               const item = document.createElement('div');
               item.className = 'toc-item';
               item.innerText = chapter.label.trim();
               item.onclick = () => {
                   rend.display(chapter.href);
                   toggleTOC();
               };
               tocList.appendChild(item);
            });
        }
        
        function highlightActiveSection() {
            // Find which section is in view
            // Implementation depends on format (div IDs)
            // generic logic:
            const headers = document.querySelectorAll('.section-header, .slide, .page-content');
            let current = '';
            headers.forEach(h => {
                const rect = h.getBoundingClientRect();
                if(rect.top < 100) current = h.innerText || h.id; 
            });
            // highlight corresponding toc item...
        }

        init();
    </script>
</body>
</html>`;
}
