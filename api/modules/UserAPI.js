/**
 * 用户相关API模块
 * 功能描述：统一管理用户相关的API调用
 * 主要功能：用户信息、关注、粉丝、统计、用户民宿数据等操作
 */

import { BaseAPI } from '../core/BaseAPI.js'

/**
 * 用户API类 - 提供用户相关操作
 */
export class UserAPI {
  // 基础路径
  static basePath = '/user'

  /**
   * 用户登录
   * @param {string} code - 微信授权码
   * @param {string} avatarUrl - 用户头像URL
   * @param {string} nickName - 用户昵称
   * @returns {Promise} 登录结果
   */
  static async login(code, avatarUrl, nickName) {
    const loginData = {
      code,
      avatarUrl,
      nickName
    }
    return BaseAPI.post('/auth/login', loginData, {
      errorMessage: '登录失败'
    })
  }

  /**
   * 获取用户信息
   * @returns {Promise} 用户信息
   */
  static async getInfo() {
    return BaseAPI.get('/user/info', {}, {
      errorMessage: '获取用户信息失败'
    })
  }

  /**
   * 根据用户ID获取用户信息
   * @param {string} userId - 用户ID
   * @returns {Promise} 用户信息
   */
  static async getInfoById(userId) {
    return BaseAPI.get(`/auth/user/info/${userId}`, {}, {
      errorMessage: '获取用户信息失败'
    })
  }

  /**
   * 更新用户信息
   * @param {object} data - 用户数据
   * @returns {Promise} 更新结果
   */
  static async updateInfo(data) {
    return BaseAPI.put('/info', data, {
      errorMessage: '更新用户信息失败'
    })
  }

  /**
   * 获取用户统计数据
   * @returns {Promise} 用户统计
   */
  static async getStats() {
    return BaseAPI.get('/user/stats', {}, {
      errorMessage: '获取用户统计失败'
    })
  }

  /**
   * 获取关注列表
   * @param {object} params - 查询参数
   * @returns {Promise} 关注列表
   */
  static async getFollowList(params = {}) {
    return BaseAPI.getList('/follow/list', params, {
      errorMessage: '获取关注列表失败'
    })
  }

  /**
   * 获取粉丝列表
   * @param {object} params - 查询参数
   * @returns {Promise} 粉丝列表
   */
  static async getFansList(params = {}) {
    return BaseAPI.getList('/follow/fans', params, {
      errorMessage: '获取粉丝列表失败'
    })
  }

  /**
   * 关注/取消关注用户
   * @param {string} userId - 用户ID
   * @param {string} action - 操作类型 (follow/unfollow)
   * @returns {Promise} 操作结果
   */
  static async toggleFollow(userId, action) {
    return BaseAPI.post('/follow/toggle', {
      userId,
      action
    }, {
      errorMessage: '关注操作失败'
    })
  }

  /**
   * 检查关注状态
   * @param {string} userId - 用户ID
   * @returns {Promise} 关注状态
   */
  static async checkFollowStatus(userId) {
    return BaseAPI.get('/follow/check', {
      userId
    }, {
      errorMessage: '检查关注状态失败'
    })
  }

  /**
   * 移除粉丝
   * @param {string} userId - 用户ID
   * @returns {Promise} 移除结果
   */
  static async removeFan(userId) {
    // 后端期望在请求体中接收 FollowDTO { userId, action }
    return BaseAPI.post('/follow/remove-fan', {
      userId,
      action: 'unfollow'
    }, {
      errorMessage: '移除粉丝失败'
    })
  }

  /**
   * 获取关注用户的动态
   * @returns {Promise} 关注动态
   */
  static async getFollowFeed() {
    return BaseAPI.get('/follow/feed', {}, {
      errorMessage: '获取关注动态失败'
    })
  }

  /**
   * 获取关注用户发布的民宿列表
   * @param {object} params - 查询参数
   * @returns {Promise} 关注用户民宿列表
   */
  static async getFollowHomestayList(params = {}) {
    return BaseAPI.getList('/homestay/followList', params, {
      errorMessage: '获取关注用户民宿列表失败'
    })
  }

  /**
   * 获取收藏列表
   * @param {object} params - 查询参数
   * @returns {Promise} 收藏列表
   */
  static async getCollectList(params = {}) {
    return BaseAPI.getList('/user/collect/list', params, {
      errorMessage: '获取收藏列表失败'
    })
  }

  /**
   * 获取喜欢列表
   * @param {object} params - 查询参数
   * @returns {Promise} 喜欢列表
   */
  static async getLikeList(params = {}) {
    return BaseAPI.getList('/user/like/list', params, {
      errorMessage: '获取喜欢列表失败'
    })
  }

  /**
   * 获取浏览历史
   * @param {object} params - 查询参数
   * @returns {Promise} 浏览历史
   */
  static async getViewHistory(params = {}) {
    return BaseAPI.getList('/user/history/list', params, {
      errorMessage: '获取浏览历史失败'
    })
  }

  /**
   * 添加浏览历史
   * @param {string} homestayId - 民宿ID
   * @returns {Promise} 添加结果
   */
  static async addViewHistory(homestayId) {
    // 后端期望的是纯字符串而不是JSON对象
    return BaseAPI.post('/user/history/add', homestayId, {
      errorMessage: '添加浏览历史失败',
      silent: true
    })
  }

  /**
   * 删除浏览历史
   * @param {string} homestayId - 民宿ID
   * @returns {Promise} 删除结果
   */
  static async removeViewHistory(homestayId) {
    return BaseAPI.post('/user/history/remove', { homestayId }, {
      errorMessage: '删除浏览历史失败'
    })
  }

  /**
   * 清除所有浏览历史
   * @returns {Promise} 清除结果
   */
  static async clearViewHistory() {
    return BaseAPI.post('/user/history/clear', {}, {
      errorMessage: '清除浏览历史失败'
    })
  }

  /**
   * 获取房东联系信息
   * @param {string} landlordId - 房东ID
   * @returns {Promise} 联系信息
   */
  static async getLandlordContact(landlordId) {
    return BaseAPI.getById('/contact', landlordId, {
      errorMessage: '获取房东联系信息失败'
    })
  }

  /**
   * 获取我的发布列表
   * @param {object} params - 查询参数
   * @returns {Promise} 发布列表
   */
  static async getMyList(params = {}) {
    return BaseAPI.getList('/homestay/myList', params, {
      errorMessage: '获取我的发布列表失败'
    })
  }

  /**
   * 获取用户发布的民宿列表
   * @param {string} userId - 用户ID
   * @param {object} params - 查询参数
   * @returns {Promise} 用户民宿列表
   */
  static async getUserList(userId, params = {}) {
    return BaseAPI.get('/homestay/userList', {
      userId,
      ...params
    }, {
      errorMessage: '获取用户民宿列表失败'
    })
  }
}

// 注意：现在直接使用UserAPI类的静态方法，不需要导出便捷方法

// 导出类
export default UserAPI
