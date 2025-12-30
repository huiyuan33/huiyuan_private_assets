const { defineFlatConfig } = require('eslint-define-config');

const {
    parser: tsParser,
    plugin: tsPlugin,
    configs: tsConfigs,
} = require('typescript-eslint');

const jsRules = require('./src/jsRules.js');
const tsRules = require('./src/tsRules.js');
const vueRules = require('./src/vueRules.js');

module.exports = defineFlatConfig([
    require('eslint-plugin-prettier/recommended'),
    ...tsConfigs.recommended,
    ...require('eslint-plugin-vue').configs['flat/essential'],

    {
        // 全局配置统一忽略目录
        name: '@hyuan: global-ignore',
        ignores: [
            '**/{.vscode,build,dist,test}',
            '**/node_modules',
            '**/public',
            '**/coverage',
            '**/.cache',
            '**/.temp',
            '**/.prettierrc.{js,cjs,mjs}',
            '**/eslint.config.{js,cjs,mjs}',
        ],
    },
    {
        name: '@hyuan: js&cjs-rules',
        files: ['**/*.{js,cjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: jsRules,
    },
    {
        name: '@hyuan: ts-rules',
        files: ['**/*.ts'],
        ignores: ['**/*.d.ts'],
        languageOptions: {
            parser: tsParser,
        },
        rules: Object.assign({}, jsRules, tsRules),
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
    },
    {
        name: '@hyuan: vue-rules',
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tsParser,
            },
        },
        rules: Object.assign({}, jsRules, tsRules, vueRules),
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
    },
]);
