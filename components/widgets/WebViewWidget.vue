<template>
        <view class="webview-card" hover-class="webview-card--hover" @tap.stop="openWebview">
                <view class="webview-body">
                        <view class="webview-text">
                                <text class="webview-title">{{ displayTitle }}</text>
                                <text v-if="displayDescription" class="webview-desc">{{ displayDescription }}</text>
                        </view>
                        <view class="webview-thumbnail">
                                <image
                                        v-if="coverImage"
                                        class="webview-cover"
                                        :src="coverImage"
                                        mode="aspectFill"
                                ></image>
                                <view v-else class="webview-icon">
                                        <text class="webview-icon-text">{{ fallbackInitial }}</text>
                                </view>
                        </view>
                </view>
                <view v-if="badgeText || footerSource" class="webview-meta">
                        <view v-if="badgeText" class="webview-meta-badge">{{ badgeText }}</view>
                        <view v-if="footerSource" class="webview-meta-source">
                                <view class="webview-meta-dot"></view>
                                <text class="webview-meta-source-text">{{ footerSource }}</text>
                        </view>
                </view>
        </view>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

const WEBVIEW_PAGE_PATH = '/uni_modules/uni-im/pages/common/webview/webview'

const props = defineProps({
        widget: {
                type: Object,
                default: () => ({})
        }
})

const emit = defineEmits(['open'])

let offWebviewMessage = null

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

const displayTitle = computed(() => {
        const title = (props.widget?.title || '').trim()
        if (title) return title
        if (hostName.value) return hostName.value
        return '网页预览'
})

const displayDescription = computed(() => (props.widget?.description || '').trim())

const navigationTitle = computed(() => displayTitle.value)

const coverImage = computed(() => {
        const src =
                (props.widget?.cover || props.widget?.image || props.widget?.icon || props.widget?.logo || '').trim()
        return src
})

const sourceText = computed(() => {
        const source = (props.widget?.source || props.widget?.siteName || props.widget?.appName || hostName.value || '').trim()
        return source
})

const badgeText = computed(() => {
        const badge = (props.widget?.badge || props.widget?.tag || props.widget?.category || '').trim()
        if (badge) return badge
        if (sourceText.value) return sourceText.value
        return ''
})

const footerSource = computed(() => {
        if (!sourceText.value) return ''
        if (sourceText.value === badgeText.value) return ''
        return sourceText.value
})

const fallbackInitial = computed(() => {
        if (sourceText.value) {
                return sourceText.value.slice(0, 1).toUpperCase()
        }
        if (displayTitle.value) {
                return displayTitle.value.slice(0, 1).toUpperCase()
        }
        return '网'
})

function openWebview() {
        const url = sanitizedUrl.value
        if (!url) {
                uni.showToast({ title: '链接缺失', icon: 'none' })
                return
        }

        const payload = { url, title: navigationTitle.value }
        emit('open', { status: 'pending', ...payload })

        /* #ifdef H5 */
        try {
                window.open(url, '_blank', 'noopener,noreferrer')
                emit('open', { status: 'success', ...payload, via: 'window.open' })
                return
        } catch (error) {
                console.warn('[WebViewWidget] window.open failed', error)
                emit('open', { status: 'failed', error, ...payload })
                copyUrl(url)
        }
        /* #endif */

        const target = `${WEBVIEW_PAGE_PATH}?url=${encodeURIComponent(url)}&title=${encodeURIComponent(
                navigationTitle.value
        )}`
        openInAppWebview(target, payload)
}

function openInAppWebview(target, payload) {
        uni.navigateTo({
                url: target,
                animationType: 'slide-in-right',
                success(res) {
                        try {
                                res?.eventChannel?.emit('webview:navigate', payload)
                        } catch (error) {
                                console.warn('[WebViewWidget] emit webview:navigate failed', error)
                        }
                        emit('open', { status: 'success', ...payload, via: 'navigateTo' })
                },
                fail(error) {
                        console.warn('[WebViewWidget] navigateTo failed', error)
                        if (shouldRedirect(error)) {
                                uni.redirectTo({
                                        url: target,
                                        success() {
                                                emit('open', { status: 'success', ...payload, via: 'redirectTo' })
                                        },
                                        fail(redirectError) {
                                                console.warn('[WebViewWidget] redirectTo failed', redirectError)
                                                if (openWithPlusRuntime(payload)) {
                                                        return
                                                }
                                                emit('open', { status: 'failed', error: redirectError, ...payload })
                                                copyUrl(payload.url)
                                        }
                                })
                                return
                        }

                        if (openWithPlusRuntime(payload)) {
                                return
                        }

                        emit('open', { status: 'failed', error, ...payload })
                        copyUrl(payload.url)
                }
        })
}

function shouldRedirect(error) {
        if (!error || typeof error?.errMsg !== 'string') return false
        return /limit|page stack/i.test(error.errMsg)
}

function openWithPlusRuntime(payload) {
        /* #ifdef APP-PLUS */
        try {
                if (typeof plus !== 'undefined' && plus?.runtime?.openURL) {
                        plus.runtime.openURL(
                                payload.url,
                                () => {
                                        emit('open', {
                                                status: 'success',
                                                ...payload,
                                                via: 'plus.runtime.openURL'
                                        })
                                },
                                (error) => {
                                        console.warn('[WebViewWidget] plus.runtime.openURL failed', error)
                                        emit('open', { status: 'failed', error, ...payload })
                                        copyUrl(payload.url)
                                }
                        )
                        return true
                }
        } catch (error) {
                console.warn('[WebViewWidget] plus.runtime.openURL exception', error)
        }
        /* #endif */
        return false
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

onMounted(() => {
        if (typeof uni === 'undefined' || typeof uni.$on !== 'function') {
                return
        }
        const handler = (detail) => {
                emit('open', {
                        status: 'message',
                        detail,
                        url: sanitizedUrl.value,
                        title: navigationTitle.value
                })
        }
        uni.$on('webview:message', handler)
        offWebviewMessage = () => {
                if (typeof uni.$off === 'function') {
                        uni.$off('webview:message', handler)
                }
        }
})

onBeforeUnmount(() => {
        if (offWebviewMessage) {
                offWebviewMessage()
                offWebviewMessage = null
        }
})
</script>

<style scoped>
.webview-card {
        background-color: #ffffff;
        border-radius: 16rpx;
        border: 1rpx solid rgba(0, 0, 0, 0.08);
        padding: 24rpx 28rpx;
        display: flex;
        flex-direction: column;
        gap: 24rpx;
        transition: background-color 0.2s ease;
        /* #ifdef H5 */
        cursor: pointer;
        /* #endif */
}

.webview-card--hover,
.webview-card:active {
        background-color: #f5f5f5;
}

.webview-body {
        display: flex;
        align-items: stretch;
        gap: 24rpx;
}

.webview-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 12rpx;
}

.webview-title {
        font-weight: 500;
        font-size: 30rpx;
        color: #1a1a1a;
        line-height: 1.4;
        word-break: break-word;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
}

.webview-desc {
        font-size: 26rpx;
        color: #8a8a8a;
        line-height: 1.5;
        word-break: break-word;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
}

.webview-thumbnail {
        width: 120rpx;
        height: 120rpx;
        border-radius: 12rpx;
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
}

.webview-cover {
        width: 100%;
        height: 100%;
}

.webview-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(59, 125, 255, 0.16), rgba(36, 91, 213, 0.16));
}

.webview-icon-text {
        font-size: 36rpx;
        font-weight: 600;
        color: #2b65ff;
}

.webview-meta {
        border-top: 1rpx solid rgba(0, 0, 0, 0.06);
        padding-top: 16rpx;
        display: flex;
        align-items: center;
        gap: 16rpx;
}

.webview-meta-badge {
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        background-color: rgba(0, 0, 0, 0.04);
        color: #4e5969;
        font-size: 22rpx;
}

.webview-meta-source {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 8rpx;
}

.webview-meta-dot {
        width: 8rpx;
        height: 8rpx;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
}

.webview-meta-source-text {
        font-size: 24rpx;
        color: #a0a0a0;
}
</style>
