/**
 * 简化性能监控工具
 * 功能描述：提供基础的性能监控功能，适合移动端小程序环境
 * 主要功能：简单计时、基础监控
 */

/**
 * 开始计时
 * @returns {number} 开始时间戳
 */
export const startTimer = () => {
  return Date.now()
}

/**
 * 结束计时
 * @param {number} startTime - 开始时间戳
 * @returns {number} 执行时间（毫秒）
 */
export const endTimer = (startTime) => {
  return Date.now() - startTime
}

/**
 * 监控函数执行时间
 * @param {string} name - 监控名称
 * @param {Function} fn - 要监控的函数
 * @returns {Promise} 函数执行结果
 * @example
 * // 监控异步函数
 * const result = await measure('api_call', async () => {
 *   return await api.getData()
 * })
 */
export const measure = async (name, fn) => {
  const startTime = startTimer()
  
  try {
    const result = await fn()
    const duration = endTimer(startTime)
    
    // 开发环境下输出日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration}ms`)
    }
    
    return result
  } catch (error) {
    const duration = endTimer(startTime)
    console.error(`❌ ${name} failed after ${duration}ms:`, error)
    throw error
  }
}

/**
 * 简化的性能工具
 */
export const performanceUtils = {
  start: startTimer,
  end: endTimer,
  measure
}

// 默认导出
export default performanceUtils
