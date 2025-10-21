/**
 * API基类 - 统一API接口定义和错误处理
 * 功能描述：提供统一的API调用方法和错误处理机制
 * 主要功能：减少重复代码，统一错误处理，提供类型安全
 */

import http from '../http'
import { handleError } from '@/utils/error/errorHandler.js'
import { ErrorTypes, ErrorOptions } from '@/utils/error/errorTypes.js'

/**
 * API基类 - 提供通用的CRUD操作
 */
export class BaseAPI {
  /**
   * GET请求
   * @param {string} url - 请求路径
   * @param {object} params - 查询参数
   * @param {object} options - 额外选项
   * @returns {Promise} API响应
   */
  static async get(url, params = {}, options = {}) {
    try {
      const response = await http(url, params, 'GET')
      return response
    } catch (error) {
      const apiContext = {
        module: 'BaseAPI',
        layer: 'API',
        method: 'GET',
        url: url,
        params: params
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: options.retryEnabled || false,
        customMessage: options.errorMessage || '获取数据失败'
      }
      
      const result = handleError(error, apiContext, errorOptions)
      
      if (result.handled) {
        throw new Error(result.errorInfo.message)
      } else {
        throw error
      }
    }
  }

  /**
   * POST请求
   * @param {string} url - 请求路径
   * @param {object} data - 请求数据
   * @param {object} options - 额外选项
   * @returns {Promise} API响应
   */
  static async post(url, data = {}, options = {}) {
    try {
      const response = await http(url, data, 'POST')
      return response
    } catch (error) {
      if (options.silent) {
        console.warn('POST 静默错误:', url, error)
        return Promise.resolve(null)
      }
      
      const apiContext = {
        module: 'BaseAPI',
        layer: 'API',
        method: 'POST',
        url: url,
        data: data
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: options.retryEnabled || false,
        customMessage: options.errorMessage || '提交数据失败'
      }
      
      const result = handleError(error, apiContext, errorOptions)
      
      if (result.handled) {
        throw new Error(result.errorInfo.message)
      } else {
        throw error
      }
    }
  }

  /**
   * PUT请求
   * @param {string} url - 请求路径
   * @param {object} data - 请求数据
   * @param {object} options - 额外选项
   * @returns {Promise} API响应
   */
  static async put(url, data = {}, options = {}) {
    try {
      const response = await http(url, data, 'PUT')
      return response
    } catch (error) {
      const apiContext = {
        module: 'BaseAPI',
        layer: 'API',
        method: 'PUT',
        url: url,
        data: data
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: options.retryEnabled || false,
        customMessage: options.errorMessage || '更新数据失败'
      }
      
      const result = handleError(error, apiContext, errorOptions)
      
      if (result.handled) {
        throw new Error(result.errorInfo.message)
      } else {
        throw error
      }
    }
  }

  /**
   * DELETE请求
   * @param {string} url - 请求路径
   * @param {object} data - 请求数据
   * @param {object} options - 额外选项
   * @returns {Promise} API响应
   */
  static async delete(url, data = {}, options = {}) {
    try {
      const response = await http(url, data, 'DELETE')
      return response
    } catch (error) {
      const apiContext = {
        module: 'BaseAPI',
        layer: 'API',
        method: 'DELETE',
        url: url,
        data: data
      }
      
      const errorOptions = {
        [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
        [ErrorOptions.LOG_ERROR]: true,
        [ErrorOptions.REPORT_ERROR]: options.reportError || false,
        [ErrorOptions.RETRY_ENABLED]: options.retryEnabled || false,
        customMessage: options.errorMessage || '删除数据失败'
      }
      
      const result = handleError(error, apiContext, errorOptions)
      
      if (result.handled) {
        throw new Error(result.errorInfo.message)
      } else {
        throw error
      }
    }
  }

  /**
   * 分页列表查询
   * @param {string} url - 请求路径
   * @param {object} params - 查询参数
   * @param {object} options - 额外选项
   * @returns {Promise} 分页数据
   */
  static async getList(url, params = {}, options = {}) {
    const defaultParams = {
      page: 1,
      size: 10,
      ...params
    }
    return this.get(url, defaultParams, options)
  }

  /**
   * 根据ID获取详情
   * @param {string} url - 请求路径
   * @param {string|number} id - 资源ID
   * @param {object} options - 额外选项
   * @returns {Promise} 详情数据
   */
  static async getById(url, id, options = {}) {
    return this.get(`${url}/${id}`, {}, options)
  }

  /**
   * 根据ID删除资源
   * @param {string} url - 请求路径
   * @param {string|number} id - 资源ID
   * @param {object} options - 额外选项
   * @returns {Promise} 删除结果
   */
  static async deleteById(url, id, options = {}) {
    return this.delete(`${url}/${id}`, {}, options)
  }

  /**
   * 根据ID更新资源
   * @param {string} url - 请求路径
   * @param {string|number} id - 资源ID
   * @param {object} data - 更新数据
   * @param {object} options - 额外选项
   * @returns {Promise} 更新结果
   */
  static async updateById(url, id, data, options = {}) {
    return this.put(`${url}/${id}`, data, options)
  }
}

/**
 * API工厂函数 - 根据配置生成API方法
 * @param {object} config - API配置
 * @returns {object} API方法集合
 */
export function createAPI(config) {
  const { basePath, methods = ['get', 'post', 'put', 'delete'] } = config
  
  const api = {}
  
  // 生成基础CRUD方法
  if (methods.includes('get')) {
    api.get = async (path, params, options) => await BaseAPI.get(`${basePath}${path}`, params, options)
    api.getList = async (path, params, options) => await BaseAPI.getList(`${basePath}${path}`, params, options)
    api.getById = async (path, id, options) => await BaseAPI.getById(`${basePath}${path}`, id, options)
  }
  
  if (methods.includes('post')) {
    api.post = async (path, data, options) => await BaseAPI.post(`${basePath}${path}`, data, options)
  }
  
  if (methods.includes('put')) {
    api.put = async (path, data, options) => await BaseAPI.put(`${basePath}${path}`, data, options)
    api.updateById = async (path, id, data, options) => await BaseAPI.updateById(`${basePath}${path}`, id, data, options)
  }
  
  if (methods.includes('delete')) {
    api.delete = async (path, data, options) => await BaseAPI.delete(`${basePath}${path}`, data, options)
    api.deleteById = async (path, id, options) => await BaseAPI.deleteById(`${basePath}${path}`, id, options)
  }
  
  return api
}

/**
 * 批量创建API方法
 * @param {Array} apiConfigs - API配置数组
 * @returns {object} 所有API方法
 */
export function createBatchAPI(apiConfigs) {
  const allAPIs = {}
  
  apiConfigs.forEach(config => {
    const { name, ...apiConfig } = config
    allAPIs[name] = createAPI(apiConfig)
  })
  
  return allAPIs
}
