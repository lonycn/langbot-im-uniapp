<template>
        <view :class="['msg-bubble', from === 'me' ? 'from-me' : 'from-bot']">
                <text
                        v-for="(segment, idx) in segments"
                        :key="idx"
                        class="msg-text"
                        :class="segment.type === 'link' ? 'msg-link' : ''"
                        @tap="segment.type === 'link' ? openLink(segment.value) : undefined"
                        @click="segment.type === 'link' ? openLink(segment.value) : undefined"
                >
                        {{ segment.value }}
                </text>
        </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
        text: {
                type: String,
                default: ''
        },
        from: {
                type: String,
                default: 'bot'
        }
})

const emit = defineEmits(['link'])

const segments = computed(() => parseSegments(props.text))

function parseSegments(text) {
        if (!text) return []
        const result = []
        const regex = /((?:https?:\/\/|www\.)[^\s]+)/gi
        let lastIndex = 0
        let match
        while ((match = regex.exec(text)) !== null) {
                const [url] = match
                const index = match.index
                if (index > lastIndex) {
                        result.push({ type: 'text', value: text.slice(lastIndex, index) })
                }
                result.push({ type: 'link', value: url })
                lastIndex = index + url.length
        }
        if (lastIndex < text.length) {
                result.push({ type: 'text', value: text.slice(lastIndex) })
        }
        return result
}

function openLink(raw) {
        const normalized = normaliseUrl(raw)
        emit('link', normalized)
        /* #ifdef H5 */
        window.open(normalized, '_blank', 'noopener')
        /* #endif */
        /* #ifndef H5 */
        uni.setClipboardData({
                data: normalized,
                success() {
                        uni.showToast({ title: '链接已复制，可在浏览器中打开', icon: 'none' })
                }
        })
        /* #endif */
}

function normaliseUrl(url) {
        const trimmed = url.trim()
        if (/^https?:\/\//i.test(trimmed)) return trimmed
        return `https://${trimmed}`
}
</script>

<style scoped>
.msg-bubble {
        max-width: 70%;
        margin: 8px 0;
        padding: 12px;
        border-radius: 14px;
        font-size: 28rpx;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
        display: inline-flex;
        flex-wrap: wrap;
        user-select: text;
}

.from-me {
        align-self: flex-end;
        background: linear-gradient(135deg, #4b7bec, #3867d6);
        color: #ffffff;
        border-bottom-right-radius: 4px;
}

.from-bot {
        align-self: flex-start;
        background-color: #f1f2f6;
        color: #2f3542;
        border-bottom-left-radius: 4px;
}

.msg-text {
        font-size: 28rpx;
        line-height: 1.6;
}

.msg-link {
        color: #1e88e5;
        text-decoration: underline;
}

.from-me .msg-link {
        color: #d0e4ff;
}
</style>
