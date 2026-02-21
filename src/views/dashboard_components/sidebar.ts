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
      <div onclick="switchView('composer');closeSidebar()" class="nav-item" id="nav-composer" title="Composer">
        <i class="fas fa-edit"></i> <span>Composer</span>
      </div>
      <div onclick="switchView('docs');closeSidebar()" class="nav-item" id="nav-docs" title="Docs">
        <i class="fas fa-file-alt"></i> <span>Docs</span>
      </div>
      <div onclick="switchView('utilities');closeSidebar()" class="nav-item" id="nav-utilities" title="Utilities">
        <i class="fas fa-tools"></i> <span>Utilities</span>
      </div>
      <div onclick="switchView('products');closeSidebar()" class="nav-item" id="nav-products" title="Products">
        <i class="fas fa-box"></i> <span>Products</span>
      </div>
      <div onclick="switchView('orders');closeSidebar()" class="nav-item" id="nav-orders" title="Orders">
        <i class="fas fa-shopping-cart"></i> <span>Orders</span>
      </div>
      <div onclick="switchView('categories');closeSidebar()" class="nav-item" id="nav-categories" title="Categories">
        <i class="fas fa-tags"></i> <span>Categories</span>
      </div>
      <div onclick="switchView('promotions');closeSidebar()" class="nav-item" id="nav-promotions" title="Promotions">
        <i class="fas fa-bullhorn"></i> <span>Promotions</span>
      </div>
      <div onclick="switchView('integrations');closeSidebar()" class="nav-item" id="nav-integrations" title="Integrations">
        <i class="fas fa-plug"></i> <span>Integrations</span>
      </div>
      <div onclick="switchView('store');closeSidebar()" class="nav-item" id="nav-store" title="Store">
        <i class="fas fa-store"></i> <span>Store</span>
      </div>
      <div onclick="switchView('members');closeSidebar()" class="nav-item" id="nav-members" title="Members">
        <i class="fas fa-users"></i> <span>Members</span>
      </div>
      <div onclick="switchView('inquiries');closeSidebar()" class="nav-item" id="nav-inquiries" title="Inquiries">
        <i class="fas fa-envelope"></i> <span>Inquiries</span>
      </div>
      <div onclick="switchView('subscription');closeSidebar()" class="nav-item" id="nav-subscription" title="Subscription">
        <i class="fas fa-credit-card"></i> <span>Subscription</span>
      </div>
    </nav>
    
    <div style="flex:1"></div>

    <div onclick="viewMyStore();" class="nav-item" title="View My Store" style="color:var(--accent-cyan)">
      <i class="fas fa-external-link-alt"></i> <span>View My Store</span>
    </div>

    <div onclick="switchView('knowledge');closeSidebar()" class="nav-item" id="nav-knowledge" title="Help & Support">
      <i class="fas fa-question-circle"></i> <span>Help & Support</span>
    </div>

    <div onclick="toggleDashTheme()" class="nav-item" title="Toggle Theme" style="margin-bottom:12px">
      <i class="fas fa-moon" id="dash-theme-icon-sidebar"></i> <span>Theme</span>
    </div>

    <div class="user-profile" onclick="switchView('settings');closeSidebar()" style="cursor:pointer;margin-top:0" title="Settings">
      <div class="user-avatar" id="user-avatar-initials">U</div>
      <div class="user-info">
        <div class="user-name" id="user-name-disp">User</div>
        <div class="user-plan" id="user-plan-disp">Free</div>
      </div>
      <i class="fas fa-cog" style="color:var(--text-muted);flex-shrink:0"></i>
    </div>
  </aside>
  <style>
    @media(max-width:768px){ 
      .mobile-header{display:flex!important} 
      .collapse-btn{display:none}
    }
  </style>
`;
