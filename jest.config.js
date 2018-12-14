module.exports = {
    transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
    },
    testRegex: '(/__tests__/.*(\\.|/)(test|spec))\\.ts?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts, js}'],
    coverageDirectory: 'test-coverage',
};
