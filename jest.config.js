module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  
  // 转换器
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest'
  },
  
  // Babel 配置
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // 模块名映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@api/(.*)$': '<rootDir>/api/$1',
    '^@stores/(.*)$': '<rootDir>/stores/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@pages/(.*)$': '<rootDir>/pages/$1'
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'api/**/*.js',
    'stores/**/*.js',
    'utils/**/*.js',
    'components/**/*.vue',
    'pages/**/*.vue',
    '!**/node_modules/**',
    '!**/unpackage/**',
    '!**/uni_modules/**'
  ],
  
  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 全局变量
  globals: {
    'uni': {},
    'wx': {},
    'getApp': () => ({}),
    'getCurrentPages': () => []
  }
}
