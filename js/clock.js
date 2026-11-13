(() => {
    'use strict';

    // The clock block may appear several times on one page.
    const timeEls = document.querySelectorAll('[data-clock="time"]');
    const dateEls = document.querySelectorAll('[data-clock="date"]');
    if (!timeEls.length && !dateEls.length) return;

    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    function tick() {
        const now = new Date();
        const timeText = time.format(now);
        const dateText = date.format(now);
        timeEls.forEach(el => { el.textContent = timeText; });
        dateEls.forEach(el => { el.textContent = dateText; });
    }

    tick();
    setInterval(tick, 1000);
})();
