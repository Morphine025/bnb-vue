<template>
	<view class="detail">
		<up-navbar title="" :auto-back="true" left-icon-color="#fff" bg-color="transparent"></up-navbar>
		<view class="detail-container">
			<!-- 主图区域 -->
			<view class="hero-section">
				<!-- 轮播图组件 -->
				<swiper 
					class="hero-swiper" 
					:indicator-dots="false" 
					:autoplay="false" 
					:interval="3000" 
					:duration="500"
					:circular="false"
					@change="onSwiperChange"
				>
					<swiper-item v-for="(image, index) in getAllImages()" :key="index">
						<image 
							:src="image" 
							mode="aspectFill" 
							class="hero-image"
							@click="previewImage"
						></image>
					</swiper-item>
				</swiper>
			</view>

			<!-- 内容区域 -->
			<view class="content-section">
				<!-- 标题和标签 -->
				<view class="title-section">
					<view class="title-row">
						<text class="main-title">{{details.dt.title}}</text>
					</view>
					<view class="location-info" v-if="getLocationText()">
						<up-icon name="map" color="#999" size="16"></up-icon>
						<text class="location-text">{{ getLocationText() }}</text>
					</view>
				</view>

				<!-- 用户信息区域 -->
				<view class="user-section" v-if="details.dt.author">
					<view class="user-info" @click="goToUserProfile">
						<image 
							:src="details.dt.avatar || '/static/unnamed.jpg'" 
							mode="aspectFill" 
							class="user-avatar"
						></image>
						<view class="user-details">
							<text class="user-name">{{details.dt.author}}</text>
						</view>
					</view>
					<!-- 关注按钮 - 只有非当前用户发布的内容才显示 -->
					<button 
						v-if="!isCurrentUser && details.dt.userId !== currentUserId" 
						class="follow-btn" 
						:class="{ 'followed': isFollowing }"
						@click="toggleFollowAction"
					>
						<text>{{ isFollowing ? '已关注' : '关注' }}</text>
					</button>
				</view>

				<!-- 基本信息 -->
				<view class="info-section" v-if="details.dt.price || details.dt.rooms || details.dt.area">
					<view class="info-item" v-if="details.dt.price">
						<view class="info-label">价格</view>
						<view class="info-value price-value">
							<text class="price-symbol">¥</text>
							<text class="price-number">{{formatPrice(details.dt.price)}}</text>
						</view>
					</view>
					<view class="info-item" v-if="details.dt.rooms">
						<view class="info-label">房间数</view>
						<view class="info-value">{{details.dt.rooms}}间</view>
					</view>
					<view class="info-item" v-if="details.dt.area">
						<view class="info-label">面积</view>
						<view class="info-value">{{details.dt.area}}m²</view>
					</view>
				</view>

				<!-- 特色标签 -->
				<view class="tags-section" v-if="displayTags && displayTags.length > 0">
					<view class="section-title">特色标签</view>
					<view class="tags-list">
						<view class="tag-item" v-for="(tag, index) in displayTags" :key="index">
							{{tag}}
						</view>
					</view>
				</view>

				<!-- 介绍 -->
				<view class="description-section">
					<view class="section-title">详细介绍</view>
					<view class="description-content">
						{{details.dt.introduce || '暂无详细介绍'}}
					</view>
				</view>

			</view>

			<!-- 底部操作栏 -->
			<view class="bottom-actions">
				<button class="contact-btn" @click="contactOwner">
					<up-icon name="chat" color="#fff" size="18"></up-icon>
					<text>联系房东</text>
				</button>
				<button class="like-btn" @click="toggleLikeAction" :class="{ 'liked': isLiked }">
					<up-icon :name="isLiked ? 'heart-fill' : 'heart'" :color="isLiked ? '#ff4757' : '#999'" size="18"></up-icon>
					<text>点赞</text>
				</button>
				<button class="collect-btn" @click="toggleCollectAction" :class="{ 'collected': isCollected }">
					<up-icon :name="isCollected ? 'star-fill' : 'star'" :color="isCollected ? '#ffa502' : '#999'" size="18"></up-icon>
					<text>收藏</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 详情页组件 - 原始未拆分版本
	 * 所有功能都集中在一个文件中
	 */

	// 导入uni-app生命周期钩子
	import {
		onLoad
	} from '@dcloudio/uni-app'
	
	// 导入Vue响应式API
	import {
		ref,
		reactive,
		computed
	} from 'vue'
	
	// 导入价格格式化工具
	import { formatPrice } from '@/utils'
	
	// 导入API接口 - 使用新的统一API
	import { API } from '../../api'

	// 响应式数据定义
	const details = reactive({
		dt: '' // 民宿详情数据
	})
	
	const projectList = ref([]) // 推荐项目列表
	const isLiked = ref(false) // 点赞状态
	const isCollected = ref(false) // 收藏状态
	const isFollowing = ref(false) // 关注状态
	const isCurrentUser = ref(false) // 是否为当前用户发布
	const currentUserId = ref(null) // 当前用户ID
	const tagMap = ref({}) // 标签ID到名称的映射
	const currentImageIndex = ref(0) // 当前图片索引
	
	/**
	 * 计算属性：转换标签ID为标签名称
	 */
	const displayTags = computed(() => {
		if (!details.dt.tags || !Array.isArray(details.dt.tags)) {
			return []
		}
		return details.dt.tags.map(tagId => {
			return tagMap.value[tagId] || tagId // 如果找不到映射，显示原始ID
		})
	})

	/**
	 * 页面加载时获取数据
	 * @param {object} opt - 页面参数
	 */
	onLoad(async (opt) => {
		await loadTagMap() // 先加载标签映射
		await loadDetailData(opt)
	})
	
	/**
	 * 加载标签映射关系
	 */
	const loadTagMap = async () => {
		try {
			console.log('🔄 开始加载标签映射...')
			const response = await uni.request({
				url: 'http://localhost:8081/api/bnb/tag/list',
				method: 'GET',
				header: {
					'Content-Type': 'application/json'
				}
			})
			
			console.log('📡 标签API响应:', response)
			
			if (response.data && response.data.code === 1) {
				const tags = response.data.data || []
				// 构建标签ID到名称的映射
				const map = {}
				tags.forEach(tag => {
					map[tag.tagId] = tag.tagName
				})
				tagMap.value = map
				console.log('✅ 标签映射加载成功:', tagMap.value)
			} else {
				console.error('❌ 标签映射加载失败:', response.data)
			}
		} catch (error) {
			console.error('❌ 标签映射加载异常:', error)
		}
	}

	/**
	 * 加载详情页数据
	 * @param {object} opt - 页面参数
	 */
	const loadDetailData = async (opt) => {
		try {
			let homestayId = null
			
			// 处理不同的参数传递方式
			if (opt.id) {
				// 方式1：直接通过id参数传递（如从喜欢页面跳转）
				homestayId = opt.id
				console.log('📱 通过id参数获取民宿ID:', homestayId)
			} else if (opt.item) {
				// 方式2：通过item参数传递完整数据（如从首页跳转）
				const itemData = JSON.parse(decodeURIComponent(opt.item))
				homestayId = itemData.homestayId || itemData.id
				console.log('📱 通过item参数获取民宿ID:', homestayId)
			} else {
				// 没有有效的参数
				uni.showToast({
					title: '参数异常',
					icon: 'none'
				})
				uni.navigateBack()
				return
			}
			
			if (!homestayId) {
				uni.showToast({
					title: '民宿ID缺失',
					icon: 'none'
				})
				uni.navigateBack()
				return
			}
			
			// 从后端获取完整的详情数据
			try {
				const latestDetail = await API.homestay.getDetail(homestayId)
				if (latestDetail && latestDetail.code === 1) {
					details.dt = latestDetail.data
					console.log('获取到最新详情数据:', latestDetail.data)
				} else {
					// 如果后端获取失败，显示错误信息
					uni.showToast({
						title: '获取详情失败',
						icon: 'none'
					})
					uni.navigateBack()
					return
				}
			} catch (error) {
				// 如果后端获取失败，显示错误信息
				console.error('获取详情失败:', error)
				uni.showToast({
					title: '获取详情失败',
					icon: 'none'
				})
				uni.navigateBack()
				return
			}
			
			// 初始化点赞、收藏和关注状态
			// 点赞状态从详情数据中获取
			if (details.dt.isLiked !== undefined) {
				isLiked.value = details.dt.isLiked
			}
			
			// 收藏状态从详情数据中获取
			if (details.dt.isCollected !== undefined) {
				isCollected.value = details.dt.isCollected
			}
			
			// 关注状态从详情数据中获取
			if (details.dt.isFollowed !== undefined) {
				isFollowing.value = details.dt.isFollowed
				console.log('从后端获取关注状态:', details.dt.isFollowed)
			} else {
				// 如果后端没有返回关注状态，检查是否为当前用户发布的内容
				if (details.dt.userId && currentUserId.value && details.dt.userId === currentUserId.value) {
					isFollowing.value = false // 自己不能关注自己
					console.log('当前用户发布的内容，关注状态设为false')
				} else {
					isFollowing.value = false // 默认未关注
					console.log('后端未返回关注状态，使用默认值false')
				}
			}
			
			// 获取推荐项目数据
			const res = await API.homestay.getHomeList({ page: 1, size: 10 })
			if (res && Array.isArray(res)) {
				projectList.value = res
				console.log('推荐项目数据加载成功:', res.length, '条')
			} else {
				console.warn('推荐项目数据为空')
				projectList.value = []
			}
			
			// 记录浏览历史
			await recordViewHistory()
			
			// 在数据完全加载后判断用户身份和关注状态
			setTimeout(async () => {
				await checkUserIdentity()
				// 重新检查关注状态，因为此时currentUserId已经设置
				if (details.dt.isFollowed === undefined && details.dt.userId && currentUserId.value) {
					if (details.dt.userId === currentUserId.value) {
						isFollowing.value = false // 自己不能关注自己
						console.log('重新检查：当前用户发布的内容，关注状态设为false')
					}
				}
			}, 100)
		} catch (error) {
			console.error('加载详情页数据失败:', error)
			uni.showToast({
				title: '数据加载失败',
				icon: 'none'
			})
		}
	}

	/**
	 * 记录浏览历史
	 */
	const recordViewHistory = async () => {
		try {
			// 检查用户是否已登录
			const token = uni.getStorageSync('token')
			if (!token) {
				console.log('用户未登录，跳过记录浏览历史')
				return
			}
			
			// 检查是否有民宿ID
			const homestayId = details.dt.homestayId || details.dt.id
			if (!details.dt || !homestayId) {
				console.warn('民宿ID不存在，跳过记录浏览历史')
				return
			}
			
			// 调用后端API记录浏览历史
			await API.user.addViewHistory(homestayId)
			console.log('✅ 浏览历史记录成功:', homestayId)
		} catch (error) {
			console.error('❌ 记录浏览历史失败:', error)
			// 不显示错误提示，避免影响用户体验
		}
	}

	/**
	 * 联系房东
	 */
	const contactOwner = async () => {
		try {
			// 调试信息
			console.log('联系房东按钮点击，当前用户ID:', currentUserId.value)
			console.log('本地存储用户信息:', uni.getStorageSync('userInfo'))
			
			// 如果currentUserId为空，尝试重新获取
			if (!currentUserId.value) {
				console.log('currentUserId为空，尝试重新获取用户信息')
				await checkUserIdentity()
				console.log('重新获取后的currentUserId:', currentUserId.value)
			}
			
			// 检查用户登录状态
			if (!currentUserId.value) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			
			// 检查是否是自己的民宿
			if (details.dt.userId === currentUserId.value) {
				uni.showToast({
					title: '不能联系自己',
					icon: 'none'
				})
				return
			}
			
			// 跳转到聊天页面
			uni.navigateTo({
				url: `/pages/chat/chat?landlordId=${details.dt.userId}&homestayId=${details.dt.homestayId}`
			})
		} catch (error) {
			console.error('联系房东失败:', error)
			uni.showToast({
				title: '联系失败，请重试',
				icon: 'none'
			})
		}
	}

	/**
	 * 切换点赞状态
	 */
		const toggleLikeAction = async () => {
		try {
			// 获取民宿ID，优先使用homestayId，其次使用id
			const homestayId = details.dt?.homestayId || details.dt?.id
			if (!details.dt || !homestayId) {
				uni.showToast({
					title: '数据异常',
					icon: 'none'
				})
				return
			}
			
			// 检查用户是否已登录
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					duration: 2000
				})
				// 可以跳转到登录页
				// uni.navigateTo({
				//     url: '/pages/login/login'
				// })
				return
			}
			
			// 调用后端API
			const action = isLiked.value ? 'unlike' : 'like'
			console.log('点赞参数:', {
				homestayId: homestayId,
				action: action,
				token: token
			})
			await API.homestay.toggleLike(homestayId, action)
			
			// 更新本地状态
			isLiked.value = !isLiked.value
			
			uni.showToast({
				title: isLiked.value ? '点赞成功' : '取消点赞',
				icon: 'none',
				duration: 1500
			})
		} catch (error) {
			console.error('点赞操作失败:', error)
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none',
				duration: 2000
			})
		}
	}

	/**
	 * 切换收藏状态
	 */
		const toggleCollectAction = async () => {
		try {
			// 获取民宿ID，优先使用homestayId，其次使用id
			const homestayId = details.dt?.homestayId || details.dt?.id
			if (!details.dt || !homestayId) {
				uni.showToast({
					title: '数据异常',
					icon: 'none'
				})
				return
			}
			
			// 检查用户是否已登录
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			// 调用后端API
			const action = isCollected.value ? 'uncollect' : 'collect'
			console.log('收藏参数:', {
				homestayId: homestayId,
				action: action,
				token: token
			})
			await API.homestay.toggleCollect(homestayId, action)
			
			// 更新本地状态
			isCollected.value = !isCollected.value
			
			uni.showToast({
				title: isCollected.value ? '收藏成功' : '取消收藏',
				icon: 'none',
				duration: 1500
			})
			
		} catch (error) {
			console.error('收藏操作失败:', error)
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none',
				duration: 2000
			})
		}
	}
	
	/**
	 * 检查用户身份
	 */
	const checkUserIdentity = async () => {
		try {
			// 获取当前用户信息
			const userInfo = uni.getStorageSync('userInfo')
			
			if (userInfo) {
				const user = JSON.parse(userInfo)
				currentUserId.value = user.userId || user.id
			}
			
			// 如果本地存储中没有userId，尝试从后端获取
			if (!currentUserId.value) {
				console.log('本地存储中没有userId，尝试从后端获取用户信息')
				try {
					const userInfoResponse = await API.user.getInfo()
					console.log('getUserInfo API响应:', userInfoResponse)
					console.log('响应code字段:', userInfoResponse.code)
					console.log('响应data字段:', userInfoResponse.data)
					
					// 检查响应格式 - 后端返回的是 { code: 1, data: {...}, msg: "..." }
					if (userInfoResponse.code === 1 && userInfoResponse.data) {
						currentUserId.value = userInfoResponse.data.userId
						console.log('从后端获取到userId:', currentUserId.value)
						
						// 更新本地存储，避免下次重复请求
						const localUserInfo = uni.getStorageSync('userInfo')
						if (localUserInfo) {
							const user = JSON.parse(localUserInfo)
							user.userId = userInfoResponse.data.userId
							uni.setStorageSync('userInfo', JSON.stringify(user))
							console.log('已更新本地存储的userId')
						}
					} else {
						console.log('API响应格式不正确或数据为空')
						console.log('尝试直接使用响应数据:', userInfoResponse)
						// 尝试直接使用响应数据
						if (userInfoResponse.data && userInfoResponse.data.userId) {
							currentUserId.value = userInfoResponse.data.userId
							console.log('直接使用响应数据获取到userId:', currentUserId.value)
						}
					}
				} catch (error) {
					console.error('从后端获取用户信息失败:', error)
				}
			}
			
			// 调试信息
			console.log('详情页用户身份检查:', {
				currentUserId: currentUserId.value,
				detailUserId: details.dt.userId,
				detailAuthor: details.dt.author,
				detailId: details.dt.id
			})
			
			// 多种方式判断是否为当前用户发布的内容
			let isCurrentUserFlag = false
			
			// 方式1: 通过userId字段判断
			if (currentUserId.value && details.dt.userId) {
				isCurrentUserFlag = String(currentUserId.value) === String(details.dt.userId)
				console.log('通过userId判断结果:', isCurrentUserFlag)
			}
			
			// 方式2: 通过作者名称判断（作为备用方案）
			if (!isCurrentUserFlag && details.dt.author) {
				// 如果作者名称与当前用户昵称相同，也可能是当前用户
				const currentUserNickName = uni.getStorageSync('userInfo') ? JSON.parse(uni.getStorageSync('userInfo')).nickName : null
				if (currentUserNickName && details.dt.author === currentUserNickName) {
					isCurrentUserFlag = true
					console.log('通过作者名称判断结果:', isCurrentUserFlag)
				}
			}
			
			isCurrentUser.value = isCurrentUserFlag
			
			console.log('详情页用户身份检查完成:', {
				isCurrentUser: isCurrentUser.value,
				willShowFollowButton: !isCurrentUser.value
			})
		} catch (error) {
			console.error('检查用户身份失败:', error)
			// 出错时默认显示关注按钮
			isCurrentUser.value = false
		}
	}
	
	
	/**
	 * 切换关注状态
	 */
	const toggleFollowAction = async () => {
		try {
			// 检查用户是否已登录
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			// 检查是否有用户ID
			if (!details.dt.userId) {
				uni.showToast({
					title: '用户信息异常',
					icon: 'none'
				})
				return
			}
			
			// 调用关注API
			const action = isFollowing.value ? 'unfollow' : 'follow'
			await API.user.toggleFollow(details.dt.userId, action)
			
			// 更新本地状态
			isFollowing.value = !isFollowing.value
			
			uni.showToast({
				title: isFollowing.value ? '关注成功' : '取消关注',
				icon: 'none',
				duration: 1500
			})
			
		} catch (error) {
			console.error('关注操作失败:', error)
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none',
				duration: 2000
			})
		}
	}
	
	/**
	 * 获取主图（第一张图片）
	 */
	const getMainImage = () => {
		if (!details.dt) {
			return '/static/logo.png'
		}
		
		// 优先使用images数组的第一张图片
		if (details.dt.images && Array.isArray(details.dt.images) && details.dt.images.length > 0) {
			return details.dt.images[0]
		}
		
		// 如果没有images数组，使用单张img
		if (details.dt.img) {
			return details.dt.img
		}
		
		// 默认图片
		return '/static/logo.png'
	}
	
	/**
	 * 获取图片数量
	 */
	const getImageCount = () => {
		if (!details.dt) {
			return 0
		}
		
		// 优先使用images数组
		if (details.dt.images && Array.isArray(details.dt.images)) {
			return details.dt.images.length
		}
		
		// 如果有单张img，返回1
		if (details.dt.img) {
			return 1
		}
		
		return 0
	}
	
	/**
	 * 获取所有图片URL数组
	 */
	const getAllImages = () => {
		if (!details.dt) {
			return []
		}
		
		// 优先使用images数组
		if (details.dt.images && Array.isArray(details.dt.images) && details.dt.images.length > 0) {
			return details.dt.images
		}
		
		// 如果没有images数组，使用单张img
		if (details.dt.img) {
			return [details.dt.img]
		}
		
		return []
	}
	
	/**
	 * 轮播图变化事件
	 */
	const onSwiperChange = (e) => {
		currentImageIndex.value = e.detail.current
		console.log('轮播图切换到:', currentImageIndex.value)
	}
	
	/**
	 * 预览图片
	 */
	const previewImage = () => {
		try {
			const allImages = getAllImages()
			
			if (allImages.length === 0) {
				uni.showToast({
					title: '没有可预览的图片',
					icon: 'none'
				})
				return
			}
			
			// 使用uni-app的图片预览API
			uni.previewImage({
				urls: allImages, // 所有图片地址数组
				current: allImages[currentImageIndex.value], // 当前显示图片的地址
				success: () => {
					console.log('图片预览成功')
				},
				fail: (error) => {
					console.error('图片预览失败:', error)
					uni.showToast({
						title: '图片预览失败',
						icon: 'none'
					})
				}
			})
		} catch (error) {
			console.error('预览图片异常:', error)
			uni.showToast({
				title: '预览失败',
				icon: 'none'
			})
		}
	}
	
	/**
	 * 获取位置显示文本
	 * 只显示省市区县，如果为空就不显示
	 */
	const getLocationText = () => {
		if (!details.dt) {
			return ''
		}
		
		const locationParts = []
		
		// 添加省份
		if (details.dt.province) {
			locationParts.push(details.dt.province)
		}
		
		// 添加城市
		if (details.dt.city) {
			locationParts.push(details.dt.city)
		}
		
		// 添加区县
		if (details.dt.district) {
			locationParts.push(details.dt.district)
		}
		
		// 如果没有任何位置信息，返回空字符串
		if (locationParts.length === 0) {
			return ''
		}
		
		return locationParts.join('')
	}
	
	/**
	 * 检查登录状态
	 */
	const checkLoginStatus = () => {
		const token = uni.getStorageSync('token')
		if (!token) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再查看用户信息',
				showCancel: false,
				confirmText: '去登录',
				success: () => {
					uni.switchTab({
						url: '/pages/my/my'
					})
				}
			})
			return false
		}
		return true
	}

	/**
	 * 跳转到用户信息页
	 */
	const goToUserProfile = () => {
		try {
			// 检查登录状态
			if (!checkLoginStatus()) {
				return
			}
			
			// 检查是否有用户信息
			if (!details.dt.userId && !details.dt.author) {
				uni.showToast({
					title: '用户信息不完整',
					icon: 'none'
				})
				return
			}
			
			// 构建用户信息数据
			const userInfo = {
				userId: details.dt.userId,
				author: details.dt.author,
				nickname: details.dt.author,
				avatar: details.dt.avatar
			}
			
			// 编码用户信息
			const userInfoStr = encodeURIComponent(JSON.stringify(userInfo))
			
			// 跳转到用户信息页
			uni.navigateTo({
				url: `/pages/user-profile/user-profile?userInfo=${userInfoStr}`
			})
		} catch (error) {
			console.error('跳转用户信息页失败:', error)
			uni.showToast({
				title: '跳转失败',
				icon: 'none'
			})
		}
	}
	
</script>

<style lang="scss" scoped>
	.detail {
		background-color: #f5f5f5;
		height: 100vh;
		overflow: hidden;
	}

	.detail-container {
		position: relative;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 主图区域 */
	.hero-section {
		position: relative;
		height: 500rpx;
		overflow: hidden;

		.hero-swiper {
			width: 100%;
			height: 100%;
		}

		.hero-image {
			width: 100%;
			height: 100%;
			cursor: pointer;
			transition: transform 0.3s ease;
			
			&:active {
				transform: scale(0.98);
			}
		}
		
		.image-indicator {
			position: absolute;
			top: 20rpx;
			right: 20rpx;
			background: rgba(0, 0, 0, 0.6);
			padding: 8rpx 16rpx;
			border-radius: 20rpx;
			z-index: 10;
			
			.image-count {
				color: #fff;
				font-size: 24rpx;
				font-weight: 500;
			}
		}
	}

	/* 内容区域 */
	.content-section {
		background: #fff;
		margin-top: -30rpx;
		border-radius: 30rpx 30rpx 0 0;
		padding: 40rpx 30rpx 120rpx;
		position: relative;
		z-index: 10;
		flex: 1;
		overflow: hidden;
	}

	/* 标题区域 */
	.title-section {
		margin-bottom: 30rpx;

		.title-row {
			margin-bottom: 15rpx;

			.main-title {
				font-size: 40rpx;
				font-weight: 700;
				color: #333;
			}
		}

		.location-info {
			display: flex;
			align-items: center;
			gap: 8rpx;

			.location-text {
				font-size: 28rpx;
				color: #999;
			}
		}
	}

	/* 用户信息区域 */
	.user-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 0;
		margin-bottom: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.user-info {
			display: flex;
			align-items: center;
			gap: 20rpx;
			cursor: pointer;
			transition: all 0.3s ease;
			padding: 10rpx;
			border-radius: 12rpx;

			&:active {
				background-color: #f8f9fa;
				transform: scale(0.98);
			}

			.user-avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				border: 2rpx solid #f0f0f0;
				transition: all 0.3s ease;
			}

			.user-details {
				display: flex;
				flex-direction: column;
				gap: 8rpx;

				.user-name {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
				}

				.user-label {
					font-size: 24rpx;
					color: #999;
					background-color: #f8f9fa;
					padding: 4rpx 12rpx;
					border-radius: 12rpx;
					border: 1rpx solid #e9ecef;
				}
			}
		}

		.follow-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20rpx 36rpx;
			background: #f8f9fa;
			color: #495057;
			border: 2rpx solid transparent;
			border-radius: 40rpx;
			font-size: 26rpx;
			font-weight: 600;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			height: 60rpx;
			min-width: 100rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
			position: relative;
			overflow: hidden;
			margin-right: 20rpx;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-radius: 50rpx;
				opacity: 0;
				transition: opacity 0.3s ease;
			}

			&.followed {
				background: #667eea;
				color: #fff;
				border-color: #667eea;
				box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.2);
				transform: none;

				&::before {
					opacity: 0;
				}
			}

			&:not(.followed):hover {
				background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
				transform: translateY(-1rpx);
				box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.12);
			}

			&:active {
				transform: scale(0.96) translateY(0);
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
			}

			text {
				position: relative;
				z-index: 1;
			}
		}
	}

	/* 基本信息 */
	.info-section {
		background: #f8f9fa;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		display: flex;
		justify-content: space-around;

		.info-item {
			text-align: center;

			.info-label {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 8rpx;
			}

			.info-value {
				font-size: 28rpx;
				font-weight: 600;
				color: #333;
			}

			.price-value {
				display: flex;
				align-items: baseline;
				justify-content: center;

				.price-symbol {
					font-size: 28rpx;
					font-weight: 600;
					color: #333;
					margin-right: 4rpx;
				}

				.price-number {
					font-size: 28rpx;
					font-weight: 600;
					color: #333;
				}
			}
		}
	}

	/* 通用标题 */
	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
	}

	/* 特色标签区域 */
	.tags-section {
		margin-bottom: 30rpx;

		.tags-list {
			display: flex;
			flex-wrap: wrap;
			gap: 15rpx;

			.tag-item {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				padding: 12rpx 24rpx;
				border-radius: 20rpx;
				font-size: 24rpx;
				font-weight: 500;
				box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
				transition: all 0.3s ease;
				
				&:hover {
					transform: translateY(-2rpx);
					box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
				}
			}
		}
	}

	/* 介绍区域 */
	.description-section {
		flex: 1;
		overflow: hidden;

		.description-content {
			font-size: 28rpx;
			color: #666;
			line-height: 1.6;
			height: 100%;
			overflow: hidden;
		}
	}


	/* 底部操作栏 */
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 20rpx 30rpx;
		display: flex;
		gap: 15rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 1000;

		.contact-btn {
			flex: 1;
			height: 80rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
			border: none;
			border-radius: 40rpx;
			font-size: 28rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.95);
			}
		}

		.like-btn {
			flex: 1;
			height: 80rpx;
			background: #f8f9fa;
			color: #999;
			border: 2rpx solid #e9ecef;
			border-radius: 40rpx;
			font-size: 26rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.95);
			}
		}

		.collect-btn {
			flex: 1;
			height: 80rpx;
			background: #f8f9fa;
			color: #999;
			border: 2rpx solid #e9ecef;
			border-radius: 40rpx;
			font-size: 26rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.95);
			}
		}
	}
</style>