<template>
        <view class="webview-page">
                <web-view
                        v-if="src"
                        :src="src"
                        :webview-styles="webviewStyles"
                        @message="handleMessage"
                ></web-view>
                <view v-else class="webview-error">
                        <text class="webview-error-title">无法打开页面</text>
                        <text class="webview-error-desc">请检查链接是否正确后重试</text>
                        <button class="webview-error-button" type="primary" size="mini" @click="closePage">返回</button>
                </view>
        </view>
</template>

<script>
export default {
        data() {
                return {
                        src: '',
                        webviewStyles: {
                                progress: {
                                        color: '#4a7afe'
                                }
                        }
                }
        },
        onLoad(options = {}) {
                const title = options.title ? decodeURIComponent(options.title) : ''
                if (title) {
                        uni.setNavigationBarTitle({ title })
                }

                const decodedUrl = options.url ? decodeURIComponent(options.url) : ''
                if (decodedUrl && /^https?:\/\//i.test(decodedUrl)) {
                        this.src = decodedUrl
                } else if (decodedUrl) {
                        this.showInvalidLink(`不是有效的网站链接："${decodedUrl}"`)
                } else {
                        this.showInvalidLink('缺少网页链接')
                }
        },
        methods: {
                handleMessage(event) {
                        const detail = event?.detail || {}
                        if (Object.keys(detail).length) {
                                uni.$emit('webview:message', detail)
                        }
                },
                showInvalidLink(message) {
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
