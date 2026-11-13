(() => {
    'use strict';

    const root = document.documentElement;
    const loader = document.getElementById('loading-screen');
    let finished = false;
    let fadeTimeout;

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(fadeTimeout);
        if (loader) loader.hidden = true;
        root.classList.remove('is-loading');
    }

    async function reveal() {
        // load waits for initial images, stylesheets and scripts; fonts and image
        // decoding can still be finishing. Failed resources must not trap visitors.
        const pending = Array.from(document.images)
            .filter(image => image.complete && image.naturalWidth > 0 && image.decode)
            .map(image => image.decode().catch(() => {}));
        if (document.fonts) pending.push(document.fonts.ready.catch(() => {}));
        await Promise.all(pending);

        if (finished) return;
        if (!loader || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            finish();
            return;
        }

        loader.addEventListener('transitionend', event => {
            if (event.target === loader && event.propertyName === 'opacity') finish();
        });
        loader.classList.add('is-leaving');
        // Only a fade-out fallback, never a timeout for resource loading.
        fadeTimeout = setTimeout(finish, 700);
    }

    if (document.readyState === 'complete') {
        reveal();
    } else {
        window.addEventListener('load', reveal, { once: true });
    }

    // Restoring a page from the back/forward cache does not fire load again.
    window.addEventListener('pageshow', event => {
        if (event.persisted) finish();
    });
})();
