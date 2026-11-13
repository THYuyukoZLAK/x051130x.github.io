(() => {
    'use strict';

    // "复制" buttons: copy the text of the element named in data-copy-target.
    document.querySelectorAll('[data-copy-target]').forEach(button => {
        const target = document.getElementById(button.dataset.copyTarget);
        if (!target) return;
        const idle = button.textContent;
        let timer;

        function selectTarget() {
            const range = document.createRange();
            range.selectNodeContents(target);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        button.addEventListener('click', () => {
            const done = label => {
                button.textContent = label;
                clearTimeout(timer);
                timer = setTimeout(() => { button.textContent = idle; }, 1500);
            };
            if (!navigator.clipboard) {
                // No clipboard access: leave the number selected for a manual copy.
                selectTarget();
                done('已选中');
                return;
            }
            navigator.clipboard.writeText(target.textContent.trim())
                .then(() => done('已复制'))
                .catch(() => { selectTarget(); done('已选中'); });
        });
    });
})();
