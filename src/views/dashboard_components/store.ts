export const storeView = `
    <!-- Store View -->
    <div id="view-store" class="view-section store-builder">
      <div class="store-builder-header">
        <h2>Store Customization</h2>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn" onclick="saveStoreSettings()" style="padding:7px 14px;font-size:12px"><i class="fas fa-save"></i><span class="btn-text">Save</span></button>
          <button class="btn-outline" onclick="refreshStorePreview()" style="padding:7px 14px;font-size:12px"><i class="fas fa-sync-alt"></i><span class="btn-text">Refresh</span></button>
          <a id="store-live-link" href="#" target="_blank" class="btn" style="padding:7px 14px;font-size:12px;text-decoration:none"><i class="fas fa-external-link-alt"></i><span class="btn-text">View Live</span></a>
        </div>
      </div>
      <div class="store-builder-body">
      <!-- LEFT: live preview panel -->
      <div class="store-panel-preview">
        <div class="store-preview-bar">
          <div class="store-preview-url" id="store-preview-url-bar">
            <i class="fas fa-lock" style="font-size:10px;opacity:0.5;margin-right:4px"></i>
            <span id="store-preview-url-text">your-store-url</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div id="preview-unsaved-badge" style="display:none;align-items:center;gap:4px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.4);color:#f59e0b;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px">
              <i class="fas fa-pencil-alt" style="font-size:9px"></i> Unsaved changes - Save &amp; Refresh preview
            </div>
            <span class="store-preview-badge"><i class="fas fa-circle" style="color:#22c55e;font-size:8px;margin-right:4px"></i>Live Preview</span>
          </div>
        </div>
        <div style="position:relative;flex:1;display:flex;flex-direction:column">
          <div id="store-preview-loading" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg-secondary);z-index:10;gap:12px">
            <div style="width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent-cyan);border-radius:50%;animation:spin 0.7s linear infinite"></div>
            <span style="font-size:12px;color:var(--text-muted)">Loading preview...</span>
          </div>
          <iframe id="store-preview-iframe" src="about:blank" sandbox="allow-scripts allow-same-origin allow-forms" style="width:100%;flex:1;border:none;background:#fff" onload="document.getElementById('store-preview-loading').style.display='none'"></iframe>
        </div>
      </div>

      <!-- RIGHT: settings panel -->
      <div class="store-panel-settings">
      <div class="store-panel-inner">
        <h3 style="margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px">General Information</h3>
        <div class="form-group">
          <label>Store Name</label>
          <input type="text" id="st-name" placeholder="My Book Store">
        </div>
        <div class="form-group">
          <label>Store Handle (URL Slug)</label>
          <div style="display:flex;gap:4px;align-items:center">
            <span style="color:var(--text-muted);font-size:14px">/store/</span>
            <input type="text" id="st-handle" placeholder="my-awesome-store" style="flex:1">
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px">This is your unique store URL. 3-30 characters, lowercase alphanumeric and hyphens.</p>
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
            <b>Setup:</b> Point your domain's <b>CNAME</b> record to <code>flipread.adhirat.workers.dev</code>. <br>
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
          <label>Hero Image</label>
          <div style="display:flex;gap:8px">
            <input type="text" id="st-h-img" placeholder="https://images.unsplash.com/..." style="flex:1">
            <button class="btn-outline" onclick="document.getElementById('hero-input').click()" style="padding:0 12px" title="Upload Hero Image"><i class="fas fa-upload"></i></button>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px">Provide a URL or upload a high-quality banner (Standard: 16:9 or 21:9 aspect ratio).</p>
          <input type="file" id="hero-input" accept="image/*" style="display:none" onchange="uploadHero(event)">
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

        <div class="form-group">
          <label>Show Publication Date on Cards</label>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="toggle-switch" id="st-show-date-toggle" onclick="toggleStoreOption('show-date')">
              <div class="toggle-knob"></div>
            </div>
            <span style="font-size:13px;color:var(--text-secondary)">Show the month &amp; year each book was published</span>
          </div>
        </div>

        <div class="form-group">
          <label>Hero Size</label>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
            <button class="btn-outline hero-size-opt active" id="hs-standard" onclick="selectHeroSize('standard')" style="padding:10px 6px;justify-content:center;font-size:13px">Standard</button>
            <button class="btn-outline hero-size-opt" id="hs-compact" onclick="selectHeroSize('compact')" style="padding:10px 6px;justify-content:center;font-size:13px">Compact</button>
            <button class="btn-outline hero-size-opt" id="hs-tall" onclick="selectHeroSize('tall')" style="padding:10px 6px;justify-content:center;font-size:13px">Tall</button>
            <button class="btn-outline hero-size-opt" id="hs-fullscreen" onclick="selectHeroSize('fullscreen')" style="padding:10px 6px;justify-content:center;font-size:13px">Full</button>
          </div>
        </div>

        <div class="form-group">
          <label>Background Style</label>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
            <button class="btn-outline bg-style-opt active" id="bgs-clean" onclick="selectBgStyle('clean')" style="padding:10px 6px;justify-content:center;font-size:13px">Clean</button>
            <button class="btn-outline bg-style-opt" id="bgs-dots" onclick="selectBgStyle('dots')" style="padding:10px 6px;justify-content:center;font-size:13px">Dots</button>
            <button class="btn-outline bg-style-opt" id="bgs-grid" onclick="selectBgStyle('grid')" style="padding:10px 6px;justify-content:center;font-size:13px">Grid</button>
            <button class="btn-outline bg-style-opt" id="bgs-lines" onclick="selectBgStyle('lines')" style="padding:10px 6px;justify-content:center;font-size:13px">Lines</button>
          </div>
        </div>

        <div class="form-group">
          <label>Card Corner Radius</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <button class="btn-outline corner-opt" id="cr-sharp" onclick="selectCorner('sharp')" style="padding:10px;justify-content:center;font-size:13px">Sharp</button>
            <button class="btn-outline corner-opt active" id="cr-standard" onclick="selectCorner('standard')" style="padding:10px;justify-content:center;font-size:13px">Standard</button>
            <button class="btn-outline corner-opt" id="cr-rounded" onclick="selectCorner('rounded')" style="padding:10px;justify-content:center;font-size:13px">Rounded</button>
          </div>
        </div>

        <div class="form-group">
          <label>Section Heading (Optional)</label>
          <input type="text" id="st-section-heading" placeholder="e.g. Browse the Collection, Latest Releases...">
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px">Displays a styled heading above your book grid. Leave blank to hide.</p>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Announcement Banner</h3>
        <div class="form-group">
          <label>Banner Text</label>
          <input type="text" id="st-banner-text" placeholder="e.g. New collection just dropped!">
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px">Appears as a dismissable bar above the header. Leave blank to disable.</p>
        </div>
        <div style="display:flex;gap:16px">
          <div class="form-group" style="flex:1">
            <label>Banner Link (Optional)</label>
            <input type="text" id="st-banner-link" placeholder="https://...">
          </div>
          <div class="form-group" style="flex:0 0 auto">
            <label>Banner Color</label>
            <input type="color" id="st-banner-color" value="#c45d3e" style="width:64px;height:40px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px;background:var(--bg-elevated)">
          </div>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Hero Call-to-Action</h3>
        <div style="display:flex;gap:16px">
          <div class="form-group" style="flex:1">
            <label>CTA Button Text</label>
            <input type="text" id="st-cta-text" placeholder="e.g. Shop Now, View Collection">
          </div>
          <div class="form-group" style="flex:1">
            <label>CTA Button Link</label>
            <input type="text" id="st-cta-link" placeholder="https://...">
          </div>
        </div>

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Social Links</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="form-group">
            <label><i class="fab fa-instagram" style="color:#e1306c;margin-right:6px"></i>Instagram URL</label>
            <input type="text" id="st-social-instagram" placeholder="https://instagram.com/...">
          </div>
          <div class="form-group">
            <label><i class="fab fa-x-twitter" style="margin-right:6px"></i>X / Twitter URL</label>
            <input type="text" id="st-social-x" placeholder="https://x.com/...">
          </div>
          <div class="form-group">
            <label><i class="fab fa-youtube" style="color:#ff0000;margin-right:6px"></i>YouTube URL</label>
            <input type="text" id="st-social-youtube" placeholder="https://youtube.com/...">
          </div>
          <div class="form-group">
            <label><i class="fas fa-globe" style="margin-right:6px"></i>Website URL</label>
            <input type="text" id="st-social-website" placeholder="https://...">
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

        <h3 style="margin:30px 0 20px;border-bottom:1px solid var(--border);padding-bottom:10px">Legal &amp; Copyright</h3>
        <p style="font-size:13px;color:var(--text-muted);margin:-8px 0 20px">Write using <strong>Markdown</strong> &mdash; headings, bold, bullets and links are rendered on your store pages.</p>

        <div class="form-group">
          <label>About Us</label>
          <div class="md-editor">
            <div class="md-toolbar">
              <button type="button" onclick="mdCmd('st-about','bold')" title="Bold"><b>B</b></button>
              <button type="button" onclick="mdCmd('st-about','italic')" title="Italic"><i>I</i></button>
              <button type="button" onclick="mdCmd('st-about','h2')" title="Heading 2">H2</button>
              <button type="button" onclick="mdCmd('st-about','h3')" title="Heading 3">H3</button>
              <span class="md-sep"></span>
              <button type="button" onclick="mdCmd('st-about','ul')" title="Bullet list">&#8226; List</button>
              <button type="button" onclick="mdCmd('st-about','ol')" title="Ordered list">1. List</button>
              <button type="button" onclick="mdCmd('st-about','hr')" title="Divider">&mdash;</button>
              <button type="button" onclick="mdCmd('st-about','link')" title="Link">&#128279;</button>
              <span class="md-sep"></span>
              <button type="button" class="md-tab active" id="st-about-wb" onclick="mdSwitch('st-about','write')">Write</button>
              <button type="button" class="md-tab" id="st-about-pb" onclick="mdSwitch('st-about','preview')">Preview</button>
            </div>
            <div class="md-body">
              <textarea id="st-about" class="md-textarea" rows="8" placeholder="Tell your readers more about yourself or your collection..."></textarea>
              <div id="st-about-pv" class="md-preview" style="display:none"></div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Privacy Policy</label>
          <div class="md-editor">
            <div class="md-toolbar">
              <button type="button" onclick="mdCmd('st-privacy','bold')" title="Bold"><b>B</b></button>
              <button type="button" onclick="mdCmd('st-privacy','italic')" title="Italic"><i>I</i></button>
              <button type="button" onclick="mdCmd('st-privacy','h2')" title="Heading 2">H2</button>
              <button type="button" onclick="mdCmd('st-privacy','h3')" title="Heading 3">H3</button>
              <span class="md-sep"></span>
              <button type="button" onclick="mdCmd('st-privacy','ul')" title="Bullet list">&#8226; List</button>
              <button type="button" onclick="mdCmd('st-privacy','ol')" title="Ordered list">1. List</button>
              <button type="button" onclick="mdCmd('st-privacy','hr')" title="Divider">&mdash;</button>
              <button type="button" onclick="mdCmd('st-privacy','link')" title="Link">&#128279;</button>
              <span class="md-sep"></span>
              <button type="button" class="md-tab active" id="st-privacy-wb" onclick="mdSwitch('st-privacy','write')">Write</button>
              <button type="button" class="md-tab" id="st-privacy-pb" onclick="mdSwitch('st-privacy','preview')">Preview</button>
            </div>
            <div class="md-body">
              <textarea id="st-privacy" class="md-textarea" rows="8" placeholder="Write your Privacy Policy in Markdown..."></textarea>
              <div id="st-privacy-pv" class="md-preview" style="display:none"></div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Terms &amp; Conditions</label>
          <div class="md-editor">
            <div class="md-toolbar">
              <button type="button" onclick="mdCmd('st-terms','bold')" title="Bold"><b>B</b></button>
              <button type="button" onclick="mdCmd('st-terms','italic')" title="Italic"><i>I</i></button>
              <button type="button" onclick="mdCmd('st-terms','h2')" title="Heading 2">H2</button>
              <button type="button" onclick="mdCmd('st-terms','h3')" title="Heading 3">H3</button>
              <span class="md-sep"></span>
              <button type="button" onclick="mdCmd('st-terms','ul')" title="Bullet list">&#8226; List</button>
              <button type="button" onclick="mdCmd('st-terms','ol')" title="Ordered list">1. List</button>
              <button type="button" onclick="mdCmd('st-terms','hr')" title="Divider">&mdash;</button>
              <button type="button" onclick="mdCmd('st-terms','link')" title="Link">&#128279;</button>
              <span class="md-sep"></span>
              <button type="button" class="md-tab active" id="st-terms-wb" onclick="mdSwitch('st-terms','write')">Write</button>
              <button type="button" class="md-tab" id="st-terms-pb" onclick="mdSwitch('st-terms','preview')">Preview</button>
            </div>
            <div class="md-body">
              <textarea id="st-terms" class="md-textarea" rows="8" placeholder="Write your Terms &amp; Conditions in Markdown..."></textarea>
              <div id="st-terms-pv" class="md-preview" style="display:none"></div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Copyrights Information</label>
          <div class="md-editor">
            <div class="md-toolbar">
              <button type="button" onclick="mdCmd('st-copyright','bold')" title="Bold"><b>B</b></button>
              <button type="button" onclick="mdCmd('st-copyright','italic')" title="Italic"><i>I</i></button>
              <button type="button" onclick="mdCmd('st-copyright','h2')" title="Heading 2">H2</button>
              <button type="button" onclick="mdCmd('st-copyright','h3')" title="Heading 3">H3</button>
              <span class="md-sep"></span>
              <button type="button" onclick="mdCmd('st-copyright','ul')" title="Bullet list">&#8226; List</button>
              <button type="button" onclick="mdCmd('st-copyright','ol')" title="Ordered list">1. List</button>
              <button type="button" onclick="mdCmd('st-copyright','hr')" title="Divider">&mdash;</button>
              <button type="button" onclick="mdCmd('st-copyright','link')" title="Link">&#128279;</button>
              <span class="md-sep"></span>
              <button type="button" class="md-tab active" id="st-copyright-wb" onclick="mdSwitch('st-copyright','write')">Write</button>
              <button type="button" class="md-tab" id="st-copyright-pb" onclick="mdSwitch('st-copyright','preview')">Preview</button>
            </div>
            <div class="md-body">
              <textarea id="st-copyright" class="md-textarea" rows="6" placeholder="Write your Copyright or Footer details in Markdown..."></textarea>
              <div id="st-copyright-pv" class="md-preview" style="display:none"></div>
            </div>
          </div>
        </div>

        <div id="store-msg" class="msg"></div>
        <button onclick="saveStoreSettings()" class="btn" style="width:100%">Save Changes</button>
      </div><!-- /store-panel-inner -->
      </div><!-- /store-panel-settings -->
      </div><!-- /store-builder-body -->
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
