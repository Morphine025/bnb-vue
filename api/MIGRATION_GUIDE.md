# API 渐进式迁移指南

## 📋 概述

本文档指导如何将传统的函数式API调用方式迁移到模块化API架构。迁移采用渐进式策略，确保系统稳定性的同时提升代码质量。

## 🎯 迁移目标

### 当前状态
```javascript
// 传统方式
import { getBanner, getFallList, getUserInfo } from '@/api'
const banner = await getBanner()
const list = await getFallList({ page: 1 })
const user = await getUserInfo()
```

### 目标状态
```javascript
// 模块化方式
import { API } from '@/api'
const banner = await API.homestay.getBanner()
const list = await API.homestay.getHomeList({ page: 1 })
const user = await API.user.getInfo()
```

## 🗓️ 迁移计划

### 阶段1：准备阶段（已完成）
- [x] 建立模块化API架构
- [x] 创建兼容层
- [x] 添加废弃标记

### 阶段2：核心页面迁移（进行中）
- [ ] 首页 (pages/index/index.vue)
- [ ] 详情页 (pages/detail/detail.vue)
- [ ] 搜索页 (pages/search/search.vue)
- [ ] 用户中心 (pages/my/my.vue)

### 阶段3：业务页面迁移
- [ ] 收藏页 (pages/collect/collect.vue)
- [ ] 喜欢页 (pages/like/like.vue)
- [ ] 关注页 (pages/follow/follow.vue)
- [ ] 聊天页 (pages/chat/chat.vue)

### 阶段4：工具页面迁移
- [ ] 发布页 (pages/publish/publish.vue)
- [ ] 历史页 (pages/history/history.vue)
- [ ] 个人资料页 (pages/profile/profile.vue)

### 阶段5：清理阶段
- [ ] 删除 api.js 文件
- [ ] 清理兼容层代码
- [ ] 更新文档

## 🔄 迁移步骤

### 步骤1：识别API调用
在目标页面中查找以下模式：
```javascript
// 查找这些导入
import { getBanner, getFallList, getUserInfo } from '@/api'
import { login, updateUserInfo } from '@/api'
import { searchHomestay, getSearchSuggestions } from '@/api'

// 查找这些调用
getBanner()
getFallList(params)
getUserInfo()
login(code, avatar, name)
```

### 步骤2：替换导入
```javascript
// 替换前
import { getBanner, getFallList, getUserInfo } from '@/api'

// 替换后
import { API } from '@/api'
```

### 步骤3：替换API调用
使用以下映射表进行替换：

#### 民宿相关API
| 旧函数 | 新调用方式 |
|--------|------------|
| `getBanner()` | `API.homestay.getBanner()` |
| `getFallList(params)` | `API.homestay.getHomeList(params)` |
| `getHomestayDetail(id)` | `API.homestay.getDetail(id)` |
| `publishHomestay(data)` | `API.homestay.publish(data)` |
| `updateHomestay(id, data)` | `API.homestay.update(id, data)` |
| `deleteHomestay(id)` | `API.homestay.delete(id)` |
| `onlineHomestay(id)` | `API.homestay.online(id)` |
| `offlineHomestay(id)` | `API.homestay.offline(id)` |
| `toggleLike(id, action)` | `API.homestay.toggleLike(id, action)` |
| `toggleCollect(id, action)` | `API.homestay.toggleCollect(id, action)` |
| `getMyHomestayList(params)` | `API.homestay.getMyList(params)` |
| `getFilteredHomestayList(params)` | `API.homestay.filterByRegion(params)` |
| `getUserHomestays(userId, page, size)` | `API.homestay.getUserList(userId, { page, size })` |
| `searchHomestay(params)` | `API.homestay.search(params)` |

#### 用户相关API
| 旧函数 | 新调用方式 |
|--------|------------|
| `login(code, avatarUrl, nickName)` | `API.user.login(code, avatarUrl, nickName)` |
| `getUserInfo()` | `API.user.getInfo()` |
| `getUserInfoById(id)` | `API.user.getInfoById(id)` |
| `updateUserInfo(data)` | `API.user.updateInfo(data)` |
| `getUserStats()` | `API.user.getStats()` |
| `getFollowList(params)` | `API.user.getFollowList(params)` |
| `getFansList(params)` | `API.user.getFansList(params)` |
| `toggleFollow(userId, action)` | `API.user.toggleFollow(userId, action)` |
| `checkFollowStatus(userId)` | `API.user.checkFollowStatus(userId)` |
| `removeFan(userId)` | `API.user.removeFan(userId)` |
| `getFollowFeed()` | `API.user.getFollowFeed()` |
| `getFollowHomestayList(params)` | `API.user.getFollowHomestayList(params)` |
| `getCollectList(params)` | `API.user.getCollectList(params)` |
| `getLikeList(params)` | `API.user.getLikeList(params)` |
| `getViewHistory(params)` | `API.user.getViewHistory(params)` |
| `addViewHistory(id)` | `API.user.addViewHistory(id)` |
| `removeViewHistory(id)` | `API.user.removeViewHistory(id)` |
| `clearViewHistory()` | `API.user.clearViewHistory()` |
| `getLandlordContact(id)` | `API.user.getLandlordContact(id)` |

#### 搜索相关API
| 旧函数 | 新调用方式 |
|--------|------------|
| `getSearchSuggestions(params)` | `API.search.getSuggestions(params)` |
| `getHotSearches()` | `API.search.getHotSearches()` |
| `getUserSearchHistory()` | `API.search.getSearchHistory()` |
| `clearUserSearchHistory()` | `API.search.clearSearchHistory()` |
| `searchRegions(name)` | `API.search.searchRegions(name)` |
| `getRegionTree()` | `API.search.getRegionTree()` |

#### 地区相关API
| 旧函数 | 新调用方式 |
|--------|------------|
| `getProvinces()` | `API.region.getProvinces()` |
| `getCitiesByProvince(code)` | `API.region.getCitiesByProvince(code)` |
| `getDistricts(code)` | `API.region.getDistrictsByCity(code)` |
| `getTagList()` | `API.region.getTagList()` |

#### 聊天相关API
| 旧函数 | 新调用方式 |
|--------|------------|
| `createConversation(landlordId, homestayId)` | `API.chat.createConversation(landlordId, homestayId)` |
| `getConversations()` | `API.chat.getConversations()` |
| `getConversation(id)` | `API.chat.getConversation(id)` |
| `sendMessage(conversationId, content, messageType)` | `API.chat.sendMessage(conversationId, content, messageType)` |
| `getMessages(conversationId, page, size)` | `API.chat.getMessages(conversationId, page, size)` |
| `markMessagesAsRead(conversationId)` | `API.chat.markMessagesAsRead(conversationId)` |
| `getUnreadMessageCount()` | `API.chat.getUnreadMessageCount()` |
| `pinConversation(id)` | `API.chat.pinConversation(id)` |
| `unpinConversation(id)` | `API.chat.unpinConversation(id)` |
| `deleteConversation(id)` | `API.chat.deleteConversation(id)` |
| `autoSendLandlordContact(conversationId, landlordId, homestayId)` | `API.chat.autoSendLandlordContact(conversationId, landlordId, homestayId)` |

### 步骤4：测试验证
```javascript
// 迁移前测试
console.log('迁移前测试')
const result = await getBanner()
console.log('结果:', result)

// 迁移后测试
console.log('迁移后测试')
const result = await API.homestay.getBanner()
console.log('结果:', result)
```

## 📝 迁移示例

### 示例1：首页迁移
```javascript
// 迁移前 (pages/index/index.vue)
import { getBanner, getFallList } from '@/api'

export default {
  async onLoad() {
    try {
      const bannerResponse = await getBanner()
      const listResponse = await getFallList({ page: 1, size: 10 })
      // 处理响应...
    } catch (error) {
      console.error('加载失败:', error)
    }
  }
}

// 迁移后
import { API } from '@/api'

export default {
  async onLoad() {
    try {
      const bannerResponse = await API.homestay.getBanner()
      const listResponse = await API.homestay.getHomeList({ page: 1, size: 10 })
      // 处理响应...
    } catch (error) {
      console.error('加载失败:', error)
    }
  }
}
```

### 示例2：用户页面迁移
```javascript
// 迁移前
import { getUserInfo, updateUserInfo, getUserStats } from '@/api'

export default {
  async loadUserData() {
    const userInfo = await getUserInfo()
    const userStats = await getUserStats()
    // 处理数据...
  },
  
  async saveUserData(data) {
    await updateUserInfo(data)
    // 处理保存...
  }
}

// 迁移后
import { API } from '@/api'

export default {
  async loadUserData() {
    const userInfo = await API.user.getInfo()
    const userStats = await API.user.getStats()
    // 处理数据...
  },
  
  async saveUserData(data) {
    await API.user.updateInfo(data)
    // 处理保存...
  }
}
```

## ⚠️ 注意事项

### 1. 参数变化
某些API的参数结构可能发生变化：
```javascript
// 旧方式
getUserHomestays(userId, page, size)

// 新方式
API.homestay.getUserList(userId, { page, size })
```

### 2. 错误处理
模块化API的错误处理更加统一：
```javascript
try {
  const result = await API.homestay.getBanner()
} catch (error) {
  // 错误已由BaseAPI统一处理
  console.error('获取轮播图失败:', error.message)
}
```

### 3. 静默错误
某些API支持静默错误处理：
```javascript
// 静默处理，不显示错误提示
const result = await API.user.addViewHistory(id, { silent: true })
```

## 🔍 迁移检查清单

### 迁移前检查
- [ ] 确认页面功能正常
- [ ] 记录当前API调用方式
- [ ] 备份重要代码

### 迁移中检查
- [ ] 替换所有导入语句
- [ ] 替换所有API调用
- [ ] 检查参数传递是否正确
- [ ] 验证错误处理逻辑

### 迁移后检查
- [ ] 功能测试通过
- [ ] 错误处理正常
- [ ] 性能无明显下降
- [ ] 代码可读性提升

## 📊 迁移进度跟踪

### 页面迁移状态
| 页面 | 状态 | 迁移日期 | 负责人 | 备注 |
|------|------|----------|--------|------|
| pages/index/index.vue | 🔄 进行中 | - | - | 核心页面 |
| pages/detail/detail.vue | ⏳ 待开始 | - | - | 核心页面 |
| pages/search/search.vue | ⏳ 待开始 | - | - | 核心页面 |
| pages/my/my.vue | ⏳ 待开始 | - | - | 核心页面 |
| pages/collect/collect.vue | ⏳ 待开始 | - | - | 业务页面 |
| pages/like/like.vue | ⏳ 待开始 | - | - | 业务页面 |
| pages/follow/follow.vue | ⏳ 待开始 | - | - | 业务页面 |
| pages/chat/chat.vue | ⏳ 待开始 | - | - | 业务页面 |

### 状态说明
- ⏳ 待开始：尚未开始迁移
- 🔄 进行中：正在迁移中
- ✅ 已完成：迁移完成并测试通过
- ❌ 有问题：迁移过程中发现问题

## 🚀 迁移工具

### 自动替换脚本
```bash
# 批量替换导入语句
find pages -name "*.vue" -exec sed -i 's/import { \([^}]*\) } from '\''@\/api'\''/import { API } from '\''@\/api'\''/g' {} \;

# 批量替换API调用（需要根据具体情况调整）
find pages -name "*.vue" -exec sed -i 's/getBanner()/API.homestay.getBanner()/g' {} \;
```

### 验证脚本
```javascript
// 验证迁移是否成功
const migrationCheck = {
  // 检查是否还有旧的导入
  checkOldImports: () => {
    // 查找 'from @/api' 但不包含 'API' 的导入
  },
  
  // 检查是否还有旧的API调用
  checkOldCalls: () => {
    // 查找直接函数调用，如 getBanner()
  }
}
```

## 📚 相关文档

- [API使用指南](./README.md)
- [模块化API设计](./modules/README.md)
- [错误处理机制](./core/ErrorHandler.js)
- [配置管理](./config/index.js)

## 🆘 问题反馈

如果在迁移过程中遇到问题，请：

1. 检查本文档的迁移步骤
2. 查看相关API模块的文档
3. 联系开发团队
4. 提交Issue到项目仓库

---

**最后更新：** 2025-01-21  
**版本：** v1.0.0  
**维护者：** 开发团队
