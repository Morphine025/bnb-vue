<template>
	<!-- 顶部搜索区域 -->
	<view class="header-section">
		<view class="search-container">
			<view class="search-wrapper">
				<!-- 项目图标 -->
				<view class="project-icon">
					<image src="/static/unnamed.jpg" mode="aspectFill" class="icon-image"></image>
				</view>
				
				<!-- 搜索框（点击跳转到搜索页面） -->
				<view class="search-input" @click="goToSearch">
					<up-icon name="search" size="18" color="#999"></up-icon>
					<text class="search-placeholder">搜索民宿、地点、关键词</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 头部搜索组件
 * 功能描述：提供项目图标和搜索入口，支持民宿搜索功能
 * 主要功能：
 * 1. 项目品牌展示 - 显示项目图标
 * 2. 搜索入口 - 点击跳转到搜索页面
 * 3. 用户引导 - 提供搜索提示文本
 * 
 * 技术特点：
 * - 纯展示组件，无复杂逻辑
 * - 支持点击跳转功能
 * - 响应式布局设计
 */

// ==================== 搜索功能 ====================

/**
 * 跳转到搜索页面
 * 点击搜索框时触发，支持民宿搜索功能
 * 搜索页面支持关键词、地点、价格等多维度搜索
 */
const goToSearch = () => {
	uni.navigateTo({
		url: '/pages/search/search'
	})
}
</script>

<style scoped>
/* ==================== 头部搜索区域样式 ==================== */

/**
 * 头部搜索区域容器
 * 设置透明背景，无阴影效果
 */
.header-section {
    background: transparent;
    box-shadow: none;
}

/**
 * 搜索容器
 * 占据全宽，包含搜索框和图标
 */
.search-container {
	width: 100%;
}

/**
 * 搜索包装器
 * 水平布局，包含项目图标和搜索框
 */
.search-wrapper {
    display: flex;
    align-items: center;
    background: transparent;
    border-radius: 50rpx;
    padding: 20rpx 30rpx;
}

/**
 * 项目图标样式
 * 圆形头像，固定尺寸
 */
.project-icon {
	width: 60rpx;
	height: 60rpx;
	margin-right: 20rpx;
}

.icon-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

/**
 * 搜索输入框样式
 * 占据剩余空间，白色背景，圆角设计
 */
.search-input {
	flex: 1;
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 40rpx;
	padding: 15rpx 25rpx;
	position: relative;
}

/**
 * 搜索占位文本样式
 * 灰色文本，提供搜索提示
 */
.search-placeholder {
	flex: 1;
	font-size: 28rpx;
	color: #999;
	margin-left: 15rpx;
}
</style>
