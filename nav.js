// nav.js — complete (responsive header/nav + avatar menu + resize-safe helpers)

(function () {
  const KEY_USER = 'cr_user';
  const KEY_TOKEN = 'cr_token';
  const KEY_EXP = 'cr_token_exp';

  // Public helpers
  window.crGetUser = function () {
    try { return JSON.parse(sessionStorage.getItem(KEY_USER)); } catch (e) { return null; }
  };
  window.crGetToken = function () { return sessionStorage.getItem(KEY_TOKEN); };
  window.crTokenValid = function () {
    const exp = parseInt(sessionStorage.getItem(KEY_EXP) || '0', 10);
    return exp > Date.now() + 60000;
  };

  // Inject header + top nav
  window.crInjectNav = function (active) {
    if (document.getElementById('crHeader')) return;

    const header = document.createElement('header');
    header.id = 'crHeader';
    header.className = 'cr-header';
    header.innerHTML = `
      <div class="cr-header-left">
        <img class="cr-logo-img" alt="logo"/>
        <div class="cr-header-title">Crunchyroll <span>Headcount</span></div>
      </div>
      <div class="cr-header-right" id="crHeaderRight"></div>
    `;

    const nav = document.createElement('nav');
    nav.className = 'cr-nav-bar';
    nav.innerHTML = `
      <a class="cr-nav-link ${active === 'dashboard' ? 'active' : ''}" href="dashboard.html">Global Headcount Report</a>
      <a class="cr-nav-link ${active === 'requests' ? 'active' : ''}" href="requests.html">Headcount Requests</a>
    `;

    document.body.prepend(nav);
    document.body.prepend(header);

    document.addEventListener('click', (e) => {
      const m = document.getElementById('crAvatarMenu');
      const b = document.getElementById('crAvatarBtn');
      if (!m || !b) return;
      if (!m.contains(e.target) && !b.contains(e.target)) m.classList.remove('open');
    });
  };

  // Update header user
  window.crUpdateHeaderUser = function (user) {
    const right = document.getElementById('crHeaderRight');
    if (!right) return;

    right.innerHTML = `
      <span class="cr-user-name" title="${user.name || ''}">${user.name || ''}</span>
      <button class="cr-avatar-btn" id="crAvatarBtn" aria-label="Account" onclick="toggleAvatarMenu()">👤</button>
      <div class="cr-avatar-menu" id="crAvatarMenu">
        <button onclick="signOut()">Sign out</button>
      </div>
    `;
  };

  window.toggleAvatarMenu = function () {
    const m = document.getElementById('crAvatarMenu');
    if (m) m.classList.toggle('open');
  };

  window.signOut = function () {
    sessionStorage.clear();
    window.location.href = 'index.html';
  };

  // Resize-safe bottom nav helper
  window.crHandleBottomNav = function (id, buildFn) {
    function update() {
      const existing = document.getElementById(id);
      if (window.innerWidth <= 600 && !existing) buildFn();
      if (window.innerWidth > 600 && existing) existing.remove();
    }
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    update();
  };
})();
