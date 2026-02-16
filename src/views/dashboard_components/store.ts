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
