(() => {
    'use strict';

    // The table of contents is a fold-away bar on phones and tablets and an
    // always-open panel beside the article on wide screens.
    const box = document.getElementById('uuz-post-toc-box');
    if (!box) return;

    const wide = window.matchMedia('(min-width: 992px)');
    const sync = () => { box.open = wide.matches; };
    sync();
    wide.addEventListener('change', sync);

    // Following a link from the folded bar closes it again.
    box.addEventListener('click', event => {
        if (!wide.matches && event.target.closest('a')) box.open = false;
    });
})();
