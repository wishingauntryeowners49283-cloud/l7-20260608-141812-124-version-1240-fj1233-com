(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        const grid = panel.parentElement.querySelector('[data-filter-grid]');
        const search = panel.querySelector('[data-filter-search]');
        const year = panel.querySelector('[data-filter-year]');
        const type = panel.querySelector('[data-filter-type]');
        const cards = grid ? Array.from(grid.querySelectorAll('.movie-card')) : [];

        if (!grid || !cards.length) {
            return;
        }

        const years = Array.from(new Set(cards.map(function (card) {
            return card.dataset.year || '';
        }).filter(Boolean))).sort(function (a, b) {
            return b.localeCompare(a);
        });

        const types = Array.from(new Set(cards.map(function (card) {
            return card.dataset.type || '';
        }).filter(Boolean))).sort();

        years.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            year.appendChild(option);
        });

        types.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            type.appendChild(option);
        });

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (query && search) {
            search.value = query;
        }

        function applyFilter() {
            const keyword = (search.value || '').trim().toLowerCase();
            const yearValue = year.value;
            const typeValue = type.value;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(' ').toLowerCase();
                const matchesKeyword = !keyword || haystack.includes(keyword);
                const matchesYear = !yearValue || card.dataset.year === yearValue;
                const matchesType = !typeValue || card.dataset.type === typeValue;
                card.classList.toggle('is-filter-hidden', !(matchesKeyword && matchesYear && matchesType));
            });
        }

        [search, year, type].forEach(function (element) {
            element.addEventListener('input', applyFilter);
            element.addEventListener('change', applyFilter);
        });

        applyFilter();
    });
})();
