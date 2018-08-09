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
        'no-console': ['warn']
    }
  };