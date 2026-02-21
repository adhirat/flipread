import { escapeHtml } from './viewerUtils';
import { getSidebarStyles, getSidebarHtml, getSidebarScripts } from './sidebarCentral';

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
    storeName?: string;
    showHighlights?: boolean;
    showZoom?: boolean;
    showNightShift?: boolean;
    showTexture?: boolean;
    showFullMode?: boolean;
}

export function getWebViewerBase(options: WebViewerOptions): string {
    const { 
        title, 
        fileUrl, 
        coverUrl, 
        settings, 
        showBranding, 
        logoUrl = '', 
        storeUrl = '/', 
        extraStyles = '', 
        extraHtml = '', 
        extraScripts = '', 
        settingsHtml = '', 
        dependencies = [], 
        showTTS = false, 
        storeName = 'FlipRead', 
        showHighlights = true, 
        showZoom = false,
        showNightShift = false,
        showTexture = false,
        showFullMode = false
    } = options;
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
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
        
        /* Night Shift Overlay */
        body.night-shift::after {
            content: ""; position: fixed; inset: 0; background: rgba(255, 140, 0, 0.1); 
            pointer-events: none; z-index: 10000; mix-blend-mode: multiply;
        }
        
        /* Main Content */
        #content-wrapper { width: 100%; margin: 0 auto; padding: 40px 0 200px 0; min-height: calc(100vh - 60px); transition: max-width 0.3s ease; }
        body.full-mode #content-wrapper { max-width: 100% !important; }
        
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
        
        #toc-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        #toc-list { flex: 1; overflow-y: auto; padding: 10px 0; }
        .toc-item { 
            padding: 14px 20px; font-size: 0.95rem; cursor: pointer; border-left: 3px solid transparent; 
            transition: 0.2s; color: #555; border-bottom: 1px solid rgba(0,0,0,0.03);
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

        ${getSidebarStyles(accent)}
        
        .h-divider { width: 1px; height: 24px; background: rgba(255, 255, 255, 0.2); margin: 0 5px; opacity: 0.6; }
        
        /* Loading */
        #ld { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; transition: opacity 0.5s; }
        /* Settings Drawer */
        #set-m {
            position: fixed; inset: 0; z-index: 3000; background: rgba(0,0,0,0.5);
            display: flex; align-items: stretch; justify-content: flex-end;
            backdrop-filter: blur(4px);
            opacity: 0; visibility: hidden; transition: all 0.3s ease;
        }
        #set-m.o { opacity: 1; visibility: visible; }
        
        #set-m-c {
            background: white; width: 320px; max-width: 85vw; height: 100%;
            display: flex; flex-direction: column; padding: 0;
            box-shadow: -10px 0 40px rgba(0,0,0,0.1);
            transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 640px) { #set-m-c { width: 100% !important; max-width: 100vw !important; } }
        #set-m.o #set-m-c { transform: translateX(0); }
        .set-m-h { padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
        .set-m-b { padding: 20px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
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
        .header.visible {
            transform: translateY(0);
            opacity: 1;
        }
        .header.hidden {
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
            .header-icons .h-divider { display: none !important; }
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
            .controls.hidden { transform: translate(-50%, 100px) !important; opacity: 0 !important; }
            .controls.visible { transform: translate(-50%, 0) !important; opacity: 1 !important; }
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

        /* Tablet Adjustments - Left align title */
        @media (min-width: 769px) and (max-width: 1024px) {
            .header-name {
                position: relative !important;
                left: 0 !important;
                top: 0 !important;
                transform: none !important;
                text-align: left !important;
                margin-left: 20px !important;
                flex: 2 !important;
                max-width: none !important;
            }
            .header-left, .header-icons { flex: none !important; }
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
    ${showHighlights ? `
    <div id="hl-menu">
         <div class="hl-btn" style="background:#ffeb3b" onclick="addHighlight('yellow')"></div>
         <div class="hl-btn" style="background:#a5d6a7" onclick="addHighlight('green')"></div>
         <div class="hl-btn" style="background:#90caf9" onclick="addHighlight('blue')"></div>
         <div class="hl-btn" style="background:#f48fb1" onclick="addHighlight('pink')"></div>
         <div class="hl-btn" style="background:#ce93d8" onclick="addHighlight('purple')"></div>
    </div>
    ` : ''}

    <header class="header up" id="main-header">
        <div class="header-left">
            <button class="header-icon" onclick="toggleTOC()" title="Contents">
                <i class="fas fa-list-ul"></i>
            </button>
            <a href="${storeUrl}"><img src="${logoUrl || '/logo.png'}" alt="Logo" class="header-logo" /></a>
        </div>
        <div class="header-name">${safeTitle}</div>
        <div class="header-icons" id="header-icons">
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
            <button class="header-icon" onclick="window.showQRCode()" title="QR Code"><i class="fas fa-qrcode"></i></button>
            <button class="header-icon" onclick="window.copyLink()" title="Copy Link"><i class="fas fa-link"></i></button>
            
            ${showNightShift ? `
            <button class="header-icon" id="night-shift-btn" title="Night Shift">
                <i class="fas fa-moon"></i>
            </button>
            ` : ''}

            ${showFullMode ? `
            <button class="header-icon" id="full-mode-btn" title="Toggle Full Mode">
                <i class="fas fa-expand"></i>
            </button>
            ` : ''}

            <a href="?mode=standard" class="header-icon" id="standard-btn" title="Standard View">
                <i class="fas fa-book-open"></i>
            </a>

            <div class="h-divider"></div>

            <button class="header-icon" id="settings-btn" onclick="toggleSettings()" title="Settings">
                <i class="fas fa-palette"></i>
            </button>
            <button class="header-icon" id="notes-btn" onclick="window.toggleChat()" title="Notes">
                <i class="fas fa-pen-fancy"></i>
            </button>

            ${showZoom ? `
            <div class="zoom-controls-inline flex items-center gap-2 ml-1" id="zoom-controls">
                <button class="header-icon" id="zoom-out" style="width:28px; height:28px; font-size:12px">
                    <i class="fas fa-minus"></i>
                </button>
                <div class="zoom-text text-[11px] font-bold min-w-[35px] text-center opacity-60" id="zoom-v-hdr">1.5x</div>
                <button class="header-icon" id="zoom-in" style="width:28px; height:28px; font-size:12px">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            ` : ''}
            
            <div id="extra-header-icons" class="flex gap-2.5 items-center"></div>
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

    <!-- QR Modal -->
    <div id="qr-modal" style="position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
        <div style="background: white; border-radius: 20px; width: 340px; max-width: 90vw; box-shadow: 0 20px 50px rgba(0,0,0,0.3); overflow: hidden;">
            <div style="padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; color: #333;">Scan QR Code</span>
                <button onclick="window.toggleQR(false)" style="width: 28px; height: 28px; border-radius: 50%; border: none; background: #f5f5f5; color: #666; cursor: pointer;">✕</button>
            </div>
            <div style="padding: 30px; display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <div id="qrcode-container" style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #eee;"></div>
                <p style="text-align: center; font-size: 13px; color: #666; margin: 0;">Scan this code with your phone to open this book on the go.</p>
                <button style="width: 100%; padding: 12px; border-radius: 10px; border: none; background: var(--accent); color: white; font-weight: 600; cursor: pointer;" onclick="window.toggleQR(false)">Close</button>
            </div>
        </div>
    </div>
    
    ${getSidebarHtml(showHighlights)}

    <script>
        const FU='${fileUrl}'.split('?')[0];
        let bookRender = null;
        let highlights = [];
        ${showHighlights ? "try{ highlights = JSON.parse(localStorage.getItem('fr_hi_'+FU)) || []; }catch(e){}" : ""}

        // --- Layout Utils ---
        let lastS = 0;
        const hdr = document.getElementById('main-header');
        const ftr = document.getElementById('main-footer');
        const stBtn = document.getElementById('scroll-top');
        let isNavScroll = false;
        let navScrollTimeout = null;
        window.addEventListener('scroll', () => {
             const curS = window.pageYOffset || document.documentElement.scrollTop;
             const diff = curS - lastS;
             
             // Header & Footer Hiding - skip if a modal is open
             const isModalOpen = document.querySelector('#toc-menu.open, #chat-w.o, #set-m.o');
             if (isModalOpen) {
                lastS = curS;
                return;
             }

             if (Math.abs(diff) < 5) return; 
             
             if (diff > 0 && curS > 80) {
                 // Scrolling down - hide
                 if (isNavScroll) return;
                 document.getElementById('main-header').classList.remove('visible');
                 document.getElementById('main-header').classList.add('hidden');
                 document.getElementById('main-footer').classList.remove('visible');
                 document.getElementById('main-footer').classList.add('hidden');
             } else if (diff < -10 || curS < 50) {
                 // Scrolling up or at top - show
                 document.getElementById('main-header').classList.remove('hidden');
                 document.getElementById('main-header').classList.add('visible');
                 document.getElementById('main-footer').classList.remove('hidden');
                 document.getElementById('main-footer').classList.add('visible');
             }
             lastS = curS;

             // Scroll Top Button
             if (curS > 200) stBtn.classList.add('v');
             else stBtn.classList.remove('v');
        });

        window.addEventListener('mousemove', (e) => {
            const h = document.getElementById('main-header');
            const f = document.getElementById('main-footer');
            const threshold = 60;
            if (e.clientY < threshold) {
                if(h) { h.classList.remove('hidden'); h.classList.add('visible'); }
            }
            if (window.innerHeight - e.clientY < threshold) {
                if(f) { f.classList.remove('hidden'); f.classList.add('visible'); }
            }
        });

        window.prevPage = () => {
            isNavScroll = true;
            if(navScrollTimeout) clearTimeout(navScrollTimeout);
            navScrollTimeout = setTimeout(() => { isNavScroll = false; }, 1000);
            const h = window.innerHeight * 0.8;
            window.scrollBy({ top: -h, behavior: 'smooth' });
        };
        window.nextPage = () => {
            isNavScroll = true;
            if(navScrollTimeout) clearTimeout(navScrollTimeout);
            navScrollTimeout = setTimeout(() => { isNavScroll = false; }, 1000);
            const h = window.innerHeight * 0.8;
            window.scrollBy({ top: h, behavior: 'smooth' });
        };

        function toggleTOC() { document.getElementById('toc-menu').classList.toggle('open'); }
        
        window.shareBook = async () => {
            const title = '${safeTitle}';
            const sName = '${storeName.replace(/'/g, "\\'")}';
            const url = window.location.href;
            const text = 'Hi There,\\n\\nI\\'ve been exploring "' + title + '" on the ' + sName + ' library published using FlipRead and found it quite insightful.\\n\\n' + url + '\\n\\nThanks';
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        text: text
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

        window.toggleQR = (show) => {
            const m = document.getElementById('qr-modal');
            if(!m) return;
            if(show) {
                m.style.display = 'flex';
                setTimeout(() => m.style.opacity = '1', 10);
            } else {
                m.style.opacity = '0';
                setTimeout(() => m.style.display = 'none', 300);
            }
        };

        window.showQRCode = () => {
            const container = document.getElementById('qrcode-container');
            if(!container) return;
            container.innerHTML = '';
            new QRCode(container, {
                text: window.location.href,
                width: 200,
                height: 200,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            window.toggleQR(true);
        };

        // Night Shift
        const nsBtn = document.getElementById('night-shift-btn');
        if(nsBtn) {
            const isNS = localStorage.getItem('fr_web_ns') === 'true';
            if(isNS) document.body.classList.add('night-shift');
            nsBtn.classList.toggle('text-yellow-400', isNS);
            
            nsBtn.onclick = () => {
                const active = document.body.classList.toggle('night-shift');
                localStorage.setItem('fr_web_ns', active);
                nsBtn.classList.toggle('text-yellow-400', active);
            };
        }

        // Full Mode
        const fullBtn = document.getElementById('full-mode-btn');
        if(fullBtn) {
            fullBtn.onclick = () => {
                const isFull = document.body.classList.toggle('full-mode');
                fullBtn.innerHTML = isFull ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
            };
        }

        ${getSidebarScripts(fileUrl, showHighlights)}

        ${extraScripts}
        
        window.addEventListener('load', () => {
            if(window.init) window.init();
        });
    </script>
</body>
</html>`;
}
