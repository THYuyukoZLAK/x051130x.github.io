(() => {
    'use strict';

    const body = document.querySelector('.postbody');
    if (!body) return;

    const wide = window.matchMedia('(min-width: 992px)');

    // --- Table of contents: open panel on desktop, fold-away bar below ------
    const box = document.getElementById('uuz-post-toc-box');
    const current = document.getElementById('post-toc-current');
    if (box) {
        const sync = () => { box.open = wide.matches; };
        sync();
        wide.addEventListener('change', sync);
        box.addEventListener('click', event => {
            if (!wide.matches && event.target.closest('a')) box.open = false;
        });
    }

    // --- Figures: frame standalone images, show their alt text as a caption --
    body.querySelectorAll('p > img').forEach(img => {
        const p = img.parentElement;
        if (p.childElementCount !== 1 || p.textContent.trim() !== '') return;

        const figure = document.createElement('figure');
        figure.className = 'post-figure decr-cornercontainer';
        figure.appendChild(img);
        ['tl', 'tr', 'bl', 'br'].forEach(pos => {
            const corner = document.createElement('div');
            corner.className = 'corner-' + pos;
            figure.appendChild(corner);
        });
        if (img.alt) {
            const caption = document.createElement('figcaption');
            caption.textContent = img.alt;
            figure.appendChild(caption);
        }
        p.replaceWith(figure);
    });

    // --- Current section and reading progress -------------------------------
    const links = Array.from(document.querySelectorAll('#uuz-post-toc a[href^="#"]'));
    const sections = links.map(link => {
        let id = link.getAttribute('href').slice(1);
        try { id = decodeURIComponent(id); } catch (err) { /* keep the raw id */ }
        return { link, heading: document.getElementById(id) };
    }).filter(item => item.heading);

    const progress = document.getElementById('post-progress');
    let active = null;
    let queued = false;

    function update() {
        queued = false;

        // A heading counts as current once it has passed the top third.
        const line = window.innerHeight / 3;
        let found = null;
        for (const item of sections) {
            if (item.heading.getBoundingClientRect().top <= line) found = item;
            else break;
        }
        if (found !== active) {
            if (active) active.link.classList.remove('is-active');
            if (found) found.link.classList.add('is-active');
            if (current) current.textContent = found ? found.link.textContent : '';
            active = found;
        }

        if (progress) {
            const rect = body.getBoundingClientRect();
            const span = rect.height - window.innerHeight / 2;
            const done = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 1;
            progress.style.transform = 'scaleX(' + done + ')';
        }
    }

    function schedule() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
})();
