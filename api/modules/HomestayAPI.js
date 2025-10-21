/**
 * 民宿相关API模块
 * 功能描述：统一管理民宿相关的API调用
 * 主要功能：民宿列表、详情、收藏、发布等操作
 */

import { BaseAPI, createAPI } from '../core/BaseAPI'

// 创建民宿API实例
const homestayAPI = createAPI({
  basePath: '/homestay',
  methods: ['get', 'post', 'put', 'delete']
})

/**
 * 民宿API类 - 继承BaseAPI，提供民宿相关操作
 */
export class HomestayAPI extends BaseAPI {
  // 基础路径
  static basePath = '/homestay'

  /**
   * 获取轮播图列表
   * @returns {Promise} 轮播图列表
   */
  static async getBanner() {
    return this.get('/banner/list', {}, {
      errorMessage: '获取轮播图失败'
    })
  }

  /**
   * 获取首页民宿列表
   * @param {object} params - 查询参数
   * @returns {Promise} 民宿列表
   */
  static async getHomeList(params = {}) {
    return this.get('/homestay/homeList', params, {
      errorMessage: '获取民宿列表失败'
    })
  }

  /**
   * 获取民宿详情
   * @param {string} homestayId - 民宿ID
   * @returns {Promise} 民宿详情
   */
  static async getDetail(homestayId) {
    return this.get(`/homestay/detail/${homestayId}`, {}, {
      errorMessage: '获取民宿详情失败'
    })
  }

  /**
   * 发布民宿
   * @param {object} data - 民宿数据
   * @returns {Promise} 发布结果
   */
  static async publish(data) {
    return this.post('/homestay/publish', data, {
      errorMessage: '发布民宿失败'
    })
  }

  /**
   * 更新民宿信息
   * @param {string} homestayId - 民宿ID
   * @param {object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  static async update(homestayId, data) {
    return this.updateById('/homestay/update', homestayId, data, {
      errorMessage: '更新民宿失败'
    })
  }

  /**
   * 删除民宿
   * @param {string} homestayId - 民宿ID
   * @returns {Promise} 删除结果
   */
  static async delete(homestayId) {
    return this.deleteById('/homestay/delete', homestayId, {
      errorMessage: '删除民宿失败'
    })
  }

  /**
   * 上架民宿
   * @param {string} homestayId - 民宿ID
   * @returns {Promise} 上架结果
   */
  static async online(homestayId) {
    return this.post(`/homestay/online/${homestayId}`, {}, {
      errorMessage: '上架民宿失败'
    })
  }

  /**
   * 下架民宿
   * @param {string} homestayId - 民宿ID
   * @returns {Promise} 下架结果
   */
  static async offline(homestayId) {
    return this.post(`/homestay/offline/${homestayId}`, {}, {
      errorMessage: '下架民宿失败'
    })
  }

  /**
   * 点赞/取消点赞
   * @param {string} homestayId - 民宿ID
   * @param {string} action - 操作类型 (like/unlike)
   * @returns {Promise} 操作结果
   */
  static async toggleLike(homestayId, action) {
    return this.post('/homestay/like', {
      homestayId,
      action
    }, {
      errorMessage: '点赞操作失败'
    })
  }

  /**
   * 收藏/取消收藏
   * @param {string} homestayId - 民宿ID
   * @param {string} action - 操作类型 (collect/uncollect)
   * @returns {Promise} 操作结果
   */
  static async toggleCollect(homestayId, action) {
    return this.post('/homestay/collect', {
      homestayId,
      action
    }, {
      errorMessage: '收藏操作失败'
    })
  }

  /**
   * 根据地区筛选民宿
   * @param {object} params - 筛选参数
   * @returns {Promise} 筛选结果
   */
  static async filterByRegion(params = {}) {
    return this.get('/homestay/filterByRegion', params, {
      errorMessage: '地区筛选失败'
    })
  }

  /**
   * 搜索民宿
   * @param {object} params - 搜索参数
   * @returns {Promise} 搜索结果
   */
  static async search(params = {}) {
    return this.get('/homestay/search', params, {
      errorMessage: '搜索民宿失败'
    })
  }
}

// 导出便捷方法
export const {
  get: getHomestay,
  post: postHomestay,
  put: putHomestay,
  delete: deleteHomestay,
  getList: getHomestayList,
  getById: getHomestayById,
  updateById: updateHomestayById,
  deleteById: deleteHomestayById
} = homestayAPI

// 导出类
export default HomestayAPI
