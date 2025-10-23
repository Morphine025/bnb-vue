<template>
	<view 
		v-if="isValidData"
		:class="['homestay-card', layout === 'single' ? 'single-card' : 'post-card']" 
		@click="handleClick"
	>
		<!-- 单排布局结构 -->
		<template v-if="layout === 'single'">
			<!-- 上半部分：图片和内容 -->
			<view class="single-top">
				<!-- 左侧图片区域 -->
				<view class="single-image">
					<image 
						:src="getImageUrl(data.img)" 
						mode="aspectFill" 
						class="single-img" 
						@error="handleImageError"
					></image>
					<!-- 位置信息覆盖在图片上 -->
					<view class="location-overlay" v-if="data.city || data.location">
						<up-icon name="map" size="14" color="#fff"></up-icon>
						<text class="location-text">{{ data.city || data.location }}</text>
					</view>
				</view>
				
				<!-- 右侧内容区域 -->
				<view class="single-content">
					<!-- 标题 -->
					<view class="single-title">{{ data.title }}</view>
					
					<!-- 详细信息 -->
					<view class="single-details" v-if="data.introduce">{{ data.introduce }}</view>
					
					<!-- 底部三个元素：金额、喜欢、收藏 -->
					<view class="single-actions">
						<view class="action-item">
							<text class="action-value price-value">¥{{ formatPrice(data.price) }}</text>
						</view>
						<view class="action-item">
							<up-icon name="heart-fill" size="16" color="#ff4757"></up-icon>
							<text class="action-value">{{ data.likes || 0 }}</text>
						</view>
						<view class="action-item">
							<up-icon name="star-fill" size="16" color="#ffa502"></up-icon>
							<text class="action-value">{{ data.supports || 0 }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部用户信息区域 -->
			<view class="single-footer">
				<view class="user-info">
					<view class="avatar">
						<image :src="getImageUrl(data.avatar)" mode="aspectFill" class="avatar-img"></image>
					</view>
					<view class="user-details">
						<text class="username">{{ data.author || 'Asuka' }}</text>
					</view>
				</view>
			</view>
		</template>
		
		<!-- 双排瀑布流布局结构 -->
		<template v-else>
			<!-- 图片区域 -->
			<view class="post-image">
				<image 
					:src="getImageUrl(data.img)" 
					mode="widthFix" 
					class="post-img" 
					@error="handleImageError"
				></image>
				
				<!-- 位置信息覆盖层 -->
				<view class="location-overlay" v-if="data.city || data.location">
					<up-icon name="map" size="14" color="#fff"></up-icon>
					<text class="location-text">{{ data.city || data.location }}</text>
				</view>
			</view>
			
			<!-- 内容区域 -->
			<view class="post-content">
				<!-- 标题 -->
				<view class="post-title">{{ data.title }}</view>
				
				<!-- 描述信息 -->
				<view class="post-summary" v-if="data.introduce">{{ data.introduce }}</view>
				
				<!-- 价格与点赞收藏 -->
				<view class="post-info">
					<view class="price-tag">
						<text class="price-symbol">¥</text>
						<text class="price-number">{{ formatPrice(data.price) }}</text>
					</view>
					<view class="interaction-stats">
						<view class="stat-item">
							<up-icon name="heart-fill" size="14" color="#ff4757"></up-icon>
							<text class="stat-count">{{ data.likes || 0 }}</text>
						</view>
						<view class="stat-item">
							<up-icon name="star-fill" size="14" color="#ffa502"></up-icon>
							<text class="stat-count">{{ data.supports || 0 }}</text>
						</view>
					</view>
				</view>
				
				<!-- 用户信息和互动 -->
				<view class="post-footer">
					<view class="user-info">
						<view class="avatar">
							<image :src="getImageUrl(data.avatar)" mode="aspectFill" class="avatar-img"></image>
						</view>
						<view class="user-details">
							<text class="username">{{ data.author || 'Asuka' }}</text>
						</view>
					</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script setup>
/**
 * 民宿卡片组件
 * 功能描述：支持双排瀑布流和单排列表两种布局的民宿卡片
 * 主要功能：图片显示、位置信息、价格展示、互动统计、用户信息
 */

import { computed } from 'vue'

// ==================== Props定义 ====================

const props = defineProps({
	/**
	 * 民宿数据对象
	 */
	data: {
		type: Object,
		required: false,
		default: () => ({})
	},
	
	/**
	 * 布局类型：'waterfall' | 'single'
	 */
	layout: {
		type: String,
		default: 'waterfall',
		validator: (value) => ['waterfall', 'single'].includes(value)
	}
})

// ==================== 事件定义 ====================

const emit = defineEmits(['click', 'imageError'])

// ==================== 计算属性 ====================

/**
 * 验证数据是否有效
 * 确保data对象存在且包含必要字段
 */
const isValidData = computed(() => {
	if (!props.data || typeof props.data !== 'object') {
		return false
	}
	// 检查是否有基本的必要字段
	return props.data.id || props.data.title || props.data.img
})

// ==================== 方法定义 ====================

/**
 * 处理卡片点击事件
 */
const handleClick = () => {
	emit('click', props.data)
}

/**
 * 处理图片加载错误
 */
const handleImageError = (event) => {
	console.error('图片加载失败:', event)
	emit('imageError', { event, data: props.data })
}

/**
 * 获取图片URL
 * @param {string} url - 图片URL
 * @returns {string} 处理后的图片URL
 */
const getImageUrl = (url) => {
	if (!url) return '/static/default-image.png'
	if (url.startsWith('http')) return url
	return `http://localhost:8081${url}`
}

/**
 * 格式化价格显示
 * @param {number} price - 价格
 * @returns {string} 格式化后的价格
 */
const formatPrice = (price) => {
	if (!price) return '0'
	if (price >= 10000) {
		return (price / 10000).toFixed(1) + '万'
	}
	return price.toString()
}
</script>

<style scoped>
/* ==================== 双排瀑布流样式 ==================== */

.post-card {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
}

.post-card:active {
	transform: scale(0.98);
}

.post-image {
	position: relative;
	width: 100%;
}

.post-img {
	width: 100%;
	border-radius: 20rpx 20rpx 0 0;
}

.post-content {
	padding: 20rpx;
}

.post-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.post-summary {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 15rpx;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.post-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 15rpx;
}

.price-tag {
	display: flex;
	align-items: baseline;
	color: #ff4757;
}

.price-symbol {
	font-size: 20rpx;
	font-weight: bold;
}

.price-number {
	font-size: 28rpx;
	font-weight: bold;
}

.interaction-stats {
	display: flex;
	gap: 15rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 5rpx;
}

.stat-count {
	font-size: 22rpx;
	color: #666;
}

/* ==================== 单排列表样式 ==================== */

.single-card {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
	width: 100%;
	box-sizing: border-box;
}

.single-card:active {
	transform: scale(0.98);
}

.single-image {
	width: 300rpx;
	min-height: 200rpx;
	border-radius: 12rpx;
	overflow: hidden;
	position: relative;
	flex-shrink: 0;
	display: flex;
	align-items: stretch;
}

.single-img {
	width: 100%;
	height: 100%;
}

.single-content {
	flex: 1;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.single-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.single-details {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 15rpx;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.single-actions {
	display: flex;
	gap: 20rpx;
	margin-top: auto;
}

.action-item {
	display: flex;
	align-items: center;
	gap: 5rpx;
}

.action-value {
	font-size: 24rpx;
	color: #666;
}

.price-value {
	color: #ff4757;
	font-weight: bold;
}

.single-footer {
	padding: 15rpx 20rpx;
	border-top: 1rpx solid #f0f0f0;
	background: #fafafa;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.avatar {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	overflow: hidden;
}

.avatar .avatar-img {
	width: 100%;
	height: 100%;
}

.username {
	font-size: 24rpx;
	color: #666;
}

/* ==================== 通用样式 ==================== */

.location-overlay {
	position: absolute;
	bottom: 10rpx;
	left: 10rpx;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 15rpx;
	padding: 5rpx 10rpx;
	display: flex;
	align-items: center;
	gap: 5rpx;
}

.location-text {
	color: #fff;
	font-size: 20rpx;
}

/* 响应式布局 */
.single-card {
	display: flex;
	flex-direction: column;
}

.single-card .single-top {
	display: flex;
	width: 100%;
	box-sizing: border-box;
}
</style>
