export const membersView = `
    <!-- Members View -->
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
            <input type="email" id="add-member-email" placeholder="member@example.com">
          </div>
          <div class="form-group" style="flex:1;min-width:200px;margin-bottom:0">
            <label>Name (Optional)</label>
            <input type="text" id="add-member-name" placeholder="John Doe">
          </div>
          <button onclick="addMember()" class="btn" style="height:48px;white-space:nowrap"><i class="fas fa-plus" style="margin-right:6px"></i> Add Member</button>
        </div>
        <div id="member-msg" class="msg" style="margin-top:16px"></div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3>Member List</h3>
          <div class="books-search-wrap" style="max-width:260px">
            <i class="fas fa-search"></i>
            <input type="text" class="books-search" id="members-search" placeholder="Search members..." oninput="renderMembers()">
          </div>
        </div>
        <div id="members-list"></div>
      </div>
    </div>

    <!-- Edit Member Modal -->
    <div id="edit-member-modal" class="modal">
      <div class="modal-content">
        <div class="close-btn" onclick="hideModal('edit-member-modal')">&times;</div>
        <h3 style="margin-bottom:24px">Edit Member</h3>
        <input type="hidden" id="edit-member-id">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="edit-member-name">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="edit-member-email" disabled style="opacity:0.6">
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:12px;text-transform:none;letter-spacing:0">
            <input type="checkbox" id="edit-member-active" style="width:auto;margin:0"> Active
          </label>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:12px">
          <button onclick="hideModal('edit-member-modal')" class="btn-outline" style="border:none">Cancel</button>
          <button onclick="saveMember()" class="btn">Save Changes</button>
        </div>
      </div>
    </div>
`;
