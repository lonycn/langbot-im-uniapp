<template>
	<view :class="['image-wrapper', from === 'me' ? 'from-me' : 'from-bot']">
		<image class="image" :src="source" mode="aspectFit" @click="preview"></image>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	image: {
		type: Object,
		default: () => ({})
	},
	from: {
		type: String,
		default: 'bot'
	}
})

const source = computed(() => {
	const { url, base64, path } = props.image || {}
	if (base64) {
		return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
	}
	if (url) return url
	if (path) return path
	return ''
})

function preview() {
	if (!source.value) return
	uni.previewImage({
		current: source.value,
		urls: [source.value]
	})
}
</script>

<style scoped>
.image-wrapper {
	margin: 8px 0;
	max-width: 70%;
}

.image-wrapper.from-me {
	align-self: flex-end;
}

.image-wrapper.from-bot {
	align-self: flex-start;
}

.image {
	width: 240rpx;
	height: 240rpx;
	border-radius: 12rpx;
	background-color: #f2f2f2;
}
</style>
