/**
 * 防抖工具函数
 * 功能描述：提供防抖和节流功能
 * 主要功能：防抖、节流、取消操作
 */

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    
    const callNow = immediate && !timeout
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func.apply(this, args)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 可取消的防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Object} 包含执行和取消方法的对象
 */
export function cancellableDebounce(func, wait) {
  let timeout
  
  return {
    execute: (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    },
    cancel: () => {
      clearTimeout(timeout)
    }
  }
}

/**
 * 创建防抖保存函数
 * @param {Function} saveFunc - 保存函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的保存函数
 */
export function createDebouncedSave(saveFunc, wait = 500) {
  return debounce(saveFunc, wait)
}

/**
 * 防抖装饰器
 * @param {number} wait - 等待时间
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 装饰器函数
 */
export function debounceDecorator(wait, immediate = false) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = debounce(originalMethod, wait, immediate)
    
    return descriptor
  }
}

/**
 * 节流装饰器
 * @param {number} limit - 时间限制
 * @returns {Function} 装饰器函数
 */
export function throttleDecorator(limit) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = throttle(originalMethod, limit)
    
    return descriptor
  }
}

export default {
  debounce,
  throttle,
  cancellableDebounce,
  debounceDecorator,
  throttleDecorator
}