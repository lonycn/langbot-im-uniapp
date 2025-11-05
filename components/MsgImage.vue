<template>
        <view :class="['image-wrapper', from === 'me' ? 'from-me' : 'from-bot']">
                <view class="image-container">
                        <image
                                class="image"
                                :class="{ 'is-loaded': isLoaded, 'is-error': hasError }"
                                :src="source"
                                mode="aspectFill"
                                @load="handleLoad"
                                @error="handleError"
                                @click="preview"
                                @tap="preview"
                        />
                        <view v-if="!isLoaded && !hasError" class="image-placeholder">
                                <text class="placeholder-text">图片加载中...</text>
                        </view>
                        <view v-if="hasError" class="image-error">
                                <text class="error-icon">⚠️</text>
                                <text class="error-text">图片加载失败</text>
                        </view>
                </view>
                <text v-if="image?.caption" class="image-caption">{{ image.caption }}</text>
        </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

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
        const { url, thumb_url: thumbUrl, base64, path } = props.image || {}
        if (base64) {
                return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
        }
        if (thumbUrl) return thumbUrl
        if (url) return url
        if (path) return path
        return ''
})

const previewSource = computed(() => props.image?.url || source.value)

const isLoaded = ref(false)
const hasError = ref(false)

function preview() {
        if (!previewSource.value || hasError.value) return
        const urls = Array.isArray(props.image?.preview_urls) && props.image.preview_urls.length
                ? props.image.preview_urls
                : [previewSource.value]
        uni.previewImage({
                current: previewSource.value,
                urls
        })
}

function handleLoad() {
        isLoaded.value = true
        hasError.value = false
}

function handleError(error) {
        isLoaded.value = false
        hasError.value = true
        console.warn('[MsgImage] load failed', error)
}

watch(
        () => source.value,
        () => {
                isLoaded.value = false
                hasError.value = false
        }
)
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

.image-container {
        position: relative;
        width: 240rpx;
        height: 240rpx;
}

.image {
        width: 100%;
        height: 100%;
        border-radius: 12rpx;
        background-color: #f2f2f2;
        opacity: 0;
        transition: opacity 0.25s ease;
}

.image.is-loaded {
        opacity: 1;
}

.image-placeholder,
.image-error {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12rpx;
        background-color: rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
}

.placeholder-text {
        font-size: 24rpx;
        opacity: 0.7;
}

.error-icon {
        font-size: 32rpx;
}

.error-text {
        font-size: 24rpx;
        opacity: 0.75;
}

.image-caption {
        margin-top: 8rpx;
        font-size: 24rpx;
        opacity: 0.8;
}
</style>
