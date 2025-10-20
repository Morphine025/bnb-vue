<template>
  <view class="chat-container">
    <!-- 聊天消息区域 -->
    <view class="chat-messages" ref="chatMessages">
      <view class="message-list">
        <!-- 加载更多按钮 -->
        <view v-if="hasMoreMessages" class="load-more" @click="loadMoreMessages">
          <u-loading-icon v-if="loadingMore" mode="spinner" size="16" color="#007AFF"></u-loading-icon>
          <text v-else>加载更多消息</text>
        </view>

        <view
          v-for="(message, index) in messages"
          :key="message.messageId || index"
          class="message-item"
        >
          <!-- 时间戳 -->
          <view v-if="shouldShowTime(message, index)" class="message-time">
            {{ formatMessageTime(message.createdAt) }}
          </view>

           <!-- 消息内容 -->
           <view
             class="message-content"
             :class="{ 'is-own': message.senderId === currentUserId }"
           >
             <template v-if="message.senderId !== currentUserId">
               <view class="message-avatar">
                 <image
                   :src="landlordInfo.avatarUrl || '/static/unnamed.jpg'"
                   mode="aspectFill"
                 ></image>
               </view>
               <view class="message-bubble other">
                 <view class="message-text">{{ message.content }}</view>
                 <view
                   class="message-status"
                   v-if="message.messageType === 'auto_reply'"
                 >
                   智能回复
                 </view>
               </view>
             </template>
             <template v-else>
               <view class="message-bubble own">
                 <view class="message-text">{{ message.content }}</view>
                 <view class="message-status" v-if="message.isRead">
                   <text>已读</text>
                 </view>
               </view>
               <view class="message-avatar">
                 <image
                   :src="currentUserInfo.avatarUrl || '/static/unnamed.jpg'"
                   mode="aspectFill"
                 ></image>
               </view>
             </template>
           </view>
           
           <!-- 智能回复消息的复制按钮 - 在消息项外部 -->
           <view 
             v-if="message.senderId !== currentUserId && message.messageType === 'auto_reply'" 
             class="copy-buttons-container"
           >
             <view 
               v-if="message.content.includes('我的手机号是：')"
               class="copy-button phone"
               @click="copyContactInfo(message.content)"
             >
               <u-icon name="phone-fill" size="16" color="#ffffff"></u-icon>
               <text class="copy-text">一键复制手机号</text>
             </view>
             <view 
               v-if="message.content.includes('我的微信号是：')"
               class="copy-button wechat"
               @click="copyContactInfo(message.content)"
             >
               <u-icon name="weixin-fill" size="16" color="#ffffff"></u-icon>
               <text class="copy-text">一键复制微信号</text>
             </view>
           </view>
         </view>
      </view>
    </view>


    <!-- 底部输入框 -->
    <view class="chat-input">
      <view class="input-container">
        <input
          v-model="inputMessage"
          class="message-input"
          placeholder="想跟TA说点什么..."
          placeholder-style="color: #999;"
          @confirm="sendMessage"
          :disabled="sending"
        />
         <view class="input-actions">
           <u-icon
             name="arrow-right"
             size="24"
             :color="!inputMessage.trim() || sending ? '#ccc' : '#667eea'"
             @click="sendMessage"
           ></u-icon>
         </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 聊天页面组件
 * 功能描述：用户与房东的聊天界面
 * 主要功能：消息展示、发送消息、实时更新
 */

// 导入uni-app生命周期钩子
import { onLoad, onShow } from "@dcloudio/uni-app";

// 导入Vue响应式API
import { ref, reactive, computed, nextTick } from "vue";

// 导入API接口 - 使用新的统一API
import { API } from '../../api';

// 响应式数据定义
const conversationId = ref("");
const landlordId = ref(null);
const homestayId = ref(null);
const currentUserId = ref(null);
const messages = ref([]);
const inputMessage = ref("");
const sending = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const hasMoreMessages = ref(true);
const page = ref(0);
const size = ref(20);
const chatMessages = ref(null);

// 房东信息
const landlordInfo = reactive({
  nickName: "",
  avatarUrl: "",
  memberName: "t***1",
});

// 当前用户信息
const currentUserInfo = reactive({
  nickName: "",
  avatarUrl: "",
});

/**
 * 页面加载时初始化
 */
onLoad((options) => {
  landlordId.value = options.landlordId; // 保持字符串类型
  homestayId.value = options.homestayId || null; // 保持字符串类型
  conversationId.value = options.conversationId || ""; // 如果已有对话ID，直接使用

  // 获取当前用户信息
  getCurrentUserInfo();

  // 如果有对话ID，直接加载消息；否则创建新对话
  if (conversationId.value) {
    loadMessages();
    getLandlordInfo();
  } else {
    createOrGetConversation();
  }
});

/**
 * 页面显示时标记消息已读
 */
onShow(() => {
  if (conversationId.value) {
    API.chat.markMessagesAsRead(conversationId.value);
  }
});

/**
 * 获取当前用户信息
 */
const getCurrentUserInfo = async () => {
  try {
    const res = await API.user.getInfo();
    if (res.code === 1) {
      currentUserId.value = res.data.userId;
      currentUserInfo.nickName = res.data.nickName;
      currentUserInfo.avatarUrl = res.data.avatarUrl;
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

/**
 * 获取房东信息
 */
const getLandlordInfo = async () => {
  try {
    console.log("👤 获取房东信息，房东ID:", landlordId.value);
    
    // 调用API获取房东信息
    const res = await API.user.getInfoById(landlordId.value);
    console.log("👤 房东信息响应:", res);
    
    if (res.code === 1 && res.data) {
      landlordInfo.nickName = res.data.nickname || "房东";
      landlordInfo.avatarUrl = res.data.avatar || "/static/unnamed.jpg";
      console.log("👤 房东信息设置成功:", {
        nickName: landlordInfo.nickName,
        avatarUrl: landlordInfo.avatarUrl
      });
    } else {
      console.warn("👤 获取房东信息失败，使用默认值");
      landlordInfo.nickName = "房东";
      landlordInfo.avatarUrl = "/static/unnamed.jpg";
    }
  } catch (error) {
    console.error("获取房东信息失败:", error);
    // 使用默认值
    landlordInfo.nickName = "房东";
    landlordInfo.avatarUrl = "/static/unnamed.jpg";
  }
};

/**
 * 创建或获取对话
 */
const createOrGetConversation = async () => {
  try {
    loading.value = true;
    console.log("🔗 创建对话 - 参数:", {
      landlordId: landlordId.value,
      homestayId: homestayId.value,
    });
    const res = await API.chat.createConversation(landlordId.value, homestayId.value);
    console.log("🔗 创建对话 - 响应:", res);
    if (res.code === 1) {
      conversationId.value = res.data.conversationId;
      console.log("🔗 创建对话 - conversationId:", conversationId.value);
      // 获取房东信息
      landlordInfo.nickName = res.data.landlordName || "房东";
      landlordInfo.avatarUrl = res.data.landlordAvatar || "/static/unnamed.jpg";
      
      // 自动发送房东联系信息（每次进入聊天都发送）
      console.log("🔗 自动发送房东联系信息");
      await sendLandlordContactInfo();
      
      // 加载消息列表
      loadMessages();
    } else {
      console.error("🔗 创建对话失败:", res.msg);
      uni.showToast({
        title: res.msg || "创建对话失败",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("创建对话失败:", error);
    uni.showToast({
      title: "创建对话失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

/**
 * 复制联系信息到剪贴板
 */
const copyContactInfo = (content) => {
  try {
    // 从消息内容中提取手机号或微信号
    let contactInfo = '';
    
    if (content.includes('我的手机号是：')) {
      // 提取手机号
      const phoneMatch = content.match(/我的手机号是：(\d+)/);
      if (phoneMatch) {
        contactInfo = phoneMatch[1];
      }
    } else if (content.includes('我的微信号是：')) {
      // 提取微信号
      const wechatMatch = content.match(/我的微信号是：(.+)/);
      if (wechatMatch) {
        contactInfo = wechatMatch[1];
      }
    }
    
    if (contactInfo) {
      // 复制到剪贴板
      uni.setClipboardData({
        data: contactInfo,
        success: () => {
          const successMessage = content.includes('我的手机号是：') ? '手机号已复制' : '微信号已复制';
          uni.showToast({
            title: successMessage,
            icon: 'success',
            duration: 1500
          });
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
    } else {
      uni.showToast({
        title: '无法识别联系信息',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('复制联系信息失败:', error);
    uni.showToast({
      title: '复制失败',
      icon: 'none'
    });
  }
};

/**
 * 自动发送房东联系信息
 */
const sendLandlordContactInfo = async () => {
  try {
    console.log("📱 开始自动发送房东联系信息");
    console.log("📱 参数:", {
      conversationId: conversationId.value,
      landlordId: landlordId.value,
      homestayId: homestayId.value
    });
    const res = await API.chat.autoSendLandlordContact(conversationId.value, landlordId.value, homestayId.value);
    console.log("📱 自动发送房东联系信息响应:", res);
    
    if (res.code === 1) {
      console.log("📱 房东联系信息发送成功");
      // 重新加载消息列表以显示新发送的消息
      await loadMessages();
    } else {
      console.error("📱 自动发送房东联系信息失败:", res.msg);
    }
  } catch (error) {
    console.error("📱 自动发送房东联系信息异常:", error);
  }
};

/**
 * 加载消息列表
 */
const loadMessages = async () => {
  if (!conversationId.value) return;

  try {
    loading.value = true;
    const res = await API.chat.getMessages(conversationId.value, page.value, size.value);
    if (res.code === 1) {
      if (page.value === 0) {
        messages.value = res.data.reverse(); // 新消息在底部
      } else {
        messages.value = [...res.data.reverse(), ...messages.value];
      }
      
      // 检查是否还有更多消息
      hasMoreMessages.value = res.data.length === size.value;
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom();
      });
    }
  } catch (error) {
    console.error("加载消息失败:", error);
  } finally {
    loading.value = false;
  }
};

/**
 * 加载更多消息
 */
const loadMoreMessages = async () => {
  if (loadingMore.value || !hasMoreMessages.value) return;
  
  try {
    loadingMore.value = true;
    page.value++;
    const res = await API.chat.getMessages(conversationId.value, page.value, size.value);
    if (res.code === 1) {
      const newMessages = res.data.reverse();
      messages.value = [...newMessages, ...messages.value];
      hasMoreMessages.value = newMessages.length === size.value;
    }
  } catch (error) {
    console.error("加载更多消息失败:", error);
    page.value--; // 回退页码
  } finally {
    loadingMore.value = false;
  }
};

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  if (chatMessages.value) {
    uni.createSelectorQuery()
      .select('.chat-messages')
      .boundingClientRect((rect) => {
        if (rect) {
          uni.pageScrollTo({
            scrollTop: rect.height,
            duration: 300
          });
        }
      })
      .exec();
  }
};


/**
 * 发送消息
 */
const sendMessage = async () => {
  if (!inputMessage.value.trim() || sending.value) return;

  const content = inputMessage.value.trim();
  inputMessage.value = "";
  sending.value = true;

  console.log(
    "📤 发送消息 - conversationId:",
    conversationId.value,
    "content:",
    content
  );

  try {
    const res = await API.chat.sendMessage(conversationId.value, content, "text");
    console.log("📤 发送消息 - 响应:", res);
    if (res.code === 1) {
      // 添加消息到列表
      messages.value.push(res.data);
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom();
      });
    } else {
      console.error("📤 发送消息失败:", res.msg);
      uni.showToast({
        title: res.msg || "发送失败",
        icon: "none",
      });
      // 恢复输入内容
      inputMessage.value = content;
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    uni.showToast({
      title: "发送失败",
      icon: "none",
    });
    // 恢复输入内容
    inputMessage.value = content;
  } finally {
    sending.value = false;
  }
};

/**
 * 标记消息为已读
 */
const markMessagesAsRead = async () => {
  if (!conversationId.value) return;

  try {
    await API.chat.markMessagesAsRead(conversationId.value);
  } catch (error) {
    console.error("标记已读失败:", error);
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
  } else {
    return (
      date.toLocaleDateString() + " " + date.toLocaleTimeString().slice(0, 5)
    );
  }
};

/**
 * 格式化消息时间
 */
const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";
  
  // 修复iOS日期格式兼容性问题
  let date;
  if (typeof timestamp === 'string') {
    // 将 "yyyy-MM-dd HH:mm:ss" 格式转换为 "yyyy-MM-ddTHH:mm:ss" 格式
    const isoString = timestamp.replace(' ', 'T');
    date = new Date(isoString);
  } else {
    date = new Date(timestamp);
  }
  
  const now = new Date();
  const diff = now - date;

  // 如果是今天，显示时间
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString().slice(0, 5);
  }
  // 如果是昨天，显示昨天
  if (diff < 172800000 && date.getDate() === now.getDate() - 1) {
    return "昨天 " + date.toLocaleTimeString().slice(0, 5);
  }
  // 其他情况显示完整日期时间
  return (
    date.toLocaleDateString() + " " + date.toLocaleTimeString().slice(0, 5)
  );
};

/**
 * 判断是否显示时间戳
 */
const shouldShowTime = (message, index) => {
  if (index === 0) return true;
  const prevMessage = messages.value[index - 1];
  if (!prevMessage) return true;

  // 修复iOS日期格式兼容性问题
  let currentTime, prevTime;
  
  if (typeof message.createdAt === 'string') {
    const currentIsoString = message.createdAt.replace(' ', 'T');
    currentTime = new Date(currentIsoString);
  } else {
    currentTime = new Date(message.createdAt);
  }
  
  if (typeof prevMessage.createdAt === 'string') {
    const prevIsoString = prevMessage.createdAt.replace(' ', 'T');
    prevTime = new Date(prevIsoString);
  } else {
    prevTime = new Date(prevMessage.createdAt);
  }
  
  const diff = currentTime - prevTime;

  // 如果时间差超过5分钟，显示时间戳
  return diff > 300000;
};



/**
 * 清空聊天记录
 */
const clearChatHistory = () => {
  uni.showModal({
    title: "确认清空",
    content: "确定要清空聊天记录吗？",
    success: (res) => {
      if (res.confirm) {
        messages.value = [];
        uni.showToast({
          title: "已清空",
          icon: "success",
        });
      }
    },
  });
};

/**
 * 举报用户
 */
const reportUser = () => {
  uni.showModal({
    title: "举报用户",
    content: "确定要举报该用户吗？",
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: "举报成功",
          icon: "success",
        });
      }
    },
  });
};

/**
 * 拉黑用户
 */
const blockUser = () => {
  uni.showModal({
    title: "拉黑用户",
    content: "确定要拉黑该用户吗？",
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: "已拉黑",
          icon: "success",
        });
      }
    },
  });
};

/**
 * 拍照
 */
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ["camera"],
    success: (res) => {
      // 处理拍照结果
      console.log("拍照成功:", res);
    },
  });
};

/**
 * 选择图片
 */
const chooseImage = () => {
  uni.chooseImage({
    count: 9,
    sourceType: ["album"],
    success: (res) => {
      // 处理选择图片结果
      console.log("选择图片成功:", res);
    },
  });
};

/**
 * 发送位置
 */
const sendLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      // 处理位置选择结果
      console.log("选择位置成功:", res);
    },
  });
};



</script>

<style lang="scss" scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  background-color: #f5f5f5;
  overflow-y: auto;
  height: calc(100vh - 120rpx); /* 减去输入框的高度 */
}

.message-list {
  padding: 20rpx 0;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  color: #007AFF;
  font-size: 28rpx;
  cursor: pointer;
  
  &:active {
    opacity: 0.6;
  }
}

.message-item {
  margin-bottom: 20rpx;
}

.message-time {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin: 20rpx 0;
}

 .message-content {
   display: flex;
   align-items: flex-start;
   margin: 0 30rpx;

   &.is-own {
     flex-direction: row;
     justify-content: flex-end;
   }
 }

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  image {
    width: 100%;
    height: 100%;
  }
}

 .message-bubble {
   max-width: 500rpx;
   padding: 20rpx 24rpx;
   border-radius: 20rpx;
   position: relative;

   &.other {
     background-color: #fff;
     margin-left: 20rpx;
     margin-right: 100rpx;
   }

   &.own {
     background-color: #007AFF;
     margin-right: 20rpx;
     margin-left: 20rpx;
   }
 }

.message-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-bubble.own .message-text {
  color: #fff;
}

.message-status {
  font-size: 20rpx;
  color: #999;
  margin-top: 8rpx;
  text-align: right;
}

/* 复制按钮容器样式 */
.copy-buttons-container {
  margin: 12rpx 30rpx 20rpx 130rpx; /* 与消息气泡左边缘对齐（页面边距30rpx + 头像宽度80rpx + 间距20rpx = 130rpx） */
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

/* 复制按钮样式 */
.copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 20rpx;
  background-color: #34C759;
  border: none;
  border-radius: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
  font-size: 24rpx;
  color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(52, 199, 89, 0.3);
}

.copy-button:hover {
  background-color: #2FB84D;
  box-shadow: 0 4rpx 12rpx rgba(52, 199, 89, 0.4);
}

.copy-button:active {
  background-color: #2A9F42;
  box-shadow: 0 1rpx 4rpx rgba(52, 199, 89, 0.5);
}

.copy-text {
  margin-left: 8rpx;
  color: #ffffff;
  font-size: 24rpx;
}




/* 底部输入框 */
.chat-input {
  background-color: #fff;
  border-top: 1rpx solid #e5e5e5;
  padding: 20rpx 30rpx 45rpx 30rpx;
  position: relative;
  z-index: 100;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
}

.message-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: #999;
  }
}

 .input-actions {
   display: flex;
   align-items: center;
   margin-left: 20rpx;
 }

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .message-bubble {
    max-width: 400rpx;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .chat-container {
    background-color: #1a1a1a;
  }

  .chat-messages {
    background-color: #1a1a1a;
  }

  .message-bubble.other {
    background-color: #2a2a2a;
  }

  .message-text {
    color: #fff;
  }

  .message-status {
    color: #999;
  }

  .chat-input {
    background-color: #2a2a2a;
    border-top-color: #3a3a3a;
  }

  .input-container {
    background-color: #3a3a3a;
  }

  .message-input {
    color: #fff;
  }
}
</style>