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
body{font-family:'Work Sans',sans-serif;background:var(--bg-primary);color:var(--text-primary);min-height:100vh;overflow:hidden;transition:background 0.3s,color 0.3s}
.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:260px;background:var(--bg-secondary);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:24px;flex-shrink:0;transition:transform .3s;z-index:100}
.logo{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;letter-spacing:2px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none;text-transform:uppercase;margin-bottom:40px;padding:0 12px;display:inline-block}
.nav-item{display:flex;align-items:center;gap:12px;padding:12px 16px;color:var(--text-secondary);text-decoration:none;border-radius:12px;margin-bottom:4px;transition:all .3s;font-weight:600;font-size:14px;cursor:pointer}
.nav-item:hover,.nav-item.active{background:var(--bg-elevated);color:var(--accent-cyan)}
.nav-item i{width:20px;text-align:center}
.user-profile{margin-top:auto;padding-top:20px;border-top:1px solid var(--border);display:flex;gap:12px;align-items:center}
.user-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px}
.user-info{flex:1;overflow:hidden}
.user-name{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-plan{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px}
.content{flex:1;overflow-y:auto;padding:40px;position:relative;background:var(--bg-primary)}
.view-section{display:none;animation:fadeIn 0.4s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.view-section.active{display:block}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}
h2{font-family:'Rajdhani',sans-serif;font-size:32px;font-weight:700;letter-spacing:-0.5px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-bottom:40px}
.stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:32px;position:relative;overflow:hidden;transition:all .3s}
.stat-card:hover{border-color:var(--accent-cyan);transform:translateY(-4px);box-shadow:0 10px 40px var(--shadow)}
.stat-val{font-family:'Rajdhani',sans-serif;font-size:42px;font-weight:700;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.stat-label{font-size:14px;color:var(--text-secondary);font-weight:600;letter-spacing:0.5px}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:32px;margin-bottom:28px}
.form-group{margin-bottom:24px}
.form-group label{display:block;font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px}
.form-group input,.form-group textarea,.form-group select{width:100%;padding:14px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);outline:none;transition:all .3s;font-family:'Work Sans',sans-serif}
.form-group input:focus{border-color:var(--accent-cyan);box-shadow:0 0 0 3px var(--glow-cyan)}
.btn{padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:#fff;font-weight:700;cursor:pointer;transition:all .3s;text-transform:uppercase;font-size:13px;letter-spacing:1px}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--glow-magenta)}
.btn-outline{background:transparent;border:1px solid var(--border);color:var(--text-secondary);box-shadow:none}
.btn-outline:hover{border-color:var(--text-primary);color:var(--text-primary);background:var(--bg-elevated)}
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
.msg{padding:12px 16px;border-radius:10px;font-size:13px;margin-bottom:20px;display:none}
.msg.success{background:rgba(0,212,255,0.1);color:var(--accent-cyan);border:1px solid var(--accent-cyan)}
.msg.error{background:rgba(255,0,110,0.1);color:var(--accent-magenta);border:1px solid var(--accent-magenta)}
.modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:none;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(5px)}
.modal-content{background:var(--bg-card);padding:40px;border-radius:24px;width:100%;max-width:500px;border:1px solid var(--border);position:relative;animation:modalPop 0.3s}
@keyframes modalPop{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}
.close-btn{position:absolute;top:20px;right:20px;cursor:pointer;color:var(--text-muted);transition:color .3s}
.close-btn:hover{color:#fff}
@media(max-width:768px){.layout{flex-direction:column;height:auto;overflow:visible}.sidebar{width:100%;height:auto;border-right:none;border-bottom:1px solid var(--border);padding:16px}.content{padding:20px}.nav-item{display:inline-flex;padding:8px 12px;font-size:13px;margin-right:8px;margin-bottom:0}}
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
`;
