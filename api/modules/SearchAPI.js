/**
 * 搜索相关API模块
 * 功能描述：统一管理搜索相关的API调用
 * 主要功能：搜索民宿、搜索建议、热门搜索等操作
 */

import { BaseAPI, createAPI } from '../core/BaseAPI'

// 创建搜索API实例
const searchAPI = createAPI({
  basePath: '/search',
  methods: ['get', 'post', 'delete']
})

/**
 * 搜索API类 - 继承BaseAPI，提供搜索相关操作
 */
export class SearchAPI extends BaseAPI {
  // 基础路径
  static basePath = '/search'

  /**
   * 搜索民宿
   * @param {object} params - 搜索参数
   * @returns {Promise} 搜索结果
   */
  static async searchHomestay(params = {}) {
    return this.get('/homestay/search', params, {
      errorMessage: '搜索民宿失败'
    })
  }

  /**
   * 获取搜索建议
   * @param {object} params - 搜索参数
   * @returns {Promise} 搜索建议
   */
  static async getSuggestions(params = {}) {
    return this.get('/suggestions', params, {
      errorMessage: '获取搜索建议失败'
    })
  }

  /**
   * 获取热门搜索
   * @returns {Promise} 热门搜索
   */
  static async getHotSearches() {
    return this.get('/hot', {}, {
      errorMessage: '获取热门搜索失败'
    })
  }

  /**
   * 获取用户搜索历史
   * @returns {Promise} 搜索历史
   */
  static async getSearchHistory() {
    return this.get('/search/history', {}, {
      errorMessage: '获取搜索历史失败'
    })
  }

  /**
   * 清除用户搜索历史
   * @returns {Promise} 清除结果
   */
  static async clearSearchHistory() {
    return this.delete('/search/history', {}, {
      errorMessage: '清除搜索历史失败'
    })
  }

  /**
   * 搜索地区
   * @param {string} regionName - 地区名称
   * @returns {Promise} 地区搜索结果
   */
  static async searchRegions(regionName) {
    return this.get('/region/search', { regionName }, {
      errorMessage: '搜索地区失败'
    })
  }

  /**
   * 获取省市区树形结构
   * @returns {Promise} 地区树形结构
   */
  static async getRegionTree() {
    return this.get('/region/tree', {}, {
      errorMessage: '获取地区树形结构失败'
    })
  }
}

// 导出便捷方法
export const {
  get: getSearch,
  post: postSearch,
  delete: deleteSearch
} = searchAPI

// 导出类
export default SearchAPI
