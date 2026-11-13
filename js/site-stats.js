(function () {
    'use strict';

    var table = document.querySelector('.site-stats');
    if (!table) return;

    var repoCell = document.getElementById('stat-repos');
    var visitCell = document.getElementById('stat-visits');
    var numberFormat = new Intl.NumberFormat('en-US');

    function setText(el, value) {
        if (el && value !== undefined && value !== null && value !== '') {
            el.textContent = value;
        }
    }

    function request(url, timeoutMs) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, timeoutMs || 6000);
        return fetch(url, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
            // Never let a slow third party delay first paint of the page.
            cache: 'no-store'
        }).finally(function () { clearTimeout(timer); });
    }

    function loadRepos() {
        var user = repoCell && repoCell.getAttribute('data-username');
        if (!user) return Promise.resolve();

        return request('https://api.github.com/users/' + encodeURIComponent(user)).then(function (res) {
            if (!res.ok) throw new Error('github responded ' + res.status);
            return res.json();
        }).then(function (data) {
            if (typeof data.public_repos !== 'number') throw new Error('missing public_repos');
            setText(repoCell, numberFormat.format(data.public_repos));
        });
    }

    function loadVisits() {
        var url = table.getAttribute('data-visits-api');
        if (!visitCell || !url) return Promise.resolve();

        return request(url).then(function (res) {
            if (!res.ok) throw new Error('visits endpoint responded ' + res.status);
            return res.json();
        }).then(function (data) {
            if (typeof data.monthly !== 'number') throw new Error('missing monthly count');
            setText(visitCell, numberFormat.format(data.monthly));
            visitCell.title = (data.month || '') + ' 月访问量';
        });
    }

    // Both stats are optional: the placeholder stays when a source is unavailable.
    Promise.allSettled([loadRepos(), loadVisits()]).then(function (results) {
        results.forEach(function (result) {
            if (result.status === 'rejected') {
                console.warn('[site-stats]', result.reason && result.reason.message);
            }
        });

        // Explain the placeholder instead of leaving a bare dash behind.
        if (visitCell && visitCell.textContent.trim() === '—') {
            visitCell.title = '访问统计接口未部署或不可用（见 _config.yml 的 visits_api）';
        }
        if (repoCell && repoCell.textContent.trim() === '—') {
            repoCell.title = 'GitHub 接口请求失败，请稍后重试';
        }
    });
})();
