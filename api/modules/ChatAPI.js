/**
 * 聊天相关API模块
 * 功能描述：统一管理聊天相关的API调用
 * 主要功能：对话管理、消息发送、消息历史等操作
 */

import { BaseAPI } from '../core/BaseAPI.js'

/**
 * 聊天API类 - 继承BaseAPI，提供聊天相关操作
 */
export class ChatAPI {
  // 基础路径
  static basePath = '/chat'

  /**
   * 创建或获取对话
   * @param {string} landlordId - 房东ID
   * @param {string} homestayId - 民宿ID
   * @returns {Promise} 对话信息
   */
  static async createConversation(landlordId, homestayId) {
    // 使用完整路径，避免请求落到 /api/conversation 而不是 /api/chat/conversation
    let url = `/chat/conversation?landlordId=${landlordId}`
    if (homestayId) {
      url += `&homestayId=${homestayId}`
    }
    
    return BaseAPI.post(url, {}, {
      errorMessage: '创建对话失败'
    })
  }

  /**
   * 获取对话列表
   * @returns {Promise} 对话列表
   */
  static async getConversations() {
    return BaseAPI.get('/chat/conversations', {}, {
      errorMessage: '获取对话列表失败'
    })
  }

  /**
   * 获取对话详情
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 对话详情
   */
  static async getConversation(conversationId) {
    return BaseAPI.getById('/chat/conversation', conversationId, {
      errorMessage: '获取对话详情失败'
    })
  }

  /**
   * 发送消息
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {string} messageType - 消息类型
   * @returns {Promise} 发送结果
   */
  static async sendMessage(conversationId, content, messageType = 'text') {
    return BaseAPI.post('/chat/send', {
      conversationId,
      content,
      messageType
    }, {
      errorMessage: '发送消息失败'
    })
  }

  /**
   * 获取消息列表
   * @param {string} conversationId - 对话ID
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise} 消息列表
   */
  static async getMessages(conversationId, page = 0, size = 20) {
    return BaseAPI.get('/chat/messages', {
      conversationId,
      page,
      size
    }, {
      errorMessage: '获取消息列表失败'
    })
  }

  /**
   * 标记消息为已读
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 标记结果
   */
  static async markMessagesAsRead(conversationId) {
    return BaseAPI.post(`/chat/read?conversationId=${conversationId}`, {}, {
      errorMessage: '标记消息已读失败'
    })
  }

  /**
   * 获取未读消息数量
   * @returns {Promise} 未读消息数量
   */
  static async getUnreadMessageCount() {
    return BaseAPI.get('/chat/unread-count', {}, {
      errorMessage: '获取未读消息数量失败'
    })
  }

  /**
   * 置顶对话
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 置顶结果
   */
  static async pinConversation(conversationId) {
    return BaseAPI.post(`/chat/pin?conversationId=${conversationId}`, {}, {
      errorMessage: '置顶对话失败'
    })
  }

  /**
   * 取消置顶对话
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 取消置顶结果
   */
  static async unpinConversation(conversationId) {
    return BaseAPI.post(`/chat/unpin?conversationId=${conversationId}`, {}, {
      errorMessage: '取消置顶对话失败'
    })
  }

  /**
   * 删除对话
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 删除结果
   */
  static async deleteConversation(conversationId) {
    return BaseAPI.post(`/chat/delete?conversationId=${conversationId}`, {}, {
      errorMessage: '删除对话失败'
    })
  }

  /**
   * 自动发送房东联系信息
   * @param {string} conversationId - 对话ID
   * @param {string} landlordId - 房东ID
   * @param {string} homestayId - 民宿ID
   * @returns {Promise} 发送结果
   */
  static async autoSendLandlordContact(conversationId, landlordId, homestayId) {
    let queryParams = `conversationId=${encodeURIComponent(conversationId)}&landlordId=${encodeURIComponent(landlordId)}`
    if (homestayId && homestayId !== 'undefined') {
      queryParams += `&homestayId=${encodeURIComponent(homestayId)}`
    }
    
    return BaseAPI.post(`/chat/auto-send-contact?${queryParams}`, {}, {
      errorMessage: '自动发送联系信息失败'
    })
  }
}

// 导出便捷方法
// 注意：现在直接使用ChatAPI类的静态方法，不需要导出便捷方法

// 导出类
export default ChatAPI
