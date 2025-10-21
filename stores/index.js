/**
 * Pinia Store 入口文件
 * 功能描述：统一导出所有store模块
 * 主要功能：store模块管理、统一导出
 */

import { createPinia } from 'pinia'

// 创建Pinia实例
export const pinia = createPinia()

// 导出所有store模块 - 重构后的模块化结构

// 统一Loading管理
export { useLoadingStore } from './modules/loading'

// 缓存策略管理
export { useCacheStrategyStore } from './modules/cache-strategy'

// 民宿相关Store
export { useHomestayListStore } from './modules/homestay/list'
export { useHomestayDetailStore } from './modules/homestay/detail'
export { useHomestayFilterStore } from './modules/homestay/filter'
export { useHomestayFavoritesStore } from './modules/homestay/favorites'

// 用户相关Store
export { useUserProfileStore } from './modules/user/profile'
export { useUserStatsStore } from './modules/user/stats'
export { useUserSettingsStore } from './modules/user/settings'
export { useUserFollowStore } from './modules/user/follow'

// 搜索相关Store
export { useSearchStore } from './modules/search/search'
export { useSearchHistoryStore } from './modules/search/history'
export { useSearchSuggestionsStore } from './modules/search/suggestions'

// 其他Store
export { useUIStore } from './modules/ui'
export { useCacheStore } from './modules/cache'
export { useAppStore } from './modules/app'
export { useMessageStore } from './modules/message'

// 兼容性导出 - 保持向后兼容
export { useHomestayStore } from './modules/homestay'
export { useUserStore } from './modules/user'
export { useSearchStore as useSearchStoreOld } from './modules/search'
