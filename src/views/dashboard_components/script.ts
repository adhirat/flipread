export const dashboardScript = `
const API = '';
let currentUser = null;
let currentBooks = [];
let authMode = 'login'; // login, register, forgot, reset

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
  setBilling('yearly');
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
  const s = JSON.parse(currentUser.store_settings || '{}');
  
  // General
  document.getElementById('st-desc').value = s.description || '';
  document.getElementById('st-domain').value = s.custom_domain || '';

  // Hero
  document.getElementById('st-h-title').value = s.hero_title || '';
  document.getElementById('st-h-caption').value = s.hero_caption || '';
  document.getElementById('st-h-img').value = s.hero_image_url || '';

  // Legal
  document.getElementById('st-privacy').value = s.privacy_policy_content || '';
  document.getElementById('st-terms').value = s.terms_content || '';
  document.getElementById('st-contact').value = s.contact_info_content || '';

  if(currentUser.store_logo_url) {
    document.getElementById('st-logo-preview').innerHTML = '<img src="'+esc(currentUser.store_logo_url)+'" style="width:100%;height:100%;object-fit:cover">';
  }
  document.getElementById('set-email').value = currentUser.email;
  document.getElementById('set-name-input').value = currentUser.name || '';
  
  const username = (currentUser.name || 'user').toLowerCase().replace(/\\s+/g, '-');
  document.getElementById('store-link-top').href = '/store/' + encodeURIComponent(username);
  
  const limits = { free: '5 MB', basic: '10 MB', pro: '50 MB', business: '200 MB' };
  document.getElementById('limit-text').textContent = 'Upload Limit: ' + (limits[currentUser.plan] || '5 MB');

  // Highlight active theme button
  const savedTheme = localStorage.getItem('flipread-theme') || 'light';
  document.querySelectorAll('[id^="theme-btn-"]').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('theme-btn-' + savedTheme);
  if(activeBtn) activeBtn.classList.add('active');
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
    const res = await fetch(API + '/api/books', { credentials: 'include' });
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
  const grid = document.getElementById('book-grid');
  if (currentBooks.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px">No books published yet.</div>';
    return;
  }
  grid.innerHTML = currentBooks.map(b => {
    const url = location.origin + '/read/' + b.slug;
    const isReady = true; // Simplified for now
    
    return \`<div class="book-item">
      <div class="book-cover">
        \${b.cover_url ? \`<img src="\${esc(b.cover_url)}">\` : '<i class="fas fa-book" style="font-size:40px;opacity:0.2"></i>'}
      </div>
      <div class="book-content">
        <div class="book-title" title="\${esc(b.title)}">\${esc(b.title)}</div>
        <div style="font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between">
          <span>\${formatSize(b.file_size_bytes)}</span>
          <span><i class="fas fa-eye"></i> \${b.view_count}</span>
        </div>
        <div class="book-actions">
          <button onclick="editBook('\${b.id}')"><i class="fas fa-cog"></i></button>
          <button onclick="window.open('\${esc(url)}','_blank')"><i class="fas fa-external-link-alt"></i></button>
          <button onclick="copyText('\${esc(url)}',this)"><i class="fas fa-link"></i></button>
          <button onclick="deleteBook('\${b.id}')" style="color:var(--accent-magenta)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>\`;
  }).join('');
}

async function uploadBook(e) {
  const file = e.target.files[0];
  if (!file) return;
  const msgEl = document.getElementById('upload-msg');
  msgEl.textContent = 'Preparing...'; msgEl.className = 'msg success'; msgEl.style.display = 'inline-block';

  const fd = new FormData();
  fd.append('file', file);
  fd.append('title', file.name.replace(/\.[^.]+$/, ''));

  try {
    // Attempt to extract cover for supported types
    const arrayBuffer = await file.arrayBuffer();
    let coverBlob = null;
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isEpub = file.type === 'application/epub+zip' || file.name.endsWith('.epub');
    const isImage = file.type.startsWith('image/');

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
        const blob = new Blob([arrayBuffer], { type: file.type });
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
    const res = await fetch(API + '/api/books/upload', {
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
  } catch { msgEl.textContent = 'Error'; msgEl.className = 'msg error'; }
  e.target.value = '';
}

async function deleteBook(id) {
  if(!confirm('Delete this book?')) return;
  await fetch(API + '/api/books/' + id, { method: 'DELETE', credentials: 'include' });
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
  showModal('edit-modal');
}

async function saveBook() {
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const is_public = document.getElementById('edit-public').value === "1";
  const password = document.getElementById('edit-pass').value || null;
  const custom_domain = document.getElementById('edit-domain').value || null;
  
  await fetch(API + '/api/books/' + id, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, is_public, password, custom_domain })
  });
  hideModal('edit-modal');
  loadBooks();
}

// Store & Settings
async function saveStoreSettings() {
  const store_name = document.getElementById('st-name').value;
  
  const store_settings = {
    description: document.getElementById('st-desc').value,
    custom_domain: document.getElementById('st-domain').value,
    hero_title: document.getElementById('st-h-title').value,
    hero_caption: document.getElementById('st-h-caption').value,
    hero_image_url: document.getElementById('st-h-img').value,
    privacy_policy_content: document.getElementById('st-privacy').value,
    terms_content: document.getElementById('st-terms').value,
    contact_info_content: document.getElementById('st-contact').value
  };

  const res = await fetch(API + '/api/user/store', {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_name, store_settings })
  });
  if(res.ok) {
    const m = document.getElementById('store-msg');
    m.textContent = 'Saved!'; m.className = 'msg success'; m.style.display = 'block';
    setTimeout(() => m.style.display = 'none', 2000);
    currentUser.store_name = store_name;
    currentUser.store_settings = JSON.stringify(store_settings);
  }
}

// Logo Cropping
let cropper;

async function uploadLogo(e) {
  const file = e.target.files[0];
  if(!file) return;

  // 1. Read file to display in cropper
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = document.getElementById('crop-img');
    img.src = ev.target.result;
    
    // Show Modal
    document.getElementById('crop-modal').style.display = 'flex';
    img.style.display = 'block';

    // Init Cropper
    if(cropper) cropper.destroy();
    cropper = new Cropper(img, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      restore: false,
      guides: false,
      center: false,
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
  
  // Get cropped blob
  cropper.getCroppedCanvas({ width: 512, height: 512 }).toBlob(async (blob) => {
    if(!blob) return;
    
    // Upload logic
    const fd = new FormData();
    fd.append('logo', blob, 'logo.jpg');
    
    const btn = document.querySelector('#crop-modal .btn');
    const oldText = btn.textContent;
    btn.textContent = 'Uploading...';
    btn.disabled = true;

    try {
      const res = await fetch(API + '/api/user/store/logo', {
        method: 'POST', credentials: 'include', body: fd
      });
      const data = await res.json();
      
      if(data.logo_url) {
        document.getElementById('st-logo-preview').innerHTML = '<img src="'+esc(data.logo_url)+'" style="width:100%;height:100%;object-fit:cover">';
        currentUser.store_logo_url = data.logo_url;
        cancelCrop();
      } else {
        alert('Upload failed');
      }
    } catch(e) {
      alert('Network error');
    }
    
    btn.textContent = oldText;
    btn.disabled = false;
  }, 'image/jpeg', 0.9);
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

// Subscription Logic
let billingInterval = 'yearly';

function setBilling(interval) {
  billingInterval = interval;
  const isYearly = interval === 'yearly';
  
  document.getElementById('bill-monthly').classList.toggle('active', !isYearly);
  document.getElementById('bill-yearly').classList.toggle('active', isYearly);
  const sw = document.querySelector('.toggle-switch');
  if(sw) sw.classList.toggle('active', isYearly);

  if(isYearly) {
    updatePrice('basic', '2.08', '/mo', 'Billed $25 yearly');
    updatePrice('pro', '7.50', '/mo', 'Billed $90 yearly');
    updatePrice('business', '24.17', '/mo', 'Billed $290 yearly');
  } else {
    updatePrice('basic', '2.50', '/mo', 'Billed monthly');
    updatePrice('pro', '9.00', '/mo', 'Billed monthly');
    updatePrice('business', '29.00', '/mo', 'Billed monthly');
  }
}

function updatePrice(plan, amount, interval, text) {
  const el = document.getElementById('price-'+plan);
  if(el) el.textContent = amount;
  const be = document.getElementById('billed-'+plan);
  if(be) be.textContent = text;
}

function toggleBilling() {
  setBilling(billingInterval === 'yearly' ? 'monthly' : 'yearly');
}

// Initialize billing toggle on load
document.addEventListener('DOMContentLoaded', () => { setTimeout(() => setBilling('yearly'), 100) });


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
`;
