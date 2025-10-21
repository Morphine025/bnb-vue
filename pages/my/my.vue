<template>
	<view class="content">
		<view class="topBox">
			<view class="users">
				<view class="u-top" @click="loginUser">
					<template v-if="!userInfo.nickName">
						<image src='/static/unnamed.jpg' mode="aspectFill" />
						<view class="tit">
							注册 / 登录
						</view>
					</template>
					<template v-else>
						<image :src='safeAvatarUrl' mode="aspectFill" @error="handleAvatarError" />
						<view class="tit">
							{{userInfo.nickName}}
						</view>
					</template>
				</view>
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
		<view class="tools-section">
			<view class="tools-title">常用工具</view>
			<view class="tools-card">
				<uni-list>
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon0" showArrow title="我的发布" clickable @click="goToMyPublish"></uni-list-item>
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIconDraft" showArrow title="我的草稿" clickable @click="goToMyDraft"></uni-list-item>
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon1" showArrow title="地址管理" clickable @click="showDevelopingTip('地址管理')"></uni-list-item>
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon2" showArrow title="设置" clickable @click="goToSettings"></uni-list-item>
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon3" showArrow title="意见反馈" clickable @click="showDevelopingTip('意见反馈')"></uni-list-item>
					<uni-list-item :show-extra-icon="true" :extra-icon="extraIcon4" showArrow title="关于我的" clickable @click="showDevelopingTip('关于我的')"></uni-list-item>
				</uni-list>
			</view>
		</view>
		
		<!-- 设置弹窗 -->
		<up-popup :show="showSettings" @close="closeSettings" closeable round="20">
			<view class="popup">
				<view class="settings-content">
					<view class="setting-item" @click="logout" v-if="userInfo.nickName">
						<view class="setting-icon">🚪</view>
						<view class="setting-text">退出登录</view>
					</view>
				</view>
			</view>
		</up-popup>
		
		<up-popup :show="show" @close="close" closeable round="20">
			<view class="popup">
				<view class="title">
					获取头像与昵称
				</view>
				<view class="flex">
					<view class="label">
						获取用户头像
					</view>
					<button class="avatar-warpper" open-type="chooseAvatar" @chooseavatar="onChooseavatar">
						<image class="avatar" :src="safeAvatarUrl" @error="handleAvatarError"></image>
					</button>
				</view>
				<view class="flex">
					<view class="label">
						获取用户昵称
					</view>
					<input @input="changeName" type="nickname" />
				</view>
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

	// 导入Vue响应式API
	import {
		ref,
		reactive,
		computed,
		nextTick
	} from 'vue'
	
	// 导入uni-app生命周期钩子
	import {
		onLoad,
		onShow,
		onReachBottom,
		onPageScroll
	} from '@dcloudio/uni-app'
	
	// 导入API接口 - 使用新的统一API
	import { API } from '../../api'
	
	// 导入Pinia stores - 使用新的模块化Store
	import { 
		useUserStore,
		useUserProfileStore,
		useUserStatsStore,
		useUserSettingsStore
	} from '../../stores'
	
	// 导入用户信息工具
	import { refreshUserInfo } from '@/utils'
	
	// 导入URL转换工具
	import { convertToHttps } from '@/utils/security/urlConverter'
	
	// 导入图片错误处理工具
	import { handleAvatarError } from '@/utils/ui/imageErrorHandler'

	// 使用新的模块化Store
	const userStore = useUserStore()
	const userProfileStore = useUserProfileStore()
	const userStatsStore = useUserStatsStore()
	const userSettingsStore = useUserSettingsStore()
	
	// 响应式数据定义
	const show = ref(false) // 控制弹出层显示
	const showSettings = ref(false) // 控制设置弹窗显示
	const loading = ref(false) // 加载状态
	
	// 从新的模块化Store获取数据
	const userInfo = computed(() => userStore.userInfo || { nickName: '', avatarUrl: '' })
	const userStats = computed(() => userStatsStore.userStats || {
		fansCount: 0,
		followCount: 0,
		likeCount: 0,
		collectCount: 0,
		viewCount: 0
	})
	
	// 安全的头像URL
	const safeAvatarUrl = computed(() => {
		if (!userInfo.value?.avatarUrl) return '/static/logo.png'
		return convertToHttps(userInfo.value.avatarUrl)
	})

	/**
	 * 更新用户数据到响应式变量
	 * @param {Object} userData - 用户数据对象
	 */
	const updateUserData = (userData) => {
		// 使用userStore更新用户数据
		userStore.setUserInfo(userData)
		if (userData.stats) {
			userStatsStore.setUserStats(userData.stats)
		}
		
		console.log('用户数据已更新:', userData)
	}

	/**
	 * 从本地存储加载用户数据
	 */
	const loadUserDataFromStorage = () => {
		// 使用userStore初始化用户数据
		userStore.initializeUser()
	}

	/**
	 * 从服务器加载用户数据
	 */
	const loadUserDataFromServer = async () => {
		try {
			// 使用userStore获取用户信息
			const userData = await userStore.fetchUserInfo()
			return userData
		} catch (error) {
			console.error('获取用户信息失败，可能是token无效:', error)
			// 清除无效的token
			uni.removeStorageSync('token')
			uni.showToast({
				title: '登录已过期，请重新登录',
				icon: 'none'
			})
			throw error
		}
	}

	/**
	 * 页面加载时检查登录状态
	 */
	onLoad(async () => {
		loading.value = true
		try {
			const token = uni.getStorageSync('token')
			const hasUserInfo = uni.getStorageSync('userInfo')
			
			if (token && !hasUserInfo) {
				// 有token但没有用户信息，从服务器获取
				await loadUserDataFromServer()
			} else if (token && hasUserInfo) {
				// 有token和用户信息，从本地加载
				loadUserDataFromStorage()
			}
		} catch (error) {
			console.error('页面初始化失败:', error)
		} finally {
			loading.value = false
		}
	})
	
	/**
	 * 页面显示时刷新用户信息和统计数据
	 */
	onShow(async () => {
		// 如果用户已登录，刷新用户信息和统计数据
		if (isLoggedIn()) {
			try {
				// 使用工具函数刷新用户信息
				const userData = await refreshUserInfo()
				updateUserData(userData)
			} catch (error) {
				console.error('刷新用户信息失败:', error)
				// 如果获取失败，使用本地存储的信息
				loadUserDataFromStorage()
			}
		}
	})

	/**
	 * 检查是否已登录
	 */
	const isLoggedIn = () => {
		return userStore.isLoggedIn
	}

	/**
	 * 检查登录状态并处理跳转
	 */
	const checkLoginStatus = () => {
		if (isLoggedIn()) {
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
	 * 执行微信登录
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
	 */
	const handleWxLoginResult = (loginResult) => {
		console.log('微信登录成功:', loginResult)
		// 保存微信登录的code，然后显示头像昵称设置弹窗
		uni.setStorageSync('wxLoginCode', loginResult.code)
		show.value = true
	}

	/**
	 * 用户登录
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
	
	/**
	 * 打开设置弹窗
	 */
	const goToSettings = () => {
		console.log('🔍 检查用户登录状态，当前userInfo:', userInfo.value)
		console.log('🔍 检查nickName:', userInfo.value.nickName)
		console.log('🔍 检查nickname:', userInfo.value.nickname)
		
		// 检查用户是否已登录 - 修复字段名不匹配问题
		if (!userInfo.value.nickName && !userInfo.value.nickname) {
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
	 */
	const closeSettings = () => {
		showSettings.value = false
	}
	
	/**
	 * 退出登录
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
					userStatsStore.resetUserStats()
					console.log('✅ 统计数据已重置')
					
					// 关闭设置弹窗
					showSettings.value = false
					console.log('✅ 设置弹窗已关闭')
					
					// 强制触发页面重新渲染，确保UI完全更新
					forceRefreshPage()
					
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

	/**
	 * 更新用户头像
	 */
	const updateUserAvatar = async (avatarUrl) => {
		try {
			await API.user.updateInfo({ avatar: avatarUrl })
			console.log('用户头像更新成功:', avatarUrl)
			// 更新本地用户信息
			userInfo.avatarUrl = avatarUrl
		} catch (error) {
			console.error('更新用户头像失败:', error)
			throw error
		}
	}

	/**
	 * 强制刷新页面状态
	 */
	const forceRefreshPage = () => {
		console.log('🔄 开始强制刷新页面...')
		
		// 强制触发Vue响应式更新
		uni.$forceUpdate && uni.$forceUpdate()
		
		// 延迟检查状态是否正确更新
		setTimeout(() => {
			console.log('强制刷新后用户信息:', userInfo.value)
			console.log('强制刷新后统计数据:', userStats.value)
			console.log('强制刷新后Store状态:', userStore.userInfo)
			
			// 检查是否已退出登录
			const token = uni.getStorageSync('token')
			const hasUserInfo = userInfo.value && (userInfo.value.nickName || userInfo.value.nickname)
			
			if (!token && !hasUserInfo) {
				console.log('✅ 退出登录成功，页面状态已清空')
			} else {
				console.log('⚠️ 退出登录可能未完全成功，当前状态:', {
					token: !!token,
					hasUserInfo: hasUserInfo,
					userInfo: userInfo.value
				})
			}
		}, 200)
	}

	/**
	 * 刷新整个页面数据
	 */
	const refreshMyPage = async () => {
		try {
			console.log('🔄 开始刷新my页面数据...')
			
			// 重新获取用户信息
			const userData = await loadUserDataFromServer()
			console.log('✅ 用户数据刷新成功:', userData)
			
			// 获取用户统计数据
			console.log('🔄 开始获取用户统计数据...')
			const statsData = await userStatsStore.fetchUserStats()
			console.log('✅ 统计数据获取成功:', statsData)
			console.log('✅ Store中的统计数据:', userStatsStore.userStats)
			console.log('✅ 页面显示的统计数据:', userStats.value)
			
			// 强制刷新页面状态
			forceRefreshPage()
			
			// 触发页面重新渲染
			setTimeout(() => {
				console.log('🎉 my页面刷新完成')
			}, 300)
			
		} catch (error) {
			console.error('❌ 刷新my页面失败:', error)
			// 如果服务器获取失败，尝试从本地存储加载
			loadUserDataFromStorage()
		}
	}

	/**
	 * 处理登录成功后的用户信息
	 */
	const handleLoginSuccess = async () => {
		try {
			console.log('🎉 开始处理登录成功逻辑...')
			
			// 关闭登录弹窗 - 修复变量名
			show.value = false
			console.log('✅ 弹窗已关闭')
			
			// 检查是否有临时头像需要上传
			const currentUserInfo = userStore.userInfo || {}
			if (currentUserInfo.tempAvatarPath && currentUserInfo.tempAvatarPath.startsWith('http://tmp/')) {
				console.log('🔄 检测到临时头像，开始上传...')
				
				try {
					// 显示上传进度
					uni.showLoading({
						title: '上传头像中...'
					})
					
					// 上传头像到服务器
					const uploadResult = await API.user.uploadAvatar(currentUserInfo.tempAvatarPath)
					console.log('头像上传成功:', uploadResult)
					
					// 使用服务器返回的头像URL
					const serverAvatarUrl = uploadResult.url || uploadResult.avatarUrl
					console.log('服务器返回的头像URL:', serverAvatarUrl)
					
					// 更新Store中的用户信息，移除临时路径标识
					userStore.setUserInfo({ 
						...currentUserInfo, 
						avatarUrl: serverAvatarUrl,
						tempAvatarPath: null  // 清除临时路径标识
					})
					console.log('头像已更新到Store:', userStore.userInfo)
					
					uni.hideLoading()
					uni.showToast({
						title: '头像上传成功',
						icon: 'success'
					})
					
				} catch (uploadError) {
					console.error('头像上传失败:', uploadError)
					uni.hideLoading()
					
					// 上传失败时，使用默认头像
					userStore.setUserInfo({ 
						...currentUserInfo, 
						avatarUrl: '/static/logo.png',
						tempAvatarPath: null
					})
					
					uni.showToast({
						title: '头像上传失败，使用默认头像',
						icon: 'none',
						duration: 2000
					})
				}
			}
			
			// 刷新整个my页面
			console.log('🔄 开始刷新my页面...')
			await refreshMyPage()
			console.log('✅ my页面刷新完成')
			
			// 强制触发页面重新渲染
			await nextTick()
			console.log('✅ 页面重新渲染完成')
			
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})
			console.log('✅ 登录成功提示已显示')
			
		} catch (error) {
			console.error('获取用户信息失败:', error)
			uni.showToast({
				title: '获取用户信息失败',
				icon: 'none'
			})
		}
	}

	/**
	 * 提交用户信息
	 */
	const userSubmit = async () => {
		console.log('🔄 用户点击确定按钮，开始提交用户信息')
		console.log('当前loading状态:', loading.value)
		console.log('当前登录状态:', isLoggedIn())
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

	/**
	 * 选择头像
	 * @param {object} e - 事件对象
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
	
	
	/**
	 * 跳转到收藏列表
	 */
	const goToCollectList = () => {
		// 检查是否已登录
		if (!isLoggedIn()) {
			showLoginPrompt('查看我的收藏')
			return
		}
		
		uni.navigateTo({
			url: '/pages/collect/collect'
		})
	}
	
	/**
	 * 跳转到浏览历史
	 */
	const goToViewHistory = () => {
		// 检查是否已登录
		if (!isLoggedIn()) {
			showLoginPrompt('查看浏览历史')
			return
		}
		
		uni.navigateTo({
			url: '/pages/history/history'
		})
	}
	
	/**
	 * 跳转到喜欢列表
	 */
	const goToLikeList = () => {
		// 检查是否已登录
		if (!isLoggedIn()) {
			showLoginPrompt('查看我的喜欢')
			return
		}
		
		uni.navigateTo({
			url: '/pages/like/like'
		})
	}
	
	/**
	 * 跳转到粉丝列表
	 */
	const goToFansList = () => {
		// 检查是否已登录
		if (!isLoggedIn()) {
			showLoginPrompt('查看我的粉丝')
			return
		}
		
		uni.navigateTo({
			url: '/pages/fans-list/fans-list'
		})
	}
	
	/**
	 * 跳转到关注列表
	 */
	const goToFollowList = () => {
		// 检查是否已登录
		if (!isLoggedIn()) {
			showLoginPrompt('查看我的关注')
			return
		}
		
		uni.navigateTo({
			url: '/pages/follow-list/follow-list'
		})
	}
	
	
	/**
	 * 跳转到我的发布页面
	 */
	const goToMyPublish = () => {
		// 检查是否已登录
		if (!isLoggedIn()) {
			showLoginPrompt('查看我的发布')
			return
		}
		
		// 跳转到我的发布页面
		uni.navigateTo({
			url: '/pages/my-publish/my-publish',
			success: (res) => {
				console.log('跳转成功:', res)
			},
			fail: (err) => {
				console.error('跳转失败:', err)
				// 尝试使用备用跳转方式
				uni.showModal({
					title: '提示',
					content: '页面跳转失败，是否重试？',
					success: (modalRes) => {
						if (modalRes.confirm) {
							// 使用redirectTo作为备用方案
							uni.redirectTo({
								url: '/pages/my-publish/my-publish',
								fail: (retryErr) => {
									console.error('重试跳转也失败:', retryErr)
									uni.showToast({
										title: '页面暂时无法访问',
										icon: 'none'
									})
								}
							})
						}
					}
				})
			}
		})
	}
	
	/**
	 * 跳转到我的草稿页面
	 */
	const goToMyDraft = () => {
		// 检查是否已登录
		if (!isLoggedIn()) {
			showLoginPrompt('查看我的草稿')
			return
		}
		
		// 检查是否有草稿数据
		const draftData = uni.getStorageSync('homestay_draft')
		if (!draftData) {
			uni.showModal({
				title: '提示',
				content: '您还没有保存任何草稿',
				showCancel: false,
				confirmText: '确定'
			})
			return
		}
		
		// 跳转到草稿页面（这里可以跳转到发布页面并加载草稿数据）
		uni.navigateTo({
			url: '/pages/publish-detail/publish-detail?mode=draft',
			success: (res) => {
				console.log('跳转到草稿页面成功:', res)
			},
			fail: (err) => {
				console.error('跳转失败:', err)
				uni.showToast({
					title: '页面跳转失败',
					icon: 'none'
				})
			}
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
