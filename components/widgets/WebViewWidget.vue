<template>
	<view class="webview-card">
		<text class="webview-title">{{ widget?.title || '网页预览' }}</text>
		<text v-if="widget?.description" class="webview-desc">{{ widget.description }}</text>
		<button size="mini" type="primary" @click="openWebview">打开网页</button>
	</view>
</template>

<script setup>
const props = defineProps({
	widget: {
		type: Object,
		default: () => ({})
	}
})

function openWebview() {
	const url = props.widget?.url
	if (!url) {
		return
	}
	/* #ifdef H5 */
	window.open(url, '_blank')
	/* #endif */
	/* #ifndef H5 */
	try {
		const target = `/uni_modules/uni-im/pages/common/webview/webview?url=${encodeURIComponent(url)}`
		uni.navigateTo({ url: target })
	} catch (error) {
		console.warn('[WebViewWidget] open webview failed', error)
		uni.showToast({ title: '无法打开网页', icon: 'none' })
	}
	/* #endif */
}
</script>

<style scoped>
.webview-card {
	background-color: rgba(0, 0, 0, 0.05);
	border-radius: 14rpx;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.webview-title {
	font-weight: 600;
	font-size: 30rpx;
}

.webview-desc {
	font-size: 26rpx;
	opacity: 0.8;
}
</style>
