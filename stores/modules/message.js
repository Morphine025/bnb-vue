/**
 * 消息模块状态管理
 * 功能描述：管理消息相关的所有状态
 * 主要功能：对话列表、消息列表、未读消息、消息发送
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '../../api'

export const useMessageStore = defineStore('message', () => {
  // 对话列表
  const conversations = ref([])
  const isConversationsLoading = ref(false)
  
  // 请求去重机制
  const pendingRequests = new Set()
  
  // 当前对话
  const currentConversation = ref(null)
  const isCurrentConversationLoading = ref(false)
  
  // 消息列表
  const messages = ref([])
  const isMessagesLoading = ref(false)
  const messagesPage = ref(0)
  const messagesPageSize = ref(20)
  const hasMoreMessages = ref(true)
  
  // 未读消息
  const unreadCount = ref(0)
  const isUnreadCountLoading = ref(false)
  
  // 发送消息状态
  const isSendingMessage = ref(false)
  
  // 计算属性
  const hasConversations = computed(() => conversations.value.length > 0)
  const hasMessages = computed(() => messages.value.length > 0)
  const hasUnreadMessages = computed(() => unreadCount.value > 0)
  
  // 对话相关方法
  const setConversations = (conversationList) => {
    conversations.value = conversationList
  }
  
  const setConversationsLoading = (loading) => {
    isConversationsLoading.value = loading
  }
  
  const setCurrentConversation = (conversation) => {
    currentConversation.value = conversation
  }
  
  const setCurrentConversationLoading = (loading) => {
    isCurrentConversationLoading.value = loading
  }
  
  // 消息相关方法
  const setMessages = (messageList) => {
    messages.value = messageList
  }
  
  const appendMessages = (newMessages) => {
    messages.value.unshift(...newMessages)
  }
  
  const addMessage = (message) => {
    messages.value.push(message)
  }
  
  const setMessagesLoading = (loading) => {
    isMessagesLoading.value = loading
  }
  
  const setMessagesPage = (page) => {
    messagesPage.value = page
  }
  
  const setHasMoreMessages = (hasMore) => {
    hasMoreMessages.value = hasMore
  }
  
  // 未读消息相关方法
  const setUnreadCount = (count) => {
    unreadCount.value = count
  }
  
  const setUnreadCountLoading = (loading) => {
    isUnreadCountLoading.value = loading
  }
  
  const setSendingMessage = (sending) => {
    isSendingMessage.value = sending
  }
  
  // 清空方法
  const clearMessages = () => {
    messages.value = []
    messagesPage.value = 0
    hasMoreMessages.value = true
  }
  
  const clearConversations = () => {
    conversations.value = []
  }
  
  // API方法
  const fetchConversations = async () => {
    setConversationsLoading(true)
    try {
      const response = await API.chat.getConversations()
      if (response && response.code === 1) {
        setConversations(response.data || [])
        return response.data || []
      } else {
        throw new Error(response?.msg || '获取对话列表失败')
      }
    } catch (error) {
      console.error('获取对话列表失败:', error)
      throw error
    } finally {
      setConversationsLoading(false)
    }
  }
  
  const fetchConversation = async (conversationId) => {
    setCurrentConversationLoading(true)
    try {
      const response = await API.chat.getConversation(conversationId)
      if (response && response.code === 1) {
        setCurrentConversation(response.data)
        return response.data
      } else {
        throw new Error(response?.msg || '获取对话详情失败')
      }
    } catch (error) {
      console.error('获取对话详情失败:', error)
      throw error
    } finally {
      setCurrentConversationLoading(false)
    }
  }
  
  const sendNewMessage = async (conversationId, content, messageType = 'text') => {
    setSendingMessage(true)
    try {
      const response = await API.chat.sendMessage(conversationId, content, messageType)
      if (response && response.code === 1) {
        // 将新消息添加到消息列表
        addMessage(response.data)
        return response.data
      } else {
        throw new Error(response?.msg || '发送消息失败')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    } finally {
      setSendingMessage(false)
    }
  }
  
  const fetchMessages = async (conversationId, page = 0, size = 20) => {
    setMessagesLoading(true)
    try {
      const response = await API.chat.getMessages(conversationId, page, size)
      if (response && response.code === 1) {
        const messageList = response.data || []
        if (page === 0) {
          setMessages(messageList)
        } else {
          appendMessages(messageList)
        }
        setMessagesPage(page)
        setHasMoreMessages(messageList.length === size)
        return messageList
      } else {
        throw new Error(response?.msg || '获取消息列表失败')
      }
    } catch (error) {
      console.error('获取消息列表失败:', error)
      throw error
    } finally {
      setMessagesLoading(false)
    }
  }
  
  const markAsRead = async (conversationId) => {
    try {
      const response = await API.chat.markMessagesAsRead(conversationId)
      if (response && response.code === 1) {
        // 更新本地未读消息数量
        await fetchUnreadCount()
        return response.data
      } else {
        throw new Error(response?.msg || '标记已读失败')
      }
    } catch (error) {
      console.error('标记已读失败:', error)
      throw error
    }
  }
  
  const fetchUnreadCount = async () => {
    setUnreadCountLoading(true)
    try {
      const response = await API.chat.getUnreadCount()
      if (response && response.code === 1) {
        setUnreadCount(response.data || 0)
        return response.data || 0
      } else {
        setUnreadCount(0)
        return 0
      }
    } catch (error) {
      console.error('获取未读消息数量失败:', error)
      setUnreadCount(0)
      return 0
    } finally {
      setUnreadCountLoading(false)
    }
  }
  
  const pinConversationById = async (conversationId) => {
    try {
      const response = await API.chat.pinConversation(conversationId)
      if (response && response.code === 1) {
        // 更新本地对话列表
        await fetchConversations()
        return response.data
      } else {
        throw new Error(response?.msg || '置顶对话失败')
      }
    } catch (error) {
      console.error('置顶对话失败:', error)
      throw error
    }
  }
  
  const unpinConversationById = async (conversationId) => {
    try {
      const response = await API.chat.unpinConversation(conversationId)
      if (response && response.code === 1) {
        // 更新本地对话列表
        await fetchConversations()
        return response.data
      } else {
        throw new Error(response?.msg || '取消置顶失败')
      }
    } catch (error) {
      console.error('取消置顶失败:', error)
      throw error
    }
  }
  
  const deleteConversationById = async (conversationId) => {
    try {
      const response = await API.chat.deleteConversation(conversationId)
      if (response && response.code === 1) {
        // 更新本地对话列表
        await fetchConversations()
        return response.data
      } else {
        throw new Error(response?.msg || '删除对话失败')
      }
    } catch (error) {
      console.error('删除对话失败:', error)
      throw error
    }
  }
  
  const createNewConversation = async (landlordId, homestayId) => {
    try {
      const response = await API.chat.createConversation(landlordId, homestayId)
      if (response && response.code === 1) {
        // 更新本地对话列表
        await fetchConversations()
        return response.data
      } else {
        throw new Error(response?.msg || '创建对话失败')
      }
    } catch (error) {
      console.error('创建对话失败:', error)
      throw error
    }
  }
  
  const sendLandlordContact = async (conversationId, landlordId, homestayId) => {
    try {
      const response = await API.chat.autoSendLandlordContact(conversationId, landlordId, homestayId)
      if (response && response.code === 1) {
        return response.data
      } else {
        throw new Error(response?.msg || '发送联系信息失败')
      }
    } catch (error) {
      console.error('发送联系信息失败:', error)
      throw error
    }
  }
  
  // 初始化消息模块
  const initializeMessage = async () => {
    try {
      await Promise.all([
        fetchConversations(),
        fetchUnreadCount()
      ])
    } catch (error) {
      console.error('初始化消息模块失败:', error)
    }
  }
  
  return {
    // State
    conversations,
    isConversationsLoading,
    currentConversation,
    isCurrentConversationLoading,
    messages,
    isMessagesLoading,
    messagesPage,
    messagesPageSize,
    hasMoreMessages,
    unreadCount,
    isUnreadCountLoading,
    isSendingMessage,
    
    // Computed
    hasConversations,
    hasMessages,
    hasUnreadMessages,
    
    // Actions
    setConversations,
    setConversationsLoading,
    setCurrentConversation,
    setCurrentConversationLoading,
    setMessages,
    appendMessages,
    addMessage,
    setMessagesLoading,
    setMessagesPage,
    setHasMoreMessages,
    setUnreadCount,
    setUnreadCountLoading,
    setSendingMessage,
    clearMessages,
    clearConversations,
    
    // API Methods
    fetchConversations,
    fetchConversation,
    sendNewMessage,
    fetchMessages,
    markAsRead,
    fetchUnreadCount,
    pinConversationById,
    unpinConversationById,
    deleteConversationById,
    createNewConversation,
    sendLandlordContact,
    initializeMessage
  }
})