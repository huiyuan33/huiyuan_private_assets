import { defineClientConfig } from 'vuepress/client';
import { onMounted, onUpdated } from 'vue';

import config from '@config';

export default defineClientConfig({
    setup() {
        const initLogoURL = () => {
            const logo = document.querySelector('.vp-nav-logo');
            if (logo && logo.parentNode) {
                logo.parentNode.addEventListener('click', function () {
                    const res = /^\/(?<lang>[a-zA-Z]+)\//u.exec(
                        window.location.pathname,
                    );
                    if (res) {
                        const lang = res.groups!.lang;
                        window.location.href = `/${lang}/author/`;
                    }
                });
            }
        };
        onMounted(initLogoURL);
        onUpdated(initLogoURL);
    },

    enhance({ router }) {
        router.beforeEach((to, from, next) => {
            if (to.path === '/') {
                next(`/${config.proConfig.defaultLang}/blog/`);
            } else if (/^\/[a-zA-Z\-_]+\/$/u.test(to.path)) {
                next(`${to.path}blog/`);
            } else {
                next();
            }
        });
    },
});
