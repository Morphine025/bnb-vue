/**
 * 虚拟滚动工具函数
 * 功能描述：处理大数据量列表的虚拟滚动，提升性能
 * 主要功能：虚拟列表计算、滚动优化、渲染优化
 */

/**
 * 虚拟列表配置
 * @typedef {Object} VirtualListConfig
 * @property {number} itemHeight - 单个项目高度
 * @property {number} containerHeight - 容器高度
 * @property {number} bufferSize - 缓冲区大小（额外渲染的项目数量）
 * @property {boolean} enableSmoothScroll - 是否启用平滑滚动
 * @property {Function} onScroll - 滚动回调函数
 */

/**
 * 虚拟列表状态
 * @typedef {Object} VirtualListState
 * @property {number} scrollTop - 当前滚动位置
 * @property {number} startIndex - 开始渲染的索引
 * @property {number} endIndex - 结束渲染的索引
 * @property {number} visibleCount - 可见项目数量
 * @property {Array} visibleItems - 可见项目列表
 * @property {number} totalHeight - 总高度
 * @property {number} offsetY - 偏移量
 */

/**
 * 创建虚拟列表
 * @description 创建虚拟滚动列表，优化大数据量渲染性能
 * @param {Array} items - 数据列表
 * @param {VirtualListConfig} config - 配置选项
 * @returns {Object} 虚拟列表状态和方法
 * 
 * @example
 * ```javascript
 * const virtualList = createVirtualList(homestayList, {
 *   itemHeight: 200,
 *   containerHeight: 600,
 *   bufferSize: 5,
 *   onScroll: (scrollTop) => {
 *     console.log('滚动位置:', scrollTop)
 *   }
 * })
 * 
 * // 获取可见项目
 * const visibleItems = virtualList.getVisibleItems()
 * 
 * // 滚动到指定位置
 * virtualList.scrollTo(1000)
 * ```
 */
export function createVirtualList(items, config = {}) {
  const {
    itemHeight = 100,
    containerHeight = 400,
    bufferSize = 5,
    enableSmoothScroll = true,
    onScroll = () => {}
  } = config

  let state = {
    scrollTop: 0,
    startIndex: 0,
    endIndex: 0,
    visibleCount: 0,
    visibleItems: [],
    totalHeight: 0,
    offsetY: 0
  }

  /**
   * 计算可见项目范围
   * @description 根据滚动位置计算需要渲染的项目范围
   * @param {number} scrollTop - 滚动位置
   * @returns {Object} 计算结果
   */
  function calculateVisibleRange(scrollTop) {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + bufferSize * 2
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount)
    const offsetY = startIndex * itemHeight
    const totalHeight = items.length * itemHeight

    return {
      startIndex,
      endIndex,
      visibleCount,
      offsetY,
      totalHeight
    }
  }

  /**
   * 更新虚拟列表状态
   * @description 根据滚动位置更新虚拟列表状态
   * @param {number} scrollTop - 滚动位置
   */
  function updateState(scrollTop) {
    const range = calculateVisibleRange(scrollTop)
    
    state = {
      ...state,
      scrollTop,
      ...range,
      visibleItems: items.slice(range.startIndex, range.endIndex + 1)
    }

    onScroll(scrollTop)
  }

  /**
   * 获取可见项目
   * @description 获取当前可见的项目列表
   * @returns {Array} 可见项目列表
   */
  function getVisibleItems() {
    return state.visibleItems
  }

  /**
   * 获取可见项目范围
   * @description 获取当前可见项目的索引范围
   * @returns {Object} 索引范围
   */
  function getVisibleRange() {
    return {
      startIndex: state.startIndex,
      endIndex: state.endIndex
    }
  }

  /**
   * 滚动到指定位置
   * @description 滚动到指定的滚动位置
   * @param {number} scrollTop - 滚动位置
   * @param {boolean} smooth - 是否平滑滚动
   */
  function scrollTo(scrollTop, smooth = enableSmoothScroll) {
    updateState(scrollTop)
    
    if (smooth) {
      // 平滑滚动实现
      const startTime = Date.now()
      const startScrollTop = state.scrollTop
      const distance = scrollTop - startScrollTop
      const duration = 300 // 滚动持续时间

      function animateScroll() {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用缓动函数
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const currentScrollTop = startScrollTop + distance * easeOutCubic
        
        updateState(currentScrollTop)
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        }
      }
      
      requestAnimationFrame(animateScroll)
    } else {
      updateState(scrollTop)
    }
  }

  /**
   * 滚动到指定项目
   * @description 滚动到指定索引的项目
   * @param {number} index - 项目索引
   * @param {boolean} smooth - 是否平滑滚动
   */
  function scrollToItem(index, smooth = enableSmoothScroll) {
    const scrollTop = index * itemHeight
    scrollTo(scrollTop, smooth)
  }

  /**
   * 获取项目位置信息
   * @description 获取指定项目的滚动位置信息
   * @param {number} index - 项目索引
   * @returns {Object} 位置信息
   */
  function getItemPosition(index) {
    return {
      top: index * itemHeight,
      bottom: (index + 1) * itemHeight,
      height: itemHeight
    }
  }

  /**
   * 查找项目索引
   * @description 根据滚动位置查找对应的项目索引
   * @param {number} scrollTop - 滚动位置
   * @returns {number} 项目索引
   */
  function findItemIndex(scrollTop) {
    return Math.floor(scrollTop / itemHeight)
  }

  /**
   * 更新数据
   * @description 更新虚拟列表的数据
   * @param {Array} newItems - 新的数据列表
   */
  function updateItems(newItems) {
    items = newItems
    updateState(state.scrollTop)
  }

  /**
   * 重置虚拟列表
   * @description 重置虚拟列表到初始状态
   */
  function reset() {
    state = {
      scrollTop: 0,
      startIndex: 0,
      endIndex: 0,
      visibleCount: 0,
      visibleItems: [],
      totalHeight: 0,
      offsetY: 0
    }
  }

  /**
   * 获取虚拟列表状态
   * @description 获取当前虚拟列表的完整状态
   * @returns {VirtualListState} 虚拟列表状态
   */
  function getState() {
    return { ...state }
  }

  /**
   * 获取性能统计
   * @description 获取虚拟列表的性能统计信息
   * @returns {Object} 性能统计
   */
  function getPerformanceStats() {
    return {
      totalItems: items.length,
      visibleItems: state.visibleItems.length,
      renderRatio: state.visibleItems.length / items.length,
      scrollTop: state.scrollTop,
      startIndex: state.startIndex,
      endIndex: state.endIndex
    }
  }

  // 初始化
  updateState(0)

  return {
    getVisibleItems,
    getVisibleRange,
    scrollTo,
    scrollToItem,
    getItemPosition,
    findItemIndex,
    updateItems,
    reset,
    getState,
    getPerformanceStats
  }
}

/**
 * 虚拟列表Hook（Vue 3 Composition API）
 * @description 为Vue 3组件提供虚拟列表功能
 * @param {Array} items - 数据列表
 * @param {VirtualListConfig} config - 配置选项
 * @returns {Object} 虚拟列表状态和方法
 * 
 * @example
 * ```javascript
 * // 在Vue组件中使用
 * import { useVirtualList } from '@/utils/performance/virtualList'
 * 
 * export default {
 *   setup() {
 *     const homestayList = ref([])
 *     
 *     const virtualList = useVirtualList(homestayList, {
 *       itemHeight: 200,
 *       containerHeight: 600,
 *       bufferSize: 5
 *     })
 *     
 *     return {
 *       ...virtualList
 *     }
 *   }
 * }
 * ```
 */
export function useVirtualList(items, config = {}) {
  const virtualList = createVirtualList(items.value || items, config)
  
  const visibleItems = ref(virtualList.getVisibleItems())
  const scrollTop = ref(0)
  const totalHeight = ref(virtualList.getState().totalHeight)
  const offsetY = ref(0)

  /**
   * 处理滚动事件
   * @description 处理滚动事件并更新虚拟列表状态
   * @param {Event} event - 滚动事件
   */
  function handleScroll(event) {
    const scrollTop = event.detail.scrollTop
    virtualList.scrollTo(scrollTop, false)
    
    const state = virtualList.getState()
    visibleItems.value = state.visibleItems
    scrollTop.value = state.scrollTop
    totalHeight.value = state.totalHeight
    offsetY.value = state.offsetY
  }

  /**
   * 滚动到顶部
   * @description 滚动到列表顶部
   */
  function scrollToTop() {
    virtualList.scrollTo(0, true)
    const state = virtualList.getState()
    visibleItems.value = state.visibleItems
    scrollTop.value = state.scrollTop
    totalHeight.value = state.totalHeight
    offsetY.value = state.offsetY
  }

  /**
   * 滚动到底部
   * @description 滚动到列表底部
   */
  function scrollToBottom() {
    const state = virtualList.getState()
    const maxScrollTop = state.totalHeight - config.containerHeight
    virtualList.scrollTo(maxScrollTop, true)
    
    const newState = virtualList.getState()
    visibleItems.value = newState.visibleItems
    scrollTop.value = newState.scrollTop
    totalHeight.value = newState.totalHeight
    offsetY.value = newState.offsetY
  }

  /**
   * 滚动到指定项目
   * @description 滚动到指定索引的项目
   * @param {number} index - 项目索引
   */
  function scrollToItem(index) {
    virtualList.scrollToItem(index, true)
    const state = virtualList.getState()
    visibleItems.value = state.visibleItems
    scrollTop.value = state.scrollTop
    totalHeight.value = state.totalHeight
    offsetY.value = state.offsetY
  }

  /**
   * 更新数据
   * @description 更新虚拟列表的数据
   * @param {Array} newItems - 新的数据列表
   */
  function updateItems(newItems) {
    virtualList.updateItems(newItems)
    const state = virtualList.getState()
    visibleItems.value = state.visibleItems
    scrollTop.value = state.scrollTop
    totalHeight.value = state.totalHeight
    offsetY.value = state.offsetY
  }

  return {
    visibleItems,
    scrollTop,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToTop,
    scrollToBottom,
    scrollToItem,
    updateItems,
    getPerformanceStats: virtualList.getPerformanceStats
  }
}

/**
 * 虚拟列表组件配置
 * @description 为uniapp组件提供虚拟列表配置
 * @param {Object} options - 配置选项
 * @returns {Object} 组件配置
 */
export function createVirtualListConfig(options = {}) {
  const {
    itemHeight = 100,
    containerHeight = 400,
    bufferSize = 5,
    enableSmoothScroll = true
  } = options

  return {
    itemHeight,
    containerHeight,
    bufferSize,
    enableSmoothScroll,
    
    // 计算样式
    getItemStyle: (index) => ({
      height: `${itemHeight}px`,
      position: 'absolute',
      top: `${index * itemHeight}px`,
      left: '0',
      right: '0'
    }),
    
    // 计算容器样式
    getContainerStyle: (totalHeight) => ({
      height: `${containerHeight}px`,
      overflow: 'auto',
      position: 'relative'
    }),
    
    // 计算内容样式
    getContentStyle: (totalHeight, offsetY) => ({
      height: `${totalHeight}px`,
      position: 'relative',
      transform: `translateY(${offsetY}px)`
    })
  }
}

export default {
  createVirtualList,
  useVirtualList,
  createVirtualListConfig
}
