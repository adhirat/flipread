export const settingsView = `
    <!-- Settings View -->
    <div id="view-settings" class="view-section">
      <div class="header"><h2>Settings</h2></div>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:24px">
        <!-- Profile Section -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--glow-cyan);color:var(--accent-cyan);display:flex;align-items:center;justify-content:center;font-size:18px">
              <i class="fas fa-user-circle"></i>
            </div>
            <h3 style="font-family:'Rajdhani',sans-serif">Profile Information</h3>
          </div>
          
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="set-name-input" value="" placeholder="Your Name">
          </div>
          <div class="form-group">
            <label>Account Email</label>
            <div style="position:relative">
              <input type="text" id="set-email" disabled style="opacity:0.7;cursor:not-allowed;padding-left:40px">
              <i class="fas fa-envelope" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted)"></i>
            </div>
            <p style="font-size:11px;color:var(--text-muted);margin-top:8px">Email cannot be changed. Contact support for assistance.</p>
          </div>
          <button onclick="saveProfile()" class="btn" style="width:100%">Update Profile</button>
        </div>

        <!-- Appearance Section -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--glow-magenta);color:var(--accent-magenta);display:flex;align-items:center;justify-content:center;font-size:18px">
              <i class="fas fa-paint-brush"></i>
            </div>
            <h3 style="font-family:'Rajdhani',sans-serif">Appearance</h3>
          </div>
          
          <div class="form-group">
            <label>Interface Theme</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <button onclick="setTheme('light')" id="theme-btn-light" class="btn-outline" style="display:flex;flex-direction:column;gap:8px;padding:20px 10px;align-items:center">
                <i class="fas fa-sun" style="font-size:20px"></i>
                Light Mode
              </button>
              <button onclick="setTheme('dark')" id="theme-btn-dark" class="btn-outline" style="display:flex;flex-direction:column;gap:8px;padding:20px 10px;align-items:center">
                <i class="fas fa-moon" style="font-size:20px"></i>
                Dark Mode
              </button>
            </div>
          </div>
        </div>

        <!-- Security & Danger Zone -->
        <div class="card" style="border-color:rgba(239,68,68,0.1)">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(239,68,68,0.1);color:#ef4444;display:flex;align-items:center;justify-content:center;font-size:18px">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h3 style="font-family:'Rajdhani',sans-serif">Security</h3>
          </div>
          
          <div class="form-group">
            <label>Session</label>
            <button onclick="logout()" class="btn btn-outline" style="width:100%;justify-content:center;color:#ef4444;border-color:rgba(239,68,68,0.2)">
              <i class="fas fa-sign-out-alt" style="margin-right:8px"></i> Sign Out Everywhere
            </button>
          </div>

          <div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--border)">
             <h4 style="color:#ef4444;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Danger Zone</h4>
             <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.5">
               Once you delete your account, there is no going back. Please be certain.
             </p>
             <button onclick="confirmDeleteAccount()" class="btn-outline" 
               style="width:100%;border:1px solid #ef4444;color:#ef4444;background:rgba(239,68,68,0.04);justify-content:center;font-weight:600;padding:14px;transition:all 0.2s;text-transform:uppercase;font-size:12px;letter-spacing:1px" 
               onmouseover="this.style.background='#ef4444';this.style.color='#fff';this.style.boxShadow='0 4px 12px rgba(239,68,68,0.3)'" 
               onmouseout="this.style.background='rgba(239,68,68,0.04)';this.style.color='#ef4444';this.style.boxShadow='none'">
               <i class="fas fa-trash-alt" style="margin-right:8px"></i> Delete My Account
             </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Account Modal -->
    <div id="delete-modal" class="modal">
      <div class="modal-content" style="max-width:400px;text-align:center">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(239,68,68,0.1);color:#ef4444;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 20px">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 style="margin-bottom:12px">Delete Account?</h3>
        <p style="color:var(--text-secondary);margin-bottom:24px;font-size:14px;line-height:1.6">
          This action is <b>permanent</b>. All your published books, analytics, store settings, and billing history will be deleted immediately.
        </p>
        <div class="form-group" style="text-align:left">
          <label>Type "DELETE" to confirm</label>
          <input type="text" id="delete-confirm-input" placeholder="DELETE" style="text-align:center;letter-spacing:2px;font-weight:700">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px">
          <button onclick="hideModal('delete-modal')" class="btn-outline" style="justify-content:center">Cancel</button>
          <button onclick="executeDeleteAccount()" class="btn" style="background:#ef4444;justify-content:center">Delete</button>
        </div>
      </div>
    </div>
`;
