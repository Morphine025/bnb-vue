/**
 * 分享工具类
 * 功能描述：提供各种分享功能的工具方法
 */

/**
 * 分享房源到微信
 * @param {Object} item - 房源信息
 * @param {string} item.title - 房源标题
 * @param {string} item.homestayId - 房源ID
 * @param {string} item.price - 房源价格
 * @param {string} item.city - 房源城市
 * @param {Array} item.images - 房源图片
 */
export const shareToWechat = (item) => {
	return new Promise((resolve, reject) => {
		// 构建分享内容
		const shareContent = {
			title: item.title || '优质民宿转让',
			path: `/pages/detail/detail?id=${item.homestayId}`,
			imageUrl: item.images && item.images.length > 0 ? item.images[0] : '/static/logo.png'
		}
		
		// 调用微信分享API
		uni.share({
			provider: 'weixin',
			scene: 'WXSceneSession', // 分享到聊天
			type: 0, // 图文分享
			title: shareContent.title,
			summary: `价格：¥${item.price || '面议'} | 位置：${item.city || '未知'}`,
			href: shareContent.path,
			imageUrl: shareContent.imageUrl,
			success: (res) => {
				console.log('分享成功:', res)
				uni.showToast({
					title: '分享成功',
					icon: 'success'
				})
				resolve(res)
			},
			fail: (err) => {
				console.error('分享失败:', err)
				reject(err)
			}
		})
	})
}

/**
 * 分享房源到朋友圈
 * @param {Object} item - 房源信息
 */
export const shareToMoments = (item) => {
	return new Promise((resolve, reject) => {
		const shareContent = {
			title: item.title || '优质民宿转让',
			path: `/pages/detail/detail?id=${item.homestayId}`,
			imageUrl: item.images && item.images.length > 0 ? item.images[0] : '/static/logo.png'
		}
		
		uni.share({
			provider: 'weixin',
			scene: 'WXSceneTimeline', // 分享到朋友圈
			type: 0,
			title: shareContent.title,
			summary: `价格：¥${item.price || '面议'} | 位置：${item.city || '未知'}`,
			href: shareContent.path,
			imageUrl: shareContent.imageUrl,
			success: (res) => {
				console.log('分享到朋友圈成功:', res)
				uni.showToast({
					title: '分享成功',
					icon: 'success'
				})
				resolve(res)
			},
			fail: (err) => {
				console.error('分享到朋友圈失败:', err)
				reject(err)
			}
		})
	})
}

/**
 * 复制链接到剪贴板
 * @param {Object} item - 房源信息
 */
export const copyLink = (item) => {
	return new Promise((resolve, reject) => {
		// 构建分享链接（这里使用相对路径，实际项目中可能需要完整的URL）
		const shareUrl = `https://your-domain.com/pages/detail/detail?id=${item.homestayId}`
		
		uni.setClipboardData({
			data: shareUrl,
			success: (res) => {
				console.log('复制链接成功:', res)
				uni.showToast({
					title: '链接已复制到剪贴板',
					icon: 'success'
				})
				resolve(res)
			},
			fail: (err) => {
				console.error('复制链接失败:', err)
				reject(err)
			}
		})
	})
}

/**
 * 显示分享选项弹窗
 * @param {Object} item - 房源信息
 */
export const showShareOptions = (item) => {
	return new Promise((resolve, reject) => {
		uni.showActionSheet({
			itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
			success: (res) => {
				const tapIndex = res.tapIndex
				switch (tapIndex) {
					case 0:
						// 分享给朋友
						shareToWechat(item).then(resolve).catch(reject)
						break
					case 1:
						// 分享到朋友圈
						shareToMoments(item).then(resolve).catch(reject)
						break
					case 2:
						// 复制链接
						copyLink(item).then(resolve).catch(reject)
						break
					default:
						reject(new Error('未知的分享选项'))
				}
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

/**
 * 生成分享海报
 * @param {Object} item - 房源信息
 */
export const generateSharePoster = (item) => {
	return new Promise((resolve, reject) => {
		// 这里可以实现生成分享海报的功能
		// 由于涉及canvas绘制，这里先返回一个简单的实现
		uni.showToast({
			title: '海报生成功能开发中',
			icon: 'none'
		})
		reject(new Error('海报生成功能暂未实现'))
	})
}

/**
 * 分享到其他平台
 * @param {Object} item - 房源信息
 * @param {string} platform - 平台名称
 */
export const shareToOtherPlatform = (item, platform) => {
	return new Promise((resolve, reject) => {
		// 根据平台选择不同的分享方式
		switch (platform) {
			case 'wechat':
				shareToWechat(item).then(resolve).catch(reject)
				break
			case 'moments':
				shareToMoments(item).then(resolve).catch(reject)
				break
			case 'copy':
				copyLink(item).then(resolve).catch(reject)
				break
			default:
				reject(new Error('不支持的分享平台'))
		}
	})
}
