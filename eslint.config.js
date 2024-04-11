require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@electron-toolkit',
    '@vue/eslint-config-prettier',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off'
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "out/",
    ".gitignore"
  ]
};
