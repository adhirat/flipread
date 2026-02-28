export const dashboardOverview = `
  <!-- Dashboard Overview -->
  <div id="view-dashboard" class="view-section active">
    <div class="header">
      <h2>Overview</h2>
      <a href="#" id="store-link-top" target="_blank" class="btn btn-outline">
        <i class="fas fa-external-link-alt"></i> View My Store
      </a>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
        <div>
          <div class="stat-val" id="d-books">0</div>
          <div class="stat-label">Published Docs</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(59,130,246,0.1);color:#3b82f6">
          <i class="fas fa-eye"></i>
        </div>
        <div>
          <div class="stat-val" id="d-views">0</div>
          <div class="stat-label">Total Views</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(16,185,129,0.1);color:#10b981">
          <i class="fas fa-layer-group"></i>
        </div>
        <div>
          <div class="stat-val" id="d-plan">Free</div>
          <div class="stat-label">Current Plan</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(245,158,11,0.1);color:#f59e0b">
          <i class="fas fa-inbox"></i>
        </div>
        <div>
          <div class="stat-val" id="d-inquiries">0</div>
          <div class="stat-label">Inquiries</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h3 style="margin-bottom:16px">Quick Actions</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button onclick="switchView('docs')" class="btn">
          <i class="fas fa-file-alt"></i> Manage Docs
        </button>
        <button onclick="switchView('store')" class="btn btn-outline">
          <i class="fas fa-store"></i> Customize Store
        </button>
        <button onclick="switchView('products')" class="btn btn-outline">
          <i class="fas fa-box"></i> Products
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card" style="margin-top:4px">
      <h3 style="margin-bottom:16px">Recent Activity</h3>
      <div id="activity-list" style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:10px">
        <div style="color:var(--text-muted);font-size:13px;font-style:italic">Loading activity...</div>
      </div>
    </div>
  </div>
`;
