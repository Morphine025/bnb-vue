/**
 * 价格格式化工具函数
 * 功能描述：将数字价格转换为"万"单位的显示格式
 * 主要功能：格式化价格显示，如10000显示为1万，48000显示为4.8万
 */

/**
 * 格式化价格显示
 * @param {number|string} price - 价格数值
 * @returns {string} 格式化后的价格字符串
 */
export function formatPrice(price) {
    // 转换为数字
    const numPrice = parseFloat(price)
    
    // 如果价格无效，返回原值
    if (isNaN(numPrice) || numPrice <= 0) {
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
}

/**
 * 格式化价格显示（带货币符号）
 * @param {number|string} price - 价格数值
 * @returns {string} 格式化后的价格字符串（带¥符号）
 */
export function formatPriceWithSymbol(price) {
    return `¥${formatPrice(price)}`
}

