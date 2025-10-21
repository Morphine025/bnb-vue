/**
 * 民宿状态管理工具
 * 功能描述：定义和管理民宿的各种状态
 */

// 民宿状态枚举
export const HOMESTAY_STATUS = {
	PENDING: '0',      // 审核中
	APPROVED: '1',     // 审核通过
	REJECTED: '2',     // 审核失败
	OFFLINE: '3',      // 已下架
	DELETED: '4'       // 已删除
}

// 状态显示文本映射
export const STATUS_TEXT_MAP = {
	[HOMESTAY_STATUS.PENDING]: '审核中',
	[HOMESTAY_STATUS.APPROVED]: '审核通过',
	[HOMESTAY_STATUS.REJECTED]: '审核失败',
	[HOMESTAY_STATUS.OFFLINE]: '已下架',
	[HOMESTAY_STATUS.DELETED]: '已删除'
}

// 状态样式类映射
export const STATUS_CLASS_MAP = {
	[HOMESTAY_STATUS.PENDING]: 'status-pending',
	[HOMESTAY_STATUS.APPROVED]: 'status-approved',
	[HOMESTAY_STATUS.REJECTED]: 'status-rejected',
	[HOMESTAY_STATUS.OFFLINE]: 'status-offline',
	[HOMESTAY_STATUS.DELETED]: 'status-deleted'
}

// 状态颜色映射
export const STATUS_COLOR_MAP = {
	[HOMESTAY_STATUS.PENDING]: '#faad14',    // 橙色 - 审核中
	[HOMESTAY_STATUS.APPROVED]: '#52c41a',   // 绿色 - 审核通过
	[HOMESTAY_STATUS.REJECTED]: '#ff4d4f',   // 红色 - 审核失败
	[HOMESTAY_STATUS.OFFLINE]: '#8c8c8c',    // 灰色 - 已下架
	[HOMESTAY_STATUS.DELETED]: '#d9d9d9'     // 浅灰色 - 已删除
}

/**
 * 获取状态显示文本
 * @param {string} status - 状态值
 * @returns {string} 状态文本
 */
export const getStatusText = (status) => {
	return STATUS_TEXT_MAP[status] || '未知状态'
}

/**
 * 获取状态样式类
 * @param {string} status - 状态值
 * @returns {string} 样式类名
 */
export const getStatusClass = (status) => {
	return STATUS_CLASS_MAP[status] || 'status-unknown'
}

/**
 * 获取状态颜色
 * @param {string} status - 状态值
 * @returns {string} 颜色值
 */
export const getStatusColor = (status) => {
	return STATUS_COLOR_MAP[status] || '#8c8c8c'
}

/**
 * 检查状态是否可编辑
 * @param {string} status - 状态值
 * @returns {boolean} 是否可编辑
 */
export const isEditable = (status) => {
	return status === HOMESTAY_STATUS.PENDING || status === HOMESTAY_STATUS.APPROVED
}

/**
 * 检查状态是否可删除
 * @param {string} status - 状态值
 * @returns {boolean} 是否可删除
 */
export const isDeletable = (status) => {
	return status !== HOMESTAY_STATUS.DELETED
}

/**
 * 检查状态是否可下架
 * @param {string} status - 状态值
 * @returns {boolean} 是否可下架
 */
export const canOffline = (status) => {
	return status === HOMESTAY_STATUS.APPROVED
}

/**
 * 检查状态是否可重新上架
 * @param {string} status - 状态值
 * @returns {boolean} 是否可重新上架
 */
export const canOnline = (status) => {
	return status === HOMESTAY_STATUS.OFFLINE
}

/**
 * 获取状态操作列表
 * @param {string} status - 状态值
 * @returns {Array} 可执行的操作列表
 */
export const getAvailableActions = (status) => {
	const actions = []
	
	switch (status) {
		case HOMESTAY_STATUS.PENDING:
			actions.push('edit', 'delete')
			break
		case HOMESTAY_STATUS.APPROVED:
			actions.push('edit', 'offline', 'delete')
			break
		case HOMESTAY_STATUS.REJECTED:
			actions.push('edit', 'delete')
			break
		case HOMESTAY_STATUS.OFFLINE:
			actions.push('edit', 'online', 'delete')
			break
		case HOMESTAY_STATUS.DELETED:
			// 已删除状态无可用操作
			break
		default:
			actions.push('edit', 'delete')
	}
	
	return actions
}
