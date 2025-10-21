/**
 * 简化状态管理工具
 * 功能描述：提供基础的状态管理功能，避免过度设计
 */

import { handleError } from '../error/errorHandler.js'
import { ErrorTypes, ErrorOptions } from '../error/errorTypes.js'

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
     * @param {Object} options - 选项
     * @returns {string} 状态文本
     */
    getStatusText: (status, options = {}) => {
      try {
        if (!status) {
          if (options.handleErrors !== false) {
            const error = new Error('状态值不能为空')
            error.type = ErrorTypes.VALIDATION_ERROR
            error.code = 'INVALID_STATUS'
            
            const businessContext = {
              module: 'HomestayStatus',
              layer: 'Business',
              field: 'getStatusText',
              status: status
            }
            
            const errorOptions = {
              [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
              [ErrorOptions.LOG_ERROR]: true,
              [ErrorOptions.REPORT_ERROR]: options.reportError || false,
              [ErrorOptions.RETRY_ENABLED]: false,
              customMessage: '状态值不能为空'
            }
            
            handleError(error, businessContext, errorOptions)
          }
          return '未知状态'
        }
        
        const statusText = statusMap[status]?.text || '未知状态'
        
        if (statusText === '未知状态' && options.handleErrors !== false) {
          const error = new Error(`未知状态: ${status}`)
          error.type = ErrorTypes.BUSINESS_ERROR
          error.code = 'UNKNOWN_STATUS'
          
          const businessContext = {
            module: 'HomestayStatus',
            layer: 'Business',
            field: 'getStatusText',
            status: status
          }
          
          const errorOptions = {
            [ErrorOptions.SHOW_TOAST]: false,
            [ErrorOptions.LOG_ERROR]: true,
            [ErrorOptions.REPORT_ERROR]: options.reportError || false,
            [ErrorOptions.RETRY_ENABLED]: false,
            customMessage: `未知状态: ${status}`
          }
          
          handleError(error, businessContext, errorOptions)
        }
        
        return statusText
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'getStatusText',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '获取状态文本出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return '未知状态'
      }
    },
    
    /**
     * 获取状态颜色
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {string} 颜色值
     */
    getStatusColor: (status, options = {}) => {
      try {
        if (!status) {
          if (options.handleErrors !== false) {
            const error = new Error('状态值不能为空')
            error.type = ErrorTypes.VALIDATION_ERROR
            error.code = 'INVALID_STATUS'
            
            const businessContext = {
              module: 'HomestayStatus',
              layer: 'Business',
              field: 'getStatusColor',
              status: status
            }
            
            const errorOptions = {
              [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
              [ErrorOptions.LOG_ERROR]: true,
              [ErrorOptions.REPORT_ERROR]: options.reportError || false,
              [ErrorOptions.RETRY_ENABLED]: false,
              customMessage: '状态值不能为空'
            }
            
            handleError(error, businessContext, errorOptions)
          }
          return '#8c8c8c'
        }
        
        const statusColor = statusMap[status]?.color || '#8c8c8c'
        
        if (statusColor === '#8c8c8c' && !statusMap[status] && options.handleErrors !== false) {
          const error = new Error(`未知状态: ${status}`)
          error.type = ErrorTypes.BUSINESS_ERROR
          error.code = 'UNKNOWN_STATUS'
          
          const businessContext = {
            module: 'HomestayStatus',
            layer: 'Business',
            field: 'getStatusColor',
            status: status
          }
          
          const errorOptions = {
            [ErrorOptions.SHOW_TOAST]: false,
            [ErrorOptions.LOG_ERROR]: true,
            [ErrorOptions.REPORT_ERROR]: options.reportError || false,
            [ErrorOptions.RETRY_ENABLED]: false,
            customMessage: `未知状态: ${status}`
          }
          
          handleError(error, businessContext, errorOptions)
        }
        
        return statusColor
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'getStatusColor',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '获取状态颜色出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return '#8c8c8c'
      }
    },
    
    /**
     * 获取状态CSS类名
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {string} CSS类名
     */
    getStatusClass: (status, options = {}) => {
      try {
        if (!status) {
          if (options.handleErrors !== false) {
            const error = new Error('状态值不能为空')
            error.type = ErrorTypes.VALIDATION_ERROR
            error.code = 'INVALID_STATUS'
            
            const businessContext = {
              module: 'HomestayStatus',
              layer: 'Business',
              field: 'getStatusClass',
              status: status
            }
            
            const errorOptions = {
              [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
              [ErrorOptions.LOG_ERROR]: true,
              [ErrorOptions.REPORT_ERROR]: options.reportError || false,
              [ErrorOptions.RETRY_ENABLED]: false,
              customMessage: '状态值不能为空'
            }
            
            handleError(error, businessContext, errorOptions)
          }
          return 'status-unknown'
        }
        
        // 根据状态值返回对应的CSS类名
        const statusClassMap = {
          '0': 'status-pending',
          '1': 'status-approved', 
          '2': 'status-rejected',
          '3': 'status-offline',
          '4': 'status-deleted'
        }
        
        const statusClass = statusClassMap[status] || 'status-unknown'
        
        if (statusClass === 'status-unknown' && options.handleErrors !== false) {
          const error = new Error(`未知状态: ${status}`)
          error.type = ErrorTypes.BUSINESS_ERROR
          error.code = 'UNKNOWN_STATUS'
          
          const businessContext = {
            module: 'HomestayStatus',
            layer: 'Business',
            field: 'getStatusClass',
            status: status
          }
          
          const errorOptions = {
            [ErrorOptions.SHOW_TOAST]: false,
            [ErrorOptions.LOG_ERROR]: true,
            [ErrorOptions.REPORT_ERROR]: options.reportError || false,
            [ErrorOptions.RETRY_ENABLED]: false,
            customMessage: `未知状态: ${status}`
          }
          
          handleError(error, businessContext, errorOptions)
        }
        
        return statusClass
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'getStatusClass',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '获取状态类名出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return 'status-unknown'
      }
    },
    
    /**
     * 验证状态是否有效
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {boolean} 是否有效
     */
    isValidStatus: (status, options = {}) => {
      try {
        if (!status) {
          if (options.handleErrors !== false) {
            const error = new Error('状态值不能为空')
            error.type = ErrorTypes.VALIDATION_ERROR
            error.code = 'INVALID_STATUS'
            
            const businessContext = {
              module: 'HomestayStatus',
              layer: 'Business',
              field: 'isValidStatus',
              status: status
            }
            
            const errorOptions = {
              [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
              [ErrorOptions.LOG_ERROR]: true,
              [ErrorOptions.REPORT_ERROR]: options.reportError || false,
              [ErrorOptions.RETRY_ENABLED]: false,
              customMessage: '状态值不能为空'
            }
            
            handleError(error, businessContext, errorOptions)
          }
          return false
        }
        
        const isValid = statusMap.hasOwnProperty(status)
        
        if (!isValid && options.handleErrors !== false) {
          const error = new Error(`无效状态: ${status}`)
          error.type = ErrorTypes.BUSINESS_ERROR
          error.code = 'INVALID_STATUS_VALUE'
          
          const businessContext = {
            module: 'HomestayStatus',
            layer: 'Business',
            field: 'isValidStatus',
            status: status
          }
          
          const errorOptions = {
            [ErrorOptions.SHOW_TOAST]: false,
            [ErrorOptions.LOG_ERROR]: true,
            [ErrorOptions.REPORT_ERROR]: options.reportError || false,
            [ErrorOptions.RETRY_ENABLED]: false,
            customMessage: `无效状态: ${status}`
          }
          
          handleError(error, businessContext, errorOptions)
        }
        
        return isValid
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'isValidStatus',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '验证状态有效性出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return false
      }
    },
    
    /**
     * 检查状态是否可编辑
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {boolean} 是否可编辑
     */
    canEdit: (status, options = {}) => {
      try {
        if (!status) {
          return false
        }
        
        // 只有审核中、审核失败、已下架状态可以编辑
        const editableStatuses = ['0', '2', '3']
        return editableStatuses.includes(status)
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'canEdit',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '检查编辑权限出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return false
      }
    },
    
    /**
     * 检查状态是否可删除
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {boolean} 是否可删除
     */
    canDelete: (status, options = {}) => {
      try {
        if (!status) {
          return false
        }
        
        // 所有状态都可以删除
        return true
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'canDelete',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '检查删除权限出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return false
      }
    },
    
    /**
     * 检查状态是否可以下架
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {boolean} 是否可以下架
     */
    canOffline: (status, options = {}) => {
      try {
        if (!status) {
          return false
        }
        
        // 只有审核通过状态可以下架
        return status === '1'
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'canOffline',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '检查下架权限出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return false
      }
    },
    
    /**
     * 检查状态是否可以上架
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {boolean} 是否可以上架
     */
    canOnline: (status, options = {}) => {
      try {
        if (!status) {
          return false
        }
        
        // 只有已下架状态可以重新上架
        return status === '3'
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'canOnline',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '检查上架权限出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return false
      }
    },
    
    /**
     * 获取状态可用的操作列表
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {Array} 可用操作列表
     */
    getAvailableActions: function(status, options = {}) {
      try {
        if (!status) {
          return []
        }
        
        const actions = []
        
        // 根据状态添加可用操作
        if (this.canEdit(status, options)) {
          actions.push('edit')
        }
        
        if (this.canDelete(status, options)) {
          actions.push('delete')
        }
        
        if (this.canOffline(status, options)) {
          actions.push('offline')
        }
        
        if (this.canOnline(status, options)) {
          actions.push('online')
        }
        
        return actions
      } catch (error) {
        const businessContext = {
          module: 'HomestayStatus',
          layer: 'Business',
          field: 'getAvailableActions',
          status: status
        }
        
        const errorOptions = {
          [ErrorOptions.SHOW_TOAST]: false,
          [ErrorOptions.LOG_ERROR]: true,
          [ErrorOptions.REPORT_ERROR]: true,
          [ErrorOptions.RETRY_ENABLED]: false,
          customMessage: '获取可用操作出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return []
      }
    }
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
