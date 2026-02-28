import { escapeHtml } from './viewerUtils';
import { getSidebarStyles, getSidebarHtml, getSidebarScripts } from './sidebarCentral';

export interface ViewerOptions {
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
    showZoom?: boolean;
    showWebViewLink?: boolean;
    footerHtml?: string;
    showTTS?: boolean;
    storeName?: string;
    showHighlights?: boolean;
    showFullMode?: boolean;
    showNightShift?: boolean;
}

export function getViewerBase(options: ViewerOptions): string {
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
        showZoom = false,
        showWebViewLink = true,
        footerHtml = '',
        showTTS = false,
        storeName = 'SHOPUBLISH',
        showHighlights = true,
        showFullMode = false,
        showNightShift = false
    } = options;
    
    const safeTitle = escapeHtml(title);
    const depScripts = dependencies.map(dep => `<script src="${dep}"></script>`).join('\n    ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${safeTitle} - SHOPUBLISH</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
    <link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">

    <!-- Dependencies -->
    ${depScripts}
    <script src="https://cdn.tailwindcss.com"></script>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            background: #1a1a1a;
            background-size: cover;
            background-position: center;
            height: 100dvh;
            width: 100vw;
            position: fixed;
            transition: background 0.3s ease;
        }

        /* Night Shift Overlay */
        body.night-shift::after {
            content: ""; position: fixed; inset: 0; background: rgba(255, 140, 0, 0.1); 
            pointer-events: none; z-index: 10000; mix-blend-mode: multiply;
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
            transition: opacity 0.3s ease, transform 0.3s ease;
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

        body.full-mode .header {
            opacity: 0;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
        }

        body.full-mode .header:hover {
            opacity: 1;
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

        #tts-btn.tts-playing { color: #4ade80; background: rgba(74, 222, 128, 0.2); border-color: rgba(74, 222, 128, 0.4); }
        #tts-btn.tts-paused { color: #facc15; background: rgba(250, 204, 21, 0.2); border-color: rgba(250, 204, 21, 0.4); }
        .tts-playing i { animation: pulse-tts 2s infinite; }
        @keyframes pulse-tts { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        
        #tts-ctrls { display: none; align-items: center; gap: 8px; pointer-events: auto; }


        .zoom-controls-inline {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0, 0, 0, 0.4);
            padding: 4px 12px;
            border-radius: 20px;
            backdrop-filter: blur(4px);
        }

        .zoom-text {
            color: white;
            font-size: 12px;
            min-width: 35px;
            text-align: center;
        }

        /* Main Content Area */
        .main-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background-color: transparent;
            cursor: default;
            z-index: 1;
        }

        /* Footer Controls */
        .controls {
            position: fixed;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            justify-content: center;
            width: fit-content;
        }

        .desktop-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            padding: 8px 18px;
            background: rgba(20, 20, 20, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 50px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
            pointer-events: auto;
        }

        body.full-mode .controls {
            opacity: 0;
            transform: translate(-50%, 30px);
        }

        body.full-mode .controls:hover {
            opacity: 1;
            transform: translate(-50%, 0);
        }

        /* Standard Slider & Nav Styles */
        .page-slider {
            -webkit-appearance: none;
            width: 250px;
            height: 5px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            outline: none;
            margin: 0 10px;
            cursor: pointer;
            transition: background 0.3s;
        }

        .page-slider:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .page-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            border: 3px solid #6366f1;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .page-slider::-webkit-slider-thumb:hover {
            transform: scale(1.3);
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
        }

        .nav-button {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 13px;
        }

        .nav-button:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .nav-button:disabled {
            opacity: 0.2;
            cursor: not-allowed;
        }

        .page-info {
            font-size: 12px;
            font-weight: 600;
            color: #aaa;
            margin-left: 8px;
            letter-spacing: 0.5px;
            font-family: monospace;
            white-space: nowrap;
        }

        /* Loaders & Errors */
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 16px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px 25px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* Modals */
        .index-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: stretch;
            justify-content: flex-start;
            z-index: 2000;
            backdrop-filter: blur(5px);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        .index-modal.open { 
            opacity: 1; 
            visibility: visible; 
        }
        
        .index-content {
            background: #252525;
            color: white;
            width: 320px;
            max-width: 80vw;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 10px 0 40px rgba(0, 0, 0, 0.5);
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 640px) { .index-content { width: 100% !important; max-width: 100vw !important; } }
        .index-modal.open .index-content {
            transform: translateX(0);
        }

        .index-header {
            padding: 15px 20px;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
        }

        .index-list-container {
            overflow-y: auto;
            flex: 1;
            padding: 10px 0;
        }
        .index-item {
            padding: 12px 20px;
            font-size: 14px;
            cursor: pointer;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
        }
        .index-item:hover { background: rgba(255, 255, 255, 0.05); }
        .index-item:active { background: rgba(255, 255, 255, 0.1); }

        /* Social & Divider */
        .h-divider { width:1px; height:24px; background:rgba(255,255,255,0.2); margin:0 5px; }

        /* Modern Settings Modal */
        .settings-modal {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2500;
            display: flex; align-items: stretch; justify-content: flex-end;
            backdrop-filter: blur(4px);
            opacity: 0; visibility: hidden; transition: all 0.3s ease;
        }
        .settings-modal.open { opacity: 1; visibility: visible; }
        
        .settings-content {
            background: #252525; color: white;
            width: 320px; max-width: 80vw; height: 100%;
            display: flex; flex-direction: column;
            box-shadow: -10px 0 40px rgba(0,0,0,0.5);
            transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 640px) { .settings-content { width: 100% !important; max-width: 100vw !important; } }
        .settings-modal.open .settings-content { transform: translateX(0); }

        .set-header {
            padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex; justify-content: space-between; align-items: center;
        }
        .set-body { padding: 15px; overflow-y: auto; flex: 1; }
        .set-opt-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .set-label { font-size: 13px; color: #ccc; font-weight: 500; }
        
        /* Texture Overlay */
        #texture-overlay { 
            position: fixed; inset: 0; pointer-events: none; z-index: 10; opacity: 0.15; 
            background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png'); 
            display: none; mix-blend-mode: overlay;
        }
        body.textured #texture-overlay { display: block; }

        .bg-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            padding: 10px 0;
        }
        .bg-option {
            aspect-ratio: 1; border-radius: 50%; cursor: pointer;
            border: 2px solid rgba(255,255,255,0.1); transition: transform 0.2s;
        }
        .bg-option:hover { transform: scale(1.1); border-color: white; }
        .bg-option.active { border-color: #4CAF50; box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3); }

        ${getSidebarStyles('#6366f1')}

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            .zoom-controls-inline,
            .h-divider { display: none !important; }
            /* Only show Fit Toggle and TTS in header on mobile */
            .header-icons > *:not(#fit-toggle-btn):not(#tts-btn):not(#tts-ctrls) { display: none !important; }
            #tts-ctrls:not(.hidden) { display: flex !important; align-items: center; }
            .header-icons { display: flex !important; pointer-events: auto !important; }
            
            /* Hide desktop footer content */
            .desktop-controls { display: none !important; }
            
            .controls {
                bottom: 8px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: calc(100% - 30px) !important;
                max-width: 500px !important;
                background: none !important;
                pointer-events: none !important;
            }

            .mobile-controls {
                display: flex !important;
                width: 100%;
                padding: 6px 15px;
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

            .header-left .header-name { display: none; }
            .header-name { max-width: 50vw; font-size: 13px; }
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

        .mobile-controls {
            display: none;
            width: 100%;
            justify-content: space-between;
            align-items: center;
        }

        .mobile-icons-center {
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 4px 10px;
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

        .nav-btn-mob {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .nav-btn-mob:active { background: rgba(255, 255, 255, 0.2); }
        .footer-icons-mobile .header-icon {
            margin: 0;
            width: 32px;
            height: 32px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
        }

        ${extraStyles}
    </style>
</head>

<body>
    <header class="header" id="main-header">
        <div class="header-left">
            <button class="header-icon" id="index-btn" title="Table of Contents">
                <i class="fas fa-list"></i>
            </button>
            ${showBranding && logoUrl ? `<a href="${storeUrl}" style="pointer-events: auto;"><img src="${logoUrl}" alt="Logo" class="header-logo"></a>` : ''}
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

            ${showFullMode ? `
            <button class="header-icon" id="full-mode-btn" title="Toggle Full Mode">
                <i class="fas fa-expand"></i>
            </button>
            ` : ''}

            ${showNightShift ? `
            <button class="header-icon" id="night-shift-btn" title="Night Shift">
                <i class="fas fa-moon"></i>
            </button>
            ` : ''}

            <button class="header-icon" onclick="window.shareBook()" title="Share"><i class="fas fa-share-alt"></i></button>
            <button class="header-icon" onclick="window.showQRCode()" title="QR Code"><i class="fas fa-qrcode"></i></button>
            <button class="header-icon" onclick="window.copyLink()" title="Copy Link"><i class="fas fa-link"></i></button>
            
            ${showWebViewLink ? `
            <a href="?mode=web" class="header-icon" id="web-view-icon-hdr" title="Web View">
                <i class="fas fa-globe"></i>
            </a>
            ` : ''}

            <div class="h-divider"></div>

            <button class="header-icon" id="bg-settings-btn" title="Appearance">
                <i class="fas fa-palette"></i>
            </button>
            <button class="header-icon" id="notes-btn" title="Notes">
                <i class="fas fa-pen-fancy"></i>
            </button>

            ${showZoom ? `
            <div class="zoom-controls-inline" id="zoom-controls">
                <button class="header-icon" id="zoom-out" style="width:28px; height:28px; font-size:12px">
                    <i class="fas fa-minus"></i>
                </button>
                <div class="zoom-text" id="zoom-text">100%</div>
                <button class="header-icon" id="zoom-in" style="width:28px; height:28px; font-size:12px">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            ` : ''}


        </div>
    </header>

    <div id="texture-overlay"></div>
    
    <div class="main-content" id="main-content">
        <div class="loading" id="loading">
            <i class="fas fa-circle-notch fa-spin"></i> Loading...
        </div>
        ${extraHtml}
    </div>

    <!-- Index Modal -->
    <div class="index-modal" id="index-modal">
        <div class="index-content">
            <div class="index-header">
                <div style="font-weight:600">Contents</div>
                <button class="header-icon" id="index-close-btn" style="width:30px; height:30px">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="index-list-container">
                <div id="index-list"></div>
            </div>
        </div>
    </div>

    <!-- Modern Settings Modal -->
    <div class="settings-modal" id="settings-modal">
        <div class="settings-content">
            <div class="set-header">
                <div style="font-weight:600; text-transform:uppercase; letter-spacing:1px; font-size:12px;">Settings</div>
                <button class="header-icon" id="settings-close-btn" style="width:28px; height:28px">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="set-body">
                <div style="margin-bottom: 10px; font-weight: 600; font-size:11px; color:#888; text-transform:uppercase;">Background</div>
                <div class="bg-grid">
                    <div class="bg-option active" style="background: #1a1a1a;" data-bg="#1a1a1a" title="Dark"></div>
                    <div class="bg-option" style="background: #333333;" data-bg="#333333" title="Charcoal"></div>
                    <div class="bg-option" style="background: #0d1b2a;" data-bg="#0d1b2a" title="Midnight"></div>
                    <div class="bg-option" style="background: #f5f5f5;" data-bg="#f5f5f5" title="Light"></div>
                    <div class="bg-option" style="background: #e0e0e0;" data-bg="#e0e0e0" title="Grey"></div>
                    <div class="bg-option" style="background: #d7ccc8;" data-bg="#d7ccc8" title="Paper"></div>
                    <div class="bg-option" style="background: #fff8e1;" data-bg="#fff8e1" title="Cream"></div>
                    <div class="bg-option" style="background: linear-gradient(to bottom right, #2c3e50, #000000);" data-bg="linear-gradient(to bottom right, #2c3e50, #000000)" title="Gradient"></div>
                </div>

                <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                    <div class="set-opt-row">
                        <span class="set-label">Paper Texture</span>
                        <button id="tex-toggle" class="header-icon" style="width:auto; padding:0 12px; border-radius:15px; font-size:11px; background:#444;">OFF</button>
                    </div>
                </div>
                
                ${settingsHtml}
            </div>
        </div>
    </div>

    <!-- QR Modal -->
    <div id="qr-modal" class="settings-modal" style="justify-content: center; align-items: center;">
        <div class="settings-content" style="height: auto; border-radius: 20px; width: 340px; transform: none; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <div class="set-header">
                <div style="font-weight:600">Scan QR Code</div>
                <button class="header-icon" onclick="window.toggleModal('qr-modal', false)" style="width:28px; height:28px">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="set-body" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 30px;">
                <div id="qrcode-container" style="background: white; padding: 15px; border-radius: 12px;"></div>
                <p style="text-align: center; font-size: 13px; color: #aaa;">Scan this code with your phone to open this book on the go.</p>
                <button class="header-icon" style="width: 100%; justify-content: center; border-radius: 10px; background: var(--accent); color: white; padding: 10px; font-weight: 600;" onclick="window.toggleModal('qr-modal', false)">Close</button>
            </div>
        </div>
    </div>

    ${getSidebarHtml(showHighlights)}

    <div class="controls" id="main-footer">
        <!-- Desktop: external footer html (slider etc) -->
        <div class="desktop-controls">
             ${footerHtml}
        </div>

        <!-- Mobile: Nav corners + Center Icons -->
        <div class="mobile-controls">
            <button class="nav-btn-mob" id="mobile-prev-btn" onclick="if(window.prev)window.prev()"><i class="fas fa-chevron-left"></i></button>
            
            <div class="mobile-icons-center">
                <button class="header-icon" id="share-btn-mob" onclick="window.shareBook()"><i class="fas fa-share-alt"></i></button>
                <button class="header-icon" id="qr-btn-mob" onclick="window.showQRCode()" title="QR Code"><i class="fas fa-qrcode"></i></button>
                <button class="header-icon" id="copy-link-btn-mob" onclick="window.copyLink()"><i class="fas fa-link"></i></button>
                ${showWebViewLink ? `
                <a href="?mode=web" class="header-icon" id="web-view-btn-mob"><i class="fas fa-globe"></i></a>
                ` : ''}
                <button class="header-icon" id="bg-settings-btn-mob"><i class="fas fa-palette"></i></button>
                <button class="header-icon" id="notes-btn-mob"><i class="fas fa-pen-fancy"></i></button>
            </div>

            <button class="nav-btn-mob" id="mobile-next-btn" onclick="if(window.next)window.next()"><i class="fas fa-chevron-right"></i></button>
        </div>
    </div>

    <script>
        const FILE_URL = '${fileUrl}';
        const TITLE = '${safeTitle}';
        
        // --- Shared Logic ---
        window.shareBook = async () => {
            const url = window.location.href;
            const sName = '${storeName.replace(/'/g, "\\'")}';
            const text = 'Hi There,\\n\\nI\\'ve been exploring "' + TITLE + '" on the ' + sName + ' library published using SHOPUBLISH and found it quite insightful.\\n\\n' + url + '\\n\\nThanks';
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: TITLE,
                        text: text
                    });
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            } else {
                await window.copyLink();
            }
        };
        
        window.copyLink = () => {
             navigator.clipboard.writeText(window.location.href);
             alert('Link copied!');
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
            window.toggleModal('qr-modal', true);
        };

        // UI Helpers
        window.toggleModal = (id, show) => {
            const m = document.getElementById(id);
            if(m) m.classList.toggle('open', show);
        };

        // Shared Background Control
        window.setBg = (c) => {
            document.body.style.background = c;
            localStorage.setItem('fr_bg_choice', c);
            document.querySelectorAll('.bg-option').forEach(opt => {
                opt.classList.toggle('active', opt.getAttribute('data-bg') === c);
            });
        };

        // Initialize Shared UI
        document.addEventListener('DOMContentLoaded', () => {
            // Index Modal
            const idxBtn = document.getElementById('index-btn');
            if(idxBtn) idxBtn.onclick = () => window.toggleModal('index-modal', true);
            const idxClose = document.getElementById('index-close-btn');
            if(idxClose) idxClose.onclick = () => window.toggleModal('index-modal', false);
            
            // Settings Modal
            const setBtn = document.getElementById('bg-settings-btn');
            if(setBtn) setBtn.onclick = () => window.toggleModal('settings-modal', true);
            const setBtnMob = document.getElementById('bg-settings-btn-mob');
            if(setBtnMob) setBtnMob.onclick = () => window.toggleModal('settings-modal', true);
            const setClose = document.getElementById('settings-close-btn');
            if(setClose) setClose.onclick = () => window.toggleModal('settings-modal', false);

            // Background Options
            document.querySelectorAll('.bg-option').forEach(opt => {
                opt.onclick = () => window.setBg(opt.getAttribute('data-bg'));
            });
            const savedBg = localStorage.getItem('fr_bg_choice');
            if(savedBg) window.setBg(savedBg);

            // Texture Toggle
            const texToggle = document.getElementById('tex-toggle');
            if(texToggle) {
                const isTex = localStorage.getItem('fr_tex_on') === 'true';
                if(isTex) document.body.classList.add('textured');
                texToggle.innerText = isTex ? 'ON' : 'OFF';
                texToggle.style.background = isTex ? '#4CAF50' : '#444';
                
                texToggle.onclick = () => {
                    const active = document.body.classList.toggle('textured');
                    localStorage.setItem('fr_tex_on', active);
                    texToggle.innerText = active ? 'ON' : 'OFF';
                    texToggle.style.background = active ? '#4CAF50' : '#444';
                };
            }

            // Full Mode Toggle
            const fullBtn = document.getElementById('full-mode-btn');
            if(fullBtn) {
                fullBtn.onclick = () => {
                    const isFull = document.body.classList.toggle('full-mode');
                    fullBtn.innerHTML = isFull ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
                };
            }

            // Night Shift Toggle
            const nsBtn = document.getElementById('night-shift-btn');
            if(nsBtn) {
                const isNS = localStorage.getItem('fr_ns_on') === 'true';
                if(isNS) document.body.classList.add('night-shift');
                nsBtn.classList.toggle('text-yellow-400', isNS);

                nsBtn.onclick = () => {
                    const active = document.body.classList.toggle('night-shift');
                    localStorage.setItem('fr_ns_on', active);
                    nsBtn.classList.toggle('text-yellow-400', active);
                };
            }
        });

        ${getSidebarScripts(fileUrl, showHighlights)}

        ${extraScripts}
    </script>
</body>
</html>`;
}
