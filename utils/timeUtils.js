/**
 * 时间工具函数
 * 功能描述：提供时间格式化和处理相关的工具函数
 */

/**
 * 格式化时间显示
 * @param {string|number} timestamp - 时间戳或时间字符串
 * @returns {string} 格式化后的时间显示
 * @description 将时间戳转换为相对时间显示（如：刚刚、5分钟前、昨天等）
 * 
 * @example
 * formatTime('2025-01-15 10:30:00') // 返回 "2小时前"
 * formatTime(Date.now()) // 返回 "刚刚"
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return "";
  
  // 兼容iOS日期格式，将"2025-10-17 19:35:44"转换为"2025/10/17 19:35:44"
  let formattedTimestamp = timestamp;
  if (typeof timestamp === 'string' && timestamp.includes('-') && timestamp.includes(' ')) {
    // 将"2025-10-17 19:35:44"格式转换为"2025/10/17 19:35:44"格式
    formattedTimestamp = timestamp.replace(/-/g, '/');
  }
  
  const date = new Date(formattedTimestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) {
    // 1分钟内
    return "刚刚";
  } else if (diff < 3600000) {
    // 1小时内
    return Math.floor(diff / 60000) + "分钟前";
  } else if (diff < 86400000) {
    // 24小时内
    return Math.floor(diff / 3600000) + "小时前";
  } else if (diff < 172800000) {
    // 昨天
    return "昨天";
  } else {
    // 更早
    return date.toLocaleDateString();
  }
};

/**
 * 格式化日期显示
 * @param {string|number} timestamp - 时间戳或时间字符串
 * @param {string} format - 日期格式，默认为 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 * @description 将时间戳格式化为指定的日期格式
 * 
 * @example
 * formatDate('2025-01-15 10:30:00', 'YYYY年MM月DD日') // 返回 "2025年01月15日"
 */
export const formatDate = (timestamp, format = 'YYYY-MM-DD') => {
  if (!timestamp) return "";
  
  let formattedTimestamp = timestamp;
  if (typeof timestamp === 'string' && timestamp.includes('-') && timestamp.includes(' ')) {
    formattedTimestamp = timestamp.replace(/-/g, '/');
  }
  
  const date = new Date(formattedTimestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 判断是否为今天
 * @param {string|number} timestamp - 时间戳或时间字符串
 * @returns {boolean} 是否为今天
 * @description 判断给定的时间戳是否为今天
 * 
 * @example
 * isToday(Date.now()) // 返回 true
 * isToday('2025-01-14 10:30:00') // 返回 false（假设今天不是1月14日）
 */
export const isToday = (timestamp) => {
  if (!timestamp) return false;
  
  let formattedTimestamp = timestamp;
  if (typeof timestamp === 'string' && timestamp.includes('-') && timestamp.includes(' ')) {
    formattedTimestamp = timestamp.replace(/-/g, '/');
  }
  
  const date = new Date(formattedTimestamp);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
};

/**
 * 判断是否为昨天
 * @param {string|number} timestamp - 时间戳或时间字符串
 * @returns {boolean} 是否为昨天
 * @description 判断给定的时间戳是否为昨天
 * 
 * @example
 * isYesterday('2025-01-13 10:30:00') // 返回 true（假设今天是1月14日）
 */
export const isYesterday = (timestamp) => {
  if (!timestamp) return false;
  
  let formattedTimestamp = timestamp;
  if (typeof timestamp === 'string' && timestamp.includes('-') && timestamp.includes(' ')) {
    formattedTimestamp = timestamp.replace(/-/g, '/');
  }
  
  const date = new Date(formattedTimestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return date.toDateString() === yesterday.toDateString();
};
