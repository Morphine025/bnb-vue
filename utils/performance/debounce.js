/**
 * 防抖和节流工具函数
 * 功能描述：提供防抖和节流功能，优化高频操作性能
 * 主要功能：防抖、节流、取消操作
 */

/**
 * 防抖函数
 * @description 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 延迟时间（毫秒）
 * @param {Object} options - 配置选项
 * @param {boolean} options.leading - 是否在延迟开始前调用
 * @param {boolean} options.trailing - 是否在延迟结束后调用
 * @param {number} options.maxWait - 最大等待时间
 * @returns {Function} 防抖后的函数
 * 
 * @example
 * ```javascript
 * // 基础防抖
 * const debouncedSearch = debounce((keyword) => {
 *   console.log('搜索:', keyword)
 * }, 300)
 * 
 * // 高级防抖配置
 * const debouncedSave = debounce((data) => {
 *   saveData(data)
 * }, 500, {
 *   leading: true,
 *   trailing: true,
 *   maxWait: 2000
 * })
 * ```
 */
export function debounce(func, wait, options = {}) {
  let timeoutId
  let lastCallTime
  let lastInvokeTime = 0
  let leading = false
  let maxWait = false
  let trailing = true

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }

  wait = Number(wait) || 0
  if (typeof options === 'object') {
    leading = !!options.leading
    maxWait = 'maxWait' in options
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time
    // Start the timer for the trailing edge.
    timeoutId = setTimeout(timerExpired, wait)
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxWait
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    // Restart the timer.
    timeoutId = setTimeout(timerExpired, remainingWait(time))
  }

  function trailingEdge(time) {
    timeoutId = undefined

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timeoutId = undefined
  }

  function flush() {
    return timeoutId === undefined ? result : trailingEdge(Date.now())
  }

  function pending() {
    return timeoutId !== undefined
  }

  let lastArgs
  let lastThis
  let result
  let lastCallTime

  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxWait) {
        // Handle invocations in a tight loop.
        timeoutId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait)
    }
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
}

/**
 * 节流函数
 * @description 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 间隔时间（毫秒）
 * @param {Object} options - 配置选项
 * @param {boolean} options.leading - 是否在延迟开始前调用
 * @param {boolean} options.trailing - 是否在延迟结束后调用
 * @returns {Function} 节流后的函数
 * 
 * @example
 * ```javascript
 * // 基础节流
 * const throttledScroll = throttle((event) => {
 *   console.log('滚动事件:', event)
 * }, 100)
 * 
 * // 高级节流配置
 * const throttledResize = throttle((event) => {
 *   handleResize(event)
 * }, 200, {
 *   leading: true,
 *   trailing: false
 * })
 * ```
 */
export function throttle(func, wait, options = {}) {
  let leading = true
  let trailing = true

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }
  if (typeof options === 'object') {
    leading = 'leading' in options ? !!options.leading : leading
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }
  return debounce(func, wait, {
    leading,
    trailing,
    maxWait: wait
  })
}

/**
 * 防抖装饰器
 * @description 用于装饰类方法的防抖功能
 * @param {number} wait - 延迟时间
 * @param {Object} options - 配置选项
 * @returns {Function} 装饰器函数
 * 
 * @example
 * ```javascript
 * class SearchComponent {
 *   @debounceDecorator(300)
 *   handleSearch(keyword) {
 *     this.performSearch(keyword)
 *   }
 * }
 * ```
 */
export function debounceDecorator(wait, options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    const debouncedMethod = debounce(originalMethod, wait, options)
    
    descriptor.value = debouncedMethod
    return descriptor
  }
}

/**
 * 节流装饰器
 * @description 用于装饰类方法的节流功能
 * @param {number} wait - 间隔时间
 * @param {Object} options - 配置选项
 * @returns {Function} 装饰器函数
 * 
 * @example
 * ```javascript
 * class ScrollComponent {
 *   @throttleDecorator(100)
 *   handleScroll(event) {
 *     this.updateScrollPosition(event)
 *   }
 * }
 * ```
 */
export function throttleDecorator(wait, options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    const throttledMethod = throttle(originalMethod, wait, options)
    
    descriptor.value = throttledMethod
    return descriptor
  }
}

/**
 * 批量防抖
 * @description 对多个函数进行批量防抖处理
 * @param {Object} functions - 函数对象
 * @param {number} wait - 延迟时间
 * @param {Object} options - 配置选项
 * @returns {Object} 防抖后的函数对象
 * 
 * @example
 * ```javascript
 * const debouncedFunctions = batchDebounce({
 *   search: (keyword) => performSearch(keyword),
 *   save: (data) => saveData(data),
 *   validate: (input) => validateInput(input)
 * }, 300)
 * ```
 */
export function batchDebounce(functions, wait, options = {}) {
  const debouncedFunctions = {}
  
  Object.keys(functions).forEach(key => {
    if (typeof functions[key] === 'function') {
      debouncedFunctions[key] = debounce(functions[key], wait, options)
    }
  })
  
  return debouncedFunctions
}

/**
 * 批量节流
 * @description 对多个函数进行批量节流处理
 * @param {Object} functions - 函数对象
 * @param {number} wait - 间隔时间
 * @param {Object} options - 配置选项
 * @returns {Object} 节流后的函数对象
 * 
 * @example
 * ```javascript
 * const throttledFunctions = batchThrottle({
 *   scroll: (event) => handleScroll(event),
 *   resize: (event) => handleResize(event),
 *   mousemove: (event) => handleMouseMove(event)
 * }, 100)
 * ```
 */
export function batchThrottle(functions, wait, options = {}) {
  const throttledFunctions = {}
  
  Object.keys(functions).forEach(key => {
    if (typeof functions[key] === 'function') {
      throttledFunctions[key] = throttle(functions[key], wait, options)
    }
  })
  
  return throttledFunctions
}

/**
 * 智能防抖
 * @description 根据操作类型自动选择防抖策略
 * @param {Function} func - 要防抖的函数
 * @param {string} type - 操作类型
 * @returns {Function} 防抖后的函数
 * 
 * @example
 * ```javascript
 * // 搜索操作 - 使用较长延迟
 * const smartSearch = smartDebounce(performSearch, 'search')
 * 
 * // 滚动操作 - 使用较短延迟
 * const smartScroll = smartDebounce(handleScroll, 'scroll')
 * ```
 */
export function smartDebounce(func, type) {
  const strategies = {
    search: { wait: 300, options: { leading: false, trailing: true } },
    scroll: { wait: 100, options: { leading: false, trailing: true } },
    resize: { wait: 200, options: { leading: false, trailing: true } },
    input: { wait: 500, options: { leading: false, trailing: true } },
    click: { wait: 300, options: { leading: true, trailing: false } },
    default: { wait: 300, options: { leading: false, trailing: true } }
  }
  
  const strategy = strategies[type] || strategies.default
  return debounce(func, strategy.wait, strategy.options)
}

/**
 * 智能节流
 * @description 根据操作类型自动选择节流策略
 * @param {Function} func - 要节流的函数
 * @param {string} type - 操作类型
 * @returns {Function} 节流后的函数
 * 
 * @example
 * ```javascript
 * // 滚动操作 - 使用高频节流
 * const smartScroll = smartThrottle(handleScroll, 'scroll')
 * 
 * // 网络请求 - 使用低频节流
 * const smartRequest = smartThrottle(makeRequest, 'request')
 * ```
 */
export function smartThrottle(func, type) {
  const strategies = {
    scroll: { wait: 16, options: { leading: true, trailing: true } }, // 60fps
    resize: { wait: 100, options: { leading: true, trailing: true } },
    mousemove: { wait: 16, options: { leading: true, trailing: true } },
    request: { wait: 1000, options: { leading: true, trailing: false } },
    animation: { wait: 16, options: { leading: true, trailing: true } },
    default: { wait: 100, options: { leading: true, trailing: true } }
  }
  
  const strategy = strategies[type] || strategies.default
  return throttle(func, strategy.wait, strategy.options)
}

export default {
  debounce,
  throttle,
  debounceDecorator,
  throttleDecorator,
  batchDebounce,
  batchThrottle,
  smartDebounce,
  smartThrottle
}