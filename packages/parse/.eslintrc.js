module.exports = {
    rules: {
        'jest/expect-expect': [
            'error',
            {
                assertFunctionNames: ['expect', 'expectParsed', 'expectErrorEvent', 'expectTokenContent'],
            },
        ],
    },
};
