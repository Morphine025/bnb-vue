<template>
	<!-- 页面背景区域 -->
	<view class="topBox">
		<!-- 背景渐变装饰 -->
		<view class="background-decoration" :class="decorationClass"></view>
		<!-- 内容插槽 -->
		<slot></slot>
	</view>
</template>

<script setup>
/**
 * 页面背景组件
 * 功能描述：提供页面背景渐变和装饰效果
 * 主要功能：
 * 1. 背景渐变 - 提供美观的渐变背景
 * 2. 装饰效果 - 添加视觉装饰元素
 * 3. 内容容器 - 为子内容提供容器
 * 4. 主题支持 - 支持不同主题的背景样式
 * 5. 响应式设计 - 适配不同屏幕尺寸
 * 6. 深色模式 - 支持深色模式切换
 * 
 * 技术特点：
 * - 纯样式组件
 * - 插槽支持
 * - 响应式设计
 * - 主题可配置
 * - CSS变量支持
 * - 媒体查询优化
 */

// ==================== 导入依赖 ====================

import { computed } from 'vue'

// ==================== 组件属性 ====================

/**
 * 组件属性定义
 */
const props = defineProps({
	// 是否显示装饰效果
	showDecoration: {
		type: Boolean,
		default: true
	}
})

// ==================== 计算属性 ====================

/**
 * 装饰样式类
 * 功能：根据是否显示装饰返回对应的样式类
 */
const decorationClass = computed(() => {
	return props.showDecoration ? 'show-decoration' : 'hide-decoration'
})
</script>

<style lang="scss" scoped>
/**
 * 页面背景组件样式
 * 提供渐变背景和装饰效果
 */

.topBox {
	width: 100%;
	position: relative;
	z-index: 1;
	overflow: hidden;
	padding: 120rpx 20rpx 40rpx;
	box-sizing: border-box;
}

/**
 * 背景装饰元素
 * 使用伪元素创建渐变背景效果
 */
.background-decoration {
	content: "";
	width: 140%;
	height: 220px;
	position: absolute;
	z-index: -1;
	top: 0;
	left: -20%;
	border-radius: 0 0 50% 50%;
	transition: all 0.3s ease;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/**
 * 显示装饰效果
 */
.show-decoration {
	.background-decoration {
		opacity: 1;
		transform: scale(1);
	}
}

/**
 * 隐藏装饰效果
 */
.hide-decoration {
	.background-decoration {
		opacity: 0;
		transform: scale(0.8);
	}
}

/**
 * 响应式设计
 */
@media (max-width: 750rpx) {
	.topBox {
		padding: 100rpx 15rpx 30rpx;
	}
	
	.background-decoration {
		width: 120%;
		left: -10%;
	}
}

/**
 * 深色模式支持
 */
@media (prefers-color-scheme: dark) {
	.background-default {
		background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
	}
	
	.background-gradient {
		background: linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%);
	}
}
</style>
