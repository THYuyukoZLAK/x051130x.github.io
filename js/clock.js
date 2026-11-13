(() => {
    'use strict';

    const timeEl = document.getElementById('banner-time');
    const dateEl = document.getElementById('banner-date');
    if (!timeEl && !dateEl) return;

    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    function tick() {
        const now = new Date();
        if (timeEl) timeEl.textContent = time.format(now);
        if (dateEl) dateEl.textContent = date.format(now);
    }

    tick();
    setInterval(tick, 1000);
})();
