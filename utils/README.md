# Utils 工具函数文档

## 概述

本项目在 `utils/` 目录下提供了丰富的工具函数，涵盖了API处理、缓存管理、错误处理、数据验证、性能监控等多个方面。所有工具函数都经过精心设计，提供了统一的接口和良好的错误处理机制。

## 目录结构

```
utils/
├── apiUtils.js              # API工具函数
├── cacheManager.js          # 缓存管理器
├── constants.js             # 应用常量定义
├── dataValidator.js         # 数据验证工具
├── debounce.js              # 防抖节流工具
├── debugHelper.js           # 调试辅助工具
├── errorHandler.js          # 统一错误处理
├── homestayStatus.js        # 民宿状态管理
├── inputSanitizer.js        # 输入清理工具
├── loadingManager.js        # Loading状态管理
├── performanceMonitor.js    # 性能监控工具
├── priceFormatter.js        # 价格格式化工具
├── shareUtils.js            # 分享工具
├── userInfo.js              # 用户信息管理
└── README.md               # 本文档
```

## 工具函数分类

### 1. API 相关工具

#### apiUtils.js
- **功能**: 提供API相关的工具函数
- **主要方法**:
  - `generateRequestId()`: 生成请求ID
  - `handleApiError()`: 处理API错误
- **特点**: 兼容新的错误处理机制，提供统一的错误分类

#### errorHandler.js
- **功能**: 统一错误处理和用户提示
- **主要特性**:
  - 错误分类（网络错误、API错误、验证错误等）
  - 错误级别管理（低、中、高、严重）
  - 自动用户提示
  - 错误日志记录
- **使用示例**:
```javascript
import { handleError, showSuccess } from '@/utils/errorHandler'

try {
  // API调用
} catch (error) {
  const result = handleError(error, { showToast: true })
  console.log('错误类型:', result.type)
}
```

### 2. 缓存管理

#### cacheManager.js
- **功能**: 提供统一的数据缓存管理
- **主要特性**:
  - 内存缓存机制
  - TTL（生存时间）管理
  - LRU缓存策略
  - 缓存统计信息
- **使用示例**:
```javascript
import { cacheUtils } from '@/utils/cacheManager'

// 设置缓存
cacheUtils.set('user_data', userData, 60000) // 缓存1分钟

// 获取缓存
const userData = cacheUtils.get('user_data')

// 检查缓存
if (cacheUtils.has('user_data')) {
  console.log('缓存命中')
}
```

### 3. 数据验证与清理

#### dataValidator.js
- **功能**: 提供数据验证和清洗功能
- **主要方法**:
  - `validateFollowListData()`: 验证关注列表数据
  - `validateApiResponse()`: 验证API响应格式
  - `sanitizeUserInput()`: 清洗用户输入数据
  - `validatePaginationParams()`: 验证分页参数
- **使用示例**:
```javascript
import { validateApiResponse, sanitizeUserInput } from '@/utils/dataValidator'

// 验证API响应
const result = validateApiResponse(response)
if (result.isValid) {
  console.log('数据有效:', result.data)
} else {
  console.error('验证失败:', result.errors)
}

// 清洗用户输入
const cleanData = sanitizeUserInput(userInput)
```

#### inputSanitizer.js
- **功能**: 提供输入数据的清理和安全验证
- **主要特性**:
  - XSS防护
  - HTML标签清理
  - 特殊字符处理
  - 手机号、昵称、微信号验证
- **使用示例**:
```javascript
import { sanitizeInput, validatePhone, validateNickname } from '@/utils/inputSanitizer'

// 清理输入
const cleanInput = sanitizeInput(userInput, {
  maxLength: 100,
  stripHtml: true
})

// 验证手机号
const isValidPhone = validatePhone('13800138000')

// 验证昵称
const nicknameResult = validateNickname('用户昵称')
if (nicknameResult.valid) {
  console.log('昵称有效:', nicknameResult.cleaned)
}
```

### 4. 性能优化工具

#### debounce.js
- **功能**: 提供防抖和节流功能
- **主要方法**:
  - `debounce()`: 防抖函数
  - `throttle()`: 节流函数
  - `cancellableDebounce()`: 可取消的防抖
  - `createDebouncedSave()`: 创建防抖保存函数
- **使用示例**:
```javascript
import { debounce, throttle } from '@/utils/debounce'

// 防抖搜索
const debouncedSearch = debounce(searchFunction, 300)

// 节流滚动
const throttledScroll = throttle(scrollHandler, 100)
```

#### performanceMonitor.js
- **功能**: 监控应用性能指标
- **主要特性**:
  - 性能指标收集
  - 内存使用监控
  - 性能报告生成
  - 观察者模式
- **使用示例**:
```javascript
import { performanceUtils } from '@/utils/performanceMonitor'

// 开始监控
const monitor = performanceUtils.start('api_call', { endpoint: '/api/users' })

// 执行操作
await apiCall()

// 结束监控
monitor.end()

// 获取统计信息
const stats = performanceUtils.getStats()
console.log('平均执行时间:', stats.averageDuration)
```

### 5. UI 状态管理

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

### 6. 业务工具函数

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

#### userInfo.js
- **功能**: 用户信息管理工具
- **主要方法**:
  - `refreshUserInfo()`: 刷新用户信息
  - `getLocalUserInfo()`: 获取本地用户信息
  - `updateLocalUserInfo()`: 更新本地用户信息
- **使用示例**:
```javascript
import { refreshUserInfo, getLocalUserInfo } from '@/utils/userInfo'

// 刷新用户信息
const userInfo = await refreshUserInfo()

// 获取本地用户信息
const localUserInfo = await getLocalUserInfo()
```

### 7. 常量定义

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

## 最佳实践

### 1. 错误处理
- 使用 `errorHandler.js` 统一处理错误
- 为不同类型的错误提供合适的用户提示
- 记录错误日志便于调试

### 2. 缓存策略
- 根据数据特性设置合适的TTL
- 使用缓存装饰器简化API缓存
- 定期清理过期缓存

### 3. 性能优化
- 使用防抖和节流优化用户交互
- 监控关键操作的性能指标
- 避免不必要的重复计算

### 4. 数据安全
- 对所有用户输入进行清理和验证
- 使用 `inputSanitizer.js` 防止XSS攻击
- 验证API响应数据格式

### 5. 代码组织
- 按功能分类组织工具函数
- 提供清晰的文档和示例
- 保持函数职责单一

## 调试技巧

### 1. 性能监控
```javascript
import { performanceUtils } from '@/utils/performanceMonitor'

// 添加性能观察者
performanceUtils.addObserver('api_call', (metric) => {
  console.log('API调用耗时:', metric.duration)
})
```

### 2. 缓存调试
```javascript
import { cacheUtils } from '@/utils/cacheManager'

// 获取缓存统计
const stats = cacheUtils.getStats()
console.log('缓存统计:', stats)
```

### 3. 错误调试
```javascript
import { errorHandler } from '@/utils/errorHandler'

// 获取错误日志
const errorLog = errorHandler.getErrorLog()
console.log('错误日志:', errorLog)
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
