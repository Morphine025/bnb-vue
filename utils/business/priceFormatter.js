/**
 * 价格格式化工具函数
 * 功能描述：将数字价格转换为"万"单位的显示格式
 * 主要功能：格式化价格显示，如10000显示为1万，48000显示为4.8万
 */

import { handleError } from '../error/errorHandler.js'
import { ErrorTypes, ErrorOptions } from '../error/errorTypes.js'

/**
 * 格式化价格显示
 * @param {number|string} price - 价格数值
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的价格字符串
 */
export function formatPrice(price, options = {}) {
    try {
        // 参数验证
        if (price === null || price === undefined) {
            if (options.handleErrors !== false) {
                const error = new Error('价格不能为空')
                error.type = ErrorTypes.VALIDATION_ERROR
                error.code = 'INVALID_PRICE'
                
                const businessContext = {
                    module: 'PriceFormatter',
                    layer: 'Business',
                    field: 'formatPrice',
                    price: price
                }
                
                const errorOptions = {
                    [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
                    [ErrorOptions.LOG_ERROR]: true,
                    [ErrorOptions.REPORT_ERROR]: options.reportError || false,
                    [ErrorOptions.RETRY_ENABLED]: false,
                    customMessage: '价格不能为空'
                }
                
                handleError(error, businessContext, errorOptions)
            }
            return '0'
        }
        
        // 转换为数字
        const numPrice = parseFloat(price)
        
        // 如果价格无效，返回原值
        if (isNaN(numPrice) || numPrice <= 0) {
            if (options.handleErrors !== false) {
                const error = new Error('价格格式不正确')
                error.type = ErrorTypes.VALIDATION_ERROR
                error.code = 'INVALID_PRICE_FORMAT'
                
                const businessContext = {
                    module: 'PriceFormatter',
                    layer: 'Business',
                    field: 'formatPrice',
                    price: price
                }
                
                const errorOptions = {
                    [ErrorOptions.SHOW_TOAST]: options.showToast !== false,
                    [ErrorOptions.LOG_ERROR]: true,
                    [ErrorOptions.REPORT_ERROR]: options.reportError || false,
                    [ErrorOptions.RETRY_ENABLED]: false,
                    customMessage: '价格格式不正确'
                }
                
                handleError(error, businessContext, errorOptions)
            }
            return price.toString()
        }
        
        // 如果价格小于10000，直接显示
        if (numPrice < 10000) {
            return numPrice.toString()
        }
        
        // 如果价格大于等于10000，转换为万单位
        const wanPrice = numPrice / 10000
        
        // 如果是整数，不显示小数点
        if (wanPrice % 1 === 0) {
            return `${wanPrice}万`
        }
        
        // 保留一位小数，去掉末尾的0
        const formattedPrice = wanPrice.toFixed(1).replace(/\.0$/, '')
        return `${formattedPrice}万`
    } catch (error) {
        const businessContext = {
            module: 'PriceFormatter',
            layer: 'Business',
            field: 'formatPrice',
            price: price
        }
        
        const errorOptions = {
            [ErrorOptions.SHOW_TOAST]: false,
            [ErrorOptions.LOG_ERROR]: true,
            [ErrorOptions.REPORT_ERROR]: true,
            [ErrorOptions.RETRY_ENABLED]: false,
            customMessage: '价格格式化过程出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return price ? price.toString() : '0'
    }
}

/**
 * 格式化价格显示（带货币符号）
 * @param {number|string} price - 价格数值
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的价格字符串（带¥符号）
 */
export function formatPriceWithSymbol(price, options = {}) {
    try {
        const formattedPrice = formatPrice(price, { ...options, handleErrors: false })
        return `¥${formattedPrice}`
    } catch (error) {
        const businessContext = {
            module: 'PriceFormatter',
            layer: 'Business',
            field: 'formatPriceWithSymbol',
            price: price
        }
        
        const errorOptions = {
            [ErrorOptions.SHOW_TOAST]: false,
            [ErrorOptions.LOG_ERROR]: true,
            [ErrorOptions.REPORT_ERROR]: true,
            [ErrorOptions.RETRY_ENABLED]: false,
            customMessage: '价格格式化过程出错'
        }
        
        handleError(error, businessContext, errorOptions)
        return `¥${price ? price.toString() : '0'}`
    }
}

