/**
 * 对话工具函数
 * 功能描述：提供对话相关的工具函数，包括用户信息处理、对话操作等
 */

/**
 * 获取对话中另一个用户的信息
 * @param {Object} conversation - 对话对象
 * @param {string} currentUserId - 当前用户ID
 * @returns {Object} 另一个用户的信息
 * @description 根据当前用户ID判断对话中的另一个用户，并返回其基本信息
 * 
 * @example
 * const conversation = {
 *   user1Id: 'user1',
 *   user2Id: 'user2',
 *   otherUserNickname: '张三',
 *   otherUserAvatar: 'avatar.jpg'
 * }
 * getOtherUserInfo(conversation, 'user1') // 返回 { nickname: '张三', avatar: 'avatar.jpg', userId: 'user2' }
 */
export const getOtherUserInfo = (conversation, currentUserId) => {
  if (!conversation || !currentUserId) {
    return {
      nickname: '未知用户',
      avatar: '/static/unnamed.jpg',
      userId: null
    };
  }
  
  const otherUserId = conversation.user1Id === currentUserId 
    ? conversation.user2Id 
    : conversation.user1Id;
  
  return {
    nickname: conversation.otherUserNickname || `用户${otherUserId.slice(-4)}`,
    avatar: conversation.otherUserAvatar || '/static/unnamed.jpg',
    userId: otherUserId
  };
};

/**
 * 获取对话中另一个用户的ID
 * @param {Object} conversation - 对话对象
 * @param {string} currentUserId - 当前用户ID
 * @returns {string} 另一个用户的ID
 * @description 根据当前用户ID判断对话中的另一个用户ID
 * 
 * @example
 * const conversation = { user1Id: 'user1', user2Id: 'user2' }
 * getOtherUserId(conversation, 'user1') // 返回 'user2'
 */
export const getOtherUserId = (conversation, currentUserId) => {
  if (!conversation || !currentUserId) {
    return null;
  }
  
  return conversation.user1Id === currentUserId 
    ? conversation.user2Id 
    : conversation.user1Id;
};

/**
 * 检查对话是否已置顶
 * @param {Object} conversation - 对话对象
 * @returns {boolean} 是否已置顶
 * @description 检查对话的置顶状态
 * 
 * @example
 * const conversation = { isPinned: 1 }
 * isConversationPinned(conversation) // 返回 true
 */
export const isConversationPinned = (conversation) => {
  return conversation && conversation.isPinned === 1;
};

/**
 * 检查对话是否有未读消息
 * @param {Object} conversation - 对话对象
 * @returns {boolean} 是否有未读消息
 * @description 检查对话是否有未读消息
 * 
 * @example
 * const conversation = { unreadCount: 5 }
 * hasUnreadMessages(conversation) // 返回 true
 */
export const hasUnreadMessages = (conversation) => {
  return conversation && conversation.unreadCount > 0;
};

/**
 * 格式化未读消息数量
 * @param {number} count - 未读消息数量
 * @returns {string} 格式化后的未读消息数量
 * @description 格式化未读消息数量显示，超过99显示99+
 * 
 * @example
 * formatUnreadCount(5) // 返回 "5"
 * formatUnreadCount(150) // 返回 "99+"
 */
export const formatUnreadCount = (count) => {
  if (!count || count <= 0) return '';
  return count > 99 ? '99+' : String(count);
};

/**
 * 获取对话的显示名称
 * @param {Object} conversation - 对话对象
 * @param {string} currentUserId - 当前用户ID
 * @returns {string} 对话的显示名称
 * @description 获取对话的显示名称，优先使用对方用户昵称
 * 
 * @example
 * const conversation = {
 *   user1Id: 'user1',
 *   user2Id: 'user2',
 *   otherUserNickname: '张三'
 * }
 * getConversationDisplayName(conversation, 'user1') // 返回 "张三"
 */
export const getConversationDisplayName = (conversation, currentUserId) => {
  const otherUserInfo = getOtherUserInfo(conversation, currentUserId);
  return otherUserInfo.nickname;
};

/**
 * 获取对话的最后消息预览
 * @param {Object} conversation - 对话对象
 * @returns {string} 最后消息预览
 * @description 获取对话的最后消息预览，如果没有消息则返回默认文本
 * 
 * @example
 * const conversation = { lastMessage: '你好，这个房子还在吗？' }
 * getLastMessagePreview(conversation) // 返回 "你好，这个房子还在吗？"
 */
export const getLastMessagePreview = (conversation) => {
  if (!conversation) return '暂无消息';
  return conversation.lastMessage || '暂无消息';
};

/**
 * 排序对话列表
 * @param {Array} conversations - 对话列表
 * @param {string} sortBy - 排序方式：'time'（按时间）、'unread'（按未读）、'pinned'（按置顶）
 * @returns {Array} 排序后的对话列表
 * @description 对对话列表进行排序，支持按时间、未读消息、置顶状态排序
 * 
 * @example
 * const conversations = [
 *   { lastMessageTime: '2025-01-15 10:00:00', isPinned: 0, unreadCount: 0 },
 *   { lastMessageTime: '2025-01-15 11:00:00', isPinned: 1, unreadCount: 5 }
 * ]
 * sortConversations(conversations, 'pinned') // 置顶的对话排在前面
 */
export const sortConversations = (conversations, sortBy = 'time') => {
  if (!Array.isArray(conversations)) return [];
  
  return [...conversations].sort((a, b) => {
    switch (sortBy) {
      case 'pinned':
        // 置顶的排在前面
        if (a.isPinned !== b.isPinned) {
          return b.isPinned - a.isPinned;
        }
        // 置顶状态相同时按时间排序
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        
      case 'unread':
        // 有未读消息的排在前面
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        // 未读消息数量相同时按时间排序
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        
      case 'time':
      default:
        // 按时间排序，最新的在前
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    }
  });
};
