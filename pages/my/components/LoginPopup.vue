<template>
	<!-- 登录弹窗：获取用户头像和昵称 -->
	<up-popup :show="show" @close="handleClose" closeable round="20">
		<view class="popup">
			<view class="title">
				获取头像与昵称
			</view>
			<!-- 头像选择区域 -->
			<view class="flex">
				<view class="label">
					获取用户头像
				</view>
				<button class="avatar-warpper" open-type="chooseAvatar" @chooseavatar="handleChooseAvatar">
					<image class="avatar" :src="avatarUrl" @error="onAvatarError"></image>
					<view class="avatar-overlay">
						<text class="avatar-tip">点击选择</text>
					</view>
				</button>
			</view>
			<!-- 昵称输入区域 -->
			<view class="flex">
				<view class="label">
					获取用户昵称
				</view>
				<input @input="handleNameChange" type="nickname" :value="nickName" />
			</view>
			<!-- 确定按钮 -->
			<button size="default" type="primary" @click="handleSubmit" :disabled="loading">
				{{ loading ? '处理中...' : '确定' }}
			</button>
		</view>
	</up-popup>
</template>

<script setup>
/**
 * 登录弹窗组件
 * 功能描述：处理用户登录时的头像和昵称设置
 * 主要功能：
 * 1. 头像选择 - 支持微信小程序头像选择
 * 2. 昵称输入 - 支持微信小程序昵称输入
 * 3. 数据验证 - 验证用户输入的有效性
 * 4. 登录提交 - 处理登录数据提交
 * 5. 临时文件处理 - 处理微信小程序临时文件
 * 6. 错误处理 - 处理头像和昵称输入错误
 * 
 * 技术特点：
 * - 微信小程序原生支持
 * - 数据验证和错误处理
 * - 加载状态管理
 * - 事件传递机制
 * - 临时文件处理
 * - 协议转换
 */

// ==================== 导入依赖 ====================

import { computed } from 'vue'
import { convertToHttps } from '@/utils/security/urlConverter'  // URL协议转换
import { handleAvatarError } from '@/utils/ui/imageErrorHandler'  // 图片错误处理

// ==================== 组件属性 ====================

/**
 * 组件属性定义
 */
const props = defineProps({
	// 控制弹窗显示状态
	show: {
		type: Boolean,
		default: false
	},
	// 当前用户信息
	userInfo: {
		type: Object,
		default: () => ({
			nickName: '',
			avatarUrl: ''
		})
	},
	// 加载状态
	loading: {
		type: Boolean,
		default: false
	}
})

// ==================== 事件定义 ====================

/**
 * 定义组件事件
 */
const emit = defineEmits(['close', 'avatarChange', 'nameChange', 'submit'])

// ==================== 计算属性 ====================

/**
 * 头像URL
 * 功能：处理头像URL显示，支持默认头像
 */
const avatarUrl = computed(() => {
	if (!props.userInfo?.avatarUrl) return '/static/logo.png'
	return convertToHttps(props.userInfo.avatarUrl)
})

/**
 * 昵称
 * 功能：获取当前昵称
 */
const nickName = computed(() => {
	return props.userInfo?.nickName || ''
})

// ==================== 事件处理 ====================

/**
 * 处理弹窗关闭事件
 * 功能：向父组件传递关闭事件
 */
const handleClose = () => {
	console.log('登录弹窗关闭')
	emit('close')
}

/**
 * 处理头像选择事件
 * 功能：处理用户选择头像的逻辑
 * @param {Object} e - 事件对象，包含avatarUrl
 */
const handleChooseAvatar = async (e) => {
	try {
		console.log('用户选择头像:', e.detail.avatarUrl)
		
		// 检查是否为微信小程序临时文件
		if (e.detail.avatarUrl.startsWith('http://tmp/')) {
			console.log('检测到微信小程序临时文件，保存临时路径')
			
			// 对于临时文件，保存临时路径
			emit('avatarChange', {
				avatarUrl: e.detail.avatarUrl,
				tempAvatarPath: e.detail.avatarUrl
			})
			
			uni.showToast({
				title: '头像已选择，登录后自动上传',
				icon: 'success',
				duration: 2000
			})
		} else {
			// 非临时文件，直接转换协议
			const safeAvatarUrl = convertToHttps(e.detail.avatarUrl)
			console.log('转换后的头像URL:', safeAvatarUrl)
			
			emit('avatarChange', {
				avatarUrl: safeAvatarUrl
			})
		}
	} catch (error) {
		console.error('选择头像失败:', error)
		uni.showToast({
			title: '选择头像失败',
			icon: 'none'
		})
	}
}

/**
 * 处理昵称输入事件
 * 功能：处理用户输入昵称
 * @param {Object} e - 事件对象
 */
const handleNameChange = (e) => {
	try {
		console.log('用户输入昵称:', e.detail.value)
		emit('nameChange', e.detail.value)
	} catch (error) {
		console.error('修改昵称失败:', error)
	}
}

/**
 * 处理提交事件
 * 功能：验证用户输入并提交登录信息
 */
const handleSubmit = () => {
	console.log('用户点击确定按钮')
	
	// 验证用户信息
	if (!validateUserInput()) {
		return
	}
	
	// 触发提交事件
	emit('submit')
}

/**
 * 验证用户输入
 * 功能：验证用户输入的有效性
 * @returns {boolean} 验证是否通过
 */
const validateUserInput = () => {
	console.log('验证用户输入，当前userInfo:', props.userInfo)
	
	if (!props.userInfo?.nickName || !props.userInfo.nickName.trim()) {
		uni.showToast({
			title: '请输入昵称',
			icon: 'none'
		})
		return false
	}
	
	if (!props.userInfo?.avatarUrl) {
		uni.showToast({
			title: '请选择头像',
			icon: 'none'
		})
		return false
	}
	
	console.log('验证通过')
	return true
}

/**
 * 处理头像加载错误
 * 功能：使用工具函数处理头像加载错误
 * @param {Object} errorData - 错误数据对象
 */
const onAvatarError = (errorData) => {
	// 使用导入的工具函数处理头像错误
	handleAvatarError(errorData)
}
</script>

<style lang="scss" scoped>
/**
 * 登录弹窗样式
 * 包含弹窗内容、表单元素和按钮的完整样式
 */

.popup {
	padding: 20rpx;
	border-radius: 20rpx 20rpx 0 0;

	.title {
		margin-bottom: 20rpx;
		font-size: 40rpx;
		text-align: center;
	}

	.flex {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		border-bottom: 1px solid #f5f5f5;
		padding: 24rpx 0;
	}

	.label {
		font-size: 28rpx;
		color: #333;
		min-width: 120rpx;
	}

	.avatar-warpper {
		border: none;
		border-radius: 10rpx;
		width: 70rpx;
		height: 70rpx;
		margin-left: 20rpx;
		padding: 0;
		background: transparent;
	}

	.avatar {
		width: 70rpx;
		height: 70rpx;
		border-radius: 10rpx;
	}

	input {
		flex: 1;
		margin-left: 20rpx;
		font-size: 28rpx;
		color: #333;
	}

	button {
		width: 100%;
		margin-top: 40rpx;
		border-radius: 10rpx;
	}
}
</style>
