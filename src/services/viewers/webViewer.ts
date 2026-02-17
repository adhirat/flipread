
import { escapeHtml } from './viewerUtils';

export function webViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = ''): string {
    const bg = (settings.background as string) || '#ffffff';
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${safeTitle} — Web View</title>
    <link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
    <link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">
    <meta property="og:title" content="${safeTitle} — FlipRead">
    <meta property="og:description" content="Read this interactive flipbook on FlipRead.">
    <meta property="og:image" content="${coverUrl || logoUrl || '/logo.png'}">
    <meta name="twitter:card" content="summary_large_image">
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
        
        #texture-overlay { 
            position: fixed; inset: 0; pointer-events: none; z-index: 10; opacity: 0.05; 
            background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png'); 
            display: none; 
        }
        body.textured #texture-overlay { display: block; }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 { font-weight: 700; line-height: 1.2; margin-bottom: 1em; color: #111; }
        p { line-height: 1.8; margin-bottom: 1.5em; font-size: 1.125rem; color: #374151; }
        
        /* Main Content */
        #content-wrapper { width: 100%; margin: 0 auto; padding: 40px 0 200px 0; min-height: calc(100vh - 60px); }
        
        /* Dynamic Sections */
        .page-content { margin: 0; padding: 0; }
        .section-header { 
            margin-top: 40px; margin-bottom: 30px; padding: 10px 0; 
            display: flex; justify-content: center; align-items: center;
        }
        .pg-elegant {
            font-size: 9px; font-weight: 800; color: #9ca3af;
            background: rgba(0,0,0,0.03); width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; border: 1px solid rgba(0,0,0,0.05);
            margin: 0 auto; box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        
        /* Rendered Content Styles */
        .page-content { margin-bottom: 60px; }
        .page-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        /* TOC Menu */
        #toc-menu {
            position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
            opacity: 0; pointer-events: none; transition: opacity 0.3s;
        }
        #toc-menu.open { opacity: 1; pointer-events: auto; }
        #toc-panel {
            position: absolute; left: 0; top: 0; bottom: 0; width: 320px; max-width: 80vw;
            background: white; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex; flex-direction: column; border-right: 1px solid rgba(0,0,0,0.1);
        }
        #toc-menu.open #toc-panel { transform: translateX(0); }
        
        @media (max-width: 768px) {
            #toc-panel { width: 100% !important; max-width: 100vw !important; }
        }
        
        #toc-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        #toc-list { flex: 1; overflow-y: auto; padding: 10px 0; }
        .toc-item { 
            padding: 12px 20px; font-size: 0.95rem; cursor: pointer; border-left: 3px solid transparent; 
            transition: 0.2s; color: #555;
        }
        .toc-item:hover { background: #f9f9f9; color: var(--accent); }
        .toc-item.active { border-left-color: var(--accent); background: #f0f0f0; font-weight: 600; color: black; }
        
        /* Highlights Menu */
        .hl-yellow { background-color: rgba(255, 235, 59, 0.4); border-bottom: 2px solid #fdd835; cursor: pointer; }
        .hl-green { background-color: rgba(165, 214, 167, 0.4); border-bottom: 2px solid #66bb6a; cursor: pointer; }
        .hl-blue { background-color: rgba(144, 202, 249, 0.4); border-bottom: 2px solid #42a5f5; cursor: pointer; }
        .hl-pink { background-color: rgba(244, 143, 177, 0.4); border-bottom: 2px solid #ec407a; cursor: pointer; }
        .hl-purple { background-color: rgba(206, 147, 216, 0.4); border-bottom: 2px solid #ab47bc; cursor: pointer; }
        
        #hl-menu { position: absolute; z-index: 1000; background: rgba(30,30,30,0.95); backdrop-filter: blur(10px); padding: 8px; border-radius: 50px; display: none; gap: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); transform: translateX(-50%); }
        .hl-btn { width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: transform 0.2s; }
        .hl-btn:hover { transform: scale(1.2); border-color: white; }

        /* Chat Sidebar */
        #chat-w { position: fixed; right: -100vw; top: 0; bottom: 0; width: 100vw; background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); z-index: 2500; border-left: 1px solid rgba(0,0,0,0.1); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; box-shadow: none; }
        @media (min-width: 640px) { #chat-w { width: 400px; right: -450px; } }
        #chat-w.o { right: 0; box-shadow: -20px 0 50px rgba(0,0,0,0.1); }
        .chat-h { padding: 15px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
        .chat-tabs { display: flex; border-bottom: 1px solid rgba(0,0,0,0.05); background: rgba(0,0,0,0.02); }
        .chat-tab { flex: 1; padding: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; cursor: pointer; opacity: 0.5; border-bottom: 2px solid transparent; transition: 0.2s; }
        .chat-tab.active { opacity: 1; border-color: ${accent}; background: rgba(0,0,0,0.05); }
        .chat-b { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .chat-tab-c { display: none; width: 100%; flex-direction: column; gap: 12px; }
        .chat-tab-c.active { display: flex; }
        .chat-item { background: white; padding: 12px; border-radius: 8px; font-size: 13px; border: 1px solid rgba(0,0,0,0.05); position: relative; }
        .chat-del, .chat-edit { opacity: 0.6; cursor: pointer; transition: 0.2s; padding: 4px; }
        @media (min-width: 1024px) { .chat-del, .chat-edit { opacity: 0; } }
        .chat-del { color: #ef4444; }
        .chat-edit { color: var(--accent); }
        .chat-item:hover .chat-del, .chat-item:hover .chat-edit { opacity: 1; }
        
        .chat-f { padding: 15px; border-top: 1px solid rgba(0,0,0,0.05); display: flex; gap: 8px; background: rgba(0,0,0,0.02); }
        .chat-i { flex: 1; background: white; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 10px; outline: none; font-size: 13px; resize: none; min-height: 40px; max-height: 120px; font-family: inherit; }
        .chat-s { width: 40px; border-radius: 8px; background: ${accent}; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; }
        
        /* Loading */
        #ld { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; transition: opacity 0.5s; }
        /* Settings Modal */
        #set-m {
            position: fixed; top: 70px; right: 20px; z-index: 2000; background: white;
            padding: 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            width: 300px; display: none; flex-direction: column; gap: 16px;
            border: 1px solid rgba(0,0,0,0.05);
        }
        /* Header */
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
            border-bottom: none;
            color: white;
            height: 60px;
            z-index: 1000;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .header.up {
            transform: translateY(0);
            opacity: 1;
        }
        .header.down {
            transform: translateY(-100%);
            opacity: 0;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 10px;
            pointer-events: auto;
            flex: 1;
        }

        .header-name {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 40vw;
            pointer-events: auto;
            text-align: center;
            color: #fff;
        }

        .header-icons {
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: flex-end;
            pointer-events: auto;
            flex: 1;
        }
        
        .header-logo {
            height: 32px;
            width: auto;
            max-width: 120px;
            object-fit: contain;
            border-radius: 4px;
        }

        .header-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #fff;
            font-size: 14px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-decoration: none;
        }

        .header-icon:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }

        /* Footer Controls */
        .controls {
            display: none;
            align-items: center;
            justify-content: center;
            gap: 15px;
            padding: 10px 15px;
            background: rgba(20, 20, 20, 0.95);
            backdrop-filter: blur(15px);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 2000;
            pointer-events: auto;
            transition: transform 0.3s ease;
        }
        .controls.down { transform: translateY(100%); }
        .controls.up { transform: translateY(0); }

        .footer-icons-mobile {
            display: none;
            gap: 12px;
            align-items: center;
            justify-content: center;
            flex: 1;
        }

        .footer-icons-mobile .header-icon {
            margin: 0;
            width: 32px;
            height: 32px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
        }

        @media (max-width: 768px) {
            .header-icons {
                display: flex !important;
                gap: 8px;
            }
            .header-icons > button:not(#notes-btn):not(#settings-btn) { display: none !important; }
            /* Keep standard view (a tag) visible as requested */
            .header-icons > a#standard-btn { display: flex !important; }

            .header-icons .header-icon {
                width: 32px;
                height: 32px;
                font-size: 14px;
            }
            
            .header-logo {
                display: block !important;
                height: 24px !important;
                width: 24px !important;
            }

            .controls {
                display: flex !important;
            }
            .footer-icons-mobile {
                display: flex !important;
            }


            .header-left .header-name {
                display: none;
            }
            .header-name {
                position: static !important;
                transform: none !important;
                max-width: 50vw;
                font-size: 13px;
                color: #fff;
                text-align: left;
                margin-left: 0;
            }
            #set-m { 
                top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; 
                width: 100vw !important; height: 100vh !important; 
                border-radius: 0 !important; z-index: 3000 !important;
            }
        }

        #scroll-top {
            position: fixed; bottom: 30px; right: 30px; width: 45px; height: 45px;
            background: var(--accent); color: white; border: none; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; z-index: 1500; opacity: 0; visibility: hidden;
            transition: 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        #scroll-top.v { opacity: 1; visibility: visible; }
        #scroll-top:hover { transform: scale(1.1); }

        
        /* Ensure EPUB canvas/iframe fills space */
        .epub-container { height: calc(100vh - 60px) !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
        #content-wrapper iframe { border: none !important; }
    </style>
</head>
<body class="up">
    <div id="texture-overlay"></div>
    <button id="scroll-top" onclick="window.scrollTo({top:0, behavior:'smooth'})">
        <i class="fas fa-chevron-up"></i>
    </button>
    <div id="ld">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-${accent} rounded-full animate-spin"></div>
        <p class="text-xs font-bold tracking-widest uppercase opacity-50">Generating Web Experience...</p>
    </div>

    <!-- Highlight Menu -->
    <div id="hl-menu">
         <div class="hl-btn" style="background:#ffeb3b" onclick="addHighlight('yellow')"></div>
         <div class="hl-btn" style="background:#a5d6a7" onclick="addHighlight('green')"></div>
         <div class="hl-btn" style="background:#90caf9" onclick="addHighlight('blue')"></div>
         <div class="hl-btn" style="background:#f48fb1" onclick="addHighlight('pink')"></div>
         <div class="hl-btn" style="background:#ce93d8" onclick="addHighlight('purple')"></div>
    </div>

    <header class="header up" id="main-header">
        <div class="header-left">
            <button class="header-icon" onclick="toggleTOC()" title="Contents">
                <i class="fas fa-list-ul"></i>
            </button>
            <img src="${logoUrl || '/logo.png'}" alt="Logo" class="header-logo" />
            <div class="header-name">${safeTitle}</div>
        </div>
        <div class="header-icons">
            <button class="header-icon" onclick="window.shareSocial('twitter')" title="Share on Twitter"><i class="fab fa-twitter"></i></button>
            <button class="header-icon" onclick="window.shareSocial('facebook')" title="Share on Facebook"><i class="fab fa-facebook"></i></button>
            <button class="header-icon" onclick="window.copyLink()" title="Copy Link"><i class="fas fa-link"></i></button>
            
            <a href="?mode=standard" class="header-icon" id="standard-btn" title="Standard View">
                <i class="fas fa-book-open"></i>
            </a>
            <button class="header-icon" id="settings-btn" onclick="toggleSettings()" title="Settings">
                <i class="fas fa-palette"></i>
            </button>
            <button class="header-icon" id="notes-btn" onclick="toggleChat()" title="Notes">
                <i class="fas fa-pen-fancy"></i>
            </button>
        </div>
    </header>

    <div class="controls up" id="main-footer">
        <div class="footer-icons-mobile">
            <button class="header-icon" onclick="window.shareSocial('twitter')" title="Twitter"><i class="fab fa-twitter"></i></button>
            <button class="header-icon" onclick="window.shareSocial('facebook')" title="Facebook"><i class="fab fa-facebook"></i></button>
            <button class="header-icon" onclick="window.copyLink()" title="Copy Link"><i class="fas fa-link"></i></button>
            <a href="?mode=standard" class="header-icon" title="Standard View"><i class="fas fa-book-open"></i></a>
        </div>
    </div>

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
    
    <!-- Chat/Notes Sidebar -->
    <div id="chat-w">
        <div class="chat-h">
            <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">My Notes</span>
            <button onclick="toggleChat()" class="opacity-40 hover:opacity-100">✕</button>
        </div>
        <div class="chat-tabs">
            <div class="chat-tab active" data-tab="chat-notes" onclick="switchSidebarTab(this)">Notes</div>
            <div class="chat-tab" data-tab="chat-highlights" onclick="switchSidebarTab(this)">Highlights</div>
        </div>
        <div class="chat-b">
            <div id="chat-notes" class="chat-tab-c active"></div>
            <div id="chat-highlights" class="chat-tab-c">
                <p class="text-xs text-center opacity-40 py-10">Select text in the book to highlight (EPUB only).</p>
                <div id="hi-list"></div>
            </div>
        </div>
        <div class="chat-f" id="chat-footer">
            <textarea id="chat-i" placeholder="Add a multi-line note..." class="chat-i" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendNote()}"></textarea>
            <button onclick="sendNote()" class="chat-s"><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>

    <script>
        const FU='${fileUrl}';
        let bookRender = null;
        let highlights = [];
        try{ highlights = JSON.parse(localStorage.getItem('fr_hi_'+FU)) || []; }catch(e){}

        // --- Layout Utils ---
        let lastS = 0;
        const ftr = document.getElementById('main-footer');
        const stBtn = document.getElementById('scroll-top');

        window.addEventListener('scroll', () => {
             const curS = window.scrollY;
             // Header & Footer Hiding
             if (curS > lastS && curS > 100) {
                 hdr.classList.remove('up');
                 hdr.classList.add('down');
                 ftr.classList.remove('up');
                 ftr.classList.add('down');
             } else {
                 hdr.classList.remove('down');
                 hdr.classList.add('up');
                 ftr.classList.remove('down');
                 ftr.classList.add('up');
             }
             lastS = curS;

             // Scroll Top Button
             if (curS > 400) stBtn.classList.add('v');
             else stBtn.classList.remove('v');
        });

        function toggleTOC() { document.getElementById('toc-menu').classList.toggle('open'); }
        
        window.shareSocial = (p) => {
            const u = encodeURIComponent(window.location.href);
            const t = encodeURIComponent('${safeTitle} on FlipRead');
            let url = '';
            if(p === 'twitter') url = \`https://twitter.com/intent/tweet?url=\${u}&text=\${t}\`;
            if(p === 'facebook') url = \`https://www.facebook.com/sharer/sharer.php?u=\${u}\`;
            if(p === 'linkedin') url = \`https://www.linkedin.com/sharing/share-offsite/?url=\${u}\`;
            if(url) window.open(url, '_blank', 'width=600,height=400');
        };
        
        window.copyLink = () => {
             navigator.clipboard.writeText(window.location.href);
             alert('Link copied!');
        };

        function toggleChat() { 
            const w = document.getElementById('chat-w');
            w.classList.toggle('o');
            if(w.classList.contains('o')) { renderNotes(); renderHighlights(); }
        }
        
        window.switchSidebarTab = (el) => {
             const tabId = el.getAttribute('data-tab');
             document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
             document.querySelectorAll('.chat-tab-c').forEach(c => c.classList.remove('active'));
             el.classList.add('active');
             document.getElementById(tabId).classList.add('active');
             document.getElementById('chat-footer').style.display = tabId === 'chat-highlights' ? 'none' : 'flex';
        };

        async function init() {
            try {
                const res = await fetch(FU);
                const blob = await res.blob();
                const type = res.headers.get('content-type');
                
                if(type.includes('pdf')) {
                    document.getElementById('settings-btn').style.display = 'none';
                    await renderPDF(blob);
                }
                else if(type.includes('epub')) await renderEPUB(blob);
                else if(type.includes('document') || FU.endsWith('.docx') || FU.endsWith('.doc')) await renderDOCX(blob);
                else if(type.includes('presentation') || FU.endsWith('.pptx')) await renderPPTX(FU);
                else await renderEPUB(blob);

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
                const section = document.createElement('div');
                section.id = 'page-' + i;
                section.className = 'page-content';
                
                const head = document.createElement('div');
                head.className = 'section-header';
                head.innerHTML = '<div class="pg-elegant">' + i + '</div>';
                section.appendChild(head);

                const canvas = document.createElement('canvas');
                canvas.className = 'w-full h-auto shadow-lg';
                section.appendChild(canvas);
                container.appendChild(section);

                pdf.getPage(i).then(page => {
                    const vp = page.getViewport({ scale: 1.5 });
                    canvas.width = vp.width;
                    canvas.height = vp.height;
                    page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
                });

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
            const wrapper = document.createElement('div');
            container.appendChild(wrapper);
            await docx.renderAsync(blob, wrapper);
            
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
                item.onclick = () => { h.scrollIntoView({behavior:'smooth'}); toggleTOC(); };
                tocList.appendChild(item);
            });
        }
        
        async function renderPPTX(url) {
             const container = document.getElementById('content-wrapper');
             $(container).pptxToHtml({
                 pptxFileUrl: url,
                 slideMode: false,
                 slidesScale: "100%",
                 keyBoardShortCut: false
             });
             setTimeout(() => {
                 const slides = container.querySelectorAll('.slide');
                 const tocList = document.getElementById('toc-list');
                 slides.forEach((s, i) => {
                     let title = "Slide " + (i+1);
                     const t = s.innerText.substring(0, 20);
                     if(t.length > 2) title = t + "...";
                     s.id = 'slide-' + i;
                     const item = document.createElement('div');
                     item.className = 'toc-item';
                     item.innerText = title;
                     item.onclick = () => { s.scrollIntoView({behavior:'smooth'}); toggleTOC(); };
                     tocList.appendChild(item);
                 });
             }, 3000);
        }

        async function renderEPUB(blob) {
            const container = document.getElementById('content-wrapper');
            container.innerHTML = '';
            const book = ePub(blob);
            const tocList = document.getElementById('toc-list');

            // Continuous Scrolled View
            // Continuous Scrolled View
            // 'scrolled' flow creates a continuous vertical view.
            const bookRender = book.renderTo(container, {
                flow: "scrolled",
                manager: "continuous",
                width: "100%"
            });
            document.getElementById('settings-btn').style.display='flex';
            await bookRender.display();
            
            // Remove margin/padding from internal EPUB body and sync height
            bookRender.hooks.content.register(contents => {
                const doc = contents.document;
                const win = contents.window;
                
                const style = doc.createElement('style');
                style.innerHTML = \`
                    body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
                    html { height: auto !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
                    .epubjs-view { margin: 0 !important; padding: 0 !important; }
                \`;
                doc.head.appendChild(style);

                // Auto-resize iframe to fit content
                const resize = () => {
                    const h = doc.documentElement.scrollHeight;
                    const iframe = win.frameElement;
                    if(iframe && h > 0) {
                        iframe.style.height = h + 'px';
                    }
                };
                
                // Observe size changes
                const ro = new ResizeObserver(resize);
                ro.observe(doc.body);
                
                // Initial resize + image loads
                resize();
                win.addEventListener('load', resize);
                Array.from(doc.images).forEach(img => {
                    img.onload = resize;
                });
            });
            
            // TOC
            const navigation = await book.loaded.navigation;
            navigation.toc.forEach(chapter => {
               const item = document.createElement('div');
               item.className = 'toc-item';
               item.innerText = chapter.label.trim();
               item.onclick = () => {
                   bookRender.display(chapter.href);
                   toggleTOC();
               };
               tocList.appendChild(item);
            });
            
            // Selection / Highlight Hook
            bookRender.on("selected", (cfiRange, contents) => {
                  book.getRange(cfiRange).then(range => {
                      const sel = contents.window.getSelection();
                      if(!sel.rangeCount) return;
                      
                      // Using the iframe's rect to position
                      const iframe = container.querySelector('iframe');
                      const iframeRect = iframe.getBoundingClientRect();
                      const rect = sel.getRangeAt(0).getBoundingClientRect();
                      
                      const menu = document.getElementById('hl-menu');
                      // Position menu near selection (accounting for iframe offset)
                      menu.style.top = (window.scrollY + iframeRect.top + rect.top - 50) + 'px';
                      menu.style.left = (iframeRect.left + rect.left + rect.width/2) + 'px';
                      menu.style.display = 'flex';
                      
                      window.currentSelection = { cfiRange, text: range.toString(), contents };
                  });
            });
            
            // Inject Highlight CSS
            bookRender.hooks.content.register(contents => {
                  const style = contents.document.createElement('style');
                  style.innerHTML = \`
                      ::selection { background: rgba(255, 165, 0, 0.3); }
                      .hl-yellow { background-color: rgba(255, 235, 59, 0.4); }
                      .hl-green { background-color: rgba(165, 214, 167, 0.4); }
                      .hl-blue { background-color: rgba(144, 202, 249, 0.4); }
                      .hl-pink { background-color: rgba(244, 143, 177, 0.4); }
                      .hl-purple { background-color: rgba(206, 147, 216, 0.4); }
                  \`;
                  contents.document.head.appendChild(style);
                  contents.document.body.onclick = () => { 
                      if(contents.window.getSelection().toString().length > 0) return;
                      document.getElementById('hl-menu').style.display = 'none'; 
                  };
            });
            
            // Restore Highlights
            book.ready.then(() => {
                highlights.forEach(h => {
                    try { bookRender.annotations.add("highlight", h.cfi, {}, null, 'hl-' + (h.c || 'yellow')); } catch(e){}
                });
            });

            // Handle Resize
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if(bookRender) bookRender.resize(); 
                }, 250);
            });
            
            // Apply saved settings
            book.ready.then(() => {
                const fs = localStorage.getItem('fr_web_fs');
                const ff = localStorage.getItem('fr_web_ff');
                if(fs) changeFontSize(0); // Applies current fs
                if(ff) setFont(ff);
            });
        }
        
        // --- Typography Logic ---
        let wfz = parseInt(localStorage.getItem('fr_web_fs') || '100');
        let wff = localStorage.getItem('fr_web_ff') || 'Inter, system-ui, sans-serif';
        
        window.changeFontSize = (d) => {
            wfz = Math.max(50, Math.min(200, wfz + d));
            document.getElementById('wfz-v').textContent = wfz + '%';
            localStorage.setItem('fr_web_fs', wfz);
            if(bookRender) {
                bookRender.themes.fontSize(wfz + "%");
            }
        };
        
        window.setFont = (f) => {
            wff = f;
            localStorage.setItem('fr_web_ff', wff);
            if(bookRender) {
                bookRender.themes.font(wff);
            }
        };
        
        window.toggleSettings = () => {
            document.getElementById('set-m').classList.toggle('open');
            // Update UI
            document.getElementById('wfz-v').textContent = wfz + '%';
            document.getElementById('wff-s').value = wff;
        };
        
        // --- Notes Logic ---
        let editingNoteIndex = -1;
        window.sendNote = () => {
            const i = document.getElementById('chat-i'), v = i.value.trim();
            if(!v) return;
            let notes = [];
            try { 
                notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
            } catch(e) {}
            
            if(editingNoteIndex > -1) {
                notes[editingNoteIndex].text = v;
                editingNoteIndex = -1;
                document.querySelector('#chat-footer .chat-s i').className = 'fas fa-paper-plane';
            } else {
                notes.push({text: v, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})});
            }
            localStorage.setItem('fr_nt_'+FU, JSON.stringify(notes));
            i.value = '';
            renderNotes();
        };

        window.renderNotes = () => {
             const b = document.getElementById('chat-notes');
             if(!b) return;
             let notes = [];
             try { notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || []; } catch(e) {}
             b.innerHTML = notes.map((n, i) => 
                 '<div class=\"chat-item\">' +
                 '<p class=\"whitespace-pre-wrap\">' + n.text + '</p>' +
                 '<div class=\"flex justify-between items-center mt-2\">' +
                     '<span class=\"text-[10px] opacity-40\">' + n.time + '</span>' +
                     '<div class=\"flex gap-2\">' +
                         '<i class=\"fas fa-edit chat-edit\" onclick=\"editNote('+i+')\"></i>' +
                         '<i class=\"fas fa-trash chat-del\" onclick=\"deleteNote('+i+')\"></i>' +
                     '</div>' +
                 '</div>' +
                 '</div>'
             ).join('');
             b.scrollTop = b.scrollHeight;
        };

        window.editNote = (i) => {
             let notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
             if(!notes[i]) return;
             const input = document.getElementById('chat-i');
             input.value = notes[i].text;
             input.focus();
             editingNoteIndex = i;
             document.querySelector('#chat-footer .chat-s i').className = 'fas fa-check';
        };
        
        window.deleteNote = (i) => {
             if(!confirm('Delete note?')) return;
             let notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
             notes.splice(i, 1);
             localStorage.setItem('fr_nt_'+FU, JSON.stringify(notes));
             renderNotes();
        };

        // --- Highlight Logic (EPUB) ---
        window.addHighlight = (color) => {
              const sel = window.currentSelection;
              if(!sel) return;
              document.getElementById('hl-menu').style.display='none';
              
              if(bookRender) {
                  bookRender.annotations.add("highlight", sel.cfiRange, {}, null, 'hl-' + color);
                  sel.contents.window.getSelection().removeAllRanges();
                  
                  highlights.push({t: sel.text, cfi: sel.cfiRange, d: new Date().toLocaleDateString(), c: color});
                  localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
                  renderHighlights();
              }
        };
        
        window.renderHighlights = () => {
             const b = document.getElementById('hi-list');
             if(!b) return;
             if(highlights.length === 0) { b.innerHTML = ''; return; }
             
             const getColorCode = (c) => {
                 const map = { yellow:'#fdd835', green:'#66bb6a', blue:'#42a5f5', pink:'#ec407a', purple:'#ab47bc' };
                 return map[c] || map['yellow'];
             };

             b.innerHTML = highlights.map((h, i) => 
                 '<div class=\"chat-item flex justify-between items-start group cursor-pointer hover:bg-gray-50\" onclick=\"if(bookRender) bookRender.display(\\\'' + h.cfi + '\\\')\">' +
                 '<div class=\"flex-1\">' +
                 '<div class=\"w-2 h-2 rounded-full mb-2\" style=\"background: ' + getColorCode(h.c||'yellow') + '\"></div>' +
                 '<p class=\"text-xs line-clamp-2 italic opacity-80\" style=\"border-left: 2px solid ' + getColorCode(h.c||'yellow') + '; padding-left: 8px\">\"' + h.t + '\"</p>' +
                 '<p class=\"text-[9px] opacity-40 mt-1\">' + (h.d || '') + '</p></div>' +
                 '<button class=\"opacity-0 group-hover:opacity-100 transition p-2 text-red-500 hover:text-red-700\" onclick=\"event.stopPropagation();deleteHighlight(' + i + ')\"><i class=\"fas fa-trash\"></i></button>' +
                 '</div>'
             ).join('');
        };
        
        window.deleteHighlight = (i) => {
              if(!confirm('Delete highlight?')) return;
              const h = highlights[i];
              if(bookRender) bookRender.annotations.remove(h.cfi, "highlight");
              highlights.splice(i, 1);
              localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
              renderHighlights();
        };



        // Initialize texture by default
        document.body.classList.add('textured');

        init();
        renderNotes();
    </script>
    
    <!-- Settings Modal -->
    <div id="set-m" onclick="event.stopPropagation()" style="position:fixed; top:60px; right:16px; background:white; padding:16px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1); display:none; flex-direction:column; gap:12px; z-index:2000; border:1px solid rgba(0,0,0,0.05); width:280px;">
        <div class="flex justify-between items-center mb-1">
            <h3 class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Typography</h3>
            <button onclick="toggleSettings()" class="text-gray-300 hover:text-black">✕</button>
        </div>
        <div class="set-row">
            <span class="set-lbl">Font Size</span>
            <div class="set-ctrl">
                <div class="set-btn" onclick="changeFontSize(-10)">-</div>
                <div class="set-val" id="wfz-v">100%</div>
                <div class="set-btn" onclick="changeFontSize(10)">+</div>
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <span class="set-lbl">Font Family</span>
            <select class="set-sel" id="wff-s" onchange="setFont(this.value)" style="border:1px solid rgba(0,0,0,0.1); font-size:12px; padding:6px; border-radius:6px; outline:none;">
                <option value="Inter, system-ui, sans-serif">Default (Inter)</option>
                <option value="Times New Roman, serif">Serif (Times)</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Arial, sans-serif">Sans-Serif (Arial)</option>
                <option value="Courier New, monospace">Monospace</option>
            </select>
        </div>
        <div class="md:hidden pt-3 border-t border-gray-100 flex flex-col gap-2">
             <button onclick="toggleChat();toggleSettings()" class="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition">
                <i class="fas fa-pen-fancy mr-2"></i> Open Notes
             </button>
             <a href="?mode=standard" class="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition text-center text-gray-600 no-underline">
                <i class="fas fa-book-open mr-2"></i> Standard View
             </a>
        </div>
    </div>
</body>
</html>`;
}
