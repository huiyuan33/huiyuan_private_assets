import { NavbarOptions } from 'vuepress-theme-hope';

export const navbar: LanguageFieldsConfig<NavbarOptions> = {
    zh: [
        {
            link: '/zh/home/',
            text: '首页',
            icon: 'home',
        },
        {
            text: '文档',
            icon: 'y-document',
            prefix: '/zh/document/',
            children: [
                {
                    icon: 'y-vue',
                    text: 'vue3源码',
                    link: 'vue3/',
                },
                {
                    icon: 'y-data-structure',
                    text: '数据结构',
                    link: 'data-structure/',
                },
                {
                    icon: 'y-tool',
                    text: '工具包',
                    link: 'tool/',
                },
            ],
        },
        {
            link: '/zh/blog/',
            text: '博客',
            icon: 'y-blog',
        },
        {
            link: '/zh/toolkit/',
            text: '工具',
            icon: 'y-toolkit',
        },
        {
            link: '/zh/photo/',
            text: '图片',
            icon: 'y-image',
        },
        {
            link: '/zh/video/',
            text: '视频',
            icon: 'y-video',
        },
    ],

    en: [
        {
            link: '/en/home/',
            text: 'Home',
            icon: 'y-home',
        },
        {
            link: '/en/document/',
            text: 'Document',
            icon: 'y-document',
            prefix: '/en/document/',
            children: [
                {
                    icon: 'y-vue',
                    text: 'vue3 source code',
                    link: 'vue3/demo1',
                },
                {
                    icon: 'y-data-structure',
                    text: 'data structure',
                    link: 'data-structure/demo1',
                },
            ],
        },
        {
            link: '/en/blog/',
            text: 'Blog',
            icon: 'y-blog',
        },
        {
            link: '/en/tool/',
            text: 'Tookit',
            icon: 'y-tool',
        },
        {
            link: '/en/photo/',
            text: 'Image',
            icon: 'y-image',
        },
        {
            link: '/en/video/',
            text: 'Video',
            icon: 'y-video',
        },
    ],
};
