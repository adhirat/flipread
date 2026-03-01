/** @jsxImportSource hono/jsx */

export const productsView = () => (
    <>
        {/* Products View */}
        <div id="view-products" class="view-section">
          <div class="view-header">
            <div>
              <h2>Products</h2>
              <p class="text-secondary">Manage your store's physical and digital products.</p>
            </div>
            <div style="display:flex;gap:12px">
                <button class="btn" x-on:click="window.showProductModal()"><i class="fas fa-plus"></i> New Product</button>
            </div>
          </div>

          <div class="card" style="margin-top:24px;padding:32px;">
            <div id="products-list-container" style="display:flex; flex-direction:column; gap:16px;">
               <i class="fas fa-spinner fa-spin text-muted"></i> <span class="text-muted">Loading products...</span>
            </div>
          </div>
        </div>

        {/* Edit Product Modal */}
        <div id="edit-product-modal" class="modal">
          <div class="modal-content" style="max-width:600px; max-height:80vh; overflow-y:auto;">
            <div class="close-btn" x-on:click="window.hideModal('edit-product-modal')">&times;</div>
            <h3 id="product-modal-title" style="margin-bottom:24px">Product Details</h3>
            <input type="hidden" id="edit-product-id" />
            
            <div class="form-group">
              <label>Title</label>
              <input type="text" id="edit-product-title" placeholder="Product Name" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea id="edit-product-desc" rows={3} style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;resize:vertical;" placeholder="Describe your product..."></textarea>
            </div>
            
            <div style="display:flex; gap:16px;">
                <div class="form-group" style="flex:1;">
                  <label>Product Type</label>
                  <select id="edit-product-type" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);">
                    <option value="digital">Digital Download</option>
                    <option value="physical">Physical Item</option>
                  </select>
                </div>
                <div class="form-group" style="flex:1;">
                  <label>Status</label>
                  <select id="edit-product-status" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
            </div>

            <div style="display:flex; gap:16px;">
                <div class="form-group" style="flex:1;">
                  <label>Actual Price ($)</label>
                  <input type="number" id="edit-product-actual-price" step="0.01" min="0" placeholder="0.00" />
                </div>
                <div class="form-group" style="flex:1;">
                  <label>Selling Price ($)</label>
                  <input type="number" id="edit-product-selling-price" step="0.01" min="0" placeholder="0.00" />
                </div>
                <div class="form-group" style="flex:1;">
                  <label>Discount (%)</label>
                  <input type="number" id="edit-product-discount" step="0.1" min="0" max="100" placeholder="0" />
                </div>
            </div>

            <div id="product-physical-fields" style="display:none; padding:16px; border:1px solid var(--border); border-radius:12px; margin-bottom:16px;">
                <h4 style="margin-top:0; margin-bottom:12px; font-size:14px;">Physical Attributes</h4>
                <div style="display:flex; gap:16px;">
                    <div class="form-group" style="flex:1;">
                      <label>Weight</label>
                      <input type="number" id="edit-product-weight" step="0.01" min="0" placeholder="0" />
                    </div>
                    <div class="form-group" style="flex:1;">
                      <label>Weight Unit</label>
                      <select id="edit-product-weight-unit" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);">
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                </div>
            </div>

            <div class="form-group">
              <label>Categories</label>
              <div id="edit-product-categories" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
                {/* Rendered by JS */}
              </div>
            </div>

            <div class="form-group">
              <label>Expiry Date (Optional)</label>
              <input type="date" id="edit-product-expiry" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;" />
            </div>

            <div id="edit-product-msg" class="msg" style="display:none;margin-bottom:12px;"></div>
            <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px">
              <button x-on:click="window.hideModal('edit-product-modal')" class="btn-outline" style="border:none">Cancel</button>
              <button id="submit-product-btn" x-on:click="window.saveProduct()" class="btn">Save Product</button>
            </div>
          </div>
        </div>
    </>
);
