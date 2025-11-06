<template>
        <view :class="['media-bubble', from === 'me' ? 'from-me' : 'from-bot']">
                <view class="video-body">
                        <view v-if="video?.title" class="video-title">{{ video.title }}</view>
                        <video
                                ref="videoRef"
                                class="video-player"
                                :src="source"
                                :poster="video?.cover_url || ''"
                                :controls="true"
                                :loop="false"
                                @error="handleError"
                                @fullscreenchange="handleFullscreenChange"
                        ></video>
                        <view class="video-meta">
                                <text v-if="durationLabel" class="meta-item">时长 {{ durationLabel }}</text>
                                <text v-if="sizeLabel" class="meta-item">大小 {{ sizeLabel }}</text>
                                <slot name="footer"></slot>
                        </view>
                        <button v-if="canPreviewExternally" class="video-action" size="mini" type="default" @click="previewExternally">
                                全屏播放
                        </button>
                </view>
        </view>
</template>

<script setup>
import { computed, ref } from 'vue'

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

const emit = defineEmits(['error', 'open'])

const videoRef = ref(null)
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

const canPreviewExternally = computed(() => !!source.value)

function handleError(event) {
        console.warn('[MsgVideo] play failed', event?.detail || event)
        emit('error', event)
}

function handleFullscreenChange(event) {
        emit('open', { type: 'fullscreen', detail: event?.detail || {}, video: props.video })
}

function previewExternally() {
        if (!source.value) return
        emit('open', { type: 'preview', video: props.video })
        /* #ifdef H5 */
        const element = videoRef.value
        if (element?.requestFullscreen) {
                element.requestFullscreen().catch((error) => {
                        console.warn('[MsgVideo] requestFullscreen failed', error)
                })
        } else {
                window.open(source.value, '_blank', 'noopener')
        }
        /* #endif */
        /* #ifndef H5 */
        uni.previewMedia({
                sources: [
                        {
                                url: source.value,
                                type: 'video',
                                poster: props.video?.cover_url || ''
                        }
                ],
                fail(error) {
                        console.warn('[MsgVideo] previewMedia failed', error)
                        uni.showToast({ title: '请在当前窗口播放', icon: 'none' })
                }
        })
        /* #endif */
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

.video-action {
        align-self: flex-start;
        margin-top: 4rpx;
}
</style>
