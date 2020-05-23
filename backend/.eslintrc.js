module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    parserOptions: {
        ecmaVersion: 2019, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    plugins: ['jest'],
    env: {
        es6: true,
        node: true,
        'jest/globals': true,
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
        '@typescript-eslint/interface-name-prefix': 'off',
        'comma-dangle': ['error', 'only-multiline'],
        quotes: [
            'error',
            'single',
            { avoidEscape: true, allowTemplateLiterals: true },
        ],
        semi: ['error', 'always'],
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
