# API 使用指南

## 📋 概述

本项目采用统一的API管理架构，提供三种调用方式，推荐使用模块化API调用方式。

## 🏗️ 架构设计

```
api/
├── config/index.js          # 统一配置管理
├── index.js                # 统一API入口
├── http.js                 # HTTP请求封装
├── core/                   # 核心功能
│   ├── BaseAPI.js         # API基类
│   └── ErrorHandler.js    # 错误处理
└── modules/                # 模块化API类
    ├── UserAPI.js         # 用户相关API
    ├── HomestayAPI.js     # 民宿相关API
    ├── SearchAPI.js       # 搜索相关API
    ├── RegionAPI.js       # 地区相关API
    └── ChatAPI.js         # 聊天相关API
```

## 🚀 推荐使用方式

### 1. 模块化API调用（推荐）

```javascript
import { API } from '@/api'

// 用户相关
const userInfo = await API.user.getInfo()
const userStats = await API.user.getStats()
const followList = await API.user.getFollowList({ page: 1, size: 10 })

// 民宿相关
const homestayList = await API.homestay.getHomeList({ page: 1, size: 10 })
const homestayDetail = await API.homestay.getDetail(homestayId)
const searchResults = await API.homestay.search({ keyword: '民宿' })

// 搜索相关
const suggestions = await API.search.getSuggestions({ keyword: '民宿' })
const hotSearches = await API.search.getHotSearches()

// 地区相关
const provinces = await API.region.getProvinces()
const cities = await API.region.getCitiesByProvince(provinceCode)

// 聊天相关
const conversations = await API.chat.getConversations()
const messages = await API.chat.getMessages(conversationId)
```

### 2. 传统函数式API（兼容）

```javascript
import { getUserInfo, getHomestayList, searchHomestay } from '@/api'

const userInfo = await getUserInfo()
const homestayList = await getHomestayList({ page: 1, size: 10 })
const searchResults = await searchHomestay({ keyword: '民宿' })
```

## ⚙️ 配置管理

### 环境配置

```javascript
// api/config/index.js
const config = {
  development: {
    baseUrl: 'http://localhost:8081/api',
    uploadUrl: 'http://localhost:8081/api/upload/image',
    timeout: 10000
  },
  production: {
    baseUrl: 'https://api.production.com/api',
    uploadUrl: 'https://api.production.com/api/upload/image',
    timeout: 15000
  }
}
```

### 修改配置

```javascript
// 修改API地址
config.development.baseUrl = 'http://new-api-server.com/api'

// 修改超时时间
config.development.timeout = 20000
```

## 🔧 错误处理

### 统一错误处理

```javascript
try {
  const result = await API.user.getInfo()
  console.log('成功:', result)
} catch (error) {
  console.error('失败:', error.message)
  // 错误已由BaseAPI统一处理，会显示Toast提示
}
```

### 自定义错误处理

```javascript
try {
  const result = await API.user.getInfo()
} catch (error) {
  // 自定义错误处理
  if (error.code === 401) {
    // 处理未授权
    uni.navigateTo({ url: '/pages/login/login' })
  } else {
    // 其他错误
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}
```

## 📱 微信小程序注意事项

### 1. HTTPS要求

```javascript
// 开发环境使用HTTP（需要内网穿透）
// 生产环境必须使用HTTPS
const config = {
  development: {
    baseUrl: 'http://localhost:8081/api'  // 需要ngrok等工具
  },
  production: {
    baseUrl: 'https://api.production.com/api'  // 必须HTTPS
  }
}
```

### 2. 废弃API处理

```javascript
// 已自动处理微信API废弃警告
// 优先使用新API，降级使用旧API
if (typeof wx !== 'undefined' && wx.getWindowInfo) {
  const windowInfo = wx.getWindowInfo()
  const deviceInfo = wx.getDeviceInfo()
  const appBaseInfo = wx.getAppBaseInfo()
} else {
  const systemInfo = uni.getSystemInfoSync()
}
```

## 🔄 Loading管理

### 统一Loading管理

```javascript
import { showLoading, hideLoading } from '@/utils/loadingManager'

// 显示Loading
showLoading('加载中...', true)

// 隐藏Loading
hideLoading()

// 强制隐藏所有Loading
forceHideLoading()
```

### 避免Loading冲突

```javascript
// ❌ 错误：直接使用uni.showLoading
uni.showLoading({ title: '加载中...' })
uni.hideLoading()

// ✅ 正确：使用统一Loading管理
import { showLoading, hideLoading } from '@/utils/loadingManager'
showLoading('加载中...')
hideLoading()
```

## 📊 性能优化

### 1. 请求去重

```javascript
// Store中已实现请求去重机制
const fetchUserInfo = async () => {
  const requestKey = 'fetchUserInfo'
  if (pendingRequests.has(requestKey)) {
    return // 避免重复请求
  }
  pendingRequests.add(requestKey)
  // ... 执行请求
}
```

### 2. 数据缓存

```javascript
// 详情页缓存
const detailCache = new Map()

const fetchDetail = async (id) => {
  if (detailCache.has(id)) {
    return detailCache.get(id) // 返回缓存数据
  }
  const result = await API.homestay.getDetail(id)
  detailCache.set(id, result) // 缓存数据
  return result
}
```

## 🧪 测试

### 单元测试

```javascript
// 测试API调用
import { API } from '@/api'

describe('User API', () => {
  it('should get user info', async () => {
    const result = await API.user.getInfo()
    expect(result).toBeDefined()
  })
})
```

### Mock数据

```javascript
// 开发环境可以使用Mock数据
if (process.env.NODE_ENV === 'development') {
  // 使用Mock数据
}
```

## 📝 最佳实践

### 1. 统一导入

```javascript
// ✅ 推荐：统一导入
import { API } from '@/api'

// ❌ 避免：分散导入
import { getUserInfo } from '@/api/api'
import { getHomestayList } from '@/api/api'
```

### 2. 错误处理

```javascript
// ✅ 推荐：统一错误处理
try {
  const result = await API.user.getInfo()
} catch (error) {
  // 错误已由BaseAPI处理
}

// ❌ 避免：重复错误处理
try {
  const result = await API.user.getInfo()
} catch (error) {
  uni.showToast({ title: error.message, icon: 'none' })
  // 重复处理，BaseAPI已经处理过了
}
```

### 3. Loading管理

```javascript
// ✅ 推荐：使用统一Loading管理
import { showLoading, hideLoading } from '@/utils/loadingManager'

// ❌ 避免：直接使用uni API
uni.showLoading()
uni.hideLoading()
```

## 🔍 故障排除

### 常见问题

1. **404错误**
   - 检查API路径是否正确
   - 确认后端服务是否启动

2. **Loading不消失**
   - 使用 `forceHideLoading()` 强制隐藏
   - 检查是否有未配对的Loading调用

3. **微信API警告**
   - 已自动处理，无需手动修改

4. **网络错误**
   - 检查网络连接
   - 确认API地址可访问

### 调试技巧

```javascript
// 开启API请求日志
console.log('🚀 API请求:', url, data)

// 检查Loading状态
import { getLoadingStatus } from '@/utils/loadingManager'
console.log('Loading状态:', getLoadingStatus())
```

## 📚 更新日志

- **v1.0.0**: 统一API管理架构
- **v1.1.0**: 添加配置管理
- **v1.2.0**: 统一Loading管理
- **v1.3.0**: 修复微信API废弃警告
