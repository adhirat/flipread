export const sidebar = `
  <div class="mobile-header md:hidden" style="display:none">
    <button class="mobile-menu-btn" onclick="toggleSidebar()">
      <i class="fas fa-bars"></i>
    </button>
    <a href="/" class="logo" style="margin:0">
      <img src="/logo.png" alt="FlipRead" style="height:24px;width:auto">
      <span style="font-size:18px">FlipRead</span>
    </a>
    <button class="theme-toggle-btn" onclick="toggleDashTheme()" title="Toggle theme" style="background:none;border:none;font-size:18px;color:var(--text-secondary);cursor:pointer;padding:5px">
      <i class="fas fa-moon" id="dash-theme-icon"></i>
    </button>
  </div>
  
  <div class="mobile-overlay md:hidden" onclick="toggleSidebar()"></div>

  <aside class="sidebar" id="main-sidebar">
    <button class="collapse-btn md-only" onclick="toggleCollapse()" title="Toggle Sidebar">
      <i class="fas fa-chevron-left"></i>
    </button>
    <div class="sidebar-header">
       <a href="/" class="logo" style="margin:0">
         <img src="/logo.png" alt="FlipRead">
         <span>FlipRead</span>
       </a>
    </div>
    
    <nav>
      <div onclick="switchView('dashboard');closeSidebar()" class="nav-item active" id="nav-dashboard" title="Dashboard">
        <i class="fas fa-home"></i> <span>Dashboard</span>
      </div>
      <div onclick="switchView('books');closeSidebar()" class="nav-item" id="nav-books" title="Books">
        <i class="fas fa-book"></i> <span>Books</span>
      </div>
      <div onclick="switchView('store');closeSidebar()" class="nav-item" id="nav-store" title="Store">
        <i class="fas fa-store"></i> <span>Store</span>
      </div>
      <div onclick="switchView('subscription');closeSidebar()" class="nav-item" id="nav-subscription" title="Subscription">
        <i class="fas fa-credit-card"></i> <span>Subscription</span>
      </div>
      <div onclick="switchView('settings');closeSidebar()" class="nav-item" id="nav-settings" title="Settings">
        <i class="fas fa-cog"></i> <span>Settings</span>
      </div>
      <div onclick="toggleDashTheme()" class="nav-item" title="Toggle Theme" style="margin-top:16px;border-top:1px solid var(--border);padding-top:16px">
        <i class="fas fa-moon" id="dash-theme-icon-sidebar"></i> <span>Theme</span>
      </div>
    </nav>
    <div class="user-profile">
      <div class="user-avatar" id="user-avatar-initials">U</div>
      <div class="user-info">
        <div class="user-name" id="user-name-disp">User</div>
        <div class="user-plan" id="user-plan-disp">Free</div>
      </div>
      <i class="fas fa-sign-out-alt" onclick="logout()" style="cursor:pointer;color:var(--text-muted);flex-shrink:0" title="Logout"></i>
    </div>
  </aside>
  <style>
    @media(max-width:768px){ 
      .mobile-header{display:flex!important} 
      .collapse-btn{display:none}
    }
  </style>
`;
