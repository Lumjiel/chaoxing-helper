// ==UserScript==
// @name         学习通代码编辑器增强
// @namespace    https://github.com/yourusername/chaoxing-helper
// @version      1.0.0
// @description  解决超星学习通代码编辑器无法粘贴、格式错乱、复制受限问题，适配Python/Java/C++等所有语言
// @author       YourName
// @match        *://mooc1.chaoxing.com/*
// @match        *://chaoxing.com/*
// @match        *://*.chaoxing.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        checkInterval: 500,
        maxRetries: 20
    };

    function unlockEditor() {
        const selectors = [
            'textarea',
            '[contenteditable="true"]',
            '.CodeMirror',
            '.CodeMirror-scroll',
            '.CodeMirror-editor'
        ];

        const editElements = document.querySelectorAll(selectors.join(', '));

        editElements.forEach(el => {
            el.onpaste = null;
            el.addEventListener('paste', (e) => {
                e.stopImmediatePropagation();
            }, true);

            el.oncopy = null;
            el.addEventListener('copy', (e) => {
                e.stopImmediatePropagation();
            }, true);

            el.style.userSelect = 'text';
            el.style.webkitUserSelect = 'text';
            el.style.mozUserSelect = 'text';

            el.classList.remove('no-select', 'unselectable');
        });
    }

    function fixCodeMirrorPaste() {
        let retries = 0;

        const timer = setInterval(() => {
            const codeMirrorInstances = window.CodeMirror || document.querySelector('.CodeMirror');

            if (codeMirrorInstances) {
                clearInterval(timer);

                document.querySelectorAll('.CodeMirror').forEach(cmEl => {
                    const cm = cmEl.CodeMirror;

                    if (cm) {
                        cm.on('paste', (instance, e) => {
                            e.preventDefault();
                            const text = e.clipboardData.getData('text/plain');
                            instance.replaceSelection(text);
                        });
                    }
                });
            }

            retries++;
            if (retries >= CONFIG.maxRetries) {
                clearInterval(timer);
            }
        }, CONFIG.checkInterval);
    }

    function init() {
        unlockEditor();
        fixCodeMirrorPaste();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                unlockEditor();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();