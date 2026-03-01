export const styles = `
/* ============================================================
   SHOPUBLISH DASHBOARD — DESIGN SYSTEM
   Indigo & Slate · Light + Dark
   ============================================================ */

/* ── Tokens ─────────────────────────────────────────────── */
:root {
  --color-accent:        #6366f1;
  --color-accent-hover:  #4f46e5;
  --color-accent-subtle: #eef2ff;
  --color-danger:        #ef4444;
  --color-success:       #10b981;
  --color-warning:       #f59e0b;

  --bg-base:             #f9fafb;
  --bg-surface:          #ffffff;
  --bg-raised:           #f3f4f6;
  --bg-sidebar:          #ffffff;

  --text-primary:        #111827;
  --text-secondary:      #4b5563;
  --text-muted:          #9ca3af;
  --text-on-accent:      #ffffff;

  --border-default:      #e5e7eb;
  --border-strong:       #d1d5db;

  --shadow-sm:           0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:           0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg:           0 12px 32px rgba(0,0,0,0.10);

  --radius-sm:           6px;
  --radius-md:           8px;
  --radius-lg:           12px;
  --radius-xl:           16px;

  --sidebar-width:       240px;
  --sidebar-collapsed:   64px;
}

:root[data-theme="dark"] {
  --color-accent-subtle: rgba(99,102,241,0.15);

  --bg-base:             #0f172a;
  --bg-surface:          #1e293b;
  --bg-raised:           #334155;
  --bg-sidebar:          #1e293b;

  --text-primary:        #f1f5f9;
  --text-secondary:      #94a3b8;
  --text-muted:          #64748b;

  --border-default:      rgba(255,255,255,0.08);
  --border-strong:       rgba(255,255,255,0.14);

  --shadow-sm:           0 1px 2px rgba(0,0,0,0.3);
  --shadow-md:           0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:           0 12px 32px rgba(0,0,0,0.5);
}

/* ── Reset ──────────────────────────────────────────────── */
*{margin:0;padding:0;box-sizing:border-box}

/* ── Base ───────────────────────────────────────────────── */
body{
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:var(--bg-base);
  color:var(--text-primary);
  min-height:100vh;
  font-size:14px;
  line-height:1.5;
  transition:background 0.2s,color 0.2s
}
h2{font-size:22px;font-weight:700;letter-spacing:-0.3px;line-height:1.3}
h3{font-size:15px;font-weight:600;color:var(--text-primary);letter-spacing:-0.1px}
h4{font-size:13px;font-weight:600;color:var(--text-primary)}

/* ── Layout ─────────────────────────────────────────────── */
.layout{display:flex;height:100vh;overflow:hidden}

/* ── Sidebar ────────────────────────────────────────────── */
.sidebar{
  width:var(--sidebar-width);
  background:var(--bg-sidebar);
  border-right:1px solid var(--border-default);
  display:flex;
  flex-direction:column;
  padding:16px 12px;
  flex-shrink:0;
  transition:width 0.25s cubic-bezier(0.4,0,0.2,1),padding 0.25s;
  z-index:100;
  position:relative;
  overflow:hidden
}
@media(min-width:769px){
  .sidebar.collapsed{width:var(--sidebar-collapsed);padding:16px 8px}
  .sidebar.collapsed .logo span,
  .sidebar.collapsed .nav-item span,
  .sidebar.collapsed .nav-section-label,
  .sidebar.collapsed .user-info,
  .sidebar.collapsed .user-profile i.fa-cog{display:none}
  .sidebar.collapsed .sidebar-header{justify-content:center}
  .sidebar.collapsed .nav-item{justify-content:center;padding:10px 0}
  .sidebar.collapsed .user-profile{justify-content:center;padding:12px 0}
  .sidebar.collapsed .collapse-btn{transform:rotate(180deg)}
  .sidebar.collapsed .collapse-btn:hover{transform:rotate(180deg) scale(1.1)}
}

.collapse-btn{
  position:absolute;right:-10px;top:28px;
  width:20px;height:20px;
  background:var(--bg-surface);
  border:1px solid var(--border-default);
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;z-index:101;
  color:var(--text-muted);font-size:10px;
  transition:all 0.2s;
  box-shadow:var(--shadow-sm)
}
.collapse-btn:hover{color:var(--color-accent);border-color:var(--color-accent)}
@media(max-width:768px){.collapse-btn{display:none}}

.sidebar-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:20px;height:36px
}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}
.logo img{height:28px;width:28px;object-fit:contain;display:block;border-radius:var(--radius-sm)}
.logo span{
  font-size:16px;font-weight:700;letter-spacing:-0.4px;
  color:var(--text-primary);
  white-space:nowrap
}

/* ── Nav section labels ──────────────────────────────────── */
.nav-section-label{
  font-size:10px;font-weight:700;text-transform:uppercase;
  letter-spacing:0.8px;color:var(--text-muted);
  padding:16px 12px 6px;
  white-space:nowrap;overflow:hidden
}

/* ── Nav items ───────────────────────────────────────────── */
.nav-item{
  display:flex;align-items:center;gap:10px;
  padding:8px 12px;
  color:var(--text-secondary);
  text-decoration:none;
  border-radius:var(--radius-md);
  margin-bottom:1px;
  font-size:13px;font-weight:500;
  cursor:pointer;
  white-space:nowrap;overflow:hidden;
  transition:background 0.1s,color 0.1s
}
.nav-item:hover{background:var(--bg-raised);color:var(--text-primary)}
.nav-item.active{background:var(--color-accent-subtle);color:var(--color-accent);font-weight:600}
.nav-item i{width:18px;text-align:center;font-size:14px;flex-shrink:0}

/* ── User profile (bottom of sidebar) ───────────────────── */
.user-profile{
  padding:10px 12px;
  border-top:1px solid var(--border-default);
  border-radius:var(--radius-md);
  display:flex;gap:10px;align-items:center;
  overflow:hidden;
  transition:background 0.15s;
  margin-top:4px
}
.user-profile:hover{background:var(--bg-raised)}
.user-avatar{
  width:32px;height:32px;border-radius:50%;
  background:var(--color-accent);
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-weight:700;font-size:13px;flex-shrink:0
}
.user-info{flex:1;overflow:hidden}
.user-name{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-plan{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px}

/* ── Main content area ───────────────────────────────────── */
.content{
  flex:1;overflow-y:auto;
  padding:32px 40px;
  background:var(--bg-base);
  transition:all 0.25s cubic-bezier(0.4,0,0.2,1)
}
.view-section{display:none;animation:fadeIn 0.25s}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.view-section.active{display:block}
.view-section.active.store-builder{display:flex;flex-direction:column;height:calc(100vh - 0px);overflow:hidden;padding:0}

/* ── Page header ─────────────────────────────────────────── */
.header{
  display:flex;justify-content:space-between;align-items:flex-start;
  margin-bottom:28px;gap:16px;flex-wrap:wrap
  /* height:36px REMOVED — was causing subscription overflow */
}
/* Used by products, orders, promotions, integrations components */
.view-header{
  display:flex;justify-content:space-between;align-items:flex-start;
  margin-bottom:28px;flex-wrap:wrap;gap:16px
}
.view-header h2{margin:0}
.view-header p,.text-secondary{font-size:13px;color:var(--text-secondary);margin-top:4px}

/* ── Stats grid ──────────────────────────────────────────── */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px}
.stat-card{
  background:var(--bg-surface);
  border:1px solid var(--border-default);
  border-radius:var(--radius-lg);
  padding:20px 24px;
  display:flex;align-items:flex-start;gap:16px;
  box-shadow:var(--shadow-sm);
  transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s
}
.stat-card:hover{
  border-color:var(--color-accent);
  transform:translateY(-2px);
  box-shadow:var(--shadow-md)
}
.stat-icon{
  width:40px;height:40px;border-radius:var(--radius-md);
  background:var(--color-accent-subtle);color:var(--color-accent);
  display:flex;align-items:center;justify-content:center;
  font-size:16px;flex-shrink:0
}
.stat-val{
  font-size:28px;font-weight:700;
  color:var(--text-primary);
  line-height:1.1;margin-bottom:4px
}
.stat-label{
  font-size:11px;font-weight:600;
  color:var(--text-muted);
  text-transform:uppercase;letter-spacing:0.5px
}

/* ── Cards ───────────────────────────────────────────────── */
.card{
  background:var(--bg-surface);
  border:1px solid var(--border-default);
  border-radius:var(--radius-lg);
  padding:24px;
  margin-bottom:20px;
  box-shadow:var(--shadow-sm)
}

/* ── Forms ───────────────────────────────────────────────── */
.form-group{margin-bottom:16px}
.form-group label{
  display:block;font-size:12px;font-weight:600;
  color:var(--text-secondary);margin-bottom:6px;
  text-transform:uppercase;letter-spacing:0.4px
}
.form-group input,
.form-group textarea,
.form-group select{
  width:100%;padding:9px 12px;
  border-radius:var(--radius-md);
  border:1px solid var(--border-default);
  background:var(--bg-raised);
  color:var(--text-primary);
  outline:none;
  transition:border-color 0.15s,box-shadow 0.15s;
  font-family:inherit;font-size:13px
}
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus{
  border-color:var(--color-accent);
  box-shadow:0 0 0 3px var(--color-accent-subtle);
  background:var(--bg-surface)
}
.form-group input:disabled{opacity:0.55;cursor:not-allowed}

/* ── Buttons ─────────────────────────────────────────────── */
.btn{
  padding:9px 18px;
  border-radius:var(--radius-md);
  border:none;
  background:var(--color-accent);
  color:var(--text-on-accent);
  font-weight:600;font-size:13px;
  cursor:pointer;
  transition:background 0.15s,transform 0.15s,box-shadow 0.15s;
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:inherit;white-space:nowrap;text-decoration:none
}
.btn:hover{background:var(--color-accent-hover);transform:translateY(-1px);box-shadow:var(--shadow-md)}
.btn:active{transform:translateY(0);box-shadow:none}

.btn-outline{
  padding:9px 18px;
  border-radius:var(--radius-md);
  border:1px solid var(--border-default);
  background:transparent;
  color:var(--text-secondary);
  font-weight:600;font-size:13px;
  cursor:pointer;
  transition:border-color 0.15s,color 0.15s,background 0.15s,transform 0.15s;
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:inherit;white-space:nowrap;text-decoration:none
}
.btn-outline:hover{
  border-color:var(--color-accent);
  color:var(--color-accent);
  background:var(--color-accent-subtle);
  transform:translateY(-1px)
}
.btn-outline.active{
  border-color:var(--color-accent);
  color:var(--color-accent);
  background:var(--color-accent-subtle);
  font-weight:600
}

/* ── Alert messages ──────────────────────────────────────── */
.msg{
  padding:10px 14px;border-radius:var(--radius-md);
  font-size:13px;margin-bottom:16px;display:none
}
.msg.success{
  background:var(--color-accent-subtle);
  color:var(--color-accent);
  border:1px solid var(--color-accent)
}
.msg.error{
  background:rgba(239,68,68,0.08);
  color:var(--color-danger);
  border:1px solid var(--color-danger)
}

/* ── Upload zone ─────────────────────────────────────────── */
.upload-zone{
  border:2px dashed var(--border-default);
  border-radius:var(--radius-xl);
  padding:40px;text-align:center;cursor:pointer;
  transition:border-color 0.2s,background 0.2s;
  background:var(--bg-surface);margin-bottom:32px
}
.upload-zone:hover{border-color:var(--color-accent);background:var(--color-accent-subtle)}

/* ── Auth — two-panel split ─────────────────────────────── */
.auth-split{
  display:flex;width:100%;min-height:100vh
}
.auth-brand-panel{
  flex:1;
  background:var(--color-accent);
  display:flex;flex-direction:column;justify-content:center;
  padding:60px;color:#fff;
  min-width:0
}
.auth-brand-panel h1{
  font-size:34px;font-weight:700;line-height:1.25;
  margin-bottom:20px;color:#fff
}
.auth-brand-panel p{
  font-size:16px;line-height:1.7;
  color:rgba(255,255,255,0.82);max-width:380px
}
.auth-form-panel{
  width:480px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  padding:48px 40px;
  background:var(--bg-surface)
}
@media(max-width:768px){
  .auth-split{flex-direction:column}
  .auth-brand-panel{display:none}
  .auth-form-panel{width:100%;min-height:100vh;padding:40px 24px}
}
/* Legacy fallback if auth-view is used outside auth-split */
.auth-container{display:flex;align-items:center;justify-content:center;height:100vh;background:var(--bg-base)}
.auth-box{width:100%;max-width:400px;padding:40px;background:var(--bg-surface);border-radius:var(--radius-xl);border:1px solid var(--border-default);box-shadow:var(--shadow-lg)}

/* ── Modals ──────────────────────────────────────────────── */
@keyframes spin{to{transform:rotate(360deg)}}
.modal{
  position:fixed;top:0;left:0;width:100%;height:100%;
  background:rgba(0,0,0,0.6);display:none;
  align-items:center;justify-content:center;
  z-index:200;backdrop-filter:blur(4px);
  overflow-y:auto;padding:20px
}
.modal-content{
  background:var(--bg-surface);padding:36px;
  border-radius:var(--radius-xl);
  width:100%;max-width:500px;
  border:1px solid var(--border-default);
  box-shadow:var(--shadow-lg);
  position:relative;animation:modalPop 0.25s;margin:auto
}
@keyframes modalPop{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
.close-btn{
  position:absolute;top:16px;right:16px;
  cursor:pointer;color:var(--text-muted);
  font-size:20px;line-height:1;
  transition:color 0.15s
}
.close-btn:hover{color:var(--text-primary)}

/* ── Book / Doc grid ─────────────────────────────────────── */
.book-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px}
.book-item{
  background:var(--bg-surface);border:1px solid var(--border-default);
  border-radius:var(--radius-lg);overflow:hidden;
  transition:border-color 0.2s,transform 0.2s,box-shadow 0.2s;
  box-shadow:var(--shadow-sm)
}
.book-item:hover{border-color:var(--color-accent);transform:translateY(-4px);box-shadow:var(--shadow-md)}
.book-cover{
  height:200px;background:var(--bg-raised);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;border-bottom:1px solid var(--border-default);padding:12px
}
.book-cover img{max-width:100%;max-height:100%;object-fit:contain;border-radius:var(--radius-sm)}
.book-content{padding:16px}
.book-title{font-weight:600;font-size:14px;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.book-actions{display:flex;gap:8px;margin-top:14px}
.book-actions button{
  flex:1;padding:7px;border-radius:var(--radius-sm);
  border:1px solid var(--border-default);
  background:var(--bg-raised);color:var(--text-secondary);
  cursor:pointer;font-size:12px;transition:all 0.15s
}
.book-actions button:hover{background:var(--color-accent);color:#fff;border-color:var(--color-accent)}

/* ── Book list view ──────────────────────────────────────── */
.book-list{display:flex;flex-direction:column;gap:10px}
.book-list-item{
  display:flex;align-items:center;gap:16px;padding:14px 16px;
  background:var(--bg-surface);border:1px solid var(--border-default);
  border-radius:var(--radius-lg);
  transition:border-color 0.15s,box-shadow 0.15s;
  box-shadow:var(--shadow-sm)
}
.book-list-item:hover{border-color:var(--color-accent);box-shadow:var(--shadow-md)}
.book-list-item .book-thumb{width:44px;height:58px;border-radius:var(--radius-sm);overflow:hidden;flex-shrink:0;background:var(--bg-raised);display:flex;align-items:center;justify-content:center}
.book-list-item .book-thumb img{width:100%;height:100%;object-fit:cover}
.book-list-item .book-meta{flex:1;min-width:0}
.book-list-item .book-title{margin-bottom:3px}

/* ── Books toolbar ───────────────────────────────────────── */
.books-toolbar{display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap}
.books-search{
  flex:1;min-width:180px;
  padding:9px 12px 9px 38px;
  border-radius:var(--radius-md);
  border:1px solid var(--border-default);
  background:var(--bg-raised);color:var(--text-primary);
  outline:none;font-family:inherit;font-size:13px;
  transition:border-color 0.15s,box-shadow 0.15s
}
.books-search:focus{border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-subtle);background:var(--bg-surface)}
.books-search-wrap{position:relative;flex:1;min-width:180px}
.books-search-wrap i{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:13px;pointer-events:none}
.view-toggle{display:flex;gap:3px;background:var(--bg-raised);padding:3px;border-radius:var(--radius-md)}
.view-toggle button{
  padding:7px 11px;border:none;background:none;
  color:var(--text-muted);cursor:pointer;
  border-radius:var(--radius-sm);transition:all 0.15s;font-size:13px
}
.view-toggle button.active{background:var(--bg-surface);color:var(--text-primary);box-shadow:var(--shadow-sm)}

/* ── Books tabs ──────────────────────────────────────────── */
.books-tabs{display:flex;gap:3px;background:var(--bg-raised);padding:3px;border-radius:var(--radius-md);margin-bottom:20px;width:fit-content}
.books-tab{
  padding:7px 16px;border-radius:var(--radius-sm);
  font-size:13px;font-weight:500;cursor:pointer;
  transition:all 0.15s;color:var(--text-secondary);border:none;background:none
}
.books-tab.active{background:var(--bg-surface);color:var(--text-primary);font-weight:600;box-shadow:var(--shadow-sm)}
/* Members filter tabs reuse .books-tabs / .books-tab */
.member-tab{
  padding:6px 14px;border-radius:var(--radius-sm);
  font-size:12px;font-weight:500;cursor:pointer;
  transition:all 0.15s;color:var(--text-secondary);border:none;background:none
}
.member-tab.active{background:var(--bg-surface);color:var(--text-primary);font-weight:600;box-shadow:var(--shadow-sm)}

/* ── Members table ───────────────────────────────────────── */
.members-table{width:100%;border-collapse:collapse}
.members-table th{
  text-align:left;font-size:11px;font-weight:700;
  color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;
  padding:10px 16px;border-bottom:1px solid var(--border-default)
}
.members-table td{padding:12px 16px;border-bottom:1px solid var(--border-default);font-size:13px;vertical-align:middle}
.members-table tr:hover td{background:var(--bg-raised)}
.member-status{
  display:inline-flex;align-items:center;gap:5px;
  font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px
}
.member-status.active{background:rgba(16,185,129,0.1);color:#10b981}
.member-status.inactive{background:rgba(239,68,68,0.1);color:#ef4444}
.access-key-text{
  font-family:monospace;font-size:12px;color:var(--text-muted);
  max-width:200px;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;display:inline-block;vertical-align:middle
}

/* ── Share modal ─────────────────────────────────────────── */
.share-list{max-height:200px;overflow-y:auto;margin:16px 0}
.share-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border-default)}
.share-item:last-child{border-bottom:none}

/* ── Toggle switch ───────────────────────────────────────── */
.billing-toggle{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:12px}
.toggle-label{font-size:14px;font-weight:500;color:var(--text-secondary);cursor:pointer;transition:color 0.2s}
.toggle-label.active{color:var(--text-primary);font-weight:600}
.toggle-switch{
  width:44px;height:24px;background:var(--bg-raised);
  border-radius:12px;position:relative;cursor:pointer;
  transition:background 0.2s;border:1px solid var(--border-default)
}
.toggle-switch.active{background:var(--color-accent);border-color:var(--color-accent)}
.toggle-knob{
  width:18px;height:18px;background:#fff;border-radius:50%;
  position:absolute;top:2px;left:2px;
  transition:transform 0.2s;box-shadow:var(--shadow-sm)
}
.toggle-switch.active .toggle-knob{transform:translateX(20px)}
.badge-save{
  font-size:10px;
  background:rgba(16,185,129,0.1);
  color:var(--color-success);
  padding:2px 6px;border-radius:var(--radius-sm);
  margin-left:4px;text-transform:uppercase;font-weight:700
}

/* ── Pricing display ─────────────────────────────────────── */
.price-display{margin-bottom:20px}
.price-display .currency{font-size:18px;font-weight:700;color:var(--text-primary);vertical-align:top;line-height:1.5}
.price-display .amount{font-size:36px;font-weight:700;color:var(--text-primary)}
.price-display .interval{font-size:13px;color:var(--text-muted);margin-left:2px}
.billed-text{font-size:12px;color:var(--text-muted);margin-top:2px}

/* ── Store builder ───────────────────────────────────────── */
.store-builder{position:relative}
.store-builder-header{
  display:flex;justify-content:space-between;align-items:center;
  padding:14px 24px;border-bottom:1px solid var(--border-default);
  background:var(--bg-surface);flex-shrink:0;
  position:sticky;top:0;z-index:50
}
.store-builder-header h2{margin:0;font-size:18px}
.store-builder-body{display:flex;flex:1;min-height:0;overflow:hidden}
.store-panel-settings{
  width:33.333%;min-width:300px;max-width:440px;flex-shrink:0;
  display:flex;flex-direction:column;
  border-left:1px solid var(--border-default);
  background:var(--bg-surface);overflow:hidden
}
.store-panel-inner{flex:1;overflow-y:auto;padding:20px 20px 80px;scrollbar-width:thin}
.store-panel-preview{flex:1;display:flex;flex-direction:column;background:var(--bg-raised);min-width:0}
.store-preview-bar{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 16px;background:var(--bg-surface);
  border-bottom:1px solid var(--border-default);flex-shrink:0
}
.store-preview-url{
  display:flex;align-items:center;
  background:var(--bg-raised);border:1px solid var(--border-default);
  border-radius:var(--radius-md);padding:5px 12px;
  font-size:12px;color:var(--text-muted);font-family:monospace;
  max-width:calc(100% - 120px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap
}
.store-preview-badge{font-size:11px;font-weight:600;color:var(--text-secondary);display:flex;align-items:center;white-space:nowrap}
.store-panel-inner h3{
  font-size:12px;font-weight:700;text-transform:uppercase;
  letter-spacing:0.6px;color:var(--text-muted);
  margin:20px 0 12px;
  border-bottom:1px solid var(--border-default);padding-bottom:8px
}
.store-panel-inner h3:first-child{margin-top:0}

/* ── Theme preset cards ──────────────────────────────────── */
.theme-preset-card{
  cursor:pointer;text-align:center;padding:8px;
  border-radius:var(--radius-md);border:2px solid transparent;transition:all 0.15s
}
.theme-preset-card:hover{border-color:var(--border-default);background:var(--bg-raised)}
.theme-preset-card.active{border-color:var(--color-accent);background:var(--color-accent-subtle)}
.accent-swatch{
  width:22px;height:22px;border-radius:50%;cursor:pointer;
  border:2px solid transparent;transition:all 0.15s;display:inline-block
}
.accent-swatch:hover{transform:scale(1.2);border-color:var(--text-muted)}

/* ── Cropper modal ───────────────────────────────────────── */
.crop-modal-content{
  background:var(--bg-surface);padding:0;
  border-radius:var(--radius-xl);width:90%;max-width:600px;
  border:1px solid var(--border-default);overflow:hidden;display:flex;flex-direction:column
}
.crop-area{height:400px;background:#000}
.crop-controls{padding:20px;display:flex;justify-content:flex-end;gap:12px;border-top:1px solid var(--border-default)}

/* ── Markdown editor ─────────────────────────────────────── */
.md-editor{border:1px solid var(--border-default);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-raised)}
.md-toolbar{display:flex;align-items:center;gap:2px;padding:6px 8px;background:var(--bg-surface);border-bottom:1px solid var(--border-default);flex-wrap:wrap}
.md-toolbar button{
  padding:4px 8px;border:1px solid transparent;border-radius:var(--radius-sm);
  background:none;color:var(--text-secondary);cursor:pointer;font-size:12px;
  font-family:inherit;transition:all 0.12s;white-space:nowrap
}
.md-toolbar button:hover{background:var(--bg-raised);color:var(--text-primary);border-color:var(--border-default)}
.md-sep{width:1px;height:18px;background:var(--border-default);margin:0 3px;flex-shrink:0}
.md-tab{font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.4px}
.md-tab.active{background:var(--bg-surface) !important;color:var(--color-accent) !important;border-color:var(--color-accent) !important}
.md-body{position:relative}
.md-textarea{
  width:100%;border:none !important;border-radius:0 !important;resize:vertical;
  background:var(--bg-raised);color:var(--text-primary);
  font-family:ui-monospace,'SF Mono',Consolas,monospace;font-size:13px;
  line-height:1.7;padding:14px;outline:none;box-shadow:none !important;min-height:180px
}
.md-preview{padding:16px 18px;min-height:180px;font-size:14px;line-height:1.7;color:var(--text-primary);background:var(--bg-surface)}
.md-preview h1,.md-preview h2,.md-preview h3,.md-preview h4{font-weight:700;margin:1.2em 0 0.5em;color:var(--text-primary)}
.md-preview h2{font-size:1.3em}.md-preview h3{font-size:1.1em}
.md-preview p{margin:0 0 0.9em}
.md-preview strong{font-weight:700}
.md-preview em{font-style:italic}
.md-preview a{color:var(--color-accent);text-decoration:underline}
.md-preview hr{border:none;border-top:1px solid var(--border-default);margin:1.2em 0}
.md-preview ul,.md-preview ol{padding-left:1.5em;margin:0 0 0.9em}
.md-preview li{margin-bottom:0.3em}
.md-preview blockquote{border-left:3px solid var(--color-accent);padding:4px 12px;color:var(--text-muted);font-style:italic;margin:0.8em 0}
.md-preview code{background:var(--bg-raised);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.9em}

/* ── Billing bar ─────────────────────────────────────────── */
#bulk-actions-bar{animation:slideIn 0.25s}
@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

/* ── Utilities ───────────────────────────────────────────── */
.hidden{display:none !important}
.md-only{display:flex}
@media(max-width:768px){.md-only{display:none}}

/* ── Mobile ──────────────────────────────────────────────── */
@media(max-width:768px){
  body{overflow-x:hidden}
  .layout{flex-direction:column;height:100vh;overflow:hidden;position:relative}
  .sidebar{
    position:fixed;top:0;left:0;bottom:0;width:280px;height:100%;
    transform:translateX(-100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);
    box-shadow:4px 0 20px rgba(0,0,0,0.12);z-index:2000;
    padding-top:64px
  }
  .sidebar.open{transform:translateX(0)}
  .content{padding:16px;padding-top:72px;height:100vh;overflow-y:auto}
  .header{margin-top:0;padding-top:0}
  .nav-item{padding:10px 14px;margin-bottom:3px;width:100%}

  /* Mobile top bar */
  .mobile-header{
    display:flex;align-items:center;justify-content:space-between;
    position:fixed;top:0;left:0;right:0;height:56px;
    padding:0 16px;background:var(--bg-surface);
    border-bottom:1px solid var(--border-default);z-index:1000
  }
  .mobile-menu-btn{font-size:18px;color:var(--text-primary);border:none;background:none;cursor:pointer}
  .mobile-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1500;
    opacity:0;pointer-events:none;transition:opacity 0.3s
  }
  .mobile-overlay.active{opacity:1;pointer-events:auto}

  .stats{grid-template-columns:1fr 1fr;gap:12px}
  .book-grid{grid-template-columns:1fr 1fr;gap:12px}
  .card{padding:16px;margin-bottom:14px}
  h2{font-size:20px}
  .modal-content{padding:24px;max-width:calc(100vw - 32px)}
  .crop-modal-content{max-width:calc(100vw - 32px)}

  /* Store builder stacks on mobile */
  .store-builder-body{flex-direction:column}
  .store-panel-settings{width:100%;max-width:100%;border-left:none;border-top:1px solid var(--border-default);max-height:50vh}
  .store-panel-preview{min-height:280px;border-bottom:1px solid var(--border-default)}
  .btn-text{display:none}
  .store-builder-header{padding:10px 14px}
  .store-builder-header h2{font-size:16px}
  .store-builder-header .btn,.store-builder-header .btn-outline{padding:7px !important;gap:0}
}
@media(max-width:480px){
  .stats{grid-template-columns:1fr}
  .book-grid{grid-template-columns:1fr}
}

/* ── Advanced Editors ────────────────────────────────────── */
.editor-toolbar {
  padding: 8px 12px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  gap: 8px;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}
.btn-tool {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s;
}
.btn-tool:hover {
  background: var(--bg-raised);
  color: var(--text-primary);
  border-color: var(--border-default);
}
.btn-tool i { font-size: 14px; }

.pdf-el {
  transition: box-shadow 0.2s;
}
.pdf-el:hover {
  box-shadow: 0 0 0 1px var(--color-accent);
}
.pdf-el:focus {
  outline: 2px solid var(--color-accent);
  box-shadow: none;
}
`;
