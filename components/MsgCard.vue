<template>
        <view :class="['card-wrapper', from === 'me' ? 'from-me' : 'from-bot']">
                <view class="card">
                        <view v-if="card?.title || card?.subtitle" class="card-header">
                                <text v-if="card?.icon" class="card-icon">{{ card.icon }}</text>
                                <view class="card-header-text">
                                        <text v-if="card?.title" class="card-title">{{ card.title }}</text>
                                        <text v-if="card?.subtitle" class="card-subtitle">{{ card.subtitle }}</text>
                                </view>
                        </view>
                        <text v-if="card?.description" class="card-description">{{ card.description }}</text>

                        <view v-if="hasFields" class="card-section">
                                <view v-for="(value, key) in card.fields" :key="key" class="card-field">
                                        <text class="field-key">{{ key }}</text>
                                        <text class="field-value">{{ value }}</text>
                                </view>
                        </view>

                        <template v-if="Array.isArray(card?.sections)">
                                <view v-for="(section, idx) in card.sections" :key="`section-${idx}`" class="card-section">
                                        <view v-if="section?.title" class="section-title">{{ section.title }}</view>
                                        <template v-if="section?.layout === 'key-value'">
                                                <view
                                                        v-for="(item, itemIdx) in section.items || []"
                                                        :key="`kv-${idx}-${itemIdx}`"
                                                        class="card-field"
                                                >
                                                        <text class="field-key">{{ item.label || item.key }}</text>
                                                        <text class="field-value">{{ item.value }}</text>
                                                </view>
                                        </template>
                                        <template v-else-if="section?.layout === 'list'">
                                                <view
                                                        v-for="(item, itemIdx) in section.items || []"
                                                        :key="`list-${idx}-${itemIdx}`"
                                                        class="list-item"
                                                >
                                                        <view class="list-item-header">
                                                                <text class="list-item-title">{{ item.title }}</text>
                                                                <text
                                                                        v-if="item.status"
                                                                        class="list-item-status"
                                                                        :class="`status-${item.status}`"
                                                                >
                                                                        {{ renderStatusLabel(item.status) }}
                                                                </text>
                                                        </view>
                                                        <text v-if="item.description" class="list-item-desc">{{ item.description }}</text>
                                                </view>
                                        </template>
                                        <template v-else>
                                                <text class="section-placeholder">暂不支持的布局：{{ section?.layout || 'unknown' }}</text>
                                        </template>
                                </view>
                        </template>

                        <template v-if="cardType === 'timeline' && Array.isArray(card?.timeline)">
                                <view class="timeline">
                                        <view v-for="(node, idx) in card.timeline" :key="`timeline-${idx}`" class="timeline-item">
                                                <view class="timeline-dot" :class="`status-${node.status || 'pending'}`"></view>
                                                <view class="timeline-content">
                                                        <view class="timeline-header">
                                                                <text class="timeline-time">{{ node.time }}</text>
                                                                <text class="timeline-title">{{ node.title }}</text>
                                                        </view>
                                                        <text v-if="node.description" class="timeline-desc">{{ node.description }}</text>
                                                </view>
                                        </view>
                                </view>
                        </template>

                        <template v-if="cardType === 'form' && card?.form">
                                <view class="form-preview">
                                        <view
                                                v-for="field in card.form.fields || []"
                                                :key="field.field || field.label"
                                                class="form-field"
                                        >
                                                <text class="field-label">{{ field.label || field.field }}</text>
                                                <text class="field-placeholder">{{ renderFieldPlaceholder(field) }}</text>
                                        </view>
                                </view>
                        </template>

                        <template v-if="cardType === 'media' && cardMedia">
                                <MsgAudio
                                        v-if="cardMedia.type === 'audio'"
                                        :audio="cardMedia"
                                        :from="from"
                                        @play="forwardMediaEvent('play', $event)"
                                        @pause="forwardMediaEvent('pause', $event)"
                                        @ended="forwardMediaEvent('ended', $event)"
                                />
                                <MsgVideo v-else-if="cardMedia.type === 'video'" :video="cardMedia" :from="from" />
                                <MsgFile
                                        v-else-if="cardMedia.type === 'file'"
                                        :file="cardMedia"
                                        :from="from"
                                        @open="forwardMediaEvent('open', $event)"
                                />
                                <MsgImage v-else-if="cardMedia.type === 'image'" :image="cardMedia" :from="from" />
                                <text v-else class="section-placeholder">暂不支持的媒体类型：{{ cardMedia.type }}</text>
                        </template>

                        <view v-if="Array.isArray(card?.actions) && card.actions.length" class="card-actions">
                                <button
                                        v-for="(action, idx) in card.actions"
                                        :key="`action-${idx}`"
                                        class="card-action"
                                        size="mini"
                                        :type="resolveActionType(action)"
                                        :disabled="Boolean(action?.disabled)"
                                        @click="handleAction(action)"
                                >
                                        {{ action.text || renderActionLabel(action) }}
                                </button>
                        </view>
                </view>
        </view>
</template>

<script setup>
import { computed } from 'vue'
import MsgAudio from './MsgAudio.vue'
import MsgVideo from './MsgVideo.vue'
import MsgFile from './MsgFile.vue'
import MsgImage from './MsgImage.vue'

const props = defineProps({
        card: {
                type: Object,
                default: () => ({})
        },
        from: {
                type: String,
                default: 'bot'
        }
})

const emit = defineEmits(['action', 'media'])

const cardType = computed(() => props.card?.card_type || 'general')

const hasFields = computed(() => {
        const fields = props.card?.fields
        return fields && Object.keys(fields).length > 0
})

const cardMedia = computed(() => props.card?.media || null)

function handleAction(action) {
        if (!action) return

        if (action.confirm) {
                uni.showModal({
                        title: '确认操作',
                        content: action.confirm,
                        success: ({ confirm }) => {
                                if (confirm) executeAction(action)
                        }
                })
                return
        }

        executeAction(action)
}

function executeAction(action) {
        if (action.type === 'link' && action.url) {
                const normalizedUrl = /^https?:\/\//i.test(action.url) ? action.url : `https://${action.url}`
                const title = action.title || props.card?.title || ''

                /* #ifdef H5 */
                window.open(normalizedUrl, '_blank', 'noopener')
                emit('action', { ...action, url: normalizedUrl })
                return
                /* #endif */

                /* #ifndef H5 */
                const target = `/uni_modules/uni-im/pages/common/webview/webview?url=${encodeURIComponent(normalizedUrl)}&title=${encodeURIComponent(
                        title
                )}`
                uni.navigateTo({
                        url: target,
                        success() {
                                emit('action', { ...action, url: normalizedUrl })
                        },
                        fail(error) {
                                console.warn('[MsgCard] open link failed', error)
                                uni.setClipboardData({
                                        data: normalizedUrl,
                                        success() {
                                                uni.showToast({ title: '已复制链接，可手动打开', icon: 'none' })
                                        }
                                })
                                emit('action', { ...action, url: normalizedUrl, status: 'failed' })
                        }
                })
                return
                /* #endif */

        }

        if (action.type === 'copy' && action.value) {
                uni.setClipboardData({
                        data: action.value,
                        success() {
                                uni.showToast({ title: '内容已复制', icon: 'none' })
                        }
                })
                emit('action', { ...action, status: 'copied' })
                return
        }

        if (action.type === 'open_widget' && action.widget_id) {
                emit('action', { ...action, widget: action.widget_id })
                return
        }

        emit('action', action)
}

function forwardMediaEvent(type, payload) {
        emit('media', { type, payload })
}

function renderStatusLabel(status) {
        switch (status) {
                case 'done':
                        return '已完成'
                case 'processing':
                        return '进行中'
                case 'warning':
                        return '需关注'
                default:
                        return '待处理'
        }
}

function renderFieldPlaceholder(field) {
        if (!field) return ''
        if (field.placeholder) return field.placeholder
        switch (field.type) {
                case 'select':
                        return '请选择'
                case 'textarea':
                        return '请输入内容'
                case 'image':
                        return `可上传 ${field.max_count || 3} 张图片`
                default:
                        return '填写内容'
        }
}

function renderActionLabel(action) {
        switch (action?.type) {
                case 'link':
                        return '查看链接'
                case 'postback':
                        return '触发事件'
                case 'submit_form':
                        return '提交'
                case 'open_widget':
                        return '打开'
                case 'interrupt':
                        return '打断'
                case 'copy':
                        return '复制'
                default:
                        return '操作'
        }
}

function resolveActionType(action) {
        if (action?.style === 'primary') return 'primary'
        if (action?.style === 'warn') return 'warn'
        return 'default'
}
</script>

<style scoped>
.card-wrapper {
        margin: 8px 0;
        display: flex;
}

.card-wrapper.from-me {
        justify-content: flex-end;
}

.card-wrapper.from-bot {
        justify-content: flex-start;
}

.card {
        max-width: 85%;
        padding: 18rpx 22rpx;
        border-radius: 18rpx;
        background-color: #ffffff;
        box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 16rpx;
}

.from-me .card {
        background-color: #4b7bec;
        color: #ffffff;
}

.card-header {
        display: flex;
        gap: 12rpx;
        align-items: center;
}

.card-icon {
        font-size: 36rpx;
}

.card-header-text {
        display: flex;
        flex-direction: column;
}

.card-title {
        font-size: 32rpx;
        font-weight: 600;
}

.card-subtitle {
        font-size: 26rpx;
        opacity: 0.85;
}

.card-description {
        font-size: 26rpx;
        line-height: 1.5;
        opacity: 0.9;
}

.card-section {
        display: flex;
        flex-direction: column;
        gap: 12rpx;
}

.section-title {
        font-size: 26rpx;
        font-weight: 600;
}

.card-field {
        display: flex;
        gap: 8rpx;
        font-size: 26rpx;
        line-height: 1.4;
}

.field-key {
        font-weight: 600;
}

.field-value {
        flex: 1;
        opacity: 0.9;
}

.list-item {
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 12rpx;
        padding: 12rpx;
        display: flex;
        flex-direction: column;
        gap: 6rpx;
}

.from-me .list-item {
        background-color: rgba(255, 255, 255, 0.15);
}

.list-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
}

.list-item-title {
        font-size: 28rpx;
        font-weight: 600;
}

.list-item-status {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 999px;
        background-color: rgba(46, 213, 115, 0.15);
        color: #2ed573;
}

.status-warning {
        background-color: rgba(255, 159, 67, 0.18);
        color: #ff9f43;
}

.status-processing {
        background-color: rgba(74, 144, 226, 0.18);
        color: #4a90e2;
}

.status-pending {
        background-color: rgba(207, 216, 220, 0.18);
        color: #607d8b;
}

.timeline {
        display: flex;
        flex-direction: column;
        gap: 16rpx;
}

.timeline-item {
        display: flex;
        gap: 16rpx;
}

.timeline-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        margin-top: 6rpx;
        background-color: #dfe4ea;
}

.timeline-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4rpx;
}

.timeline-header {
        display: flex;
        gap: 12rpx;
        align-items: baseline;
}

.timeline-time {
        font-size: 24rpx;
        opacity: 0.7;
}

.timeline-title {
        font-size: 28rpx;
        font-weight: 600;
}

.timeline-desc {
        font-size: 24rpx;
        opacity: 0.85;
}

.form-preview {
        display: flex;
        flex-direction: column;
        gap: 12rpx;
}

.form-field {
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 12rpx;
        padding: 12rpx 16rpx;
        display: flex;
        flex-direction: column;
        gap: 6rpx;
}

.from-me .form-field {
        background-color: rgba(255, 255, 255, 0.15);
}

.field-label {
        font-size: 26rpx;
        font-weight: 600;
}

.field-placeholder {
        font-size: 24rpx;
        opacity: 0.7;
}

.card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
}

.card-action {
        border-radius: 999px;
        padding: 0 28rpx;
        background-color: rgba(0, 0, 0, 0.06);
        color: inherit;
}

.from-me .card-action {
        background-color: rgba(255, 255, 255, 0.2);
        color: #ffffff;
}

.section-placeholder {
        font-size: 24rpx;
        opacity: 0.7;
}
</style>
