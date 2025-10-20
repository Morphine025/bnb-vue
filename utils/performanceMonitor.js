/**
 * 性能监控工具
 * 功能描述：监控应用性能指标
 * 主要功能：性能指标收集、性能分析、性能报告
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = new Map()
    this.isEnabled = true
  }
  
  /**
   * 开始性能监控
   * @param {string} name - 监控名称
   * @param {object} metadata - 元数据
   * @returns {object} 监控对象
   */
  start(name, metadata = {}) {
    if (!this.isEnabled) return null
    
    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()
    
    return {
      name,
      startTime,
      startMemory,
      metadata,
      end: () => this.end(name, startTime, startMemory, metadata)
    }
  }
  
  /**
   * 结束性能监控
   * @param {string} name - 监控名称
   * @param {number} startTime - 开始时间
   * @param {number} startMemory - 开始内存
   * @param {object} metadata - 元数据
   */
  end(name, startTime, startMemory, metadata = {}) {
    if (!this.isEnabled) return
    
    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()
    
    const metric = {
      name,
      duration: endTime - startTime,
      memoryDelta: endMemory - startMemory,
      startTime,
      endTime,
      startMemory,
      endMemory,
      metadata,
      timestamp: Date.now()
    }
    
    this.metrics.set(name, metric)
    this.notifyObservers(name, metric)
  }
  
  /**
   * 获取内存使用情况
   * @returns {number} 内存使用量（字节）
   */
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize
    }
    return 0
  }
  
  /**
   * 获取性能指标
   * @param {string} name - 指标名称
   * @returns {object|null} 性能指标
   */
  getMetric(name) {
    return this.metrics.get(name) || null
  }
  
  /**
   * 获取所有性能指标
   * @returns {Array} 所有性能指标
   */
  getAllMetrics() {
    return Array.from(this.metrics.values())
  }
  
  /**
   * 获取性能统计
   * @returns {object} 性能统计
   */
  getStats() {
    const metrics = this.getAllMetrics()
    
    if (metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        totalMemoryDelta: 0,
        slowestOperation: null,
        fastestOperation: null
      }
    }
    
    const durations = metrics.map(m => m.duration)
    const memoryDeltas = metrics.map(m => m.memoryDelta)
    
    const slowest = metrics.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    )
    
    const fastest = metrics.reduce((prev, current) => 
      prev.duration < current.duration ? prev : current
    )
    
    return {
      totalMetrics: metrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      totalMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0),
      slowestOperation: slowest,
      fastestOperation: fastest,
      memoryUsage: this.getMemoryUsage()
    }
  }
  
  /**
   * 添加观察者
   * @param {string} name - 监控名称
   * @param {Function} callback - 回调函数
   */
  addObserver(name, callback) {
    if (!this.observers.has(name)) {
      this.observers.set(name, [])
    }
    this.observers.get(name).push(callback)
  }
  
  /**
   * 移除观察者
   * @param {string} name - 监控名称
   * @param {Function} callback - 回调函数
   */
  removeObserver(name, callback) {
    const observers = this.observers.get(name)
    if (observers) {
      const index = observers.indexOf(callback)
      if (index > -1) {
        observers.splice(index, 1)
      }
    }
  }
  
  /**
   * 通知观察者
   * @param {string} name - 监控名称
   * @param {object} metric - 性能指标
   */
  notifyObservers(name, metric) {
    const observers = this.observers.get(name)
    if (observers) {
      observers.forEach(callback => {
        try {
          callback(metric)
        } catch (error) {
          console.error('性能监控观察者回调错误:', error)
        }
      })
    }
  }
  
  /**
   * 清空所有指标
   */
  clear() {
    this.metrics.clear()
  }
  
  /**
   * 启用/禁用监控
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
  }
  
  /**
   * 导出性能报告
   * @returns {object} 性能报告
   */
  exportReport() {
    return {
      timestamp: Date.now(),
      stats: this.getStats(),
      metrics: this.getAllMetrics(),
      memoryUsage: this.getMemoryUsage()
    }
  }
}

// 创建全局性能监控实例
const performanceMonitor = new PerformanceMonitor()

/**
 * 性能监控装饰器
 * @param {string} name - 监控名称
 * @param {object} metadata - 元数据
 * @returns {Function} 装饰器函数
 */
export function performanceDecorator(name, metadata = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function(...args) {
      const monitor = performanceMonitor.start(name, metadata)
      
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } finally {
        if (monitor) {
          monitor.end()
        }
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
   * 开始监控
   */
  start: (name, metadata) => performanceMonitor.start(name, metadata),
  
  /**
   * 获取指标
   */
  getMetric: (name) => performanceMonitor.getMetric(name),
  
  /**
   * 获取统计
   */
  getStats: () => performanceMonitor.getStats(),
  
  /**
   * 添加观察者
   */
  addObserver: (name, callback) => performanceMonitor.addObserver(name, callback),
  
  /**
   * 导出报告
   */
  exportReport: () => performanceMonitor.exportReport(),
  
  /**
   * 清空指标
   */
  clear: () => performanceMonitor.clear(),
  
  /**
   * 设置启用状态
   */
  setEnabled: (enabled) => performanceMonitor.setEnabled(enabled)
}

export default performanceMonitor
