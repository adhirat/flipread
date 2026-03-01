/** @jsxImportSource hono/jsx */

export const categoriesView = () => (
    <>
        {/* Categories View */}
        <div id="view-categories" class="view-section">
          <div class="view-header">
            <div>
              <h2>Categories</h2>
              <p class="text-secondary">Manage global categories.</p>
            </div>
            <div style="display:flex;gap:12px">
                <button class="btn" x-on:click="window.showCategoryModal()"><i class="fas fa-plus"></i> New Category</button>
            </div>
          </div>

          <div class="card" style="margin-top:24px;padding:32px;">
            <h3 style="margin-bottom:16px;">Global Tag Dictionary</h3>
            <div id="categories-list" style="display:flex; flex-wrap:wrap; gap:8px;">
               <i class="fas fa-spinner fa-spin text-muted"></i> <span class="text-muted">Loading categories...</span>
            </div>
          </div>
        </div>

        {/* Category Modal */}
        <div id="category-modal" class="modal">
          <div class="modal-content" style="max-width:400px">
            <div class="close-btn" x-on:click="window.hideModal('category-modal')">&times;</div>
            <h3 id="category-modal-title" style="margin-bottom:24px">Add Global Category</h3>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
              Note: Categories are shared globally across all users to unify tagging.
            </p>
            <input type="hidden" id="edit-category-id" />
            <input type="hidden" id="edit-category-image-url" />
            <div class="form-group">
              <label>Category Title</label>
              <input type="text" id="new-category-name" placeholder="e.g. Fiction, Tutorial, Sci-Fi" />
            </div>
            <div class="form-group">
              <label>Category Cover Image (Optional)</label>
              <input type="file" id="new-category-image" accept="image/*" style="width:100%;padding:8px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);" />
            </div>
            <div class="form-group">
              <label>Parent Category (Optional)</label>
              <select id="new-category-parent" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;">
                <option value="">None (Top-Level Category)</option>
              </select>
            </div>
            <div id="add-category-msg" class="msg" style="display:none;margin-bottom:12px;"></div>
            <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px">
              <button id="delete-category-btn" x-on:click="window.deleteCategory()" class="btn-outline" style="border:none;color:var(--accent-magenta);display:none;">Delete</button>
              <div style="flex:1"></div>
              <button x-on:click="window.hideModal('category-modal')" class="btn-outline" style="border:none">Cancel</button>
              <button id="submit-category-btn" x-on:click="window.saveCategory()" class="btn">Save</button>
            </div>
          </div>
        </div>
    </>
);
