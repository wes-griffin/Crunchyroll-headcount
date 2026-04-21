// ============================================================
// CRUNCHYROLL SHARED NAV + AUTH
// nav.js — included by all pages
// ============================================================

const CR_CONFIG = {
  CLIENT_ID: '409743137262-c1rhujm3rrckeess6ha18cjfl21b3tre.apps.googleusercontent.com',
  SESSION_KEY_USER:  'cr_user',
  SESSION_KEY_TOKEN: 'cr_token',
  SESSION_KEY_EXP:   'cr_token_exp',
  PAGES: [
    { id: 'dashboard', label: 'Global Headcount Report', href: 'dashboard.html', icon: '📊' },
    { id: 'requests',  label: 'Headcount Requests',      href: 'requests.html',  icon: '📝' },
  ],
};

// ── Session helpers ──────────────────────────────────────────
function crSaveSession(user, token, expiresIn) {
  sessionStorage.setItem(CR_CONFIG.SESSION_KEY_USER,  JSON.stringify(user));
  sessionStorage.setItem(CR_CONFIG.SESSION_KEY_TOKEN, token);
  sessionStorage.setItem(CR_CONFIG.SESSION_KEY_EXP,   Date.now() + expiresIn * 1000);
}
function crGetUser()  { try { return JSON.parse(sessionStorage.getItem(CR_CONFIG.SESSION_KEY_USER)); } catch { return null; } }
function crGetToken() { return sessionStorage.getItem(CR_CONFIG.SESSION_KEY_TOKEN); }
function crTokenValid() {
  const exp = parseInt(sessionStorage.getItem(CR_CONFIG.SESSION_KEY_EXP)||'0');
  return exp > Date.now() + 60000;
}
function crClearSession() {
  [CR_CONFIG.SESSION_KEY_USER, CR_CONFIG.SESSION_KEY_TOKEN, CR_CONFIG.SESSION_KEY_EXP]
    .forEach(k => sessionStorage.removeItem(k));
}

// ── Inject shared header + nav ───────────────────────────────
function crInjectNav(currentPage, extraNavHTML = '') {
  const user = crGetUser();
  const navLinks = CR_CONFIG.PAGES.map(p => `
    <a href="${p.href}" class="cr-nav-link ${currentPage === p.id ? 'active' : ''}">
      <span class="cr-nav-icon">${p.icon}</span>${p.label}
    </a>`).join('');

  const headerHTML = `
  <style>
    .cr-header { background:#000; height:64px; display:flex; align-items:center; justify-content:space-between; padding:0 40px; position:sticky; top:0; z-index:200; }
    .cr-header-left { display:flex; align-items:center; gap:14px; }
    .cr-logo-img { width:34px; height:34px; border-radius:50%; object-fit:cover; }
    .cr-logo-text { color:#fff; font-size:18px; font-weight:700; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-decoration:none; }
    .cr-logo-text span { color:#FF5E00; }
    .cr-header-right { display:flex; align-items:center; gap:12px; }
    .cr-user-name { color:#aaa; font-size:13px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
    .cr-sign-out { background:none; border:1px solid #444; color:#888; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
    .cr-sign-out:hover { border-color:#888; color:#fff; }
    .cr-nav-bar { background:#000; border-top:1px solid #222; display:flex; padding:0 40px; overflow-x:auto; gap:0; }
    .cr-nav-link { padding:13px 20px; color:#888; font-size:12px; font-weight:600; text-decoration:none; border-bottom:3px solid transparent; white-space:nowrap; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-transform:uppercase; letter-spacing:0.3px; display:flex; align-items:center; gap:6px; transition:color 0.2s; }
    .cr-nav-link:hover { color:#fff; }
    .cr-nav-link.active { color:#FF5E00; border-bottom-color:#FF5E00; }
    .cr-nav-icon { font-size:14px; }
    .cr-nav-divider { width:1px; background:#333; margin:10px 0; flex-shrink:0; }
    @media(max-width:600px) { .cr-header,.cr-nav-bar { padding:0 16px; } .cr-user-name { display:none; } }
  </style>
  <div class="cr-header">
    <div class="cr-header-left">
      <img class="cr-logo-img" src="LOGO_SRC" alt="Crunchyroll">
      <a href="index.html" class="cr-logo-text"><span>Crunchyroll</span> | Headcount</a>
    </div>
    <div class="cr-header-right" id="crHeaderRight">
      ${user ? `
        <span class="cr-user-name">${user.name}</span>
        <button class="cr-sign-out" onclick="crSignOut()">Sign out</button>
      ` : ''}
    </div>
  </div>
  <div class="cr-nav-bar">
    ${navLinks}
    ${extraNavHTML ? `<div class="cr-nav-divider"></div>${extraNavHTML}` : ''}
  </div>`;

  // Insert at very top of body
  const wrapper = document.createElement('div');
  wrapper.id = 'crSharedNav';
  wrapper.innerHTML = headerHTML;
  document.body.insertBefore(wrapper, document.body.firstChild);
}

// Update header right section after auth
function crUpdateHeaderUser(user) {
  const el = document.getElementById('crHeaderRight');
  if (!el) return;
  el.innerHTML = `
    <span class="cr-user-name">${user.name}</span>
    <button class="cr-sign-out" onclick="crSignOut()">Sign out</button>`;
}

// ── Sign out ─────────────────────────────────────────────────
function crSignOut() {
  if (typeof google !== 'undefined') google.accounts.id.disableAutoSelect();
  crClearSession();
  window.location.href = 'index.html';
}

// ── Get a fresh OAuth token (reuses session if still valid) ──
function crGetAccessToken() {
  if (crTokenValid()) return Promise.resolve(crGetToken());
  return new Promise((res, rej) => {
    if (typeof google === 'undefined') { rej(new Error('Google not loaded')); return; }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CR_CONFIG.CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      callback: (r) => {
        if (r.error) { rej(new Error(r.error)); return; }
        // Update token in session
        sessionStorage.setItem(CR_CONFIG.SESSION_KEY_TOKEN, r.access_token);
        sessionStorage.setItem(CR_CONFIG.SESSION_KEY_EXP, Date.now() + r.expires_in * 1000);
        res(r.access_token);
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}
