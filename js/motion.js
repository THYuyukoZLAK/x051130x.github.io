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

    // --- Artwork: pointer parallax and the scroll shutter -------------------
    const stage = document.querySelector('.art-stage');
    const hero = document.querySelector('.headfront');
    const heroText = document.querySelector('.headfront-text');
    const content = document.getElementById('home-content');
    const navbar = document.getElementById('global-navbar');
    if (!stage || !hero || !content) return;

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const MAX_SHIFT = 8; // px
        let moveQueued = false;
        let x = 0;
        let y = 0;

        hero.addEventListener('pointermove', event => {
            x = (event.clientX / window.innerWidth - .5) * -2 * MAX_SHIFT;
            y = (event.clientY / window.innerHeight - .5) * -2 * MAX_SHIFT;
            if (moveQueued) return;
            moveQueued = true;
            requestAnimationFrame(() => {
                moveQueued = false;
                stage.style.setProperty('--art-x', x.toFixed(1) + 'px');
                stage.style.setProperty('--art-y', y.toFixed(1) + 'px');
            });
        });
        hero.addEventListener('pointerleave', () => {
            stage.style.setProperty('--art-x', '0px');
            stage.style.setProperty('--art-y', '0px');
        });
    }

    // Shutter timeline, as fractions of the scroll distance from the top of
    // the page to the post list:
    //   .05 – .40  hero text fades out
    //   .10 – .55  artwork narrows to a viewfinder frame
    //   .55 – .90  the frame shuts sideways (marks turn red halfway)
    //   .78 – .98  the post list fades in on the plain page colour
    const FRAME = [.10, .55];
    const SHUT = [.55, .90];
    const TEXT_OUT = [.05, .40];
    const LIST_IN = [.78, .98];
    const FRAME_WIDTH = { landscape: .64, portrait: .76 }; // share of the screen
    const FRAME_RATIO = { landscape: 9 / 16, portrait: 5 / 4 }; // height / width
    const MIN_INSET_Y = 8; // % kept above and below the frame

    const span = (p, range) => Math.min(Math.max((p - range[0]) / (range[1] - range[0]), 0), 1);
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    let shutterQueued = false;

    function distance() {
        const navHeight = navbar ? navbar.getBoundingClientRect().height : 0;
        return window.scrollY + content.getBoundingClientRect().top - navHeight;
    }

    function drawShutter() {
        shutterQueued = false;
        const total = distance();
        const p = total > 0 ? Math.min(window.scrollY / total, 1) : 1;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const mode = height > width ? 'portrait' : 'landscape';
        const frameWidth = FRAME_WIDTH[mode];
        const insetX = (1 - frameWidth) / 2 * 100;
        const frameHeight = frameWidth * width * FRAME_RATIO[mode];
        const insetY = Math.max((height - frameHeight) / 2 / height * 100, MIN_INSET_Y);

        const framing = easeOut(span(p, FRAME));
        const shutting = easeOut(span(p, SHUT));

        stage.style.setProperty('--fx', (insetX * framing + (50 - insetX) * shutting).toFixed(2) + '%');
        stage.style.setProperty('--fy', (insetY * framing).toFixed(2) + '%');
        stage.style.setProperty('--art-o', (1 - .35 * framing).toFixed(3));
        stage.classList.toggle('is-framed', framing > 0 && p < SHUT[1]);
        stage.classList.toggle('is-closing', shutting > .5);
        stage.classList.toggle('is-closed', p >= SHUT[1]);

        if (heroText) heroText.style.opacity = (1 - span(p, TEXT_OUT)).toFixed(3);
        const listIn = span(p, LIST_IN);
        content.style.opacity = listIn >= 1 ? '' : listIn.toFixed(3);
    }

    function queueShutter() {
        if (shutterQueued) return;
        shutterQueued = true;
        requestAnimationFrame(drawShutter);
    }

    drawShutter();
    window.addEventListener('scroll', queueShutter, { passive: true });
    window.addEventListener('resize', queueShutter);
    window.addEventListener('load', drawShutter, { once: true });
})();
