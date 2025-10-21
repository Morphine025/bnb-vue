/**
 * 搜索相关API模块
 * 功能描述：统一管理搜索相关的API调用
 * 主要功能：搜索建议、热门搜索、搜索历史等操作
 */

import { BaseAPI } from '../core/BaseAPI.js'

/**
 * 搜索API类 - 继承BaseAPI，提供搜索相关操作
 */
export class SearchAPI {
  // 基础路径
  static basePath = '/search'

  /**
   * 获取搜索建议
   * @param {object} params - 搜索参数
   * @returns {Promise} 搜索建议
   */
  static async getSuggestions(params = {}) {
    return BaseAPI.get('/suggestions', params, {
      errorMessage: '获取搜索建议失败'
    })
  }

  /**
   * 获取热门搜索
   * @returns {Promise} 热门搜索
   */
  static async getHotSearches() {
    return BaseAPI.get('/hot', {}, {
      errorMessage: '获取热门搜索失败'
    })
  }

  /**
   * 获取用户搜索历史
   * @returns {Promise} 搜索历史
   */
  static async getSearchHistory() {
    return BaseAPI.get('/search/history', {}, {
      errorMessage: '获取搜索历史失败'
    })
  }

  /**
   * 清除用户搜索历史
   * @returns {Promise} 清除结果
   */
  static async clearSearchHistory() {
    return BaseAPI.delete('/search/history', {}, {
      errorMessage: '清除搜索历史失败'
    })
  }
}

// 导出便捷方法
// 注意：现在直接使用SearchAPI类的静态方法，不需要导出便捷方法

// 导出类
export default SearchAPI
