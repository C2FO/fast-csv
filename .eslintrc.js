module.exports = {
    parser: "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.json"
    },
    plugins: ["@typescript-eslint"],
    extends: ["airbnb-base", "plugin:@typescript-eslint/recommended"],
    env: {
        node: true,
        mocha: true,
    },
    settings:{
        "import/resolver": {
            node: {
                extensions: [".ts"]
            }
        }
    },
    globals: {
        NodeJS: 'readonly',
    },
    rules: {
        "indent": [
            "error",
            4
        ],
        "comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "never"
        }],
        "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
        "object-curly-spacing": ["error", "always"],
        "array-bracket-spacing": ["error", "always"],
        "no-underscore-dangle": 0,
        "max-len": ["error", 150, 2, {
            ignoreComments: false,
            ignoreUrls: true,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        }]
    },
};
