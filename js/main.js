(function () {
  // Theme toggle — dark (chrome on black) is default, light (brushed steel) alternate
  var toggle = document.querySelector('[data-theme-toggle]');
  var root = document.documentElement;
  // Dark chrome is the intentional brand default for this project;
  // the toggle still lets visitors switch to the brushed-steel light mode.
  var current = 'dark';
  root.setAttribute('data-theme', current);
  updateIcon(current);

  if (toggle) {
    toggle.addEventListener('click', function () {
      current = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', current);
      var tc = document.querySelector('meta[name="theme-color"]');
      if (tc) tc.setAttribute('content', current === 'dark' ? '#060606' : '#eeeeee');
      updateIcon(current);
    });
  }

  function updateIcon(theme) {
    if (!toggle) return;
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
    toggle.innerHTML = theme === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // Subtle tilt/parallax on link buttons — skipped for touch & reduced motion
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = matchMedia('(hover: none)').matches;

  if (!reduceMotion && !isTouch) {
    document.querySelectorAll('.link-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        btn.style.transform = 'translateY(-2px) rotateX(' + (y * -3) + 'deg) rotateY(' + (x * 4) + 'deg)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }
})();

(function () {
  // ---------- Service worker (offline) ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  // ---------- Install button ----------
  var installBtn = document.querySelector('[data-install]');
  var iosHint = document.querySelector('[data-ios-hint]');
  var deferredPrompt = null;
  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
        installBtn.hidden = true;
      });
    });
  }

  window.addEventListener('appinstalled', function () {
    if (installBtn) installBtn.hidden = true;
    if (iosHint) iosHint.hidden = true;
  });

  // iOS Safari has no install prompt: show a short how-to instead
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS && !standalone && iosHint) iosHint.hidden = false;

  // ---------- Business card dialog (QR) ----------
  var dialog = document.querySelector('[data-card-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  document.querySelectorAll('[data-card-open]').forEach(function (btn) {
    btn.addEventListener('click', function () { dialog.showModal(); });
  });

  // Close on backdrop click
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });

  // Tabs: Contact (vCard) / Site web (URL)
  var tabs = Array.prototype.slice.call(dialog.querySelectorAll('[role="tab"]'));
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next); next.focus();
    });
  });

  // Native share sheet when available
  var shareBtn = dialog.querySelector('[data-share]');
  if (shareBtn && navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener('click', function () {
      navigator.share({ title: 'Eloy Portet', text: 'Batteur chez Stoneheart', url: 'https://eloy.portet.org/' }).catch(function () {});
    });
  }
})();
