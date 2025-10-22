<template>
	<view class="content">
		<!-- 用户信息卡片区域 -->
		<view class="topBox">
			<view class="users">
				<!-- 用户头像和昵称区域 -->
				<view class="u-top" @click="loginUser">
					<!-- 未登录状态：显示默认头像和登录提示 -->
					<template v-if="!userInfo.nickName">
						<image src='/static/unnamed.jpg' mode="aspectFill" />
						<view class="tit">
							注册 / 登录
						</view>
					</template>
					<!-- 已登录状态：显示用户头像和昵称 -->
					<template v-else>
						<image :src='safeAvatarUrl' mode="aspectFill" @error="handleAvatarError" />
						<view class="tit">
							{{userInfo.nickName}}
						</view>
					</template>
				</view>
				<!-- 用户统计数据区域 -->
				<view class="u-bottom">
					<view class="u-item" @click="goToFansList">
						<view class="num">{{ userStats.followers }}</view>
						<view class="u-tit">粉丝</view>
					</view>
					<view class="u-item" @click="goToFollowList">
						<view class="num">{{ userStats.following }}</view>
						<view class="u-tit">关注</view>
					</view>
					<view class="u-item" @click="goToLikeList">
						<view class="num">{{ userStats.likes }}</view>
						<view class="u-tit">喜欢</view>
					</view>
					<view class="u-item" @click="goToCollectList">
						<view class="num">{{ userStats.collections }}</view>
						<view class="u-tit">收藏</view>
					</view>
					<view class="u-item" @click="goToViewHistory">
						<view class="num">{{ userStats.views }}</view>
						<view class="u-tit">浏览</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 功能菜单区域 -->
		<view class="tools-section">
			<view class="tools-title">常用工具</view>
			<view class="tools-card">
				<uni-list>
					<!-- 我的发布 -->
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon0" showArrow title="我的发布" clickable @click="goToMyPublish"></uni-list-item>
					<!-- 我的草稿 -->
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIconDraft" showArrow title="我的草稿" clickable @click="goToMyDraft"></uni-list-item>
					<!-- 地址管理（开发中） -->
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon1" showArrow title="地址管理" clickable @click="showDevelopingTip('地址管理')"></uni-list-item>
					<!-- 设置 -->
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon2" showArrow title="设置" clickable @click="goToSettings"></uni-list-item>
					<!-- 意见反馈（开发中） -->
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon3" showArrow title="意见反馈" clickable @click="showDevelopingTip('意见反馈')"></uni-list-item>
					<!-- 关于我的（开发中） -->
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon4" showArrow title="关于我的" clickable @click="showDevelopingTip('关于我的')"></uni-list-item>
				</uni-list>
			</view>
		</view>
		
		<!-- 设置弹窗：显示退出登录选项 -->
		<up-popup :show="showSettings" @close="closeSettings" closeable round="20">
			<view class="popup">
				<view class="settings-content">
					<!-- 退出登录按钮（仅登录用户可见） -->
					<view class="setting-item" @click="logout" v-if="userInfo.nickName">
						<view class="setting-icon">🚪</view>
						<view class="setting-text">退出登录</view>
					</view>
				</view>
			</view>
		</up-popup>
		
		<!-- 登录弹窗：获取用户头像和昵称 -->
		<up-popup :show="show" @close="close" closeable round="20">
			<view class="popup">
				<view class="title">
					获取头像与昵称
				</view>
				<!-- 头像选择区域 -->
				<view class="flex">
					<view class="label">
						获取用户头像
					</view>
					<button class="avatar-warpper" open-type="chooseAvatar" @chooseavatar="onChooseavatar">
						<image class="avatar" :src="safeAvatarUrl" @error="handleAvatarError"></image>
					</button>
				</view>
				<!-- 昵称输入区域 -->
				<view class="flex">
					<view class="label">
						获取用户昵称
					</view>
					<input @input="changeName" type="nickname" />
				</view>
				<!-- 确定按钮 -->
				<button size="default" type="primary" @click="userSubmit">确定</button>
			</view>
		</up-popup>
	</view>
</template>

<script setup>
	/**
	 * 我的页面组件
	 * 功能描述：用户个人信息展示、登录注册、功能菜单
	 * 主要功能：用户登录、信息展示、统计数据、功能菜单、头像昵称设置
	 */

	// ==================== 导入依赖 ====================
	
	// Vue 3 响应式API
	import {
		ref,        // 响应式引用
		reactive,   // 响应式对象
		computed,   // 计算属性
		nextTick    // 下一个DOM更新周期
	} from 'vue'
	
	// uni-app 生命周期钩子
	import {
		onLoad,     // 页面加载时触发
		onShow      // 页面显示时触发
	} from '@dcloudio/uni-app'
	
	// API接口模块
	import { API } from '../../api'
	
	// Pinia状态管理 - 统一使用userStore管理所有用户数据
	import { 
		useUserStore
	} from '../../stores'
	
	// 工具函数
	import { convertToHttps } from '@/utils/security/urlConverter'  // URL协议转换
	import { handleAvatarError } from '@/utils/ui/imageErrorHandler'  // 图片错误处理
	import { handleError, showSuccess, showError } from '@/utils/error/errorHandler'  // 统一错误处理

	// ==================== 状态管理 ====================
	
	// 使用简化的Store - 统一使用userStore管理所有用户数据
	const userStore = useUserStore()
	
	// ==================== 响应式数据 ====================
	
	// 页面状态控制
	const show = ref(false)          // 控制登录弹窗显示
	const showSettings = ref(false)   // 控制设置弹窗显示
	const loading = ref(false)        // 加载状态
	
	// ==================== 计算属性 ====================
	
	// 用户信息 - 从userStore获取，提供默认值
	const userInfo = computed(() => userStore.userInfo || { nickName: '', avatarUrl: '' })
	
	// 用户统计数据 - 从userStore获取，提供默认值
	const userStats = computed(() => userStore.userStats || {
		followers: 0,     // 粉丝数
		following: 0,     // 关注数
		likes: 0,         // 喜欢数
		collections: 0,   // 收藏数
		views: 0,         // 浏览数
		homestays: 0      // 发布数
	})
	
	// 安全的头像URL - 处理协议转换和默认头像
	const safeAvatarUrl = computed(() => {
		if (!userInfo.value?.avatarUrl) return '/static/logo.png'
		return convertToHttps(userInfo.value.avatarUrl)
	})

	// ==================== 生命周期钩子 ====================
	
	/**
	 * 页面加载时初始化用户数据
	 * 功能：从本地存储恢复用户数据，如果已登录则从服务器获取最新数据
	 */
	onLoad(async () => {
		loading.value = true
		try {
			// 统一从userStore初始化所有数据（包括用户信息和统计数据）
			await userStore.initializeUser()
			
			// 检查是否有有效的token，如果有则尝试获取最新数据
			const token = uni.getStorageSync('token')
			if (token && userStore.isLoggedIn) {
				try {
					// 获取最新用户信息和统计数据
					await userStore.fetchUserInfo()
					await userStore.fetchUserStats()
				} catch (error) {
					console.warn('从服务器获取数据失败，使用本地数据:', error)
				}
			}
		} catch (error) {
			handleError(error, '页面初始化失败')
		} finally {
			loading.value = false
		}
	})
	
	/**
	 * 页面显示时刷新用户信息和统计数据 - 简化逻辑
	 */
	onShow(async () => {
		console.log('🔄 my页面onShow开始刷新')
		
		// 检查是否有有效的token
		const token = uni.getStorageSync('token')
		if (!token) {
			console.log('❌ 没有token，用户未登录，跳过刷新')
			return
		}
		
		// 如果用户已登录，刷新用户信息和统计数据
		if (userStore.isLoggedIn) {
			try {
				console.log('✅ 用户已登录，开始刷新数据')
				// 统一使用userStore刷新数据
				await userStore.fetchUserInfo()
				await userStore.fetchUserStats()
				console.log('✅ 用户数据和统计数据刷新完成')
			} catch (error) {
				console.error('刷新用户信息失败:', error)
				// 如果获取失败，使用本地存储的信息
				await userStore.initializeUser()
			}
		} else {
			console.log('❌ 用户未登录，尝试从本地存储恢复数据')
			// 尝试从本地存储恢复数据
			await userStore.initializeUser()
		}
	})

	/**
	 * 检查登录状态并处理跳转
	 */
	const checkLoginStatus = () => {
		if (userStore.isLoggedIn) {
			// 已登录，跳转到个人信息编辑页面
			uni.navigateTo({
				url: '/pages/profile/profile'
			})
			return true
		}
		return false
	}

	/**
	 * 显示登录提示弹窗
	 */
	const showLoginPrompt = (action) => {
		uni.showModal({
			title: '提示',
			content: `请先登录后再${action}`,
			showCancel: false,
			confirmText: '去登录',
			success: () => {
				show.value = true
			}
		})
	}

	/**
	 * 通用登录检查和导航函数
	 * 功能：检查登录状态，如果未登录则显示提示，已登录则跳转
	 * @param {string} url - 跳转URL
	 * @param {string} action - 操作描述
	 */
	const checkLoginAndNavigate = (url, action) => {
		if (!userStore.isLoggedIn) {
			showLoginPrompt(action)
			return
		}
		uni.navigateTo({ url })
	}

	// ==================== 登录相关函数 ====================
	
	/**
	 * 执行微信登录
	 * 功能：调用微信API获取登录凭证
	 * 返回：Promise，包含微信登录结果
	 */
	const performWxLogin = async () => {
		return new Promise((resolve, reject) => {
			uni.login({
				success: resolve,
				fail: reject
			})
		})
	}

	/**
	 * 处理微信登录结果
	 * 功能：保存微信登录code并显示头像昵称设置弹窗
	 * @param {Object} loginResult - 微信登录结果
	 */
	const handleWxLoginResult = (loginResult) => {
		console.log('微信登录成功:', loginResult)
		// 保存微信登录的code，然后显示头像昵称设置弹窗
		uni.setStorageSync('wxLoginCode', loginResult.code)
		show.value = true
	}

	/**
	 * 用户登录入口
	 * 功能：处理用户点击登录按钮的逻辑
	 */
	const loginUser = async () => {
		if (loading.value) return // 防止重复点击
		
		// 检查是否已登录
		if (checkLoginStatus()) return
		
		// 未登录时先进行微信登录
		loading.value = true
		try {
			const loginResult = await performWxLogin()
			handleWxLoginResult(loginResult)
		} catch (error) {
			console.error('微信登录失败:', error)
			uni.showToast({
				title: error.message || '微信登录失败',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}

	/**
	 * 关闭弹出层
	 */
	const close = () => {
		show.value = false
	}
	
	// ==================== 弹窗控制函数 ====================
	
	/**
	 * 打开设置弹窗
	 * 功能：检查用户登录状态，如果已登录则显示设置弹窗
	 */
	const goToSettings = () => {
		console.log('🔍 检查用户登录状态，当前userInfo:', userInfo.value)
		console.log('🔍 检查nickName:', userInfo.value.nickName)
		
		// 检查用户是否已登录
		if (!userInfo.value.nickName) {
			console.log('❌ 用户未登录，显示提示')
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		
		console.log('✅ 用户已登录，打开设置弹窗')
		showSettings.value = true
	}
	
	/**
	 * 关闭设置弹窗
	 * 功能：关闭设置弹窗
	 */
	const closeSettings = () => {
		showSettings.value = false
	}
	
	/**
	 * 退出登录
	 * 功能：清除用户数据、重置统计信息、关闭弹窗
	 */
	const logout = () => {
		console.log('🚪 用户点击退出登录')
		console.log('退出前用户信息:', userInfo.value)
		console.log('退出前token:', uni.getStorageSync('token'))
		
		uni.showModal({
			title: '确认退出',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					console.log('✅ 用户确认退出登录')
					
					// 使用userStore执行登出
					userStore.logout()
					console.log('✅ Store logout 执行完成')
					
					// 清除统计数据
					userStore.setUserStats({
						followers: 0,
						following: 0,
						likes: 0,
						collections: 0,
						views: 0,
						homestays: 0
					})
					console.log('✅ 统计数据已重置')
					
					// 关闭设置弹窗
					showSettings.value = false
					console.log('✅ 设置弹窗已关闭')
					
					uni.showToast({
						title: '已退出登录',
						icon: 'success'
					})
					console.log('✅ 退出登录完成')
				} else {
					console.log('❌ 用户取消退出登录')
				}
			}
		})
	}
	
	/**
	 * 验证用户输入
	 */
	const validateUserInput = () => {
		console.log('验证用户输入，当前userInfo:', userInfo.value)
		console.log('昵称:', userInfo.value.nickName)
		console.log('头像:', userInfo.value.avatarUrl)
		
		if (!userInfo.value.nickName || !userInfo.value.nickName.trim()) {
			uni.showToast({
				title: '请输入昵称',
				icon: 'none'
			})
			return false
		}
		
		if (!userInfo.value.avatarUrl) {
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
	 * 执行登录流程
	 * 功能：使用微信code和用户信息完成登录
	 * 返回：Promise<boolean> - 登录是否成功
	 */
	const performLogin = async () => {
		console.log('🚀 开始执行performLogin函数')
		
		const wxCode = uni.getStorageSync('wxLoginCode')
		console.log('从存储中获取的wxCode:', wxCode)
		
		if (!wxCode) {
			console.log('❌ 没有找到wxCode，登录状态异常')
			uni.showToast({
				title: '登录状态异常，请重新登录',
				icon: 'none'
			})
			return false
		}
		
		console.log('使用保存的微信登录code:', wxCode)
		console.log('准备传递的头像URL:', userInfo.value.avatarUrl)
		console.log('准备传递的昵称:', userInfo.value.nickName)
		
		// 使用userStore执行登录
		const loginData = {
			code: wxCode,
			avatarUrl: userInfo.value.avatarUrl,
			nickName: userInfo.value.nickName
		}
		
		console.log('准备调用userStore.performLogin，参数:', loginData)
		
		try {
			console.log('📡 开始调用API...')
			const result = await userStore.performLogin(loginData)
			console.log('✅ API调用成功，返回结果:', result)
			
			uni.removeStorageSync('wxLoginCode')
			console.log('🗑️ 已清除wxLoginCode')
			
			return true
		} catch (error) {
			console.error('❌ API调用失败:', error)
			console.error('错误详情:', error.message)
			console.error('错误堆栈:', error.stack)
			
			// 显示具体错误信息
			uni.showToast({
				title: error.message || '登录失败，请重试',
				icon: 'none',
				duration: 3000
			})
			throw error
		}
	}

	// ==================== 数据刷新函数 ====================
	
	/**
	 * 刷新整个页面数据
	 * 功能：从服务器获取最新的用户信息和统计数据
	 */
	const refreshMyPage = async () => {
		try {
			console.log('🔄 开始刷新my页面数据...')
			
			// 统一使用userStore刷新所有数据
			await userStore.fetchUserInfo()
			await userStore.fetchUserStats()
			
			console.log('✅ 用户数据刷新成功:', userStore.userInfo)
			console.log('✅ 统计数据刷新成功:', userStore.userStats)
			
		} catch (error) {
			console.error('❌ 刷新my页面失败:', error)
			// 如果服务器获取失败，尝试从本地存储加载
			await userStore.initializeUser()
		}
	}

	/**
	 * 处理登录成功后的用户信息
	 * 功能：登录成功后关闭弹窗、刷新数据、显示成功提示
	 */
	const handleLoginSuccess = async () => {
		try {
			console.log('🎉 开始处理登录成功逻辑...')
			
			// 关闭登录弹窗
			show.value = false
			console.log('✅ 弹窗已关闭')
			
			// 刷新用户数据
			await refreshMyPage()
			console.log('✅ my页面刷新完成')
			
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})
			console.log('✅ 登录成功提示已显示')
			
		} catch (error) {
			console.error('登录成功处理失败:', error)
			uni.showToast({
				title: '登录成功处理失败',
				icon: 'none'
			})
		}
	}

	// ==================== 用户信息提交函数 ====================
	
	/**
	 * 提交用户信息
	 * 功能：验证用户输入并执行登录流程
	 */
	const userSubmit = async () => {
		console.log('🔄 用户点击确定按钮，开始提交用户信息')
		console.log('当前loading状态:', loading.value)
		console.log('当前登录状态:', userStore.isLoggedIn)
		console.log('当前userInfo:', userInfo.value)
		
		try {
			// 防止重复提交
			if (loading.value) {
				console.log('⚠️ 正在处理中，跳过重复提交')
				return
			}
			
			// 验证用户信息
			console.log('🔍 开始验证用户输入...')
			if (!validateUserInput()) {
				console.log('❌ 用户输入验证失败')
				return
			}
			
			console.log('✅ 用户输入验证通过，开始登录流程')
			loading.value = true
			
			// 检查是否有有效的token，如果没有则执行登录
			const token = uni.getStorageSync('token')
			console.log('检查token:', token)
			
			if (!token) {
				console.log('🔐 没有有效token，开始执行登录...')
				const loginSuccess = await performLogin()
				if (loginSuccess) {
					console.log('✅ 登录成功，处理登录成功逻辑')
					await handleLoginSuccess()
				} else {
					console.log('❌ 登录失败')
				}
			} else {
				console.log('ℹ️ 已有有效token，跳过登录流程')
			}
		} catch (error) {
			console.error('💥 保存用户信息失败:', error)
			uni.showToast({
				title: error.message || '保存失败',
				icon: 'none',
				duration: 3000
			})
		} finally {
			loading.value = false
			console.log('🏁 用户信息提交流程结束')
		}
	}

	// ==================== 头像处理函数 ====================
	
	/**
	 * 选择头像
	 * 功能：处理用户选择头像的逻辑，区分临时文件和正式URL
	 * @param {object} e - 事件对象，包含avatarUrl
	 */
	const onChooseavatar = async (e) => {
		try {
			console.log('用户选择头像:', e.detail.avatarUrl)
			
			// 检查是否为微信小程序临时文件
			if (e.detail.avatarUrl.startsWith('http://tmp/')) {
				console.log('检测到微信小程序临时文件，保存临时路径，登录后上传')
				
				// 对于临时文件，先保存临时路径，登录后再上传
				const currentUserInfo = userStore.userInfo || {}
				userStore.setUserInfo({ 
					...currentUserInfo, 
					avatarUrl: e.detail.avatarUrl,  // 保存临时路径
					tempAvatarPath: e.detail.avatarUrl  // 额外保存临时路径标识
				})
				console.log('临时头像路径已保存，等待登录后上传')
				
				uni.showToast({
					title: '头像已选择，登录后自动上传',
					icon: 'success',
					duration: 2000
				})
			} else {
				// 非临时文件，直接转换协议
				const safeAvatarUrl = convertToHttps(e.detail.avatarUrl)
				console.log('转换后的头像URL:', safeAvatarUrl)
				
				// 直接更新Store中的用户信息
				const currentUserInfo = userStore.userInfo || {}
				userStore.setUserInfo({ 
					...currentUserInfo, 
					avatarUrl: safeAvatarUrl 
				})
				console.log('头像已更新到Store:', userStore.userInfo)
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
	 * 修改昵称
	 * @param {object} e - 事件对象
	 */
	const changeName = (e) => {
		try {
			console.log('用户输入昵称:', e.detail.value)
			// 直接更新Store中的用户信息
			const currentUserInfo = userStore.userInfo || {}
			userStore.setUserInfo({ 
				...currentUserInfo,
				nickName: e.detail.value
			})
			console.log('昵称已更新到Store:', userStore.userInfo)
		} catch (error) {
			console.error('修改昵称失败:', error)
		}
	}
	
	/**
	 * 显示功能开发中提示
	 * @param {string} functionName - 功能名称
	 */
	const showDevelopingTip = (functionName = '功能') => {
		uni.showToast({
			title: `${functionName}功能正在开发中...`,
			icon: 'none',
			duration: 2000
		})
	}
	
	
	// ==================== 页面导航函数 ====================
	
	/**
	 * 跳转到收藏列表
	 * 功能：检查登录状态后跳转到收藏页面
	 */
	const goToCollectList = () => {
		checkLoginAndNavigate('/pages/collect/collect', '查看我的收藏')
	}
	
	/**
	 * 跳转到浏览历史
	 * 功能：检查登录状态后跳转到历史页面
	 */
	const goToViewHistory = () => {
		checkLoginAndNavigate('/pages/history/history', '查看浏览历史')
	}
	
	/**
	 * 跳转到喜欢列表
	 * 功能：检查登录状态后跳转到喜欢页面
	 */
	const goToLikeList = () => {
		checkLoginAndNavigate('/pages/like/like', '查看我的喜欢')
	}
	
	/**
	 * 跳转到粉丝列表
	 * 功能：检查登录状态后跳转到粉丝页面
	 */
	const goToFansList = () => {
		checkLoginAndNavigate('/pages/fans-list/fans-list', '查看我的粉丝')
	}
	
	/**
	 * 跳转到关注列表
	 * 功能：检查登录状态后跳转到关注页面
	 */
	const goToFollowList = () => {
		checkLoginAndNavigate('/pages/follow-list/follow-list', '查看我的关注')
	}
	
	
	/**
	 * 跳转到我的发布页面
	 */
	const goToMyPublish = () => {
		checkLoginAndNavigate('/pages/my-publish/my-publish', '查看我的发布')
	}
	
	/**
	 * 跳转到我的草稿页面
	 */
	const goToMyDraft = () => {
		if (!userStore.isLoggedIn) {
			showLoginPrompt('查看我的草稿')
			return
		}
		
		// 检查是否有草稿数据
		const draftData = uni.getStorageSync('homestay_draft')
		if (!draftData) {
			showError('您还没有保存任何草稿')
			return
		}
		
		// 跳转到草稿页面
		uni.navigateTo({
			url: '/pages/publish-detail/publish-detail?mode=draft'
		})
	}
	
	// 功能菜单图标配置
	const extraIcon0 = reactive({
		color: '#666666',
		size: '22',
		type: 'compose'
	})
	const extraIconDraft = reactive({
		color: '#666666',
		size: '22',
		type: 'paperplane'
	})
	const extraIcon1 = reactive({
		color: '#666666',
		size: '22',
		type: 'location'
	})
	const extraIcon2 = reactive({
		color: '#666666',
		size: '22',
		type: 'gear'
	})
	const extraIcon3 = reactive({
		color: '#666666',
		size: '22',
		type: 'chatboxes'
	})
	const extraIcon4 = reactive({
		color: '#666666',
		size: '22',
		type: 'info'
	})
</script>

<style lang="scss" scoped>
	.content {
		height: 100vh;
		overflow: hidden; // 禁止页面滑动

		// background-color: red;
		.topBox {
			width: 100%;
			position: relative;
			z-index: 1;
			overflow: hidden;
			padding: 120rpx 20rpx 40rpx;
			box-sizing: border-box;
		}

		.topBox::after {
			content: "";
			width: 140%;
			height: 220px;
			position: absolute;
			z-index: -1;
			top: 0;
			left: -20%;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 0 0 50% 50%;
		}


		.users {
			margin-top: 80rpx;
			padding: 30rpx;
			box-sizing: border-box;
			height: 280rpx;
			background-color: #fff;
			box-shadow: 1px 10rpx 20rpx #ececec;
			border-radius: 16rpx;

			.u-top {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				margin-bottom: 30rpx;

				image {
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
					margin-right: 20rpx;
				}

				.tit {
					font-size: 30rpx;
					font-weight: 700;
					color: #333;
				}
			}

			.u-bottom {
				display: flex;
				justify-content: space-around;
				align-items: center;

				.u-item {
					text-align: center;

					.u-tit {
						color: #757575;
						font-size: 26rpx;
						margin-top: 10rpx;
					}

					.num {
						color: #000;
						font-size: 33rpx;
						font-weight: 700;
					}
				}
			}
		}

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

			image {
				width: 70rpx;
				height: 70rpx;
			}

			.avatar-warpper {
				border: none;
				border-radius: 10rpx;
				width: 70rpx;
				height: 70rpx;
				margin-left: 20rpx;
				padding: 0;
			}
		}
		.tools-section {
			margin: 0rpx 20rpx 0;
			
			.tools-title {
				font-size: 32rpx;
				font-weight: 700;
				color: #333;
				margin-bottom: 20rpx;
				padding-left: 10rpx;
			}
			
			.tools-card {
				padding: 20rpx;
				box-sizing: border-box;
				border-radius: 16rpx;
				background-color: #fff;
				box-shadow: 1px 10rpx 20rpx #ececec;
			}
		}
		
		.settings-content {
			padding: 20rpx 0;
			
			.setting-item {
				display: flex;
				align-items: center;
				padding: 30rpx 40rpx;
				border-bottom: 1px solid #f5f5f5;
				cursor: pointer;
				transition: background-color 0.3s;
				
				&:last-child {
					border-bottom: none;
				}
				
				&:active {
					background-color: #f5f5f5;
				}
				
				.setting-icon {
					font-size: 40rpx;
					margin-right: 20rpx;
				}
				
				.setting-text {
					flex: 1;
					font-size: 30rpx;
					color: #333;
				}
				
				.setting-arrow {
					font-size: 28rpx;
					color: #999;
				}
			}
		}
	}
</style>
