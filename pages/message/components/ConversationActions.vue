<template>
  <u-popup 
    :show="show" 
    mode="bottom" 
    :round="20"
    @close="$emit('close')"
    :closeable="false"
  >
    <view class="action-sheet">
      <view class="action-sheet-content">
        <view 
          v-for="(action, index) in actions" 
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
</template>

<script setup>
/**
 * 对话操作弹窗组件
 * 功能描述：显示对话的操作选项（置顶、取消置顶、删除等）
 */

// 组件属性定义
const props = defineProps({
  /**
   * 是否显示弹窗
   * @type {Boolean}
   * @default false
   */
  show: {
    type: Boolean,
    default: false
  },
  /**
   * 操作选项列表
   * @type {Array}
   * @default []
   */
  actions: {
    type: Array,
    default: () => []
  }
})

// 组件事件定义
const emit = defineEmits(['close', 'action-select'])

/**
 * 处理操作选择
 * @param {Object} action - 选中的操作对象
 * @description 当用户选择某个操作时，触发操作选择事件并关闭弹窗
 */
const handleActionSelect = (action) => {
  console.log('🔧 选择操作:', action)
  emit('action-select', action)
  emit('close')
}
</script>

<style lang="scss" scoped>
.action-sheet {
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
</style>
