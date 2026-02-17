export const storeView = `
    <!-- Store View -->
    <div id="view-store" class="view-section">
      <div class="header"><h2>Store Customization</h2></div>
      <div class="card" style="max-width:700px">
        <h3 style="margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px">General Information</h3>
        <div class="form-group">
          <label>Store Name</label>
          <input type="text" id="st-name" placeholder="My Book Store">
        </div>
        <div class="form-group">
          <label>Store Description</label>
          <textarea id="st-desc" rows="2" placeholder="Welcome to my collection..."></textarea>
        </div>
        <div class="form-group">
          <label>Store Logo</label>
          <div style="display:flex;gap:16px;align-items:center">
            <div id="st-logo-preview" style="width:64px;height:64px;border-radius:12px;background:var(--bg-elevated);overflow:hidden;flex-shrink:0"></div>
            <button class="btn-outline" onclick="document.getElementById('logo-input').click()" style="padding:8px 16px">Upload Logo</button>
            <span style="font-size:12px;color:var(--text-muted)">Recommended: Square aspect ratio</span>
          </div>
          <input type="file" id="logo-input" accept="image/*" style="display:none" onchange="uploadLogo(event)">
        </div>
        <div class="form-group">
          <label>Custom Domain (Optional)</label>
          <input type="text" id="st-domain" placeholder="e.g. books.mydomain.com">
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px">
            <b>Setup:</b> Point your domain's <b>CNAME</b> record to <code>flipread.flipread.workers.dev</code>. <br>
            Then add the domain here and save.
          </p>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Hero Section</h3>
        <div class="form-group">
          <label>Hero Title</label>
          <input type="text" id="st-h-title" placeholder="Defaults to Store Name">
        </div>
        <div class="form-group">
          <label>Hero Caption</label>
          <input type="text" id="st-h-caption" placeholder="Defaults to Store Description">
        </div>
        <div class="form-group">
          <label>Hero Image URL</label>
          <input type="text" id="st-h-img" placeholder="https://example.com/banner.jpg">
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px">Provide a URL for the large banner background. Unsplash URLs work great.</p>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Design & Theme</h3>

        <div class="form-group">
          <label>Theme Preset</label>
          <div id="st-theme-presets" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
            <div class="theme-preset-card" data-theme="default" onclick="selectThemePreset('default')">
              <div style="height:60px;border-radius:8px;background:linear-gradient(135deg,#faf9f7,#f0eeeb);border:1px solid rgba(0,0,0,0.08);margin-bottom:6px;display:flex;align-items:center;justify-content:center">
                <div style="width:20px;height:26px;background:#c45d3e;border-radius:2px 4px 4px 2px;box-shadow:2px 2px 4px rgba(0,0,0,0.1)"></div>
              </div>
              <span style="font-size:12px;font-weight:600">Default</span>
            </div>
            <div class="theme-preset-card" data-theme="minimal" onclick="selectThemePreset('minimal')">
              <div style="height:60px;border-radius:8px;background:#fff;border:1px solid #e5e5e5;margin-bottom:6px;display:flex;align-items:center;justify-content:center">
                <div style="width:16px;height:22px;background:#333;border-radius:2px"></div>
              </div>
              <span style="font-size:12px;font-weight:600">Minimal</span>
            </div>
            <div class="theme-preset-card" data-theme="magazine" onclick="selectThemePreset('magazine')">
              <div style="height:60px;border-radius:8px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,0.05);margin-bottom:6px;display:flex;align-items:center;justify-content:center">
                <div style="width:20px;height:26px;background:linear-gradient(135deg,#e94560,#533483);border-radius:2px 4px 4px 2px"></div>
              </div>
              <span style="font-size:12px;font-weight:600">Magazine</span>
            </div>
            <div class="theme-preset-card" data-theme="dark-luxe" onclick="selectThemePreset('dark-luxe')">
              <div style="height:60px;border-radius:8px;background:linear-gradient(135deg,#0a0a0a,#1a1a1a);border:1px solid rgba(212,175,55,0.2);margin-bottom:6px;display:flex;align-items:center;justify-content:center">
                <div style="width:20px;height:26px;background:linear-gradient(135deg,#d4af37,#b8860b);border-radius:2px 4px 4px 2px"></div>
              </div>
              <span style="font-size:12px;font-weight:600">Dark Luxe</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Accent Color</label>
          <div style="display:flex;align-items:center;gap:12px">
            <input type="color" id="st-accent" value="#c45d3e" style="width:48px;height:40px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px;background:var(--bg-elevated)">
            <input type="text" id="st-accent-hex" value="#c45d3e" style="width:100px;font-family:monospace" oninput="syncAccentColor(this.value)">
            <div style="display:flex;gap:6px">
              <span class="accent-swatch" style="background:#c45d3e" onclick="setAccent('#c45d3e')"></span>
              <span class="accent-swatch" style="background:#4f46e5" onclick="setAccent('#4f46e5')"></span>
              <span class="accent-swatch" style="background:#059669" onclick="setAccent('#059669')"></span>
              <span class="accent-swatch" style="background:#dc2626" onclick="setAccent('#dc2626')"></span>
              <span class="accent-swatch" style="background:#7c3aed" onclick="setAccent('#7c3aed')"></span>
              <span class="accent-swatch" style="background:#0891b2" onclick="setAccent('#0891b2')"></span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Font</label>
          <select id="st-font">
            <option value="dm-sans">DM Sans (Default)</option>
            <option value="inter">Inter</option>
            <option value="playfair">Playfair Display</option>
            <option value="space-grotesk">Space Grotesk</option>
          </select>
        </div>

        <div style="display:flex;gap:24px">
          <div class="form-group" style="flex:1">
            <label>Layout Style</label>
            <div style="display:flex;gap:8px">
              <button class="btn-outline layout-opt active" id="lo-grid" onclick="selectLayout('grid')" style="flex:1;padding:10px;justify-content:center"><i class="fas fa-th"></i> <span>Grid</span></button>
              <button class="btn-outline layout-opt" id="lo-list" onclick="selectLayout('list')" style="flex:1;padding:10px;justify-content:center"><i class="fas fa-list"></i> <span>List</span></button>
              <button class="btn-outline layout-opt" id="lo-masonry" onclick="selectLayout('masonry')" style="flex:1;padding:10px;justify-content:center"><i class="fas fa-columns"></i> <span>Masonry</span></button>
            </div>
          </div>
          <div class="form-group" style="flex:1">
            <label>Card Style</label>
            <div style="display:flex;gap:8px">
              <button class="btn-outline card-opt active" id="co-3d-book" onclick="selectCard('3d-book')" style="flex:1;padding:10px;justify-content:center"><i class="fas fa-book"></i> <span>3D</span></button>
              <button class="btn-outline card-opt" id="co-flat-card" onclick="selectCard('flat-card')" style="flex:1;padding:10px;justify-content:center"><i class="fas fa-square"></i> <span>Flat</span></button>
              <button class="btn-outline card-opt" id="co-minimal-row" onclick="selectCard('minimal-row')" style="flex:1;padding:10px;justify-content:center"><i class="fas fa-minus"></i> <span>Row</span></button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Show View Count on Store</label>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="toggle-switch" id="st-show-views-toggle" onclick="toggleStoreOption('show-views')">
              <div class="toggle-knob"></div>
            </div>
            <span style="font-size:13px;color:var(--text-secondary)">Display view counts on book cards in your public store</span>
          </div>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Access Control</h3>
        <div class="form-group">
          <label>Private Store Mode <span style="font-size:10px;background:var(--accent-purple);color:#fff;padding:2px 6px;border-radius:4px;margin-left:6px">PRO+</span></label>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="toggle-switch" id="st-private-toggle" onclick="toggleStoreOption('private')">
              <div class="toggle-knob"></div>
            </div>
            <span style="font-size:13px;color:var(--text-secondary)">When enabled, visitors need a membership to open documents</span>
          </div>
          <p id="st-private-info" style="font-size:12px;color:var(--text-muted);margin-top:8px;display:none">
            <i class="fas fa-info-circle"></i> Manage members in the <a href="#" onclick="switchView('members');return false" style="color:var(--accent-cyan)">Members</a> section. Only active members can access your document viewers.
          </p>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Legal & Contact</h3>
        <div class="form-group">
          <label>Privacy Policy Content</label>
          <textarea id="st-privacy" rows="4" placeholder="Enter full Privacy Policy text..."></textarea>
        </div>
        <div class="form-group">
          <label>Terms & Conditions Content</label>
          <textarea id="st-terms" rows="4" placeholder="Enter full Terms text..."></textarea>
        </div>
        <div class="form-group">
          <label>Contact Information</label>
          <textarea id="st-contact" rows="3" placeholder="Enter contact details (Address, Email, Phone)..."></textarea>
        </div>

        <div id="store-msg" class="msg"></div>
        <button onclick="saveStoreSettings()" class="btn">Save Changes</button>
      </div>
    </div>
    
      <!-- Crop Logo Modal -->
  <div id="crop-modal" class="modal">
    <div class="crop-modal-content">
      <div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">Crop Logo</h3>
        <i class="fas fa-times" onclick="cancelCrop()" style="cursor:pointer;color:var(--text-secondary)"></i>
      </div>
      <div class="crop-area">
        <img id="crop-img" style="max-width:100%;display:none">
      </div>
      <div class="crop-controls">
        <button onclick="cancelCrop()" class="btn-outline">Cancel</button>
        <button onclick="applyCrop()" class="btn">Apply & Upload</button>
      </div>
    </div>
  </div>
`;
