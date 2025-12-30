import { resolve } from 'node:path';

import { getDirname } from 'vuepress/utils';
import { defineUserConfig } from 'vuepress';

import theme from './theme';
import config from '../../config';

const __dirName = getDirname(import.meta.url);

export default defineUserConfig({
    base: '/',
    dest: './dist',
    public: './src/public',

    alias: {
        '@config': resolve(__dirName, '../../config.ts'),
        '@util': resolve(__dirName, '../../src/util'),
    },

    define: {
        //
    },

    markdown: {
        importCode: {
            handleImportPath: (str) =>
                str.replace(
                    /^@package/u,
                    resolve(__dirName, '../../../../packages'),
                ),
        },
    },

    pagePatterns: ['**/*.md', '**/*.vue'],
    locales: {
        '/en/': {
            lang: 'en-US',
            title: config.siteConfig.title,
            description: config.siteConfig.description,
        },
        '/zh/': {
            lang: 'zh-CN',
            title: config.siteConfig.title,
            description: config.siteConfig.description,
        },
    },

    theme,
});
