(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });

        show(0);
        play();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var search = root.querySelector('[data-search-input]');
        var type = root.querySelector('[data-type-filter]');
        var year = root.querySelector('[data-year-filter]');
        var items = Array.prototype.slice.call(root.querySelectorAll('.filterable-grid > a'));
        var empty = root.querySelector('[data-empty-state]');

        function valueOf(input) {
            return input ? String(input.value || '').trim().toLowerCase() : '';
        }

        function apply() {
            var keyword = valueOf(search);
            var selectedType = valueOf(type);
            var selectedYear = valueOf(year);
            var visible = 0;

            items.forEach(function (item) {
                var text = String(item.getAttribute('data-search') || item.textContent || '').toLowerCase();
                var itemType = String(item.getAttribute('data-type') || '').toLowerCase();
                var itemYear = String(item.getAttribute('data-year') || '').toLowerCase();
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedType && itemType.indexOf(selectedType) === -1) {
                    matched = false;
                }
                if (selectedYear && itemYear !== selectedYear) {
                    matched = false;
                }

                item.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [search, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
}());
