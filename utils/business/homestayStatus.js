/**
 * 简化状态管理工具
 * 功能描述：提供基础的状态管理功能，避免过度设计
 */

/**
 * 创建简化状态管理器
 * @param {Object} statusMap - 状态映射对象
 * @returns {Object} 状态管理器
 * @example
 * // 创建状态管理器
 * const statusManager = createSimpleStatusManager({
 *   '0': { text: '审核中', color: '#faad14' },
 *   '1': { text: '审核通过', color: '#52c41a' }
 * })
 */
export const createSimpleStatusManager = (statusMap) => {
  return {
    /**
     * 获取状态显示文本
     * @param {string} status - 状态值
     * @returns {string} 状态文本
     */
    getStatusText: (status) => statusMap[status]?.text || '未知状态',
    
    /**
     * 获取状态颜色
     * @param {string} status - 状态值
     * @returns {string} 颜色值
     */
    getStatusColor: (status) => statusMap[status]?.color || '#8c8c8c',
    
    /**
     * 验证状态是否有效
     * @param {string} status - 状态值
     * @returns {boolean} 是否有效
     */
    isValidStatus: (status) => statusMap.hasOwnProperty(status)
  }
}

/**
 * 民宿状态映射
 */
export const homestayStatusMap = {
  '0': { text: '审核中', color: '#faad14' },
  '1': { text: '审核通过', color: '#52c41a' },
  '2': { text: '审核失败', color: '#ff4d4f' },
  '3': { text: '已下架', color: '#8c8c8c' },
  '4': { text: '已删除', color: '#d9d9d9' }
}

// 创建民宿状态管理器
export const homestayStatusManager = createSimpleStatusManager(homestayStatusMap)

// 为了保持向后兼容，导出原有的函数（内部使用新的管理器）
export const HOMESTAY_STATUS = {
  PENDING: '0',
  APPROVED: '1',
  REJECTED: '2',
  OFFLINE: '3',
  DELETED: '4'
}

export const getStatusText = (status) => homestayStatusManager.getStatusText(status)
export const getStatusClass = (status) => homestayStatusManager.getStatusClass(status)
export const getStatusColor = (status) => homestayStatusManager.getStatusColor(status)
export const isEditable = (status) => homestayStatusManager.canEdit(status)
export const isDeletable = (status) => homestayStatusManager.canDelete(status)
export const canOffline = (status) => homestayStatusManager.canOffline(status)
export const canOnline = (status) => homestayStatusManager.canOnline(status)
export const getAvailableActions = (status) => homestayStatusManager.getAvailableActions(status)
