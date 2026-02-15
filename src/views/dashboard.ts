export function dashboardPage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Dashboard — FlipRead</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
:root[data-theme="dark"]{
  --bg-primary:#050510;
  --bg-secondary:#0d0d1a;
  --bg-card:#1a1a2e;
  --bg-elevated:#252540;
  --text-primary:#f0f4ff;
  --text-secondary:#a0aec0;
  --text-muted:#64748b;
  --accent-cyan:#00d4ff;
  --accent-magenta:#ff006e;
  --accent-purple:#8b5cf6;
  --accent-blue:#3b82f6;
  --border:rgba(255,255,255,0.08);
  --glow-cyan:rgba(0,212,255,0.4);
  --glow-magenta:rgba(255,0,110,0.3);
  --shadow:rgba(0,0,0,0.5)
}
:root[data-theme="light"]{
  --bg-primary:#ffffff;
  --bg-secondary:#f8fafc;
  --bg-card:#ffffff;
  --bg-elevated:#f1f5f9;
  --text-primary:#0f172a;
  --text-secondary:#334155;
  --text-muted:#64748b;
  --accent-cyan:#0891b2;
  --accent-magenta:#db2777;
  --accent-purple:#7c3aed;
  --accent-blue:#2563eb;
  --border:rgba(0,0,0,0.1);
  --glow-cyan:rgba(8,145,178,0.2);
  --glow-magenta:rgba(219,39,119,0.2);
  --shadow:rgba(0,0,0,0.1)
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
.book-cover{height:180px;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;overflow:hidden;border-bottom:1px solid var(--border)}
.book-cover img{width:100%;height:100%;object-fit:cover}
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
</style>
</head>
<body>

<!-- Auth View -->
<div id="auth-view" class="auth-container">
  <div class="auth-box">
    <div style="text-align:center;margin-bottom:32px">
      <div class="logo">FlipRead</div>
      <h2 style="font-size:24px" id="auth-title">Welcome Back</h2>
    </div>
    <div id="auth-msg" class="msg"></div>
    <div class="form-group"><input id="auth-name" placeholder="Full Name" class="hidden"></div>
    <div class="form-group"><input id="auth-email" placeholder="Email Address" type="email"></div>
    <div class="form-group"><input id="auth-pass" placeholder="Password" type="password"></div>
    <button onclick="submitAuth()" class="btn" style="width:100%" id="auth-btn">Sign In</button>
    <div style="text-align:center;margin-top:20px;font-size:14px;color:var(--text-secondary)">
      <span id="auth-toggle-text">New here?</span> <a onclick="toggleAuthMode()" style="color:var(--accent-cyan);cursor:pointer;font-weight:600" id="auth-toggle-link">Create Account</a>
    </div>
  </div>
</div>

<!-- Main Dashboard Layout -->
<div id="dash-view" class="layout" style="display:none">
  <aside class="sidebar">
    <a href="/" class="logo">FlipRead</a>
    <nav>
      <div onclick="switchView('dashboard')" class="nav-item active" id="nav-dashboard"><i class="fas fa-home"></i> Dashboard</div>
      <div onclick="switchView('books')" class="nav-item" id="nav-books"><i class="fas fa-book"></i> Books</div>
      <div onclick="switchView('store')" class="nav-item" id="nav-store"><i class="fas fa-store"></i> Store</div>
      <div onclick="switchView('subscription')" class="nav-item" id="nav-subscription"><i class="fas fa-credit-card"></i> Subscription</div>
      <div onclick="switchView('settings')" class="nav-item" id="nav-settings"><i class="fas fa-cog"></i> Settings</div>
    </nav>
    <div class="user-profile">
      <div class="user-avatar" id="user-avatar-initials">U</div>
      <div class="user-info">
        <div class="user-name" id="user-name-disp">User</div>
        <div class="user-plan" id="user-plan-disp">Free</div>
      </div>
      <i class="fas fa-sign-out-alt" onclick="logout()" style="cursor:pointer;color:var(--text-muted)" title="Logout"></i>
    </div>
  </aside>
  
  <main class="content">
    
    <!-- Dashboard Overview -->
    <div id="view-dashboard" class="view-section active">
      <div class="header">
        <h2>Dashboard Overview</h2>
        <a href="#" id="store-link-top" target="_blank" class="btn btn-outline"><i class="fas fa-external-link-alt"></i> View My Store</a>
      </div>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-val" id="d-books">0</div>
          <div class="stat-label">Published Books</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" id="d-views">0</div>
          <div class="stat-label">Total Views</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" id="d-plan">Free</div>
          <div class="stat-label">Current Plan</div>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;font-family:'Rajdhani',sans-serif">Quick Actions</h3>
        <div style="display:flex;gap:16px">
          <button onclick="switchView('books')" class="btn">Manage Books</button>
          <button onclick="switchView('store')" class="btn btn-outline">Customize Store</button>
        </div>
      </div>
    </div>

    <!-- Books View -->
    <div id="view-books" class="view-section">
      <div class="header">
        <h2>My Books</h2>
        <div style="font-size:14px;color:var(--text-muted)" id="limit-text"></div>
      </div>
      
      <div class="upload-zone" onclick="document.getElementById('file-input').click()">
        <i class="fas fa-cloud-upload-alt" style="font-size:48px;color:var(--accent-cyan);margin-bottom:16px"></i>
        <h3 style="margin-bottom:8px">Upload New Book</h3>
        <p style="color:var(--text-secondary);font-size:14px">Drag & drop or click to upload PDF/EPUB</p>
        <div id="upload-msg" class="msg" style="margin-top:16px;display:inline-block"></div>
      </div>
      <input type="file" id="file-input" accept=".pdf,.epub" style="display:none" onchange="uploadBook(event)">
      
      <div class="book-grid" id="book-grid"></div>
    </div>

    <!-- Store View -->
    <div id="view-store" class="view-section">
      <div class="header"><h2>Store Customization</h2></div>
      <div class="card" style="max-width:700px">
        <h3 style="margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px">General Information</h3>
        <div class="form-group">
          <label>Store Name</label>
          <input type="text" id="st-name" placeholder="My Book Store">
        </div>
        <div class="form-group">
          <label>Store Description</label>
          <textarea id="st-desc" rows="2" placeholder="Welcome to my collection..."></textarea>
        </div>
        <div class="form-group">
          <label>Store Logo</label>
          <div style="display:flex;gap:16px;align-items:center">
            <div id="st-logo-preview" style="width:64px;height:64px;border-radius:12px;background:var(--bg-elevated);overflow:hidden;flex-shrink:0"></div>
            <button class="btn-outline" onclick="document.getElementById('logo-input').click()" style="padding:8px 16px">Upload Logo</button>
            <span style="font-size:12px;color:var(--text-muted)">Recommended: Square aspect ratio</span>
          </div>
          <input type="file" id="logo-input" accept="image/*" style="display:none" onchange="uploadLogo(event)">
        </div>
        <div class="form-group">
          <label>Custom Domain (Optional)</label>
          <input type="text" id="st-domain" placeholder="e.g. books.mydomain.com">
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px">
            <b>Setup:</b> Point your domain's <b>CNAME</b> record to <code>flipread.flipread.workers.dev</code>. <br>
            Then add the domain here and save.
          </p>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Hero Section</h3>
        <div class="form-group">
          <label>Hero Title</label>
          <input type="text" id="st-h-title" placeholder="Defaults to Store Name">
        </div>
        <div class="form-group">
          <label>Hero Caption</label>
          <input type="text" id="st-h-caption" placeholder="Defaults to Store Description">
        </div>
        <div class="form-group">
          <label>Hero Image URL</label>
          <input type="text" id="st-h-img" placeholder="https://example.com/banner.jpg">
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px">Provide a URL for the large banner background. Unsplash URLs work great.</p>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Legal & Contact</h3>
        <div class="form-group">
          <label>Privacy Policy Content</label>
          <textarea id="st-privacy" rows="4" placeholder="Enter full Privacy Policy text..."></textarea>
        </div>
        <div class="form-group">
          <label>Terms & Conditions Content</label>
          <textarea id="st-terms" rows="4" placeholder="Enter full Terms text..."></textarea>
        </div>
        <div class="form-group">
          <label>Contact Information</label>
          <textarea id="st-contact" rows="3" placeholder="Enter contact details (Address, Email, Phone)..."></textarea>
        </div>

        <div id="store-msg" class="msg"></div>
        <button onclick="saveStoreSettings()" class="btn">Save Changes</button>
      </div>
    </div>

    <!-- Subscription View -->
    <div id="view-subscription" class="view-section">
      <div class="header">
        <h2>Subscription</h2>
        <div class="billing-toggle">
          <span id="bill-monthly" class="toggle-label" onclick="setBilling('monthly')">Monthly</span>
          <div class="toggle-switch active" onclick="toggleBilling()">
            <div class="toggle-knob"></div>
          </div>
          <span id="bill-yearly" class="toggle-label active" onclick="setBilling('yearly')">Yearly <span class="badge-save">Save 20%</span></span>
        </div>
      </div>
      
      <div style="display:flex;gap:24px;overflow-x:auto;padding-bottom:20px">
        <!-- Plans -->
        <div class="card" style="flex:1;min-width:280px">
          <h3 style="margin-bottom:8px">Basic</h3>
          <div class="price-display">
            <span class="currency">$</span><span class="amount" id="price-basic">1.67</span><span class="interval">/mo</span>
            <div class="billed-text" id="billed-basic">Billed $20 yearly</div>
          </div>
          <ul style="list-style:none;margin-bottom:24px;font-size:14px;color:var(--text-secondary);line-height:1.6">
            <li><i class="fas fa-check" style="color:var(--accent-cyan);margin-right:8px"></i> 2 Books Limit</li>
            <li><i class="fas fa-check" style="color:var(--accent-cyan);margin-right:8px"></i> 10 MB Uploads</li>
            <li><i class="fas fa-check" style="color:var(--accent-cyan);margin-right:8px"></i> 2,000 Views</li>
          </ul>
          <button onclick="checkout('basic')" class="btn btn-outline" style="width:100%">Choose Basic</button>
        </div>
        
        <div class="card" style="flex:1;min-width:280px;border-color:var(--accent-purple);box-shadow:0 0 20px rgba(139,92,246,0.1)">
          <div style="color:var(--accent-purple);font-size:12px;font-weight:700;text-transform:uppercase;margin-bottom:4px">Recommended</div>
          <h3 style="margin-bottom:8px">Pro</h3>
          <div class="price-display">
            <span class="currency">$</span><span class="amount" id="price-pro">7.50</span><span class="interval">/mo</span>
            <div class="billed-text" id="billed-pro">Billed $90 yearly</div>
          </div>
          <ul style="list-style:none;margin-bottom:24px;font-size:14px;color:var(--text-secondary);line-height:1.6">
             <li><i class="fas fa-check" style="color:var(--accent-purple);margin-right:8px"></i> 50 Books Limit</li>
            <li><i class="fas fa-check" style="color:var(--accent-purple);margin-right:8px"></i> 50 MB Uploads</li>
            <li><i class="fas fa-check" style="color:var(--accent-purple);margin-right:8px"></i> Password Protection</li>
          </ul>
          <button onclick="checkout('pro')" class="btn" style="width:100%;background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue))">Choose Pro</button>
        </div>

        <div class="card" style="flex:1;min-width:280px">
          <h3 style="margin-bottom:8px">Business</h3>
          <div class="price-display">
            <span class="currency">$</span><span class="amount" id="price-business">24.17</span><span class="interval">/mo</span>
            <div class="billed-text" id="billed-business">Billed $290 yearly</div>
          </div>
          <ul style="list-style:none;margin-bottom:24px;font-size:14px;color:var(--text-secondary);line-height:1.6">
             <li><i class="fas fa-check" style="color:var(--accent-magenta);margin-right:8px"></i> Unlimited Books</li>
            <li><i class="fas fa-check" style="color:var(--accent-magenta);margin-right:8px"></i> 200 MB Uploads</li>
            <li><i class="fas fa-check" style="color:var(--accent-magenta);margin-right:8px"></i> API Access</li>
          </ul>
          <button onclick="checkout('business')" class="btn btn-outline" style="width:100%">Choose Business</button>
        </div>
      </div>
    </div>

    <!-- Settings View -->
    <div id="view-settings" class="view-section">
      <div class="header"><h2>Settings</h2></div>
      <div class="card" style="max-width:500px">
        <h3 style="margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px">Preferences</h3>
        <div class="form-group">
          <label>Theme</label>
          <div style="display:flex;gap:12px">
            <button onclick="setTheme('dark')" class="btn-outline" style="flex:1;padding:12px">Dark</button>
            <button onclick="setTheme('light')" class="btn-outline" style="flex:1;padding:12px">Light</button>
          </div>
        </div>
        <div class="form-group">
          <label>Account Email</label>
          <input type="text" id="set-email" disabled style="opacity:0.6;cursor:not-allowed">
        </div>
        <button onclick="logout()" class="btn" style="background:var(--bg-elevated);color:var(--text-secondary);width:100%;margin-bottom:32px">Sign Out</button>

        <h3 style="margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px;color:var(--accent-magenta)">Danger Zone</h3>
        <p style="font-size:14px;color:var(--text-secondary);margin-bottom:16px">
          Deleting your account is irreversible. All your data, books, and store settings will be permanently removed.
        </p>
        <button onclick="confirmDeleteAccount()" class="btn-outline" style="width:100%;border-color:var(--accent-magenta);color:var(--accent-magenta)">Delete Account</button>
      </div>
    </div>
  </div>

  <!-- Delete Account Modal -->
  <div id="delete-modal" class="modal">
    <div class="modal-content" style="max-width:400px;text-align:center">
      <div style="width:60px;height:60px;border-radius:50%;background:rgba(255,0,110,0.1);color:var(--accent-magenta);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 20px">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3 style="margin-bottom:12px">Delete Account?</h3>
      <p style="color:var(--text-secondary);margin-bottom:24px;font-size:14px">
        This action cannot be undone. All your <b>books, files, store settings, and personal data</b> will be permanently deleted immediately.
      </p>
      <div class="form-group" style="text-align:left">
        <label>Type "DELETE" to confirm</label>
        <input type="text" id="delete-confirm-input" placeholder="DELETE">
      </div>
      <div style="display:flex;gap:12px">
        <button onclick="hideModal('delete-modal')" class="btn-outline" style="flex:1">Cancel</button>
        <button onclick="executeDeleteAccount()" class="btn" style="flex:1;background:var(--accent-magenta)">Delete Everything</button>
      </div>
    </div>
  </div>

  </main>
</div>

<!-- Edit Book Modal -->
<div id="edit-modal" class="modal">
  <div class="modal-content">
    <div class="close-btn" onclick="hideModal('edit-modal')">&times;</div>
    <h3 style="margin-bottom:24px">Edit Book</h3>
    <input type="hidden" id="edit-id">
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="edit-title">
    </div>
    <div class="form-group">
      <label>Visibility</label>
      <select id="edit-public">
        <option value="1">Public</option>
        <option value="0">Private</option>
      </select>
    </div>
    <div class="form-group">
      <label>Password (Pro+ only)</label>
      <input type="password" id="edit-pass" placeholder="Optional password">
    </div>
    <div class="form-group">
      <label>Custom Domain (Optional)</label>
      <input type="text" id="edit-domain" placeholder="e.g. book.mybrand.com">
      <p style="font-size:12px;color:var(--text-muted);margin-top:4px">
        <b>Setup:</b> Point your domain's <b>CNAME</b> record to <code>flipread.flipread.workers.dev</code>.
      </p>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:12px">
      <button onclick="hideModal('edit-modal')" class="btn-outline" style="border:none">Cancel</button>
      <button onclick="saveBook()" class="btn">Save Changes</button>
    </div>
  </div>
</div>

<script>
const API = '';
let currentUser = null;
let currentBooks = [];
let isRegister = false;

// Navigation
function switchView(view) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('nav-' + view).classList.add('active');
}

// Auth Logic
async function checkAuth() {
  try {
    const res = await fetch(API + '/api/auth/me', { credentials: 'include' });
    const data = await res.json();
    if (data.user) { currentUser = data.user; showDashboard(); }
    else { showAuth(); }
  } catch { showAuth(); }
}
function showAuth() {
  document.getElementById('auth-view').style.display = 'flex';
  document.getElementById('dash-view').style.display = 'none';
}
function showDashboard() {
  document.getElementById('auth-view').style.display = 'none';
  document.getElementById('dash-view').style.display = 'flex';
  updateUI();
  loadBooks();
  setBilling('yearly');
}
function updateUI() {
  if(!currentUser) return;
  document.getElementById('user-name-disp').textContent = currentUser.name || 'User';
  document.getElementById('user-avatar-initials').textContent = (currentUser.name || currentUser.email).charAt(0).toUpperCase();
  document.getElementById('user-plan-disp').textContent = currentUser.plan;
  
  // Dashboard stats
  document.getElementById('d-plan').textContent = currentUser.plan.toUpperCase();
  // Store inputs
  document.getElementById('st-name').value = currentUser.store_name || '';
  const s = JSON.parse(currentUser.store_settings || '{}');
  
  // General
  document.getElementById('st-desc').value = s.description || '';
  document.getElementById('st-domain').value = s.custom_domain || '';

  // Hero
  document.getElementById('st-h-title').value = s.hero_title || '';
  document.getElementById('st-h-caption').value = s.hero_caption || '';
  document.getElementById('st-h-img').value = s.hero_image_url || '';

  // Legal
  document.getElementById('st-privacy').value = s.privacy_policy_content || '';
  document.getElementById('st-terms').value = s.terms_content || '';
  document.getElementById('st-contact').value = s.contact_info_content || '';

  if(currentUser.store_logo_url) {
    document.getElementById('st-logo-preview').innerHTML = '<img src="'+esc(currentUser.store_logo_url)+'" style="width:100%;height:100%;object-fit:cover">';
  }
  document.getElementById('set-email').value = currentUser.email;
  
  const username = (currentUser.name || 'user').toLowerCase().replace(/\\s+/g, '-');
  document.getElementById('store-link-top').href = '/store/' + encodeURIComponent(username);
  
  const limits = { free: '5 MB', basic: '10 MB', pro: '50 MB', business: '200 MB' };
  document.getElementById('limit-text').textContent = 'Upload Limit: ' + (limits[currentUser.plan] || '5 MB');
}

function toggleAuthMode() {
  isRegister = !isRegister;
  document.getElementById('auth-title').textContent = isRegister ? 'Create Account' : 'Welcome Back';
  document.getElementById('auth-btn').textContent = isRegister ? 'Create Account' : 'Sign In';
  document.getElementById('auth-name').classList.toggle('hidden', !isRegister);
  document.getElementById('auth-toggle-text').textContent = isRegister ? 'Already have an account?' : 'New here?';
  document.getElementById('auth-toggle-link').textContent = isRegister ? 'Sign In' : 'Create Account';
}

async function submitAuth() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-pass').value;
  const name = document.getElementById('auth-name').value;
  const msgEl = document.getElementById('auth-msg');
  const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
  const body = isRegister ? { email, password, name } : { email, password };
  
  try {
    const res = await fetch(API + endpoint, { 
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.user) { currentUser = data.user; showDashboard(); }
    else { msgEl.textContent = data.error || 'Failed'; msgEl.className = 'msg error'; msgEl.style.display = 'block'; }
  } catch { msgEl.textContent = 'Network error'; msgEl.className = 'msg error'; msgEl.style.display = 'block'; }
}

async function logout() {
  await fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' });
  currentUser = null; showAuth();
}

// Book Logic
async function loadBooks() {
  try {
    const res = await fetch(API + '/api/books', { credentials: 'include' });
    const data = await res.json();
    currentBooks = data.books || [];
    
    // Update stats
    document.getElementById('d-books').textContent = currentBooks.length;
    const views = currentBooks.reduce((s, b) => s + b.view_count, 0);
    document.getElementById('d-views').textContent = views;

    renderBooks();
  } catch(e) { console.error(e); }
}

function renderBooks() {
  const grid = document.getElementById('book-grid');
  if (currentBooks.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px">No books published yet.</div>';
    return;
  }
  grid.innerHTML = currentBooks.map(b => {
    const url = location.origin + '/read/' + b.slug;
    return \`<div class="book-item">
      <div class="book-cover">
        \${b.cover_url ? \`<img src="\${esc(b.cover_url)}">\` : '<i class="fas fa-book" style="font-size:40px;opacity:0.2"></i>'}
      </div>
      <div class="book-content">
        <div class="book-title" title="\${esc(b.title)}">\${esc(b.title)}</div>
        <div style="font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between">
          <span>\${formatSize(b.file_size_bytes)}</span>
          <span><i class="fas fa-eye"></i> \${b.view_count}</span>
        </div>
        <div class="book-actions">
          <button onclick="editBook('\${b.id}')"><i class="fas fa-cog"></i></button>
          <button onclick="window.open('\${esc(url)}','_blank')"><i class="fas fa-external-link-alt"></i></button>
          <button onclick="copyText('\${esc(url)}',this)"><i class="fas fa-link"></i></button>
          <button onclick="deleteBook('\${b.id}')" style="color:var(--accent-magenta)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>\`;
  }).join('');
}

async function uploadBook(e) {
  const file = e.target.files[0];
  if (!file) return;
  const msgEl = document.getElementById('upload-msg');
  msgEl.textContent = 'Uploading...'; msgEl.className = 'msg success'; msgEl.style.display = 'inline-block';
  
  const fd = new FormData();
  fd.append('file', file);
  fd.append('title', file.name.replace(/\\.(pdf|epub)$/i, ''));

  try {
    const res = await fetch(API + '/api/books/upload', {
      method: 'POST', credentials: 'include', body: fd
    });
    const data = await res.json();
    if (data.book) {
      msgEl.textContent = 'Uploaded!'; 
      setTimeout(() => msgEl.style.display = 'none', 3000);
      loadBooks();
    } else {
      msgEl.textContent = data.error || 'Failed'; msgEl.className = 'msg error';
    }
  } catch { msgEl.textContent = 'Error'; msgEl.className = 'msg error'; }
  e.target.value = '';
}

async function deleteBook(id) {
  if(!confirm('Delete this book?')) return;
  await fetch(API + '/api/books/' + id, { method: 'DELETE', credentials: 'include' });
  loadBooks();
}

function editBook(id) {
  const b = currentBooks.find(x => x.id === id);
  if (!b) return;
  document.getElementById('edit-id').value = b.id;
  document.getElementById('edit-title').value = b.title;
  document.getElementById('edit-public').value = b.is_public ? "1" : "0";
  document.getElementById('edit-pass').value = b.password || '';
  document.getElementById('edit-domain').value = b.custom_domain || '';
  showModal('edit-modal');
}

async function saveBook() {
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const is_public = document.getElementById('edit-public').value === "1";
  const password = document.getElementById('edit-pass').value || null;
  const custom_domain = document.getElementById('edit-domain').value || null;
  
  await fetch(API + '/api/books/' + id, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, is_public, password, custom_domain })
  });
  hideModal('edit-modal');
  loadBooks();
}

// Store & Settings
async function saveStoreSettings() {
  const store_name = document.getElementById('st-name').value;
  
  const store_settings = {
    description: document.getElementById('st-desc').value,
    custom_domain: document.getElementById('st-domain').value,
    hero_title: document.getElementById('st-h-title').value,
    hero_caption: document.getElementById('st-h-caption').value,
    hero_image_url: document.getElementById('st-h-img').value,
    privacy_policy_content: document.getElementById('st-privacy').value,
    terms_content: document.getElementById('st-terms').value,
    contact_info_content: document.getElementById('st-contact').value
  };

  const res = await fetch(API + '/api/user/store', {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_name, store_settings })
  });
  if(res.ok) {
    const m = document.getElementById('store-msg');
    m.textContent = 'Saved!'; m.className = 'msg success'; m.style.display = 'block';
    setTimeout(() => m.style.display = 'none', 2000);
    currentUser.store_name = store_name;
    currentUser.store_settings = JSON.stringify(store_settings);
  }
}

async function uploadLogo(e) {
  const file = e.target.files[0];
  if(!file) return;
  const fd = new FormData();
  fd.append('logo', file);
  const res = await fetch(API + '/api/user/store/logo', {
    method: 'POST', credentials: 'include', body: fd
  });
  const data = await res.json();
  if(data.logo_url) {
    document.getElementById('st-logo-preview').innerHTML = '<img src="'+esc(data.logo_url)+'" style="width:100%;height:100%;object-fit:cover">';
    currentUser.store_logo_url = data.logo_url;
  }
}

async function checkout(plan) {
  try {
    const res = await fetch(API + '/api/billing/checkout', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, interval: billingInterval })
    });
    const data = await res.json();
    if(data.url) window.location.href = data.url;
    else alert('Error: ' + (data.error || 'Unknown'));
  } catch { alert('Network error'); }
}

// Utils
function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }
function formatSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function copyText(t, btn) {
  navigator.clipboard.writeText(t);
  const old = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i>';
  setTimeout(() => btn.innerHTML = old, 1500);
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('flipread-theme', t);
}
// Init
if(localStorage.getItem('flipread-theme')) setTheme(localStorage.getItem('flipread-theme'));
const params = new URLSearchParams(window.location.search);
if (params.get('mode') === 'register') {
  isRegister = true;
  document.getElementById('auth-title').textContent = 'Create Account';
  document.getElementById('auth-btn').textContent = 'Create Account';
  document.getElementById('auth-name').classList.remove('hidden');
  document.getElementById('auth-toggle-text').textContent = 'Already have an account?';
  document.getElementById('auth-toggle-link').textContent = 'Sign In';
}
checkAuth();

// Subscription Logic
let billingInterval = 'yearly';

function setBilling(interval) {
  billingInterval = interval;
  const isYearly = interval === 'yearly';
  
  document.getElementById('bill-monthly').classList.toggle('active', !isYearly);
  document.getElementById('bill-yearly').classList.toggle('active', isYearly);
  const sw = document.querySelector('.toggle-switch');
  if(sw) sw.classList.toggle('active', isYearly);

  if(isYearly) {
    updatePrice('basic', '1.67', '/mo', 'Billed $20 yearly');
    updatePrice('pro', '7.50', '/mo', 'Billed $90 yearly');
    updatePrice('business', '24.17', '/mo', 'Billed $290 yearly');
  } else {
    updatePrice('basic', '2.00', '/mo', 'Billed monthly');
    updatePrice('pro', '9.00', '/mo', 'Billed monthly');
    updatePrice('business', '29.00', '/mo', 'Billed monthly');
  }
}

function updatePrice(plan, amount, interval, text) {
  const el = document.getElementById('price-'+plan);
  if(el) el.textContent = amount;
  const be = document.getElementById('billed-'+plan);
  if(be) be.textContent = text;
}

function toggleBilling() {
  setBilling(billingInterval === 'yearly' ? 'monthly' : 'yearly');
}

// Initialize billing toggle on load
document.addEventListener('DOMContentLoaded', () => { setTimeout(() => setBilling('yearly'), 100) });


// Account Deletion
function confirmDeleteAccount() {
  document.getElementById('delete-confirm-input').value = '';
  showModal('delete-modal');
}

async function executeDeleteAccount() {
  const input = document.getElementById('delete-confirm-input').value;
  if(input !== 'DELETE') {
    alert('Please type "DELETE" to confirm.');
    return;
  }
  
  const btn = document.querySelector('#delete-modal .btn');
  const oldText = btn.textContent;
  btn.textContent = 'Deleting...';
  btn.disabled = true;

  try {
    const res = await fetch(API + '/api/user', {
      method: 'DELETE', credentials: 'include'
    });
    const data = await res.json();
    if(data.success) {
      window.location.href = '/'; 
    } else {
      alert('Delete failed: ' + (data.error || 'Unknown error'));
      btn.textContent = oldText;
      btn.disabled = false;
    }
  } catch(e) {
    console.error(e);
    alert('Network error. Please try again.');
    btn.textContent = oldText;
    btn.disabled = false;
  }
}

</script>
</body></html>`;
}
