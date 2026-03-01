/** @jsxImportSource hono/jsx */

const NavItem = ({ view, icon, label, title, color }: { view?: string, icon: string, label: string, title?: string, color?: string }) => {
    const clickAttr = view ? { "x-on:click": `window.switchView('${view}'); if (window.innerWidth < 768) toggleSidebar()` } : {};
    const classAttr = view ? { "x-bind:class": `currentView === '${view}' ? 'active' : ''` } : {};
    
    return (
        <div {...clickAttr} 
             class="nav-item" 
             {...classAttr}
             style={color ? { color } : {}}
             title={title || label}>
            <i class={`fas fa-${icon}`}></i>
            <span x-show="!sidebarCollapsed">{label}</span>
        </div>
    );
};

export const sidebar = () => (
    <>
        {/* Mobile top bar */}
        <div class="mobile-header" style="display:none">
            <button class="mobile-menu-btn" onclick="toggleSidebar()">
                <i class="fas fa-bars"></i>
            </button>
            <div x-on:click="window.switchView('dashboard')" class="logo" style="margin:0;cursor:pointer" title="Go to Dashboard">
                <img src="/logo.png" alt="SHOPUBLISH" style="height:24px;width:auto" />
                <span style="font-size:16px">SHOPUBLISH</span>
            </div>
            <button onclick="toggleDashTheme()" title="Toggle theme" style="background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:6px">
                <i class="fas fa-moon" id="dash-theme-icon"></i>
            </button>
        </div>

        {/* Mobile overlay */}
        <div class="mobile-overlay" onclick="toggleSidebar()"></div>

        {/* Sidebar */}
        <aside class="sidebar" id="main-sidebar" x-bind:class="sidebarCollapsed ? 'collapsed' : ''">

            {/* Collapse button (desktop only) */}
            <button class="collapse-btn md-only" x-on:click="sidebarCollapsed = !sidebarCollapsed" title="Toggle Sidebar">
                <i class="fas" x-bind:class="sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
            </button>

            {/* Logo */}
            <div class="sidebar-header">
                <div x-on:click="window.switchView('dashboard')" class="logo" style="margin:0;cursor:pointer">
                    <img src="/logo.png" alt="SHOPUBLISH" />
                    <span x-show="!sidebarCollapsed">SHOPUBLISH</span>
                </div>
            </div>

            {/* Navigation */}
            <nav style="flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:8px">

                <NavItem view="dashboard" icon="home" label="Dashboard" />

                <div class="nav-section-label" x-show="!sidebarCollapsed">Commerce</div>
                <NavItem view="products" icon="box" label="Products" />
                <NavItem view="orders" icon="shopping-bag" label="Orders" />
                <NavItem view="categories" icon="tags" label="Categories" />
                <NavItem view="promotions" icon="percentage" label="Promotions" />

                <div class="nav-section-label" x-show="!sidebarCollapsed">Content</div>
                <NavItem view="docs" icon="file-alt" label="Docs" />
                <NavItem view="composer" icon="pen-nib" label="Composer" />
                <NavItem view="utilities" icon="wrench" label="Utilities" />

                <div class="nav-section-label" x-show="!sidebarCollapsed">Audience</div>
                <NavItem view="members" icon="users" label="Members" />
                <NavItem view="inquiries" icon="inbox" label="Inquiries" />

                <div class="nav-section-label" x-show="!sidebarCollapsed">Store</div>
                <NavItem view="store" icon="store" label="Store Builder" />
                <NavItem view="integrations" icon="plug" label="Integrations" />
                <div onclick="viewMyStore();" class="nav-item" title="View My Store" style="color:var(--color-accent)">
                    <i class="fas fa-external-link-alt"></i>
                    <span x-show="!sidebarCollapsed">View My Store</span>
                </div>

                <div class="nav-section-label" x-show="!sidebarCollapsed">Preferences</div>
                <NavItem view="knowledge" icon="question-circle" label="Help & Support" />
                <div onclick="toggleDashTheme()" class="nav-item" title="Toggle Theme">
                    <i class="fas fa-moon" id="dash-theme-icon-sidebar"></i>
                    <span x-show="!sidebarCollapsed">Theme</span>
                </div>
            </nav>

            {/* Bottom pinned (User Profile only) */}
            <div style="border-top:1px solid var(--border-default);padding-top:4px;margin-top:auto" x-show="!sidebarCollapsed">
                <div class="user-profile" x-on:click="window.switchView('settings'); if (window.innerWidth < 768) toggleSidebar()" style="cursor:pointer;margin-top:4px" title="Account Settings">
                    <div class="user-avatar" id="user-avatar-initials">U</div>
                    <div class="user-info">
                        <div class="user-name" id="user-name-disp">User</div>
                        <div class="user-plan" id="user-plan-disp">Free</div>
                    </div>
                    <i class="fas fa-cog" style="color:var(--text-muted);flex-shrink:0;font-size:13px"></i>
                </div>
            </div>
        </aside>
        <style dangerouslySetInnerHTML={{ __html: `
            @media(max-width:768px){
                .mobile-header{display:flex !important}
                .collapse-btn{display:none}
            }
        ` }} />
    </>
);
