module.exports = {
    env: {
        node: true,
    },
    plugins: ['prettier', 'import', 'jest'],
    extends: ['airbnb-base', 'eslint:recommended', 'prettier'],
    ignorePatterns: ['**/build', '**/node_modules', 'documentation', '.eslintrc.js'],
    rules: {
        'prettier/prettier': 'error',
        'no-underscore-dangle': 0,
        // C2FO Preference
        'func-names': ['error', 'always'],
        'max-len': [
            'error',
            150,
            2,
            {
                ignoreComments: false,
                ignoreRegExpLiterals: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreUrls: true,
            },
        ],
        'import/prefer-default-export': 0,
        'max-classes-per-file': ['error', 5],
        'import/no-cycle': 0,
        'no-console': 0,
    },
};
