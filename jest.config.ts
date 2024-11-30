/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    "<rootDir>/src/app/app.config.ts",     // Ignore specific file
    "<rootDir>/src/app/app.routes.ts"
  ],

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts', // Adjust this pattern to match your source files
    '!src/**/*.spec.ts', // Exclude test files
    '!src/main.ts',
    '!src/app/app.config.ts',
    '!src/app/app.routes.ts'// You can exclude specific files
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  moduleNameMapper: {
    '^@fta/(.*)': '<rootDir>/src/app/$1',
    '^@fta-assets/(.*)': '<rootDir>/src/assets/$1',
  }

};

module.exports = config;
