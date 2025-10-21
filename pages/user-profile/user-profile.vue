<template>
	<view class="user-profile">
		<!-- 用户信息头部 - 置顶显示 -->
		<view class="user-header sticky-header">
			<view class="user-info">
				<image 
					:src="userInfo.avatar || '/static/unnamed.jpg'" 
					mode="aspectFill" 
					class="user-avatar"
				></image>
				<view class="user-details">
					<text class="user-name">{{ userInfo.nickname || '未知用户' }}</text>
				</view>
			</view>
			<!-- 关注按钮 - 只有非当前用户才显示 -->
			<button 
				v-if="!isCurrentUser" 
				class="follow-btn" 
				:class="{ 'followed': isFollowing }"
				@click="toggleFollowAction"
			>
				<text>{{ isFollowing ? '已关注' : '关注' }}</text>
			</button>
		</view>

		<!-- 用户发布的民宿列表 -->
		<view class="homestay-list">
			<view class="section-title">
				<view class="title-left">
					<text>发布的民宿</text>
					<text class="count-text">({{ homestayList.length }}个)</text>
				</view>
				<!-- 单双行切换按钮 -->
				<view class="layout-toggle" @click="toggleLayout">
					<up-icon :name="isSingleColumn ? 'grid' : 'list'" size="24" color="#999"></up-icon>
				</view>
			</view>
			
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-container">
				<up-loading-icon mode="circle" size="40"></up-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			
			<!-- 空状态 -->
			<view v-else-if="homestayList.length === 0" class="empty-container">
				<up-icon name="home" color="#ccc" size="80"></up-icon>
				<text class="empty-text">该用户还没有发布任何民宿</text>
			</view>
			
			<!-- 双排瀑布流布局 -->
			<up-waterfall 
				v-else-if="!isSingleColumn && homestayList.length > 0" 
				v-model="homestayList" 
				ref="uWaterfallRef" 
				:add-time="200" 
				:columns="2" 
				:min-column-width="300" 
				:column-gap="20" 
				:show-scrollbar="false"
				:id-key="'id'"
			>
				<template v-slot:left="{leftList}">
					<view class="post-card" v-for="(item,index) in leftList" :key="index" @click="goToDetail(item)">
						<!-- 帖子图片 -->
						<view class="post-image">
							<image :src="getMainImage(item)" mode="widthFix" class="post-img"></image>
							<!-- 位置信息 -->
							<view class="location-overlay" v-if="item.city || item.location">
								<up-icon name="map" size="14" color="#fff"></up-icon>
								<text class="location-text">
									{{ item.city || item.location }}
								</text>
							</view>
						</view>
						
						<!-- 帖子内容 -->
						<view class="post-content">
							<view class="post-title">{{item.title}}</view>
							<view class="post-summary" v-if="item.introduce">{{item.introduce}}</view>
							
							<!-- 价格和基本信息 -->
							<view class="post-info">
								<view class="price-tag">
									<text class="price-symbol">¥</text>
									<text class="price-number">{{formatPrice(item.price)}}</text>
								</view>
								<!-- 点赞收藏统计 -->
								<view class="interaction-stats">
									<view class="stat-item">
										<up-icon name="heart-fill" size="14" color="#ff4757"></up-icon>
										<text class="stat-count">{{item.likeCount || 0}}</text>
									</view>
									<view class="stat-item">
										<up-icon name="eye" size="14" color="#999"></up-icon>
										<text class="stat-count">{{item.viewCount || 0}}</text>
									</view>
								</view>
							</view>
							
							<!-- 用户信息和互动 -->
							<view class="post-footer">
								<view class="user-info">
									<view class="avatar">
										<image :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
									</view>
									<view class="user-details">
										<text class="username">{{userInfo.nickname || '未知用户'}}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</template>
				
				<template v-slot:right="{rightList}">
					<view class="post-card" v-for="(item,index) in rightList" :key="index" @click="goToDetail(item)">
						<!-- 帖子图片 -->
						<view class="post-image">
							<image :src="getMainImage(item)" mode="widthFix" class="post-img"></image>
							<!-- 位置信息 -->
							<view class="location-overlay" v-if="item.city || item.location">
								<up-icon name="map" size="14" color="#fff"></up-icon>
								<text class="location-text">
									{{ item.city || item.location }}
								</text>
							</view>
						</view>
						
						<!-- 帖子内容 -->
						<view class="post-content">
							<view class="post-title">{{item.title}}</view>
							<view class="post-summary" v-if="item.introduce">{{item.introduce}}</view>
							
							<!-- 价格和基本信息 -->
							<view class="post-info">
								<view class="price-tag">
									<text class="price-symbol">¥</text>
									<text class="price-number">{{formatPrice(item.price)}}</text>
								</view>
								<!-- 点赞收藏统计 -->
								<view class="interaction-stats">
									<view class="stat-item">
										<up-icon name="heart-fill" size="14" color="#ff4757"></up-icon>
										<text class="stat-count">{{item.likeCount || 0}}</text>
									</view>
									<view class="stat-item">
										<up-icon name="eye" size="14" color="#999"></up-icon>
										<text class="stat-count">{{item.viewCount || 0}}</text>
									</view>
								</view>
							</view>
							
							<!-- 用户信息和互动 -->
							<view class="post-footer">
								<view class="user-info">
									<view class="avatar">
										<image :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
									</view>
									<view class="user-details">
										<text class="username">{{userInfo.nickname || '未知用户'}}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</template>
			</up-waterfall>
			
			<!-- 单排列表布局 -->
			<view v-else class="single-column-list">
				<view 
					v-for="(item, index) in homestayList" 
					:key="item.homestayId || item.id || index"
					class="single-card"
					@click="goToDetail(item)"
				>
					<!-- 上半部分：图片和内容 -->
					<view class="single-top">
						<!-- 左侧图片区域 -->
						<view class="single-image">
							<image :src="getMainImage(item)" mode="aspectFill" class="single-img"></image>
							<!-- 位置信息覆盖在图片上 -->
							<view class="location-overlay" v-if="item.city || item.location">
								<up-icon name="map" size="14" color="#fff"></up-icon>
								<text class="location-text">{{ item.city || item.location }}</text>
							</view>
						</view>
						
						<!-- 右侧内容区域 -->
						<view class="single-content">
							<!-- 标题 -->
							<view class="single-title">{{ item.title }}</view>
							
							<!-- 详细信息 -->
							<view class="single-details" v-if="item.introduce">{{ item.introduce }}</view>
							
							<!-- 底部三个元素：金额、喜欢、收藏 -->
							<view class="single-actions">
								<view class="action-item">
									<text class="action-value price-value">¥{{ formatPrice(item.price) }}</text>
								</view>
								<view class="action-item">
									<up-icon name="heart-fill" size="16" color="#ff4757"></up-icon>
									<text class="action-value">{{ item.likeCount || 0 }}</text>
								</view>
								<view class="action-item">
									<up-icon name="eye" size="16" color="#999"></up-icon>
									<text class="action-value">{{ item.viewCount || 0 }}</text>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 底部用户信息区域 -->
					<view class="single-footer">
						<view class="single-avatar">
							<image :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
						</view>
						<view class="single-username">{{ userInfo.nickname || '未知用户' }}</view>
						<view class="single-views">
							<up-icon name="eye" size="14" color="#999"></up-icon>
							<text class="views-text">{{ item.viewCount || 0 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 用户信息页面
	 * 功能描述：展示用户头像、昵称和该用户发布的所有民宿信息
	 * 主要功能：用户信息展示、关注功能、民宿列表展示
	 */

	// 导入uni-app生命周期钩子
	import {
		onLoad,
		onPullDownRefresh
	} from '@dcloudio/uni-app'
	
	// 导入Vue响应式API
	import {
		ref,
		reactive
	} from 'vue'
	
	// 导入价格格式化工具
	import { formatPrice } from '../../utils/priceFormatter.js'
	
	// 导入API接口
	// 导入API接口 - 使用新的统一API
	import { API } from '../../api'

	// 响应式数据定义
	const userInfo = reactive({
		userId: '',
		nickname: '',
		avatar: ''
	})
	
	const homestayList = ref([]) // 用户发布的民宿列表
	const loading = ref(false) // 加载状态
	const isFollowing = ref(false) // 关注状态
	const isCurrentUser = ref(false) // 是否为当前用户
	const currentUserId = ref(null) // 当前用户ID
	const isSingleColumn = ref(false) // 是否为单列布局
	const uWaterfallRef = ref(null) // 瀑布流组件引用
	
	/**
	 * 页面加载时获取数据
	 * @param {object} opt - 页面参数
	 */
	onLoad(async (opt) => {
		await loadUserData(opt)
	})
	
	/**
	 * 下拉刷新处理
	 */
	onPullDownRefresh(async () => {
		console.log('🔄 用户触发下拉刷新')
		try {
			// 重新加载用户数据
			await loadUserData({
				userInfo: encodeURIComponent(JSON.stringify({
					userId: userInfo.userId,
					nickname: userInfo.nickname,
					avatar: userInfo.avatar
				}))
			})
			
			// 显示刷新成功提示
			uni.showToast({
				title: '刷新成功',
				icon: 'success',
				duration: 1500
			})
			
		} catch (error) {
			console.error('❌ 下拉刷新失败:', error)
			uni.showToast({
				title: '刷新失败，请重试',
				icon: 'none',
				duration: 2000
			})
		} finally {
			// 停止下拉刷新动画
			uni.stopPullDownRefresh()
		}
	})
	
	/**
	 * 加载用户数据
	 * @param {object} opt - 页面参数
	 */
	const loadUserData = async (opt) => {
		try {
			loading.value = true
			
			// 解析传入的用户数据
			if (!opt.userInfo) {
				uni.showToast({
					title: '用户信息缺失',
					icon: 'none'
				})
				uni.navigateBack()
				return
			}
			
			const userData = JSON.parse(decodeURIComponent(opt.userInfo))
			console.log('用户信息:', userData)
			
			// 设置用户信息
			userInfo.userId = userData.userId || userData.id
			userInfo.nickname = userData.author || userData.nickname
			userInfo.avatar = userData.avatar
			
			console.log('设置的用户信息:', {
				userId: userInfo.userId,
				nickname: userInfo.nickname,
				avatar: userInfo.avatar
			})
			
			// 检查是否为当前用户
			await checkUserIdentity()
			
			// 获取用户发布的民宿列表
			await loadUserHomestays()
			
		} catch (error) {
			console.error('加载用户数据失败:', error)
			uni.showToast({
				title: '数据加载失败',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}
	
	/**
	 * 检查用户身份
	 */
	const checkUserIdentity = async () => {
		try {
			// 获取当前用户信息
			const currentUserInfo = uni.getStorageSync('userInfo')
			
			if (currentUserInfo) {
				const currentUser = JSON.parse(currentUserInfo)
				currentUserId.value = currentUser.userId || currentUser.id
			}
			
			// 调试信息
			console.log('用户身份检查:', {
				currentUserId: currentUserId.value,
				profileUserId: userInfo.userId,
				profileNickname: userInfo.nickname,
				currentUserInfo: currentUserInfo
			})
			
			// 多种方式判断是否为当前用户
			let isCurrentUserFlag = false
			
			// 方式1: 通过userId字段判断
			if (currentUserId.value && userInfo.userId) {
				isCurrentUserFlag = String(currentUserId.value) === String(userInfo.userId)
				console.log('通过userId判断结果:', isCurrentUserFlag)
			}
			
			// 方式2: 通过昵称判断（作为备用方案）
			if (!isCurrentUserFlag && userInfo.nickname) {
				// 如果昵称与当前用户昵称相同，也可能是当前用户
				const currentUserNickName = currentUserInfo ? JSON.parse(currentUserInfo).nickName || JSON.parse(currentUserInfo).nickname : null
				if (currentUserNickName && userInfo.nickname === currentUserNickName) {
					isCurrentUserFlag = true
					console.log('通过昵称判断结果:', isCurrentUserFlag)
				}
			}
			
			isCurrentUser.value = isCurrentUserFlag
			
			console.log('用户身份检查完成:', {
				isCurrentUser: isCurrentUser.value,
				willShowFollowButton: !isCurrentUser.value
			})
			
			// 如果不是当前用户，检查关注状态
			if (!isCurrentUser.value && userInfo.userId) {
				await checkFollowStatus()
			}
		} catch (error) {
			console.error('检查用户身份失败:', error)
			// 出错时默认显示关注按钮
			isCurrentUser.value = false
		}
	}
	
	/**
	 * 检查关注状态
	 */
	const checkFollowStatus = async () => {
		try {
			console.log('🔍 开始检查关注状态，用户ID:', userInfo.userId)
			
			// 调用API检查关注状态（最可靠的方法）
			if (userInfo.userId) {
				console.log('🌐 调用API检查关注状态...')
				const result = await API.user.checkFollowStatus(userInfo.userId)
				console.log('📡 API响应:', result)
				
				if (result && result.code === 1 && result.data !== undefined) {
					// 后端直接返回boolean值，不需要.isFollowing
					isFollowing.value = result.data || false
					console.log('✅ API检查关注状态成功:', isFollowing.value)
					return
				} else {
					console.warn('⚠️ API检查关注状态失败，使用默认值')
				}
			}
			
			// 默认设置为false
			isFollowing.value = false
			console.log('❌ 使用默认关注状态:', isFollowing.value)
		} catch (error) {
			console.error('❌ 检查关注状态失败:', error)
			isFollowing.value = false
		}
	}
	
	/**
	 * 加载用户发布的民宿列表
	 */
	const loadUserHomestays = async () => {
		try {
			if (!userInfo.userId) {
				console.warn('用户ID不存在，无法加载民宿列表')
				return
			}
			
			console.log('开始加载用户民宿列表:', userInfo.userId)
			console.log('调用API: getUserHomestays')
			console.log('API参数:', { userId: userInfo.userId, page: 1, size: 20 })
			const response = await API.user.getUserList(userInfo.userId, { page: 1, size: 20 })
			console.log('API响应:', response)
			
			if (response && response.code === 1) {
				// 处理分页数据结构
				const pageData = response.data
				console.log('分页数据:', pageData)
				if (pageData && pageData.list) {
					homestayList.value = pageData.list
					console.log('用户民宿列表加载成功:', homestayList.value.length, '条，总计:', pageData.total, '条')
				} else {
					homestayList.value = []
					console.warn('用户民宿列表为空 - 分页数据中没有list字段')
				}
			} else {
				console.warn('用户民宿列表为空 - API返回code不是1:', response?.code)
				homestayList.value = []
			}
		} catch (error) {
			console.error('加载用户民宿列表失败:', error)
			homestayList.value = []
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
			if (!userInfo.userId) {
				uni.showToast({
					title: '用户信息异常',
					icon: 'none'
				})
				return
			}
			
			// 调用关注API
			const action = isFollowing.value ? 'unfollow' : 'follow'
			await API.user.toggleFollow(userInfo.userId, action)
			
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
	 * 跳转到详情页
	 * @param {object} item - 民宿数据
	 */
	const goToDetail = (item) => {
		try {
			const itemData = encodeURIComponent(JSON.stringify(item))
			uni.navigateTo({
				url: `/pages/detail/detail?item=${itemData}`
			})
		} catch (error) {
			console.error('跳转详情页失败:', error)
			uni.showToast({
				title: '跳转失败',
				icon: 'none'
			})
		}
	}
	
	/**
	 * 获取主图（第一张图片）
	 * @param {object} item - 民宿数据
	 * @returns {string} 图片URL
	 */
	const getMainImage = (item) => {
		// 优先使用images数组的第一张图片
		if (item.images && Array.isArray(item.images) && item.images.length > 0) {
			return item.images[0]
		}
		
		// 如果没有images数组，使用单张img
		if (item.img) {
			return item.img
		}
		
		// 默认图片
		return '/static/logo.png'
	}
	
	/**
	 * 获取位置文本
	 * @param {object} item - 民宿数据
	 * @returns {string} 位置文本
	 */
	const getLocationText = (item) => {
		if (item.province && item.city && item.district) {
			return `${item.province}${item.city}`
		}
		return item.location || '位置未知'
	}
	
	/**
	 * 切换布局（单排/双排）
	 */
	const toggleLayout = () => {
		console.log('🔄 切换布局，当前状态:', isSingleColumn.value)
		isSingleColumn.value = !isSingleColumn.value
		console.log('🔄 切换后状态:', isSingleColumn.value)
		
		// 显示切换提示
		uni.showToast({
			title: isSingleColumn.value ? '已切换到单排' : '已切换到双排',
			icon: 'none',
			duration: 1500
		})
	}
</script>

<style lang="scss" scoped>
	.user-profile {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* 用户信息头部 */
	.user-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 40rpx 30rpx 60rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		
		&.sticky-header {
			position: sticky;
			top: 0;
			z-index: 100;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		}

		.user-info {
			display: flex;
			align-items: center;
			gap: 30rpx;

			.user-avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				border: 4rpx solid rgba(255, 255, 255, 0.3);
				box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
			}

			.user-details {
				display: flex;
				flex-direction: column;
				gap: 12rpx;

				.user-name {
					font-size: 36rpx;
					font-weight: 700;
					color: #fff;
					text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
				}

				.user-label {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.8);
					background-color: rgba(255, 255, 255, 0.2);
					padding: 8rpx 16rpx;
					border-radius: 20rpx;
					border: 1rpx solid rgba(255, 255, 255, 0.3);
					backdrop-filter: blur(10rpx);
				}
			}
		}

		.follow-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20rpx 36rpx;
			background: rgba(255, 255, 255, 0.2);
			color: #fff;
			border: 2rpx solid rgba(255, 255, 255, 0.3);
			border-radius: 40rpx;
			font-size: 26rpx;
			font-weight: 600;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			height: 60rpx;
			min-width: 100rpx;
			backdrop-filter: blur(10rpx);

			&.followed {
				background: rgba(255, 255, 255, 0.9);
				color: #667eea;
				border-color: rgba(255, 255, 255, 0.9);
			}

			&:active {
				transform: scale(0.95);
			}
		}
	}

	/* 民宿列表区域 */
	.homestay-list {
		background: #fff;
		margin-top: -30rpx;
		border-radius: 30rpx 30rpx 0 0;
		padding: 40rpx 30rpx;
		position: relative;
		z-index: 10;
		min-height: calc(100vh - 200rpx);

		.section-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 30rpx;
			
			.title-left {
				display: flex;
				align-items: center;
				gap: 10rpx;
				
				.count-text {
					font-size: 24rpx;
					color: #999;
					font-weight: 400;
				}
			}
			
			.layout-toggle {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 60rpx;
				height: 60rpx;
				// border-radius: 50%;
				// background-color: #f8f9fa;
				// border: 2rpx solid #e9ecef;
				transition: all 0.3s ease;
				
				&:active {
					transform: scale(0.95);
					background-color: #e9ecef;
				}
			}
		}
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
		gap: 20rpx;

		.loading-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	/* 空状态 */
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 0;
		gap: 30rpx;

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	/* 民宿网格 */
	.homestay-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
	}

	.homestay-item {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
		}

		.item-image-container {
			position: relative;
			height: 200rpx;
			overflow: hidden;

			.item-image {
				width: 100%;
				height: 100%;
			}

			.price-tag {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				background: rgba(0, 0, 0, 0.7);
				padding: 6rpx 12rpx;
				border-radius: 12rpx;

				.price-text {
					color: #fff;
					font-size: 22rpx;
					font-weight: 600;
				}
			}
		}

		.item-content {
			padding: 20rpx;

			.item-title {
				font-size: 28rpx;
				font-weight: 600;
				color: #333;
				line-height: 1.4;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				line-clamp: 2;
				overflow: hidden;
				margin-bottom: 12rpx;
			}

			.item-location {
				display: flex;
				align-items: center;
				gap: 6rpx;
				margin-bottom: 12rpx;

				.location-text {
					font-size: 22rpx;
					color: #999;
				}
			}

			.item-stats {
				display: flex;
				align-items: center;
				gap: 20rpx;

				.stat-item {
					display: flex;
					align-items: center;
					gap: 6rpx;

					.stat-text {
						font-size: 20rpx;
						color: #999;
					}
				}
			}
		}
	}
	
	/* 单排列表布局样式 */
	.single-column-list {
		padding: 0;
		
		.single-card {
			background-color: #fff;
			border-radius: 20rpx;
			margin-bottom: 20rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
			transition: all 0.3s ease;
			
			&:active {
				transform: scale(0.98);
			}
			
			.single-top {
				display: flex;
				
				.single-image {
					width: 300rpx;
					min-height: 200rpx;
					border-radius: 12rpx;
					overflow: hidden;
					flex-shrink: 0;
					position: relative;
					display: flex;
					align-items: stretch;
					
					.single-img {
						width: 100%;
						height: 100%;
						object-fit: cover;
					}

					.location-overlay {
						position: absolute;
						bottom: 8rpx;
						left: 8rpx;
						display: flex;
						align-items: center;
						gap: 6rpx;
						background: rgba(0, 0, 0, 0.6);
						padding: 6rpx 12rpx;
						border-radius: 12rpx;
						backdrop-filter: blur(4rpx);
						max-width: calc(100% - 16rpx);

						.location-text {
							font-size: 22rpx;
							color: #fff;
							font-weight: 500;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}
				}
				
				.single-content {
					flex: 1;
					padding: 20rpx;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					
					.single-title {
						font-size: 32rpx;
						font-weight: 600;
						color: #333;
						margin-bottom: 8rpx;
						line-height: 1.4;
					}
					
					.single-details {
						font-size: 26rpx;
						color: #666;
						line-height: 1.5;
						margin-bottom: 16rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						line-clamp: 2;
						overflow: hidden;
					}
					
					.single-actions {
						display: flex;
						justify-content: space-between;
						
						.action-item {
							display: flex;
							flex-direction: column;
							align-items: center;
							justify-content: center;
							flex: 1;
							gap: 8rpx;
							
							&:nth-child(2), &:nth-child(3) {
								flex-direction: row;
								gap: 6rpx;
							}
							
							.action-value {
								font-size: 26rpx;
								color: #333;
								font-weight: 600;
							}
							
							.price-value {
								color: #ff4757;
								font-weight: 700;
								font-size: 36rpx;
							}
						}
					}
				}
			}
			
			.single-footer {
				display: flex;
				align-items: center;
				padding: 20rpx;
				border-top: 1rpx solid #f5f5f5;
				background-color: #fafafa;
				
				.single-avatar {
					width: 40rpx;
					height: 40rpx;
					border-radius: 50%;
					overflow: hidden;
					margin-right: 12rpx;
					
					image {
						width: 100%;
						height: 100%;
					}
				}
				
				.single-username {
					flex: 1;
					font-size: 24rpx;
					color: #333;
					font-weight: 500;
				}
				
				.single-views {
					display: flex;
					align-items: center;
					gap: 4rpx;
					
					.views-text {
						font-size: 22rpx;
						color: #999;
					}
				}
			}
		}
	}
	
	/* 瀑布流卡片样式 */
	.post-card {
		background-color: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		position: relative;
		transition: all 0.3s ease;
		width: 100%;
		max-width: 100%;
		display: flex;
		flex-direction: column;

		&:active {
			transform: scale(0.98);
		}

		.post-image {
			width: 100%;
			position: relative;
			overflow: hidden;

			.post-img {
				width: 100%;
				height: auto;
				display: block;
				object-fit: cover;
			}

			.location-overlay {
				position: absolute;
				bottom: 12rpx;
				left: 12rpx;
				display: flex;
				align-items: center;
				gap: 6rpx;
				background: rgba(0, 0, 0, 0.6);
				padding: 6rpx 12rpx;
				border-radius: 20rpx;
				backdrop-filter: blur(4rpx);

				.location-text {
					font-size: 22rpx;
					color: #fff;
					font-weight: 500;
				}
			}
		}

		.post-content {
			padding: 20rpx;
			flex: 1;
			display: flex;
			flex-direction: column;

			.post-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				line-height: 1.4;
				margin-bottom: 10rpx;
				overflow: hidden;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.post-summary {
				font-size: 28rpx;
				color: #666;
				line-height: 1.5;
				margin-bottom: 15rpx;
				overflow: hidden;
				display: -webkit-box;
				-webkit-line-clamp: 3;
				line-clamp: 3;
				-webkit-box-orient: vertical;
			}

			.post-info {
				margin-bottom: 15rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.price-tag {
					display: flex;
					align-items: baseline;
					
					.price-symbol {
						font-size: 24rpx;
						font-weight: 500;
						color: #ff4757;
						margin-right: 2rpx;
					}
					
					.price-number {
						font-size: 36rpx;
						font-weight: 700;
						color: #ff4757;
					}
				}

				.interaction-stats {
					display: flex;
					gap: 15rpx;

					.stat-item {
						display: flex;
						align-items: center;
						gap: 4rpx;

						.stat-count {
							font-size: 22rpx;
							color: #999;
							font-weight: 500;
						}
					}
				}
			}

			.post-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.user-info {
					display: flex;
					align-items: center;
					gap: 12rpx;
					flex: 1;

					.avatar {
						width: 48rpx;
						height: 48rpx;
						border-radius: 50%;
						overflow: hidden;
						background-color: #f0f0f0;

						image {
							width: 100%;
							height: 100%;
						}
					}

					.user-details {
						display: flex;
						flex-direction: column;
						gap: 4rpx;
						flex: 1;
					}

					.username {
						font-size: 18rpx;
						color: #666;
						font-weight: 500;
					}
				}
			}
		}
	}
</style>

