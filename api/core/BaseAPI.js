/**
 * API基类 - 简化版
 * 功能描述：提供基础的API调用方法
 * 主要功能：GET和POST请求，简单错误处理
 */

import http from '../http'

/**
 * API基类 - 提供基础的CRUD操作
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
}