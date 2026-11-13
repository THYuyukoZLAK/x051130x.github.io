(() => {
    'use strict';

    const root = document.documentElement;
    window.uuzMotionReady = true;

    // The inline script in the layout leaves this class off when the visitor
    // asked for reduced motion; nothing below should run then.
    if (!root.classList.contains('js-motion')) return;

    // --- Hero quote: one span per character, revealed in sequence -----------
    const quote = document.querySelector('.headfront-quote');
    if (quote && !quote.querySelector('.ch')) {
        const text = quote.textContent;
        quote.setAttribute('aria-label', text);
        quote.textContent = '';
        Array.from(text).forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'ch';
            span.setAttribute('aria-hidden', 'true');
            span.style.setProperty('--i', index);
            span.textContent = char;
            quote.appendChild(span);
        });
    }

    // --- Scroll reveal: each element plays once, neighbours are staggered ---
    const targets = document.querySelectorAll(
        '.home-posts .section-heading, .home-posts .uuz-post-entry, .proj-card, .postbody h1'
    );

    function reveal(el, index) {
        el.style.setProperty('--reveal-i', index);
        el.classList.add('is-revealing', 'is-revealed');
        // Drop the staggered transition afterwards so hover states stay crisp.
        setTimeout(() => {
            el.classList.remove('is-revealing');
            el.style.removeProperty('--reveal-i');
        }, 900 + index * 60);
    }

    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('is-revealed'));
    } else {
        const observer = new IntersectionObserver(entries => {
            let index = 0;
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                reveal(entry.target, index++);
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        targets.forEach(el => observer.observe(el));
    }

    // --- Artwork parallax: the picture leans away from the pointer ----------
    const stage = document.querySelector('.is-home .mainpage-bg');
    const hero = document.querySelector('.is-home .headfront');
    if (stage && hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const MAX_SHIFT = 8; // px
        let queued = false;
        let x = 0;
        let y = 0;

        hero.addEventListener('pointermove', event => {
            x = (event.clientX / window.innerWidth - .5) * -2 * MAX_SHIFT;
            y = (event.clientY / window.innerHeight - .5) * -2 * MAX_SHIFT;
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                stage.style.setProperty('--art-x', x.toFixed(1) + 'px');
                stage.style.setProperty('--art-y', y.toFixed(1) + 'px');
            });
        });
        hero.addEventListener('pointerleave', () => {
            stage.style.setProperty('--art-x', '0px');
            stage.style.setProperty('--art-y', '0px');
        });
    }
})();
