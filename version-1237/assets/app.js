(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    function initFilters() {
        var grid = document.querySelector("[data-filter-grid]");
        var panel = document.querySelector("[data-filter-panel]");
        if (!grid || !panel) {
            return;
        }
        var keyword = panel.querySelector("[data-filter-keyword]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (keyword && initial) {
            keyword.value = initial;
        }

        function matches(card) {
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year")
            ].join(" ").toLowerCase();
            var key = keyword ? keyword.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            if (key && text.indexOf(key) === -1) {
                return false;
            }
            if (yearValue && card.getAttribute("data-year") !== yearValue) {
                return false;
            }
            if (typeValue && (card.getAttribute("data-type") || "").indexOf(typeValue) === -1) {
                return false;
            }
            return true;
        }

        function apply() {
            cards.forEach(function (card) {
                card.classList.toggle("is-hidden", !matches(card));
            });
        }

        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayer() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-overlay");
            var stream = player.getAttribute("data-stream");
            var hls;
            if (!video || !button || !stream) {
                return;
            }

            function playVideo() {
                button.classList.add("is-hidden");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!video.getAttribute("src")) {
                        video.setAttribute("src", stream);
                    }
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    if (!hls) {
                        hls = new window.Hls();
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                    return;
                }
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", stream);
                }
                video.play().catch(function () {});
            }

            button.addEventListener("click", playVideo);
            video.addEventListener("click", function () {
                if (video.paused && !video.currentTime) {
                    playVideo();
                }
            });
        });
    }

    function initBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        window.addEventListener("scroll", function () {
            button.classList.toggle("is-visible", window.scrollY > 500);
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initPlayer();
        initBackTop();
    });
})();
