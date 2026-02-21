export const docsView = `
    <!-- Docs View -->
    <div id="view-docs" class="view-section">
      <div class="header">
        <h2>Docs</h2>
        <div style="font-size:14px;color:var(--text-muted)" id="limit-text"></div>
      </div>

      <div class="books-tabs">
        <button class="books-tab active" id="tab-my" onclick="switchBooksTab('my')">My Docs</button>
        <button class="books-tab" id="tab-shared" onclick="switchBooksTab('shared')">Shared with Me</button>
      </div>

      <div id="my-books-content">
        <div class="upload-zone" onclick="document.getElementById('file-input').click()">
          <i class="fas fa-cloud-upload-alt" style="font-size:48px;color:var(--accent-cyan);margin-bottom:16px"></i>
          <h3 style="margin-bottom:8px">Upload New Doc</h3>
          <p style="color:var(--text-secondary);font-size:14px">Drag & drop or click to upload files</p>
          <p style="color:var(--text-muted);font-size:12px;margin-top:4px">PDF, EPUB, DOCX, PPTX, XLSX, CSV, TXT, MD, HTML, Images</p>
          <div id="upload-msg" class="msg" style="margin-top:16px;display:inline-block"></div>
        </div>
        <input type="file" id="file-input" accept=".pdf,.epub,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.rtf,.html,.htm,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp3,.wav,.ogg,.m4a,.mp4,.webm,.mov,.avi" style="display:none" onchange="uploadBook(event)" multiple>

        <div class="books-toolbar">
          <div class="books-search-wrap">
            <i class="fas fa-search"></i>
            <input type="text" class="books-search" id="books-search-input" placeholder="Search docs..." oninput="filterBooks()">
          </div>
          <select id="books-type-filter" onchange="filterBooks()" style="padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;cursor:pointer">
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="epub">EPUB</option>
            <option value="docx">DOCX</option>
            <option value="pptx">PPTX</option>
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
            <option value="md">Markdown</option>
            <option value="html">HTML</option>
            <option value="image">Image</option>
          </select>
          <select id="books-sort" onchange="filterBooks()" style="padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;cursor:pointer">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Views</option>
            <option value="az">A-Z</option>
          </select>
          <div class="view-toggle">
            <button id="bv-grid" class="active" onclick="setBookView('grid')" title="Grid View"><i class="fas fa-th"></i></button>
            <button id="bv-list" onclick="setBookView('list')" title="List View"><i class="fas fa-list"></i></button>
          </div>
        </div>

        <div class="book-grid" id="book-grid"></div>
      </div>

      <div id="shared-books-content" style="display:none">
        <div class="book-grid" id="shared-book-grid"></div>
      </div>
    </div>

   <!-- Edit Doc Modal -->
<div id="edit-modal" class="modal">
  <div class="modal-content">
    <div class="close-btn" onclick="hideModal('edit-modal')">&times;</div>
    <h3 style="margin-bottom:24px">Edit Doc</h3>
    <input type="hidden" id="edit-id">
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="edit-title">
    </div>
    <div class="form-group">
      <label>Visibility</label>
      <select id="edit-public">
        <option value="1">Public</option>
        <option value="0">Private</option>
      </select>
    </div>
    <div class="form-group">
      <label>Password (Pro+ only)</label>
      <input type="password" id="edit-pass" placeholder="Optional password">
    </div>
    <div class="form-group">
      <label>Custom Domain (Optional)</label>
      <input type="text" id="edit-domain" placeholder="e.g. docs.mybrand.com">
      <p style="font-size:12px;color:var(--text-muted);margin-top:4px">
        <b>Setup:</b> Point your domain's <b>CNAME</b> record to <code>flipread.adhirat.workers.dev</code>.
      </p>
    </div>
    <div class="form-group">
      <label>Author / Creator (Optional)</label>
      <input type="text" id="edit-author" placeholder="Author name">
    </div>
    <div class="form-group">
      <label>Description (Optional)</label>
      <textarea id="edit-description" placeholder="A brief description of this work" rows="3" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;resize:vertical;"></textarea>
    </div>
    <div class="form-group">
      <label>Published Date (Optional)</label>
      <input type="date" id="edit-published-date" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;">
    </div>

    <div id="edit-album-container" style="display:none; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <label style="margin:0;">Album Files</label>
        <button id="add-album-file-btn" class="btn-outline" style="padding: 4px 12px; font-size: 12px;" onclick="document.getElementById('album-file-input').click()">Add Files</button>
        <input type="file" id="album-file-input" style="display:none" multiple onchange="addAlbumFiles(event)">
      </div>
      <div id="album-files-list" style="display:flex; flex-direction:column; gap:4px; max-height:200px; overflow-y:auto;">
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;">
      <button onclick="hideModal('edit-modal')" class="btn-outline" style="border:none">Cancel</button>
      <button onclick="saveBook()" class="btn">Save Changes</button>
    </div>
  </div>
</div>

<!-- Share Doc Modal -->
<div id="share-modal" class="modal">
  <div class="modal-content">
    <div class="close-btn" onclick="hideModal('share-modal')">&times;</div>
    <h3 style="margin-bottom:24px"><i class="fas fa-share-alt" style="margin-right:8px"></i>Share Doc</h3>
    <input type="hidden" id="share-book-id">
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <input type="email" id="share-email-input" placeholder="Enter email address" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif">
      <button onclick="shareBook()" class="btn" style="padding:12px 20px">Share</button>
    </div>
    <div id="share-msg" class="msg"></div>
    <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin:16px 0 8px;text-transform:uppercase;letter-spacing:0.5px">Shared With</div>
    <div id="share-list" class="share-list"></div>
  </div>
</div>
`;
