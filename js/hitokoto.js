(function () {
    'use strict';

    var box = document.getElementById('hitokoto');
    if (!box) return;

    var textEl = document.getElementById('hitokoto-text');
    var fromEl = document.getElementById('hitokoto-from');

    var ENDPOINT = 'https://v1.hitokoto.cn/?encode=json&charset=utf-8';
    var CACHE_KEY = 'uuz-hitokoto';
    var CACHE_TTL = 10 * 60 * 1000; // 10 minutes

    // Shown when the API is unreachable (offline, blocked, or rate limited).
    var FALLBACKS = [
        { text: '即使你忘却了我，我也不会遗忘你。', from: '《Re:从零开始的异世界生活》' },
        { text: '常識に囚われてはいけないのですね！', from: '《东方妖妖梦》' },
        { text: '与其感慨路难行，不如马上出发。', from: '《东方 project》' }
    ];

    function render(quote) {
        if (!quote || !quote.text) return;
        textEl.textContent = quote.text;
        if (quote.from) {
            fromEl.textContent = '—— ' + quote.from;
            fromEl.hidden = false;
        } else {
            fromEl.textContent = '';
            fromEl.hidden = true;
        }
    }

    function readCache() {
        try {
            var raw = window.sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var cached = JSON.parse(raw);
            if (!cached || Date.now() - cached.at > CACHE_TTL) return null;
            return cached.quote;
        } catch (err) {
            return null;
        }
    }

    function writeCache(quote) {
        try {
            window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), quote: quote }));
        } catch (err) {
            /* storage disabled — just skip caching */
        }
    }

    function fetchQuote() {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 8000);

        return fetch(ENDPOINT, { signal: controller.signal, headers: { Accept: 'application/json' } })
            .then(function (res) {
                if (!res.ok) throw new Error('hitokoto responded ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data || typeof data.hitokoto !== 'string') throw new Error('unexpected payload');
                var from = data.from_who || data.from || '';
                return { text: data.hitokoto, from: from };
            })
            .finally(function () { clearTimeout(timer); });
    }

    function renderFallback() {
        var pick = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
        render(pick);
    }

    textEl.textContent = '正在获取一言…';

    var cached = readCache();
    if (cached) {
        render(cached);
        return;
    }

    // The API can take several seconds; show a local line straight away and
    // swap it for the remote one when it arrives.
    renderFallback();

    fetchQuote()
        .then(function (quote) {
            render(quote);
            writeCache(quote);
        })
        .catch(function (err) {
            console.warn('[hitokoto]', err && err.message);
        });
})();
