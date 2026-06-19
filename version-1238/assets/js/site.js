(function () {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var siteNav = document.querySelector(".site-nav");

  if (mobileToggle && siteNav) {
    mobileToggle.addEventListener("click", function () {
      siteNav.classList.toggle("is-open");
    });
  }

  var searchForms = document.querySelectorAll("[data-site-search]");
  searchForms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "./search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var filterInput = document.querySelector("[data-filter-input]");
  var filterSelects = document.querySelectorAll("[data-filter-select]");
  var filterCards = document.querySelectorAll("[data-card]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter() {
    if (!filterInput && filterSelects.length === 0) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : "");
    var selected = {};
    filterSelects.forEach(function (select) {
      selected[select.getAttribute("data-filter-select")] = normalize(select.value);
    });

    filterCards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var match = !query || text.indexOf(query) !== -1;

      Object.keys(selected).forEach(function (key) {
        var value = selected[key];
        if (!value) {
          return;
        }
        var cardValue = normalize(card.getAttribute("data-" + key));
        if (cardValue.indexOf(value) === -1 && text.indexOf(value) === -1) {
          match = false;
        }
      });

      card.hidden = !match;
    });
  }

  if (filterInput || filterSelects.length) {
    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get("q");
    if (queryParam && filterInput) {
      filterInput.value = queryParam;
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    filterSelects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });

    applyFilter();
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    showSlide(0);
    restart();
  }
})();
