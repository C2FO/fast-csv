module.exports = {
    root: true,
    env: {
        node: true,
    },
    parser: 'esprima',
    parserOptions: {
        sourceType: 'module',
        project: null,
    },
    plugins: ['prettier', 'import', 'jest'],
    extends: ['airbnb-base', 'eslint:recommended', 'prettier'],
    ignorePatterns: ['**/build', '**/node_modules', 'documentation', '.eslintrc.js'],
    rules: {
        'prettier/prettier': 'error',
        'no-console': 0,
    },
};
