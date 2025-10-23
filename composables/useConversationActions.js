/**
 * 对话操作管理 Composable
 * 功能描述：提供对话操作相关的UI交互功能，包括操作弹窗、用户交互等
 * 注意：数据管理由 useMessageStore 负责，此 Composable 只处理UI交互
 */

import { ref } from 'vue'
import { API } from '@/api'
import { showLoading, hideLoading } from '@/utils'
import { useMessageStore } from '@/stores/modules/message'

/**
 * 对话操作管理 Composable
 * @returns {Object} 包含对话操作相关状态和方法的对象
 * @description 提供对话的置顶、删除、操作弹窗等功能
 * 
 * @example
 * const { showActionSheet, closeActionSheet, pinConversation } = useConversationActions();
 * showActionSheet(conversation);
 */
export function useConversationActions() {
  // 使用消息Store
  const messageStore = useMessageStore()
  
  // 响应式数据
  const showActionSheetFlag = ref(false)
  const currentConversation = ref(null)
  const actionSheetActions = ref([])

  /**
   * 显示操作弹窗
   * @param {Object} conversation - 对话对象
   * @description 根据对话的置顶状态动态显示不同的操作选项
   * 
   * @example
   * showActionSheet(conversation);
   */
  const showActionSheet = (conversation) => {
    currentConversation.value = conversation
    
    // 根据对话的置顶状态动态设置操作选项
    if (conversation.isPinned === 1) {
      // 已置顶，显示取消置顶
      actionSheetActions.value = [
        { 
          name: '取消置顶', 
          color: '#007AFF'
        },
        { 
          name: '删除', 
          color: '#ff4757'
        }
      ]
    } else {
      // 未置顶，显示置顶
      actionSheetActions.value = [
        { 
          name: '置顶', 
          color: '#007AFF'
        },
        { 
          name: '删除', 
          color: '#ff4757'
        }
      ]
    }
    
    showActionSheetFlag.value = true
  }

  /**
   * 关闭操作弹窗
   * @description 关闭操作弹窗并清空当前对话对象
   * 
   * @example
   * closeActionSheet();
   */
  const closeActionSheet = () => {
    showActionSheetFlag.value = false
    currentConversation.value = null
  }


  /**
   * 置顶对话
   * @param {Object} conversation - 对话对象
   * @returns {Promise<boolean>} 操作是否成功
   * @description 调用Store方法置顶对话
   * 
   * @example
   * const success = await pinConversation(conversation);
   * if (success) {
   *   console.log('置顶成功');
   * }
   */
  const pinConversation = async (conversation) => {
    try {
      showLoading({ title: '置顶中...' })
      await messageStore.pinConversationById(conversation.conversationId)
      hideLoading()
      uni.showToast({ title: '置顶成功', icon: 'success' })
      return true
    } catch (error) {
      hideLoading()
      console.error('置顶失败:', error)
      uni.showToast({ title: '置顶失败', icon: 'none' })
      return false
    }
  }

  /**
   * 取消置顶对话
   * @param {Object} conversation - 对话对象
   * @returns {Promise<boolean>} 操作是否成功
   * @description 调用Store方法取消置顶对话
   * 
   * @example
   * const success = await unpinConversation(conversation);
   * if (success) {
   *   console.log('取消置顶成功');
   * }
   */
  const unpinConversation = async (conversation) => {
    try {
      showLoading({ title: '取消置顶中...' })
      await messageStore.unpinConversationById(conversation.conversationId)
      hideLoading()
      uni.showToast({ title: '取消置顶成功', icon: 'success' })
      return true
    } catch (error) {
      hideLoading()
      console.error('取消置顶失败:', error)
      uni.showToast({ title: '取消置顶失败', icon: 'none' })
      return false
    }
  }

  /**
   * 删除对话
   * @param {Object} conversation - 对话对象
   * @returns {Promise<boolean>} 操作是否成功
   * @description 删除对话，删除前会显示确认对话框，删除后无法恢复
   * 
   * @example
   * const success = await deleteConversation(conversation);
   * if (success) {
   *   console.log('删除成功');
   * }
   */
  const deleteConversation = async (conversation) => {
    try {
      // 显示确认对话框
      const res = await uni.showModal({
        title: '确认删除',
        content: '确定要删除这个对话吗？删除后无法恢复。',
        confirmText: '删除',
        confirmColor: '#ff4757'
      })
      
      if (!res.confirm) return false
      
      showLoading({ title: '删除中...' })
      await messageStore.deleteConversationById(conversation.conversationId)
      hideLoading()
      uni.showToast({ title: '删除成功', icon: 'success' })
      return true
    } catch (error) {
      hideLoading()
      console.error('删除失败:', error)
      uni.showToast({ title: '删除失败', icon: 'none' })
      return false
    }
  }

  /**
   * 处理操作选择
   * @param {Object} action - 选中的操作对象
   * @param {Function} onSuccess - 操作成功后的回调函数
   * @returns {Promise<boolean>} 操作是否成功
   * @description 根据用户选择的操作执行相应的处理函数
   * 
   * @example
   * const success = await handleActionSelect(action, () => {
   *   console.log('操作成功，刷新列表');
   * });
   */
  const handleActionSelect = async (action, onSuccess) => {
    if (!currentConversation.value) return false

    let success = false
    switch (action.name) {
      case '置顶':
        success = await pinConversation(currentConversation.value)
        break
      case '取消置顶':
        success = await unpinConversation(currentConversation.value)
        break
      case '删除':
        success = await deleteConversation(currentConversation.value)
        break
      default:
        console.warn('未知操作:', action.name)
        return false
    }

    if (success && onSuccess) {
      onSuccess()
    }

    closeActionSheet()
    return success
  }

  /**
   * 获取当前对话
   * @returns {Object|null} 当前操作的对话对象
   * @description 获取当前正在操作的对话对象
   * 
   * @example
   * const conversation = getCurrentConversation();
   * if (conversation) {
   *   console.log('当前对话:', conversation);
   * }
   */
  const getCurrentConversation = () => {
    return currentConversation.value
  }

  /**
   * 检查是否有操作进行中
   * @returns {boolean} 是否有操作进行中
   * @description 检查当前是否有对话操作正在进行
   * 
   * @example
   * if (isActionInProgress()) {
   *   console.log('有操作正在进行中');
   * }
   */
  const isActionInProgress = () => {
    return showActionSheetFlag.value
  }

  return {
    // 响应式数据
    showActionSheetFlag,
    currentConversation,
    actionSheetActions,
    
    // 方法
    showActionSheet,
    closeActionSheet,
    pinConversation,
    unpinConversation,
    deleteConversation,
    handleActionSelect,
    getCurrentConversation,
    isActionInProgress
  }
}
