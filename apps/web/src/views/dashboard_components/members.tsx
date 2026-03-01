/** @jsxImportSource hono/jsx */

export const membersView = () => (
    <>
        {/* Members View */}
        <div id="view-members" class="view-section">
          <div class="header">
            <h2>Members</h2>
            <div id="members-stats" style="font-size:13px;color:var(--text-muted)"></div>
          </div>

          <div class="card" style="margin-bottom:24px">
            <h3 style="margin-bottom:16px">Add New Member</h3>
            <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
              <div class="form-group" style="flex:1;min-width:200px;margin-bottom:0">
                <label>Email</label>
                <input type="email" id="add-member-email" placeholder="member@example.com" />
              </div>
              <div class="form-group" style="flex:1;min-width:200px;margin-bottom:0">
                <label>Name (Optional)</label>
                <input type="text" id="add-member-name" placeholder="John Doe" />
              </div>
              <button x-on:click="window.addMember()" class="btn" style="height:48px;white-space:nowrap"><i class="fas fa-plus" style="margin-right:6px"></i> Add Member</button>
            </div>
            <div id="member-msg" class="msg" style="margin-top:16px"></div>
          </div>

          <div class="card" style="margin-bottom:24px;padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
              <div style="display:flex;gap:4px;background:var(--bg-elevated);padding:4px;border-radius:10px;border:1px solid var(--border)">
                <button class="member-tab active" id="member-tab-all" x-on:click="window.setMemberFilter('all')" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;border-radius:6px;transition:0.2s">All</button>
                <button class="member-tab" id="member-tab-active" x-on:click="window.setMemberFilter('active')" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;border-radius:6px;transition:0.2s">Active</button>
                <button class="member-tab" id="member-tab-unverified" x-on:click="window.setMemberFilter('unverified')" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;border-radius:6px;transition:0.2s">Unverified</button>
                <button class="member-tab" id="member-tab-archived" x-on:click="window.setMemberFilter('archived')" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;border-radius:6px;transition:0.2s">Archived</button>
              </div>
              <div style="display:flex;gap:12px;align-items:center">
                <select id="member-sort" x-on:change="window.renderMembers()" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);font-size:12px;color:var(--text-primary);cursor:pointer">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="email">Email (A-Z)</option>
                </select>
                <div class="books-search-wrap" style="max-width:200px;margin-bottom:0">
                  <i class="fas fa-search"></i>
                  <input type="text" class="books-search" id="members-search" placeholder="Search..." x-on:input="window.renderMembers()" style="height:32px;font-size:13px" />
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div id="bulk-actions-bar" style="display:none;align-items:center;gap:12px;padding:10px 16px;background:var(--accent-cyan);color:white;border-radius:8px;margin-bottom:16px;animation:slideIn 0.3s ease">
              <span id="selection-count" style="font-size:13px;font-weight:600">0 selected</span>
              <div style="flex:1"></div>
              <select id="bulk-action-select" style="padding:4px 8px;border-radius:4px;border:none;font-size:12px;cursor:pointer">
                <option value="">Bulk Actions...</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="archive">Archive</option>
                <option value="restore" id="bulk-restore-opt" style="display:none">Restore</option>
                <option value="delete">Delete Permanently</option>
              </select>
              <button x-on:click="window.applyBulkAction()" class="btn" style="padding:4px 12px;font-size:12px;background:white;color:var(--accent-cyan);border:none;height:auto">Apply</button>
            </div>

            <div id="members-list"></div>
          </div>
        </div>

        {/* Edit Member Modal */}
        <div id="edit-member-modal" class="modal">
          <div class="modal-content">
            <div class="close-btn" x-on:click="window.hideModal('edit-member-modal')">&times;</div>
            <h3 style="margin-bottom:24px">Edit Member</h3>
            <input type="hidden" id="edit-member-id" />
            <div class="form-group">
              <label>Name</label>
              <input type="text" id="edit-member-name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="edit-member-email" disabled style="opacity:0.6" />
            </div>
            <div class="form-group">
              <label style="display:flex;align-items:center;gap:12px;text-transform:none;letter-spacing:0">
                <input type="checkbox" id="edit-member-active" style="width:auto;margin:0" /> Active
              </label>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:12px">
              <button x-on:click="window.hideModal('edit-member-modal')" class="btn-outline" style="border:none">Cancel</button>
              <button x-on:click="window.saveMember()" class="btn">Save Changes</button>
            </div>
          </div>
        </div>
    </>
);
