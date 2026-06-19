(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initHeader() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("form.site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function initHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var grid = document.querySelector(".filter-grid");
        if (!grid) {
            return;
        }
        var items = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-row"));
        var searchInput = document.querySelector(".page-search-input");
        var activeFilters = {};

        function apply() {
            var query = normalize(searchInput ? searchInput.value : "");
            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute("data-title"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-type"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-tags")
                ].join(" "));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedFilters = Object.keys(activeFilters).every(function (key) {
                    return !activeFilters[key] || normalize(item.getAttribute("data-" + key)) === normalize(activeFilters[key]);
                });
                item.classList.toggle("is-hidden", !(matchedQuery && matchedFilters));
            });
        }

        document.querySelectorAll("[data-filter-key]").forEach(function (button) {
            button.addEventListener("click", function () {
                var key = button.getAttribute("data-filter-key");
                var value = button.getAttribute("data-filter-value") || "";
                activeFilters[key] = value;
                document.querySelectorAll("[data-filter-key='" + key + "']").forEach(function (peer) {
                    peer.classList.remove("active");
                });
                button.classList.add("active");
                apply();
            });
        });

        if (searchInput) {
            searchInput.addEventListener("input", apply);
        }
        apply();
    }

    function makeCard(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a href=\"" + escapeHtml(movie.url) + "\" class=\"card-cover\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-mark\">▶</span>" +
            "<span class=\"year-mark\">" + escapeHtml(movie.year) + "</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span>" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var results = document.getElementById("search-results");
        var input = document.getElementById("search-page-input");
        if (!results || !input || !window.searchMovies) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var query = normalize(input.value);
            var list = window.searchMovies.filter(function (movie) {
                var haystack = normalize([movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" "));
                return !query || haystack.indexOf(query) !== -1;
            }).slice(0, 96);
            if (!list.length) {
                results.innerHTML = "<div class=\"article-card\"><p>没有找到相关影片。</p></div>";
                return;
            }
            results.innerHTML = list.map(makeCard).join("");
        }

        input.addEventListener("input", render);
        render();
    }

    function initBackTop() {
        var button = document.querySelector(".back-top");
        if (!button) {
            return;
        }
        window.addEventListener("scroll", function () {
            button.classList.toggle("is-visible", window.scrollY > 520);
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".play-overlay");
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var hls = null;

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function start() {
            overlay.classList.add("is-hidden");
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", streamUrl);
                }
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                } else {
                    playVideo();
                }
                return;
            }
            if (!video.getAttribute("src")) {
                video.setAttribute("src", streamUrl);
            }
            playVideo();
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };

    ready(function () {
        initHeader();
        initHero();
        initFilters();
        initSearchPage();
        initBackTop();
    });
})();
