export const booksView = `
    <!-- Books View -->
    <div id="view-books" class="view-section">
      <div class="header">
        <h2>My Books</h2>
        <div style="font-size:14px;color:var(--text-muted)" id="limit-text"></div>
      </div>
      
      <div class="upload-zone" onclick="document.getElementById('file-input').click()">
        <i class="fas fa-cloud-upload-alt" style="font-size:48px;color:var(--accent-cyan);margin-bottom:16px"></i>
        <h3 style="margin-bottom:8px">Upload New Book</h3>
        <p style="color:var(--text-secondary);font-size:14px">Drag & drop or click to upload PDF/EPUB</p>
        <div id="upload-msg" class="msg" style="margin-top:16px;display:inline-block"></div>
      </div>
      <input type="file" id="file-input" accept=".pdf,.epub" style="display:none" onchange="uploadBook(event)">
      
      <div class="book-grid" id="book-grid"></div>
    </div>
   
   <!-- Edit Book Modal -->
<div id="edit-modal" class="modal">
  <div class="modal-content">
    <div class="close-btn" onclick="hideModal('edit-modal')">&times;</div>
    <h3 style="margin-bottom:24px">Edit Book</h3>
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
      <input type="text" id="edit-domain" placeholder="e.g. book.mybrand.com">
      <p style="font-size:12px;color:var(--text-muted);margin-top:4px">
        <b>Setup:</b> Point your domain's <b>CNAME</b> record to <code>flipread.flipread.workers.dev</code>.
      </p>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:12px">
      <button onclick="hideModal('edit-modal')" class="btn-outline" style="border:none">Cancel</button>
      <button onclick="saveBook()" class="btn">Save Changes</button>
    </div>
  </div>
</div>
`;
