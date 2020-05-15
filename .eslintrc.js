module.exports = {
    env: {
        node: true,
        jest: true,
    },

    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.build.json',
    },
    plugins: [
        '@typescript-eslint',
        'prettier',
        'import',
        'jest',
        'eslint-plugin-tsdoc',
    ],
    extends: [
        'airbnb-base',
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    ignorePatterns: ["**/build", "**/node_modules", "documentation"],
    rules: {
        "tsdoc/syntax": "warn",
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                'ts': 'never',
                'js': 'never',
            },
        ],
        'prettier/prettier': 'error',
        "no-underscore-dangle": 0,
        // C2FO Preference
        'func-names': [
            'error',
            'always',
        ],
        'max-len': [
            'error',
            150,
            2,
            {
                'ignoreComments': false,
                'ignoreRegExpLiterals': true,
                'ignoreStrings': true,
                'ignoreTemplateLiterals': true,
                'ignoreUrls': true,
            },
        ],
        'import/prefer-default-export': 0,
        'max-classes-per-file': ['error', 5],
        'import/no-cycle': 0,
    },
    settings: {
        'import/extensions': [
            '.ts',
            '.js',
        ],
        'import/parsers': {
            '@typescript-eslint/parser': [
                '.ts',
            ],
        },
        'import/resolver': {
            node: {
                'extensions': [
                    '.ts',
                ],
            },
            typescript: {
                'alwaysTryTypes': true,
            },
        },
    },
    overrides: [
        {
            "files": [
                "*.spec.ts"
            ],
            "rules": {
                "@typescript-eslint/explicit-function-return-type": "off",
                "@typescript-eslint/ban-ts-ignore": "off"
            }
        },
        {
            "files": [
                "*.js",
                "examples/example-runner/bin/run-examples"
            ],
            "rules": {
                "@typescript-eslint/explicit-function-return-type": "off",
                "@typescript-eslint/no-var-requires": "off"
            }
        }
    ],
};
