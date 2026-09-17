// @ts-check

const { createLintConfig } = require('@openedx/frontend-base/tools');

module.exports = createLintConfig(
  {
    files: [
      'src/**/*',
      'site.config.*',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'babel.config.js',
            'eslint.config.js',
            'jest.config.js',
          ],
        },
      },
    },
  },
);
