module.exports = {
    env: {
      node: true,
      'jest/globals': true
    },
    extends: [
      'eslint:recommended'
    ],
    plugins: [
      'jest'
    ],
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'eqeqeq': ['error', 'always'],
      'no-console': ['warn']
    }
  };