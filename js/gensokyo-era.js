(function () {
    'use strict';

    var el = document.getElementById('gensokyo-era');
    if (!el) return;

    var DAY = ['日', '月', '星'];
    var SEASON = ['春', '夏', '秋', '冬'];
    var ELEMENT = ['火', '水', '木', '金', '土'];

    var BASE_YEAR = 2010;   // 第125季 星与夏与土之年
    var BASE_SEASON = 125;

    function mod(value, base) {
        return ((value % base) + base) % base;
    }

    // The three cycles are 3, 4 and 5 years long, so the whole calendar
    // repeats every 60 years; normalising the offset keeps that bounded.
    function eraFor(year) {
        var offset = year - BASE_YEAR;
        var n = mod(offset, 60);

        return '第' + (BASE_SEASON + offset) + '季 ' +
            DAY[mod(2 + n, 3)] + '与' +
            SEASON[mod(1 + n, 4)] + '与' +
            ELEMENT[mod(4 + n, 5)] + '之年';
    }

    // The build already rendered this for the build year; refresh it so the
    // label stays right on a site that has not been rebuilt for a while.
    var text = eraFor(new Date().getFullYear());
    if (el.textContent.trim() !== text) {
        el.textContent = text;
    }
})();
