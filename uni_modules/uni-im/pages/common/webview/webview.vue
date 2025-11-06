<template>
        <view class="webview-page">
                <web-view
                        v-if="src"
                        :src="src"
                        :webview-styles="webviewStyles"
                        @load="handleLoad"
                        @error="handleError"
                        @message="handleMessage"
                ></web-view>
                <view v-else class="webview-error">
                        <text class="webview-error-title">无法打开页面</text>
                        <text class="webview-error-desc">{{ errorMessage || '请检查链接是否正确后重试' }}</text>
                        <button class="webview-error-button" type="primary" size="mini" @click="closePage">返回</button>
                </view>
        </view>
</template>

<script>
export default {
        data() {
                const state = {
                        src: '',
                        errorMessage: '',
                        loading: false,
                        eventChannelOff: null,
                        webviewStyles: null
                }
                /* #ifdef APP-PLUS */
                state.webviewStyles = {
                        progress: {
                                color: '#4a7afe'
                        }
                }
                /* #endif */
                return state
        },
        onLoad(options = {}) {
                this.registerEventChannel()
                this.applyNavigation({
                        url: options.url ? decodeURIComponent(options.url) : '',
                        title: options.title ? decodeURIComponent(options.title) : ''
                })
        },
        onUnload() {
                this.hideLoading()
                if (typeof this.eventChannelOff === 'function') {
                        this.eventChannelOff()
                        this.eventChannelOff = null
                }
        },
        methods: {
                registerEventChannel() {
                        if (typeof this.getOpenerEventChannel !== 'function') {
                                return
                        }
                        const channel = this.getOpenerEventChannel()
                        if (!channel || typeof channel.on !== 'function') {
                                return
                        }
                        const handler = (payload = {}) => {
                                this.applyNavigation(payload)
                                if (typeof channel.off === 'function') {
                                        channel.off('webview:navigate', handler)
                                }
                        }
                        channel.on('webview:navigate', handler)
                        this.eventChannelOff = () => {
                                if (typeof channel.off === 'function') {
                                        channel.off('webview:navigate', handler)
                                }
                        }
                },
                applyNavigation({ url = '', title = '' } = {}) {
                        if (title) {
                                uni.setNavigationBarTitle({ title })
                        }
                        const trimmed = (url || '').trim()
                        if (!trimmed) {
                                this.showInvalidLink('缺少网页链接')
                                return
                        }
                        if (!/^https?:\/\//i.test(trimmed)) {
                                this.showInvalidLink(`不是有效的网站链接："${trimmed}"`)
                                return
                        }
                        this.errorMessage = ''
                        this.beginLoad(trimmed)
                },
                beginLoad(url) {
                        if (this.src === url) {
                                return
                        }
                        this.loading = true
                        this.showLoading()
                        this.src = url
                },
                handleLoad() {
                        this.loading = false
                        this.hideLoading()
                },
                handleError(event) {
                        console.warn('[webview] load error', event)
                        this.loading = false
                        this.hideLoading()
                        this.showInvalidLink('网页加载失败，请稍后重试')
                },
                handleMessage(event) {
                        const detail = event?.detail || {}
                        if (Object.keys(detail).length) {
                                uni.$emit('webview:message', detail)
                        }
                },
                showInvalidLink(message) {
                        this.loading = false
                        this.hideLoading()
                        this.src = ''
                        this.errorMessage = message
                        uni.showModal({
                                title: '无法打开页面',
                                content: message,
                                showCancel: false,
                                confirmText: '返回',
                                complete: () => {
                                        this.closePage()
                                }
                        })
                },
                showLoading() {
                        if (this.loading) {
                                uni.showLoading({ title: '加载中...', mask: true })
                        }
                },
                hideLoading() {
                        uni.hideLoading()
                },
                closePage() {
                        const pages = getCurrentPages()
                        if (pages.length > 1) {
                                uni.navigateBack()
                                return
                        }
                        uni.reLaunch({ url: '/pages/index/index' })
                }
        }
}
</script>

<style scoped>
.webview-page {
        height: 100%;
        background-color: #ffffff;
}

.webview-error {
        padding: 120rpx 40rpx 40rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24rpx;
        color: #666666;
        text-align: center;
}

.webview-error-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333333;
}

.webview-error-desc {
        font-size: 26rpx;
        line-height: 1.5;
}

.webview-error-button {
        margin-top: 12rpx;
}
</style>
