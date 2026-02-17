
import { escapeHtml } from './viewerUtils';

export function pdfViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = ''): string {
  const safeTitle = escapeHtml(title);

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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js"></script>

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
            /* Default Background */
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



        /* Full Mode Logic for Header */
        body.full-mode .header {
            opacity: 0;
            /* Hidden by default in full mode */
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
        }

        body.full-mode .header:hover {
            opacity: 1;
            /* Show on hover */
        }

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
        }

        .header-icon:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
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

        .main-content.grabbing {
            cursor: grabbing !important;
        }

        /* The container for the book */
        #flipbook-container {
            position: relative;
            transform-origin: center center;
            margin: 0 auto;
        }

        /* Styles for individual pages generated by page-flip */
        .page {
            background-color: white;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            cursor: grab;
        }

        .page:active {
            cursor: grabbing;
        }

        .stf__item {
            cursor: grab;
        }

        .stf__item:active {
            cursor: grabbing;
        }

        .page.--hard {
            background-color: #f2f2f2;
            border: 1px solid #ccc;
        }

        .page.--simple {
            background-color: white;
        }

        .page-content {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }

        .page canvas {
            width: 100%;
            height: 100%;
            object-fit: fill;
            display: block;
            pointer-events: none;
        }

        /* Footer Controls */
        .controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            padding: 15px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 100;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        /* Full Mode Logic for Footer */
        body.full-mode .controls {
            opacity: 0;
            /* Hidden by default in full mode */
            background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
        }

        body.full-mode .controls:hover {
            opacity: 1;
            /* Show on hover */
        }

        .page-slider {
            flex: 1;
            max-width: 300px;
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            outline: none;
            pointer-events: auto;
        }

        .page-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #4CAF50;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .nav-button {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
            color: white;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            backdrop-filter: blur(4px);
        }

        .nav-button:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }

        .nav-button:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            border-color: rgba(255, 255, 255, 0.1);
        }

        .page-info {
            color: #ddd;
            font-size: 12px;
            min-width: 60px;
            text-align: center;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
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

        .error-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #252525;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            max-width: 90%;
            z-index: 2000;
        }

        .error-icon {
            font-size: 32px;
            color: #ff6b6b;
            margin-bottom: 15px;
        }

        .error-title {
            color: white;
            font-size: 18px;
            margin-bottom: 8px;
        }

        .btn-primary {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
        }

        .btn-primary:hover {
            background: #45a049;
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

        .index-item {
            padding: 12px 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #ccc;
            border-bottom: 1px solid #333;
        }

        .index-item:hover {
            background: #333;
            color: white;
        }

        /* Social & Divider */
        .h-divider { width:1px; height:24px; background:rgba(255,255,255,0.2); margin:0 5px; }

        /* Modern Settings Modal (Popup Desktop / Full Mobile) */
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
        .set-tabs {
            display: flex; background: rgba(0,0,0,0.2); padding: 4px; gap: 4px;
        }
        .set-tab {
            flex: 1; text-align: center; padding: 8px; font-size: 12px; font-weight: 600;
            cursor: pointer; opacity: 0.6; border-radius: 4px; transition: 0.2s;
            text-transform: uppercase;
        }
        .set-tab.active { background: rgba(255,255,255,0.1); opacity: 1; color: #4CAF50; }
        
        .set-body { padding: 15px; overflow-y: auto; flex: 1; }
        .set-section { display: none; }
        .set-section.active { display: block; }
        
        .set-opt-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .set-label { font-size: 13px; color: #ccc; font-weight: 500; }
        
        /* Texture Overlay */
        #texture-overlay { 
            position: fixed; inset: 0; pointer-events: none; z-index: 10; opacity: 0.15; 
            background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png'); 
            display: none; mix-blend-mode: overlay;
        }
        body.textured #texture-overlay { display: block; }

        /* Background Options Styling */
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

        /* --- Notes Sidebar (Dark Mode) --- */
        #chat-w {
            position: fixed;
            right: -100vw;
            top: 0;
            bottom: 0;
            width: 100vw;
            background: rgba(30, 30, 30, 0.98); /* Dark */
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
        .close-chat-btn {
            background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; opacity: 0.6;
        }
        .close-chat-btn:hover { opacity: 1; }

        .chat-b {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .chat-item {
            background: #333;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            position: relative;
        }
        .chat-text {
            white-space: pre-wrap;
            line-height: 1.5;
            color: #ddd;
        }
        .chat-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            font-size: 11px;
            color: #888;
        }
        .chat-actions {
            display: flex; gap: 10px; opacity: 0.5; transition: opacity 0.2s;
        }
        .chat-item:hover .chat-actions { opacity: 1; }
        .chat-action-btn { cursor: pointer; color: #bbb; transition: color 0.2s; }
        .chat-action-btn:hover { color: #fff; }
        .chat-edit:hover { color: #4CAF50; }
        .chat-del:hover { color: #ff6b6b; }

        .chat-f {
            padding: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 10px;
            background: rgba(0, 0, 0, 0.2);
        }
        .chat-i {
            flex: 1;
            background: #252525;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 12px;
            outline: none;
            font-size: 14px;
            resize: none;
            min-height: 45px;
            max-height: 120px;
            font-family: inherit;
            color: white;
            transition: border-color 0.2s;
        }
        .chat-i:focus { border-color: #4CAF50; }
        .chat-s {
            width: 45px;
            border-radius: 8px;
            background: #4CAF50;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            transition: background 0.2s;
        }
        .chat-s:hover { background: #45a049; }

        /* Mobile */
        @media (max-width: 768px) {
            .zoom-controls-inline,
            #zoom-btn,
            #page-slider,
            #page-info,
            .h-divider {
                display: none !important;
            }

            .header-icons {
                display: flex !important;
            }
            .header-icons > *:not(#expand-btn) {
                display: none !important;
            }

            .footer-icons-mobile {
                display: flex !important;
            }

            .controls {
                justify-content: space-between !important;
                padding: 15px 20px !important;
                background: rgba(20, 20, 20, 0.95) !important;
                backdrop-filter: blur(15px);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                pointer-events: auto !important;
            }

            .header-left .header-name {
                display: none;
            }
            .header-name {
                max-width: 50vw;
                font-size: 13px;
            }
        }

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
    </style>
</head>

<body>
    <header class="header" id="main-header">
        <div class="header-left">
            <button class="header-icon" id="index-btn" title="Table of Contents">
                <i class="fas fa-list"></i>
            </button>
            ${showBranding && logoUrl ? `<img src="${logoUrl}" alt="Logo" class="header-logo">` : ''}
        </div>
        <div class="header-name">${safeTitle}</div>

        <div class="header-icons" id="header-icons">
            <button class="header-icon" onclick="window.shareSocial('twitter')" title="Share on Twitter"><i class="fab fa-twitter"></i></button>
            <button class="header-icon" onclick="window.shareSocial('facebook')" title="Share on Facebook"><i class="fab fa-facebook"></i></button>
            <button class="header-icon" onclick="window.copyLink()" title="Copy Link"><i class="fas fa-link"></i></button>
            <div class="h-divider"></div>

            <button class="header-icon" id="open-pdf-btn" title="Open New File" style="display:none">
                <i class="fas fa-folder-open"></i>
            </button>
            <button class="header-icon" id="bg-settings-btn" title="Appearance">
                <i class="fas fa-palette"></i>
            </button>
            <button class="header-icon" id="notes-btn" title="Notes">
                <i class="fas fa-pen-fancy"></i>
            </button>

            <div class="zoom-controls-inline" id="zoom-controls">
                <button class="header-icon" id="zoom-out" style="width:28px; height:28px; font-size:12px">
                    <i class="fas fa-minus"></i>
                </button>
                <div class="zoom-text" id="zoom-text">100%</div>
                <button class="header-icon" id="zoom-in" style="width:28px; height:28px; font-size:12px">
                    <i class="fas fa-plus"></i>
                </button>
            </div>

            <a href="?mode=web" class="header-icon" id="web-view-icon-hdr" title="Web View">
                <i class="fas fa-globe"></i>
            </a>

            <button class="header-icon" id="expand-btn" title="Toggle Fullscreen">
                <i class="fas fa-expand"></i>
            </button>
        </div>
    </header>
    <div id="texture-overlay"></div>
    <div class="main-content" id="main-content">
        <div class="loading" id="loading">
            <i class="fas fa-circle-notch fa-spin"></i> Loading...
        </div>

        <div class="error-container" id="error-container" style="display: none;">
            <div class="error-icon"><i class="fas fa-book-open"></i></div>
            <div class="error-title" id="error-title">File Not Found</div>
            <div style="margin-bottom: 20px; color: #aaa;">Please select a PDF file.</div>
            <button class="btn-primary" onclick="window.location.reload()">
                <i class="fas fa-sync"></i> Retry
            </button>
        </div>

        <input type="file" id="file-upload" accept=".pdf" style="display: none;">

        <div id="flipbook-container"></div>
    </div>

    <!-- Index Modal -->
    <div class="index-modal" id="index-modal">
        <div class="index-content">
            <div class="index-header">
                <div style="font-weight:600">Pages</div>
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
    <div class="settings-modal" id="settings-modal" onclick="document.getElementById('settings-modal').classList.remove('open')">
        <div class="settings-content" onclick="event.stopPropagation()">
            <div class="set-header">
                <div style="font-weight:600; text-transform:uppercase; letter-spacing:1px; font-size:12px;">Settings</div>
                <button class="header-icon" onclick="document.getElementById('settings-modal').classList.remove('open')" style="width:28px; height:28px">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Removed tabs since only one remains -->
            <div style="padding: 0 15px; margin-top: 10px; font-weight: 600; font-size:11px; color:#888; text-transform:uppercase; letter-spacing:1px;">General Settings</div>


            <div class="set-body">
                <!-- Display Tab (Now the only tab) -->
                <div id="st-disp" class="set-section active">
                    <div style="margin-bottom: 10px; font-weight: 600; font-size:11px; color:#888; text-transform:uppercase;">Background</div>
                    <div class="bg-grid">
                        <div class="bg-option active" style="background: #1a1a1a;" onclick="setBg('#1a1a1a')" title="Dark"></div>
                        <div class="bg-option" style="background: #333333;" onclick="setBg('#333333')" title="Charcoal"></div>
                        <div class="bg-option" style="background: #0d1b2a;" onclick="setBg('#0d1b2a')" title="Midnight"></div>
                        <div class="bg-option" style="background: #f5f5f5;" onclick="setBg('#f5f5f5')" title="Light"></div>
                        <div class="bg-option" style="background: #e0e0e0;" onclick="setBg('#e0e0e0')" title="Grey"></div>
                        <div class="bg-option" style="background: #d7ccc8;" onclick="setBg('#d7ccc8')" title="Paper"></div>
                        <div class="bg-option" style="background: #fff8e1;" onclick="setBg('#fff8e1')" title="Cream"></div>
                        <div class="bg-option" style="background: linear-gradient(to bottom right, #2c3e50, #000000);" onclick="setBg('linear-gradient(to bottom right, #2c3e50, #000000)')" title="Gradient"></div>
                    </div>

                    <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                        <div class="set-opt-row">
                            <span class="set-label">Paper Texture</span>
                            <button id="tex-toggle" onclick="toggleTexture()" class="btn-primary" style="padding:4px 12px; font-size:11px; background:#444;">OFF</button>
                        </div>
                    </div>

                    <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                         <a href="?mode=web" style="display:block; text-align:center; padding:12px; background:rgba(79, 70, 229, 0.1); color:#818cf8; border-radius:8px; text-decoration:none; font-weight:bold; font-size:12px; border:1px solid rgba(79, 70, 229, 0.3); transition:0.2s;">
                            <i class="fas fa-flask" style="margin-right:8px;"></i> Experimental Web View
                         </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Notes Sidebar -->
    <div id="chat-w">
        <div class="chat-h">
            <span>My Notes</span>
            <button class="close-chat-btn" id="close-notes-btn">✕</button>
        </div>
        <div class="chat-b" id="notes-list">
            <!-- Notes injected here -->
        </div>
        <div class="chat-f">
            <textarea id="chat-i" placeholder="Add a note..." class="chat-i"></textarea>
            <button id="send-note-btn" class="chat-s"><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>

    <div class="controls" id="main-footer">
        <button id="prev-btn" class="nav-button">
            <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="footer-icons-mobile">
            <button class="header-icon" id="bg-settings-btn-mob" title="Settings"><i class="fas fa-palette"></i></button>
            <button class="header-icon" id="notes-btn-mob" title="Notes"><i class="fas fa-pen-fancy"></i></button>
            <a href="?mode=web" class="header-icon" title="Web View"><i class="fas fa-globe"></i></a>
            <button class="header-icon" onclick="window.shareSocial('twitter')"><i class="fab fa-twitter"></i></button>
            <button class="header-icon" onclick="window.shareSocial('facebook')"><i class="fab fa-facebook"></i></button>
            <button class="header-icon" onclick="window.copyLink()"><i class="fas fa-link"></i></button>
        </div>

        <input type="range" id="page-slider" class="page-slider" min="0" max="0" value="0">
        <button id="next-btn" class="nav-button">
            <i class="fas fa-chevron-right"></i>
        </button>
        <div class="page-info" id="page-info">-- / --</div>
    </div>

    <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // File unique key for storage
        const FU = '${encodeURIComponent(fileUrl)}';

        // Global Functions
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
        


        window.setBg = (c) => {
             document.body.style.background = c;
             document.body.style.color = (c.includes('#f') || c.includes('#e') || c.includes('#d')) ? '#333' : '#fff';
             localStorage.setItem('fr_bg', c);
        };
        
        window.toggleTexture = () => {
             document.body.classList.toggle('textured');
             const on = document.body.classList.contains('textured');
             const btn = document.getElementById('tex-toggle');
             if(btn) {
                 btn.innerText = on ? 'ON' : 'OFF';
                 btn.style.background = on ? '#4CAF50' : '#444';
             }
             localStorage.setItem('fr_tex', on);
        };

        class RealFlipbook {
            constructor() {
                this.pdfDoc = null;
                this.pageFlip = null;
                this.totalPages = 0;
                this.currentUrl = null; // No default file
                this.useFullHeight = false; // State for full layout

                // Zoom & Pan
                this.zoom = 1;
                this.panX = 0;
                this.panY = 0;
                this.isDragging = false;
                this.startX = 0;
                this.startY = 0;
                this.currentX = 0;
                this.currentY = 0;
                this.startTime = 0;

                this.centerOffset = 0;
                this.pageWidth = 0;
                this.pageHeight = 0;

                this.renderedPages = new Set();
                this.renderingQueue = new Set();
                this.isRendering = false;
                this.targetPageIndex = 0; // Track the most recent target for prioritization

                this.container = null; // Will be set in rebuildBook
                this.mainContent = document.getElementById('main-content');
                this.header = document.getElementById('main-header');
                this.footer = document.getElementById('main-footer');
                this.fileInput = document.getElementById('file-upload');
                this.bgInput = document.getElementById('bg-upload');

                this.init();
            }

            init() {
                this.setupEventListeners();
                this.setupNotes();
                
                // Initialize settings state
                const sBg = localStorage.getItem('fr_bg');
                if(sBg) window.setBg(sBg);
                const sTex = localStorage.getItem('fr_tex');
                if(sTex === null || sTex === 'true') {
                     document.body.classList.add('textured');
                     const btn = document.getElementById('tex-toggle');
                     if(btn) {
                         btn.innerText = 'ON';
                         btn.style.background = '#4CAF50';
                     }
                }
                
                const openSettings = () => document.getElementById('settings-modal').classList.add('open');
                document.getElementById('bg-settings-btn').onclick = openSettings;
                if(document.getElementById('bg-settings-btn-mob')) {
                    document.getElementById('bg-settings-btn-mob').onclick = openSettings;
                }
                // Do not load default PDF
                this.showLoading(false);
            }
            
            setupNotes() {
                this.editingNoteIndex = -1;
                this.notesSidebar = document.getElementById('chat-w');
                this.notesList = document.getElementById('notes-list');
                this.noteInput = document.getElementById('chat-i');
                this.sendBtn = document.getElementById('send-note-btn');
                
                // Open/Close
                const onNotesToggle = () => this.toggleNotes();
                document.getElementById('notes-btn').onclick = onNotesToggle;
                if(document.getElementById('notes-btn-mob')) {
                    document.getElementById('notes-btn-mob').onclick = onNotesToggle;
                }
                document.getElementById('close-notes-btn').onclick = onNotesToggle;
                
                // Send
                this.sendBtn.onclick = () => this.sendNote();
                this.noteInput.onkeydown = (e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendNote();
                    }
                };

                this.renderNotes();
            }
            
            toggleNotes() {
                this.notesSidebar.classList.toggle('open');
            }
            
            sendNote() {
                const v = this.noteInput.value.trim();
                if(!v) return;
                
                let notes = [];
                try { notes = JSON.parse(localStorage.getItem('fr_nt_' + FU)) || []; } catch(e) {}
                
                if(this.editingNoteIndex > -1) {
                    if(notes[this.editingNoteIndex]) {
                        notes[this.editingNoteIndex].text = v;
                    }
                    this.editingNoteIndex = -1;
                    this.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                } else {
                    notes.push({
                        text: v,
                        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
                    });
                }
                
                localStorage.setItem('fr_nt_' + FU, JSON.stringify(notes));
                this.noteInput.value = '';
                this.renderNotes();
            }
            
            renderNotes() {
                if(!this.notesList) return;
                let notes = [];
                try { notes = JSON.parse(localStorage.getItem('fr_nt_' + FU)) || []; } catch(e) {}
                
                this.notesList.innerHTML = notes.map((n, i) => 
                     '<div class="chat-item">' +
                     '<div class="chat-text">' + this.escapeHtml(n.text) + '</div>' +
                     '<div class="chat-meta">' +
                         '<span>' + n.time + '</span>' +
                         '<div class="chat-actions">' +
                             '<i class="fas fa-edit chat-action-btn chat-edit" data-idx="'+i+'"></i>' +
                             '<i class="fas fa-trash chat-action-btn chat-del" data-idx="'+i+'"></i>' +
                         '</div>' +
                     '</div>' +
                     '</div>'
                ).join('');
                
                // Attach listeners
                this.notesList.querySelectorAll('.chat-edit').forEach(el => {
                    el.onclick = () => this.editNote(parseInt(el.dataset.idx));
                });
                this.notesList.querySelectorAll('.chat-del').forEach(el => {
                    el.onclick = () => this.deleteNote(parseInt(el.dataset.idx));
                });
                
                this.notesList.scrollTop = this.notesList.scrollHeight;
            }
            
            editNote(i) {
                let notes = JSON.parse(localStorage.getItem('fr_nt_' + FU)) || [];
                if(!notes[i]) return;
                this.noteInput.value = notes[i].text;
                this.noteInput.focus();
                this.editingNoteIndex = i;
                this.sendBtn.innerHTML = '<i class="fas fa-check"></i>';
            }
            
            deleteNote(i) {
                if(!confirm('Delete note?')) return;
                let notes = JSON.parse(localStorage.getItem('fr_nt_' + FU)) || [];
                notes.splice(i, 1);
                localStorage.setItem('fr_nt_' + FU, JSON.stringify(notes));
                this.renderNotes();
                
                // Reset edit mode if deleting the currently edited note
                if(this.editingNoteIndex === i) {
                    this.editingNoteIndex = -1;
                    this.noteInput.value = '';
                    this.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                }
            }
            
            escapeHtml(unsafe) {
                return unsafe
                     .replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
            }

            async loadPDF(urlOrData) {
                try {
                    this.showLoading(true);
                    this.hideError();

                    // Load PDF Data Once
                    this.pdfDoc = await pdfjsLib.getDocument(urlOrData).promise;
                    this.totalPages = this.pdfDoc.numPages;

                    document.getElementById('page-slider').max = this.totalPages - 1;

                    // Render the book
                    await this.rebuildBook(0);
                    this.showLoading(false);

                } catch (error) {
                    console.error('Load Error:', error);
                    this.showLoading(false);
                    // Show error popup since this was a user action
                    this.showError();
                    this.fileInput.value = '';
                }
            }

            async rebuildBook(initialPage = 0) {
                if (!this.pdfDoc) return;

                // 1. Completely Clean Up
                if (this.pageFlip) {
                    this.pageFlip.destroy();
                    this.pageFlip = null;
                }

                // Remove old container from DOM to clear any internal library state/styles
                const oldContainer = document.getElementById('flipbook-container');
                if (oldContainer) oldContainer.remove();

                // 2. Create Fresh Container
                this.container = document.createElement('div');
                this.container.id = 'flipbook-container';
                // Important: Add to DOM before calculating anything
                this.mainContent.appendChild(this.container);

                this.renderedPages.clear();
                this.renderingQueue.clear();
                this.isRendering = false;

                // 3. Recalculate dimensions based on current layout state
                const p1 = await this.pdfDoc.getPage(1);
                const vp = p1.getViewport({ scale: 1 });
                const aspectRatio = vp.width / vp.height;

                const dims = this.calculateOptimalSize(aspectRatio);
                this.pageWidth = dims.width;
                this.pageHeight = dims.height;

                // STABILIZE: Explicitly set container size to prevent flexbox jump
                // This matches the size logic passed to PageFlip
                const isMobile = window.innerWidth <= 768;
                this.container.style.width = isMobile ? \`\${dims.width}px\` : \`\${dims.width * 2}px\`;
                this.container.style.height = \`\${dims.height}px\`;

                // 4. Create DOM Nodes for Pages
                for (let i = 1; i <= this.totalPages; i++) {
                    const div = document.createElement('div');
                    if (i === 1 || i === this.totalPages) {
                        div.className = 'page --hard';
                    } else {
                        div.className = 'page --simple';
                    }
                    div.innerHTML = \`<div class="page-content" id="page-content-\${i}"></div>\`;
                    this.container.appendChild(div);
                }

                // 5. Initialize PageFlip with new container
                this.pageFlip = new St.PageFlip(this.container, {
                    width: dims.width,
                    height: dims.height,
                    size: 'fixed',
                    minWidth: 200,
                    maxWidth: 2000,
                    minHeight: 300,
                    maxHeight: 2000,
                    maxShadowOpacity: 0.5,
                    showCover: true,
                    mobileScrollSupport: false,
                    useMouseEvents: true
                });

                this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));

                this.pageFlip.on('flip', (e) => {
                    this.updateControls();
                    this.updateCenterOffset(e.data);
                    this.queueNearbyPages(e.data);
                });

                // 6. Restore State
                this.generateIndex();
                if (initialPage > 0 && initialPage < this.totalPages) {
                    this.pageFlip.flip(initialPage);
                }

                this.updateControls();
                this.updateCenterOffset(initialPage);
                this.queueNearbyPages(initialPage); // Start rendering
            }

            calculateOptimalSize(aspectRatio) {
                // If using full height, ignore header/footer in calculation
                const headerH = this.useFullHeight ? 0 : (this.header.offsetHeight || 60);
                const footerH = this.useFullHeight ? 0 : (this.footer.offsetHeight || 70);
                const margin = this.useFullHeight ? 20 : 40;

                const availW = window.innerWidth;
                const availH = window.innerHeight - headerH - footerH - margin;

                let height = availH;
                let width = height * aspectRatio;

                if (window.innerWidth > 768) {
                    if ((width * 2) > (availW - margin)) {
                        width = (availW - margin) / 2;
                        height = width / aspectRatio;
                    }
                } else {
                    if (width > (availW - 20)) {
                        width = availW - 20;
                        height = width / aspectRatio;
                    }
                }

                let w = Math.floor(width);
                if (w % 2 !== 0) w--;
                return { width: w, height: Math.floor(height) };
            }

            // NEW: Queueing Logic with Global Target Tracking
            queueNearbyPages(currentIndex) {
                this.targetPageIndex = currentIndex; // Update target page globally
                const range = 10; // Preload 10 pages
                const start = Math.max(0, currentIndex - range);
                const end = Math.min(this.totalPages - 1, currentIndex + range);

                // Add to queue if not rendered
                for (let i = start; i <= end; i++) {
                    const pageNum = i + 1;
                    if (!this.renderedPages.has(pageNum)) {
                        this.renderingQueue.add(pageNum);
                    }
                }

                // Trigger Processor
                this.processRenderQueue();
            }

            async processRenderQueue() {
                if (this.isRendering) return; // Already running
                this.isRendering = true;

                while (this.renderingQueue.size > 0) {
                    // Re-sort based on the *latest* targetPageIndex (supports rapid slider moves)
                    const queueArray = Array.from(this.renderingQueue);
                    queueArray.sort((a, b) => {
                        const distA = Math.abs((a - 1) - this.targetPageIndex);
                        const distB = Math.abs((b - 1) - this.targetPageIndex);
                        return distA - distB;
                    });

                    const pageNum = queueArray[0];
                    this.renderingQueue.delete(pageNum);

                    // Check if already rendered (edge case)
                    if (this.renderedPages.has(pageNum)) continue;

                    // Check if element still exists (after layout reset)
                    const container = document.getElementById(\`page-content-\${pageNum}\`);
                    if (!container) {
                        this.isRendering = false;
                        return; // Stop if DOM is gone
                    }

                    try {
                        await this.renderPageContent(pageNum);
                        this.renderedPages.add(pageNum);
                    } catch (e) {
                        console.error("Render Error Page " + pageNum, e);
                    }

                    // Small delay to let UI breathe
                    await new Promise(r => setTimeout(r, 10));
                }

                this.isRendering = false;
            }

            async renderPageContent(pageNum) {
                const container = document.getElementById(\`page-content-\${pageNum}\`);
                if (!container) return;

                // Only clear if empty (prevent flicker if re-rendering)
                if (container.innerHTML.includes('loader')) container.innerHTML = '';

                try {
                    const page = await this.pdfDoc.getPage(pageNum);

                    // Adjust scale for quality vs performance
                    const viewport = page.getViewport({ scale: 2.0 });

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    container.appendChild(canvas);

                    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                } catch (e) {
                    throw e;
                }
            }

            updateCenterOffset(targetIndex) {
                if (window.innerWidth <= 768) {
                    this.centerOffset = 0;
                    if (this.container) {
                        // FORCE No transition on mobile to prevent "jump"
                        this.container.style.transition = 'none';
                        this.applyTransform();
                    }
                    return;
                }

                // Desktop Logic
                let index = targetIndex !== undefined ? targetIndex : this.pageFlip.getCurrentPageIndex();
                if (index === 0) this.centerOffset = -this.pageWidth / 2;
                else if (index === this.totalPages - 1 && this.totalPages % 2 === 0) this.centerOffset = this.pageWidth / 2;
                else this.centerOffset = 0;

                if (this.container) {
                    // Smooth transition for Desktop centering
                    this.container.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                    this.applyTransform();
                }
            }

            updateControls() {
                if (!this.pageFlip) return;
                const index = this.pageFlip.getCurrentPageIndex();
                const pageNum = index + 1;
                let text = (window.innerWidth <= 768 || index === 0 || index === this.totalPages - 1)
                    ? \`Page \${pageNum}\` : \`Pages \${pageNum}-\${pageNum + 1}\`;
                document.getElementById('page-info').textContent = \`\${text} / \${this.totalPages}\`;
                document.getElementById('page-slider').value = index;
                document.getElementById('prev-btn').disabled = index === 0;
                document.getElementById('next-btn').disabled = index >= this.totalPages - 1;
            }

            setupBackgroundSettings() {
                const bgModal = document.getElementById('bg-modal');

                // Open Modal
                document.getElementById('bg-settings-btn').onclick = () => {
                    bgModal.style.display = 'flex';
                };

                // Close Modal
                document.getElementById('bg-close-btn').onclick = () => {
                    bgModal.style.display = 'none';
                };

                // Presets
                const options = document.querySelectorAll('.bg-option');
                options.forEach(opt => {
                    opt.onclick = () => {
                        options.forEach(o => o.classList.remove('active'));
                        opt.classList.add('active');
                        document.body.style.backgroundImage = opt.dataset.bg;
                        document.body.style.background = opt.dataset.bg;
                    };
                });

                // Custom Upload
                this.bgInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const url = URL.createObjectURL(file);
                        document.body.style.background = \`url(\${url}) no-repeat center center fixed\`;
                        document.body.style.backgroundSize = 'cover';
                        options.forEach(o => o.classList.remove('active'));
                        bgModal.style.display = 'none';
                    }
                };
            }

            setupEventListeners() {
                document.getElementById('prev-btn').onclick = () => this.pageFlip.flipPrev();
                document.getElementById('next-btn').onclick = () => this.pageFlip.flipNext();
                document.getElementById('page-slider').oninput = (e) => this.pageFlip.flip(parseInt(e.target.value));

                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        if (this.pdfDoc) {
                            this.resetZoom();
                            let curr = 0;
                            if (this.pageFlip) { try { curr = this.pageFlip.getCurrentPageIndex(); } catch (e) { } }
                            this.rebuildBook(curr);
                        }
                    }, 500);
                });

                window.addEventListener('keydown', (e) => {
                    if (!this.pageFlip) return;
                    if (e.key === 'ArrowLeft') this.pageFlip.flipPrev();
                    if (e.key === 'ArrowRight') this.pageFlip.flipNext();
                });

                document.getElementById('zoom-in').onclick = () => this.handleZoom(0.25);
                document.getElementById('zoom-out').onclick = () => this.handleZoom(-0.25);
                document.getElementById('open-pdf-btn').onclick = () => this.fileInput.click();

                document.getElementById('expand-btn').onclick = () => {
                    this.useFullHeight = !this.useFullHeight;
                    document.body.classList.toggle('full-mode', this.useFullHeight);
                    const icon = document.querySelector('#expand-btn i');
                    if (this.useFullHeight) {
                        icon.classList.remove('fa-expand');
                        icon.classList.add('fa-compress');
                    } else {
                        icon.classList.remove('fa-compress');
                        icon.classList.add('fa-expand');
                    }

                    this.zoom = 1;
                    this.panX = 0;
                    this.panY = 0;
                    this.updateZoomDisplay();

                    let curr = 0;
                    if (this.pageFlip) { try { curr = this.pageFlip.getCurrentPageIndex(); } catch (e) { } }
                    this.rebuildBook(curr);
                };

                // UPDATED: Mousedown logic handles Flip on Press for background
                this.mainContent.addEventListener('mousedown', (e) => {
                    if (this.zoom > 1) {
                        this.startPan(e, e.clientX, e.clientY);
                        return;
                    }

                    // Zoom == 1 (Fit to screen)
                    const isUI = e.target.closest('.header') || e.target.closest('.controls') || e.target.closest('.index-modal') || e.target.closest('#chat-w');
                    const isBook = e.target.closest('.page') || e.target.closest('.stf__wrapper');

                    if (!isUI && !isBook && !e.target.closest('#error-container')) {
                        // Background Click -> Flip Immediately
                        if (this.pageFlip) {
                            if (e.clientX > window.innerWidth / 2) this.pageFlip.flipNext();
                            else this.pageFlip.flipPrev();

                            this.blockClick = true; // Prevent click event later
                        }
                    }
                });

                // Mouse Move/Up handles Panning only
                window.addEventListener('mousemove', (e) => this.movePan(e.clientX, e.clientY));
                window.addEventListener('mouseup', (e) => this.endPan());

                // Touch Events for Swipe/Pan
                this.mainContent.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 1) {
                        this.startPan(e, e.touches[0].clientX, e.touches[0].clientY);
                    }
                }, { passive: false });

                this.mainContent.addEventListener('touchmove', (e) => {
                    if (e.touches.length === 1) {
                        // Only prevent default if we are dragging Background/Pan
                        if (this.isDragging) e.preventDefault();
                        this.movePan(e.touches[0].clientX, e.touches[0].clientY);
                    }
                }, { passive: false });

                this.mainContent.addEventListener('touchend', (e) => {
                    this.endPan();
                });

                this.mainContent.addEventListener('click', (e) => {
                    if (this.blockClick) {
                        this.blockClick = false;
                        return;
                    }
                    if (this.isDragging) return;
                    if (this.zoom > 1) return;
                    // No default handling here anymore for mouse, moved to mousedown
                });

                this.mainContent.addEventListener('wheel', (e) => {
                    if (e.ctrlKey || true) {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? -0.1 : 0.1;
                        this.handleZoom(delta);
                    }
                });

                document.getElementById('index-btn').onclick = () => document.getElementById('index-modal').style.display = 'flex';
                document.getElementById('index-close-btn').onclick = () => document.getElementById('index-modal').style.display = 'none';

                this.fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const url = URL.createObjectURL(file);
                        this.currentUrl = url;
                        this.fileInput.value = '';
                        this.loadPDF(url);
                    }
                };
            }

            handleZoom(delta) {
                const newZoom = this.zoom + delta;
                if (newZoom >= 0.5 && newZoom <= 3.0) {
                    this.zoom = newZoom;
                    if (this.zoom <= 1) { this.panX = 0; this.panY = 0; }
                    this.updateCenterOffset();
                    this.updateZoomDisplay();

                    if (this.zoom > 1) {
                        // When zoomed, disable library interaction to allow panning
                        this.container.style.pointerEvents = 'none';
                        this.mainContent.style.cursor = 'grab';
                        this.mainContent.classList.toggle('grabbing', false);
                    } else {
                        // When Fit, enable library interaction (page drag)
                        this.container.style.pointerEvents = 'auto';
                        this.mainContent.style.cursor = 'default';
                        this.mainContent.classList.remove('grabbing');
                    }
                }
            }

            resetZoom() {
                this.zoom = 1; this.panX = 0; this.panY = 0;

                if (this.container) this.container.style.pointerEvents = 'auto';
                this.mainContent.style.cursor = 'default';
                this.mainContent.classList.remove('grabbing');

                this.updateCenterOffset();
                this.updateZoomDisplay();
            }

            startPan(e, x, y) {
                // Check if target is book or background
                const target = e.target;
                const isBook = target.closest('.page') || target.closest('.stf__wrapper');

                if (this.zoom > 1) {
                    // If Zoomed, always Pan regardless of target
                    this.isDragging = true;
                    this.startX = x;
                    this.startY = y;
                    this.currentX = x;
                    this.currentY = y;
                    this.startTime = Date.now();

                    if (this.container) this.container.style.transition = 'none';
                    this.mainContent.classList.add('grabbing');
                    this.mainContent.style.cursor = 'grabbing';
                } else {
                    // If Fit to Screen (Zoom=1)
                    if (isBook) {
                        // We touched the book -> Let library handle drag
                        this.isDragging = false;
                    } else {
                        // We touched background -> Start Swipe detection
                        this.isDragging = true;
                        this.startX = x;
                        this.startY = y;
                        this.currentX = x;
                        this.currentY = y;
                        this.startTime = Date.now();
                    }
                }
            }

            movePan(x, y) {
                if (!this.isDragging) return;

                if (this.zoom > 1) {
                    const dx = x - this.currentX;
                    const dy = y - this.currentY;
                    this.panX += dx;
                    this.panY += dy;
                    this.applyTransform();
                }

                this.currentX = x;
                this.currentY = y;
            }

            endPan() {
                if (!this.isDragging) return;

                // Swipe Detection (Only if Zoom is 1 and dragging background)
                if (this.zoom === 1) {
                    const diffX = this.currentX - this.startX;
                    const timeDiff = Date.now() - this.startTime;

                    if (Math.abs(diffX) > 50 && timeDiff < 300) {
                        if (diffX > 0) this.pageFlip.flipPrev();
                        else this.pageFlip.flipNext();
                    }
                }

                this.isDragging = false;

                if (this.zoom > 1) {
                    this.mainContent.classList.remove('grabbing');
                    this.mainContent.style.cursor = 'grab';
                    if (this.container && window.innerWidth > 768) {
                        this.container.style.transition = 'transform 0.2s ease-out';
                    }
                }
            }

            applyTransform() {
                if (!this.container) return;
                const x = this.panX + this.centerOffset;
                this.container.style.transform = \`translate(\${x}px, \${this.panY}px) scale(\${this.zoom})\`;
            }

            updateZoomDisplay() {
                document.getElementById('zoom-text').textContent = Math.round(this.zoom * 100) + '%';
            }

            generateIndex() {
                const list = document.getElementById('index-list');
                list.innerHTML = '';
                for (let i = 1; i <= this.totalPages; i++) {
                    const div = document.createElement('div');
                    div.className = 'index-item';
                    div.innerHTML = \`<span>Page \${i}</span> <span class="index-page-number">\${i}</span>\`;
                    div.onclick = () => {
                        this.pageFlip.flip(i - 1);
                        document.getElementById('index-modal').style.display = 'none';
                    };
                    list.appendChild(div);
                }
            }

            showLoading(show) { document.getElementById('loading').style.display = show ? 'flex' : 'none'; }
            showError() { document.getElementById('error-container').style.display = 'block'; }
            hideError() { document.getElementById('error-container').style.display = 'none'; }
        }

        document.addEventListener('DOMContentLoaded', () => {
             const book = new RealFlipbook();
             const fileUrl = "${fileUrl}";
             if(fileUrl) {
                book.loadPDF(fileUrl);
             }
        });
    </script>
</body>

</html>`;
}
