export const sidebar = `
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
`;
