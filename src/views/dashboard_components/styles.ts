export const styles = `
:root {
  --bg-primary:#ffffff;
  --bg-secondary:#f8fafc;
  --bg-card:#ffffff;
  --bg-elevated:#f1f5f9;
  --text-primary:#0f172a;
  --text-secondary:#334155;
  --text-muted:#64748b;
  --accent-cyan:#4f46e5;
  --accent-magenta:#ec4899;
  --accent-purple:#8b5cf6;
  --accent-blue:#3b82f6;
  --border:rgba(0,0,0,0.06);
  --glow-cyan:rgba(79, 70, 229, 0.25);
  --glow-magenta:rgba(236, 72, 153, 0.25);
  --shadow:rgba(0,0,0,0.08)
}
:root[data-theme="dark"]{
  --bg-primary:#0a0a0f;
  --bg-secondary:#12121a;
  --bg-card:#1a1a24;
  --bg-elevated:#252538;
  --text-primary:#fcfcfc;
  --text-secondary:#a0aec0;
  --text-muted:#64748b;
  --accent-cyan:#6366f1;
  --accent-magenta:#f472b6;
  --accent-purple:#a78bfa;
  --accent-blue:#60a5fa;
  --border:rgba(255,255,255,0.08);
  --glow-cyan:rgba(99, 102, 241, 0.4);
  --glow-magenta:rgba(244, 114, 182, 0.3);
  --shadow:rgba(0,0,0,0.5)
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Work Sans',sans-serif;background:var(--bg-primary);color:var(--text-primary);min-height:100vh;transition:background 0.3s,color 0.3s}
.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:260px;background:var(--bg-secondary);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:24px;flex-shrink:0;transition:all .3s cubic-bezier(0.4,0,0.2,1);z-index:100;position:relative}
@media(min-width:769px){
  .sidebar.collapsed{width:80px;padding:24px 12px}
  .sidebar.collapsed .logo span, .sidebar.collapsed .nav-item span, .sidebar.collapsed .user-info, .sidebar.collapsed .user-profile i:last-child {display:none}
  .sidebar.collapsed .sidebar-header {justify-content:center}
  .sidebar.collapsed .nav-item {justify-content:center;padding:12px 0}
  .sidebar.collapsed .user-profile {justify-content:center;padding-top:20px}
  .sidebar.collapsed .collapse-btn {transform:rotate(180deg)}
  .sidebar.collapsed .collapse-btn:hover{transform:rotate(180deg) scale(1.1)}
}
.collapse-btn{position:absolute;right:-12px;top:32px;width:24px;height:24px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:101;color:var(--text-secondary);transition:all .3s ease;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
.collapse-btn:hover{color:var(--accent-cyan);border-color:var(--accent-cyan);transform:scale(1.1)}
@media(max-width:768px){.collapse-btn{display:none}}
.md-only{display:flex}@media(max-width:768px){.md-only{display:none}}
.sidebar-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;height:40px}
.logo{display:flex;align-items:center;gap:12px;text-decoration:none;flex-shrink:0}
.logo img{height:32px;width:32px;object-fit:contain;display:block}
.logo span{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;letter-spacing:1px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase;line-height:1}
.nav-item{display:flex;align-items:center;gap:12px;padding:12px 16px;color:var(--text-secondary);text-decoration:none;border-radius:12px;margin-bottom:4px;transition:all .3s;font-weight:600;font-size:14px;cursor:pointer;white-space:nowrap;overflow:hidden}
.nav-item:hover,.nav-item.active{background:var(--bg-elevated);color:var(--accent-cyan)}
.nav-item i{width:20px;text-align:center;font-size:18px;flex-shrink:0}
.user-profile{margin-top:auto;padding:16px;border-top:1px solid var(--border);border-radius:12px;display:flex;gap:12px;align-items:center;overflow:hidden;transition:background 0.2s}
.user-profile:hover {background:var(--bg-elevated)}
.user-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0}
.user-info{flex:1;overflow:hidden;transition:opacity 0.2s}
.user-name{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-plan{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px}
.content{flex:1;overflow-y:auto;padding:20px 32px;position:relative;background:var(--bg-primary);transition:all .3s cubic-bezier(0.4,0,0.2,1)}
.view-section{display:none;animation:fadeIn 0.35s}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.view-section.active{display:block}
.view-section.active.store-builder{display:flex;flex-direction:column;height:calc(100vh - 0px);overflow:hidden;padding:0}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;height:36px}
h2{font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;letter-spacing:-0.5px;line-height:36px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px}
.stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;position:relative;overflow:hidden;transition:all .3s}
.stat-card:hover{border-color:var(--accent-cyan);transform:translateY(-3px);box-shadow:0 8px 30px var(--shadow)}
.stat-val{font-family:'Rajdhani',sans-serif;font-size:36px;font-weight:700;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.stat-label{font-size:13px;color:var(--text-secondary);font-weight:600;letter-spacing:0.5px}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;margin-bottom:20px}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:11px;font-weight:700;color:var(--text-secondary);margin-bottom:7px;text-transform:uppercase;letter-spacing:0.5px}
.form-group input,.form-group textarea,.form-group select{width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);outline:none;transition:all .3s;font-family:'Work Sans',sans-serif;font-size:13px}
/* ====== STORE BUILDER SPLIT-PANE ====== */
.store-builder{position:relative}
.store-builder-header{display:flex;justify-content:space-between;align-items:center;padding:14px 24px;border-bottom:1px solid var(--border);background:var(--bg-secondary);flex-shrink:0}
.store-builder-header h2{margin:0;font-size:22px;line-height:1}
.store-builder-body{display:flex;flex:1;min-height:0;overflow:hidden}
.store-panel-settings{width:33.333%;min-width:320px;max-width:480px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid var(--border);background:var(--bg-primary);overflow:hidden}
.store-panel-inner{flex:1;overflow-y:auto;padding:20px 20px 80px;scrollbar-width:thin}
.store-panel-preview{flex:1;display:flex;flex-direction:column;background:var(--bg-secondary);min-width:0}
.store-preview-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:var(--bg-secondary);border-bottom:1px solid var(--border);flex-shrink:0}
.store-preview-url{display:flex;align-items:center;background:var(--bg-elevated);border:1px solid var(--border);border-radius:8px;padding:5px 12px;font-size:12px;color:var(--text-muted);font-family:monospace;max-width:calc(100% - 120px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.store-preview-badge{font-size:11px;font-weight:600;color:var(--text-secondary);display:flex;align-items:center;white-space:nowrap}
/* Compact store builder section headings */
.store-panel-inner h3{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-secondary);margin:20px 0 12px;border-bottom:1px solid var(--border);padding-bottom:8px}
.store-panel-inner h3:first-child{margin-top:0}
.form-group input:focus{border-color:var(--accent-cyan);box-shadow:0 0 0 3px var(--glow-cyan)}
.btn{padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:#fff;font-weight:700;cursor:pointer;transition:all .3s;text-transform:uppercase;font-size:13px;letter-spacing:1px}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--glow-magenta)}
.btn-outline{background:transparent;border:1px solid var(--border);color:var(--text-secondary);box-shadow:none;display:flex;align-items:center;gap:8px;font-weight:600;justify-content:center}
.btn-outline:hover,.btn-outline.active{border-color:var(--accent-cyan);color:var(--accent-cyan);background:var(--bg-elevated)}
.btn-outline.active{border-width:2px;box-shadow:0 0 15px var(--glow-cyan)}
.book-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px}
.book-item{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:all .3s;position:relative}
.book-item:hover{border-color:var(--accent-cyan);transform:translateY(-6px);box-shadow:0 10px 40px var(--shadow)}
.book-cover{height:220px;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;overflow:hidden;border-bottom:1px solid var(--border);padding:12px}
.book-cover img{max-width:100%;max-height:100%;object-fit:contain;box-shadow:0 6px 16px rgba(0,0,0,0.15);border-radius:4px}
.book-content{padding:20px}
.book-title{font-weight:700;font-size:16px;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.book-actions{display:flex;gap:8px;margin-top:16px}
.book-actions button{flex:1;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-secondary);cursor:pointer;transition:all .2s}
.book-actions button:hover{background:var(--accent-purple);color:#fff;border-color:var(--accent-purple)}
.upload-zone{border:2px dashed var(--border);border-radius:20px;padding:40px;text-align:center;cursor:pointer;transition:all .3s;background:var(--bg-card);margin-bottom:32px}
.upload-zone:hover{border-color:var(--accent-cyan);background:var(--bg-elevated);box-shadow:0 0 30px var(--glow-cyan)}
.auth-container{display:flex;align-items:center;justify-content:center;height:100vh;background:var(--bg-primary)}
.auth-box{width:100%;max-width:400px;padding:40px;background:var(--bg-card);border-radius:24px;border:1px solid var(--border);box-shadow:0 20px 60px var(--shadow)}
.msg{padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:16px;display:none}
.msg.success{background:rgba(0,212,255,0.1);color:var(--accent-cyan);border:1px solid var(--accent-cyan)}
.msg.error{background:rgba(255,0,110,0.1);color:var(--accent-magenta);border:1px solid var(--accent-magenta)}
@keyframes spin{to{transform:rotate(360deg)}}
.modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:none;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(5px);overflow-y:auto;padding:20px}
.modal-content{background:var(--bg-card);padding:40px;border-radius:24px;width:100%;max-width:500px;border:1px solid var(--border);position:relative;animation:modalPop 0.3s;margin:auto}
@keyframes modalPop{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}
.close-btn{position:absolute;top:20px;right:20px;cursor:pointer;color:var(--text-muted);transition:color .3s}
.close-btn:hover{color:#fff}
@media(max-width:768px){
  body{overflow-x:hidden}
  .layout{flex-direction:column;height:100vh;overflow:hidden;position:relative}
  .sidebar{
    position:fixed;top:0;left:0;bottom:0;width:280px;height:100%;
    transform:translateX(-100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);
    box-shadow:5px 0 25px rgba(0,0,0,0.1);border-right:1px solid var(--border);
    z-index:2000;background:var(--bg-secondary);padding-top:60px
  }
  .sidebar.open{transform:translateX(0)}
  .content{padding:16px;padding-top:70px;height:100vh;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .header{margin-top:0;padding-top:0}
  .nav-item{display:flex;padding:12px 16px;margin-bottom:4px;width:100%}
  
  /* Mobile Header */
  .mobile-header {
    display:flex;align-items:center;justify-content:space-between;
    position:fixed;top:0;left:0;right:0;height:56px;
    padding:0 16px;background:var(--bg-primary);
    border-bottom:1px solid var(--border);z-index:1000;
  }
  .mobile-menu-btn {
    font-size:20px;color:var(--text-primary);border:none;background:none;cursor:pointer;
  }
  .mobile-overlay {
    position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1500;
    opacity:0;pointer-events:none;transition:opacity 0.3s;
  }
  .mobile-overlay.active {opacity:1;pointer-events:auto}
  .stats{grid-template-columns:1fr;gap:12px}
  .book-grid{grid-template-columns:1fr;gap:12px}
  .card{padding:18px;margin-bottom:16px}
  h2{font-size:22px}
  .modal-content{padding:20px;max-width:calc(100vw - 32px)}
  .crop-modal-content{max-width:calc(100vw - 32px)}
  /* Store builder stacks on mobile */
  .store-builder-body{flex-direction:column}
  .store-panel-settings{width:100%;max-width:100%;border-right:none;border-bottom:1px solid var(--border);max-height:50vh}
  .store-panel-preview{min-height:300px}
}
/* Theme preset cards */
.theme-preset-card{cursor:pointer;text-align:center;padding:8px;border-radius:12px;border:2px solid transparent;transition:all .2s}
.theme-preset-card:hover{border-color:var(--border);background:var(--bg-elevated)}
.theme-preset-card.active{border-color:var(--accent-cyan);background:var(--bg-elevated)}
.accent-swatch{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .2s;display:inline-block}
.accent-swatch:hover{transform:scale(1.2);border-color:var(--text-muted)}
/* Members table */
.members-table{width:100%;border-collapse:collapse}
.members-table th{text-align:left;font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;padding:12px 16px;border-bottom:1px solid var(--border)}
.members-table td{padding:12px 16px;border-bottom:1px solid var(--border);font-size:14px;vertical-align:middle}
.members-table tr:hover td{background:var(--bg-elevated)}
.member-status{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px}
.member-status.active{background:rgba(16,185,129,0.1);color:#10b981}
.member-status.inactive{background:rgba(239,68,68,0.1);color:#ef4444}
.access-key-text{font-family:monospace;font-size:12px;color:var(--text-muted);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:middle}
/* Book list view */
.book-list{display:flex;flex-direction:column;gap:12px}
.book-list-item{display:flex;align-items:center;gap:16px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;transition:all .3s}
.book-list-item:hover{border-color:var(--accent-cyan);transform:translateX(4px);box-shadow:0 4px 20px var(--shadow)}
.book-list-item .book-thumb{width:48px;height:64px;border-radius:6px;overflow:hidden;flex-shrink:0;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center}
.book-list-item .book-thumb img{width:100%;height:100%;object-fit:cover}
.book-list-item .book-meta{flex:1;min-width:0}
.book-list-item .book-title{margin-bottom:4px}
/* Books tabs */
.books-tabs{display:flex;gap:4px;background:var(--bg-elevated);padding:4px;border-radius:12px;margin-bottom:24px;width:fit-content}
.books-tab{padding:8px 20px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text-secondary);border:none;background:none}
.books-tab.active{background:var(--bg-card);color:var(--text-primary);box-shadow:0 2px 8px var(--shadow)}
/* Share modal */
.share-list{max-height:200px;overflow-y:auto;margin:16px 0}
.share-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border)}
.share-item:last-child{border-bottom:none}
/* Search & Filter bar */
.books-toolbar{display:flex;gap:12px;align-items:center;margin-bottom:24px;flex-wrap:wrap}
.books-search{flex:1;min-width:200px;padding:10px 16px 10px 40px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);outline:none;font-family:'Work Sans',sans-serif;transition:all .3s;position:relative}
.books-search:focus{border-color:var(--accent-cyan);box-shadow:0 0 0 3px var(--glow-cyan)}
.books-search-wrap{position:relative;flex:1;min-width:200px}
.books-search-wrap i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:14px;pointer-events:none}
.view-toggle{display:flex;gap:4px;background:var(--bg-elevated);padding:3px;border-radius:10px}
.view-toggle button{padding:8px 12px;border:none;background:none;color:var(--text-muted);cursor:pointer;border-radius:8px;transition:all .2s;font-size:14px}
.view-toggle button.active{background:var(--bg-card);color:var(--text-primary);box-shadow:0 2px 6px var(--shadow)}
.hidden{display:none !important}
.billing-toggle{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:20px}
.toggle-label{font-size:14px;font-weight:600;color:var(--text-secondary);cursor:pointer;transition:color .3s}
.toggle-label.active{color:var(--text-primary)}
.toggle-switch{width:48px;height:26px;background:var(--bg-elevated);border-radius:13px;position:relative;cursor:pointer;transition:background .3s;border:1px solid var(--border)}
.toggle-switch.active{background:var(--accent-cyan)}
.toggle-knob{width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:transform .3s;box-shadow:0 2px 4px rgba(0,0,0,0.2)}
.toggle-switch.active .toggle-knob{transform:translateX(22px)}
.badge-save{font-size:10px;background:rgba(255,0,110,0.1);color:var(--accent-magenta);padding:2px 6px;border-radius:4px;margin-left:4px;text-transform:uppercase;font-weight:700}
.price-display{margin-bottom:16px}
.price-display .currency{font-size:20px;font-weight:700;color:var(--text-primary);vertical-align:top;line-height:1.5}
.price-display .amount{font-size:36px;font-weight:700;color:inherit}
.price-display .interval{font-size:14px;color:var(--text-muted);margin-left:2px}
.billed-text{font-size:12px;color:var(--text-muted);margin-top:4px}
/* Cropper Modal */
.crop-modal-content {
  background: var(--bg-card);
  padding: 0;
  border-radius: 24px;
  width: 90%;
  max-width: 600px;
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.crop-area { height: 400px; background: #000; }
.crop-controls { padding: 20px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); }
/* ====== MARKDOWN EDITOR ====== */
.md-editor{border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--bg-elevated)}
.md-toolbar{display:flex;align-items:center;gap:2px;padding:8px 10px;background:var(--bg-secondary);border-bottom:1px solid var(--border);flex-wrap:wrap}
.md-toolbar button{padding:5px 9px;border:1px solid transparent;border-radius:7px;background:none;color:var(--text-secondary);cursor:pointer;font-size:13px;font-family:inherit;transition:all .15s;white-space:nowrap}
.md-toolbar button:hover{background:var(--bg-elevated);color:var(--text-primary);border-color:var(--border)}
.md-sep{width:1px;height:20px;background:var(--border);margin:0 4px;flex-shrink:0}
.md-tab{font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.4px}
.md-tab.active{background:var(--bg-card) !important;color:var(--accent-cyan) !important;border-color:var(--accent-cyan) !important}
.md-body{position:relative}
.md-textarea{width:100%;border:none !important;border-radius:0 !important;resize:vertical;background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',monospace;font-size:14px;line-height:1.7;padding:14px;outline:none;box-shadow:none !important;min-height:180px}
.md-preview{padding:16px 18px;min-height:180px;font-size:14px;line-height:1.7;color:var(--text-primary);background:var(--bg-card)}
.md-preview h1,.md-preview h2,.md-preview h3,.md-preview h4{font-weight:700;margin:1.2em 0 0.5em;color:var(--text-primary)}
.md-preview h2{font-size:1.3em}.md-preview h3{font-size:1.1em}
.md-preview p{margin:0 0 0.9em}
.md-preview strong{font-weight:700}
.md-preview em{font-style:italic}
.md-preview a{color:var(--accent-cyan);text-decoration:underline}
.md-preview hr{border:none;border-top:1px solid var(--border);margin:1.2em 0}
.md-preview ul,.md-preview ol{padding-left:1.5em;margin:0 0 0.9em}
.md-preview li{margin-bottom:0.3em}
.md-preview blockquote{border-left:3px solid var(--accent-cyan);padding:4px 12px;color:var(--text-muted);font-style:italic;margin:0.8em 0}
.md-preview code{background:var(--bg-elevated);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.9em}
`;
