module.exports = {
    root: true,
    env: {
        node: true,
        jest: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        project: ['./packages/*/tsconfig.json', './examples/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint', 'prettier', 'import', 'jest', 'eslint-plugin-tsdoc'],
    extends: [
        'airbnb-typescript/base',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:prettier/recommended',
    ],
    ignorePatterns: ['**/build', '**/node_modules', 'documentation'],
    rules: {
        'prettier/prettier': 'error',
        'tsdoc/syntax': 'warn',
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
        {
            files: ['*.example.ts'],
            rules: {
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
                '@typescript-eslint/restrict-template-expressions': 'off',
            },
        },
        {
            files: ['*.js'],
            parser: '',
            parserOptions: { project: './tsconfig.build.json' },
            rules: {
                'no-console': 'off',
                'prettier/prettier': 'error',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/restrict-template-expressions': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
};
