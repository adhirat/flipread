export const promotionsView = `
    <!-- Promotions View -->
    <div id="view-promotions" class="view-section">
      <div class="view-header">
        <div>
          <h2>Promotions</h2>
          <p class="text-secondary">Create promo codes and discounts for your store.</p>
        </div>
        <div style="display:flex;gap:12px">
            <button class="btn" onclick="showPromoModal()"><i class="fas fa-plus"></i> New Promotion</button>
        </div>
      </div>

      <div class="card" style="margin-top:24px;padding:32px;">
        <div id="promos-list-container" style="display:flex; flex-direction:column; gap:16px;">
           <i class="fas fa-spinner fa-spin text-muted"></i> <span class="text-muted">Loading promotions...</span>
        </div>
      </div>
    </div>

    <!-- Edit/Create Promotion Modal -->
    <div id="edit-promo-modal" class="modal">
      <div class="modal-content" style="max-width:500px">
        <div class="close-btn" onclick="hideModal('edit-promo-modal')">&times;</div>
        <h3 id="promo-modal-title" style="margin-bottom:24px">Promotion Details</h3>
        <input type="hidden" id="edit-promo-id">
        
        <div class="form-group">
          <label>Promo Code (Unique)</label>
          <input type="text" id="edit-promo-code" placeholder="e.g. SUMMER25">
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="edit-promo-desc" placeholder="Brief details about the promo">
        </div>

        <div style="display:flex; gap:16px;">
            <div class="form-group" style="flex:1;">
              <label>Discount Type</label>
              <select id="edit-promo-type" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label>Discount Value</label>
              <input type="number" id="edit-promo-value" step="0.1" min="0" placeholder="0">
            </div>
        </div>
        
        <div style="display:flex; gap:16px;">
            <div class="form-group" style="flex:1;">
              <label>Min Quantity Required</label>
              <input type="number" id="edit-promo-min-qty" min="0" placeholder="0 (Optional)">
            </div>
            <div class="form-group" style="flex:1;">
              <label>Min Price Required ($)</label>
              <input type="number" id="edit-promo-min-price" step="0.01" min="0" placeholder="0.00 (Optional)">
            </div>
        </div>

        <div style="display:flex; gap:16px;">
            <div class="form-group" style="flex:1;">
              <label>Target Audience</label>
              <select id="edit-promo-target" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);">
                <option value="all">All Users</option>
                <option value="new">New Customers Only</option>
                <option value="existing">Existing Customers Only</option>
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label>Status</label>
              <select id="edit-promo-status" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
        </div>

        <div class="form-group">
          <label>Expiry Date (Optional)</label>
          <input type="date" id="edit-promo-expiry" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;">
        </div>

        <div class="form-group">
          <label>Valid Categories (Optional)</label>
          <div id="edit-promo-categories" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
            <!-- Rendered via JS -->
          </div>
        </div>

        <div id="edit-promo-msg" class="msg" style="display:none;margin-bottom:12px;"></div>
        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px">
          <button onclick="hideModal('edit-promo-modal')" class="btn-outline" style="border:none">Cancel</button>
          <button id="submit-promo-btn" onclick="savePromo()" class="btn">Save Promotion</button>
        </div>
      </div>
    </div>
`;
