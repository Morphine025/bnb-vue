<template>
  <view class="message-container">
    <!-- 消息列表 -->
    <ConversationList
      v-if="!loading && conversations.length > 0"
      :conversations="conversations"
      :current-user-id="currentUserId"
      @conversation-click="openChat"
      @show-actions="showActionSheet"
    />

    <!-- 空状态 -->
    <view v-else-if="!loading && conversations.length === 0" class="empty-state">
      <up-icon name="chat" size="80" color="#ccc"></up-icon>
      <view class="empty-text">暂无消息</view>
      <view class="empty-desc">去逛逛民宿，联系房东吧</view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <u-loading-icon mode="spinner" size="24" color="#007AFF"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 操作弹窗 -->
    <ConversationActions
      :show="showActionSheetFlag"
      :actions="actionSheetActions"
      @close="closeActionSheet"
      @action-select="handleActionSelect"
    />
  </view>
</template>

<script setup>
/**
 * 消息列表页面
 * 功能描述：显示用户的所有对话列表
 * 主要功能：对话列表展示、跳转聊天、未读消息提醒
 */

// 导入uni-app生命周期钩子
import { onLoad, onShow, onPullDownRefresh } from "@dcloudio/uni-app";

// 导入Vue响应式API
import { ref } from "vue";

// 导入API接口
import { API } from '../../api'

// 导入工具函数
import { checkLoginStatus } from '@/utils/authUtils'
import { getOtherUserId } from '@/utils/conversationUtils'

// 导入Stores
import { useMessageStore } from '@/stores/modules/message'
import { storeToRefs } from 'pinia'

// 导入Composables
import { useConversationActions } from '@/composables/useConversationActions'

// 导入组件
import ConversationList from './components/ConversationList.vue'
import ConversationActions from './components/ConversationActions.vue'

// ==================== 使用Stores ====================

// 消息状态管理
const messageStore = useMessageStore()
const { 
  conversations, 
  isConversationsLoading: loading 
} = storeToRefs(messageStore)

// 对话操作管理（保留Composable，因为这是UI交互逻辑）
const {
  showActionSheetFlag,
  actionSheetActions,
  showActionSheet,
  closeActionSheet,
  handleActionSelect
} = useConversationActions()

// ==================== 响应式数据 ====================

/**
 * 当前用户ID
 * @type {string|null} 当前登录用户的唯一标识
 */
const currentUserId = ref(null)

// ==================== 用户信息管理 ====================

/**
 * 获取当前用户信息
 * @description 获取当前登录用户的基本信息，主要用于确定对话中的另一个用户
 */
const getCurrentUserInfo = async () => {
  try {
    const res = await API.user.getInfo();
    if (res.code === 1) {
      currentUserId.value = res.data.userId;
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// ==================== 页面导航管理 ====================

/**
 * 打开聊天页面
 * @param {Object} conversation - 对话对象
 * @description 点击对话项时跳转到聊天页面，传递必要的参数
 */
const openChat = (conversation) => {
  console.log("💬 打开聊天:", conversation);
  
  // 获取另一个用户的ID
  const otherUserId = getOtherUserId(conversation, currentUserId.value);
  
  uni.navigateTo({
    url: `/pages/chat/chat?landlordId=${otherUserId}&conversationId=${conversation.conversationId}`
  });
};

// ==================== 生命周期管理 ====================

/**
 * 页面加载时初始化
 */
onLoad(async () => {
  // 检查登录状态
  if (!checkLoginStatus()) {
    return
  }
  
  await getCurrentUserInfo();
  await messageStore.fetchConversations();
});

/**
 * 页面显示时刷新数据
 */
onShow(() => {
  // 每次显示都检查登录状态
  if (!checkLoginStatus()) {
    return
  }
  
  messageStore.fetchConversations();
});

/**
 * 下拉刷新
 */
onPullDownRefresh(async () => {
  console.log('🔄 用户触发下拉刷新');
  
  // 检查登录状态
  if (!checkLoginStatus()) {
    uni.stopPullDownRefresh();
    return
  }
  
  try {
    // 重新加载对话列表
    await messageStore.fetchConversations();
    
    // 显示刷新成功提示
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    });
    
  } catch (error) {
    console.error('❌ 下拉刷新失败:', error);
    uni.showToast({
      title: '刷新失败，请重试',
      icon: 'none',
      duration: 2000
    });
  } finally {
    // 停止下拉刷新动画
    uni.stopPullDownRefresh();
  }
});

</script>

<style lang="scss" scoped>
.message-container {
  height: 100vh;
  background-color: #f5f5f5;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 60rpx;
  text-align: center;
}

.empty-state up-icon {
  margin-bottom: 40rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 60rpx;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .empty-state {
    padding: 150rpx 40rpx;
  }
  
  .loading-state {
    padding: 150rpx 40rpx;
  }
}
</style>