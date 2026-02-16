export const settingsView = `
    <!-- Settings View -->
    <div id="view-settings" class="view-section">
      <div class="header"><h2>Settings</h2></div>
      <div class="card" style="max-width:500px">
        <h3 style="margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px">Preferences</h3>
        <div class="form-group">
          <label>Theme</label>
          <div style="display:flex;gap:12px">
            <button onclick="setTheme('dark')" class="btn-outline" style="flex:1;padding:12px">Dark</button>
            <button onclick="setTheme('light')" class="btn-outline" style="flex:1;padding:12px">Light</button>
          </div>
        </div>
        <div class="form-group">
          <label>Account Email</label>
          <input type="text" id="set-email" disabled style="opacity:0.6;cursor:not-allowed">
        </div>
        <button onclick="logout()" class="btn" style="background:var(--bg-elevated);color:var(--text-secondary);width:100%;margin-bottom:32px">Sign Out</button>

        <h3 style="margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px;color:var(--accent-magenta)">Danger Zone</h3>
        <p style="font-size:14px;color:var(--text-secondary);margin-bottom:16px">
          Deleting your account is irreversible. All your data, books, and store settings will be permanently removed.
        </p>
        <button onclick="confirmDeleteAccount()" class="btn-outline" style="width:100%;border-color:var(--accent-magenta);color:var(--accent-magenta)">Delete Account</button>
      </div>
    </div>
    
      <!-- Delete Account Modal -->
  <div id="delete-modal" class="modal">
    <div class="modal-content" style="max-width:400px;text-align:center">
      <div style="width:60px;height:60px;border-radius:50%;background:rgba(255,0,110,0.1);color:var(--accent-magenta);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 20px">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3 style="margin-bottom:12px">Delete Account?</h3>
      <p style="color:var(--text-secondary);margin-bottom:24px;font-size:14px">
        This action cannot be undone. All your <b>books, files, store settings, and personal data</b> will be permanently deleted immediately.
      </p>
      <div class="form-group" style="text-align:left">
        <label>Type "DELETE" to confirm</label>
        <input type="text" id="delete-confirm-input" placeholder="DELETE">
      </div>
      <div style="display:flex;gap:12px">
        <button onclick="hideModal('delete-modal')" class="btn-outline" style="flex:1">Cancel</button>
        <button onclick="executeDeleteAccount()" class="btn" style="flex:1;background:var(--accent-magenta)">Delete Everything</button>
      </div>
    </div>
  </div>
`;
