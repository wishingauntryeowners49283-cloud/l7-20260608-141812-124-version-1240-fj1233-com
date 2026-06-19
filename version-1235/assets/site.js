(function() {
    const mobileButton = document.querySelector('.mobile-toggle');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function() {
            const open = mobilePanel.classList.toggle('is-open');
            mobileButton.setAttribute('aria-expanded', String(open));
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startSlider() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function() {
            showSlide(current + 1);
        }, 5600);
    }

    function resetSlider() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startSlider();
    }

    if (slides.length) {
        prev && prev.addEventListener('click', function() {
            showSlide(current - 1);
            resetSlider();
        });
        next && next.addEventListener('click', function() {
            showSlide(current + 1);
            resetSlider();
        });
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                resetSlider();
            });
        });
        startSlider();
    }

    const searchInput = document.querySelector('[data-search-input]');
    const yearFilter = document.querySelector('[data-filter-year]');
    const typeFilter = document.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        const keyword = normalize(searchInput && searchInput.value);
        const year = normalize(yearFilter && yearFilter.value);
        const type = normalize(typeFilter && typeFilter.value);
        let visible = 0;

        cards.forEach(function(card) {
            const title = normalize(card.getAttribute('data-title'));
            const tags = normalize(card.getAttribute('data-tags'));
            const cardYear = normalize(card.getAttribute('data-year'));
            const cardType = normalize(card.getAttribute('data-type'));
            const matchKeyword = !keyword || title.includes(keyword) || tags.includes(keyword);
            const matchYear = !year || cardYear === year;
            const matchType = !type || cardType === type;
            const show = matchKeyword && matchYear && matchType;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    searchInput && searchInput.addEventListener('input', applyFilter);
    yearFilter && yearFilter.addEventListener('change', applyFilter);
    typeFilter && typeFilter.addEventListener('change', applyFilter);
}());
