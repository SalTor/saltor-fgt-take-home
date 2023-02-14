/** @type {import('ts-jest').JestConfigWithTsJest} */
const tsconfig = require('./tsconfig.json');
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);

module.exports = {
    moduleNameMapper,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testRegex: "(/__tests__/.*|\\.(test|spec))\\.(js|jsx|ts|tsx)$",
    rootDir: './',
    moduleFileExtensions: [
        "js",
        "json",
        "jsx",
        "ts",
        "tsx"
    ],
    transform: {
        "\\.[jt]sx?$": "babel-jest"
    }
};
