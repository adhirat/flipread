export const dashboardScript = `
const API = '';
let currentUser = null;
let currentBooks = [];
let isRegister = false;

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
  
  const username = (currentUser.name || 'user').toLowerCase().replace(/\\s+/g, '-');
  document.getElementById('store-link-top').href = '/store/' + encodeURIComponent(username);
  
  const limits = { free: '5 MB', basic: '10 MB', pro: '50 MB', business: '200 MB' };
  document.getElementById('limit-text').textContent = 'Upload Limit: ' + (limits[currentUser.plan] || '5 MB');
}

function toggleAuthMode() {
  isRegister = !isRegister;
  document.getElementById('auth-title').textContent = isRegister ? 'Create Account' : 'Welcome Back';
  document.getElementById('auth-btn').textContent = isRegister ? 'Create Account' : 'Sign In';
  document.getElementById('auth-name').classList.toggle('hidden', !isRegister);
  document.getElementById('auth-toggle-text').textContent = isRegister ? 'Already have an account?' : 'New here?';
  document.getElementById('auth-toggle-link').textContent = isRegister ? 'Sign In' : 'Create Account';
}

async function submitAuth() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-pass').value;
  const name = document.getElementById('auth-name').value;
  const msgEl = document.getElementById('auth-msg');
  const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
  const body = isRegister ? { email, password, name } : { email, password };
  
  try {
    const res = await fetch(API + endpoint, { 
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.user) { currentUser = data.user; showDashboard(); }
    else { msgEl.textContent = data.error || 'Failed'; msgEl.className = 'msg error'; msgEl.style.display = 'block'; }
  } catch { msgEl.textContent = 'Network error'; msgEl.className = 'msg error'; msgEl.style.display = 'block'; }
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
  msgEl.textContent = 'Preparing Cover...'; msgEl.className = 'msg success'; msgEl.style.display = 'inline-block';
  
  const fd = new FormData();
  fd.append('file', file);
  fd.append('title', file.name.replace(/\.(pdf|epub)$/i, ''));

  try {
    // Attempt to extract cover
    const arrayBuffer = await file.arrayBuffer();
    let coverBlob = null;

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
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
    } else if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
      try {
        const book = ePub(arrayBuffer);
        const coverUrl = await book.coverUrl();
        if (coverUrl) {
          coverBlob = await fetch(coverUrl).then(r => r.blob());
        }
      } catch (e) { console.error('EPUB Cover Extract Failed', e); }
    }

    if (coverBlob) {
      fd.append('cover', coverBlob, 'cover.jpg');
    }

    msgEl.textContent = 'Uploading Book...';
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
}
// Init
if(localStorage.getItem('flipread-theme')) setTheme(localStorage.getItem('flipread-theme'));
const params = new URLSearchParams(window.location.search);
if (params.get('mode') === 'register') {
  isRegister = true;
  document.getElementById('auth-title').textContent = 'Create Account';
  document.getElementById('auth-btn').textContent = 'Create Account';
  document.getElementById('auth-name').classList.remove('hidden');
  document.getElementById('auth-toggle-text').textContent = 'Already have an account?';
  document.getElementById('auth-toggle-link').textContent = 'Sign In';
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
`;
