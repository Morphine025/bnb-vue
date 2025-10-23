<template>
	<view class="disclaimer-modal" v-if="show" @click="preventClose">
		<view class="modal-content">
			<view class="modal-header">
				<view class="modal-title">免责声明</view>
			</view>
			<view class="modal-body">
				<view class="disclaimer-text">
					您即将发布房源信息。平台仅提供信息发布服务，无法对每一条房源的权属、真实性和准确性进行核实。所有因房源信息不实或交易纠纷产生的责任，均由信息发布者自行承担。
				</view>
			</view>
			<view class="modal-footer">
				<button 
					class="confirm-btn" 
					:class="{ 'disabled': countdown > 0 }"
					:disabled="countdown > 0"
					@click="handleConfirm"
				>
					{{ countdown > 0 ? `请阅读免责声明（${countdown}秒）` : '我已知晓，确认' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 免责声明弹框组件
 * 功能描述：显示发布房源前的免责声明，包含倒计时功能
 * 主要功能：倒计时控制、用户确认、弹框显示控制
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'

// ==================== Props ====================
const props = defineProps({
	/**
	 * 是否显示弹框
	 */
	show: {
		type: Boolean,
		default: false
	},
	/**
	 * 倒计时秒数
	 */
	countdownSeconds: {
		type: Number,
		default: 5
	}
})

// ==================== Emits ====================
const emit = defineEmits(['confirm', 'close'])

// ==================== 响应式数据 ====================
const countdown = ref(props.countdownSeconds)
let countdownTimer = null

// ==================== 监听器 ====================
/**
 * 监听显示状态变化，控制倒计时
 */
watch(() => props.show, (newVal) => {
	if (newVal) {
		startCountdown()
	} else {
		clearCountdown()
	}
})

// ==================== 生命周期 ====================
onMounted(() => {
	if (props.show) {
		startCountdown()
	}
})

onUnmounted(() => {
	clearCountdown()
})

// ==================== 方法 ====================
/**
 * 开始倒计时
 */
const startCountdown = () => {
	countdown.value = props.countdownSeconds
	countdownTimer = setInterval(() => {
		countdown.value--
		if (countdown.value <= 0) {
			clearCountdown()
		}
	}, 1000)
}

/**
 * 清除倒计时
 */
const clearCountdown = () => {
	if (countdownTimer) {
		clearInterval(countdownTimer)
		countdownTimer = null
	}
}

/**
 * 防止弹框关闭
 * @param {Event} e - 点击事件
 */
const preventClose = (e) => {
	e.stopPropagation()
}

/**
 * 确认免责声明
 */
const handleConfirm = () => {
	if (countdown.value > 0) return
	clearCountdown()
	emit('confirm')
}
</script>

<style lang="scss" scoped>
/* 免责声明弹框样式 */
.disclaimer-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	
	.modal-content {
		background: #fff;
		border-radius: 20rpx;
		margin: 40rpx;
		max-width: 600rpx;
		width: 100%;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
		
		.modal-header {
			padding: 40rpx 40rpx 20rpx;
			text-align: center;
			border-bottom: 1rpx solid #f0f0f0;
			
			.modal-title {
				font-size: 36rpx;
				font-weight: 600;
				color: #333;
			}
		}
		
		.modal-body {
			padding: 30rpx 40rpx;
			
			.disclaimer-text {
				font-size: 28rpx;
				line-height: 1.6;
				color: #666;
				text-align: justify;
			}
		}
		
		.modal-footer {
			padding: 20rpx 40rpx 40rpx;
			text-align: center;
			
			.confirm-btn {
				width: 100%;
				height: 80rpx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				border: none;
				border-radius: 40rpx;
				font-size: 28rpx;
				font-weight: 600;
				transition: all 0.3s ease;
				
				&.disabled {
					background: #ccc;
					color: #999;
					cursor: not-allowed;
				}
				
				&:not(.disabled):active {
					transform: scale(0.95);
				}
			}
		}
	}
}
</style>
