# API 使用指南

## 📋 概述

本项目采用统一的API管理架构，提供模块化API调用方式，支持完整的民宿转让业务功能。经过全面优化，已消除功能重复，简化架构设计，提升维护效率。所有API接口都经过精心设计，提供完整的JSDoc注释和错误处理机制。

## 🏗️ 架构设计

```
api/
├── config/index.js          # 统一配置管理
├── index.js                # 统一API入口（159行）
├── http.js                 # HTTP请求封装
├── core/                   # 核心功能
│   ├── BaseAPI.js         # API基类（简化版，44行）
│   └── ErrorHandler.js    # 错误处理
├── interceptors/           # 请求/响应拦截器
│   ├── requestInterceptor.js
│   └── responseInterceptor.js
├── modules/                # 模块化API类
│   ├── UserAPI.js         # 用户相关API（302行，功能完整）
│   ├── HomestayAPI.js     # 民宿相关API
│   ├── SearchAPI.js       # 搜索相关API
│   ├── RegionAPI.js       # 地区相关API
│   └── ChatAPI.js         # 聊天相关API
└── README.md              # 本文档
```

## 🚀 推荐使用方式

### 1. 模块化API调用（推荐）

```javascript
import { API } from '@/api'

// 用户相关
const userInfo = await API.user.getInfo()
const userStats = await API.user.getStats()
const followList = await API.user.getFollowList({ page: 1, size: 10 })
const myList = await API.user.getMyList({ page: 1, size: 10 })
const userList = await API.user.getUserList(userId, { page: 1, size: 10 })

// 民宿相关
const homestayList = await API.homestay.getHomeList({ page: 1, size: 10 })
const homestayDetail = await API.homestay.getDetail(homestayId)
const searchResults = await API.homestay.search({ keyword: '民宿' })

// 搜索相关（搜索建议、热门搜索等）
const suggestions = await API.search.getSuggestions({ keyword: '民宿' })
const hotSearches = await API.search.getHotSearches()

// 地区相关
const provinces = await API.region.getProvinces()
const cities = await API.region.getCitiesByProvince(provinceCode)
const searchResults = await API.region.searchRegions('北京')
const regionTree = await API.region.getRegionTree()

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

### 缓存策略

```javascript
// 使用轻量级缓存策略
const cacheConfig = {
  shortTerm: { maxAge: 5 * 60 * 1000, maxSize: 10 * 1024 * 1024 },
  mediumTerm: { maxAge: 60 * 60 * 1000, maxSize: 50 * 1024 * 1024 },
  longTerm: { maxAge: 24 * 60 * 60 * 1000, maxSize: 100 * 1024 * 1024 }
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
- **v1.4.0**: 完善错误处理机制
- **v1.5.0**: 添加请求/响应拦截器
- **v1.6.0**: 优化API文档和架构说明
- **v1.7.0**: 添加渐进式迁移指南
- **v1.8.0**: 优化工具函数架构，将apiUtils移至根目录utils
- **v1.9.0**: 统一搜索功能，将民宿搜索迁移到HomestayAPI
- **v1.10.0**: 统一地区功能，将地区搜索和树形结构迁移到RegionAPI
- **v1.11.0**: 统一用户数据功能，将用户民宿数据迁移到UserAPI
- **v1.12.0**: 移除Mock数据支持，优化缓存策略
- **v1.13.0**: 添加轻量级缓存和性能优化
- **v1.14.0**: 架构优化完成，消除功能重复，简化设计

## 🔄 迁移指南

### 从传统API到模块化API
我们正在从传统的函数式API调用方式迁移到模块化API架构。

**快速迁移示例：**
```javascript
// 旧方式
import { getBanner, getUserInfo } from '@/api'
const banner = await getBanner()
const user = await getUserInfo()

// 新方式（推荐）
import { API } from '@/api'
const banner = await API.homestay.getBanner()
const user = await API.user.getInfo()
```

## ✅ 优化成果

### 功能重复消除
- **搜索功能统一**: 已合并SearchAPI和HomestayAPI的重复搜索功能
- **地区功能统一**: 已合并SearchAPI和RegionAPI的重复地区功能
- **用户数据统一**: 已合并UserAPI和HomestayAPI的重复用户数据功能

### 架构简化
- **BaseAPI简化**: 已简化为44行代码，提供基础GET/POST方法
- **错误处理简化**: 已简化错误处理机制，保持功能完整性的同时提升性能
- **模块职责明确**: 各API模块职责清晰，无功能重叠

## 🔧 API接口总览

### 用户相关接口
- **用户认证**：`API.user.login()` - 微信登录
- **用户信息**：`API.user.getInfo()` - 获取当前用户信息
- **用户详情**：`API.user.getInfoById()` - 根据ID获取用户信息
- **更新信息**：`API.user.updateInfo()` - 更新用户信息
- **用户统计**：`API.user.getStats()` - 获取用户统计数据
- **关注管理**：`API.user.getFollowList()` - 获取关注列表
- **粉丝管理**：`API.user.getFansList()` - 获取粉丝列表
- **关注操作**：`API.user.toggleFollow()` - 关注/取消关注
- **关注状态**：`API.user.checkFollowStatus()` - 检查关注状态
- **移除粉丝**：`API.user.removeFan()` - 移除粉丝
- **关注动态**：`API.user.getFollowFeed()` - 获取关注动态
- **关注民宿**：`API.user.getFollowHomestayList()` - 获取关注的民宿列表
- **收藏管理**：`API.user.getCollectList()` - 获取收藏列表
- **喜欢管理**：`API.user.getLikeList()` - 获取喜欢列表
- **浏览历史**：`API.user.getViewHistory()` - 获取浏览历史
- **添加历史**：`API.user.addViewHistory()` - 添加浏览历史
- **删除历史**：`API.user.removeViewHistory()` - 删除浏览历史
- **清空历史**：`API.user.clearViewHistory()` - 清空浏览历史
- **房东联系**：`API.user.getLandlordContact()` - 获取房东联系方式

### 民宿相关接口
- **轮播图**：`API.homestay.getBanner()` - 获取首页轮播图
- **首页列表**：`API.homestay.getHomeList()` - 获取首页民宿列表
- **民宿详情**：`API.homestay.getDetail()` - 获取民宿详情
- **发布民宿**：`API.homestay.publish()` - 发布新民宿
- **更新民宿**：`API.homestay.update()` - 更新民宿信息
- **删除民宿**：`API.homestay.delete()` - 删除民宿
- **上架民宿**：`API.homestay.online()` - 上架民宿
- **下架民宿**：`API.homestay.offline()` - 下架民宿
- **点赞操作**：`API.homestay.toggleLike()` - 点赞/取消点赞
- **收藏操作**：`API.homestay.toggleCollect()` - 收藏/取消收藏
- **我的民宿**：`API.homestay.getMyList()` - 获取我的民宿列表
- **地区筛选**：`API.homestay.filterByRegion()` - 按地区筛选民宿
- **用户民宿**：`API.homestay.getUserList()` - 获取指定用户的民宿列表
- **搜索民宿**：`API.homestay.search()` - 搜索民宿

### 搜索相关接口
- **搜索建议**：`API.search.getSuggestions()` - 获取搜索建议
- **热门搜索**：`API.search.getHotSearches()` - 获取热门搜索
- **搜索历史**：`API.search.getSearchHistory()` - 获取搜索历史
- **清空历史**：`API.search.clearSearchHistory()` - 清空搜索历史
- **地区搜索**：`API.search.searchRegions()` - 搜索地区
- **地区树形**：`API.search.getRegionTree()` - 获取地区树形结构

### 地区相关接口
- **省份列表**：`API.region.getProvinces()` - 获取省份列表
- **城市列表**：`API.region.getCitiesByProvince()` - 根据省份获取城市列表
- **区县列表**：`API.region.getDistrictsByCity()` - 根据城市获取区县列表
- **标签列表**：`API.region.getTagList()` - 获取地区标签列表
- **地区搜索**：`API.region.searchRegions()` - 搜索地区
- **地区树形**：`API.region.getRegionTree()` - 获取地区树形结构

### 聊天相关接口
- **创建对话**：`API.chat.createConversation()` - 创建新对话
- **对话列表**：`API.chat.getConversations()` - 获取对话列表
- **对话详情**：`API.chat.getConversation()` - 获取对话详情
- **发送消息**：`API.chat.sendMessage()` - 发送消息
- **消息列表**：`API.chat.getMessages()` - 获取消息列表
- **标记已读**：`API.chat.markMessagesAsRead()` - 标记消息为已读
- **未读数量**：`API.chat.getUnreadMessageCount()` - 获取未读消息数量
- **置顶对话**：`API.chat.pinConversation()` - 置顶对话
- **取消置顶**：`API.chat.unpinConversation()` - 取消置顶
- **删除对话**：`API.chat.deleteConversation()` - 删除对话
- **自动发送**：`API.chat.autoSendLandlordContact()` - 自动发送房东联系方式

### 图片上传接口
- **图片上传**：`API.uploadImage()` - 上传图片文件