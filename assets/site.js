(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileMenu = qs('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  var active = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterRoot = qs('[data-filter-root]');
  if (filterRoot) {
    var input = qs('[data-filter-text]', filterRoot);
    var typeSelect = qs('[data-filter-type]', filterRoot);
    var regionSelect = qs('[data-filter-region]', filterRoot);
    var yearSelect = qs('[data-filter-year]', filterRoot);
    var cards = qsa('[data-movie-card]', filterRoot);
    function norm(value) {
      return String(value || '').toLowerCase().trim();
    }
    function applyFilters() {
      var text = norm(input && input.value);
      var type = norm(typeSelect && typeSelect.value);
      var region = norm(regionSelect && regionSelect.value);
      var year = norm(yearSelect && yearSelect.value);
      cards.forEach(function (card) {
        var haystack = norm(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
        var ok = true;
        if (text && haystack.indexOf(text) === -1) {
          ok = false;
        }
        if (type && norm(card.getAttribute('data-type')) !== type) {
          ok = false;
        }
        if (region && norm(card.getAttribute('data-region')).indexOf(region) === -1) {
          ok = false;
        }
        if (year && norm(card.getAttribute('data-year')) !== year) {
          ok = false;
        }
        card.classList.toggle('hidden-by-filter', !ok);
      });
    }
    [input, typeSelect, regionSelect, yearSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
      }
    });
  }

  var topButton = qs('[data-back-top]');
  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('is-visible', window.scrollY > 480);
    });
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
