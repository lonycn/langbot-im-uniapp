<template>
	<view :class="['media-bubble', from === 'me' ? 'from-me' : 'from-bot']">
		<view class="video-body">
			<view v-if="video?.title" class="video-title">{{ video.title }}</view>
			<video
				class="video-player"
				:src="source"
				:poster="video?.cover_url || ''"
				:controls="true"
				:loop="false"
				@error="handleError"
			></video>
			<view class="video-meta">
				<text v-if="durationLabel" class="meta-item">时长 {{ durationLabel }}</text>
				<text v-if="sizeLabel" class="meta-item">大小 {{ sizeLabel }}</text>
				<slot name="footer"></slot>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	video: {
		type: Object,
		default: () => ({})
	},
	from: {
		type: String,
		default: 'bot'
	}
})

const emit = defineEmits(['error'])

const source = computed(() => props.video?.url || '')

const durationLabel = computed(() => {
	const duration = props.video?.duration
	if (!duration && duration !== 0) return ''
	const seconds = Math.round(duration)
	const mm = Math.floor(seconds / 60)
	const ss = seconds % 60
	return `${mm}:${ss.toString().padStart(2, '0')}`
})

const sizeLabel = computed(() => {
	const size = props.video?.size
	if (!size) return ''
	const units = ['B', 'KB', 'MB', 'GB']
	let value = size
	let idx = 0
	while (value > 1024 && idx < units.length - 1) {
		value /= 1024
		idx += 1
	}
	return `${value.toFixed(1)} ${units[idx]}`
})

function handleError(event) {
	console.warn('[MsgVideo] play failed', event?.detail || event)
	emit('error', event)
}
</script>

<style scoped>
.media-bubble {
	max-width: 80%;
	margin: 8px 0;
	display: flex;
}

.media-bubble.from-me {
	justify-content: flex-end;
}

.media-bubble.from-bot {
	justify-content: flex-start;
}

.video-body {
	width: 460rpx;
	max-width: 560rpx;
	padding: 16rpx;
	border-radius: 16rpx;
	background-color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.from-me .video-body {
	background-color: #4b7bec;
	color: #ffffff;
}

.video-title {
	font-weight: 600;
	font-size: 28rpx;
}

.video-player {
	width: 100%;
	height: 320rpx;
	border-radius: 12rpx;
	background-color: #000;
}

.video-meta {
	display: flex;
	gap: 16rpx;
	font-size: 24rpx;
	opacity: 0.85;
}

.meta-item {
	white-space: nowrap;
}
</style>
