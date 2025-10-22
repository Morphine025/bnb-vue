/**
 * API基类 - 完整版
 * 功能描述：提供完整的API调用方法
 * 主要功能：GET、POST、PUT、DELETE请求，简单错误处理
 */

import http from '../http'

/**
 * API基类 - 提供完整的CRUD操作
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
      return await http(url, params, 'GET')
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
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
      return await http(url, data, 'POST')
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
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
      return await http(url, data, 'PUT')
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
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
      return await http(url, data, 'DELETE')
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  }

  /**
   * 获取列表数据（GET请求的别名）
   * @param {string} url - 请求路径
   * @param {object} params - 查询参数
   * @param {object} options - 额外选项
   * @returns {Promise} API响应
   */
  static async getList(url, params = {}, options = {}) {
    return this.get(url, params, options)
  }

  /**
   * 根据ID获取数据
   * @param {string} url - 请求路径
   * @param {string|number} id - 资源ID
   * @param {object} options - 额外选项
   * @returns {Promise} API响应
   */
  static async getById(url, id, options = {}) {
    const fullUrl = url.startsWith('/') ? `${url}/${id}` : `/${url}/${id}`
    return this.get(fullUrl, {}, options)
  }

  /**
   * 根据ID更新数据
   * @param {string} url - 请求路径
   * @param {string|number} id - 资源ID
   * @param {object} data - 更新数据
   * @param {object} options - 额外选项
   * @returns {Promise} API响应
   */
  static async updateById(url, id, data = {}, options = {}) {
    const fullUrl = url.startsWith('/') ? `${url}/${id}` : `/${url}/${id}`
    return this.put(fullUrl, data, options)
  }

  /**
   * 根据ID删除数据
   * @param {string} url - 请求路径
   * @param {string|number} id - 资源ID
   * @param {object} options - 额外选项
   * @returns {Promise} API响应
   */
  static async deleteById(url, id, options = {}) {
    const fullUrl = url.startsWith('/') ? `${url}/${id}` : `/${url}/${id}`
    return this.delete(fullUrl, {}, options)
  }
}