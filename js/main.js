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
