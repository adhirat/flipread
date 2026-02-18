
import { escapeHtml } from './viewerUtils';

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
        showTTS = false
    } = options;
    
    const safeTitle = escapeHtml(title);
    const depScripts = dependencies.map(dep => `<script src="${dep}"></script>`).join('\n    ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${safeTitle} - FlipRead</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
    <link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">

    <!-- Dependencies -->
    ${depScripts}

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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

        #tts-btn.tts-active { color: #facc15; background: rgba(250, 204, 21, 0.2); border-color: rgba(250, 204, 21, 0.4); }
        .tts-playing i { animation: pulse-tts 2s infinite; }
        @keyframes pulse-tts { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        
        #tts-ctrls { display: none; align-items: center; gap: 8px; background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 20px; backdrop-filter: blur(4px); margin-right: 8px; pointer-events: auto; }


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
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(5px);
        }

        .index-content {
            background: #252525;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            max-height: 70vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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

        /* Social & Divider */
        .h-divider { width:1px; height:24px; background:rgba(255,255,255,0.2); margin:0 5px; }

        /* Modern Settings Modal */
        .settings-modal {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2500;
            display: none; align-items: center; justify-content: center;
            backdrop-filter: blur(4px);
        }
        .settings-modal.open { display: flex; }
        
        .settings-content {
            background: #252525; color: white;
            width: 100%; height: 100%; max-width: none; border-radius: 0;
            display: flex; flex-direction: column;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        
        @media (min-width: 768px) {
            .settings-modal { 
                background: transparent; pointer-events: none;
                align-items: flex-start; justify-content: flex-end;
                padding-top: 60px; padding-right: 20px;
            }
            .settings-modal.open { pointer-events: auto; }
            .settings-content {
                width: 320px; height: auto; max-height: 80vh;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.1);
            }
        }

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

        /* Notes Sidebar */
        #chat-w {
            position: fixed;
            right: -100vw;
            top: 0;
            bottom: 0;
            width: 100vw;
            background: rgba(30, 30, 30, 0.98);
            backdrop-filter: blur(20px);
            z-index: 2100;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            color: #eee;
        }
        @media (min-width: 640px) { #chat-w { width: 350px; right: -400px; } }
        #chat-w.open { right: 0; box-shadow: -20px 0 50px rgba(0,0,0,0.5); }
        
        .chat-h {
            padding: 15px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-h span {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.7;
        }
        .close-chat-btn { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; opacity: 0.6; }
        .close-chat-btn:hover { opacity: 1; }

        .chat-b { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        .chat-item { background: #333; padding: 15px; border-radius: 8px; font-size: 14px; border: 1px solid rgba(255, 255, 255, 0.05); position: relative; }
        .chat-text { white-space: pre-wrap; line-height: 1.5; color: #ddd; }
        .chat-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 11px; color: #888; }
        .chat-actions { display: flex; gap: 10px; opacity: 0.5; transition: opacity 0.2s; }
        .chat-item:hover .chat-actions { opacity: 1; }
        .chat-action-btn { cursor: pointer; color: #bbb; transition: color 0.2s; }
        .chat-action-btn:hover { color: #fff; }

        .chat-f { padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; gap: 10px; background: rgba(0, 0, 0, 0.2); }
        .chat-i { flex: 1; background: #252525; border: 1px solid #444; border-radius: 8px; padding: 12px; outline: none; font-size: 14px; resize: none; min-height: 45px; max-height: 120px; font-family: inherit; color: white; }
        .chat-i:focus { border-color: #4CAF50; }
        .chat-s { width: 45px; border-radius: 8px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            .zoom-controls-inline,
            .h-divider { display: none !important; }
            /* Only show Fit Toggle and TTS in header on mobile */
            .header-icons > *:not(#fit-toggle-btn):not(#tts-btn):not(#tts-ctrls) { display: none !important; }
            #tts-ctrls:not(.hidden) { display: flex !important; align-items: center; gap: 8px; margin-right: 10px; }
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

        .mobile-controls {
            display: none;
            width: 100%;
            justify-content: space-between;
            align-items: center;
        }

        .mobile-icons-center {
            display: flex;
            gap: 12px;
            align-items: center;
            justify-content: center;
        }
        
        .mobile-icons-center .header-icon {
            margin: 0;
            width: 36px;
            height: 36px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
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
                <button onclick="window.togglePlayPauseTTS()" class="text-white hover:text-indigo-300 transition w-6 h-6 flex items-center justify-center">
                    <i id="tts-pp-i" class="fas fa-pause"></i>
                </button>
                <div class="w-[1px] h-3 bg-white/20"></div>
                <button onclick="window.stopTTS()" class="text-white hover:text-red-400 transition w-6 h-6 flex items-center justify-center">
                    <i class="fas fa-stop text-[10px]"></i>
                </button>
            </div>
            <button class="header-icon" id="tts-btn" onclick="window.toggleTTS()" title="Listen (TTS)">
                <i class="fas fa-volume-up"></i>
            </button>
            ` : ''}
            <button class="header-icon" id="share-twitter-btn" onclick="window.shareSocial('twitter')" title="Share on Twitter"><i class="fab fa-twitter"></i></button>
            <button class="header-icon" id="share-facebook-btn" onclick="window.shareSocial('facebook')" title="Share on Facebook"><i class="fab fa-facebook"></i></button>
            <button class="header-icon" id="copy-link-btn" onclick="window.copyLink()" title="Copy Link"><i class="fas fa-link"></i></button>
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

            ${showWebViewLink ? `
            <a href="?mode=web" class="header-icon" id="web-view-icon-hdr" title="Web View">
                <i class="fas fa-globe"></i>
            </a>
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

    <!-- Notes Sidebar -->
    <div id="chat-w">
        <div class="chat-h">
            <span>My Notes</span>
            <button class="close-chat-btn" id="close-notes-btn">✕</button>
        </div>
        <div class="chat-b" id="notes-list"></div>
        <div class="chat-f">
            <textarea class="chat-i" id="note-input" placeholder="Add a note..."></textarea>
            <button class="chat-s" id="send-note-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>

    <div class="controls" id="main-footer">
        <!-- Desktop: external footer html (slider etc) -->
        <div class="desktop-controls">
             ${footerHtml}
        </div>

        <!-- Mobile: Nav corners + Center Icons -->
        <div class="mobile-controls">
            <button class="nav-btn-mob" id="mobile-prev-btn" onclick="if(window.prev)window.prev()"><i class="fas fa-chevron-left"></i></button>
            
            <div class="mobile-icons-center">
                <button class="header-icon" id="bg-settings-btn-mob"><i class="fas fa-palette"></i></button>
                <button class="header-icon" id="notes-btn-mob"><i class="fas fa-pen-fancy"></i></button>
                ${showWebViewLink ? `
                <a href="?mode=web" class="header-icon" id="web-view-btn-mob"><i class="fas fa-globe"></i></a>
                ` : ''}
                <button class="header-icon" id="share-twitter-btn-mob" onclick="window.shareSocial('twitter')"><i class="fab fa-twitter"></i></button>
                <button class="header-icon" id="share-facebook-btn-mob" onclick="window.shareSocial('facebook')"><i class="fab fa-facebook"></i></button>
                <button class="header-icon" id="copy-link-btn-mob" onclick="window.copyLink()"><i class="fas fa-link"></i></button>
            </div>

            <button class="nav-btn-mob" id="mobile-next-btn" onclick="if(window.next)window.next()"><i class="fas fa-chevron-right"></i></button>
        </div>
    </div>

    <script>
        const FILE_URL = '${fileUrl}';
        const TITLE = '${safeTitle}';
        


        // --- Shared Logic ---
        window.shareSocial = (p) => {
            const u = encodeURIComponent(window.location.href);
            const t = encodeURIComponent(TITLE + ' on FlipRead');
            let url = '';
            if(p === 'twitter') url = 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t;
            if(p === 'facebook') url = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
            if(url) window.open(url, '_blank', 'width=600,height=400');
        };
        
        window.copyLink = () => {
             navigator.clipboard.writeText(window.location.href);
             alert('Link copied!');
        };

        ${extraScripts}
    </script>
</body>
</html>`;
}
