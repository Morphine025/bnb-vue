/**
 * Utils 工具函数统一入口
 * 功能描述：提供按功能分组的工具函数统一导出
 * 主要功能：模块化组织、统一管理、便于维护
 */

// ==================== 安全相关工具 ====================
export * from './security/inputSanitizer'
export * from './security/dataValidator'
export * from './security/urlConverter'
export * from './security/environmentDetector'

// ==================== 性能相关工具 ====================
export * from './performance/performanceMonitor'
export * from './performance/debounce'
export * from './performance/virtualList'

// ==================== API相关工具 ====================
export * from './api/apiUtils'

// ==================== 缓存相关工具 ====================
export * from './cache/cacheManager'

// ==================== UI相关工具 ====================
export * from './ui/loadingManager'
export * from './ui/shareUtils'
export * from './ui/imageErrorHandler'

// ==================== 业务相关工具 ====================
export * from './business/homestayStatus'
export * from './business/priceFormatter'
export * from './business/userInfo'

// ==================== 调试相关工具 ====================
export * from './debug/debugHelper'

// ==================== 常量定义 ====================
export * from './constants/constants'

/**
 * 工具函数使用示例：
 * 
 * // 安全相关
 * import { sanitizeInput, validatePhone, validate } from '@/utils'
 * 
 * // 性能相关
 * import { debounce, performanceUtils } from '@/utils'
 * 
 * // API相关
 * import { handleError, generateRequestId, showSuccess } from '@/utils'
 * 
 * // 缓存相关
 * import { cacheUtils } from '@/utils'
 * 
 * // UI相关
 * import { showLoading, shareToWechat } from '@/utils'
 * 
 * // 业务相关
 * import { formatPrice, getStatusText } from '@/utils'
 * 
 * // 调试相关
 * import { checkStoreData } from '@/utils'
 * 
 * // 常量
 * import { FORM_CONSTANTS, ERROR_MESSAGES } from '@/utils'
 */
