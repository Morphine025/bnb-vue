<template>
	<view class="homestay-list-container">
		<!-- 双排瀑布流布局 -->
		<up-waterfall 
			v-if="!isSingleColumn && list.length > 0" 
			v-model="internalList"
			ref="uWaterfallRef" 
			:add-time="100" 
			:column-count="2"
			:column-width="320"
			:column-gap="20"
			:show-scrollbar="false"
			@loadmore="handleLoadMore"
		>
			<template v-slot:left="{ leftList }">
				<HomestayCard 
					v-for="(item, index) in getValidItems(leftList)" 
					:key="`left-${index}`"
					:data="item"
					layout="waterfall"
					@click="handleItemClick"
					@image-error="handleImageError"
				/>
			</template>
			<template v-slot:right="{ rightList }">
				<HomestayCard 
					v-for="(item, index) in getValidItems(rightList)" 
					:key="`right-${index}`"
					:data="item"
					layout="waterfall"
					@click="handleItemClick"
					@image-error="handleImageError"
				/>
			</template>
		</up-waterfall>
		
		<!-- 双排瀑布流空状态 -->
		<view v-if="!isSingleColumn && list.length === 0 && !isLoading" class="empty-state">
			<up-icon name="inbox" size="80" color="#ccc"></up-icon>
			<text class="empty-text">{{ emptyText || '暂无数据' }}</text>
		</view>
		
		<!-- 单排列表布局 -->
		<scroll-view 
			v-else-if="isSingleColumn && list.length > 0" 
			class="single-column-list"
			scroll-y="true"
			@scrolltolower="handleLoadMore"
			:lower-threshold="100"
		>
			<HomestayCard 
				v-for="(item, index) in list" 
				:key="`single-${index}`"
				:data="item"
				layout="single"
				@click="handleItemClick"
				@image-error="handleImageError"
			/>
		</scroll-view>
		
		<!-- 单排列表空状态 -->
		<view v-if="isSingleColumn && list.length === 0 && !isLoading" class="empty-state">
			<up-icon name="inbox" size="80" color="#ccc"></up-icon>
			<text class="empty-text">{{ emptyText || '暂无数据' }}</text>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="isLoading" class="loading-state">
			<up-loading-icon mode="circle" size="24" color="#667eea"></up-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script setup>
/**
 * 民宿列表组件
 * 功能描述：支持双排瀑布流和单排列表两种布局的民宿列表展示
 * 主要功能：布局切换、数据展示、加载状态、空状态处理
 */

import { ref, watch } from 'vue'
import HomestayCard from './HomestayCard.vue'

// ==================== Props定义 ====================

const props = defineProps({
	/**
	 * 民宿列表数据
	 */
	list: {
		type: Array,
		default: () => []
	},
	
	/**
	 * 是否为单列布局
	 */
	isSingleColumn: {
		type: Boolean,
		default: false
	},
	
	/**
	 * 是否正在加载
	 */
	isLoading: {
		type: Boolean,
		default: false
	},
	
	/**
	 * 空状态提示文本
	 */
	emptyText: {
		type: String,
		default: '暂无数据'
	}
})

// ==================== 事件定义 ====================

const emit = defineEmits(['loadmore', 'itemClick', 'imageError'])

// ==================== 响应式数据 ====================

const uWaterfallRef = ref(null)

// 内部数据管理（用于瀑布流）
const internalList = ref([])

// 监听props变化，同步到内部数据
watch(() => props.list, (newList) => {
	internalList.value = [...newList]
}, { immediate: true, deep: true })

// ==================== 方法定义 ====================

/**
 * 处理加载更多事件
 */
const handleLoadMore = () => {
	console.log('🔄 HomestayList组件触底加载更多')
	emit('loadmore')
}

/**
 * 处理卡片点击事件
 * @param {Object} item - 民宿数据
 */
const handleItemClick = (item) => {
	emit('itemClick', item)
}

/**
 * 处理图片加载错误
 * @param {Object} error - 错误信息
 */
const handleImageError = (error) => {
	emit('imageError', error)
}

/**
 * 过滤有效的数据项
 * 确保只渲染有效的数据对象
 * @param {Array} items - 数据项数组
 * @returns {Array} 过滤后的有效数据项
 */
const getValidItems = (items) => {
	if (!Array.isArray(items)) return []
	return items.filter(item => item && typeof item === 'object' && (item.id || item.title || item.img))
}

// ==================== 暴露方法 ====================

/**
 * 获取瀑布流组件引用
 */
const getWaterfallRef = () => {
	return uWaterfallRef.value
}

// 暴露方法给父组件使用
defineExpose({
	getWaterfallRef
})
</script>

<style scoped>
/* ==================== 容器样式 ==================== */

.homestay-list-container {
	width: 100%;
}

/* ==================== 单排列表样式 ==================== */

.single-column-list {
	padding: 20rpx;
	width: 100%;
	box-sizing: border-box;
}

/* ==================== 空状态样式 ==================== */

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 40rpx;
	color: #999;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	margin-top: 20rpx;
}

/* ==================== 加载状态样式 ==================== */

.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	color: #667eea;
}

.loading-text {
	font-size: 24rpx;
	color: #667eea;
	margin-top: 10rpx;
}
</style>
