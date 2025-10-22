<template>
	<view class="content">
		<!-- 页面背景和用户信息卡片区域 -->
		<PageBackground>
			<UserInfoCard 
				:user-info="userInfo"
				:user-stats="userStats"
				@user-click="loginUser"
				@stats-item-click="handleStatsItemClick"
			/>
		</PageBackground>
		
		<!-- 功能菜单区域 -->
		<UserToolsMenu 
			:menu-items="menuItems" 
			@item-click="handleMenuItemClick"
		/>
		
		<!-- 设置弹窗组件 -->
		<UserSettingsPopup 
			:show="showSettings" 
			:is-logged-in="!!userInfo.nickName"
			@close="closeSettings"
			@logout="logout"
		/>
		
		<!-- 登录弹窗组件 -->
		<LoginPopup 
			:show="show" 
			:user-info="userInfo"
			:loading="loading"
			@close="close"
			@avatar-change="handleAvatarChange"
			@name-change="handleNameChange"
			@submit="userSubmit"
		/>
	</view>
</template>

<script setup>
	/**
	 * 我的页面组件
	 * 功能描述：用户个人信息展示、登录注册、功能菜单
	 * 主要功能：
	 * 1. 用户登录 - 微信登录、头像昵称设置
	 * 2. 信息展示 - 用户头像、昵称、统计数据
	 * 3. 功能菜单 - 我的发布、设置、地址管理等
	 * 4. 状态管理 - 登录状态、数据刷新、错误处理
	 * 5. 页面导航 - 跳转到各个功能页面
	 * 6. 数据同步 - 与服务器数据同步
	 * 
	 * 技术特点：
	 * - Vue 3 Composition API
	 * - Pinia状态管理
	 * - 组件化设计
	 * - 事件驱动
	 * - 错误处理
	 * - 数据验证
	 */

	// ==================== 导入依赖 ====================
	
	// Vue 3 响应式API
	import {
		ref,        // 响应式引用
		reactive,   // 响应式对象
		computed    // 计算属性
	} from 'vue'
	
	// uni-app 生命周期钩子
	import {
		onLoad,     // 页面加载时触发
		onShow      // 页面显示时触发
	} from '@dcloudio/uni-app'
	
	
	// Pinia状态管理 - 统一使用userStore管理所有用户数据
	import { 
		useUserStore
	} from '../../stores'
	
	// 工具函数
	import { handleError, showError } from '@/utils/error/errorHandler'  // 统一错误处理
	
	// 组件导入
	import UserToolsMenu from './components/UserToolsMenu.vue'
	import UserSettingsPopup from './components/UserSettingsPopup.vue'
	import UserStatsDisplay from './components/UserStatsDisplay.vue'
	import UserInfoCard from './components/UserInfoCard.vue'
	import PageBackground from './components/PageBackground.vue'
	import LoginPopup from './components/LoginPopup.vue'

	// ==================== 状态管理 ====================
	
	// 使用简化的Store - 统一使用userStore管理所有用户数据
	const userStore = useUserStore()
	
	// ==================== 响应式数据 ====================
	
	// 页面状态控制
	const show = ref(false)          // 控制登录弹窗显示
	const showSettings = ref(false)   // 控制设置弹窗显示
	const loading = ref(false)        // 加载状态
	
	// 功能菜单配置
	const menuItems = reactive([
		{
			title: '我的发布',
			icon: { color: '#666666', size: '22', type: 'compose' },
			action: 'goToMyPublish'
		},
		{
			title: '我的草稿',
			icon: { color: '#666666', size: '22', type: 'paperplane' },
			action: 'goToMyDraft'
		},
		{
			title: '设置',
			icon: { color: '#666666', size: '22', type: 'gear' },
			action: 'goToSettings'
		},
		{
			title: '地址管理',
			icon: { color: '#666666', size: '22', type: 'location' },
			action: 'showDevelopingTip',
			params: '地址管理'
		},
		{
			title: '意见反馈',
			icon: { color: '#666666', size: '22', type: 'chatboxes' },
			action: 'showDevelopingTip',
			params: '意见反馈'
		},
		{
			title: '关于我的',
			icon: { color: '#666666', size: '22', type: 'info' },
			action: 'showDevelopingTip',
			params: '关于我的'
		}
	])
	
	// ==================== 计算属性 ====================
	
	// 用户信息 - 从userStore获取，提供默认值
	const userInfo = computed(() => userStore.userInfo || { nickName: '', avatarUrl: '' })
	
	// 用户统计数据 - 从userStore获取，提供默认值
	const userStats = computed(() => {
		console.log('🔍 userStats computed - userStore.userStats:', userStore.userStats)
		return userStore.userStats || {
			followers: 0,     // 粉丝数
			following: 0,     // 关注数
			likes: 0,         // 喜欢数
			collections: 0,   // 收藏数
			views: 0,         // 浏览数
			homestays: 0      // 发布数
		}
	})
	
	// 安全的头像URL - 处理协议转换和默认头像（已移至UserInfoCard组件）
	// const safeAvatarUrl = computed(() => {
	// 	if (!userInfo.value?.avatarUrl) return '/static/logo.png'
	// 	return convertToHttps(userInfo.value.avatarUrl)
	// })

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
	 * 通用登录检查和导航函数
	 * 功能：检查登录状态，如果未登录则显示提示，已登录则跳转
	 * @param {string} url - 跳转URL
	 * @param {string} action - 操作描述
	 */
	const checkLoginAndNavigate = (url, action) => {
		if (!userStore.isLoggedIn) {
			uni.showModal({
				title: '提示',
				content: `请先登录后再${action}`,
				showCancel: false,
				confirmText: '去登录',
				success: () => {
					show.value = true
				}
			})
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
		console.log('🎉 微信登录成功:', loginResult)
		// 保存微信登录的code，然后显示头像昵称设置弹窗
		uni.setStorageSync('wxLoginCode', loginResult.code)
		console.log('💾 已保存wxLoginCode')
		show.value = true
		console.log('📱 已设置show.value = true，弹窗应该显示')
	}

	/**
	 * 用户登录入口
	 * 功能：处理用户点击登录按钮的逻辑
	 */
	const loginUser = async () => {
		console.log('🔍 loginUser被调用')
		console.log('   - loading:', loading.value)
		console.log('   - isLoggedIn:', userStore.isLoggedIn)
		console.log('   - show:', show.value)
		
		if (loading.value) return // 防止重复点击
		
		// 检查是否已登录
		if (userStore.isLoggedIn) {
			// 已登录，跳转到个人信息编辑页面
			console.log('✅ 用户已登录，跳转到个人信息页面')
			uni.navigateTo({
				url: '/pages/profile/profile'
			})
			return
		}
		
		console.log('🔄 开始微信登录流程')
		// 未登录时先进行微信登录
		loading.value = true
		try {
			const loginResult = await performWxLogin()
			console.log('✅ 微信登录成功，准备显示弹窗')
			handleWxLoginResult(loginResult)
		} catch (error) {
			console.error('❌ 微信登录失败:', error)
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
	
	/**
	 * 处理头像变更事件
	 * 功能：处理LoginPopup组件传递的头像变更事件
	 * @param {Object} data - 头像数据对象
	 */
	const handleAvatarChange = (data) => {
		console.log('处理头像变更:', data)
		
		// 更新Store中的用户信息
		const currentUserInfo = userStore.userInfo || {}
		userStore.setUserInfo({ 
			...currentUserInfo, 
			...data
		})
		console.log('头像已更新到Store:', userStore.userInfo)
	}
	
	/**
	 * 处理昵称变更事件
	 * 功能：处理LoginPopup组件传递的昵称变更事件
	 * @param {string} nickName - 昵称
	 */
	const handleNameChange = (nickName) => {
		console.log('处理昵称变更:', nickName)
		
		// 更新Store中的用户信息
		const currentUserInfo = userStore.userInfo || {}
		userStore.setUserInfo({ 
			...currentUserInfo,
			nickName: nickName
		})
		console.log('昵称已更新到Store:', userStore.userInfo)
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
	
	// 头像和昵称处理函数已移至LoginPopup组件
	
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
	
	/**
	 * 处理菜单项点击事件
	 * 功能：根据菜单项配置执行相应的操作
	 * @param {Object} item - 菜单项对象
	 */
	const handleMenuItemClick = (item) => {
		console.log('处理菜单项点击:', item.title, '操作:', item.action)
		
		// 根据action执行相应操作
		switch (item.action) {
			case 'goToMyPublish':
				goToMyPublish()
				break
			case 'goToMyDraft':
				goToMyDraft()
				break
			case 'goToSettings':
				goToSettings()
				break
			case 'showDevelopingTip':
				showDevelopingTip(item.params)
				break
			default:
				console.warn('未知的菜单操作:', item.action)
		}
	}
	
	/**
	 * 处理统计数据项点击事件
	 * 功能：根据统计项配置执行相应的操作
	 * @param {Object} item - 统计项对象
	 */
	const handleStatsItemClick = (item) => {
		console.log('处理统计项点击:', item.label, '操作:', item.action)
		
		// 根据action执行相应操作
		switch (item.action) {
			case 'goToFansList':
				goToFansList()
				break
			case 'goToFollowList':
				goToFollowList()
				break
			case 'goToLikeList':
				goToLikeList()
				break
			case 'goToCollectList':
				goToCollectList()
				break
			case 'goToViewHistory':
				goToViewHistory()
				break
			default:
				console.warn('未知的统计项操作:', item.action)
		}
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
			uni.showModal({
				title: '提示',
				content: '请先登录后再查看我的草稿',
				showCancel: false,
				confirmText: '去登录',
				success: () => {
					show.value = true
				}
			})
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
	
</script>

<style lang="scss" scoped>
	.content {
		height: 100vh;
		overflow: hidden; // 禁止页面滑动

		// background-color: red;
		// 背景和用户信息样式已移至PageBackground和UserInfoCard组件

		// 登录弹窗样式已移至LoginPopup组件
		
	}
</style>
