/**
 * 地区相关API模块
 * 功能描述：统一管理地区相关的API调用
 * 主要功能：省份、城市、区县数据获取，地区搜索，地区树形结构
 */

import { BaseAPI } from '../core/BaseAPI.js'

/**
 * 地区API类 - 继承BaseAPI，提供地区相关操作
 */
export class RegionAPI {
  // 基础路径
  static basePath = '/bnb/region'

  /**
   * 获取所有省份列表
   * @returns {Promise} 省份列表
   */
  static async getProvinces() {
    return BaseAPI.get('/bnb/region/provinces', {}, {
      errorMessage: '获取省份列表失败'
    })
  }

  /**
   * 根据省份代码获取城市列表
   * @param {string} provinceCode - 省份代码
   * @returns {Promise} 城市列表
   */
  static async getCitiesByProvince(provinceCode) {
    return BaseAPI.get('/bnb/region/cities', { provinceCode }, {
      errorMessage: '获取城市列表失败'
    })
  }

  /**
   * 根据城市代码获取区县列表
   * @param {string} cityCode - 城市代码
   * @returns {Promise} 区县列表
   */
  static async getDistrictsByCity(cityCode) {
    return BaseAPI.get('/bnb/region/districts', { cityCode }, {
      errorMessage: '获取区县列表失败'
    })
  }

  /**
   * 获取标签列表
   * @returns {Promise} 标签列表
   */
  static async getTagList() {
    return BaseAPI.get('/bnb/tag/list', {}, {
      errorMessage: '获取标签列表失败'
    })
  }

  /**
   * 搜索地区
   * @param {string} regionName - 地区名称
   * @returns {Promise} 地区搜索结果
   */
  static async searchRegions(regionName) {
    return BaseAPI.get('/region/search', { regionName }, {
      errorMessage: '搜索地区失败'
    })
  }

  /**
   * 获取省市区树形结构
   * @returns {Promise} 地区树形结构
   */
  static async getRegionTree() {
    return BaseAPI.get('/region/tree', {}, {
      errorMessage: '获取地区树形结构失败'
    })
  }
}

// 导出便捷方法
// 注意：现在直接使用RegionAPI类的静态方法，不需要导出便捷方法

// 导出类
export default RegionAPI
