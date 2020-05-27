module.exports = {
    env: {
        node: true,
    },
    plugins: ['prettier', 'import', 'jest'],
    extends: ['airbnb-base', 'eslint:recommended', 'prettier'],
    ignorePatterns: ['**/build', '**/node_modules', 'documentation', '.eslintrc.js'],
    rules: {
        'prettier/prettier': 'error',
        'no-console': 0,

        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-var-requires': 'off',
    },
};
