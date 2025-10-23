<template>
  <view
    class="conversation-item"
    :class="{ 'pinned': conversation.isPinned === 1 }"
    @click="$emit('click', conversation)"
  >
    <!-- 用户头像 -->
    <view class="user-avatar">
      <image
        :src="userInfo.avatar || '/static/unnamed.jpg'"
        mode="aspectFill"
        @error="handleImageError"
      ></image>
      <!-- 未读消息红点 -->
      <view v-if="conversation.unreadCount > 0" class="unread-badge">
        {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
      </view>
    </view>

    <!-- 消息内容 -->
    <view class="message-content">
      <view class="message-header">
        <view class="user-name">{{ userInfo.nickname || '未知用户' }}</view>
        <view class="message-time">{{ formatTime(conversation.lastMessageTime) }}</view>
      </view>
      <view class="message-preview">
        <text class="last-message">{{ conversation.lastMessage || '暂无消息' }}</text>
      </view>
    </view>

    <!-- 更多操作 -->
    <view class="message-actions" @click.stop="$emit('show-actions', conversation)">
      <u-icon name="more-dot-fill" size="16" color="#999"></u-icon>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { formatTime } from '@/utils/timeUtils'
import { getOtherUserInfo } from '@/utils/conversationUtils'

/**
 * 对话项组件
 * 功能描述：显示单个对话的基本信息，包括用户头像、昵称、最后消息、时间等
 */

// 组件属性定义
const props = defineProps({
  /**
   * 对话对象
   * @type {Object}
   * @required
   */
  conversation: {
    type: Object,
    required: true
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
const emit = defineEmits(['click', 'show-actions'])

/**
 * 计算用户信息
 * @description 使用工具函数获取对话中的另一个用户信息，避免重复逻辑
 */
const userInfo = computed(() => {
  return getOtherUserInfo(props.conversation, props.currentUserId)
})

/**
 * 处理图片加载错误
 * @description 当用户头像加载失败时，使用默认头像
 */
const handleImageError = (event) => {
  console.log('用户头像加载失败，使用默认头像')
  // 设置默认头像
  event.target.src = '/static/unnamed.jpg'
}
</script>

<style lang="scss" scoped>
.conversation-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
  
  &:active {
    background-color: #f8f8f8;
  }
  
  // 置顶消息样式
  &.pinned {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
    box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.1);
    
    &:active {
      background: linear-gradient(135deg, #e8f0ff 0%, #e0ecff 100%);
      transform: scale(0.98);
    }
  }
}

.user-avatar {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
  flex-shrink: 0;

  image {
    width: 100%;
    height: 100%;
  }
}

.unread-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #ff4757;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
  line-height: 1;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
  margin-left: 20rpx;
}

.message-preview {
  font-size: 28rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-message {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-actions {
  margin-left: 20rpx;
  padding: 10rpx;
  flex-shrink: 0;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .conversation-item {
    padding: 25rpx;
  }
  
  .user-avatar {
    width: 80rpx;
    height: 80rpx;
  }
  
  .user-name {
    font-size: 30rpx;
  }
  
  .message-preview {
    font-size: 26rpx;
  }
}
</style>