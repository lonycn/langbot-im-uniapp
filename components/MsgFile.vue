<template>
	<view :class="['file-bubble', from === 'me' ? 'from-me' : 'from-bot']">
		<view class="file-body">
			<view class="file-info">
				<view class="file-icon">📄</view>
				<view class="file-text">
					<text class="file-name" :title="fileName">{{ fileName }}</text>
					<text class="file-meta">{{ sizeLabel }} · {{ mimeLabel }}</text>
				</view>
			</view>
			<button class="file-action" size="mini" type="primary" @click="openFile">查看 / 下载</button>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	file: {
		type: Object,
		default: () => ({})
	},
	from: {
		type: String,
		default: 'bot'
	}
})

const emit = defineEmits(['open'])

const fileName = computed(() => props.file?.name || '附件')
const fileUrl = computed(() => props.file?.url || '')

const sizeLabel = computed(() => {
	const size = props.file?.size
	if (!size) return '未知大小'
	const units = ['B', 'KB', 'MB', 'GB']
	let value = size
	let idx = 0
	while (value > 1024 && idx < units.length - 1) {
		value /= 1024
		idx += 1
	}
	return `${value.toFixed(1)} ${units[idx]}`
})

const mimeLabel = computed(() => props.file?.mime || '未知类型')

function openFile() {
	if (!fileUrl.value) return
	emit('open', props.file)
	/* #ifdef H5 */
	window.open(fileUrl.value, '_blank')
	/* #endif */
	/* #ifndef H5 */
	uni.openDocument({
		filePath: fileUrl.value,
		showMenu: true,
		fail(err) {
			console.warn('[MsgFile] open document failed', err)
			uni.showToast({ title: '无法打开附件', icon: 'none' })
		}
	})
	/* #endif */
}
</script>

<style scoped>
.file-bubble {
	max-width: 80%;
	margin: 8px 0;
	display: flex;
}

.file-bubble.from-me {
	justify-content: flex-end;
}

.file-bubble.from-bot {
	justify-content: flex-start;
}

.file-body {
	padding: 18rpx 22rpx;
	border-radius: 16rpx;
	background-color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.from-me .file-body {
	background-color: #4b7bec;
	color: #ffffff;
}

.file-info {
	display: flex;
	gap: 16rpx;
	align-items: center;
}

.file-icon {
	font-size: 42rpx;
}

.file-text {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.file-name {
	font-weight: 600;
	font-size: 28rpx;
	max-width: 400rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.file-meta {
	font-size: 24rpx;
	opacity: 0.8;
}

.file-action {
	align-self: flex-start;
}
</style>
