(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var scope = panel.closest('.content-section') || document;
      var search = panel.querySelector('.movie-search');
      var year = panel.querySelector('.movie-filter-year');
      var type = panel.querySelector('.movie-filter-type');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial && search) search.value = initial;

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var ok = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType.indexOf(t) !== -1);
          card.classList.toggle('is-filter-hidden', !ok);
        });
      }

      if (search) search.addEventListener('input', apply);
      if (year) year.addEventListener('change', apply);
      if (type) type.addEventListener('change', apply);
      apply();
    });
  }

  window.initMoviePlayer = function (playlistUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.player-overlay');
    if (!video || !playlistUrl) return;
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playlistUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(playlistUrl);
        hls.attachMedia(video);
      } else {
        video.src = playlistUrl;
      }
    }

    function play() {
      prepare();
      video.controls = true;
      if (overlay) overlay.classList.add('is-hidden');
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  };

  setupHero();
  setupFilters();
})();
