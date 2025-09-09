// ESLint v9 flat config (CommonJS)
const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['dist/**']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'commonjs'
    },
    rules: {
      ...js.configs.recommended.rules
    }
  }
];
