# Pinia 状态管理文档

## 概述

本项目使用 Pinia 作为状态管理库，按照功能模块进行了清晰的分层设计。经过全面优化，已建立子模块结构，统一导出管理，依赖关系清晰。所有状态管理代码位于 `stores/` 目录下。采用模块化架构，支持按需导入，提供完整的类型安全和错误处理机制。

## 目录结构

```
stores/
├── index.js                 # 入口文件，统一导出所有store
├── modules/                 # store模块目录
│   ├── app.js              # 应用全局状态
│   ├── cache.js            # 缓存模块状态
│   ├── loading.js          # 统一Loading状态管理
│   ├── message.js          # 消息模块状态
│   ├── ui.js               # UI模块状态
│   ├── user.js             # 用户模块状态（主模块）
│   ├── homestay.js         # 民宿模块状态（主模块）
│   ├── homestay/           # 民宿子模块
│   │   ├── favorites.js    # 收藏状态
│   │   └── filter.js       # 筛选状态
│   ├── user/               # 用户子模块
│   │   ├── follow.js       # 关注功能
│   │   ├── profile.js      # 用户资料
│   │   ├── settings.js     # 用户设置
│   │   └── stats.js         # 用户统计
│   └── search/             # 搜索子模块
│       ├── history.js      # 搜索历史
│       ├── search.js       # 搜索功能
│       └── suggestions.js  # 搜索建议
└── README.md               # 本文档
```

## 模块说明

### 1. 应用模块 (app.js)

**功能**: 管理应用级别的全局状态

**主要状态**:
- `appConfig`: 应用配置信息
- `globalUI`: 全局UI状态
- `userInfo`: 用户信息
- `isAppReady`: 应用初始化状态

**主要方法**:
- `initApp()`: 初始化应用
- `setUserInfo(user)`: 设置用户信息
- `logout()`: 用户登出

**使用示例**:
```javascript
import { useAppStore } from '@/stores'

const appStore = useAppStore()

// 初始化应用
await appStore.initApp()

// 设置用户信息
appStore.setUserInfo({ id: '1', name: '用户' })

// 检查登录状态
if (appStore.isLoggedIn) {
  console.log('用户已登录')
}
```

### 2. 民宿模块 (homestay.js)

**功能**: 管理民宿相关的所有状态

**主要状态**:
- `homestayList`: 民宿列表
- `homestayDetail`: 民宿详情
- `filterConditions`: 筛选条件
- `favoriteHomestays`: 收藏的民宿

**主要方法**:
- `loadMoreHomestays()`: 加载更多民宿
- `setFilterConditions(conditions)`: 设置筛选条件
- `toggleFavorite(homestay)`: 切换收藏状态
- `refreshHomestayList()`: 刷新民宿列表

**使用示例**:
```javascript
import { useHomestayStore } from '@/stores'

const homestayStore = useHomestayStore()

// 加载民宿列表
await homestayStore.loadMoreHomestays()

// 设置筛选条件
homestayStore.setFilterConditions({
  location: '北京',
  priceRange: [100, 500],
  rating: 4
})

// 切换收藏
homestayStore.toggleFavorite(homestay)

// 获取筛选后的列表
const filteredList = homestayStore.filteredList
```

### 3. 搜索模块 (search.js)

**功能**: 管理搜索相关的所有状态

**主要状态**:
- `searchHistory`: 搜索历史
- `hotSearches`: 热门搜索
- `searchResults`: 搜索结果
- `searchSuggestions`: 搜索建议

**主要方法**:
- `performSearch(keyword)`: 执行搜索
- `addToSearchHistory(keyword)`: 添加到搜索历史
- `getSearchSuggestions(keyword)`: 获取搜索建议
- `clearSearchHistory()`: 清空搜索历史

**使用示例**:
```javascript
import { useSearchStore } from '@/stores'

const searchStore = useSearchStore()

// 执行搜索
await searchStore.performSearch('海边民宿')

// 获取搜索建议
await searchStore.getSearchSuggestions('海')

// 添加到搜索历史
searchStore.addToSearchHistory('海边民宿')

// 获取最近搜索
const recentSearches = searchStore.recentSearches
```

### 4. UI模块 (ui.js)

**功能**: 管理UI相关的所有状态

**主要状态**:
- `globalLoading`: 全局加载状态
- `globalError`: 全局错误状态
- `theme`: 主题设置
- `modalVisible`: 弹窗状态

**主要方法**:
- `showGlobalLoading(text)`: 显示全局加载
- `showError(message, title)`: 显示错误提示
- `showSuccess(message)`: 显示成功提示
- `setTheme(theme)`: 设置主题

**使用示例**:
```javascript
import { useUIStore } from '@/stores'

const uiStore = useUIStore()

// 显示加载状态
uiStore.showGlobalLoading('正在加载...')

// 显示错误提示
uiStore.showError('网络连接失败', '错误')

// 显示成功提示
uiStore.showSuccess('操作成功！')

// 设置主题
uiStore.setTheme('dark')

// 显示确认弹窗
uiStore.showConfirm('确认删除', '确定要删除这个项目吗？', 
  () => console.log('确认'), 
  () => console.log('取消')
)
```

### 5. 缓存模块 (cache.js)

**功能**: 管理数据缓存和离线数据

**主要状态**:
- `cacheData`: 缓存数据
- `offlineData`: 离线数据
- `syncStatus`: 同步状态

**主要方法**:
- `setCache(key, data)`: 设置缓存
- `getCache(key)`: 获取缓存
- `addToOfflineQueue(action)`: 添加到离线队列
- `syncOfflineData()`: 同步离线数据

**使用示例**:
```javascript
import { useCacheStore } from '@/stores'

const cacheStore = useCacheStore()

// 设置缓存
cacheStore.setCache('user_data', { id: 1, name: '用户' })

// 获取缓存
const userData = cacheStore.getCache('user_data')

// 添加到离线队列
cacheStore.addToOfflineQueue({
  type: 'CREATE_HOMESTAY',
  data: { title: '新民宿' }
})

// 同步离线数据
await cacheStore.syncOfflineData()

// 获取缓存信息
const cacheInfo = cacheStore.getCacheInfo()
```

### 6. Loading模块 (loading.js)

**功能**: 统一管理应用中的Loading状态

**主要状态**:
- `loadingCount`: Loading计数
- `loadingText`: Loading文本
- `isLoading`: 是否正在加载

**主要方法**:
- `showLoading(text)`: 显示Loading
- `hideLoading()`: 隐藏Loading
- `forceHideLoading()`: 强制隐藏所有Loading
- `getLoadingStatus()`: 获取Loading状态

**使用示例**:
```javascript
import { useLoadingStore } from '@/stores'

const loadingStore = useLoadingStore()

// 显示Loading
loadingStore.showLoading('加载中...')

// 检查状态
const status = loadingStore.getLoadingStatus()
console.log('Loading计数:', status.count)

// 隐藏Loading
loadingStore.hideLoading()
```

## 子模块组织

### 民宿子模块 (homestay/)

#### favorites.js - 收藏状态
```javascript
import { useFavoritesStore } from '@/stores'

const favoritesStore = useFavoritesStore()

// 添加收藏
favoritesStore.addFavorite(homestay)

// 移除收藏
favoritesStore.removeFavorite(homestayId)

// 检查是否已收藏
const isFavorited = favoritesStore.isFavorited(homestayId)
```

#### filter.js - 筛选状态
```javascript
import { useFilterStore } from '@/stores'

const filterStore = useFilterStore()

// 设置筛选条件
filterStore.setFilterConditions({
  location: '北京',
  priceRange: [100, 500],
  rating: 4
})

// 清空筛选
filterStore.clearFilters()

// 获取筛选结果
const filteredList = filterStore.filteredList
```

### 用户子模块 (user/)

#### follow.js - 关注功能
```javascript
import { useFollowStore } from '@/stores'

const followStore = useFollowStore()

// 关注用户
await followStore.followUser(userId)

// 取消关注
await followStore.unfollowUser(userId)

// 获取关注列表
const followList = await followStore.getFollowList()
```

#### profile.js - 用户资料
```javascript
import { useProfileStore } from '@/stores'

const profileStore = useProfileStore()

// 更新用户资料
await profileStore.updateProfile(userData)

// 获取用户资料
const profile = await profileStore.getProfile()

// 上传头像
await profileStore.uploadAvatar(file)
```

#### settings.js - 用户设置
```javascript
import { useSettingsStore } from '@/stores'

const settingsStore = useSettingsStore()

// 更新设置
settingsStore.updateSettings(settings)

// 获取设置
const settings = settingsStore.getSettings()

// 重置设置
settingsStore.resetSettings()
```

#### stats.js - 用户统计
```javascript
import { useStatsStore } from '@/stores'

const statsStore = useStatsStore()

// 获取用户统计
const stats = await statsStore.getUserStats()

// 更新统计
statsStore.updateStats(newStats)
```

### 搜索子模块 (search/)

#### history.js - 搜索历史
```javascript
import { useSearchHistoryStore } from '@/stores'

const historyStore = useSearchHistoryStore()

// 添加搜索历史
historyStore.addSearchHistory('海边民宿')

// 获取搜索历史
const history = historyStore.getSearchHistory()

// 清空搜索历史
historyStore.clearSearchHistory()
```

#### search.js - 搜索功能
```javascript
import { useSearchStore } from '@/stores'

const searchStore = useSearchStore()

// 执行搜索
const results = await searchStore.performSearch('民宿')

// 获取搜索结果
const searchResults = searchStore.searchResults

// 清空搜索结果
searchStore.clearSearchResults()
```

#### suggestions.js - 搜索建议
```javascript
import { useSuggestionsStore } from '@/stores'

const suggestionsStore = useSuggestionsStore()

// 获取搜索建议
const suggestions = await suggestionsStore.getSuggestions('海')

// 获取热门搜索
const hotSearches = await suggestionsStore.getHotSearches()
```

## 状态分层设计

### 全局状态 (Global State)
- **应用配置信息**: 版本、API地址、调试模式等
- **全局UI状态**: 网络状态、系统信息、导航栏状态等
- **用户信息**: 登录状态、用户资料等
- **缓存数据**: 全局缓存、离线数据等

### 模块级状态 (Module State)
- **用户模块**: 用户信息、关注、粉丝、统计等
- **民宿模块**: 民宿列表、详情、筛选、收藏等
- **搜索模块**: 搜索历史、建议、热门搜索等
- **聊天模块**: 对话列表、消息、未读数量等

### 页面级状态 (Page State)
- **临时状态**: 表单数据、临时选择等
- **页面数据**: 列表数据、详情数据等
- **页面UI**: 页面特定的加载状态、错误状态等

### 组件级状态 (Component State)
- **展示逻辑状态**: 组件显示/隐藏、展开/收起等
- **交互状态**: 按钮状态、输入状态等
- **本地状态**: 组件内部的计算属性、临时变量等

## 最佳实践

### 1. 状态命名规范
- 使用驼峰命名法
- 状态名要清晰表达含义
- 避免使用缩写

### 2. 方法命名规范
- 使用动词开头
- 方法名要表达操作意图
- 异步方法使用 async/await

### 3. 状态更新规范
- 使用 store 提供的方法更新状态
- 避免直接修改状态值
- 批量更新时使用对象展开语法

### 4. 错误处理
- 所有异步操作都要有错误处理
- 使用 try-catch 包装异步操作
- 错误信息要用户友好

### 5. 性能优化
- 合理使用计算属性
- 避免不必要的状态更新
- 使用轻量级缓存减少重复请求
- 使用防抖和节流优化用户交互
- 使用虚拟滚动处理大数据量列表
- 合理使用持久化，避免过度存储
- 使用模块化导入，减少初始加载时间

### 6. 错误处理
- 所有异步操作都要有错误处理
- 使用 try-catch 包装异步操作
- 错误信息要用户友好
- 记录错误日志便于调试

### 7. 数据持久化
- 合理使用持久化存储
- 避免存储敏感信息
- 定期清理过期数据
- 使用版本控制管理数据结构变更

## 调试技巧

### 1. 使用 Vue DevTools
- 安装 Vue DevTools 浏览器扩展
- 在开发环境中查看状态变化
- 使用时间旅行功能调试状态

### 2. 控制台调试
```javascript
// 查看所有状态
console.log('App Store:', appStore.$state)
console.log('Homestay Store:', homestayStore.$state)

// 监听状态变化
homestayStore.$subscribe((mutation, state) => {
  console.log('状态变化:', mutation, state)
})
```

### 3. 持久化调试
```javascript
// 查看本地存储
console.log('搜索历史:', uni.getStorageSync('search_history'))
console.log('主题配置:', uni.getStorageSync('ui_theme_config'))
```

## 常见问题

### 1. 状态不更新
- 检查是否正确导入 store
- 确认使用 store 提供的方法更新状态
- 检查响应式引用是否正确

### 2. 状态丢失
- 检查持久化配置是否正确
- 确认本地存储权限
- 检查存储空间是否充足

### 3. 性能问题
- 避免在计算属性中执行复杂操作
- 合理使用缓存
- 避免不必要的状态订阅

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完成所有基础模块
- 添加完整的使用示例
- 提供详细的文档说明

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
- 建立子模块结构
- 统一导出管理
- 简化依赖关系
- 优化架构设计