export const sidebar = `
  <!-- Mobile top bar -->
  <div class="mobile-header" style="display:none">
    <button class="mobile-menu-btn" onclick="toggleSidebar()">
      <i class="fas fa-bars"></i>
    </button>
    <a href="/" class="logo" style="margin:0">
      <img src="/logo.png" alt="SHOPUBLISH" style="height:24px;width:auto">
      <span style="font-size:16px">SHOPUBLISH</span>
    </a>
    <button onclick="toggleDashTheme()" title="Toggle theme" style="background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:6px">
      <i class="fas fa-moon" id="dash-theme-icon"></i>
    </button>
  </div>

  <!-- Mobile overlay -->
  <div class="mobile-overlay" onclick="toggleSidebar()"></div>

  <!-- Sidebar -->
  <aside class="sidebar" id="main-sidebar">

    <!-- Collapse button (desktop only) -->
    <button class="collapse-btn md-only" onclick="toggleCollapse()" title="Toggle Sidebar">
      <i class="fas fa-chevron-left"></i>
    </button>

    <!-- Logo -->
    <div class="sidebar-header">
      <a href="/" class="logo" style="margin:0">
        <img src="/logo.png" alt="SHOPUBLISH">
        <span>SHOPUBLISH</span>
      </a>
    </div>

    <!-- Navigation -->
    <nav style="flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:8px">

      <!-- Overview -->
      <div onclick="switchView('dashboard');closeSidebar()" class="nav-item active" id="nav-dashboard" title="Dashboard">
        <i class="fas fa-home"></i><span>Dashboard</span>
      </div>

      <!-- COMMERCE -->
      <div class="nav-section-label">Commerce</div>
      <div onclick="switchView('products');closeSidebar()" class="nav-item" id="nav-products" title="Products">
        <i class="fas fa-box"></i><span>Products</span>
      </div>
      <div onclick="switchView('orders');closeSidebar()" class="nav-item" id="nav-orders" title="Orders">
        <i class="fas fa-shopping-bag"></i><span>Orders</span>
      </div>
      <div onclick="switchView('categories');closeSidebar()" class="nav-item" id="nav-categories" title="Categories">
        <i class="fas fa-tags"></i><span>Categories</span>
      </div>
      <div onclick="switchView('promotions');closeSidebar()" class="nav-item" id="nav-promotions" title="Promotions">
        <i class="fas fa-percentage"></i><span>Promotions</span>
      </div>

      <!-- CONTENT -->
      <div class="nav-section-label">Content</div>
      <div onclick="switchView('docs');closeSidebar()" class="nav-item" id="nav-docs" title="Docs">
        <i class="fas fa-file-alt"></i><span>Docs</span>
      </div>
      <div onclick="switchView('composer');closeSidebar()" class="nav-item" id="nav-composer" title="Composer">
        <i class="fas fa-pen-nib"></i><span>Composer</span>
      </div>
      <div onclick="switchView('utilities');closeSidebar()" class="nav-item" id="nav-utilities" title="Utilities">
        <i class="fas fa-wrench"></i><span>Utilities</span>
      </div>

      <!-- AUDIENCE -->
      <div class="nav-section-label">Audience</div>
      <div onclick="switchView('members');closeSidebar()" class="nav-item" id="nav-members" title="Members">
        <i class="fas fa-users"></i><span>Members</span>
      </div>
      <div onclick="switchView('inquiries');closeSidebar()" class="nav-item" id="nav-inquiries" title="Inquiries">
        <i class="fas fa-inbox"></i><span>Inquiries</span>
      </div>

      <!-- STORE -->
      <div class="nav-section-label">Store</div>
      <div onclick="switchView('store');closeSidebar()" class="nav-item" id="nav-store" title="Store Builder">
        <i class="fas fa-store"></i><span>Store Builder</span>
      </div>
      <div onclick="switchView('integrations');closeSidebar()" class="nav-item" id="nav-integrations" title="Integrations">
        <i class="fas fa-plug"></i><span>Integrations</span>
      </div>

    </nav>

    <!-- Hidden for JS compat — subscription accessible via settings -->
    <div id="nav-subscription" style="display:none"></div>

    <!-- Bottom pinned -->
    <div style="border-top:1px solid var(--border-default);padding-top:8px;margin-top:4px">
      <div onclick="viewMyStore();" class="nav-item" title="View My Store" style="color:var(--color-accent)">
        <i class="fas fa-external-link-alt"></i><span>View My Store</span>
      </div>
      <div onclick="switchView('knowledge');closeSidebar()" class="nav-item" id="nav-knowledge" title="Help & Support">
        <i class="fas fa-question-circle"></i><span>Help & Support</span>
      </div>
      <div onclick="toggleDashTheme()" class="nav-item" title="Toggle Theme">
        <i class="fas fa-moon" id="dash-theme-icon-sidebar"></i><span>Theme</span>
      </div>
    </div>

    <!-- User profile -->
    <div class="user-profile" onclick="switchView('settings');closeSidebar()" style="cursor:pointer;margin-top:4px" title="Account Settings">
      <div class="user-avatar" id="user-avatar-initials">U</div>
      <div class="user-info">
        <div class="user-name" id="user-name-disp">User</div>
        <div class="user-plan" id="user-plan-disp">Free</div>
      </div>
      <i class="fas fa-cog" style="color:var(--text-muted);flex-shrink:0;font-size:13px"></i>
    </div>

  </aside>

  <style>
    @media(max-width:768px){
      .mobile-header{display:flex !important}
      .collapse-btn{display:none}
    }
  </style>
`;
