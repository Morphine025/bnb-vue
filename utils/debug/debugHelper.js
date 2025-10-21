/**
 * 调试助手工具
 * 功能描述：提供调试和诊断功能
 * 主要功能：数据检查、状态诊断、性能分析
 */

/**
 * 检查数据状态
 * @param {string} storeName - Store名称
 * @param {object} store - Store实例
 */
export function checkStoreData(storeName, store) {
  console.log(`🔍 检查 ${storeName} Store 数据状态:`)
  
  if (storeName === 'homestay') {
    console.log('📊 homestayList 长度:', store.homestayList?.length || 0)
    console.log('📊 processedHomestayList 长度:', store.processedHomestayList?.length || 0)
    console.log('📊 isLoading:', store.isLoading)
    console.log('📊 hasMore:', store.hasMore)
    console.log('📊 currentPage:', store.currentPage)
    
    if (store.homestayList?.length > 0) {
      console.log('📊 第一条数据:', store.homestayList[0])
    }
    
    if (store.processedHomestayList?.length > 0) {
      console.log('📊 第一条处理后数据:', store.processedHomestayList[0])
    }
  }
  
  if (storeName === 'search') {
    console.log('📊 searchResults 长度:', store.searchResults?.length || 0)
    console.log('📊 isSearching:', store.isSearching)
    console.log('📊 searchKeyword:', store.searchKeyword)
  }
  
  if (storeName === 'user') {
    console.log('📊 userInfo:', store.userInfo)
    console.log('📊 isLoggedIn:', store.isLoggedIn)
  }
}

/**
 * 检查页面数据绑定
 * @param {string} pageName - 页面名称
 * @param {object} data - 页面数据
 */
export function checkPageData(pageName, data) {
  console.log(`🔍 检查 ${pageName} 页面数据:`)
  
  if (pageName === 'index') {
    console.log('📊 fallList 长度:', data.fallList?.length || 0)
    console.log('📊 isLoading:', data.isLoading)
    console.log('📊 hasMore:', data.hasMore)
    
    if (data.fallList?.length > 0) {
      console.log('📊 第一条卡片数据:', data.fallList[0])
    }
  }
}

/**
 * 诊断数据流问题
 * @param {object} homestayStore - 民宿Store
 * @param {object} pageData - 页面数据
 */
export function diagnoseDataFlow(homestayStore, pageData) {
  console.log('🔍 诊断数据流问题:')
  
  // 检查原始数据
  console.log('1. 原始数据检查:')
  console.log('   - homestayList 长度:', homestayStore.homestayList?.length || 0)
  console.log('   - 是否有数据:', homestayStore.homestayList?.length > 0)
  
  // 检查处理后数据
  console.log('2. 处理后数据检查:')
  console.log('   - processedHomestayList 长度:', homestayStore.processedHomestayList?.length || 0)
  console.log('   - 是否有处理后数据:', homestayStore.processedHomestayList?.length > 0)
  
  // 检查页面数据
  console.log('3. 页面数据检查:')
  console.log('   - fallList 长度:', pageData.fallList?.length || 0)
  console.log('   - 页面是否有数据:', pageData.fallList?.length > 0)
  
  // 检查数据一致性
  console.log('4. 数据一致性检查:')
  const storeLength = homestayStore.processedHomestayList?.length || 0
  const pageLength = pageData.fallList?.length || 0
  console.log('   - Store数据长度:', storeLength)
  console.log('   - 页面数据长度:', pageLength)
  console.log('   - 数据是否一致:', storeLength === pageLength)
  
  // 问题诊断
  if (storeLength === 0) {
    console.log('❌ 问题: Store中没有数据')
    console.log('   建议: 检查API调用是否成功')
  } else if (pageLength === 0) {
    console.log('❌ 问题: 页面数据为空，但Store有数据')
    console.log('   建议: 检查computed属性绑定')
  } else if (storeLength !== pageLength) {
    console.log('❌ 问题: Store和页面数据长度不一致')
    console.log('   建议: 检查数据映射逻辑')
  } else {
    console.log('✅ 数据流正常')
  }
}

/**
 * 性能分析
 * @param {string} operation - 操作名称
 * @param {Function} fn - 要分析的函数
 */
export async function analyzePerformance(operation, fn) {
  const startTime = performance.now()
  const startMemory = performance.memory?.usedJSHeapSize || 0
  
  try {
    const result = await fn()
    
    const endTime = performance.now()
    const endMemory = performance.memory?.usedJSHeapSize || 0
    
    console.log(`📊 性能分析 - ${operation}:`)
    console.log(`   执行时间: ${(endTime - startTime).toFixed(2)}ms`)
    console.log(`   内存变化: ${((endMemory - startMemory) / 1024 / 1024).toFixed(2)}MB`)
    
    return result
  } catch (error) {
    console.error(`❌ 性能分析失败 - ${operation}:`, error)
    throw error
  }
}

export default {
  checkStoreData,
  checkPageData,
  diagnoseDataFlow,
  analyzePerformance
}
