/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    moduleDirectories: ['node_modules'],
    roots: ['<rootDir>'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
