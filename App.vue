<script setup>
	/**
	 * 应用根组件
	 * 功能描述：应用入口组件，管理应用生命周期
	 * 主要功能：应用启动、显示、隐藏事件处理
	 */
	import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
	
	/**
	 * 应用启动时触发
	 */
	onLaunch(() => {
		console.log('应用启动')
	})
	
	/**
	 * 应用显示时触发
	 */
	onShow(() => {
		console.log('应用显示')
	})
	
	/**
	 * 应用隐藏时触发
	 */
	onHide(() => {
		console.log('应用隐藏')
	})
</script>

<style lang="scss">
	/* 注意要写在第一行，注意不能引入至uni.scss，同时给style标签加入lang="scss"属性 */
	/* 使用uview-plus推荐的方式，直接导入index.scss */
	@import "@/uni_modules/uview-plus/index.scss";
	
	page {
		background-color: rgb(240, 240, 240);
	}
</style>
