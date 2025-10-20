<template>
	<view class="profile-container">
		<!-- 页面内容 -->
		<view class="profile-content">
			<!-- 头像区域 -->
			<view class="avatar-section">
				<view class="avatar-label">头像</view>
				<view class="avatar-container" @click="chooseAvatar">
					<image 
						:src="userInfo.avatarUrl || '/static/unnamed.jpg'" 
						class="avatar-image" 
						mode="aspectFill"
					></image>
					<view class="avatar-overlay">
						<u-icon name="camera" size="16" color="#fff"></u-icon>
					</view>
				</view>
			</view>
			
			<!-- 表单区域 -->
			<view class="form-section">
				<view class="form-item">
					<view class="form-label">昵称</view>
					<input 
						v-model="userInfo.nickName" 
						class="form-input" 
						placeholder="请输入昵称"
						:maxlength="FORM_CONSTANTS.NICKNAME_MAX_LENGTH"
					/>
				</view>
				
				<view class="form-item">
					<view class="form-label">手机号</view>
					<input 
						v-model="userInfo.phone" 
						class="form-input" 
						placeholder="请输入手机号"
						type="number"
						:maxlength="FORM_CONSTANTS.PHONE_MAX_LENGTH"
					/>
				</view>
				
				<view class="form-item">
					<view class="form-label">微信号</view>
					<input 
						v-model="userInfo.wechat" 
						class="form-input" 
						placeholder="请输入微信号"
						:maxlength="FORM_CONSTANTS.WECHAT_MAX_LENGTH"
					/>
				</view>
			</view>
			
			<!-- 提示信息 -->
			<view class="tips-section">
				<view class="tips-title">温馨提示</view>
				<view class="tips-content">
					<text class="tips-text">• {{ TIPS_MESSAGES.NICKNAME }}</text>
					<text class="tips-text">• {{ TIPS_MESSAGES.PHONE }}</text>
					<text class="tips-text">• {{ TIPS_MESSAGES.WECHAT }}</text>
				</view>
			</view>
		</view>
		
		<!-- 保存按钮 -->
		<view class="save-button-container fixed-bottom-container">
			<button 
				class="save-button btn btn-primary btn-block btn-lg" 
				:class="{ 'save-button--disabled': !hasChanges || submitting }"
				@click="handleSave" 
				:disabled="!hasChanges || submitting"
			>
				{{ submitting ? LOADING_TEXT.SAVING : '保存' }}
			</button>
		</view>
		
		<!-- 加载状态 -->
		<u-loading-page :loading="loading" :loading-text="LOADING_TEXT.LOADING"></u-loading-page>
	</view>
</template>

<script setup>
	/**
	 * 个人信息编辑页面
	 * 功能描述：用户个人信息编辑，包括头像、昵称、手机号、微信号
	 * 主要功能：头像选择、信息编辑、数据保存、表单验证
	 */
	
	// 导入Vue响应式API
	import { ref, reactive, computed, onMounted } from 'vue'
	
	// 导入uni-app生命周期钩子
	import { onLoad } from '@dcloudio/uni-app'
	
	// 导入API
	// 导入API接口 - 使用新的统一API
	import { API } from '../../api'
import { showLoading, hideLoading } from '../../utils/loadingManager'
	import { refreshUserInfo } from '/utils/userInfo.js'
	
	// 导入工具函数
	import { handleError, showSuccess } from '/utils/errorHandler.js'
	import { createDebouncedSave } from '/utils/debounce.js'
	import { sanitizeUserInfo } from '/utils/inputSanitizer.js'
	import { 
		FORM_CONSTANTS, 
		TIPS_MESSAGES, 
		LOADING_TEXT, 
		PAGE_CONFIG,
		FIELD_LABELS
	} from '/utils/constants.js'
	
	// 响应式数据
	const loading = ref(false)
	const submitting = ref(false)
	const originalData = ref({})
	
	// 用户信息表单数据
	const userInfo = reactive({
		nickName: '',    // 用户昵称
		avatarUrl: '',   // 用户头像
		phone: '',       // 手机号
		wechat: ''      // 微信号
	})
	
	// 计算属性 - 检查是否有变更
	const hasChanges = computed(() => {
		return Object.keys(originalData.value).some(key => {
			return userInfo[key] !== (originalData.value[key] || '')
		})
	})
	
	// 计算属性 - 获取变更的字段
	const changedFields = computed(() => {
		const changes = []
		Object.keys(originalData.value).forEach(key => {
			if (userInfo[key] !== (originalData.value[key] || '')) {
				changes.push({
					field: key,
					oldValue: originalData.value[key] || '',
					newValue: userInfo[key] || ''
				})
			}
		})
		return changes
	})
	
	// 表单验证相关
	const validationErrors = ref({})
	
	// 验证规则常量
	const VALIDATION_RULES = {
		NICKNAME: {
			required: true,
			maxLength: 20,
			message: {
				required: '请输入昵称',
				maxLength: '昵称不能超过20个字符'
			}
		},
		PHONE: {
			pattern: /^1[3-9]\d{9}$/,
			message: '请输入正确的手机号'
		},
		WECHAT: {
			maxLength: 20,
			message: '微信号不能超过20个字符'
		}
	}
	
	/**
	 * 验证昵称
	 */
	const validateNickname = (value) => {
		const trimmed = value?.trim() || ''
		
		if (!trimmed) {
			validationErrors.value.nickName = VALIDATION_RULES.NICKNAME.message.required
			return false
		}
		
		if (trimmed.length > VALIDATION_RULES.NICKNAME.maxLength) {
			validationErrors.value.nickName = VALIDATION_RULES.NICKNAME.message.maxLength
			return false
		}
		
		delete validationErrors.value.nickName
		return true
	}
	
	/**
	 * 验证手机号
	 */
	const validatePhone = (value) => {
		const trimmed = value?.trim() || ''
		
		// 手机号为空时不验证
		if (!trimmed) {
			delete validationErrors.value.phone
			return true
		}
		
		if (!VALIDATION_RULES.PHONE.pattern.test(trimmed)) {
			validationErrors.value.phone = VALIDATION_RULES.PHONE.message
			return false
		}
		
		delete validationErrors.value.phone
		return true
	}
	
	/**
	 * 验证微信号
	 */
	const validateWechat = (value) => {
		const trimmed = value?.trim() || ''
		
		// 微信号为空时不验证
		if (!trimmed) {
			delete validationErrors.value.wechat
			return true
		}
		
		if (trimmed.length > VALIDATION_RULES.WECHAT.maxLength) {
			validationErrors.value.wechat = VALIDATION_RULES.WECHAT.message
			return false
		}
		
		delete validationErrors.value.wechat
		return true
	}
	
	/**
	 * 验证整个表单
	 */
	const validateForm = (formData) => {
		const nicknameValid = validateNickname(formData.nickName)
		const phoneValid = validatePhone(formData.phone)
		const wechatValid = validateWechat(formData.wechat)
		
		return nicknameValid && phoneValid && wechatValid
	}
	
	/**
	 * 加载用户信息
	 */
	const loadUserInfo = async () => {
		try {
			loading.value = true
			console.log('开始获取用户信息...')
			const result = await API.user.getInfo()
			console.log('获取用户信息结果:', result)
			
			if (result && result.code === 1 && result.data) {
				const { nickName, avatarUrl, phone, wechat } = result.data
				
				// 更新表单数据
				userInfo.nickName = nickName || ''
				userInfo.avatarUrl = avatarUrl || ''
				userInfo.phone = phone || ''
				userInfo.wechat = wechat || ''
				
				// 保存原始数据用于比较
				originalData.value = {
					nickName: userInfo.nickName,
					avatarUrl: userInfo.avatarUrl,
					phone: userInfo.phone,
					wechat: userInfo.wechat
				}
				
				console.log('用户信息加载成功:', userInfo)
			} else {
				throw new Error(result?.msg || '获取用户信息失败')
			}
		} catch (error) {
			console.error('获取用户信息失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}
	
	/**
	 * 保存用户信息
	 */
	const saveUserInfo = async () => {
		if (submitting.value) {
			console.log('正在提交中，请勿重复操作')
			return { success: false, message: '正在提交中，请勿重复操作' }
		}
		
		try {
			submitting.value = true
			
			// 准备提交数据
			const submitData = {
				nickname: userInfo.nickName.trim(),
				avatar: userInfo.avatarUrl || '',
				phone: userInfo.phone.trim() || '',
				wechat: userInfo.wechat.trim() || ''
			}
			
			console.log('提交用户信息:', submitData)
			console.log('当前token:', uni.getStorageSync('token'))
			
			// 调用更新接口
			const result = await API.user.updateInfo(submitData)
			console.log('更新结果:', result)
			
			if (result && result.code === 1) {
				// 更新原始数据
				originalData.value = {
					nickName: userInfo.nickName,
					avatarUrl: userInfo.avatarUrl,
					phone: userInfo.phone,
					wechat: userInfo.wechat
				}
				
				// 直接更新本地存储，避免额外的API调用
				const localUserInfo = JSON.parse(uni.getStorageSync('userInfo') || '{}')
				Object.assign(localUserInfo, {
					nickName: userInfo.nickName,
					avatarUrl: userInfo.avatarUrl,
					phone: userInfo.phone,
					wechat: userInfo.wechat
				})
				uni.setStorageSync('userInfo', JSON.stringify(localUserInfo))
				
				// 异步刷新用户信息（不阻塞保存流程）
				refreshUserInfo().catch(error => {
					console.error('后台刷新用户信息失败:', error)
				})
				
				return {
					success: true,
					changedFields: changedFields.value,
					message: '保存成功'
				}
			} else {
				throw new Error(result?.msg || '保存失败')
			}
		} catch (error) {
			console.error('保存用户信息失败:', error)
			throw error
		} finally {
			submitting.value = false
		}
	}
	
	/**
	 * 重置表单数据
	 */
	const resetForm = () => {
		userInfo.nickName = originalData.value.nickName || ''
		userInfo.avatarUrl = originalData.value.avatarUrl || ''
		userInfo.phone = originalData.value.phone || ''
		userInfo.wechat = originalData.value.wechat || ''
	}
	
	/**
	 * 页面加载时获取用户信息
	 */
	onLoad(async () => {
		try {
			await loadUserInfo()
		} catch (error) {
			handleError(error, { showToast: true })
		}
	})
	
	/**
	 * 选择头像
	 */
	const chooseAvatar = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const tempFilePath = res.tempFilePaths[0]
				console.log('选择头像成功:', tempFilePath)
				
				// 上传头像到服务器
				try {
					showLoading({ title: '上传头像中...' })
					const avatarUrl = await API.uploadImage(tempFilePath)
					userInfo.avatarUrl = avatarUrl
					console.log('头像上传成功:', avatarUrl)
					hideLoading()
					uni.showToast({
						title: '头像更新成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('头像上传失败:', error)
					hideLoading()
					uni.showToast({
						title: '头像上传失败',
						icon: 'none'
					})
				}
			},
			fail: (error) => {
				console.error('选择头像失败:', error)
				uni.showToast({
					title: '选择头像失败',
					icon: 'none'
				})
			}
		})
	}
	
	
	/**
	 * 防抖保存函数
	 */
	const debouncedSave = createDebouncedSave(async () => {
		try {
			// 表单验证
			if (!validateForm(userInfo)) {
				uni.showToast({
					title: '请检查输入信息',
					icon: 'none'
				})
				return
			}
			
			// 清理用户输入
			const sanitizedData = sanitizeUserInfo(userInfo)
			
			// 保存用户信息
			const result = await saveUserInfo()
			
			if (result.success) {
				// 显示具体更新的字段
				const changedFieldsText = result.changedFields
					.map(field => FIELD_LABELS[field.field] || field.field)
					.join('、')
				
				// 显示成功提示，包含具体更新内容
				if (changedFieldsText) {
					showSuccess(`保存成功！已更新：${changedFieldsText}`)
				} else {
					showSuccess('保存成功！')
				}
				
				// 添加触觉反馈（如果支持）
				if (uni.vibrateShort) {
					uni.vibrateShort()
				}
				
				// 延迟返回上一页
				setTimeout(() => {
					uni.navigateBack()
				}, PAGE_CONFIG.SAVE_SUCCESS_DELAY)
			}
		} catch (error) {
			handleError(error, { showToast: true })
		}
	}, 1000)
	
	/**
	 * 处理保存
	 */
	const handleSave = () => {
		if (!hasChanges.value) {
			uni.showToast({
				title: '没有需要保存的更改',
				icon: 'none'
			})
			return
		}
		
		// 添加保存确认（可选）
		if (changedFields.value.length > 2) {
			uni.showModal({
				title: '确认保存',
				content: `您将更新 ${changedFields.value.length} 个字段，是否继续？`,
				success: (res) => {
					if (res.confirm) {
						debouncedSave()
					}
				}
			})
		} else {
			debouncedSave()
		}
	}
	
	/**
	 * 处理返回
	 */
	const handleBack = () => {
		if (hasChanges.value) {
			uni.showModal({
				title: '提示',
				content: '您有未保存的更改，确定要离开吗？',
				success: (res) => {
					if (res.confirm) {
						uni.navigateBack()
					}
				}
			})
		} else {
			uni.navigateBack()
		}
	}
	
</script>

<style lang="scss" scoped>
	.profile-container {
		min-height: 100vh;
		background-color: #f8f9fa;
	}
	
	// 页面内容
	.profile-content {
		padding: 30rpx;
		padding-bottom: 120rpx; // 为固定按钮留出空间
	}
	
	// 头像区域
	.avatar-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 40rpx;
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		
		.avatar-label {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
		
		.avatar-container {
			position: relative;
			width: 120rpx;
			height: 120rpx;
			
			.avatar-image {
				width: 100%;
				height: 100%;
				border-radius: 50%;
				border: 4rpx solid #f0f0f0;
			}
			
			.avatar-overlay {
				position: absolute;
				bottom: 0;
				right: 0;
				width: 40rpx;
				height: 40rpx;
				background: #667eea;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 4rpx solid #fff;
			}
		}
	}
	
	// 表单区域
	.form-section {
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
		
		.form-item {
			display: flex;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #f0f0f0;
			
			&:last-child {
				border-bottom: none;
			}
			
			.form-label {
				width: 140rpx;
				font-size: 30rpx;
				font-weight: 500;
				color: #333;
			}
			
			.form-input {
				flex: 1;
				font-size: 30rpx;
				color: #333;
				text-align: right;
				
				&::placeholder {
					color: #999;
				}
			}
		}
	}
	
	// 提示信息
	.tips-section {
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		
		.tips-title {
			font-size: 28rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 20rpx;
		}
		
		.tips-content {
			display: flex;
			flex-direction: column;
			gap: 10rpx;
			
			.tips-text {
				font-size: 24rpx;
				color: #666;
				line-height: 1.5;
			}
		}
	}
	
	// 保存按钮
	.save-button-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 30rpx;
		background-color: #fff;
		border-top: 1px solid #f0f0f0;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
		
		.save-button {
			width: 100%;
			height: 80rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border: none;
			border-radius: 12rpx;
			color: #fff;
			font-size: 32rpx;
			font-weight: 600;
			display: flex;
			align-items: center;
			justify-content: center;
			
			&:disabled {
				opacity: 0.6;
				background: #ccc;
			}
		}
	}
</style>
