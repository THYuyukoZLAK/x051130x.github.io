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

    // Pixel-equivalent wheel distance; about three conventional wheel notches.
    const WHEEL_THRESHOLD = 300;
    const TRANSITION_MS = 400;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let accumulated = 0;
    let direction = 0;
    let gesturePosition = 0;
    let frame = null;

    function reset() {
        accumulated = 0;
        direction = 0;
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
        accumulated = 0;
        direction = 0;

        if (reducedMotion.matches) {
            window.scrollTo({ top: target, left, behavior: 'instant' });
            return;
        }

        const started = performance.now();
        function animate(now) {
            const progress = Math.min((now - started) / TRANSITION_MS, 1);
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
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
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        const delta = event.deltaY * unit;
        const position = window.scrollY;
        const boundary = contentPosition();
        const nextDirection = Math.sign(delta);

        // Approach the article boundary natively, then stop there before revealing
        // the hero. This also catches a wheel step that would cross the boundary.
        if (delta < 0 && position > boundary + 2 && position + delta <= boundary + 2) {
            event.preventDefault();
            reset();
            window.scrollTo({ top: boundary, left: window.scrollX, behavior: 'instant' });
            return;
        }

        const towardContent = delta > 0 && position < boundary - 2;
        const towardHero = delta < 0 && position > 2 && position <= boundary + 2;
        if (!towardContent && !towardHero) {
            accumulated = 0;
            direction = 0;
            return;
        }

        event.preventDefault();
        if (direction !== nextDirection || Math.abs(position - gesturePosition) > 2) accumulated = 0;
        direction = nextDirection;
        gesturePosition = position;
        accumulated += Math.min(Math.abs(delta), 120);
        if (accumulated >= WHEEL_THRESHOLD) transitionTo(towardContent ? boundary : 0);
    }, { passive: false });

    // Other input methods remain native and can interrupt the guided transition.
    window.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) reset();
    });
    window.addEventListener('pointerdown', reset, { passive: true });
    window.addEventListener('touchstart', reset, { passive: true });
    window.addEventListener('resize', reset);
    window.addEventListener('pagehide', reset);
    window.addEventListener('scroll', () => {
        if (frame === null && Math.abs(window.scrollY - gesturePosition) > 2) {
            accumulated = 0;
            direction = 0;
        }
    }, { passive: true });

    // Pagination opens directly at the article list, clear of the sticky navbar.
    window.addEventListener('load', async () => {
        if (window.location.hash !== '#home-content') return;
        if (document.fonts) await document.fonts.ready;
        window.scrollTo({ top: contentPosition(), left: window.scrollX, behavior: 'instant' });
    }, { once: true });
})();
