/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleDirectories: ['node_modules'],
    roots: ['<rootDir>'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
