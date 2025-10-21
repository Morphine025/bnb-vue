/**
 * 简化性能监控工具
 * 功能描述：提供轻量级的性能监控功能
 * 主要功能：基础性能计时、简单统计
 */

// 性能计时器存储
const timers = new Map()
const metrics = new Map()

/**
 * 开始性能计时
 * @param {string} name - 计时器名称
 * @returns {object} 计时器对象
 * @example
 * // 开始计时
 * const timer = startTimer('api_call')
 * // 结束计时
 * const duration = endTimer('api_call')
 */
export const startTimer = (name) => {
  const startTime = Date.now()
  timers.set(name, startTime)
  
  return {
    name,
    startTime,
    end: () => endTimer(name)
  }
}

/**
 * 结束性能计时
 * @param {string} name - 计时器名称
 * @returns {number} 执行时间（毫秒）
 */
export const endTimer = (name) => {
  const startTime = timers.get(name)
  if (!startTime) {
    console.warn(`计时器 ${name} 不存在`)
    return 0
  }
  
  const duration = Date.now() - startTime
  timers.delete(name)
  
  // 记录性能指标
  recordMetric(name, duration)
  
  // 开发环境下输出日志
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${name}: ${duration}ms`)
  }
  
  return duration
}

/**
 * 记录性能指标
 * @param {string} name - 指标名称
 * @param {number} duration - 执行时间
 */
const recordMetric = (name, duration) => {
  if (!metrics.has(name)) {
    metrics.set(name, [])
  }
  
  const metricList = metrics.get(name)
  metricList.push({
    duration,
    timestamp: Date.now()
  })
  
  // 只保留最近10次记录
  if (metricList.length > 10) {
    metricList.shift()
  }
}

/**
 * 性能监控装饰器
 * @param {string} name - 监控名称
 * @returns {Function} 装饰器函数
 * @example
 * // 使用装饰器
 * @measurePerformance('api_call')
 * async function apiCall() {
 *   // API调用逻辑
 * }
 */
export const measurePerformance = (name) => {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function(...args) {
      const timer = startTimer(name)
      
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } finally {
        timer.end()
      }
    }
    
    return descriptor
  }
}

/**
 * 性能监控工具函数
 */
export const performanceUtils = {
  /**
   * 开始计时
   * @param {string} name - 计时器名称
   * @returns {object} 计时器对象
   */
  start: startTimer,
  
  /**
   * 结束计时
   * @param {string} name - 计时器名称
   * @returns {number} 执行时间
   */
  end: endTimer,
  
  /**
   * 获取性能指标
   * @param {string} name - 指标名称
   * @returns {Array} 性能指标数组
   */
  getMetrics: (name) => {
    return metrics.get(name) || []
  },
  
  /**
   * 获取性能统计
   * @param {string} name - 指标名称
   * @returns {object} 统计信息
   */
  getStats: (name) => {
    const metricList = metrics.get(name) || []
    
    if (metricList.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0
      }
    }
    
    const durations = metricList.map(m => m.duration)
    const total = durations.reduce((sum, duration) => sum + duration, 0)
    
    return {
      count: metricList.length,
      average: Math.round(total / metricList.length),
      min: Math.min(...durations),
      max: Math.max(...durations),
      latest: durations[durations.length - 1]
    }
  },
  
  /**
   * 清空所有指标
   */
  clear: () => {
    metrics.clear()
    timers.clear()
  },
  
  /**
   * 获取所有指标名称
   * @returns {Array} 指标名称数组
   */
  getMetricNames: () => {
    return Array.from(metrics.keys())
  }
}

/**
 * 简单的性能监控函数
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
  const timer = startTimer(name)
  
  try {
    const result = await fn()
    return result
  } finally {
    timer.end()
  }
}

// 默认导出简化的性能工具
export default performanceUtils
