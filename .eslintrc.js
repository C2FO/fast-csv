module.exports = {
    env: {
        node: true,
        jest: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.build.json',
    },
    plugins: ['@typescript-eslint', 'prettier', 'import', 'jest', 'eslint-plugin-tsdoc'],
    extends: [
        'airbnb-typescript/base',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    ignorePatterns: ['**/build', '**/node_modules', 'documentation'],
    rules: {
        'prettier/prettier': 'error',
        'tsdoc/syntax': 'warn',
        // todo remove this when upgrading airbnb-typescript
        '@typescript-eslint/camelcase': 'off',
        // never allow default export
        'import/prefer-default-export': 'off',
        // never allow default export
        'import/no-default-export': 'error',
        // needed to implement streams api :(
        'no-underscore-dangle': 0,
    },
    overrides: [
        {
            files: ['*.spec.ts'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/ban-ts-comment': 'off',
            },
        },
    ],
};
