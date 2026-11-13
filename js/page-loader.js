(() => {
    'use strict';

    // Two classes on <html>, both set by the inline script in the layout:
    //   is-loading   the curtain is up (first page of a browser session only)
    //   is-entering  page contents are in their pre-entrance state
    // Removing is-entering starts every entrance on the page.
    const root = document.documentElement;
    const loader = document.getElementById('loading-screen');

    const MIN_MS = 500;   // long enough to read as a moment, not a flash
    const MAX_MS = 1200;  // never hold the page longer than this
    const FADE_MS = 700;  // fallback for the curtain's own fade-out

    window.uuzLoaderReady = true;

    function enter() {
        root.classList.remove('is-entering');
    }

    function finish() {
        if (loader) loader.hidden = true;
        root.classList.remove('is-loading');
        enter();
    }

    // Start entrances on the frame after the first paint; the timer covers
    // tabs that are opened in the background and get no frames.
    function enterSoon() {
        let done = false;
        const go = () => { if (!done) { done = true; enter(); } };
        requestAnimationFrame(() => requestAnimationFrame(go));
        setTimeout(go, 120);
    }

    if (!root.classList.contains('is-loading')) {
        if (loader) loader.hidden = true;
        enterSoon();
    } else {
        let lifted = false;

        const lift = () => {
            if (lifted) return;
            lifted = true;
            if (!loader) { finish(); return; }
            loader.addEventListener('transitionend', event => {
                if (event.target === loader && event.propertyName === 'opacity') finish();
            });
            loader.classList.add('is-leaving');
            enter(); // contents arrive while the curtain fades
            setTimeout(finish, FADE_MS);
        };

        // Wait for the fonts, not for images, and never past MAX_MS.
        const fonts = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
        fonts.then(() => setTimeout(lift, Math.max(MIN_MS - performance.now(), 0)));
        setTimeout(lift, Math.max(MAX_MS - performance.now(), 0));
    }

    // Restoring a page from the back/forward cache does not run scripts again.
    window.addEventListener('pageshow', event => {
        if (event.persisted) finish();
    });
})();
