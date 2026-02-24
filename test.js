
const API = '';
let currentUser = null;
let currentBooks = [];
let currentProducts = [];
let currentPromotions = [];
let currentOrders = [];
let globalCategories = [];
let authMode = 'login'; // login, register, forgot, reset
let billingInterval = 'yearly';

// Navigation
function switchView(view) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('nav-' + view).classList.add('active');
}

// Auth Logic
async function checkAuth() {
  try {
    const res = await fetch(API + '/api/auth/me', { credentials: 'include' });
    const data = await res.json();
    if (data.user) { currentUser = data.user; showDashboard(); }
    else { showAuth(); }
  } catch { showAuth(); }
}
function showAuth() {
  document.getElementById('auth-view').style.display = 'flex';
  document.getElementById('dash-view').style.display = 'none';
}
function showDashboard() {
  document.getElementById('auth-view').style.display = 'none';
  document.getElementById('dash-view').style.display = 'flex';
  updateUI();
  loadBooks();
  loadMembers();
  loadInquiries();
  loadCategories();
  loadProducts();
  loadPromotions();
  loadOrders();
  setBilling('yearly');
  // Init book view mode
  setBookView(bookViewMode);
}
function updateUI() {
  if(!currentUser) return;
  document.getElementById('user-name-disp').textContent = currentUser.name || 'User';
  document.getElementById('user-avatar-initials').textContent = (currentUser.name || currentUser.email).charAt(0).toUpperCase();
  document.getElementById('user-plan-disp').textContent = currentUser.plan;
  
  // Dashboard stats
  document.getElementById('d-plan').textContent = currentUser.plan.toUpperCase();
  // Store inputs
  document.getElementById('st-name').value = currentUser.store_name || '';
  document.getElementById('st-handle').value = currentUser.store_handle || '';
  const s = JSON.parse(currentUser.store_settings || '{}');
  
  // General
  document.getElementById('st-desc').value = s.description || '';
  document.getElementById('st-domain').value = s.custom_domain || '';

  // Hero
  document.getElementById('st-h-title').value = s.hero_title || '';
  document.getElementById('st-h-caption').value = s.hero_caption || '';
  document.getElementById('st-h-img').value = s.hero_image_url || '';

  // Design & Theme
  selectThemePreset(s.theme_preset || 'default', true);
  const accentVal = s.accent_color || '#c45d3e';
  document.getElementById('st-accent').value = accentVal;
  document.getElementById('st-accent-hex').value = accentVal;
  document.getElementById('st-font').value = s.font_choice || 'dm-sans';
  selectLayout(s.layout_style || 'grid', true);
  selectCard(s.card_style || '3d-book', true);

  // Show view count toggle
  const showViewsToggle = document.getElementById('st-show-views-toggle');
  if(showViewsToggle) showViewsToggle.classList.toggle('active', s.show_view_count !== false);

  // Private store toggle
  const privateToggle = document.getElementById('st-private-toggle');
  if(privateToggle) {
    privateToggle.classList.toggle('active', !!s.is_private);
    document.getElementById('st-private-info').style.display = s.is_private ? 'block' : 'none';
  }

  // Legal
  document.getElementById('st-about').value = s.about_us_content || '';
  document.getElementById('st-privacy').value = s.privacy_policy_content || '';
  document.getElementById('st-terms').value = s.terms_content || '';
  document.getElementById('st-copyright').value = s.copyright_content || s.contact_info_content || '';

  // New premium settings
  selectHeroSize(s.hero_size || 'standard', true);
  selectBgStyle(s.bg_style || 'clean', true);
  selectCorner(s.corner_radius || 'standard', true);
  const showDateToggle = document.getElementById('st-show-date-toggle');
  if(showDateToggle) showDateToggle.classList.toggle('active', !!s.show_date);
  document.getElementById('st-section-heading').value = s.section_heading || '';
  document.getElementById('st-banner-text').value = s.banner_text || '';
  document.getElementById('st-banner-link').value = s.banner_link || '';
  if(s.banner_color) document.getElementById('st-banner-color').value = s.banner_color;
  document.getElementById('st-cta-text').value = s.cta_text || '';
  document.getElementById('st-cta-link').value = s.cta_link || '';
  document.getElementById('st-social-instagram').value = s.social_instagram || '';
  document.getElementById('st-social-x').value = s.social_x || '';
  document.getElementById('st-social-youtube').value = s.social_youtube || '';
  document.getElementById('st-social-website').value = s.social_website || '';

  if(currentUser.store_logo_url) {
    document.getElementById('st-logo-preview').innerHTML = '<img src="'+esc(currentUser.store_logo_url)+'" style="width:100%;height:100%;object-fit:cover">';
  }
  document.getElementById('set-email').value = currentUser.email;
  document.getElementById('set-name-input').value = currentUser.name || '';
  
  const handle = currentUser.store_handle || (currentUser.name || 'user').toLowerCase().replace(/\s+/g, '-');
  document.getElementById('store-link-top').href = '/store/' + encodeURIComponent(handle);
  
  const limits = { free: '5 MB', basic: '10 MB', pro: '50 MB', business: '200 MB' };
  document.getElementById('limit-text').textContent = 'Upload Limit: ' + (limits[currentUser.plan] || '5 MB');

  // Highlight active theme button
  const savedTheme = localStorage.getItem('flipread-theme') || 'light';
  document.querySelectorAll('[id^="theme-btn-"]').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('theme-btn-' + savedTheme);
  if(activeBtn) activeBtn.classList.add('active');

  // Plan-specific Features UI
  const plan = currentUser.plan;
  
  // Branding (Pro+)
  const brandingSection = document.getElementById('branding-section');
  if(brandingSection) {
    if(['pro','business'].includes(plan)) {
      brandingSection.style.display = 'block';
      const brandingToggle = document.getElementById('branding-toggle');
      if(brandingToggle) brandingToggle.classList.toggle('active', s.branding_enabled !== false); // Default true
    } else {
      brandingSection.style.display = 'none';
    }
  }

  // API Access (Business)
  const apiSection = document.getElementById('api-section');
  if(apiSection) {
    if(plan === 'business') {
      apiSection.style.display = 'block';
      loadApiKeys();
    } else {
      apiSection.style.display = 'none';
    }
  }
  
  // Support Status
  const supportEl = document.getElementById('support-status');
  if(supportEl) {
    if(plan === 'business') {
        supportEl.innerHTML = '<span style="color:#f59e0b;font-weight:700"><i class="fas fa-star"></i> Priority Support</span> &mdash; You have access to our priority support channel.';
        supportEl.style.background = 'rgba(245,158,11,0.1)';
        supportEl.style.color = '#f59e0b';
    } else {
        supportEl.innerHTML = 'Standard Support Plan';
        supportEl.style.background = 'var(--bg-elevated)';
        supportEl.style.color = 'var(--text-secondary)';
    }
  }

  fetchActivity();
  initStorePreview();
}

async function saveProfile() {
  const name = document.getElementById('set-name-input').value;
  if(!name) return alert('Name is required');
  
  try {
    const res = await fetch(API + '/api/user/profile', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if(res.ok) {
      alert('Profile updated!');
      currentUser.name = name;
      updateUI();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to update profile');
    }
  } catch { alert('Network error'); }
}

function toggleAuthMode() {
  setAuthMode(authMode === 'register' ? 'login' : 'register');
}

function setAuthMode(mode, token) {
  authMode = mode;
  const isLogin = mode === 'login';
  const isReg = mode === 'register';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  const titleEl = document.getElementById('auth-title');
  const subEl = document.getElementById('auth-subtitle');
  const btnEl = document.getElementById('auth-btn');
  const fieldsEl = document.getElementById('auth-fields');
  const resetFieldsEl = document.getElementById('reset-fields');
  const nameEl = document.getElementById('auth-name');
  const passEl = document.getElementById('auth-pass');
  const footerEl = document.getElementById('auth-footer');
  const backEl = document.getElementById('back-to-login');
  const forgotLinkEl = document.getElementById('forgot-link-container');
  const msgEl = document.getElementById('auth-msg');

  msgEl.style.display = 'none';
  
  if (isLogin) {
    titleEl.textContent = 'Welcome Back';
    subEl.textContent = '';
    btnEl.textContent = 'Sign In';
    fieldsEl.classList.remove('hidden');
    resetFieldsEl.classList.add('hidden');
    nameEl.classList.add('hidden');
    passEl.classList.remove('hidden');
    forgotLinkEl.classList.remove('hidden');
    footerEl.classList.remove('hidden');
    backEl.classList.add('hidden');
    document.getElementById('auth-toggle-text').textContent = 'New here?';
    document.getElementById('auth-toggle-link').textContent = 'Create Account';
  } else if (isReg) {
    titleEl.textContent = 'Create Account';
    subEl.textContent = '';
    btnEl.textContent = 'Create Account';
    fieldsEl.classList.remove('hidden');
    resetFieldsEl.classList.add('hidden');
    nameEl.classList.remove('hidden');
    passEl.classList.remove('hidden');
    forgotLinkEl.classList.add('hidden');
    footerEl.classList.remove('hidden');
    backEl.classList.add('hidden');
    document.getElementById('auth-toggle-text').textContent = 'Already have an account?';
    document.getElementById('auth-toggle-link').textContent = 'Sign In';
  } else if (isForgot) {
    titleEl.textContent = 'Forgot Password';
    subEl.textContent = 'Enter your email to receive a reset link.';
    btnEl.textContent = 'Send Reset Link';
    fieldsEl.classList.remove('hidden');
    resetFieldsEl.classList.add('hidden');
    nameEl.classList.add('hidden');
    passEl.classList.add('hidden');
    forgotLinkEl.classList.add('hidden');
    footerEl.classList.add('hidden');
    backEl.classList.remove('hidden');
  } else if (isReset) {
    titleEl.textContent = 'Set New Password';
    subEl.textContent = 'Please enter your new password below.';
    btnEl.textContent = 'Update Password';
    fieldsEl.classList.add('hidden');
    resetFieldsEl.classList.remove('hidden');
    footerEl.classList.add('hidden');
    backEl.classList.remove('hidden');
    // Store token in global scope if needed, or just read from DOM/URL later
    if (token) window.resetToken = token;
  }
}

async function submitAuth() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-pass').value;
  const name = document.getElementById('auth-name').value;
  const newPass = document.getElementById('reset-pass').value;
  const msgEl = document.getElementById('auth-msg');
  
  let endpoint = '';
  let body = {};

  if (authMode === 'login') {
    endpoint = '/api/auth/login';
    body = { email, password };
  } else if (authMode === 'register') {
    endpoint = '/api/auth/register';
    body = { email, password, name };
  } else if (authMode === 'forgot') {
    endpoint = '/api/auth/forgot-password';
    body = { email };
  } else if (authMode === 'reset') {
    endpoint = '/api/auth/reset-password';
    body = { token: window.resetToken, password: newPass };
  }
  
  try {
    const btn = document.getElementById('auth-btn');
    const oldBtnText = btn.textContent;
    btn.textContent = 'Please wait...';
    btn.disabled = true;

    const res = await fetch(API + endpoint, { 
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    
    btn.textContent = oldBtnText;
    btn.disabled = false;

    if (data.user) { 
      currentUser = data.user; 
      showDashboard(); 
    } else if (data.success) {
      msgEl.textContent = data.message || 'Success'; 
      msgEl.className = 'msg success'; 
      msgEl.style.display = 'block';
      if (authMode === 'reset') {
        setTimeout(() => setAuthMode('login'), 3000);
      }
    } else { 
      msgEl.textContent = data.error || 'Failed'; 
      msgEl.className = 'msg error'; 
      msgEl.style.display = 'block'; 
    }
  } catch { 
    msgEl.textContent = 'Network error'; 
    msgEl.className = 'msg error'; 
    msgEl.style.display = 'block'; 
  }
}

async function logout() {
  await fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' });
  currentUser = null; showAuth();
}

// Book Logic
async function loadBooks() {
  try {
    const res = await fetch(API + '/api/docs', { credentials: 'include' });
    const data = await res.json();
    currentBooks = data.books || [];
    
    // Update stats
    document.getElementById('d-books').textContent = currentBooks.length;
    const views = currentBooks.reduce((s, b) => s + b.view_count, 0);
    document.getElementById('d-views').textContent = views;

    renderBooks();
  } catch(e) { console.error(e); }
}

function renderBooks() {
  const container = document.getElementById('book-grid');
  const books = getFilteredBooks();
  const canShare = currentUser && ['pro','business'].includes(currentUser.plan);

  const limits = { free: 3, basic: 50, pro: 500, business: 50000 };
  const maxBooks = limits[currentUser.plan] || 3;
  const isLimitReached = currentBooks.length >= maxBooks;

  const uploadZone = document.querySelector('.upload-zone');
  const fileInput = document.getElementById('file-input');
  const uploadMsg = document.getElementById('upload-msg');

  if (uploadZone && uploadMsg && fileInput) {
      if (isLimitReached) {
          uploadZone.onclick = null;
          uploadZone.style.opacity = '0.5';
          uploadZone.style.cursor = 'not-allowed';
          uploadMsg.innerHTML = `Upload limit reached. Please delete files or upgrade your plan.`;
          uploadMsg.className = 'msg error';
          uploadMsg.style.display = 'inline-block';
          fileInput.disabled = true;
      } else {
          uploadZone.onclick = () => fileInput.click();
          uploadZone.style.opacity = '1';
          uploadZone.style.cursor = 'pointer';
          uploadMsg.style.display = 'none';
          fileInput.disabled = false;
      }
  }

  if (books.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px">' + (currentBooks.length === 0 ? 'No books published yet.' : 'No matching books.') + '</div>';
    container.className = 'book-grid';
    return;
  }

  if(bookViewMode === 'list') {
    container.className = 'book-list';
    container.innerHTML = books.map(b => {
      const url = location.origin + '/read/' + b.slug;
      return `<div class="book-list-item">
        <div class="book-thumb">
          ${b.cover_url ? `<img src="${esc(b.cover_url)}">` : '<i class="fas fa-book" style="font-size:18px;opacity:0.2"></i>'}
        </div>
        <div class="book-meta">
          <div class="book-title" title="${esc(b.title)}">${esc(b.title)}</div>
          <div style="font-size:12px;color:var(--text-muted)">${b.type.toUpperCase()} &middot; ${formatSize(b.file_size_bytes)} &middot; <i class="fas fa-eye"></i> ${b.view_count}</div>
        </div>
        <div class="book-actions" style="margin-top:0;flex-shrink:0">
          <button onclick="editBook('${b.id}')"><i class="fas fa-cog"></i></button>
          ${canShare ? `<button onclick="openShareModal('${b.id}')"><i class="fas fa-share-alt"></i></button>` : ''}
          <button onclick="window.open('${esc(url)}','_blank')"><i class="fas fa-external-link-alt"></i></button>
          <button onclick="copyText('${esc(url)}',this)"><i class="fas fa-link"></i></button>
          <button onclick="deleteBook('${b.id}')" style="color:var(--accent-magenta)"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    }).join('');
  } else {
    container.className = 'book-grid';
    container.innerHTML = books.map(b => {
      const url = location.origin + '/read/' + b.slug;
      return `<div class="book-item">
        <div class="book-cover">
          ${b.cover_url ? `<img src="${esc(b.cover_url)}">` : '<i class="fas fa-book" style="font-size:40px;opacity:0.2"></i>'}
        </div>
        <div class="book-content">
          <div class="book-title" title="${esc(b.title)}">${esc(b.title)}</div>
          <div style="font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between">
            <span>${formatSize(b.file_size_bytes)}</span>
            <span><i class="fas fa-eye"></i> ${b.view_count}</span>
          </div>
          <div class="book-actions">
            <button onclick="editBook('${b.id}')"><i class="fas fa-cog"></i></button>
            ${canShare ? `<button onclick="openShareModal('${b.id}')"><i class="fas fa-share-alt"></i></button>` : ''}
            <button onclick="window.open('${esc(url)}','_blank')"><i class="fas fa-external-link-alt"></i></button>
            <button onclick="copyText('${esc(url)}',this)"><i class="fas fa-link"></i></button>
            <button onclick="deleteBook('${b.id}')" style="color:var(--accent-magenta)"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`;
    }).join('');
  }
}

async function handleFileUpload(files) {
  if (!files || files.length === 0) return;
  const msgEl = document.getElementById('upload-msg');
  msgEl.textContent = 'Preparing...'; msgEl.className = 'msg success'; msgEl.style.display = 'inline-block';

  const fd = new FormData();
  let firstFile = files[0];
  for(let i=0; i < files.length; i++){
    fd.append('file', files[i]);
  }
  const title = files.length > 1 ? 'Untitled Album' : firstFile.name.replace(/.[^.]+$/, '');
  fd.append('title', title);

  try {
    // Attempt to extract cover for supported types from the first file
    const arrayBuffer = await firstFile.arrayBuffer();
    let coverBlob = null;
    const isPdf = firstFile.type === 'application/pdf' || firstFile.name.endsWith('.pdf');
    const isEpub = firstFile.type === 'application/epub+zip' || firstFile.name.endsWith('.epub');
    const isImage = firstFile.type.startsWith('image/');

    if (isPdf) {
      msgEl.textContent = 'Extracting cover...';
      try {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.6 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        coverBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      } catch (e) { console.error('PDF Cover Extract Failed', e); }
    } else if (isEpub) {
      msgEl.textContent = 'Extracting cover...';
      try {
        const book = ePub(arrayBuffer);
        const coverUrl = await book.coverUrl();
        if (coverUrl) {
          coverBlob = await fetch(coverUrl).then(r => r.blob());
        }
      } catch (e) { console.error('EPUB Cover Extract Failed', e); }
    } else if (isImage) {
      // Use the image itself as cover (create a thumbnail)
      try {
        const blob = new Blob([arrayBuffer], { type: firstFile.type });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        coverBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        URL.revokeObjectURL(url);
      } catch (e) { console.error('Image Cover Extract Failed', e); }
    }

    if (coverBlob) {
      fd.append('cover', coverBlob, 'cover.jpg');
    }

    msgEl.textContent = 'Uploading...';
    const res = await fetch(API + '/api/docs/upload', {
      method: 'POST', credentials: 'include', body: fd
    });
    const data = await res.json();
    if (data.book) {
      msgEl.textContent = 'Uploaded!'; 
      setTimeout(() => msgEl.style.display = 'none', 3000);
      loadBooks();
    } else {
      msgEl.textContent = data.error || 'Failed'; msgEl.className = 'msg error';
    }
  } catch(e) { 
    console.error(e);
    msgEl.textContent = 'Error'; msgEl.className = 'msg error'; 
  }
}

async function uploadBook(e) {
  const files = e.type === 'drop' ? e.dataTransfer.files : e.target.files;
  if (!files || files.length === 0) return;
  await handleFileUpload(files);
  if(e.target.value) e.target.value = '';
}

// Drag & Drop
document.addEventListener('DOMContentLoaded', () => {
    const zone = document.querySelector('.upload-zone');
    if(zone) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.style.borderColor = 'var(--accent-cyan)';
            zone.style.background = 'rgba(6, 182, 212, 0.1)';
        });
        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            zone.style.borderColor = 'var(--border)';
            zone.style.background = 'var(--bg-elevated)';
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.style.borderColor = 'var(--border)';
            zone.style.background = 'var(--bg-elevated)';
            uploadBook(e);
        });
    }
});

async function deleteBook(id) {
  if(!confirm('Delete this book?')) return;
  await fetch(API + '/api/docs/' + id, { method: 'DELETE', credentials: 'include' });
  loadBooks();
}

function editBook(id) {
  const b = currentBooks.find(x => x.id === id);
  if (!b) return;
  document.getElementById('edit-id').value = b.id;
  document.getElementById('edit-title').value = b.title;
  document.getElementById('edit-public').value = b.is_public ? "1" : "0";
  document.getElementById('edit-pass').value = b.password || '';
  document.getElementById('edit-domain').value = b.custom_domain || '';

  const settings = typeof b.settings === 'string' ? JSON.parse(b.settings) : (b.settings || {});
  const authorEl = document.getElementById('edit-author');
  const descEl = document.getElementById('edit-description');
  const dateEl = document.getElementById('edit-published-date');
  if(authorEl) authorEl.value = settings.author || '';
  if(descEl) descEl.value = settings.description || '';
  if(dateEl) dateEl.value = settings.published_date || '';

  const albumContainer = document.getElementById('edit-album-container');
  if (albumContainer) {
    if (['image', 'audio', 'video'].includes(b.type)) {
      albumContainer.style.display = 'block';
      renderAlbumFiles(id, settings.album_files || []);
      const albumInput = document.getElementById('album-file-input');
      if (albumInput) {
          if (b.type === 'image') albumInput.accept = ".jpg,.jpeg,.png,.gif,.webp,.svg";
          else if (b.type === 'audio') albumInput.accept = ".mp3,.wav,.ogg,.m4a";
          else if (b.type === 'video') albumInput.accept = ".mp4,.webm,.mov,.avi";
      }
    } else {
      albumContainer.style.display = 'none';
    }
  }

  const editCategories = document.getElementById('edit-doc-categories');
  if (editCategories) {
    const activeCats = settings.categories || [];
    if (globalCategories.length === 0) {
      editCategories.innerHTML = '<span class="text-muted" style="font-size:13px">No global categories available.</span>';
    } else {
      editCategories.innerHTML = globalCategories.map(c => {
        const isChecked = activeCats.includes(c.name) ? 'checked' : '';
        return `<label style="display:flex; align-items:center; gap:4px; font-size:13px; background:var(--bg-secondary); padding:4px 8px; border-radius:12px; cursor:pointer;">
          <input type="checkbox" class="edit-cat-cb" value="${esc(c.name)}" ${isChecked}>
          ${esc(c.name)}
        </label>`;
      }).join('');
    }
  }

  showModal('edit-modal');
}

window.renderAlbumFiles = (bookId, albumFiles) => {
   const list = document.getElementById('album-files-list');
   if(!list) return;
   if (!albumFiles || albumFiles.length === 0) {
       list.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:8px 0;">No files in album.</div>';
       return;
   }
   list.innerHTML = albumFiles.map((f, i) => `
     <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid var(--border);">
       <span style="font-size:12px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;max-width:70%;" title="${esc(f.name)}">${i+1}. ${esc(f.name)}</span>
       <button onclick="removeAlbumFile('${bookId}', ${i})" style="color:var(--accent-magenta);background:none;border:none;cursor:pointer;" title="Remove File"><i class="fas fa-trash"></i></button>
     </div>
   `).join('');
};

window.removeAlbumFile = async (bookId, index) => {
   if (!confirm('Remove this file from the album?')) return;
   try {
       const res = await fetch(API + '/api/docs/' + bookId + '/album/' + index, { method: 'DELETE', credentials: 'include' });
       if(res.ok) {
           const data = await res.json();
           renderAlbumFiles(bookId, data.album_files);
           loadBooks(); // refresh background grid
       } else {
           const err = await res.json();
           alert(err.error || 'Failed to remove file');
       }
   } catch (e) { console.error(e); }
};

window.addAlbumFiles = async (event) => {
   const files = event.target.files;
   if (!files || files.length === 0) return;
   
   const bookId = document.getElementById('edit-id').value;
   const fd = new FormData();
   for(let i=0; i<files.length; i++) fd.append('file', files[i]);
   
   const btn = document.getElementById('add-album-file-btn');
   const oldText = btn.innerHTML;
   btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
   btn.disabled = true;
   
   try {
       const res = await fetch(API + '/api/docs/' + bookId + '/album', { method: 'POST', body: fd, credentials: 'include' });
       if (res.ok) {
           const data = await res.json();
           renderAlbumFiles(bookId, data.album_files);
           loadBooks(); // refresh background grid
       } else {
           const err = await res.json();
           alert(err.error || 'Failed to add files');
       }
   } catch(e) { console.error(e); }
   
   btn.innerHTML = oldText;
   btn.disabled = false;
   event.target.value = '';
};


async function saveBook() {
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const is_public = document.getElementById('edit-public').value === "1";
  const password = document.getElementById('edit-pass').value || null;
  const custom_domain = document.getElementById('edit-domain').value || null;
  
  const b = currentBooks.find(x => x.id === id);
  let settings = typeof b?.settings === 'string' ? JSON.parse(b.settings) : (b?.settings || {});
  
  const authorEl = document.getElementById('edit-author');
  const descEl = document.getElementById('edit-description');
  const dateEl = document.getElementById('edit-published-date');
  if(authorEl) settings.author = authorEl.value;
  if(descEl) settings.description = descEl.value;
  if(dateEl) settings.published_date = dateEl.value;
  
  const catBoxes = document.querySelectorAll('.edit-cat-cb:checked');
  if (catBoxes) {
    settings.categories = Array.from(catBoxes).map(cb => cb.value);
  }

  await fetch(API + '/api/docs/' + id, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, is_public, password, custom_domain, settings })
  });
  hideModal('edit-modal');
  loadBooks();
}

// Store & Settings
var _storePreviewTimer = null;
function initStorePreview() {
  if(!currentUser) return;
  var handle = currentUser.store_handle || (currentUser.name || 'user').toLowerCase().replace(/[^a-z0-9-]+/g,'-');
  var storeUrl = '/store/' + encodeURIComponent(handle);

  // Update URL bar
  var urlText = document.getElementById('store-preview-url-text');
  if(urlText) urlText.textContent = window.location.origin + storeUrl;

  // Update live link
  var liveLink = document.getElementById('store-live-link');
  if(liveLink) liveLink.href = storeUrl;

  // Load preview initially
  refreshStorePreview();

  // Watch all form inputs in the settings panel for changes and debounce reload
  var panel = document.getElementById('view-store');
  if(!panel) return;
  panel.querySelectorAll('input,textarea,select').forEach(function(el) {
    el.addEventListener('input', function() {
      clearTimeout(_storePreviewTimer);
      _storePreviewTimer = setTimeout(function() {
        // Only refresh after user saves - just show a nudge instead
        var badge = document.getElementById('preview-unsaved-badge');
        if(badge) badge.style.display = 'flex';
      }, 400);
    });
    el.addEventListener('change', function() {
      clearTimeout(_storePreviewTimer);
      _storePreviewTimer = setTimeout(function() {
        var badge = document.getElementById('preview-unsaved-badge');
        if(badge) badge.style.display = 'flex';
      }, 400);
    });
  });
}

function refreshStorePreview() {
  if(!currentUser) return;
  var handle = currentUser.store_handle || (currentUser.name || 'user').toLowerCase().replace(/[^a-z0-9-]+/g,'-');
  var iframe = document.getElementById('store-preview-iframe');
  if(!iframe) return;
  var newSrc = '/store/' + encodeURIComponent(handle) + '?_t=' + Date.now();
  iframe.src = newSrc;
  // Hide unsaved badge
  var badge = document.getElementById('preview-unsaved-badge');
  if(badge) badge.style.display = 'none';
}

async function saveStoreSettings() {
  const store_name = document.getElementById('st-name').value;
  const store_handle = document.getElementById('st-handle').value;
  
  const store_settings = {
    description: document.getElementById('st-desc').value,
    custom_domain: document.getElementById('st-domain').value,
    hero_title: document.getElementById('st-h-title').value,
    hero_caption: document.getElementById('st-h-caption').value,
    hero_image_url: document.getElementById('st-h-img').value,
    theme_preset: document.querySelector('.theme-preset-card.active')?.dataset.theme || 'default',
    accent_color: document.getElementById('st-accent').value,
    font_choice: document.getElementById('st-font').value,
    layout_style: document.querySelector('.layout-opt.active')?.id.replace('lo-','') || 'grid',
    card_style: document.querySelector('.card-opt.active')?.id.replace('co-','') || '3d-book',
    show_view_count: document.getElementById('st-show-views-toggle')?.classList.contains('active') ?? true,
    is_private: document.getElementById('st-private-toggle')?.classList.contains('active') ?? false,
    branding_enabled: document.getElementById('branding-toggle')?.classList.contains('active') ?? true,
    // New premium settings
    show_date: document.getElementById('st-show-date-toggle')?.classList.contains('active') ?? false,
    hero_size: document.querySelector('.hero-size-opt.active')?.id.replace('hs-','') || 'standard',
    bg_style: document.querySelector('.bg-style-opt.active')?.id.replace('bgs-','') || 'clean',
    corner_radius: document.querySelector('.corner-opt.active')?.id.replace('cr-','') || 'standard',
    section_heading: document.getElementById('st-section-heading')?.value || '',
    banner_text: document.getElementById('st-banner-text')?.value || '',
    banner_link: document.getElementById('st-banner-link')?.value || '',
    banner_color: document.getElementById('st-banner-color')?.value || '',
    cta_text: document.getElementById('st-cta-text')?.value || '',
    cta_link: document.getElementById('st-cta-link')?.value || '',
    social_instagram: document.getElementById('st-social-instagram')?.value || '',
    social_x: document.getElementById('st-social-x')?.value || '',
    social_youtube: document.getElementById('st-social-youtube')?.value || '',
    social_website: document.getElementById('st-social-website')?.value || '',
    about_us_content: document.getElementById('st-about').value,
    privacy_policy_content: document.getElementById('st-privacy').value,
    terms_content: document.getElementById('st-terms').value,
    copyright_content: document.getElementById('st-copyright').value
  };

  const res = await fetch(API + '/api/user/store', {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_name, store_handle, store_settings })
  });
  if(res.ok) {
    const m = document.getElementById('store-msg');
    m.textContent = 'Saved!'; m.className = 'msg success'; m.style.display = 'block';
    setTimeout(() => m.style.display = 'none', 2000);
    currentUser.store_name = store_name;
    currentUser.store_handle = store_handle;
    currentUser.store_settings = JSON.stringify(store_settings);
    // Refresh UI so the header store-link reflects the new handle immediately
    updateUI();
    // Refresh the live preview iframe
    setTimeout(refreshStorePreview, 300);
  }
}

// Image Cropping & Uploads
let cropper;
let cropTarget = 'logo'; // 'logo' or 'hero'

async function uploadLogo(e) {
  cropTarget = 'logo';
  initCropModal(e, 1);
}

async function uploadHero(e) {
  cropTarget = 'hero';
  initCropModal(e, 16/9); // Standard widescreen hero aspect ratio
}

function initCropModal(e, aspectRatio) {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = document.getElementById('crop-img');
    const titleText = document.querySelector('#crop-modal h3');
    if(titleText) titleText.textContent = cropTarget === 'logo' ? 'Crop Logo' : 'Crop Hero Image';
    
    img.src = ev.target.result;
    document.getElementById('crop-modal').style.display = 'flex';
    img.style.display = 'block';

    if(cropper) cropper.destroy();
    cropper = new Cropper(img, {
      aspectRatio: aspectRatio,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    });
  };
  reader.readAsDataURL(file);
  e.target.value = ''; // Reset input
}

function cancelCrop() {
  document.getElementById('crop-modal').style.display = 'none';
  if(cropper) { cropper.destroy(); cropper = null; }
}

async function applyCrop() {
  if(!cropper) return;
  
  const width = cropTarget === 'logo' ? 512 : 1600;
  const height = cropTarget === 'logo' ? 512 : 900;
  
  cropper.getCroppedCanvas({ width, height }).toBlob(async (blob) => {
    if(!blob) return;
    
    // Upload logic
    const fd = new FormData();
    const endpoint = cropTarget === 'logo' ? '/api/user/store/logo' : '/api/user/store/hero';
    const fieldName = cropTarget === 'logo' ? 'logo' : 'hero';
    fd.append(fieldName, blob, fieldName + '.jpg');
    
    const btn = document.querySelector('#crop-modal .btn');
    const oldText = btn.textContent;
    btn.textContent = 'Uploading...';
    btn.disabled = true;

    try {
      const res = await fetch(API + endpoint, {
        method: 'POST', credentials: 'include', body: fd
      });
      const data = await res.json();
      
      if(cropTarget === 'logo' && data.logo_url) {
        document.getElementById('st-logo-preview').innerHTML = '<img src="'+esc(data.logo_url)+'" style="width:100%;height:100%;object-fit:cover">';
        currentUser.store_logo_url = data.logo_url;
        cancelCrop();
      } else if(cropTarget === 'hero' && data.hero_url) {
        document.getElementById('st-h-img').value = data.hero_url;
        // Trigger preview refresh
        if(typeof refreshStorePreview === 'function') refreshStorePreview();
        cancelCrop();
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch(e) {
      alert('Network error or server failed');
    }
    
    btn.textContent = oldText;
    btn.disabled = false;
  }, 'image/jpeg', 0.9);
}

function setBilling(interval) {
  billingInterval = interval;
  const isYearly = interval === 'yearly';
  
  // Update toggle UI
  const toggleSwitch = document.querySelector('.billing-toggle .toggle-switch');
  const labelMonthly = document.getElementById('bill-monthly');
  const labelYearly = document.getElementById('bill-yearly');
  
  if (toggleSwitch) {
    if (isYearly) toggleSwitch.classList.add('active');
    else toggleSwitch.classList.remove('active');
  }
  
  if (labelMonthly) {
    if (!isYearly) labelMonthly.classList.add('active');
    else labelMonthly.classList.remove('active');
  }
  
  if (labelYearly) {
    if (isYearly) labelYearly.classList.add('active');
    else labelYearly.classList.remove('active');
  }

  // Update prices
  const prices = {
    basic: isYearly ? '2.08' : '2.50',
    pro: isYearly ? '7.50' : '9.00',
    business: isYearly ? '24.17' : '29.00'
  };
  
  const billedText = {
    basic: isYearly ? 'Billed $25 yearly' : 'Billed monthly',
    pro: isYearly ? 'Billed $90 yearly' : 'Billed monthly',
    business: isYearly ? 'Billed $290 yearly' : 'Billed monthly'
  };

  if(document.getElementById('price-basic')) document.getElementById('price-basic').textContent = prices.basic;
  if(document.getElementById('price-pro')) document.getElementById('price-pro').textContent = prices.pro;
  if(document.getElementById('price-business')) document.getElementById('price-business').textContent = prices.business;
  
  if(document.getElementById('billed-basic')) document.getElementById('billed-basic').textContent = billedText.basic;
  if(document.getElementById('billed-pro')) document.getElementById('billed-pro').textContent = billedText.pro;
  if(document.getElementById('billed-business')) document.getElementById('billed-business').textContent = billedText.business;
}

function toggleBilling() {
  setBilling(billingInterval === 'yearly' ? 'monthly' : 'yearly');
}

async function checkout(plan) {
  try {
    const res = await fetch(API + '/api/billing/checkout', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, interval: billingInterval })
    });
    const data = await res.json();
    if(data.url) window.location.href = data.url;
    else alert('Error: ' + (data.error || 'Unknown'));
  } catch { alert('Network error'); }
}

// Utils
function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }
function formatSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function copyText(t, btn) {
  navigator.clipboard.writeText(t);
  const old = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i>';
  setTimeout(() => btn.innerHTML = old, 1500);
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('flipread-theme', t);
  updateThemeIcons(t);
  
  // Update settings buttons
  document.querySelectorAll('[id^="theme-btn-"]').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('theme-btn-' + t);
  if(activeBtn) activeBtn.classList.add('active');
}
function toggleDashTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}
function updateThemeIcons(theme) {
  const isDark = theme === 'dark';
  const icon = isDark ? 'fa-sun' : 'fa-moon';
  const mobileIcon = document.getElementById('dash-theme-icon');
  const sidebarIcon = document.getElementById('dash-theme-icon-sidebar');
  if(mobileIcon) {
    mobileIcon.className = 'fas ' + icon;
  }
  if(sidebarIcon) {
    sidebarIcon.className = 'fas ' + icon;
  }
}
// Store Customization Helpers
function selectThemePreset(preset, silent) {
  document.querySelectorAll('.theme-preset-card').forEach(c => c.classList.remove('active'));
  const el = document.querySelector('.theme-preset-card[data-theme="'+preset+'"]');
  if(el) el.classList.add('active');
}
function selectLayout(layout, silent) {
  document.querySelectorAll('.layout-opt').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('lo-'+layout);
  if(el) el.classList.add('active');
}
function selectCard(card, silent) {
  document.querySelectorAll('.card-opt').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('co-'+card);
  if(el) el.classList.add('active');
}
function setAccent(hex) {
  document.getElementById('st-accent').value = hex;
  document.getElementById('st-accent-hex').value = hex;
}
function syncAccentColor(hex) {
  if(/^#[0-9a-fA-F]{6}$/.test(hex)) {
    document.getElementById('st-accent').value = hex;
  }
}
document.addEventListener('change', function(e) {
  if(e.target && e.target.id === 'st-accent') {
    document.getElementById('st-accent-hex').value = e.target.value;
  }
});
function toggleStoreOption(opt) {
  if(opt === 'show-views') {
    document.getElementById('st-show-views-toggle').classList.toggle('active');
  } else if(opt === 'show-date') {
    document.getElementById('st-show-date-toggle').classList.toggle('active');
  } else if(opt === 'private') {
    const t = document.getElementById('st-private-toggle');
    t.classList.toggle('active');
    document.getElementById('st-private-info').style.display = t.classList.contains('active') ? 'block' : 'none';
  }
}

function selectHeroSize(size, silent) {
  document.querySelectorAll('.hero-size-opt').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('hs-' + size);
  if(el) el.classList.add('active');
}
function selectBgStyle(style, silent) {
  document.querySelectorAll('.bg-style-opt').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('bgs-' + style);
  if(el) el.classList.add('active');
}
function selectCorner(radius, silent) {
  document.querySelectorAll('.corner-opt').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('cr-' + radius);
  if(el) el.classList.add('active');
}

// ====== MARKDOWN EDITOR HELPERS ======
function mdCmd(id, cmd) {
  var ta = document.getElementById(id);
  if(!ta) return;
  var start = ta.selectionStart, end = ta.selectionEnd;
  var sel = ta.value.slice(start, end);
  var before = ta.value.slice(0, start), after = ta.value.slice(end);
  var insert = '';
  if(cmd === 'bold')   insert = '**' + (sel || 'bold text') + '**';
  if(cmd === 'italic') insert = '*' + (sel || 'italic text') + '*';
  if(cmd === 'h2')     insert = '\n## ' + (sel || 'Heading');
  if(cmd === 'h3')     insert = '\n### ' + (sel || 'Heading');
  if(cmd === 'ul')     insert = '\n- ' + (sel || 'List item');
  if(cmd === 'ol')     insert = '\n1. ' + (sel || 'List item');
  if(cmd === 'hr')     insert = '\n\n---\n';
  if(cmd === 'link') {
    var url = prompt('Enter URL:', 'https://');
    if(!url) return;
    insert = '[' + (sel || 'link text') + '](' + url + ')';
  }
  ta.value = before + insert + after;
  var pos = before.length + insert.length;
  ta.setSelectionRange(pos, pos);
  ta.focus();
}

function mdSwitch(id, mode) {
  const ta = document.getElementById(id);
  const pv = document.getElementById(id + '-pv');
  const wb = document.getElementById(id + '-wb');
  const pb = document.getElementById(id + '-pb');
  if(!ta || !pv) return;
  if(mode === 'preview') {
    pv.innerHTML = mdRender(ta.value);
    ta.style.display = 'none'; pv.style.display = 'block';
    if(wb) wb.classList.remove('active');
    if(pb) pb.classList.add('active');
  } else {
    ta.style.display = ''; pv.style.display = 'none';
    if(wb) wb.classList.add('active');
    if(pb) pb.classList.remove('active');
  }
}

function mdRender(md) {
  if(!md) return '<p style="color:var(--text-muted);font-style:italic">Nothing to preview yet.</p>';
  var lines = md.split('\n');
  var out = [];
  var inUl = false, inOl = false;
  function flush() { if(inUl){out.push('</ul>');inUl=false;} if(inOl){out.push('</ol>');inOl=false;} }
  function inl(s) {
    return s
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/\x60([^\x60]+)\x60/g,'<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>');
  }
  for(var ri=0;ri<lines.length;ri++) {
    var l = lines[ri].replace(/\s+$/,'');
    if(/^#### /.test(l)){flush();out.push('<h4>'+inl(l.slice(5))+'</h4>');continue;}
    if(/^### /.test(l)) {flush();out.push('<h3>'+inl(l.slice(4))+'</h3>');continue;}
    if(/^## /.test(l))  {flush();out.push('<h2>'+inl(l.slice(3))+'</h2>');continue;}
    if(/^# /.test(l))   {flush();out.push('<h1>'+inl(l.slice(2))+'</h1>');continue;}
    if(/^---+$/.test(l)||/^\*\*\*[ -]*$/.test(l)){flush();out.push('<hr>');continue;}
    if(/^> /.test(l))   {flush();out.push('<blockquote><p>'+inl(l.slice(2))+'</p></blockquote>');continue;}
    if(/^[*-] /.test(l)) {
      if(inOl){out.push('</ol>');inOl=false;}
      if(!inUl){out.push('<ul>');inUl=true;}
      out.push('<li>'+inl(l.slice(2))+'</li>'); continue;
    }
    if(/^\d+\. /.test(l)) {
      if(inUl){out.push('</ul>');inUl=false;}
      if(!inOl){out.push('<ol>');inOl=true;}
      out.push('<li>'+inl(l.replace(/^\d+\. /,''))+'</li>'); continue;
    }
    flush();
    if(l === ''){out.push('<br>');continue;}
    out.push('<p>'+inl(l)+'</p>');
  }
  flush();
  return out.join('\n');
}

// Members Management
let currentMembers = [];
let memberFilter = 'all';
let selectedMembers = new Set();

async function loadMembers() {
  try {
    const isArchived = memberFilter === 'archived';
    const res = await fetch(API + '/api/members?archived=' + isArchived, { credentials: 'include' });
    const data = await res.json();
    currentMembers = data.members || [];
    selectedMembers.clear();
    renderMembers();
    updateMembersStats();
  } catch(e) { console.error(e); }
}

function updateMembersStats() {
    const total = currentMembers.length;
    const active = currentMembers.filter(m => m.is_active && !m.is_archived).length;
    const el = document.getElementById('members-stats');
    if(el) el.innerHTML = '<span style="color:var(--text-secondary)">Total: <b>'+total+'</b></span> &middot; <span style="color:#10b981">Active: <b>'+active+'</b></span> &middot; <span style="color:#ef4444">Inactive: <b>'+(total-active)+'</b></span>';
}

function setMemberFilter(filter) {
    memberFilter = filter;
    document.querySelectorAll('.member-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('member-tab-' + filter)?.classList.add('active');
    
    // Toggle bulk restore option
    const restoreOpt = document.getElementById('bulk-restore-opt');
    if (restoreOpt) restoreOpt.style.display = filter === 'archived' ? 'block' : 'none';
    
    loadMembers();
}

function renderMembers() {
  const container = document.getElementById('members-list');
  if(!container) return;
  
  const search = (document.getElementById('members-search')?.value || '').toLowerCase();
  const sort = document.getElementById('member-sort')?.value || 'newest';
  
  let filtered = currentMembers.filter(m => {
    const matchesSearch = !search || m.email.toLowerCase().includes(search) || m.name.toLowerCase().includes(search);
    if (!matchesSearch) return false;
    
    if (memberFilter === 'active') return m.is_active && !m.is_archived;
    if (memberFilter === 'unverified') return !m.is_verified;
    // memberFilter 'all' and 'archived' are handled by the API call in loadMembers
    return true;
  });

  // Sort
  if (sort === 'name') filtered.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
  else if (sort === 'email') filtered.sort((a,b) => a.email.localeCompare(b.email));
  else if (sort === 'oldest') filtered.sort((a,b) => a.created_at.localeCompare(b.created_at));
  else filtered.sort((a,b) => b.created_at.localeCompare(a.created_at));

  updateBulkBar();

  if(filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">' + (currentMembers.length === 0 ? 'No members in this view.' : 'No matching members.') + '</div>';
    return;
  }
  
  const allSelected = filtered.length > 0 && filtered.every(m => selectedMembers.has(m.id));

  container.innerHTML = `<table class="members-table">
    <thead>
      <tr>
        <th style="width:40px"><input type="checkbox" onclick="toggleSelectAllMembers(event)" ${allSelected ? 'checked' : ''}></th>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
        <th>Access Key</th>
        <th style="text-align:right">Actions</th>
      </tr>
    </thead>
    <tbody>` + filtered.map(m => {
    const v = m.is_verified ? '<span style="color:#10b981;font-size:10px;display:flex;align-items:center;gap:4px;margin-top:2px"><i class="fas fa-check-circle"></i> Verified</span>' : 
                               '<span style="color:#f59e0b;font-size:10px;display:flex;align-items:center;gap:4px;margin-top:2px"><i class="fas fa-clock"></i> Unverified <button onclick="resendVerificationAdmin(\''+m.id+'\')" title="Resend Link" style="border:none;background:none;padding:0;cursor:pointer;color:var(--accent-cyan);margin-left:4px;text-decoration:underline"><i class="fas fa-paper-plane"></i> Resend</button></span>';
    
    const statusText = m.is_archived ? 'Archived' : (m.is_active ? 'Active' : 'Inactive');
    const statusClass = m.is_archived ? 'inactive' : (m.is_active ? 'active' : 'inactive');

    return `<tr>
      <td><input type="checkbox" onclick="toggleSelectMember('${m.id}')" ${selectedMembers.has(m.id) ? 'checked' : ''}></td>
      <td><b>${esc(m.name || '-')}</b></td>
      <td>${esc(m.email)}${v}</td>
      <td><span class="member-status ${statusClass}" onclick="toggleMemberStatus('${m.id}')"><i class="fas fa-circle" style="font-size:6px"></i> ${statusText}</span></td>
      <td><span class="access-key-text" title="${esc(m.access_key)}">${esc(m.access_key.substring(0,8))}...</span> <button onclick="copyText('${esc(m.access_key)}',this)" style="border:none;background:none;cursor:pointer;color:var(--text-muted);padding:4px"><i class="fas fa-copy"></i></button></td>
      <td style="text-align:right;white-space:nowrap">
        <button onclick="editMember('${m.id}')" class="btn-icon"><i class="fas fa-edit"></i></button> 
        ${m.is_archived ? 
            `<button onclick="archiveMember('${m.id}', false)" class="btn-icon" title="Restore"><i class="fas fa-undo"></i></button>` : 
            `<button onclick="archiveMember('${m.id}', true)" class="btn-icon" title="Archive"><i class="fas fa-archive"></i></button>`
        }
        <button onclick="deleteMember('${m.id}')" class="btn-icon"><i class="fas fa-trash" style="color:var(--accent-magenta)"></i></button>
      </td>
    </tr>`;
  }).join('') + '</tbody></table>';
}

function toggleSelectMember(id) {
    if (selectedMembers.has(id)) selectedMembers.delete(id);
    else selectedMembers.add(id);
    renderMembers();
}

function toggleSelectAllMembers(e) {
    const checked = e.target.checked;
    if (checked) {
        currentMembers.forEach(m => selectedMembers.add(m.id));
    } else {
        selectedMembers.clear();
    }
    renderMembers();
}

function updateBulkBar() {
    const bar = document.getElementById('bulk-actions-bar');
    const count = document.getElementById('selection-count');
    if (!bar || !count) return;
    
    if (selectedMembers.size > 0) {
        bar.style.display = 'flex';
        count.textContent = selectedMembers.size + ' selected';
    } else {
        bar.style.display = 'none';
    }
}

async function applyBulkAction() {
    const action = document.getElementById('bulk-action-select').value;
    if (!action) return;
    if (!confirm('Apply "' + action + '" to ' + selectedMembers.size + ' members?')) return;
    
    try {
        const res = await fetch(API + '/api/members/bulk', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedMembers), action })
        });
        if (res.ok) {
            selectedMembers.clear();
            loadMembers();
        } else {
            alert('Action failed');
        }
    } catch { alert('Network error'); }
}

async function resendVerificationAdmin(id) {
    try {
        const res = await fetch(API + '/api/members/' + id + '/resend-verification', {
            method: 'POST', credentials: 'include'
        });
        if (res.ok) alert('Verification link sent!');
        else alert('Failed to send link');
    } catch { alert('Network error'); }
}

async function archiveMember(id, archive = true) {
    try {
        await fetch(API + '/api/members/' + id, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_archived: archive })
        });
        loadMembers();
    } catch { alert('Network error'); }
}

async function addMember() {
  const email = document.getElementById('add-member-email').value.trim();
  const name = document.getElementById('add-member-name').value.trim();
  if(!email) return alert('Email is required');

  const msgEl = document.getElementById('member-msg');
  try {
    const res = await fetch(API + '/api/members', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const data = await res.json();
    if(data.member) {
      document.getElementById('add-member-email').value = '';
      document.getElementById('add-member-name').value = '';
      msgEl.textContent = 'Member added! Access key: ' + data.member.access_key;
      msgEl.className = 'msg success'; msgEl.style.display = 'block';
      setTimeout(() => msgEl.style.display = 'none', 5000);
      loadMembers();
    } else {
      msgEl.textContent = data.error || 'Failed'; msgEl.className = 'msg error'; msgEl.style.display = 'block';
    }
  } catch { msgEl.textContent = 'Network error'; msgEl.className = 'msg error'; msgEl.style.display = 'block'; }
}

async function toggleMemberStatus(id) {
  const m = currentMembers.find(x => x.id === id);
  if(!m) return;
  await fetch(API + '/api/members/' + id, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: !m.is_active })
  });
  loadMembers();
}

function editMember(id) {
  const m = currentMembers.find(x => x.id === id);
  if(!m) return;
  document.getElementById('edit-member-id').value = m.id;
  document.getElementById('edit-member-name').value = m.name;
  document.getElementById('edit-member-email').value = m.email;
  document.getElementById('edit-member-active').checked = !!m.is_active;
  showModal('edit-member-modal');
}

async function saveMember() {
  const id = document.getElementById('edit-member-id').value;
  const name = document.getElementById('edit-member-name').value;
  const is_active = document.getElementById('edit-member-active').checked;
  await fetch(API + '/api/members/' + id, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, is_active })
  });
  hideModal('edit-member-modal');
  loadMembers();
}

async function deleteMember(id) {
  if(!confirm('Remove this member?')) return;
  await fetch(API + '/api/members/' + id, { method: 'DELETE', credentials: 'include' });
  loadMembers();
}

// Book Sharing
let currentShares = [];
let sharedWithMe = [];

async function openShareModal(bookId) {
  document.getElementById('share-book-id').value = bookId;
  document.getElementById('share-email-input').value = '';
  showModal('share-modal');
  // Load existing shares
  try {
    const res = await fetch(API + '/api/docs/' + bookId + '/shares', { credentials: 'include' });
    const data = await res.json();
    currentShares = data.shares || [];
    renderShareList();
  } catch { currentShares = []; renderShareList(); }
}

function renderShareList() {
  const el = document.getElementById('share-list');
  if(!el) return;
  if(currentShares.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Not shared with anyone yet.</div>';
    return;
  }
  el.innerHTML = currentShares.map(s => {
    return '<div class="share-item"><span style="font-size:14px">'+esc(s.shared_with_email)+'</span><button onclick="revokeShare(\''+s.id+'\',\''+document.getElementById('share-book-id').value+'\')"><i class="fas fa-times" style="color:var(--accent-magenta)"></i></button></div>';
  }).join('');
}

async function shareBook() {
  const bookId = document.getElementById('share-book-id').value;
  const email = document.getElementById('share-email-input').value.trim();
  if(!email) return;
  const msgEl = document.getElementById('share-msg');
  try {
    const res = await fetch(API + '/api/docs/' + bookId + '/share', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if(data.share) {
      document.getElementById('share-email-input').value = '';
      currentShares.push(data.share);
      renderShareList();
      msgEl.textContent = 'Shared!'; msgEl.className = 'msg success'; msgEl.style.display = 'block';
      setTimeout(() => msgEl.style.display = 'none', 2000);
    } else {
      msgEl.textContent = data.error || 'Failed'; msgEl.className = 'msg error'; msgEl.style.display = 'block';
    }
  } catch { msgEl.textContent = 'Network error'; msgEl.className = 'msg error'; msgEl.style.display = 'block'; }
}

async function revokeShare(shareId, bookId) {
  await fetch(API + '/api/books/shares/' + shareId, { method: 'DELETE', credentials: 'include' });
  currentShares = currentShares.filter(s => s.id !== shareId);
  renderShareList();
}

// Shared With Me
let booksTab = 'my';

function switchBooksTab(tab) {
  booksTab = tab;
  document.querySelectorAll('.books-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  if(tab === 'shared') {
    loadSharedWithMe();
    document.getElementById('my-books-content').style.display = 'none';
    document.getElementById('shared-books-content').style.display = 'block';
  } else {
    document.getElementById('my-books-content').style.display = 'block';
    document.getElementById('shared-books-content').style.display = 'none';
  }
}

async function loadSharedWithMe() {
  try {
    const res = await fetch(API + '/api/books/shared-with-me', { credentials: 'include' });
    const data = await res.json();
    sharedWithMe = data.books || [];
    renderSharedBooks();
  } catch(e) { console.error(e); }
}

function renderSharedBooks() {
  const grid = document.getElementById('shared-book-grid');
  if(!grid) return;
  if(sharedWithMe.length === 0) {
    grid.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px">No books shared with you.</div>';
    return;
  }
  grid.innerHTML = sharedWithMe.map(b => {
    const url = location.origin + '/read/' + b.slug;
    return '<div class="book-item"><div class="book-cover">' + (b.cover_url ? '<img src="'+esc(b.cover_url)+'">' : '<i class="fas fa-book" style="font-size:40px;opacity:0.2"></i>') + '</div><div class="book-content"><div class="book-title" title="'+esc(b.title)+'">'+esc(b.title)+'</div><div style="font-size:12px;color:var(--text-muted)">Shared by '+esc(b.owner_name || 'Unknown')+'</div><div class="book-actions"><button onclick="window.open(\''+esc(url)+'\',\'_blank\')"><i class="fas fa-external-link-alt"></i></button></div></div></div>';
  }).join('');
}

// Books View Toggle & Search/Filter
let bookViewMode = localStorage.getItem('flipread-book-view') || 'grid';
let bookSearchTerm = '';
let bookTypeFilter = '';
let bookSort = 'newest';

function setBookView(mode) {
  bookViewMode = mode;
  localStorage.setItem('flipread-book-view', mode);
  document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('bv-' + mode);
  if(btn) btn.classList.add('active');
  renderBooks();
}

function filterBooks() {
  bookSearchTerm = (document.getElementById('books-search-input')?.value || '').toLowerCase();
  bookTypeFilter = document.getElementById('books-type-filter')?.value || '';
  bookSort = document.getElementById('books-sort')?.value || 'newest';
  renderBooks();
}

function getFilteredBooks() {
  let books = [...currentBooks];
  if(bookSearchTerm) books = books.filter(b => b.title.toLowerCase().includes(bookSearchTerm));
  if(bookTypeFilter) books = books.filter(b => b.type === bookTypeFilter);
  if(bookSort === 'oldest') books.sort((a,b) => a.created_at.localeCompare(b.created_at));
  else if(bookSort === 'views') books.sort((a,b) => b.view_count - a.view_count);
  else if(bookSort === 'az') books.sort((a,b) => a.title.localeCompare(b.title));
  else books.sort((a,b) => b.created_at.localeCompare(a.created_at));
  return books;
}

// Init
const savedTheme = localStorage.getItem('flipread-theme') || 'light';
setTheme(savedTheme);
const params = new URLSearchParams(window.location.search);
if (params.get('mode') === 'register') {
  setAuthMode('register');
} else if (params.get('mode') === 'reset' && params.get('token')) {
  setAuthMode('reset', params.get('token'));
}
checkAuth();


// Categories Logic
async function loadCategories() {
  try {
    const res = await fetch(API + '/api/categories');
    globalCategories = await res.json();
    renderCategories();
  } catch (e) {
    console.error('Failed to load categories', e);
  }
}

function renderCategories() {
  const list = document.getElementById('categories-list');
  const parentSelect = document.getElementById('new-category-parent');
  
  if (parentSelect) {
    const parentOptions = globalCategories.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    parentSelect.innerHTML = '<option value="">None (Top-Level Category)</option>' + parentOptions;
  }
  
  if(!list) return;
  if(globalCategories.length === 0) {
    list.innerHTML = '<span class="text-muted">No categories created yet.</span>';
    return;
  }
  list.innerHTML = globalCategories.map(c => {
    let nameToRender = esc(c.name);
    if (c.parent_name) {
      nameToRender = '<span style="color:var(--text-muted);font-size:11px">' + esc(c.parent_name) + ' &rsaquo; </span>' + nameToRender;
    }
    return `<span style="background:var(--bg-elevated);border:1px solid var(--border);padding:6px 14px;border-radius:20px;font-size:13px;display:inline-block">${nameToRender}</span>`
  }).join('');
}

async function createCategory() {
  const name = document.getElementById('new-category-name').value;
  const parent_id = document.getElementById('new-category-parent')?.value || null;
  const imageFiles = document.getElementById('new-category-image')?.files;
  const msg = document.getElementById('add-category-msg');
  const btn = document.getElementById('submit-category-btn');
  const oldText = btn.textContent;
  
  if(!name) { msg.style.display = 'block'; msg.className='msg error'; msg.textContent='Name required.'; return; }
  
  btn.textContent = 'Creating...'; btn.disabled = true; msg.style.display = 'none';
  try {
    const fd = new FormData();
    fd.append('name', name);
    if (parent_id) fd.append('parent_id', parent_id);
    if (imageFiles && imageFiles.length > 0) {
      fd.append('image', imageFiles[0]);
    }
    
    const res = await fetch(API + '/api/categories', {
      method: 'POST', credentials: 'include', body: fd
    });
    const data = await res.json();
    if(res.ok) {
      hideModal('add-category-modal');
      document.getElementById('new-category-name').value = '';
      const parentSel = document.getElementById('new-category-parent');
      if (parentSel) parentSel.value = '';
      const imgInput = document.getElementById('new-category-image');
      if (imgInput) imgInput.value = '';
      await loadCategories();
    } else {
      msg.style.display = 'block'; msg.className='msg error'; msg.textContent = data.error || 'Failed to create category.';
    }
  } catch(e) {
    msg.style.display = 'block'; msg.className='msg error'; msg.textContent = 'Network error.';
  }
  btn.textContent = oldText; btn.disabled = false;
}

// ---------------- PRODUCTS LOGIC ----------------
async function loadProducts() {
  try {
    const res = await fetch(API + '/api/products', {credentials: 'include'});
    currentProducts = await res.json();
    renderProducts();
  } catch(e) { console.error('Failed to load products', e); }
}

function renderProducts() {
  const container = document.getElementById('products-list-container');
  if(!container) return;
  if(currentProducts.length === 0) {
    container.innerHTML = '<span class="text-muted">No products created yet.</span>';
    return;
  }
  container.innerHTML = currentProducts.map(p => {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; border:1px solid var(--border); border-radius:12px; background:var(--bg-elevated);">
        <div>
          <h4 style="margin:0; margin-bottom:4px;">${esc(p.title)} <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary);">${p.status}</span></h4>
          <span style="font-size:13px; color:var(--text-secondary);">$${p.selling_price} | ${p.product_type}</span>
        </div>
        <button onclick="editProduct('${p.id}')" class="btn-outline">Edit</button>
      </div>`
  }).join('');
}

function showProductModal() {
  document.getElementById('edit-product-id').value = '';
  document.getElementById('edit-product-title').value = '';
  document.getElementById('edit-product-desc').value = '';
  document.getElementById('edit-product-type').value = 'digital';
  document.getElementById('edit-product-status').value = 'active';
  document.getElementById('edit-product-actual-price').value = '';
  document.getElementById('edit-product-selling-price').value = '';
  document.getElementById('edit-product-discount').value = '';
  document.getElementById('edit-product-weight').value = '';
  document.getElementById('edit-product-weight-unit').value = 'kg';
  document.getElementById('edit-product-expiry').value = '';
  
  const catsContainer = document.getElementById('edit-product-categories');
  if(catsContainer) {
    catsContainer.innerHTML = globalCategories.map(c => `<label style="display:flex; align-items:center; gap:4px; font-size:13px; background:var(--bg-secondary); padding:4px 8px; border-radius:12px; cursor:pointer;"><input type="checkbox" class="edit-prod-cat-cb" value="${esc(c.id)}"> ${esc(c.name)}</label>`).join('');
  }
  
  document.getElementById('product-modal-title').textContent = 'New Product';
  showModal('edit-product-modal');
}

function editProduct(id) {
  const p = currentProducts.find(x => x.id === id);
  if(!p) return;
  
  document.getElementById('edit-product-id').value = p.id;
  document.getElementById('edit-product-title').value = p.title || '';
  document.getElementById('edit-product-desc').value = p.description || '';
  document.getElementById('edit-product-type').value = p.product_type || 'digital';
  document.getElementById('edit-product-status').value = p.status || 'active';
  document.getElementById('edit-product-actual-price').value = p.actual_price || '';
  document.getElementById('edit-product-selling-price').value = p.selling_price || '';
  document.getElementById('edit-product-discount').value = p.discount_percentage || '';
  document.getElementById('edit-product-weight').value = p.weight || '';
  document.getElementById('edit-product-weight-unit').value = p.weight_unit || 'kg';
  document.getElementById('edit-product-expiry').value = p.expiry_date || '';
  
  const prodCats = p.categories ? JSON.parse(p.categories) : [];
  const catsContainer = document.getElementById('edit-product-categories');
  if(catsContainer) {
    catsContainer.innerHTML = globalCategories.map(c => `<label style="display:flex; align-items:center; gap:4px; font-size:13px; background:var(--bg-secondary); padding:4px 8px; border-radius:12px; cursor:pointer;"><input type="checkbox" class="edit-prod-cat-cb" value="${esc(c.id)}" ${prodCats.includes(c.id) ? 'checked': ''}> ${esc(c.name)}</label>`).join('');
  }

  document.getElementById('product-modal-title').textContent = 'Edit Product';
  showModal('edit-product-modal');
}

document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'edit-product-type') {
    const physDiv = document.getElementById('product-physical-fields');
    if (e.target.value === 'physical') {
      physDiv.style.display = 'block';
    } else {
      physDiv.style.display = 'none';
      document.getElementById('edit-product-weight').value = '';
    }
  }
});

async function saveProduct() {
  const id = document.getElementById('edit-product-id').value;
  const title = document.getElementById('edit-product-title').value;
  const description = document.getElementById('edit-product-desc').value;
  const product_type = document.getElementById('edit-product-type').value;
  const status = document.getElementById('edit-product-status').value;
  const actual_price = document.getElementById('edit-product-actual-price').value;
  const selling_price = document.getElementById('edit-product-selling-price').value;
  const discount_percentage = document.getElementById('edit-product-discount').value;
  const weight = document.getElementById('edit-product-weight').value;
  const weight_unit = document.getElementById('edit-product-weight-unit').value;
  const expiry_date = document.getElementById('edit-product-expiry').value;
  
  const catBoxes = document.querySelectorAll('.edit-prod-cat-cb:checked');
  const categories = Array.from(catBoxes).map(cb => cb.value);
  
  const btn = document.getElementById('submit-product-btn');
  const msg = document.getElementById('edit-product-msg');
  const oldText = btn.textContent;
  
  if(!title) { msg.style.display='block'; msg.className='msg error'; msg.textContent='Title is required.'; return; }
  
  let payload = { id, title, description, product_type, status, actual_price, selling_price, discount_percentage, weight, weight_unit, expiry_date, categories };
  
  btn.textContent = 'Saving...'; btn.disabled = true; msg.style.display = 'none';
  try {
    const res = await fetch(API + '/api/products', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(res.ok) {
      hideModal('edit-product-modal');
      await loadProducts();
    } else {
      msg.style.display = 'block'; msg.className='msg error'; msg.textContent = data.error || 'Failed to save product.';
    }
  } catch(e) { msg.style.display = 'block'; msg.className='msg error'; msg.textContent = 'Network error.'; }
  btn.textContent = oldText; btn.disabled = false;
}

// ---------------- PROMOTIONS LOGIC ----------------
async function loadPromotions() {
  try {
    const res = await fetch(API + '/api/promotions', {credentials: 'include'});
    currentPromotions = await res.json();
    renderPromotions();
  } catch(e) { console.error('Failed to load promos', e); }
}

function renderPromotions() {
  const container = document.getElementById('promos-list-container');
  if(!container) return;
  if(currentPromotions.length === 0) {
    container.innerHTML = '<span class="text-muted">No promotions created yet.</span>';
    return;
  }
  container.innerHTML = currentPromotions.map(p => {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; border:1px solid var(--border); border-radius:12px; background:var(--bg-elevated);">
        <div>
          <h4 style="margin:0; margin-bottom:4px;">${esc(p.promocode)} <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary);">${p.status}</span></h4>
          <span style="font-size:13px; color:var(--text-secondary);">${p.discount_type === 'percentage' ? p.discount_value + '%' : '$' + p.discount_value} OFF</span>
        </div>
        <button onclick="editPromo('${p.id}')" class="btn-outline">Edit</button>
      </div>`
  }).join('');
}

function showPromoModal() {
  document.getElementById('edit-promo-id').value = '';
  document.getElementById('edit-promo-code').value = '';
  document.getElementById('edit-promo-desc').value = '';
  document.getElementById('edit-promo-type').value = 'percentage';
  document.getElementById('edit-promo-value').value = '';
  document.getElementById('edit-promo-min-qty').value = '';
  document.getElementById('edit-promo-min-price').value = '';
  document.getElementById('edit-promo-target').value = 'all';
  document.getElementById('edit-promo-status').value = 'active';
  document.getElementById('edit-promo-expiry').value = '';
  
  const catsContainer = document.getElementById('edit-promo-categories');
  if(catsContainer) {
    catsContainer.innerHTML = globalCategories.map(c => `<label style="display:flex; align-items:center; gap:4px; font-size:13px; background:var(--bg-secondary); padding:4px 8px; border-radius:12px; cursor:pointer;"><input type="checkbox" class="edit-promo-cat-cb" value="${esc(c.id)}"> ${esc(c.name)}</label>`).join('');
  }
  
  document.getElementById('promo-modal-title').textContent = 'New Promotion';
  showModal('edit-promo-modal');
}

function editPromo(id) {
  const p = currentPromotions.find(x => x.id === id);
  if(!p) return;
  document.getElementById('edit-promo-id').value = p.id;
  document.getElementById('edit-promo-code').value = p.promocode || '';
  document.getElementById('edit-promo-desc').value = p.description || '';
  document.getElementById('edit-promo-type').value = p.discount_type || 'percentage';
  document.getElementById('edit-promo-value').value = p.discount_value || '';
  document.getElementById('edit-promo-min-qty').value = p.min_quantity || '';
  document.getElementById('edit-promo-min-price').value = p.min_price || '';
  document.getElementById('edit-promo-target').value = p.target_users || 'all';
  document.getElementById('edit-promo-status').value = p.status || 'active';
  document.getElementById('edit-promo-expiry').value = p.expiry_date || '';
  
  const promoCats = p.categories ? JSON.parse(p.categories) : [];
  const catsContainer = document.getElementById('edit-promo-categories');
  if(catsContainer) {
    catsContainer.innerHTML = globalCategories.map(c => `<label style="display:flex; align-items:center; gap:4px; font-size:13px; background:var(--bg-secondary); padding:4px 8px; border-radius:12px; cursor:pointer;"><input type="checkbox" class="edit-promo-cat-cb" value="${esc(c.id)}" ${promoCats.includes(c.id) ? 'checked': ''}> ${esc(c.name)}</label>`).join('');
  }

  document.getElementById('promo-modal-title').textContent = 'Edit Promotion';
  showModal('edit-promo-modal');
}

async function savePromo() {
  const id = document.getElementById('edit-promo-id').value;
  const promocode = document.getElementById('edit-promo-code').value;
  const description = document.getElementById('edit-promo-desc').value;
  const discount_type = document.getElementById('edit-promo-type').value;
  const discount_value = document.getElementById('edit-promo-value').value;
  const min_quantity = document.getElementById('edit-promo-min-qty').value;
  const min_price = document.getElementById('edit-promo-min-price').value;
  const target_users = document.getElementById('edit-promo-target').value;
  const status = document.getElementById('edit-promo-status').value;
  const expiry_date = document.getElementById('edit-promo-expiry').value;
  
  const catBoxes = document.querySelectorAll('.edit-promo-cat-cb:checked');
  const categories = Array.from(catBoxes).map(cb => cb.value);
  
  const btn = document.getElementById('submit-promo-btn');
  const msg = document.getElementById('edit-promo-msg');
  const oldText = btn.textContent;
  
  if(!promocode || !discount_value) { msg.style.display='block'; msg.className='msg error'; msg.textContent='Promocode and value are required.'; return; }
  
  let payload = { id, promocode, description, discount_type, discount_value, min_quantity, min_price, target_users, status, expiry_date, categories };
  
  btn.textContent = 'Saving...'; btn.disabled = true; msg.style.display = 'none';
  try {
    const res = await fetch(API + '/api/promotions', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(res.ok) {
      hideModal('edit-promo-modal');
      await loadPromotions();
    } else {
      msg.style.display = 'block'; msg.className='msg error'; msg.textContent = data.error || 'Failed to save promotion.';
    }
  } catch(e) { msg.style.display = 'block'; msg.className='msg error'; msg.textContent = 'Network error.'; }
  btn.textContent = oldText; btn.disabled = false;
}

// ---------------- ORDERS LOGIC ----------------
async function loadOrders() {
  try {
    const res = await fetch(API + '/api/orders', {credentials: 'include'});
    currentOrders = await res.json();
    renderOrders();
  } catch(e) { console.error('Failed to load orders', e); }
}

function renderOrders() {
  const container = document.getElementById('orders-list-container');
  if(!container) return;
  if(currentOrders.length === 0) {
    container.innerHTML = '<span class="text-muted">No orders received yet.</span>';
    return;
  }
  container.innerHTML = currentOrders.map(o => {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; border:1px solid var(--border); border-radius:12px; background:var(--bg-elevated);">
        <div>
          <h4 style="margin:0; margin-bottom:4px;">#${o.id.split('-')[0]} <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary);">${o.status}</span></h4>
          <span style="font-size:13px; color:var(--text-secondary);">$${o.total_amount} | ${o.member_email || 'Guest'}</span>
        </div>
        <button onclick="editOrder('${o.id}')" class="btn-outline">View/Edit</button>
      </div>`
  }).join('');
}

function editOrder(id) {
  const o = currentOrders.find(x => x.id === id);
  if(!o) return;
  document.getElementById('edit-order-id').value = o.id;
  document.getElementById('edit-order-id-display').textContent = 'ID: ' + o.id;
  document.getElementById('edit-order-status').value = o.status || 'pending';
  document.getElementById('edit-order-payment-status').value = o.payment_status || 'unpaid';
  document.getElementById('edit-order-delivery-details').value = o.delivery_details ? JSON.parse(o.delivery_details).tracking || '' : '';
  document.getElementById('edit-order-comments').value = o.comments || '';
  
  // Render readonly info
  let info = `Email: ${o.member_email || 'N/A'}<br>Name: ${o.member_name || 'N/A'}<br>Amount Paid: $${o.total_amount} (Discount: $${o.discount_amount})`;
  if(o.address_details) {
      try {
          const adr = JSON.parse(o.address_details);
          info += `<br>Address: ${adr.street}, ${adr.city} ${adr.state}`;
      } catch(e) {}
  }
  document.getElementById('edit-order-customer-info').innerHTML = info;
  
  // order items would be fetched in a real scenario or passed down in json
  document.getElementById('edit-order-items-info').innerHTML = `<em>Items fetch not fully implemented in current list query mapping</em>`;

  showModal('edit-order-modal');
}

async function saveOrder() {
  const id = document.getElementById('edit-order-id').value;
  const status = document.getElementById('edit-order-status').value;
  const payment_status = document.getElementById('edit-order-payment-status').value;
  const tracking = document.getElementById('edit-order-delivery-details').value;
  const comments = document.getElementById('edit-order-comments').value;
  
  const btn = document.getElementById('submit-order-btn');
  const msg = document.getElementById('edit-order-msg');
  const oldText = btn.textContent;
  
  let payload = { id, status, payment_status, comments, delivery_details: { tracking } };
  
  btn.textContent = 'Updating...'; btn.disabled = true; msg.style.display = 'none';
  try {
    const res = await fetch(API + '/api/orders', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(res.ok) {
      hideModal('edit-order-modal');
      await loadOrders();
    } else {
      msg.style.display = 'block'; msg.className='msg error'; msg.textContent = data.error || 'Failed to update order.';
    }
  } catch(e) { msg.style.display = 'block'; msg.className='msg error'; msg.textContent = 'Network error.'; }
  btn.textContent = oldText; btn.disabled = false;
}

// Account Deletion
function confirmDeleteAccount() {
  document.getElementById('delete-confirm-input').value = '';
  showModal('delete-modal');
}

async function executeDeleteAccount() {
  const input = document.getElementById('delete-confirm-input').value;
  if(input !== 'DELETE') {
    alert('Please type "DELETE" to confirm.');
    return;
  }
  
  const btn = document.querySelector('#delete-modal .btn');
  const oldText = btn.textContent;
  btn.textContent = 'Deleting...';
  btn.disabled = true;

  try {
    const res = await fetch(API + '/api/user', {
      method: 'DELETE', credentials: 'include'
    });
    const data = await res.json();
    if(data.success) {
      window.location.href = '/'; 
    } else {
      alert('Delete failed: ' + (data.error || 'Unknown error'));
      btn.textContent = oldText;
      btn.disabled = false;
    }
  } catch(e) {
    console.error(e);
    alert('Network error. Please try again.');
    btn.textContent = oldText;
    btn.disabled = false;
  }
}

// Mobile Sidebar
function toggleSidebar() {
  const sb = document.getElementById('main-sidebar');
  const ov = document.querySelector('.mobile-overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('active');
}
function closeSidebar() {
  document.getElementById('main-sidebar').classList.remove('open');
  document.querySelector('.mobile-overlay').classList.remove('active');
}
function toggleCollapse() {
  const sb = document.getElementById('main-sidebar');
  const isCollapsed = sb.classList.toggle('collapsed');
  localStorage.setItem('flipread-sidebar-collapsed', isCollapsed);
}

// Init collapse state
if(localStorage.getItem('flipread-sidebar-collapsed') === 'true' && window.innerWidth > 768) {
  document.getElementById('main-sidebar').classList.add('collapsed');
}


function viewMyStore() {
  if (currentUser) {
    const handle = currentUser.store_handle || (currentUser.name || 'user').toLowerCase().replace(/\s+/g, '-');
    window.open('/store/' + encodeURIComponent(handle), '_blank');
  } else {
    alert('Please log in.');
  }
}

// API Keys
async function loadApiKeys() {
  try {
    const res = await fetch(API + '/api/user/keys', { credentials: 'include' });
    if(res.ok) {
        const data = await res.json();
        renderApiKeys(data.keys || []);
    }
  } catch(e) { console.error(e); }
}

function renderApiKeys(keys) {
    const list = document.getElementById('api-keys-list');
    if(!list) return;
    if(keys.length === 0) {
        list.innerHTML = '<div style="font-size:13px;color:var(--text-muted);text-align:center;padding:10px;border:1px dashed var(--border);border-radius:8px">No API keys generated.</div>';
        return;
    }
    list.innerHTML = keys.map(k => `<div style="background:var(--bg-elevated);border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div style="font-family:monospace;font-size:13px;color:var(--text-primary)">${k.key_value}</div>
            <button onclick="deleteApiKey('${k.id}')" style="border:none;background:none;color:var(--text-muted);cursor:pointer;padding:4px"><i class="fas fa-trash"></i></button>
        </div>`).join('');
}

async function generateApiKey() {
    try {
        const res = await fetch(API + '/api/user/keys', { method: 'POST', credentials: 'include' });
        if(res.ok) loadApiKeys();
        else alert('Failed to generate key');
    } catch { alert('Network error'); }
}

async function deleteApiKey(id) {
    if(!confirm('Delete this API key? Apps using it will stop working.')) return;
    try {
        await fetch(API + '/api/user/keys/' + id, { method: 'DELETE', credentials: 'include' });
        loadApiKeys();
    } catch { alert('Network error'); }
}

function toggleBranding() {
   const t = document.getElementById('branding-toggle');
   if(t) {
       t.classList.toggle('active');
       saveBrandingPreference();
   }
}

async function saveBrandingPreference() {
    const is_enabled = document.getElementById('branding-toggle').classList.contains('active');
    
    let s = JSON.parse(currentUser.store_settings || '{}');
    s.branding_enabled = is_enabled;
    
    try {
        const res = await fetch(API + '/api/user/store', {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ store_settings: s })
        });
        
        if(res.ok) {
            currentUser.store_settings = JSON.stringify(s);
        }
    } catch(e) { console.error('Failed to save branding', e); }
}

async function fetchActivity() {
    const list = document.getElementById('activity-list');
    if(!list) return;
    
    try {
        const res = await fetch(API + '/api/user/activity', { credentials: 'include' });
        if(res.ok) {
            const data = await res.json();
            const logs = data.activity || [];
            
            if(logs.length === 0) {
                list.innerHTML = '<div style="font-size:13px;color:var(--text-muted);text-align:center;padding:12px">No recent activity.</div>';
            } else {
                list.innerHTML = logs.map(l => {
                    const date = new Date(l.created_at).toLocaleString();
                    let icon = 'fa-info-circle';
                    let color = 'var(--accent-cyan)';
                    
                    if(l.action.includes('login')) { icon = 'fa-sign-in-alt'; color = '#10b981'; }
                    if(l.action.includes('create')) { icon = 'fa-plus'; color = '#3b82f6'; }
                    if(l.action.includes('delete')) { icon = 'fa-trash'; color = '#ef4444'; }
                    if(l.action.includes('update')) { icon = 'fa-pen'; color = '#f59e0b'; }
                    
                    let detailsText = '';
                    if(l.details) {
                        try {
                            const d = JSON.parse(l.details);
                            if(d) detailsText = Object.keys(d).map(k => k + ': ' + d[k]).join(', ');
                        } catch(e) { detailsText = l.details; }
                    }
                    
                    const actionName = l.action.replace(/_/g, ' ');

                    return `<div style="display:flex;gap:12px;align-items:start;padding:12px;background:var(--bg-elevated);border-radius:8px;border:1px solid var(--border)">
                        <div style="background:var(--bg-card);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${color};flex-shrink:0;border:1px solid var(--border)">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div style="flex:1">
                            <div style="font-size:13px;font-weight:600;color:var(--text-primary);text-transform:capitalize">${actionName}</div>
                            ${detailsText ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:2px;word-break:break-all">${detailsText}</div>` : ''}
                            <div style="font-size:10px;color:var(--text-muted);margin-top:4px">${date}</div>
                        </div>
                    </div>`;
                }).join('');
            }
        } else {
            list.innerHTML = '<div style="font-size:13px;color:var(--text-muted);text-align:center">Failed to load activity</div>';
        }
    } catch(e) { console.error(e); }
}

async function scrollToKb(id) {
    const el = document.getElementById(id);
    if(el) {
        el.scrollIntoView({behavior: 'smooth'});
        document.querySelectorAll('.kb-link').forEach(a => {
           if(a.getAttribute('href') === '#'+id) a.classList.add('active');
           else a.classList.remove('active');
        });
    }
}

// Inquiries Management
let currentInquiries = [];
let inquiryFilter = 'pending';
let activeInquiry = null;

function setInquiryFilter(f) {
  inquiryFilter = f;
  document.querySelectorAll('.inquiry-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('inquiry-tab-' + f).classList.add('active');
  loadInquiries();
}

async function loadInquiries() {
  const container = document.getElementById('inquiries-list');
  if(!container) return;
  try {
    const res = await fetch(API + '/api/user/inquiries?status=' + inquiryFilter, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    currentInquiries = data.inquiries || [];
    renderInquiries();
  } catch(e) { console.error(e); }
}

function renderInquiries() {
  const container = document.getElementById('inquiries-list');
  const searchInput = document.getElementById('inquiries-search');
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  if(!container) return;

  let filtered = currentInquiries.filter(i => {
    return !search || i.name.toLowerCase().includes(search) || i.email.toLowerCase().includes(search) || i.message.toLowerCase().includes(search);
  });

  if(filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">
        <i class="fas fa-envelope-open-text" style="font-size:48px;margin-bottom:16px;opacity:0.2"></i>
        <p>${currentInquiries.length === 0 ? 'No inquiries in this view.' : 'No matching inquiries.'}</p>
    </div>`;
    return;
  }

  const statEl = document.getElementById('d-inquiries');
  if(statEl) statEl.textContent = filtered.length;

  container.innerHTML = `<div class="table-responsive"><table class="members-table">
    <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Date</th><th style="text-align:right">Actions</th></tr></thead>
    <tbody>${filtered.map(i => {
      const statusIcon = i.status === 'done' ? 'fa-check-circle' : (i.status === 'archived' ? 'fa-archive' : 'fa-clock');
      const statusColor = i.status === 'done' ? '#10b981' : (i.status === 'archived' ? '#64748b' : '#f59e0b');
      
      return `<tr style="${i.status === 'archived' ? 'opacity:0.6' : ''}">
        <td><b>${esc(i.name)}</b></td>
        <td>${esc(i.email)}</td>
        <td><span style="color:${statusColor};font-size:12px;display:inline-flex;align-items:center;gap:6px"><i class="fas ${statusIcon}"></i> ${i.status}</span></td>
        <td>${new Date(i.created_at).toLocaleDateString()}</td>
        <td style="text-align:right">
          <button class="btn-outline" style="padding:4px 10px;font-size:12px" onclick="viewInquiryDetail('${i.id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;
}

function viewInquiryDetail(id) {
  const i = currentInquiries.find(x => x.id === id);
  if(!i) return;
  activeInquiry = i;
  
  document.getElementById('inquiry-detail-content').innerHTML = `
    <div style="display:grid;gap:16px;background:var(--bg-elevated);padding:20px;border-radius:12px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
              <label style="font-weight:600;font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">From</label>
              <div style="font-size:16px"><b>${esc(i.name)}</b></div>
              <div style="color:var(--text-secondary)">${esc(i.email)}</div>
          </div>
          ${i.mobile ? `<div><label style="font-weight:600;font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Mobile</label><div>${esc(i.mobile)}</div></div>` : ''}
      </div>
      <div>
          <label style="font-weight:600;font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Message</label>
          <div style="white-space:pre-wrap;background:var(--bg-card);padding:14px;border-radius:10px;border:1px solid var(--border);line-height:1.6;font-size:14px">${esc(i.message)}</div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between;align-items:center">
          <span>Received on ${new Date(i.created_at).toLocaleString()}</span>
          <span style="text-transform:uppercase;font-weight:700;letter-spacing:0.05em;color:var(--text-tertiary)">ID: ${i.id.substring(0,8)}</span>
      </div>
    </div>`;

  // Update status button and archive visibility
  const markBtn = document.getElementById('btn-mark-status');
  if (i.status === 'pending') {
    markBtn.innerHTML = '<i class="fas fa-check"></i> Mark Resolved';
    markBtn.onclick = () => updateInquiryStatus(id, 'done');
    markBtn.style.display = 'block';
  } else if (i.status === 'done') {
    markBtn.innerHTML = '<i class="fas fa-undo"></i> Mark Pending';
    markBtn.onclick = () => updateInquiryStatus(id, 'pending');
    markBtn.style.display = 'block';
  } else {
    markBtn.style.display = 'none';
  }

  toggleResponse(false);
  showModal('inquiry-modal');
}

function toggleResponse(show) {
    const section = document.getElementById('inquiry-response-section');
    const replyBtn = document.getElementById('btn-open-reply');
    section.style.display = show ? 'block' : 'none';
    replyBtn.style.display = show ? 'none' : 'block';
    
    if (show && activeInquiry) {
        document.getElementById('inquiry-resp-subject').value = 'Re: inquiry from ' + activeInquiry.name;
        document.getElementById('inquiry-resp-message').value = '';
        document.getElementById('inquiry-resp-message').focus();
    }
}

async function sendInquiryResponse() {
  if (!activeInquiry) return;
  const subject = document.getElementById('inquiry-resp-subject').value;
  const message = document.getElementById('inquiry-resp-message').value;
  const markDone = document.getElementById('inquiry-resp-mark-done').checked;

  if (!message) {
    showMsg('inquiry-modal', 'Please enter a message', 'error');
    return;
  }

  const btn = document.getElementById('btn-send-response');
  const oldHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  try {
    const res = await fetch(API + '/api/user/inquiries/' + activeInquiry.id + '/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message, mark_done: markDone }),
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) {
      showToast('Response sent successfully');
      hideModal('inquiry-modal');
      loadInquiries();
    } else {
      showMsg('inquiry-modal', data.error || 'Failed to send response', 'error');
    }
  } catch(e) {
    console.error(e);
    showMsg('inquiry-modal', 'Network error', 'error');
  } finally {
    btn.innerHTML = oldHtml;
    btn.disabled = false;
  }
}

async function updateInquiryStatus(id, status) {
  try {
    const res = await fetch(API + '/api/user/inquiries/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: 'include'
    });
    if (res.ok) {
      showToast('Status updated');
      hideModal('inquiry-modal');
      loadInquiries();
    }
  } catch(e) { console.error(e); }
}

async function archiveInquiry() {
  if (!activeInquiry) return;
  if (!confirm('Are you sure you want to archive this inquiry? It will be hidden from the default view.')) return;
  updateInquiryStatus(activeInquiry.id, 'archived');
}

function convertInquiryToMember() {
  if (!activeInquiry) return;
  hideModal('inquiry-modal');
  switchView('members');
  
  // Pre-fill the add member form
  const emailInput = document.getElementById('add-member-email');
  const nameInput = document.getElementById('add-member-name');
  if (emailInput) emailInput.value = activeInquiry.email;
  if (nameInput) nameInput.value = activeInquiry.name;
  
  showToast('Member info pre-filled. Review and click Add.');
}
