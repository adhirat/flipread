export const dashboardOverview = `
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
      <div class="card" style="margin-top:24px">
        <h3 style="margin-bottom:16px;font-family:'Rajdhani',sans-serif">Recent Activity</h3>
        <div id="activity-list" style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;">
            <div style="color:var(--text-muted);font-size:13px;font-style:italic">Loading activity...</div>
        </div>
      </div>
    </div>
`;
