<template>
  <view class="conversation-list">
    <ConversationItem
      v-for="conversation in conversations"
      :key="conversation.conversationId"
      :conversation="conversation"
      :current-user-id="currentUserId"
      @click="handleConversationClick"
      @show-actions="handleShowActions"
    />
  </view>
</template>

<script setup>
import ConversationItem from './ConversationItem.vue'

/**
 * 对话列表组件
 * 功能描述：显示所有对话的列表，处理对话点击和操作事件
 */

// 组件属性定义
const props = defineProps({
  /**
   * 对话列表数据
   * @type {Array}
   * @default []
   */
  conversations: {
    type: Array,
    default: () => []
  },
  /**
   * 当前用户ID
   * @type {String}
   * @required
   */
  currentUserId: {
    type: String,
    required: true
  }
})

// 组件事件定义
const emit = defineEmits(['conversation-click', 'show-actions'])

/**
 * 处理对话点击事件
 * @param {Object} conversation - 对话对象
 * @description 当用户点击对话项时，触发对话点击事件
 */
const handleConversationClick = (conversation) => {
  console.log('💬 对话被点击:', conversation)
  emit('conversation-click', conversation)
}

/**
 * 处理显示操作菜单事件
 * @param {Object} conversation - 对话对象
 * @description 当用户点击更多操作按钮时，触发显示操作菜单事件
 */
const handleShowActions = (conversation) => {
  console.log('🔧 显示操作菜单:', conversation)
  emit('show-actions', conversation)
}
</script>

<style lang="scss" scoped>
.conversation-list {
  padding: 20rpx 0;
}
</style>
