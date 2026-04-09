// ── THEME ──
(function(){
  var t = localStorage.getItem('nancy_theme');
  if (t === 'light') document.documentElement.setAttribute('data-theme','light');
})();

// ══════════════════════════════════════
// NANCY HUB — SHARED CONFIG & AUTH
// ══════════════════════════════════════

const SUPABASE_URL = 'https://yiqniylxflulzfghujzw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcW5peWx4Zmx1bHpmZ2h1anp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzcwMTEsImV4cCI6MjA5MDY1MzAxMX0.ZVT3XwHkBrL1leBaQevew8G4k5syHmT5gYDznPQeAFY';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8IiG-k3J2lcQR38unRpO2cHyRidAlQTM8FLWCIbHy9JjdvmeB6MrKo_vNVaqsi3Th/exec';
const GEMINI_API_KEY = ''; // Add your Gemini API key here

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Current page name - set this in each page file
// e.g. const CURRENT_PAGE = 'taskflow';

// ── STATE ──
var hubState = {
  currentUser: null,
  dbPassword: 'nancy2024',
};

// ── UTILS ──
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getPHT() {
  return new Date(Date.now() + 8 * 3600000);
}

var toastTimer;
function showToast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + (type || '') + ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 3000);
}

function openModal(id) { var el = document.getElementById(id); if (el) el.classList.add('open'); }
function closeModal(id) { var el = document.getElementById(id); if (el) el.classList.remove('open'); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }

// ── CLOCK ──
function startClock() {
  function tick() {
    var pht = getPHT();
    var h = String(pht.getUTCHours()).padStart(2,'0');
    var m = String(pht.getUTCMinutes()).padStart(2,'0');
    var el = document.getElementById('pht-clock');
    if (el) el.textContent = 'HKT ' + h + ':' + m;
  }
  tick();
  setInterval(tick, 30000);
}

// ── GATE (Hub Password) ──
async function checkPassword() {
  var val = document.getElementById('gate-pw').value;
  var errEl = document.getElementById('gate-error');
  try {
    var result = await db.from('settings').select('value').eq('key', 'hub_password').single();
    var correctPw = (result.data && result.data.value) ? result.data.value : 'nancy2024';
    hubState.dbPassword = correctPw;
    if (val === correctPw) {
      document.getElementById('gate').style.display = 'none';
      document.getElementById('auth-screen').style.display = 'flex';
    } else {
      if (errEl) { errEl.textContent = 'Incorrect password. Please try again.'; errEl.style.display = 'block'; }
      document.getElementById('gate-pw').style.borderColor = '#e53935';
    }
  } catch(e) {
    if (val === 'nancy2024') {
      document.getElementById('gate').style.display = 'none';
      document.getElementById('auth-screen').style.display = 'flex';
    } else {
      if (errEl) { errEl.textContent = 'Incorrect password.'; errEl.style.display = 'block'; }
    }
  }
}

// ── AUTH TABS ──
function switchAuthTab(tab) {
  var signin = document.getElementById('signin-form');
  var signup = document.getElementById('signup-form');
  var forgot = document.getElementById('forgot-form');
  var stab = document.getElementById('signin-tab');
  var utab = document.getElementById('signup-tab');
  if (signin) signin.style.display = tab === 'signin' ? 'block' : 'none';
  if (signup) signup.style.display = tab === 'signup' ? 'block' : 'none';
  if (forgot) forgot.style.display = 'none';
  if (stab) stab.classList.toggle('active', tab === 'signin');
  if (utab) utab.classList.toggle('active', tab === 'signup');
}

function showForgotPassword() {
  var signin = document.getElementById('signin-form');
  var signup = document.getElementById('signup-form');
  var forgot = document.getElementById('forgot-form');
  if (signin) signin.style.display = 'none';
  if (signup) signup.style.display = 'none';
  if (forgot) forgot.style.display = 'block';
}

// ── SIGN IN ──
async function signIn() {
  var email = document.getElementById('signin-email').value.trim();
  var password = document.getElementById('signin-password').value;
  var errEl = document.getElementById('signin-error');
  var btn = document.getElementById('signin-btn');
  if (errEl) errEl.style.display = 'none';
  if (!email || !password) {
    if (errEl) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; }
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
  try {
    var result = await db.auth.signInWithPassword({ email: email, password: password });
    if (result.error) throw result.error;
    await onAuthSuccess(result.data.user);
  } catch(e) {
    if (errEl) { errEl.textContent = e.message || 'Invalid email or password.'; errEl.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
  }
}

// ── SIGN UP ──
async function signUp() {
  var name = document.getElementById('signup-name').value.trim();
  var email = document.getElementById('signup-email').value.trim().toLowerCase();
  var password = document.getElementById('signup-password').value;
  var errEl = document.getElementById('signup-error');
  var successEl = document.getElementById('signup-success');
  var btn = document.getElementById('signup-btn');
  if (errEl) errEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
  if (!name || !email || !password) {
    if (errEl) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; }
    return;
  }
  try {
    var domainResult = await db.from('settings').select('value').eq('key', 'allowed_domain').single();
    var allowedDomain = (domainResult.data && domainResult.data.value) ? domainResult.data.value : 'carenbloom.com';
    if (!email.endsWith('@' + allowedDomain)) {
      if (errEl) { errEl.textContent = 'Only @' + allowedDomain + ' emails are allowed.'; errEl.style.display = 'block'; }
      return;
    }
  } catch(e) {
    if (!email.endsWith('@carenbloom.com')) {
      if (errEl) { errEl.textContent = 'Only @carenbloom.com emails are allowed.'; errEl.style.display = 'block'; }
      return;
    }
  }
  if (password.length < 6) {
    if (errEl) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; }
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
  try {
    var authResult = await db.auth.signUp({ email: email, password: password, options: { data: { name: name } } });
    if (authResult.error) throw authResult.error;
    var shareCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    var isAdmin = email === 'danielle@carenbloom.com';
    var avatar = getAvatarForName(name);
    var boardResult = await db.from('boards').insert({
      name: name, avatar: avatar, share_code: shareCode,
      email: email, role: isAdmin ? 'admin' : 'member',
      auth_id: authResult.data.user ? authResult.data.user.id : null
    }).select().single();
    if (boardResult.error) throw boardResult.error;
    hubState.currentUser = {
      id: boardResult.data.id, name: name, avatar: avatar,
      email: email, shareCode: shareCode,
      role: isAdmin ? 'admin' : 'member',
      authId: authResult.data.user ? authResult.data.user.id : null
    };
    localStorage.setItem('nancy_user', JSON.stringify(hubState.currentUser));
    await onAuthSuccess(authResult.data.user);
  } catch(e) {
    if (errEl) { errEl.textContent = e.message || 'Could not create account.'; errEl.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.textContent = 'Join Team'; }
  }
}

// ── FORGOT PASSWORD ──
async function sendResetEmail() {
  var email = document.getElementById('forgot-email').value.trim();
  var errEl = document.getElementById('forgot-error');
  var successEl = document.getElementById('forgot-success');
  var btn = document.getElementById('forgot-btn');
  if (errEl) errEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
  if (!email) { if (errEl) { errEl.textContent = 'Please enter your email.'; errEl.style.display = 'block'; } return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
  try {
    var result = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/nancy-hub/' });
    if (result.error) throw result.error;
    if (successEl) { successEl.textContent = 'Reset link sent! Check your inbox.'; successEl.style.display = 'block'; }
  } catch(e) {
    if (errEl) { errEl.textContent = e.message || 'Could not send reset email.'; errEl.style.display = 'block'; }
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Send Reset Link'; }
}

// ── ON AUTH SUCCESS ──
async function onAuthSuccess(authUser) {
  var authScreen = document.getElementById('auth-screen');
  var loading = document.getElementById('loading');
  if (authScreen) authScreen.style.display = 'none';
  if (loading) loading.style.display = 'none';
  try {
    var result = await db.from('boards').select('*').eq('auth_id', authUser.id).single();
    if (!result.error && result.data) {
      hubState.currentUser = {
        id: result.data.id, name: result.data.name,
        avatar: result.data.avatar, email: result.data.email,
        shareCode: result.data.share_code,
        role: result.data.role || 'member',
        authId: authUser.id
      };
    } else {
      var result2 = await db.from('boards').select('*').eq('email', authUser.email).single();
      if (!result2.error && result2.data) {
        await db.from('boards').update({ auth_id: authUser.id }).eq('id', result2.data.id);
        hubState.currentUser = {
          id: result2.data.id, name: result2.data.name,
          avatar: result2.data.avatar, email: result2.data.email,
          shareCode: result2.data.share_code,
          role: result2.data.role || 'member', authId: authUser.id
        };
      }
    }
  } catch(e) {}
  localStorage.setItem('nancy_user', JSON.stringify(hubState.currentUser));
  updateNavUser();
  var app = document.getElementById('app');
  if (app) { app.style.display = 'flex'; app.style.flexDirection = 'column'; }
  startClock();
  initThemeToggle();
  initMobileNav();
  if (typeof onPageReady === 'function') onPageReady();
  setTimeout(function() { try { checkStorageAlert(); } catch(e) {} }, 5000);
}

// ── CHECK SESSION ──
async function checkSession() {
  try {
    var result = await db.auth.getSession();
    if (result.data && result.data.session && result.data.session.user) {
      await onAuthSuccess(result.data.session.user);
    } else {
      showGate();
    }
  } catch(e) { showGate(); }
}

function showGate() {
  var loading = document.getElementById('loading');
  var gate = document.getElementById('gate');
  if (loading) loading.style.display = 'none';
  if (gate) gate.style.display = 'flex';
}

// ── SIGN OUT ──
async function signOut() {
  try { await db.auth.signOut(); } catch(e) {}
  hubState.currentUser = null;
  localStorage.removeItem('nancy_user');
  var dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.remove();
  window.location.href = 'index.html';
}

// ── NAV USER ──
function updateNavUser() {
  if (!hubState.currentUser) return;
  var nameEl = document.getElementById('user-name-nav');
  var avatarEl = document.getElementById('user-avatar-nav');
  var adminLink = document.getElementById('admin-nav-link');
  var mobileAdminBtn = document.getElementById('mnav-admin');
  if (nameEl) nameEl.textContent = hubState.currentUser.name || 'Me';
  if (avatarEl) {
    var initials = (hubState.currentUser.name || 'U').split(' ').map(function(w){return w[0];}).join('').toUpperCase().slice(0,2);
    avatarEl.textContent = initials;
    avatarEl.style.background = hubState.currentUser.avatar || 'var(--primary-light)';
    avatarEl.style.color = 'white';
    avatarEl.style.fontFamily = 'Inter,sans-serif';
    avatarEl.style.fontWeight = '700';
    avatarEl.style.fontSize = '.7rem';
  }
  if (adminLink) {
    adminLink.style.display = hubState.currentUser.role === 'admin' ? 'flex' : 'none';
    adminLink.style.alignItems = 'center';
    adminLink.style.height = '100%';
  }
  if (mobileAdminBtn) {
    mobileAdminBtn.style.display = hubState.currentUser.role === 'admin' ? 'flex' : 'none';
  }
}

function openUserMenu() {
  var existing = document.getElementById('user-dropdown');
  if (existing) { existing.remove(); return; }
  var menu = document.createElement('div');
  menu.id = 'user-dropdown';
  menu.style.cssText = 'position:fixed;top:56px;right:80px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-lg);z-index:999;min-width:200px;overflow:hidden';
  var info = '<div style="padding:.75rem 1rem;border-bottom:1px solid var(--border)">';
  info += '<div style="font-family:sans-serif;font-size:.85rem;font-weight:600;color:var(--h2)">' + esc(hubState.currentUser ? hubState.currentUser.name : 'User') + '</div>';
  info += '<div style="font-family:sans-serif;font-size:.72rem;color:var(--muted)">' + esc(hubState.currentUser ? hubState.currentUser.email : '') + '</div>';
  if (hubState.currentUser && hubState.currentUser.role === 'admin') {
    info += '<div style="font-family:sans-serif;font-size:.68rem;font-weight:700;color:var(--primary);margin-top:2px">Admin</div>';
  }
  info += '</div>';
  var signout = '<div onclick="signOut()" style="padding:.75rem 1rem;font-family:sans-serif;font-size:.85rem;color:#e53935;cursor:pointer">Sign Out</div>';
  menu.innerHTML = info + signout;
  document.body.appendChild(menu);
  setTimeout(function() {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
    });
  }, 100);
}

// ── MOBILE NAV ──
function isMobile() { return window.innerWidth <= 768; }

function initMobileNav() {
  var nav = document.getElementById('mobile-nav');
  if (nav) nav.style.display = isMobile() ? 'block' : 'none';
  updateNavUser();
}

window.addEventListener('resize', function() {
  var nav = document.getElementById('mobile-nav');
  if (nav) nav.style.display = isMobile() ? 'block' : 'none';
});

// ── HIDE NAV ON SCROLL ──
var _navLastY = 0;
function handleNavScroll(y) {
  var nav = document.querySelector('.topnav');
  if (!nav) return;
  if (y > _navLastY + 4 && y > 80) {
    nav.classList.add('nav-hidden');
  } else if (y < _navLastY - 4) {
    nav.classList.remove('nav-hidden');
  }
  _navLastY = y;
}
window.addEventListener('scroll', function() {
  handleNavScroll(window.scrollY || document.documentElement.scrollTop);
}, { passive: true });

// ── STORAGE ALERT ──
var storageDismissed = false;
async function checkStorageAlert() {
  if (!hubState.currentUser || hubState.currentUser.role !== 'admin') return;
  if (storageDismissed) return;
  try {
    var controller = new AbortController();
    var timeout = setTimeout(function() { controller.abort(); }, 5000);
    var result = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'usage' }), signal: controller.signal });
    clearTimeout(timeout);
    var data = await result.json();
    if (!data || !data.success) return;
    var pct = data.percentage || 0;
    var banner = document.getElementById('storage-alert-banner');
    if (!banner) return;
    if (pct >= 95) {
      banner.className = 'critical'; banner.style.display = 'flex';
      var icon = document.getElementById('storage-alert-icon');
      var pctEl = document.getElementById('storage-alert-pct');
      var msgEl = document.getElementById('storage-alert-msg');
      if (icon) icon.textContent = '!';
      if (pctEl) pctEl.textContent = 'CRITICAL: Storage at ' + pct + '% —';
      if (msgEl) msgEl.textContent = 'Uploads may fail. Upgrade immediately.';
    } else if (pct >= 90) {
      banner.className = 'danger'; banner.style.display = 'flex';
    } else if (pct >= 80) {
      banner.className = 'warning'; banner.style.display = 'flex';
      var pctEl2 = document.getElementById('storage-alert-pct');
      var msgEl2 = document.getElementById('storage-alert-msg');
      if (pctEl2) pctEl2.textContent = 'Storage at ' + pct + '% —';
      if (msgEl2) msgEl2.textContent = 'Google Drive filling up.';
    } else {
      banner.style.display = 'none';
    }
  } catch(e) { return; }
}

function dismissStorageAlert() {
  storageDismissed = true;
  var banner = document.getElementById('storage-alert-banner');
  if (banner) banner.style.display = 'none';
}

// ── HELPERS ──
function getAvatarForName(name) {
  var colors = ['#ff30cc','#ff6b35','#2d7dd2','#3bb273','#f7b731','#8854d0','#e53935','#0097a7','#f06292','#66bb6a'];
  return colors[name.charCodeAt(0) % colors.length];
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('en-HK', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ── ACTIVITY LOG ──
async function logActivity(action, type, details) {
  if (!hubState.currentUser) return;
  try {
    await db.from('activity_log').insert({
      board_id: hubState.currentUser.id,
      member_name: hubState.currentUser.name,
      member_email: hubState.currentUser.email,
      action: action, details: details || '', section: type || 'general'
    });
  } catch(e) {}
}

// ── THEME TOGGLE ──
var ICON_MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
var ICON_SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function toggleTheme() {
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('nancy_theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('nancy_theme', 'light');
  }
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = isLight ? ICON_MOON : ICON_SUN;
}

function initThemeToggle() {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  btn.innerHTML = isLight ? ICON_SUN : ICON_MOON;
}

// ── BOOT ──
async function bootHub() {
  try {
    var result = await db.auth.getSession();
    if (result.data && result.data.session && result.data.session.user) {
      await onAuthSuccess(result.data.session.user);
    } else {
      showGate();
    }
  } catch(e) { showGate(); }
}
