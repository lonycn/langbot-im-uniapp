<template>
	<view :class="['media-bubble', from === 'me' ? 'from-me' : 'from-bot']">
		<view class="audio-body">
			<view class="audio-info">
				<text class="audio-title">{{ audioTitle }}</text>
				<text v-if="durationLabel" class="audio-duration">{{ durationLabel }}</text>
			</view>
			<view class="audio-player">
				<!-- #ifdef H5 -->
				<audio
					ref="audioEl"
					class="native-audio"
					:src="source"
					:controls="true"
					:preload="'metadata'"
					@ended="handleEnded"
				></audio>
				<!-- #endif -->
				<!-- #ifndef H5 -->
				<button size="mini" type="default" @click="togglePlay">{{ playing ? '暂停' : '播放  ' }}</button>
				<!-- #endif -->
			</view>
			<text v-if="audio?.transcript" class="audio-transcript">{{ audio.transcript }}</text>
		</view>
	</view>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
	audio: {
		type: Object,
		default: () => ({})
	},
	from: {
		type: String,
		default: 'bot'
	}
})

const emit = defineEmits(['play', 'pause', 'ended'])

const audioEl = ref(null)
const innerAudio = ref(null)
const playing = ref(false)

const source = computed(() => props.audio?.url || '')

const durationLabel = computed(() => {
	const duration = props.audio?.duration
	if (!duration && duration !== 0) return ''
	const seconds = Math.round(duration)
	const mm = Math.floor(seconds / 60)
	const ss = seconds % 60
	return `${mm}:${ss.toString().padStart(2, '0')}`
})

const audioTitle = computed(() => props.audio?.title || '语音消息')

function handleEnded() {
	playing.value = false
	emit('ended', props.audio)
}

function stopPlayback() {
	playing.value = false
	/* #ifdef H5 */
	if (audioEl.value) {
		audioEl.value.pause()
		audioEl.value.currentTime = 0
	}
	/* #endif */
	/* #ifndef H5 */
	if (innerAudio.value) {
		innerAudio.value.stop()
	}
	/* #endif */
}

function togglePlay() {
	if (!source.value) return

	if (playing.value) {
		stopPlayback()
		emit('pause', props.audio)
		return
	}

	playing.value = true
	emit('play', props.audio)

	/* #ifdef H5 */
	if (audioEl.value) {
		audioEl.value.currentTime = 0
		audioEl.value.play().catch((err) => {
			console.warn('[MsgAudio] play failed', err)
			playing.value = false
		})
	}
	/* #endif */
	/* #ifndef H5 */
	if (!innerAudio.value) {
		const ctx = uni.createInnerAudioContext()
		ctx.autoplay = false
		ctx.obeyMuteSwitch = false
		ctx.src = source.value
		ctx.onEnded(() => {
			playing.value = false
			emit('ended', props.audio)
		})
		ctx.onError((err) => {
			console.warn('[MsgAudio] play failed', err)
			playing.value = false
		})
		innerAudio.value = ctx
	} else {
		innerAudio.value.stop()
		innerAudio.value.src = source.value
	}
	innerAudio.value.play()
	/* #endif */
}

onMounted(() => {
	/* #ifndef H5 */
	return () => {}
	/* #endif */
})

onBeforeUnmount(() => {
	/* #ifndef H5 */
	if (innerAudio.value) {
		innerAudio.value.stop()
		innerAudio.value.destroy()
		innerAudio.value = null
	}
	/* #endif */
})
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

.audio-body {
	min-width: 220rpx;
	padding: 16rpx;
	border-radius: 16rpx;
	background-color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.from-me .audio-body {
	background-color: #4b7bec;
	color: #ffffff;
}

.audio-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.audio-title {
	font-weight: 600;
	font-size: 28rpx;
}

.audio-duration {
	font-size: 24rpx;
	opacity: 0.8;
}

.audio-player {
	display: flex;
	align-items: center;
}

.native-audio {
	width: 100%;
}

.audio-transcript {
	font-size: 26rpx;
	line-height: 1.4;
	opacity: 0.85;
}
</style>
