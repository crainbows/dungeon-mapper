module.exports = {
    env: {
      browser: true,
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
    },
    parser: "babel-eslint",
    rules: {
      'no-console': ['warn']
    },
  };