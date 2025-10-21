/**
 * 简化性能监控工具
 * 功能描述：提供基础的性能监控功能，适合移动端小程序环境
 * 主要功能：简单计时、基础监控
 */

/**
 * 开始计时
 * @param {string} name - 计时器名称
 */
export const startTimer = (name) => {
  console.time(name)
}

/**
 * 结束计时
 * @param {string} name - 计时器名称
 */
export const endTimer = (name) => {
  console.timeEnd(name)
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
  startTimer(name)
  
  try {
    const result = await fn()
    endTimer(name)
    return result
  } catch (error) {
    endTimer(name)
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
