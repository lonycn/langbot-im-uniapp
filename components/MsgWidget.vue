<template>
	<view :class="['widget-bubble', from === 'me' ? 'from-me' : 'from-bot']">
		<view class="widget-body">
			<MusicPlayerWidget
				v-if="type === 'music_player'"
				:widget="widget"
				@action="forwardAction"
			/>
			<FormPreviewWidget
				v-else-if="type === 'form_preview'"
				:widget="widget"
				@action="forwardAction"
			/>
			<WebViewWidget
				v-else-if="type === 'webview'"
				:widget="widget"
			/>
			<view v-else class="widget-unknown">
				<text class="widget-title">{{ widget?.title || '未知组件' }}</text>
				<text class="widget-hint">暂不支持渲染此类型（{{ widget?.type || 'unknown' }}）</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, watch } from 'vue'
import MusicPlayerWidget from './widgets/MusicPlayerWidget.vue'
import FormPreviewWidget from './widgets/FormPreviewWidget.vue'
import WebViewWidget from './widgets/WebViewWidget.vue'

const props = defineProps({
	widget: {
		type: Object,
		default: () => ({})
	},
	from: {
		type: String,
		default: 'bot'
	}
})

const emit = defineEmits(['action'])

const type = computed(() => (props.widget?.type || '').toLowerCase())

watch(
	() => props.widget,
	(val) => {
		console.log('[MsgWidget] render widget =>', val?.type, val)
	},
	{ immediate: true, deep: true }
)

function forwardAction(action) {
	emit('action', action)
}
</script>

<style scoped>
.widget-bubble {
	max-width: 90%;
	margin: 8px 0;
	display: flex;
}

.widget-bubble.from-me {
	justify-content: flex-end;
}

.widget-bubble.from-bot {
	justify-content: flex-start;
}

.widget-body {
	width: 520rpx;
	max-width: 620rpx;
	padding: 16rpx;
	border-radius: 16rpx;
	background-color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.from-me .widget-body {
	background-color: #4b7bec;
	color: #ffffff;
}

.widget-unknown {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.widget-title {
	font-weight: 600;
	font-size: 28rpx;
}

.widget-hint {
	font-size: 24rpx;
	opacity: 0.85;
}
</style>
