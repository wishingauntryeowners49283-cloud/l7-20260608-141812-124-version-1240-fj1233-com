(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;
  function activateSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      activateSlide(index);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      activateSlide(current + 1);
    }, 5200);
  }

  var localSearch = document.querySelector('[data-local-search]');
  var localSort = document.querySelector('[data-local-sort]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
  function applyLocalTools() {
    var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var text = [card.getAttribute('data-title'), card.getAttribute('data-year'), card.getAttribute('data-genre'), card.getAttribute('data-region')].join(' ').toLowerCase();
      card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
    });
    if (localSort) {
      var grid = document.querySelector('[data-card-grid]');
      if (grid) {
        var visible = cards.slice().sort(function (a, b) {
          var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
          var by = parseInt(b.getAttribute('data-year'), 10) || 0;
          return localSort.value === 'old' ? ay - by : by - ay;
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }
  }
  if (localSearch) {
    localSearch.addEventListener('input', applyLocalTools);
  }
  if (localSort) {
    localSort.addEventListener('change', applyLocalTools);
  }
})();

function initMoviePlayer(videoId, buttonId, url) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button) {
    return;
  }
  var started = false;
  function start() {
    if (started) {
      video.play();
      return;
    }
    started = true;
    button.classList.add('is-hidden');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      return;
    }
    video.src = url;
    video.play();
  }
  button.addEventListener('click', start);
}

function renderSearchResults() {
  var box = document.getElementById('searchResults');
  var input = document.getElementById('searchInput');
  if (!box || !input || !window.SITE_SEARCH_DATA) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  input.value = q;
  function render() {
    var keyword = input.value.trim().toLowerCase();
    var items = window.SITE_SEARCH_DATA.filter(function (item) {
      var text = [item.title, item.year, item.genre, item.region, item.category, item.oneLine].join(' ').toLowerCase();
      return !keyword || text.indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (!items.length) {
      box.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
      return;
    }
    box.innerHTML = items.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="play-chip">播放</span></a>' +
        '<div class="movie-info"><a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
        '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></div>' +
        '<p>' + escapeHtml(item.oneLine) + '</p><div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div></div></article>';
    }).join('');
  }
  input.addEventListener('input', render);
  render();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char];
  });
}
