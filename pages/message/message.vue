<template>
  <view class="message-container">

    <!-- 消息列表 -->
    <view class="message-list" v-if="!loading && conversations.length > 0">
      <view
        v-for="conversation in conversations"
        :key="conversation.conversationId"
        class="message-item"
        :class="{ 'pinned': conversation.isPinned === 1 }"
        @click="openChat(conversation)"
      >
        <!-- 用户头像 -->
        <view class="user-avatar">
          <image
            :src="getOtherUserInfo(conversation).avatar || '/static/unnamed.jpg'"
            mode="aspectFill"
          ></image>
          <!-- 未读消息红点 -->
          <view v-if="conversation.unreadCount > 0" class="unread-badge">
            {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
          </view>
        </view>

        <!-- 消息内容 -->
        <view class="message-content">
          <view class="message-header">
            <view class="user-name">{{ getOtherUserInfo(conversation).nickname || '未知用户' }}</view>
            <view class="message-time">{{ formatTime(conversation.lastMessageTime) }}</view>
          </view>
          <view class="message-preview">
            <text class="last-message">{{ conversation.lastMessage || '暂无消息' }}</text>
          </view>
        </view>

        <!-- 更多操作 -->
        <view class="message-actions" @click.stop="showActionSheet(conversation)">
          <u-icon name="more-dot-fill" size="16" color="#999"></u-icon>
        </view>
      </view>
    </view>

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

    <!-- 自定义操作弹窗 -->
    <u-popup 
      :show="showActionSheetFlag" 
      mode="bottom" 
      :round="20"
      @close="closeActionSheet"
      :closeable="false"
    >
      <view class="custom-action-sheet">
        <view class="action-sheet-content">
          <view 
            v-for="(action, index) in actionSheetActions" 
            :key="index"
            class="action-item"
            @click="handleActionSelect(action)"
          >
            <view class="action-text" :style="{ color: action.color }">
              {{ action.name }}
            </view>
          </view>
        </view>
      </view>
    </u-popup>

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
import { ref, reactive } from "vue";

// 导入API接口 - 使用新的统一API
import { API } from '../../api'

// 导入Loading管理工具
import { showLoading, hideLoading } from '../../utils/loadingManager'

// 响应式数据定义
const conversations = ref([]);
const loading = ref(false);
const currentUserId = ref(null);

// 操作弹窗相关
const showActionSheetFlag = ref(false);
const currentConversation = ref(null);
const actionSheetActions = ref([
  { 
    name: '置顶', 
    color: '#007AFF'
  },
  { 
    name: '删除', 
    color: '#ff4757'
  }
]);

/**
 * 检查登录状态
 */
const checkLoginStatus = () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再查看消息',
      showCancel: false,
      confirmText: '去登录',
      success: () => {
        uni.switchTab({
          url: '/pages/my/my'
        })
      }
    })
    return false
  }
  return true
}

/**
 * 页面加载时初始化
 */
onLoad(() => {
  // 检查登录状态
  if (!checkLoginStatus()) {
    return
  }
  
  getCurrentUserInfo();
  loadConversations();
});

/**
 * 获取当前用户信息
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

/**
 * 页面显示时刷新数据
 */
onShow(() => {
  // 每次显示都检查登录状态
  if (!checkLoginStatus()) {
    return
  }
  
  loadConversations();
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
    await loadConversations();
    
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

/**
 * 加载对话列表
 */
const loadConversations = async () => {
  try {
    loading.value = true;
    console.log("📱 加载对话列表");
    
    const res = await API.chat.getConversations();
    console.log("📱 对话列表响应:", res);
    
    if (res.code === 1) {
      conversations.value = res.data || [];
      console.log("📱 对话列表数据:", conversations.value);
      
      // 检查对话数据结构，看是否包含用户信息
      if (conversations.value.length > 0) {
        console.log("📱 对话数据结构示例:", conversations.value[0]);
      }
      
      // 为每个对话添加未读消息数量
      for (const conversation of conversations.value) {
        try {
          // 这里应该调用API获取未读消息数量
          // 暂时设置为0
          conversation.unreadCount = 0;
        } catch (error) {
          console.error("获取未读消息数量失败:", error);
          conversation.unreadCount = 0;
        }
      }
    } else {
      console.error("📱 加载对话列表失败:", res.msg);
      uni.showToast({
        title: res.msg || "加载失败",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("加载对话列表失败:", error);
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

// 用户信息缓存
const userInfoCache = ref(new Map());

/**
 * 获取对话中另一个用户的信息
 */
const getOtherUserInfo = (conversation) => {
  // 根据当前用户ID判断另一个用户
  const otherUserId = conversation.user1Id === currentUserId.value ? conversation.user2Id : conversation.user1Id;
  
  // 检查缓存中是否有用户信息
  if (userInfoCache.value.has(otherUserId)) {
    return userInfoCache.value.get(otherUserId);
  }
  
  // 尝试从对话数据中提取用户信息
  let userInfo = {
    nickname: "用户" + otherUserId.slice(-4),
    avatar: "/static/unnamed.jpg",
    userId: otherUserId
  };
  
  // 检查对话数据是否包含用户信息（后端返回的字段）
  if (conversation.otherUserNickname || conversation.otherUserAvatar) {
    userInfo = {
      nickname: conversation.otherUserNickname || userInfo.nickname,
      avatar: conversation.otherUserAvatar || userInfo.avatar,
      userId: otherUserId
    };
  }
  
  // 缓存用户信息
  userInfoCache.value.set(otherUserId, userInfo);
  
  return userInfo;
};

/**
 * 获取用户信息
 */
const fetchUserInfo = async (userId) => {
  try {
    console.log('获取用户信息:', userId);
    
    const result = await API.user.getInfoById(userId);
    if (result && result.code === 1) {
      const userInfo = {
        nickname: result.data.nickname || result.data.username || "用户" + userId.slice(-4),
        avatar: result.data.avatar || result.data.headImage || "/static/unnamed.jpg",
        userId: userId
      };
      userInfoCache.value.set(userId, userInfo);
      console.log('用户信息获取成功:', userInfo);
    } else {
      console.warn('获取用户信息失败，使用默认信息');
    }
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  
  // 兼容iOS日期格式，将"2025-10-17 19:35:44"转换为"2025/10/17 19:35:44"
  let formattedTimestamp = timestamp;
  if (typeof timestamp === 'string' && timestamp.includes('-') && timestamp.includes(' ')) {
    // 将"2025-10-17 19:35:44"格式转换为"2025/10/17 19:35:44"格式
    formattedTimestamp = timestamp.replace(/-/g, '/');
  }
  
  const date = new Date(formattedTimestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) {
    // 1分钟内
    return "刚刚";
  } else if (diff < 3600000) {
    // 1小时内
    return Math.floor(diff / 60000) + "分钟前";
  } else if (diff < 86400000) {
    // 24小时内
    return Math.floor(diff / 3600000) + "小时前";
  } else if (diff < 172800000) {
    // 昨天
    return "昨天";
  } else {
    // 更早
    return date.toLocaleDateString();
  }
};

/**
 * 打开聊天页面
 */
const openChat = (conversation) => {
  console.log("💬 打开聊天:", conversation);
  
  // 获取另一个用户的ID
  const otherUserId = getOtherUserId(conversation);
  
  uni.navigateTo({
    url: `/pages/chat/chat?landlordId=${otherUserId}&conversationId=${conversation.conversationId}`
  });
};

/**
 * 获取对话中另一个用户的ID
 */
const getOtherUserId = (conversation) => {
  // 根据当前用户ID判断另一个用户
  return conversation.user1Id === currentUserId.value ? conversation.user2Id : conversation.user1Id;
};

/**
 * 显示操作弹窗
 */
const showActionSheet = (conversation) => {
  currentConversation.value = conversation;
  
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
    ];
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
    ];
  }
  
  showActionSheetFlag.value = true;
};

/**
 * 关闭操作弹窗
 */
const closeActionSheet = () => {
  showActionSheetFlag.value = false;
  currentConversation.value = null;
};

/**
 * 处理操作选择
 */
const handleActionSelect = (action) => {
  if (!currentConversation.value) return;
  
  switch (action.name) {
    case '置顶':
      pinConversationHandler(currentConversation.value);
      break;
    case '取消置顶':
      unpinConversationHandler(currentConversation.value);
      break;
    case '删除':
      deleteConversationHandler(currentConversation.value);
      break;
  }
  
  closeActionSheet();
};

/**
 * 置顶对话
 */
const pinConversationHandler = async (conversation) => {
  try {
    showLoading({ title: '置顶中...' });
    
    const res = await API.chat.pinConversation(conversation.conversationId);
    
    hideLoading();
    
    if (res.code === 1) {
      uni.showToast({
        title: '置顶成功',
        icon: 'success'
      });
      
      // 重新加载对话列表
      await loadConversations();
    } else {
      uni.showToast({
        title: res.msg || '置顶失败',
        icon: 'none'
      });
    }
    
  } catch (error) {
    hideLoading();
    console.error('置顶失败:', error);
    uni.showToast({
      title: '置顶失败',
      icon: 'none'
    });
  }
};

/**
 * 取消置顶对话
 */
const unpinConversationHandler = async (conversation) => {
  try {
    showLoading({ title: '取消置顶中...' });
    
    const res = await API.chat.unpinConversation(conversation.conversationId);
    
    hideLoading();
    
    if (res.code === 1) {
      uni.showToast({
        title: '取消置顶成功',
        icon: 'success'
      });
      
      // 重新加载对话列表
      await loadConversations();
    } else {
      uni.showToast({
        title: res.msg || '取消置顶失败',
        icon: 'none'
      });
    }
    
  } catch (error) {
    hideLoading();
    console.error('取消置顶失败:', error);
    uni.showToast({
      title: '取消置顶失败',
      icon: 'none'
    });
  }
};

/**
 * 删除对话
 */
const deleteConversationHandler = async (conversation) => {
  try {
    // 显示确认对话框
    const res = await uni.showModal({
      title: '确认删除',
      content: '确定要删除这个对话吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#ff4757'
    });
    
    if (!res.confirm) return;
    
    showLoading({ title: '删除中...' });
    
    const deleteRes = await API.chat.deleteConversation(conversation.conversationId);
    
    hideLoading();
    
    if (deleteRes.code === 1) {
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 重新加载对话列表
      await loadConversations();
    } else {
      uni.showToast({
        title: deleteRes.msg || '删除失败',
        icon: 'none'
      });
    }
    
  } catch (error) {
    hideLoading();
    console.error('删除失败:', error);
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    });
  }
};

</script>

<style lang="scss" scoped>
.message-container {
  height: 100vh;
  background-color: #f5f5f5;
}


/* 消息列表 */
.message-list {
  padding: 20rpx 0;
}

.message-item {
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

/* 自定义操作弹窗样式 */
.custom-action-sheet {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  overflow: hidden;
}

.action-sheet-content {
  padding: 20rpx 0;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 40rpx;
  margin: 0 20rpx 10rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.8;
  }
}

.action-text {
  font-size: 32rpx;
  font-weight: 500;
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

/* 空状态图标样式 */
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
  .message-item {
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

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .message-container {
    background-color: #1a1a1a;
  }
  
  .page-header {
    background-color: #2a2a2a;
    border-bottom-color: #3a3a3a;
  }
  
  .header-title {
    color: #fff;
  }
  
  .message-item {
    background-color: #2a2a2a;
    border-bottom-color: #3a3a3a;
    
    &:active {
      background-color: #3a3a3a;
    }
  }
  
  .user-name {
    color: #fff;
  }
  
  .message-preview {
    color: #ccc;
  }
  
  .message-time {
    color: #999;
  }
}
</style>