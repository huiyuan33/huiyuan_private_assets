/**
 * js 代码规则制定(https://eslint.org/docs/latest/rules)
 * 针对js语法规则
 */

module.exports = {
    'prefer-const': 2,
    'for-direction': 2,
    'getter-return': 2,
    'no-async-promise-executor': 2,
    'no-compare-neg-zero': 2,
    'no-cond-assign': 2,
    'no-console': 1,
    'no-constant-condition': 2,
    'no-debugger': 1,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-empty': 2,
    'no-func-assign': 2,
    'no-inner-declarations': 2,
    'no-implicit-coercion': 2,
    'no-lone-blocks': 2,
    'no-new-wrappers': 2,
    'no-param-reassign': 2,
    'no-proto': 2,
    'no-script-url': 2,
    'no-throw-literal': 2,
    'no-useless-call': 2,
    'no-useless-escape': 2,
    'prefer-named-capture-group': 2,
    'prefer-promise-reject-errors': 2,
    'require-await': 2,
    'require-unicode-regexp': 2,
    'no-warning-comments': [
        2,
        {
            terms: ['todo', 'fix'],
            location: 'start',
        },
    ],
    'yoda': 2,
    'camelcase': 2,
    'consistent-this': [2, 'self'],
    'line-comment-position': 2,
    'max-depth': [2, 4],
    'max-lines': [2, 1000],
    'max-lines-per-function': [
        2,
        {
            max: 200,
        },
    ],
    'max-statements-per-line': [
        2,
        {
            max: 1,
        },
    ],
    'new-cap': 2,
    'no-mixed-operators': [
        2,
        {
            groups: [
                ['&', '|', '^', '~', '<<', '>>', '>>>'],
                ['&&', '||'],
            ],
            allowSamePrecedence: true,
        },
    ],
    'constructor-super': 2,
    'prefer-rest-params': 2,

    'no-redeclare': 2,
    'no-unused-vars': 0,
    'no-use-before-define': 2,
    'no-shadow': 2,
};
