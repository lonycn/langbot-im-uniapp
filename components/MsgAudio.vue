<template>
        <view :class="['media-bubble', from === 'me' ? 'from-me' : 'from-bot']">
                <view class="audio-body">
                        <view class="audio-header">
                                <button class="play-toggle" type="default" size="mini" @click="togglePlay">
                                        <text class="play-icon">{{ playing ? '⏸' : '▶️' }}</text>
                                </button>
                                <view class="audio-summary">
                                        <text class="audio-title">{{ audioTitle }}</text>
                                        <text v-if="audio?.artist" class="audio-subtitle">{{ audio.artist }}</text>
                                </view>
                                <text v-if="hasDuration" class="audio-duration">{{ displayDuration }}</text>
                        </view>
                        <view class="audio-progress" @click.stop="handleSeek" @tap.stop="handleSeek">
                                <view ref="progressTrack" class="progress-track">
                                        <view class="progress-buffer" :style="{ width: bufferedPercent }"></view>
                                        <view class="progress-fill" :style="{ width: progressPercent }"></view>
                                        <view class="progress-thumb" :style="{ left: progressPercent }"></view>
                                </view>
                                <view class="progress-times">
                                        <text class="time">{{ currentTimeLabel }}</text>
                                        <text class="time">{{ displayDuration }}</text>
                                </view>
                        </view>
                        <text v-if="audio?.transcript" class="audio-transcript">{{ audio.transcript }}</text>
                        <!-- #ifdef H5 -->
                        <audio
                                ref="audioEl"
                                class="native-audio"
                                :src="source"
                                preload="metadata"
                                @timeupdate="handleTimeUpdate"
                                @loadedmetadata="handleLoadedMetadata"
                                @play="handlePlay"
                                @pause="handlePause"
                                @ended="handleEnded"
                        ></audio>
                        <!-- #endif -->
                </view>
        </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch, getCurrentInstance } from 'vue'

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
const progressTrack = ref(null)
const innerAudio = ref(null)
const playing = ref(false)
const metaDuration = ref(0)
const explicitDuration = computed(() => {
        const duration = Number(props.audio?.duration)
        return Number.isFinite(duration) && duration > 0 ? duration : 0
})
const duration = computed(() => (metaDuration.value > 0 ? metaDuration.value : explicitDuration.value))
const currentTime = ref(0)
const bufferedRatio = ref(0)

const source = computed(() => props.audio?.url || '')

const hasDuration = computed(() => duration.value > 0)

const displayDuration = computed(() => {
        if (!duration.value) return '--:--'
        return formatTime(duration.value)
})

const currentTimeLabel = computed(() => formatTime(currentTime.value))

const progressPercent = computed(() => {
        if (!duration.value) return '0%'
        return `${Math.min(1, currentTime.value / duration.value) * 100}%`
})

const bufferedPercent = computed(() => {
        if (!duration.value) return '0%'
        return `${Math.min(1, bufferedRatio.value) * 100}%`
})

const audioTitle = computed(() => props.audio?.title || '语音消息')

function handleEnded() {
        playing.value = false
        currentTime.value = 0
        emit('ended', props.audio)
}

function stopPlayback() {
        playing.value = false
        currentTime.value = 0
        bufferedRatio.value = 0
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
                audioEl.value.currentTime = currentTime.value || 0
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
                        currentTime.value = 0
                        emit('ended', props.audio)
                })
                ctx.onError((err) => {
                        console.warn('[MsgAudio] play failed', err)
                        playing.value = false
                })
                ctx.onTimeUpdate(() => {
                        currentTime.value = ctx.currentTime || 0
                        updateMetaDuration(ctx.duration)
                })
                ctx.onPlay(() => {
                        playing.value = true
                })
                ctx.onPause(() => {
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

function handleTimeUpdate() {
        if (!audioEl.value) return
        currentTime.value = audioEl.value.currentTime || 0
        updateBuffered()
}

function handleLoadedMetadata() {
        if (!audioEl.value) return
        updateMetaDuration(audioEl.value.duration)
        updateBuffered()
}

function handlePlay() {
        playing.value = true
}

function handlePause() {
        playing.value = false
}

function updateBuffered() {
        if (!audioEl.value || !audioEl.value.buffered || !audioEl.value.buffered.length) {
                bufferedRatio.value = 0
                return
        }
        try {
                const bufferedEnd = audioEl.value.buffered.end(audioEl.value.buffered.length - 1)
                if (duration.value) {
                        bufferedRatio.value = Math.min(bufferedEnd / duration.value, 1)
                }
        } catch (error) {
                bufferedRatio.value = 0
        }
}

function updateMetaDuration(value) {
        const durationValue = Number(value)
        if (!Number.isFinite(durationValue) || durationValue <= 0) return
        metaDuration.value = durationValue
}

function handleSeek(event) {
        if (!duration.value) return
        /* #ifdef H5 */
        const clientX = event?.clientX ?? event?.changedTouches?.[0]?.clientX ?? null
        if (!progressTrack.value || clientX === null) return
        const rect = progressTrack.value.getBoundingClientRect()
        if (!rect?.width) return
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
        seekTo(ratio)
        /* #endif */
        /* #ifndef H5 */
        const instance = getCurrentInstance()
        if (!instance) return
        uni.createSelectorQuery()
                .in(instance.proxy)
                .select('.progress-track')
                .boundingClientRect((rect) => {
                        if (!rect?.width) return
                        const touch = event?.changedTouches?.[0]
                        if (!touch) return
                        const position = touch.pageX ?? touch.clientX ?? touch.x
                        if (position === undefined) return
                        const ratio = Math.min(Math.max((position - rect.left) / rect.width, 0), 1)
                        seekTo(ratio)
                })
                .exec()
        /* #endif */
}

function seekTo(ratio) {
        const nextTime = Math.max(0, Math.min(duration.value * ratio, duration.value))
        currentTime.value = nextTime
        /* #ifdef H5 */
        if (audioEl.value) {
                audioEl.value.currentTime = nextTime
                if (!playing.value) {
                        audioEl.value.pause()
                }
        }
        /* #endif */
        /* #ifndef H5 */
        if (innerAudio.value) {
                innerAudio.value.seek(nextTime)
        }
        /* #endif */
}

function formatTime(val) {
        if (!val && val !== 0) return '00:00'
        const seconds = Math.max(0, Math.round(val))
        const mm = Math.floor(seconds / 60)
        const ss = seconds % 60
        return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

watch(
        () => source.value,
        () => {
                stopPlayback()
                metaDuration.value = 0
                currentTime.value = 0
                bufferedRatio.value = 0
                /* #ifndef H5 */
                if (innerAudio.value) {
                        innerAudio.value.src = source.value
                }
                /* #endif */
        }
)

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
        min-width: 240rpx;
        padding: 18rpx 20rpx;
        border-radius: 18rpx;
        background-color: #ffffff;
        box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 16rpx;
}

.from-me .audio-body {
        background: linear-gradient(135deg, #4b7bec, #3867d6);
        color: #ffffff;
}

.audio-header {
        display: flex;
        align-items: center;
        gap: 16rpx;
}

.play-toggle {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        background-color: rgba(75, 123, 236, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        padding: 0;
}

.from-me .play-toggle {
        background-color: rgba(255, 255, 255, 0.18);
        color: #ffffff;
}

.play-icon {
        font-size: 32rpx;
}

.audio-summary {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6rpx;
}

.audio-title {
        font-weight: 600;
        font-size: 30rpx;
        line-height: 1.2;
}

.audio-subtitle {
        font-size: 24rpx;
        opacity: 0.7;
}

.audio-duration {
        font-size: 24rpx;
        opacity: 0.8;
        white-space: nowrap;
}

.audio-progress {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
}

.progress-track {
        position: relative;
        height: 8rpx;
        border-radius: 8rpx;
        background-color: rgba(0, 0, 0, 0.12);
        overflow: hidden;
}

.from-me .progress-track {
        background-color: rgba(255, 255, 255, 0.25);
}

.progress-buffer,
.progress-fill {
        position: absolute;
        height: 100%;
        left: 0;
        border-radius: 8rpx;
        transition: width 0.2s linear;
}

.progress-buffer {
        background-color: rgba(0, 0, 0, 0.12);
}

.from-me .progress-buffer {
        background-color: rgba(255, 255, 255, 0.25);
}

.progress-fill {
        background: linear-gradient(90deg, #4b7bec, #3867d6);
}

.from-me .progress-fill {
        background: rgba(255, 255, 255, 0.9);
}

.progress-thumb {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background-color: #4b7bec;
        transition: left 0.2s linear;
}

.from-me .progress-thumb {
        background-color: #ffffff;
}

.progress-times {
        display: flex;
        justify-content: space-between;
        font-size: 24rpx;
        opacity: 0.8;
}

.audio-transcript {
        font-size: 26rpx;
        line-height: 1.5;
        opacity: 0.9;
}

.native-audio {
        display: none;
}
</style>
