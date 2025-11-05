<template>
        <view class="webview-card">
                <view class="webview-header">
                        <view class="webview-icon">🌐</view>
                        <view class="webview-texts">
                                <text class="webview-title">{{ widget?.title || hostName || '网页预览' }}</text>
                                <text v-if="hostName" class="webview-host">{{ hostName }}</text>
                        </view>
                </view>
                <text v-if="widget?.description" class="webview-desc">{{ widget.description }}</text>
                <view v-if="sanitizedUrl" class="webview-url">{{ sanitizedUrl }}</view>
                <button class="webview-button" size="mini" type="primary" @click="openWebview">打开网页</button>
        </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
        widget: {
                type: Object,
                default: () => ({})
        }
})

const emit = defineEmits(['open'])

const sanitizedUrl = computed(() => {
        const raw = (props.widget?.url || '').trim()
        if (!raw) return ''
        if (/^https?:\/\//i.test(raw)) return raw
        return `https://${raw}`
})

const hostName = computed(() => {
        if (!sanitizedUrl.value) return ''
        try {
                const url = new URL(sanitizedUrl.value)
                return url.host
        } catch (error) {
                return ''
        }
})

function openWebview() {
        const url = sanitizedUrl.value
        if (!url) {
                uni.showToast({ title: '链接缺失', icon: 'none' })
                return
        }
        const payload = { url }
        emit('open', { status: 'pending', ...payload })
        /* #ifdef H5 */
        try {
                window.open(url, '_blank', 'noopener')
                emit('open', { status: 'success', ...payload })
        } catch (error) {
                console.warn('[WebViewWidget] window.open failed', error)
                emit('open', { status: 'failed', error, ...payload })
                copyUrl(url)
        }
        return
        /* #endif */
        const target = `/uni_modules/uni-im/pages/common/webview/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(
                props.widget?.title || ''
        )}`
        /* #ifdef APP-PLUS */
        plus.runtime.openURL(
                url,
                () => {
                        emit('open', { status: 'success', ...payload })
                },
                (err) => {
                        console.warn('[WebViewWidget] openURL failed, fallback to in-app webview', err)
                        openInAppWebview(target, payload)
                }
        )
        return
        /* #endif */
        openInAppWebview(target, payload)
}

function openInAppWebview(target, payload) {
        uni.navigateTo({
                url: target,
                success() {
                        emit('open', { status: 'success', ...payload })
                },
                fail(error) {
                        console.warn('[WebViewWidget] navigateTo failed', error)
                        emit('open', { status: 'failed', error, ...payload })
                        copyUrl(payload.url)
                }
        })
}

function copyUrl(url) {
        uni.setClipboardData({
                data: url,
                success() {
                        uni.showToast({ title: '已复制链接，可在浏览器中打开', icon: 'none' })
                },
                fail(error) {
                        console.warn('[WebViewWidget] copy url failed', error)
                        uni.showToast({ title: '请手动打开链接', icon: 'none' })
                }
        })
}
</script>

<style scoped>
.webview-card {
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 14rpx;
        padding: 20rpx;
        display: flex;
        flex-direction: column;
        gap: 16rpx;
}

.webview-header {
        display: flex;
        gap: 16rpx;
        align-items: center;
}

.webview-icon {
        width: 72rpx;
        height: 72rpx;
        border-radius: 16rpx;
        background: linear-gradient(135deg, rgba(75, 123, 236, 0.16), rgba(56, 103, 214, 0.16));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
}

.webview-texts {
        display: flex;
        flex-direction: column;
        gap: 6rpx;
}

.webview-title {
        font-weight: 600;
        font-size: 30rpx;
        line-height: 1.2;
}

.webview-host {
        font-size: 24rpx;
        opacity: 0.75;
}

.webview-desc {
        font-size: 26rpx;
        opacity: 0.8;
        line-height: 1.4;
}

.webview-url {
        font-size: 24rpx;
        padding: 10rpx 14rpx;
        background-color: rgba(0, 0, 0, 0.04);
        border-radius: 12rpx;
        word-break: break-all;
}

.webview-button {
        align-self: flex-start;
}
</style>
