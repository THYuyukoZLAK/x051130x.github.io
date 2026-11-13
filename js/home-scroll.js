(() => {
    'use strict';

    const hero = document.querySelector('.headfront');
    const content = document.getElementById('home-content');
    const navbar = document.getElementById('global-navbar');
    if (!hero || !content) return;

    // The homepage navbar floats over the hero with no background; give it
    // the usual colour back as soon as the page leaves the top.
    if (navbar) {
        const syncNavbar = () => navbar.classList.toggle('is-solid', window.scrollY > 24);
        syncNavbar();
        window.addEventListener('scroll', syncNavbar, { passive: true });
    }

    // Guided transition between the hero and the post list. It starts on the
    // first notch of a mouse wheel. Trackpads and touch screens scroll
    // natively: their small continuous deltas are never intercepted.
    const TRANSITION_MS = 700; // long enough for the artwork shutter to read
    const WHEEL_NOTCH = 50; // px; smaller deltas are treated as a trackpad
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = null;

    function stop() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
    }

    function contentPosition() {
        // Keep the sticky navbar visible, with the hero exactly above its edge.
        const navHeight = navbar ? navbar.getBoundingClientRect().height : 0;
        return window.scrollY + content.getBoundingClientRect().top - navHeight;
    }

    function transitionTo(target) {
        const start = window.scrollY;
        const left = window.scrollX;

        if (reducedMotion.matches) {
            window.scrollTo({ top: target, left, behavior: 'instant' });
            return;
        }

        const started = performance.now();
        function animate(now) {
            const progress = Math.min((now - started) / TRANSITION_MS, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            // Override Bootstrap's global smooth scrolling for each animation frame.
            window.scrollTo({ top: start + (target - start) * eased, left, behavior: 'instant' });
            frame = progress < 1 ? requestAnimationFrame(animate) : null;
        }
        frame = requestAnimationFrame(animate);
    }

    window.addEventListener('wheel', event => {
        // Leave browser zoom, horizontal gestures and form controls alone.
        if (event.ctrlKey || event.metaKey || event.shiftKey ||
            Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
            event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
        if (document.documentElement.classList.contains('is-loading')) return;

        if (frame !== null) {
            event.preventDefault();
            return;
        }

        if (!event.cancelable) return;
        const isWheel = event.deltaMode !== 0 || Math.abs(event.deltaY) >= WHEEL_NOTCH;
        if (!isWheel) return;

        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        const delta = event.deltaY * unit;
        const position = window.scrollY;
        const boundary = contentPosition();

        // Approach the article boundary natively, then stop there before revealing
        // the hero. This also catches a wheel step that would cross the boundary.
        if (delta < 0 && position > boundary + 2 && position + delta <= boundary + 2) {
            event.preventDefault();
            stop();
            window.scrollTo({ top: boundary, left: window.scrollX, behavior: 'instant' });
            return;
        }

        const towardContent = delta > 0 && position < boundary - 2;
        const towardHero = delta < 0 && position > 2 && position <= boundary + 2;
        if (!towardContent && !towardHero) return;

        event.preventDefault();
        transitionTo(towardContent ? boundary : 0);
    }, { passive: false });

    // Other input methods remain native and can interrupt the guided transition.
    window.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) stop();
    });
    window.addEventListener('pointerdown', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('resize', stop);
    window.addEventListener('pagehide', stop);

    // Pagination opens directly at the article list, clear of the sticky navbar.
    window.addEventListener('load', async () => {
        if (window.location.hash !== '#home-content') return;
        if (document.fonts) await document.fonts.ready;
        window.scrollTo({ top: contentPosition(), left: window.scrollX, behavior: 'instant' });
    }, { once: true });
})();
