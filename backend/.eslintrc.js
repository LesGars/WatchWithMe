module.exports = {
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
    },
    env: {
        es6: true,
        node: true,
    },
    rules: {
        '@typescript-eslint/no-unused-vars': [
            'error',
            { ignoreRestSiblings: true },
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/interface-name-prefix': [
            2,
            { prefixWithI: 'always' },
        ],
        '@typescript-eslint/member-delimiter-style': [
            2,
            {
                multiline: {
                    delimiter: 'none',
                    requireLast: false,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false,
                },
            },
        ],
        'comma-dangle': ['error', 'only-multiline'],
        quotes: [
            'error',
            'single',
            { avoidEscape: true, allowTemplateLiterals: true },
        ],
        semi: ['error', 'never'],
        'max-lines': [
            2,
            { max: 150, skipBlankLines: true, skipComments: true },
        ],
        'max-lines-per-function': [
            'error',
            { max: 50, skipBlankLines: true, skipComments: true },
        ],
        complexity: ['error', 5],
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.test.js'],
            env: {
                jest: true,
            },
        },
    ],
};
