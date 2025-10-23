<template>
	<view class="homestay-item" @click="handleItemClick">
		<view class="item-image">
			<image 
				:src="item.images && item.images.length > 0 ? item.images[0] : '/static/logo.png'" 
				mode="aspectFill"
				@error="handleImageError"
				:lazy-load="true"
			></image>
		</view>
		<view class="item-content">
			<!-- 标题 -->
			<view class="item-title">{{ item.title }}</view>
			
			<!-- 位置 -->
			<view class="item-location">
				<up-icon name="map" size="14" color="#999"></up-icon>
				<text>{{ item.city }}</text>
			</view>
			
			<!-- 金额 -->
			<view class="item-price">
				<text class="price-symbol">¥</text>
				<text class="price-number">{{ formatPrice(item.price) }}</text>
			</view>
			
			<!-- 按钮 -->
			<view class="item-actions">
				<view 
					class="action-btn" 
					:class="buttonConfig.primary.class"
					@click.stop="handlePrimaryAction"
				>
					<up-icon :name="buttonConfig.primary.icon" size="16" color="#fff"></up-icon>
					<text>{{ buttonConfig.primary.text }}</text>
				</view>
				<view 
					class="action-btn" 
					:class="buttonConfig.secondary.class"
					@click.stop="handleSecondaryAction"
				>
					<up-icon :name="buttonConfig.secondary.icon" size="16" color="#fff"></up-icon>
					<text>{{ buttonConfig.secondary.text }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 民宿列表项组件
	 * 功能描述：统一的民宿列表项展示组件
	 * 主要功能：展示民宿信息、操作按钮、点击跳转
	 */

	// 导入Vue响应式API
	import { computed } from 'vue'
	
	// 导入价格格式化工具
	import { formatPrice } from '@/utils'

	// Props定义
	const props = defineProps({
		// 民宿数据
		item: {
			type: Object,
			required: true,
			default: () => ({})
		},
		// 按钮配置
		buttonConfig: {
			type: Object,
			required: true,
			default: () => ({
				primary: {
					text: '取消收藏',
					icon: 'trash',
					class: 'primary-btn'
				},
				secondary: {
					text: '分享',
					icon: 'share',
					class: 'secondary-btn'
				}
			})
		}
	})

	// Emits定义
	const emit = defineEmits([
		'item-click',
		'primary-action',
		'secondary-action',
		'image-error'
	])

	/**
	 * 处理列表项点击
	 */
	const handleItemClick = () => {
		emit('item-click', props.item)
	}

	/**
	 * 处理主要操作按钮点击
	 */
	const handlePrimaryAction = () => {
		emit('primary-action', props.item)
	}

	/**
	 * 处理次要操作按钮点击
	 */
	const handleSecondaryAction = () => {
		emit('secondary-action', props.item)
	}

	/**
	 * 处理图片加载错误
	 */
	const handleImageError = (e) => {
		emit('image-error', e)
	}
</script>

<style lang="scss" scoped>
	.homestay-item {
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
		display: flex;
		align-items: stretch;
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
		position: relative;
		border: 1rpx solid rgba(255, 255, 255, 0.8);
		min-height: 200rpx;
		
		&:hover {
			transform: translateY(-4rpx);
			box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
		}
		
		&:active {
			transform: scale(0.98);
		}
		
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 4rpx;
			background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
			opacity: 0;
			transition: opacity 0.3s ease;
		}
		
		&:hover::before {
			opacity: 1;
		}
	}

	.item-image {
		width: 300rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;

		image {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
			border-radius: 20rpx;
		}
		
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
			opacity: 0;
			transition: opacity 0.3s ease;
		}
		
		&:hover::after {
			opacity: 1;
		}
		
		&:hover image {
			transform: scale(1.05);
		}
	}

	.item-content {
		flex: 1;
		padding: 10rpx 15rpx 10rpx 25rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		min-height: 200rpx;
		position: relative;
		gap: 15rpx;
	}

	.item-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #2d3748;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		letter-spacing: 0.5rpx;
	}

	.item-location {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 6rpx 10rpx;
		border-radius: 10rpx;
		width: fit-content;

		text {
			font-size: 24rpx;
			color: #999;
			font-weight: 500;
		}
	}

	.item-price {
		display: flex;
		align-items: baseline;
		background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-size: 36rpx;
		font-weight: 800;

		.price-symbol {
			font-size: 24rpx;
			font-weight: 700;
			margin-right: 2rpx;
		}

		.price-number {
			font-size: 36rpx;
			font-weight: 800;
		}
	}

	.item-actions {
		display: flex;
		gap: 12rpx;
		justify-content: space-between;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
		padding: 12rpx 18rpx;
		border-radius: 20rpx;
		background-color: #f8f9fa;
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		border: 1rpx solid #e9ecef;
		position: relative;
		overflow: hidden;

		text {
			font-size: 24rpx;
			color: #666;
			font-weight: 500;
			position: relative;
			z-index: 2;
			text-align: center;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
			transition: left 0.5s ease;
		}

		&:active {
			transform: scale(0.95);
		}
		
		&:hover::before {
			left: 100%;
		}
		
		&.primary-btn {
			background-color: #ff4757;
			border-color: #ff4757;
			box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.3);
			
			text {
				color: #fff;
				font-weight: 600;
			}
			
			&:hover {
				background-color: #ff3742;
				transform: translateY(-2rpx);
				box-shadow: 0 6rpx 16rpx rgba(255, 71, 87, 0.4);
			}
		}
		
		&.secondary-btn {
			background-color: #007AFF;
			border-color: #007AFF;
			box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
			
			text {
				color: #fff;
				font-weight: 600;
			}
			
			&:hover {
				background-color: #0056b3;
				transform: translateY(-2rpx);
				box-shadow: 0 6rpx 16rpx rgba(0, 122, 255, 0.4);
			}
		}
	}
</style>
