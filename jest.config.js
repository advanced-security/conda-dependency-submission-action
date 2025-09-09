/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        useESM: true
      }],
      '^.+\\.js$': 'babel-jest'
    },
    transformIgnorePatterns: [
      // Transform ES modules in node_modules that need it
      'node_modules/(?!(.*\\.mjs$|@github|@octokit|@actions))'
    ],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    }
  };