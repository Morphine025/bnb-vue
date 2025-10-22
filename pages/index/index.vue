<template>
	<!-- 首页主容器 -->
	<view class="social-forum">
		<!-- 头部搜索组件 -->
		<HeaderSearch />

		<!-- 内容区域 - 支持下拉刷新 -->
		<scroll-view 
			class="content-area" 
			scroll-y="true"
			:scroll-top="toTopRef?.scrollTop || 0"
			:refresher-enabled="true"
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresherRefresh"
			@scroll="onScrollViewScroll"
			@scrolltolower="loadMore"
		>
			<!-- 轮播图组件 -->
			<BannerCarousel :bannerList="bannerList" />
			
			<!-- 筛选栏 - 地址选择和布局切换 -->
			<view class="filter-bar">
				<!-- 地址选择器 -->
				<view class="filter-item address-filter" @click="showAddressPicker">
					<up-icon name="arrow-down" size="12" color="#999"></up-icon>
					<text class="filter-text">{{ selectedAddress || '全国' }}</text>
				</view>
				<!-- 布局切换按钮 -->
				<view class="filter-item layout-toggle" @click="toggleLayout">
					<up-icon :name="isSingleColumn ? 'grid' : 'list'" size="24" color="#999"></up-icon>
				</view>
			</view>
			
			<!-- 民宿列表 -->
			<HomestayList 
				:list="fallList"
				:is-single-column="isSingleColumn"
				:is-loading="isLoading"
				empty-text="当前城市暂无信息"
				@loadmore="loadMore"
				@item-click="goDetail"
				@image-error="handleImageError"
			/>
		</scroll-view>
		<!-- 地址选择器组件 -->
		<AddressPicker 
			:show="showAddressPickerPopup"
			:selected-address="selectedAddress"
			@confirm="handleAddressConfirm"
			@close="closeAddressPicker"
		/>
		
		<!-- 回到顶部组件 -->
		<ToTop ref="toTopRef" />
	</view>
</template>

<script setup>
/**
 * 首页组件 - 民宿展示首页
 * 
 * 主要功能：
 * 1. 轮播图展示 - 支持自动播放、指示器、点击事件
 * 2. 民宿列表展示 - 支持瀑布流和单列布局切换
 * 3. 地址筛选 - 支持省市区三级联动选择
 * 4. 搜索功能 - 跳转到搜索页面
 * 5. 下拉刷新和上拉加载 - 支持数据刷新和分页加载
 * 6. 缓存管理 - 智能缓存策略，提升用户体验
 * 7. 布局管理 - 用户偏好记忆，支持单列/双列切换
 * 8. 图片处理 - 智能图片URL转换和错误处理
 * 
 * 技术特点：
 * - 使用Vue 3 Composition API
 * - 集成Pinia状态管理
 * - 支持响应式布局
 * - 优化性能的虚拟滚动
 * - 智能缓存策略
 */

// ==================== 导入模块 ====================

// 导入API接口
import { API } from '../../api'

// 导入组件
import HomestayList from '../../components/HomestayList/index.vue'

// 导入uni-app生命周期钩子
import {
	onLoad,      // 页面加载
	onShow       // 页面显示
} from '@dcloudio/uni-app'

// 导入Vue响应式API
import {
	ref,        // 响应式引用
	computed,   // 计算属性
	watch       // 监听器
} from 'vue'

// 导入Pinia状态管理
import { 
	useHomestayStore,  // 民宿数据管理
	useCacheStore      // 缓存管理
} from '../../stores'

// 导入工具函数
import { convertToHttps } from '@/utils/security/urlConverter'  // URL安全转换

// 导入组件
import HeaderSearch from './components/HeaderSearch.vue'
import BannerCarousel from './components/BannerCarousel.vue'
import AddressPicker from './components/AddressPicker.vue'
import ToTop from '../../components/ToTop.vue'


// ==================== 状态管理 ====================

// 使用模块化Store
const homestayListStore = useHomestayStore()  // 民宿数据管理
const cacheStore = useCacheStore()            // 缓存管理


// ==================== 响应式数据定义 ====================

/**
 * 轮播图相关数据
 */
const bannerList = ref([])                    // 轮播图数据列表

/**
 * UI状态管理
 */
const isSingleColumn = ref(false)            // 是否为单列布局（false=瀑布流，true=单列）
const isRefreshing = ref(false)              // 是否正在下拉刷新
const toTopRef = ref(null)                   // 回到顶部组件引用

/**
 * 地址选择相关状态
 */
const selectedAddress = ref('')               // 当前选中的地址文本
const showAddressPickerPopup = ref(false)    // 是否显示地址选择器弹窗

// ==================== 计算属性 ====================

/**
 * 民宿列表数据
 * 从Store获取处理后的民宿数据，包含图片URL转换等处理
 */
const fallList = computed(() => {
	const data = homestayListStore.processedHomestayList || []
	return data
})

/**
 * 加载状态管理
 */
const isLoading = computed(() => homestayListStore.isLoading)    // 是否正在加载数据
const hasMore = computed(() => homestayListStore.hasMore)        // 是否还有更多数据可加载


// ==================== 布局管理 ====================

/**
 * 从本地存储读取用户布局偏好
 * 用户可以选择单列或双列瀑布流布局，偏好会被记住
 */
const loadLayoutPreference = () => {
	try {
		const saved = uni.getStorageSync('layout_preference')
		if (saved !== null && saved !== undefined) {
			isSingleColumn.value = saved
		}
	} catch (error) {
		console.error('读取布局偏好失败:', error)
	}
}

/**
 * 保存用户布局偏好到本地存储
 * 记住用户的选择，下次打开应用时自动恢复
 */
const saveLayoutPreference = () => {
	try {
		uni.setStorageSync('layout_preference', isSingleColumn.value)
	} catch (error) {
		console.error('保存布局偏好失败:', error)
	}
}

/**
 * 切换布局模式
 * 在单列列表和双列瀑布流之间切换，并保存用户偏好
 */
const toggleLayout = () => {
	isSingleColumn.value = !isSingleColumn.value
	saveLayoutPreference()
}


// ==================== 地址选择功能 ====================

/**
 * 显示地址选择器弹窗
 * 打开省市区三级联动选择器
 */
const showAddressPicker = () => {
	showAddressPickerPopup.value = true
}

/**
 * 关闭地址选择器弹窗
 */
const closeAddressPicker = () => {
	showAddressPickerPopup.value = false
}

/**
 * 处理地址选择确认事件
 * 根据选择的地址更新筛选条件，清除缓存并刷新数据
 * @param {Object} data - 地址数据对象，包含address、cityName等字段
 */
const handleAddressConfirm = async (data) => {
	console.log('🎯 地址选择确认:', data)
	selectedAddress.value = data.address
	
	// 根据选择的地址更新筛选条件
	if (data.address === '全国') {
		// 选择全国时，清除location筛选条件
		homestayListStore.setFilterConditions({
			location: ''
		})
		console.log('🌍 选择全国，清除地区筛选')
	} else {
		// 选择具体地区时，使用城市名称进行筛选
		const cityName = data.cityName || data.city?.name || data.address
		homestayListStore.setFilterConditions({
			location: cityName
		})
		console.log('📍 选择具体地区:', cityName)
	}
	
	console.log('📍 更新筛选条件:', homestayListStore.filterConditions)
	
	// 强制清除所有相关缓存，避免缓存污染
	homestayListStore.clearHomestayList()
	homestayListStore.clearCache()
	
	// 额外清除页面级别的缓存
	cacheStore.clearCacheByDataType('homestay-list')
	cacheStore.clearCacheByDataType('banner')
	
	// 强制刷新页面数据
	console.log('🔄 开始强制刷新民宿列表...')
	await homestayListStore.refreshHomestayList()
	console.log('✅ 民宿列表刷新完成，当前数据:', homestayListStore.homestayList.length, '条')
	
	closeAddressPicker()
}

// ==================== 数据加载功能 ====================

/**
 * 加载民宿列表数据
 * 从Store加载民宿数据，支持缓存策略
 */
const loadHomestayList = async () => {
	try {
		await homestayListStore.loadMoreHomestays()
	} catch (error) {
		console.error('加载民宿列表失败:', error)
	}
}

/**
 * 加载更多数据（触底加载）
 * 当用户滚动到底部时自动触发，支持防重复加载
 */
const loadMore = async () => {
	console.log('🔄 index页面loadMore被调用')
	console.log('   - isLoading:', isLoading.value)
	console.log('   - hasMore:', hasMore.value)
	
	// 防重复加载：如果正在加载或没有更多数据，则跳过
	if (isLoading.value || !hasMore.value) {
		console.log('   - 跳过加载：isLoading或hasMore为false')
		return
	}
	
	try {
		console.log('   - 开始加载更多数据...')
		await homestayListStore.loadMoreHomestays()
		console.log('   - 加载更多数据完成')
	} catch (error) {
		console.error('加载更多数据失败:', error)
	}
}

// ==================== 图片处理功能 ====================

/**
 * 图片加载错误处理
 * 智能降级处理，支持HTTP/HTTPS协议切换，提升图片加载成功率
 * @param {Object} errorData - 错误数据对象，包含target.src等信息
 */
const handleImageError = (errorData) => {
	// 使用智能错误处理
	if (errorData && errorData.target && errorData.target.src) {
		const currentSrc = errorData.target.src
		
		// 如果是HTTPS失败，尝试降级到HTTP（仅限本地开发环境）
		if (currentSrc.includes('https://localhost:8081')) {
			const httpSrc = currentSrc.replace('https://', 'http://')
			console.log('图片协议降级:', httpSrc)
			// 更新图片源
			errorData.target.src = httpSrc
		} else if (currentSrc.includes('http://localhost:8081')) {
			// 如果HTTP也失败，使用默认图片
			console.log('使用默认图片')
			errorData.target.src = '/static/logo.png'
		}
	}
}

// ==================== 页面导航功能 ====================

/**
 * 跳转到民宿详情页
 * 传递民宿ID参数，支持详情页数据加载
 * @param {Object} item - 民宿数据对象，包含id字段
 */
const goDetail = (item) => {
	uni.navigateTo({
		url: `/pages/detail/detail?id=${item.id}`
	})
}

// 回到顶部功能已移至ToTop组件


// ==================== 滚动和刷新功能 ====================

/**
 * scroll-view 下拉刷新处理
 * 清除缓存并重新加载数据，支持轮播图和民宿列表的完整刷新
 */
const onRefresherRefresh = async () => {
    // 防重复刷新
    if (isRefreshing.value) return
    isRefreshing.value = true
    
    try {
        // 强制清除所有相关缓存
        cacheStore.clearCacheByDataType('homestay-list')
        cacheStore.clearCacheByDataType('banner')
        
        // 刷新民宿列表数据
        await homestayListStore.refreshHomestayList()
        
        // 重新加载轮播图数据
        const bannerResponse = await API.homestay.getBanner()
        if (bannerResponse && bannerResponse.data) {
            bannerList.value = bannerResponse.data
        }
        
        console.log('下拉刷新完成')
    } catch (e) {
        console.error('下拉刷新失败:', e)
    } finally {
        isRefreshing.value = false
    }
}

// ==================== 生命周期钩子 ====================

/**
 * 页面加载时触发
 * 初始化页面数据，处理缓存逻辑，支持强制刷新参数
 * @param {Object} options - 页面参数，支持forceRefresh强制刷新
 */
onLoad(async (options) => {
	// 加载用户布局偏好
	loadLayoutPreference()
	
	// 检查是否需要强制刷新
	const forceRefresh = options.forceRefresh === 'true'
	const cacheAge = cacheStore.getCacheAge('homestay-list-1-{}')
	
	try {
		// 加载轮播图数据
		const bannerResponse = await API.homestay.getBanner()
		if (bannerResponse && bannerResponse.data) {
			bannerList.value = bannerResponse.data
		}
		
		// 根据缓存年龄和强制刷新参数决定是否使用缓存
		if (forceRefresh || !cacheAge || cacheAge > 2 * 60 * 1000) {
			// 强制刷新或缓存过期，清除缓存
			await homestayListStore.clearCache()
			await loadHomestayList()
		} else {
			// 使用缓存数据
			await loadHomestayList()
		}
		
	} catch (error) {
		console.error('首页初始化失败:', error)
	}
})

/**
 * 页面显示时触发
 * 启动数据同步检查，确保数据最新，支持后台返回时的数据更新
 */
onShow(() => {
	// 启动数据同步检查
	try {
		cacheStore.startDataSyncCheck()
	} catch (error) {
		console.error('启动数据同步检查失败:', error)
	}
})

/**
 * scroll-view滚动监听
 * 将滚动事件传递给ToTop组件处理
 * @param {Object} e - 滚动事件对象
 */
const onScrollViewScroll = (e) => {
	if (toTopRef.value && toTopRef.value.onScrollViewScroll) {
		toTopRef.value.onScrollViewScroll(e)
	}
}

/**
 * 监听ToTop组件的scrollTop变化
 * 用于调试和监控滚动状态
 */
watch(() => toTopRef.value?.scrollTop, (newVal) => {
	console.log('📊 index页面 scrollTop变化:', newVal)
}, { deep: true })


</script>

<style scoped>
/* ==================== 主容器样式 ==================== */

/**
 * 首页主容器
 * 设置背景色和最小高度，确保页面完整显示
 */
.social-forum {
	background: #f8f9fa;
	min-height: 100vh;
}

/* ==================== 筛选栏样式 ==================== */

/**
 * 筛选栏容器
 * 包含地址选择器和布局切换按钮
 */
.filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx 20rpx;
    background: transparent;
    border-bottom: 1rpx solid #f0f0f0;
}

/**
 * 筛选项通用样式
 * 地址选择器和布局切换按钮的基础样式
 */
.filter-item {
    display: flex;
    align-items: center;
    padding: 12rpx 16rpx;
    border-radius: 30rpx;
    background: transparent;
}

/**
 * 地址选择器样式
 * 占据剩余空间，显示当前选中的地址
 */
.address-filter {
	flex: 1;
	margin-right: 20rpx;
}

/**
 * 地址文本样式
 * 显示当前选中的地址或默认文本
 */
.filter-text {
	font-size: 28rpx;
	color: #333;
	margin-left: 10rpx;
}

/**
 * 布局切换按钮样式
 * 固定尺寸的切换按钮
 */
.layout-toggle {
    width: 80rpx;
    height: 60rpx;
    justify-content: center;
    background: transparent;
}

/* ==================== 内容区域样式 ==================== */

/**
 * 内容区域样式
 * 设置高度和内边距，确保内容正确显示
 */
.content-area {
	height: calc(100vh - 120rpx);
	padding: 20rpx;
	box-sizing: border-box;
}
</style>