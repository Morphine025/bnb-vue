# Utils 工具函数文档

## 概述

本项目在 `utils/` 目录下提供了精简高效的工具函数，涵盖了API处理、缓存管理、数据验证、性能监控、安全防护等核心功能。经过全面优化，已消除重复代码，简化架构设计，提升维护效率。所有工具函数都经过简化设计，避免过度复杂，提供简洁的接口和良好的性能表现。工具函数按功能模块化组织，支持按需导入，便于维护和扩展。

## 重构说明

本次重构主要解决了以下问题：
- **简化过度设计**：移除了复杂的LRU缓存策略、性能统计功能等
- **合并重复代码**：统一了验证逻辑、错误处理机制
- **减少代码冗余**：合并了相似功能的模块
- **提升可维护性**：简化了API接口，降低了学习成本

## 目录结构

```
utils/
├── security/                # 安全相关工具
│   ├── dataValidator.js    # 统一数据验证和输入清理工具
│   ├── urlConverter.js     # URL转换工具
│   ├── environmentDetector.js # 环境检测工具
│   └── developmentHelper.js # 开发辅助工具
├── performance/             # 性能相关工具
│   ├── performanceMonitor.js # 性能监控工具
│   ├── debounce.js         # 防抖节流工具
│   └── virtualList.js      # 虚拟滚动工具
├── api/                    # API相关工具
│   └── apiUtils.js         # 统一错误处理工具
├── cache/                  # 缓存相关工具
│   └── cacheManager.js     # 轻量级缓存管理器
├── ui/                     # UI相关工具
│   ├── loadingManager.js   # Loading状态管理
│   ├── shareUtils.js       # 分享工具
│   └── imageErrorHandler.js # 图片错误处理
├── business/               # 业务相关工具
│   ├── homestayStatus.js   # 民宿状态管理
│   ├── priceFormatter.js   # 价格格式化工具
│   └── userInfo.js         # 用户信息管理
├── debug/                  # 调试相关工具
│   └── debugHelper.js      # 调试辅助工具
├── error/                  # 错误处理工具
│   ├── errorHandler.js     # 错误处理器
│   ├── errorLogger.js      # 错误日志
│   ├── errorMessages.js    # 错误消息
│   ├── errorTypes.js       # 错误类型
│   └── errorUtils.js       # 错误工具
├── constants/              # 常量定义
│   └── constants.js         # 应用常量定义
├── index.js                # 统一入口文件
└── README.md               # 本文档
```

## 工具函数分类

### 1. 性能相关工具 (performance/)

#### performanceMonitor.js
- **功能**: 提供简化的性能监控功能
- **主要方法**:
  - `startTimer()`: 开始计时
  - `endTimer(startTime)`: 结束计时
  - `measure(name, fn)`: 监控函数执行时间
- **使用示例**:
```javascript
import { startTimer, endTimer, measure } from '@/utils/performance/performanceMonitor'

// 基础计时
const startTime = startTimer()
// ... 执行操作
const duration = endTimer(startTime)

// 监控函数执行
const result = await measure('api_call', async () => {
  return await api.getData()
})
```

#### debounce.js
- **功能**: 提供防抖和节流功能
- **主要方法**:
  - `debounce(func, wait)`: 防抖函数
  - `throttle(func, wait)`: 节流函数
  - `smartDebounce(func, type)`: 智能防抖
  - `smartThrottle(func, type)`: 智能节流

#### virtualList.js
- **功能**: 虚拟滚动工具，处理大数据量列表
- **主要方法**:
  - `createVirtualList(items, config)`: 创建虚拟列表
  - `useVirtualList(items, config)`: Vue 3 Hook
  - `createVirtualListConfig(options)`: 创建配置

### 2. 缓存相关工具 (cache/)

#### cacheManager.js
- **功能**: 提供简化的缓存管理
- **主要方法**:
  - `setCache(key, value, ttl)`: 设置缓存
  - `getCache(key)`: 获取缓存
  - `hasCache(key)`: 检查缓存是否存在
  - `deleteCache(key)`: 删除缓存
  - `clearCache()`: 清空所有缓存
  - `withCache(ttl)`: 缓存装饰器
- **使用示例**:
```javascript
import { setCache, getCache, withCache } from '@/utils/cache/cacheManager'

// 基础缓存操作
setCache('user_info', userData, 5 * 60 * 1000)
const userData = getCache('user_info')

// 使用缓存装饰器
const cachedApiCall = withCache(5 * 60 * 1000)(apiCall)
```

### 3. API相关工具 (api/)

#### apiUtils.js
- **功能**: 提供统一的错误处理工具
- **主要方法**:
  - `generateRequestId()`: 生成请求ID
  - `handleError(error, context, options)`: 统一错误处理
  - `showSuccess(message)`: 显示成功提示
  - `showError(message)`: 显示错误提示
- **使用示例**:
```javascript
import { generateRequestId, handleError, showSuccess } from '@/utils/api/apiUtils'

const requestId = generateRequestId()
try {
  // API调用
  showSuccess('操作成功')
} catch (error) {
  handleError(error, 'API调用失败')
}
```

### 4. 业务相关工具 (business/)

#### homestayStatus.js
- **功能**: 提供简化状态管理功能
- **主要方法**:
  - `createSimpleStatusManager(statusMap)`: 创建状态管理器
  - `getStatusText(status)`: 获取状态文本
  - `getStatusColor(status)`: 获取状态颜色
- **使用示例**:
```javascript
import { createSimpleStatusManager, homestayStatusMap } from '@/utils/business/homestayStatus'

const statusManager = createSimpleStatusManager(homestayStatusMap)
const text = statusManager.getStatusText('0') // '审核中'
const color = statusManager.getStatusColor('0') // '#faad14'
```

#### userInfo.js
- **功能**: 提供简化用户信息管理
- **主要方法**:
  - `createSimpleUserInfoManager(apiClient, storageKey)`: 创建用户信息管理器
  - `refreshUserInfo()`: 刷新用户信息
  - `getLocalUserInfo()`: 获取本地用户信息
- **使用示例**:
```javascript
import { createSimpleUserInfoManager } from '@/utils/business/userInfo'

const userInfoManager = createSimpleUserInfoManager({
  getInfo: UserAPI.getInfo,
  updateInfo: UserAPI.updateInfo
}, 'userInfo')
const userInfo = await userInfoManager.refreshUserInfo()
```

### 5. 安全相关工具 (security/)

#### dataValidator.js (已合并输入清理功能)
- **功能**: 提供统一的数据验证和输入清理功能
- **主要方法**:
  - `validate(data, rules)`: 通用验证函数
  - `validateApiResponse(response)`: 验证API响应
  - `validateUserId(userId)`: 用户ID验证
  - `validatePhone(phone)`: 手机号验证
  - `validateEmail(email)`: 邮箱验证
  - `sanitizeInput(input, options)`: 清洗用户输入
  - `stripHtmlTags(input)`: 清理HTML标签
  - `sanitizeSpecialChars(input)`: 清理特殊字符
  - `sanitizeStringInput(input, options)`: 清理字符串输入
  - `validateNickname(nickname, options)`: 验证昵称
  - `validateWechat(wechat, options)`: 验证微信号
  - `isValidImageUrl(url)`: 验证图片URL
  - `isInputSafe(input)`: 检查输入安全性
- **特点**: 统一验证、XSS防护、输入清理、数据验证

### 6. UI相关工具 (ui/)

#### loadingManager.js
- **功能**: 统一管理应用中的Loading状态
- **主要特性**:
  - Loading计数机制
  - 避免Loading冲突
  - 强制隐藏功能
- **使用示例**:
```javascript
import { showLoading, hideLoading, getLoadingStatus } from '@/utils/loadingManager'

// 显示Loading
showLoading('加载中...', true)

// 检查状态
const status = getLoadingStatus()
console.log('Loading计数:', status.count)

// 隐藏Loading
hideLoading()
```

#### shareUtils.js
- **功能**: 提供各种分享功能
- **主要方法**:
  - `shareToWechat()`: 分享到微信
  - `shareToMoments()`: 分享到朋友圈
  - `copyLink()`: 复制链接
  - `showShareOptions()`: 显示分享选项
- **使用示例**:
```javascript
import { shareToWechat, showShareOptions } from '@/utils/shareUtils'

// 分享到微信
await shareToWechat(homestayItem)

// 显示分享选项
await showShareOptions(homestayItem)
```

### 7. 业务工具函数

#### priceFormatter.js
- **功能**: 价格格式化工具
- **主要方法**:
  - `formatPrice()`: 格式化价格显示（如10000显示为1万）
  - `formatPriceWithSymbol()`: 带货币符号的价格格式化
- **使用示例**:
```javascript
import { formatPrice, formatPriceWithSymbol } from '@/utils/priceFormatter'

const price = 15000
console.log(formatPrice(price))        // "1.5万"
console.log(formatPriceWithSymbol(price)) // "¥1.5万"
```

### 8. 常量定义

#### constants.js
- **功能**: 统一管理应用中的常量和配置
- **主要内容**:
  - 表单验证常量
  - 用户信息字段定义
  - 字段验证规则
  - 防抖延迟时间
  - 提示信息
  - 错误消息
- **使用示例**:
```javascript
import { FORM_CONSTANTS, ERROR_MESSAGES, DEBOUNCE_DELAY } from '@/utils/constants'

// 使用常量
const maxLength = FORM_CONSTANTS.NICKNAME_MAX_LENGTH
const errorMsg = ERROR_MESSAGES.NETWORK_ERROR
const delay = DEBOUNCE_DELAY.SEARCH
```

## 统一入口管理

### index.js
- **功能**: 统一导出所有工具函数
- **主要特性**:
  - 按功能分组导出
  - 便于维护和管理
  - 支持按需导入
- **使用示例**:
```javascript
// 按功能分组导入
import { 
  // 性能工具
  debounce, throttle, startTimer, endTimer,
  // 缓存工具
  setCache, getCache, withCache,
  // 验证工具
  validate, sanitizeInput, validatePhone,
  // 业务工具
  formatPrice, createSimpleStatusManager
} from '@/utils'

// 或者按模块导入
import { performanceUtils, cacheUtils, validationUtils } from '@/utils'
```

## 最佳实践

### 1. 性能优化
- 使用轻量级性能监控，避免过度设计
- 合理使用缓存，设置合适的TTL
- 使用防抖和节流优化用户交互

### 2. 缓存策略
- 根据数据特性设置合适的TTL
- 使用缓存装饰器简化API缓存
- 定期清理过期缓存

### 3. 状态管理
- 使用简化的状态管理器，避免业务耦合
- 保持状态映射简单明了
- 减少不必要的复杂逻辑

### 4. 数据安全
- 对所有用户输入进行清理和验证
- 使用 `dataValidator.js` 防止XSS攻击
- 验证API响应数据格式
- 使用 `urlConverter.js` 处理URL转换
- 使用 `environmentDetector.js` 检测运行环境

### 5. 错误处理
- 使用统一的错误处理机制
- 记录详细的错误日志
- 提供用户友好的错误消息
- 区分不同类型的错误

### 6. 代码组织
- 按功能分类组织工具函数
- 提供清晰的文档和示例
- 保持函数职责单一，避免过度设计
- 支持按需导入，减少打包体积

## 调试技巧

### 1. 性能监控
```javascript
import { startTimer, endTimer, measure } from '@/utils/performance/performanceMonitor'

// 基础计时
const timer = startTimer('api_call')
// ... 执行操作
const duration = endTimer('api_call')

// 监控函数执行
const result = await measure('api_call', async () => {
  return await api.getData()
})
```

### 2. 缓存调试
```javascript
import { setCache, getCache, withCache } from '@/utils/cache/cacheManager'

// 基础缓存操作
setCache('user_info', userData, 5 * 60 * 1000)
const userData = getCache('user_info')

// 使用缓存装饰器
const cachedFunction = withCache(5 * 60 * 1000)(originalFunction)
```

### 3. 状态管理调试
```javascript
import { createSimpleStatusManager, homestayStatusMap } from '@/utils/business/homestayStatus'

const statusManager = createSimpleStatusManager(homestayStatusMap)
const text = statusManager.getStatusText('0')
const color = statusManager.getStatusColor('0')
```

## 常见问题

### 1. 缓存不生效
- 检查缓存键是否正确
- 确认TTL设置是否合理
- 验证数据是否被正确序列化

### 2. 防抖不工作
- 确认函数引用是否正确
- 检查防抖延迟时间设置
- 验证函数调用时机

### 3. 性能监控数据异常
- 确认监控是否正确启动和结束
- 检查内存使用情况
- 验证性能指标计算逻辑

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完成所有基础工具函数
- 添加完整的文档说明
- 提供详细的使用示例

### v1.1.0 (2024-01-15)
- 添加性能优化功能
- 实现防抖和节流机制
- 添加虚拟滚动支持
- 优化缓存策略

### v1.2.0 (2024-01-20)
- 完善方法注释和复杂逻辑说明
- 优化计算属性性能
- 添加性能监控功能
- 移除Mock数据支持

### v1.3.0 (2024-01-25)
- 架构优化完成
- 消除功能重复
- 简化设计
- 建立统一入口管理