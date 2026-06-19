(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    function textOf(card) {
        return [
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.category,
            card.dataset.tags
        ].join(' ').toLowerCase();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-local-search]');
        var buttons = panel.querySelectorAll('[data-filter-value]');
        var section = panel.parentElement;
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
        var currentFilter = 'all';

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = textOf(card);
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchFilter = currentFilter === 'all' || text.indexOf(currentFilter.toLowerCase()) !== -1;
                var show = matchKeyword && matchFilter;
                card.classList.toggle('hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            var oldEmpty = section.querySelector('.empty-state');
            if (oldEmpty) {
                oldEmpty.remove();
            }
            if (!visible && cards.length) {
                var empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.textContent = '没有找到匹配的影片';
                var grid = section.querySelector('.movie-grid, .ranking-list');
                if (grid) {
                    grid.appendChild(empty);
                }
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                currentFilter = button.dataset.filterValue || 'all';
                applyFilter();
            });
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                play();
            });
        });

        show(0);
        play();
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var source = shell.dataset.videoSrc;
        var started = false;
        var hlsInstance = null;

        function startPlayback() {
            if (!video || !source) {
                return;
            }

            if (!started) {
                started = true;
                video.setAttribute('controls', 'controls');

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }

            if (button) {
                button.classList.add('hidden');
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        shell.addEventListener('click', function (event) {
            if (event.target === shell) {
                startPlayback();
            }
        });

        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (started && button) {
                    button.classList.remove('hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });

    if (window.movieSearchIndex) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = document.querySelector('[data-search-input]');
        var title = document.querySelector('[data-search-title]');
        var results = document.querySelector('[data-search-results]');
        var shortcuts = document.querySelectorAll('[data-search-shortcut]');

        function cardHtml(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '' +
                '<article class="movie-card" data-movie-card>' +
                    '<a href="' + movie.url + '" class="poster-link" aria-label="观看' + escapeHtml(movie.title) + '">' +
                        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="card-category">' + escapeHtml(movie.category) + '</span>' +
                        '<span class="play-pill">▶</span>' +
                    '</a>' +
                    '<div class="card-body">' +
                        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
                        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="card-meta">' +
                            '<span>' + movie.year + '</span>' +
                            '<span>' + escapeHtml(movie.region) + '</span>' +
                            '<span>' + escapeHtml(movie.type) + '</span>' +
                        '</div>' +
                        '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function render(term) {
            var keyword = String(term || '').trim().toLowerCase();
            var list = window.movieSearchIndex.filter(function (movie) {
                if (!keyword) {
                    return true;
                }
                return [movie.title, movie.year, movie.region, movie.type, movie.category, movie.tags.join(' '), movie.oneLine]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(keyword) !== -1;
            }).slice(0, 120);

            if (title) {
                title.textContent = keyword ? '搜索：' + term : '推荐片库';
            }

            if (input) {
                input.value = term;
            }

            if (results) {
                results.innerHTML = list.length
                    ? list.map(cardHtml).join('')
                    : '<div class="empty-state">没有找到匹配的影片</div>';
            }
        }

        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }

        shortcuts.forEach(function (button) {
            button.addEventListener('click', function () {
                render(button.dataset.searchShortcut || '');
            });
        });

        render(query);
    }
})();
