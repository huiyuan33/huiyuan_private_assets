import { hopeTheme } from 'vuepress-theme-hope';

import config from '../../config';
import { navbar, sidebar } from './config/index';

export default hopeTheme({
    darkmode: 'toggle',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    iconAssets: <any>config.proConfig.iconFontUrl,

    logo: config.siteConfig.avatar,
    repo: config.siteConfig.github,
    docsDir: config.siteConfig.codeDir,

    lastUpdated: true,
    author: {
        name: config.personConfig.author,
        url: config.personConfig.url,
    },

    // blog: {
    //     medias: {
    //         BiliBili: 'https://example.com',
    //         VuePressThemeHope: {
    //             icon: 'https://theme-hope-assets.vuejs.press/logo.svg',
    //             link: 'https://theme-hope.vuejs.press',
    //         },
    //     },
    // },

    locales: {
        '/en/': {
            navbar: navbar.en,
            sidebar: sidebar.en,

            blog: {
                description: 'A FrontEnd programmer',
                intro: '/en/author/',
            },
            metaLocales: {
                editLink: 'Edit this page on GitHub',
            },

            displayFooter: true,

            footer: `MIT Licensed | Copyright © 2024-present <a href="/en/author/">${config.personConfig.author}</a> 陕ICP备2023021541号-1`,
            copyright: false,
        },

        '/zh/': {
            navbar: navbar.zh,
            sidebar: sidebar.zh,

            blog: {
                description: '一个前端开发者',
                intro: '/zh/author/',
            },
            metaLocales: {
                editLink: '在 GitHub 上编辑此页',
            },

            displayFooter: true,
            footer: `MIT Licensed | Copyright © 2024-present <a href="/zh/author/">${config.personConfig.author}</a> 陕ICP备2023021541号-1`,
            copyright: false,
        },
    },

    encrypt: {
        config: {
            // '/zh/blog/article/': [config.proConfig.articlePWord],
            // '/en/blog/article/': [config.proConfig.articlePWord],
        },
    },

    breadcrumb: false,

    // enable it to preview all changes in time
    // hotReload: true,

    plugins: {
        blog: true,

        readingTime: false,

        // Install @waline/client before enabling it
        // Note: This is for testing ONLY!
        // You MUST generate and use your own comment service in production.
        // comment: {
        //   provider: "Waline",
        //   serverURL: "https://waline-comment.vuejs.press",
        // },

        components: {
            components: ['Badge', 'VPCard'],
        },

        // These features are enabled for demo, only preserve features you need here
        markdownImage: {
            figure: true,
            lazyload: true,
            size: true,
        },

        // markdownMath: {
        //   // install katex before enabling it
        //   type: "katex",
        //   // or install mathjax-full before enabling it
        //   type: "mathjax",
        // },

        // This features is enabled for demo, only preserve if you need it
        markdownTab: true,

        // These features are enabled for demo, only preserve features you need here
        mdEnhance: {
            flowchart: true,
            footnote: true,
            vPre: true,
            attrs: true,
            align: true,
            mark: true,
            // vuePlayground: true,

            component: true,
            include: true,
            plantuml: true,
            spoiler: true,
            sub: true,
            sup: true,
            tasklist: true,
            stylize: [
                {
                    matcher: /^(?<key>不|没)/u,
                    replacer: ({ tag, attrs, content }) => {
                        if (tag === 'em')
                            return {
                                tag: 'span',
                                attrs: { ...attrs, style: 'color: red' },
                                content,
                            };
                    },
                },
            ],

            // install chart.js before enabling it
            // chart: true,

            // insert component easily

            // install echarts before enabling it
            // echarts: true,

            // install flowchart.ts before enabling it
            // flowchart: true,

            // gfm requires mathjax-full to provide tex support
            // gfm: true,

            // install mermaid before enabling it
            // mermaid: true,

            // playground: {
            //   presets: ["ts", "vue"],
            // },

            // install @vue/repl before enabling it
            // vuePlayground: true,

            // install sandpack-vue3 before enabling it
            // sandpack: true,
        },
    },
});
