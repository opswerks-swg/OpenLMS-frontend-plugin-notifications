module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.tsx',
  ],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-intl|intl-messageformat|@formatjs|@openedx|@edx)/)',
  ],
  moduleNameMapper: {
    '\\.(css|scss)$': require.resolve('identity-obj-proxy'),
    '\\.svg$': '<rootDir>/src/__mocks__/svg.js',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^react-intl$': require.resolve('react-intl'),
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/setupTest.tsx',
    'src/i18n',
    'src/__mocks__',
    'src/Notification/test-harness.tsx',
    'src/app.ts',
    'src/slots.tsx',
  ],
  modulePathIgnorePatterns: [
    '/dist/',
  ],
  testPathIgnorePatterns: [
    '/site.config.test.tsx',
    '/node_modules/',
    '/dist/',
  ],
};
