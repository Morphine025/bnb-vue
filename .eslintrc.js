module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    // Vue 3 规则 - 放宽限制
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/component-name-in-template-casing': 'off',
    'vue/html-self-closing': 'off',
    
    // JavaScript 规则 - 放宽限制
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
    
    // 代码风格 - 放宽限制，避免大量错误
    'indent': 'off',
    'quotes': 'off',
    'semi': 'off',
    'comma-dangle': 'off',
    'space-before-function-paren': 'off',
    'keyword-spacing': 'off',
    'space-infix-ops': 'off',
    'eol-last': 'off',
    'no-trailing-spaces': 'warn'
  },
  globals: {
    // uni-app 全局变量
    'uni': 'readonly',
    'wx': 'readonly',
    'getApp': 'readonly',
    'getCurrentPages': 'readonly',
    'plus': 'readonly',
    'weex': 'readonly'
  },
  ignorePatterns: [
    'unpackage/**',
    'node_modules/**',
    'dist/**',
    'build/**'
  ]
}
