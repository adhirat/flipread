
import { escapeHtml } from './viewerUtils';

export interface WebViewerOptions {
    title: string;
    fileUrl: string;
    coverUrl: string;
    settings: Record<string, any>;
    showBranding: boolean;
    logoUrl?: string;
    storeUrl?: string;
    extraStyles?: string;
    extraHtml?: string;
    extraScripts?: string;
    settingsHtml?: string;
    dependencies?: string[];
    showTTS?: boolean;
}

export function getWebViewerBase(options: WebViewerOptions): string {
    const { title, fileUrl, coverUrl, settings, showBranding, logoUrl = '', storeUrl = '/', extraStyles = '', extraHtml = '', extraScripts = '', settingsHtml = '', dependencies = [], showTTS = false } = options;
    const bg = (settings.background as string) || '#ffffff';
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);

    const depScripts = dependencies.map(dep => `<script src="${dep}"></script>`).join('\n    ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${safeTitle} — Web View</title>
    <link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
    <link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">
    <meta property="og:title" content="${safeTitle} — FlipRead">
    <meta property="og:description" content="Read this interactive content on FlipRead.">
    <meta property="og:image" content="${coverUrl || logoUrl || '/logo.png'}">
    <meta name="twitter:card" content="summary_large_image">
    
    ${depScripts}
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&family=EB+Garamond:wght@400;700&family=Inter:wght@400;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    
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
            z-index: 10;
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
            display: flex;
            width: 100%;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .mobile-icons-center {
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 4px 12px;
            border-radius: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-icons-center .header-icon {
            margin: 0;
            width: 32px;
            height: 32px;
            background: transparent;
            border: none;
            box-shadow: none;
        }

        @media (max-width: 768px) {
            .header.up { transform: translateY(0) !important; opacity: 1 !important; }
            .header.down { transform: translateY(-70px) !important; opacity: 0 !important; }

            .header-icons {
                display: flex !important;
                gap: 8px;
            }
            .header-icons > button:not(#tts-btn):not(#tts-ctrls) { display: none !important; }
            .header-icons > a#standard-btn { display: none !important; }
            #tts-ctrls:not(.hidden) { display: flex !important; align-items: center; }

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
                bottom: 15px !important;
                left: 50% !important;
                transform: translate(-50%, 0) !important;
                width: calc(100% - 32px) !important;
                max-width: 500px !important;
                background: none !important;
                border: none !important;
                pointer-events: none !important;
                padding: 0 !important;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s !important;
            }
            .controls.down { transform: translate(-50%, 100px) !important; opacity: 0 !important; }
            .controls.up { transform: translate(-50%, 0) !important; opacity: 1 !important; }
            .footer-icons-mobile {
                display: flex !important;
                width: 100%;
                padding: 8px 20px;
                background: rgba(20, 20, 20, 0.85);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 50px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                pointer-events: auto !important;
                justify-content: space-between;
                align-items: center;
            }

            .header-left .header-name {
                display: none;
            }
            .header-name {
                max-width: 50vw;
                font-size: 13px;
                color: #fff;
                text-align: left;
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
            cursor: pointer; z-index: 4000; opacity: 0; visibility: hidden;
            transition: 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        #scroll-top.v { opacity: 1; visibility: visible; }
        #scroll-top:hover { transform: scale(1.1); }
        
        @media (max-width: 768px) {
            #scroll-top { bottom: 80px; right: 20px; width: 40px; height: 40px; }
        }
        
        #tts-btn.tts-playing { color: #4ade80; background: rgba(74, 222, 128, 0.2); border-color: rgba(74, 222, 128, 0.4); }
        #tts-btn.tts-paused { color: #facc15; background: rgba(250, 204, 21, 0.2); border-color: rgba(250, 204, 21, 0.4); }
        .tts-playing i { animation: pulse-tts 2s infinite; }
        @keyframes pulse-tts { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        
        #tts-ctrls { display: none; align-items: center; gap: 8px; pointer-events: auto; }
        
        ${extraStyles}
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
            <a href="${storeUrl}"><img src="${logoUrl || '/logo.png'}" alt="Logo" class="header-logo" /></a>
        </div>
        <div class="header-name">${safeTitle}</div>
        <div class="header-icons">
            ${showTTS ? `
            <div id="tts-ctrls" class="hidden">
                <button onclick="window.togglePlayPauseTTS()" class="header-icon" title="Play/Pause TTS">
                    <i id="tts-pp-i" class="fas fa-pause"></i>
                </button>
            </div>
            <button class="header-icon" id="tts-btn" onclick="window.toggleTTS()" title="Listen (TTS)">
                <i class="fas fa-volume-up"></i>
            </button>
            ` : ''}
            <button class="header-icon" onclick="window.shareBook()" title="Share"><i class="fas fa-share-alt"></i></button>
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
            <button class="header-icon" onclick="window.prevPage()" title="Previous"><i class="fas fa-chevron-up"></i></button>
            <div class="mobile-icons-center">
                <button class="header-icon" onclick="window.shareBook()" title="Share"><i class="fas fa-share-alt"></i></button>
                <button class="header-icon" onclick="window.copyLink()" title="Copy Link"><i class="fas fa-link"></i></button>
                <a href="?mode=standard" class="header-icon" title="Standard View"><i class="fas fa-book-open"></i></a>
                <button class="header-icon" onclick="toggleSettings()" title="Appearance"><i class="fas fa-palette"></i></button>
                <button class="header-icon" onclick="toggleChat()" title="Notes"><i class="fas fa-pen-fancy"></i></button>
            </div>
            <button class="header-icon" onclick="window.nextPage()" title="Next"><i class="fas fa-chevron-down"></i></button>
        </div>
    </div>

    <div id="content-wrapper">
        ${extraHtml}
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

    ${settingsHtml}
    
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
                <p class="text-xs text-center opacity-40 py-10">Select text in the content to highlight.</p>
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
        const hdr = document.getElementById('main-header');
        const ftr = document.getElementById('main-footer');
        const stBtn = document.getElementById('scroll-top');

        window.addEventListener('scroll', () => {
             const curS = window.pageYOffset || document.documentElement.scrollTop;
             const diff = curS - lastS;
             
             // Header & Footer Hiding
             if (Math.abs(diff) < 5) return; 
             
             if (diff > 0 && curS > 80) {
                 // Scrolling down - hide
                 document.getElementById('main-header').classList.remove('up');
                 document.getElementById('main-header').classList.add('down');
                 document.getElementById('main-footer').classList.remove('up');
                 document.getElementById('main-footer').classList.add('down');
             } else if (diff < -10 || curS < 50) {
                 // Scrolling up or at top - show
                 document.getElementById('main-header').classList.remove('down');
                 document.getElementById('main-header').classList.add('up');
                 document.getElementById('main-footer').classList.remove('down');
                 document.getElementById('main-footer').classList.add('up');
             }
             lastS = curS;

             // Scroll Top Button
             if (curS > 200) stBtn.classList.add('v');
             else stBtn.classList.remove('v');
        });

        window.prevPage = () => {
            const h = window.innerHeight * 0.8;
            window.scrollBy({ top: -h, behavior: 'smooth' });
        };
        window.nextPage = () => {
            const h = window.innerHeight * 0.8;
            window.scrollBy({ top: h, behavior: 'smooth' });
        };

        function toggleTOC() { document.getElementById('toc-menu').classList.toggle('open'); }
        
        window.shareBook = async () => {
            const title = '${safeTitle}';
            const url = window.location.href;
            const text = '✨ Exploring something amazing on FlipRead! \\n\\n📖 Read "' + title + '" here:';
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        text: text,
                        url: url
                    });
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            } else {
                // Fallback for desktop/unsupported browsers
                await window.copyLink();
            }
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


        window.sendNote = () => {
            const i = document.getElementById('chat-i'), v = i.value.trim();
            if(!v) return;
            let notes = [];
            try { 
                notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
            } catch(e) {}
            
            if(window.editingNoteIndex > -1) {
                notes[window.editingNoteIndex].text = v;
                window.editingNoteIndex = -1;
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
                 '<p class=\"whitespace-pre-wrap text-sm\">' + n.text + '</p>' +
                 '<div class=\"flex justify-between items-center mt-2\">' +
                     '<span class=\"text-[10px] opacity-40\">' + n.time + '</span>' +
                     '<div class=\"flex gap-2\">' +
                         '<i class=\"fas fa-edit chat-edit text-xs\" onclick=\"editNote('+i+')\"></i>' +
                         '<i class=\"fas fa-trash chat-del text-xs\" onclick=\"deleteNote('+i+')\"></i>' +
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
             window.editingNoteIndex = i;
             document.querySelector('#chat-footer .chat-s i').className = 'fas fa-check';
        };

        window.deleteNote = (i) => {
             if(!confirm('Delete this note?')) return;
             let notes = JSON.parse(localStorage.getItem('fr_nt_'+FU)) || [];
             notes.splice(i, 1);
             localStorage.setItem('fr_nt_'+FU, JSON.stringify(notes));
             renderNotes();
        };

        window.renderHighlights = () => {
             const b = document.getElementById('hi-list');
             if(!b) return;
             b.innerHTML = highlights.map((h, i) => 
                 '<div class=\"chat-item\">' +
                 '<p class=\"italic text-xs opacity-60\">\"' + h.text + '\"</p>' +
                 '<div class=\"flex justify-between items-center mt-2\">' +
                     '<div class=\"w-3 h-3 rounded-full bg-hl-' + (h.c || 'yellow') + '\"></div>' +
                     '<i class=\"fas fa-trash chat-del text-xs\" onclick=\"deleteHighlight('+i+')\"></i>' +
                 '</div>' +
                 '</div>'
             ).join('');
        };

        window.deleteHighlight = (i) => {
             if(bookRender) bookRender.annotations.remove(highlights[i].cfi, "highlight");
             highlights.splice(i, 1);
             localStorage.setItem('fr_hi_'+FU, JSON.stringify(highlights));
             renderHighlights();
        };

        ${extraScripts}
        
        window.addEventListener('load', () => {
            if(window.init) window.init();
        });
    </script>
</body>
</html>`;
}
