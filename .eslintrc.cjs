module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    './.eslintrc-auto-import.json',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  ignorePatterns: [
    'dist/*',
    'cypress/*',
    'src/auto-imports.d.ts',
    'src/components.d.ts',
    'src/types.ts',
    'src/shims.d.ts',
    'src/client.d.ts',
  ],
  rules: {
    // override/add rules settings here, such as:
    'no-undef': 'off',  // Disable warnings for google maps library
    'vue/no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/object-curly-spacing': [2, 'always'],
    'vue/html-closing-bracket-spacing': [
      2,
      {
        selfClosingTag: 'always',
      },
    ],
    // 'vue/max-attributes-per-line': [
    //   2,
    //   {
    //     singleline: {
    //       max: 1,
    //     },
    //     multiline: {
    //       max: 1,
    //     },
    //   },
    // ],
  },
}
