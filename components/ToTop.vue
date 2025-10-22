<template>
	<!-- 回到顶部按钮 -->
	<view v-if="showTopBtn" @click="toTop" class="back-to-top">
		<up-icon name="arrow-upward" color="#fff" size="28"></up-icon>
	</view>
</template>

<script setup>
/**
 * 回到顶部组件
 * 功能描述：提供通用的回到顶部功能
 * 主要功能：智能显示、平滑滚动、多种滚动方式支持
 */

import { ref, onMounted, onUnmounted } from 'vue'

// ==================== 组件属性 ====================

/**
 * 组件属性定义
 */
const props = defineProps({
	// 滚动容器选择器（默认为.content-area）
	scrollContainer: {
		type: String,
		default: '.content-area'
	},
	// 显示按钮的滚动距离阈值（默认500px）
	showThreshold: {
		type: Number,
		default: 500
	},
	// 滚动方式：'scroll-top' | 'page-scroll' | 'auto'
	scrollMethod: {
		type: String,
		default: 'auto'
	}
})

// ==================== 响应式数据 ====================

const showTopBtn = ref(0)                    // 控制回到顶部按钮显示
const scrollTop = ref(0)                     // scroll-view滚动位置
const scrollViewRef = ref(null)              // scroll-view引用

// ==================== 回到顶部功能 ====================

/**
 * 回到顶部
 */
const toTop = () => {
	console.log('🔝 回到顶部按钮被点击')
	
	// 方法1：使用scroll-top属性
	scrollTop.value = scrollTop.value === 0 ? 1 : 0
	console.log('📊 ToTop组件 scrollTop设置为:', scrollTop.value)
	
	setTimeout(() => {
		scrollTop.value = 0
		console.log('📊 ToTop组件 scrollTop重置为:', scrollTop.value)
	}, 50)
	
	// 方法2：使用页面滚动作为备用
	setTimeout(() => {
		console.log('🔄 执行页面滚动回到顶部')
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 300
		})
	}, 100)
}

// ==================== 滚动监听功能 ====================

/**
 * scroll-view滚动监听
 */
const onScrollViewScroll = (e) => {
	const scrollTop = e.detail.scrollTop
	showTopBtn.value = scrollTop > props.showThreshold ? 1 : 0
	// console.log('📊 滚动监听 - scrollTop:', scrollTop, 'showTopBtn:', showTopBtn.value)
}

/**
 * 页面滚动监听
 */
const onPageScroll = (e) => {
	showTopBtn.value = e.scrollTop > props.showThreshold ? 1 : 0
}

/**
 * 通用滚动监听（自动检测滚动类型）
 */
const handleScroll = (e) => {
	if (e.detail && e.detail.scrollTop !== undefined) {
		// scroll-view滚动
		onScrollViewScroll(e)
	} else if (e.scrollTop !== undefined) {
		// 页面滚动
		onPageScroll(e)
	}
}

// ==================== 生命周期 ====================

onMounted(() => {
	console.log('🎯 ToTop组件已挂载')
	
	// 初始化时检查是否需要显示按钮
	// 由于组件无法直接监听页面滚动，需要父组件传递滚动事件
	console.log('📊 初始showTopBtn状态:', showTopBtn.value)
})

onUnmounted(() => {
	console.log('🎯 ToTop组件已卸载')
})

// ==================== 暴露给父组件的方法和属性 ====================

// 暴露方法和属性给父组件使用
defineExpose({
	scrollTop,
	scrollViewRef,
	onScrollViewScroll,
	onPageScroll,
	handleScroll,
	showTopBtn,
	toTop
})
</script>

<style scoped>
/* 回到顶部按钮样式 */
.back-to-top {
	position: fixed;
	bottom: 120rpx;
	right: 30rpx;
	width: 80rpx;
	height: 80rpx;
	background: #667eea;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	z-index: 999;
	transition: all 0.3s ease;
}

.back-to-top:active {
	transform: scale(0.9);
	background: #5a6fd8;
}
</style>
