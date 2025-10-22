<template>
	<!-- 轮播图区域 -->
	<view class="banner-container" v-if="bannerList.length > 0">
		<!-- 轮播图组件 - 支持自动播放和指示器 -->
		<swiper 
			class="banner-swiper" 
			:indicator-dots="bannerList.length > 1" 
			:autoplay="bannerList.length > 1" 
			:interval="3000" 
			:duration="500"
			indicator-color="rgba(255, 255, 255, 0.5)"
			indicator-active-color="#667eea"
			:circular="bannerList.length > 1"
		>
			<!-- 轮播图项目 -->
			<swiper-item v-for="(banner, index) in bannerList" :key="banner.bannerId || banner.banner_id || banner.id || `banner_${index}`">
				<view class="banner-item" @click="handleBannerClick(banner)">
					<!-- 轮播图图片 -->
					<image 
						:src="getImageUrl(banner.imageUrl || banner.image_url || banner.image || banner.img)" 
						mode="aspectFill" 
						class="banner-image"
						@error="handleBannerImageError"
					></image>
					<!-- 轮播图文字覆盖层 -->
					<view class="banner-overlay">
						<view class="banner-title">{{ banner.title || '暂无标题' }}</view>
						<view class="banner-subtitle" v-if="banner.subtitle">{{ banner.subtitle }}</view>
					</view>
				</view>
			</swiper-item>
		</swiper>
	</view>
	
	<!-- 轮播图加载失败时的占位符 -->
	<view class="banner-placeholder" v-else>
		<view class="placeholder-content">
			<up-icon name="image" size="48" color="#ccc"></up-icon>
			<text class="placeholder-text">暂无轮播图</text>
		</view>
	</view>
</template>

<script setup>
/**
 * 轮播图组件
 * 功能描述：展示轮播图，支持自动播放和点击事件
 * 主要功能：轮播图展示、点击处理、图片错误处理
 */

// 导入工具函数
import { convertToHttps } from '@/utils/security/urlConverter'  // URL安全转换

// ==================== Props 定义 ====================

/**
 * 轮播图数据列表
 */
const props = defineProps({
	bannerList: {
		type: Array,
		default: () => []
	}
})

// ==================== 轮播图功能 ====================

/**
 * 处理轮播图点击事件
 * @param {Object} banner - 轮播图数据对象
 */
const handleBannerClick = (banner) => {
	// 轮播图点击逻辑待实现
	console.log('轮播图点击:', banner.title || '无标题')
	uni.showToast({
		title: '轮播图点击',
		icon: 'none',
		duration: 2000
	})
}

/**
 * 处理轮播图图片加载失败
 */
const handleBannerImageError = () => {
	console.warn('轮播图加载失败，使用默认图片')
}

/**
 * 智能图片URL处理
 * 将HTTP转换为HTTPS，处理默认图片
 * @param {string} url - 原始图片URL
 * @returns {string} 处理后的安全URL
 */
const getImageUrl = (url) => {
	if (!url) return '/static/logo.png'
	return convertToHttps(url)
}
</script>

<style scoped>
/* ==================== 轮播图样式 ==================== */

/* 轮播图容器 */
.banner-container {
    width: 100%;
    height: 320rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
    margin-bottom: 10rpx;
}

.banner-swiper {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.banner-item {
	position: relative;
	width: 100%;
	height: 100%;
}

.banner-image {
	width: 100%;
	height: 100%;
	border-radius: 20rpx;
}

.banner-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
	padding: 40rpx 30rpx 30rpx;
	border-radius: 0 0 20rpx 20rpx;
}

.banner-title {
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.banner-subtitle {
	color: rgba(255, 255, 255, 0.8);
	font-size: 24rpx;
}

.banner-placeholder {
	width: 100%;
	height: 400rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f9fa;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
}

.placeholder-content {
	text-align: center;
}

.placeholder-text {
	color: #999;
	font-size: 28rpx;
	margin-top: 20rpx;
}
</style>

