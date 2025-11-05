<template>
	<view class="music-card">
		<view class="music-header">
			<image v-if="widget?.cover" class="music-cover" :src="widget.cover" mode="aspectFill"></image>
			<view class="music-meta">
				<text class="music-title">{{ widget?.title || '音频播放' }}</text>
				<text v-if="widget?.artist" class="music-artist">{{ widget.artist }}</text>
			</view>
		</view>
		<view class="music-actions">
			<button size="mini" type="primary" @click="emitAction({ type: 'play', value: widget?.source })">
				{{ playing ? '暂停' : '播放' }}
			</button>
			<button
				v-for="(action, idx) in extraActions"
				:key="idx"
				class="music-extra"
				size="mini"
				type="default"
				@click="emitAction(action)"
			>
				{{ action.text || '操作' }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
	widget: {
		type: Object,
		default: () => ({})
	}
})

const emit = defineEmits(['action'])

const playing = ref(false)

const extraActions = computed(() => (Array.isArray(props.widget?.actions) ? props.widget.actions : []))

function emitAction(action) {
	if (!action) return
	if (action.type === 'play') {
		playing.value = !playing.value
	}
	emit('action', action)
}
</script>

<style scoped>
.music-card {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.music-header {
	display: flex;
	gap: 16rpx;
	align-items: center;
}

.music-cover {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	background-color: #f1f2f6;
}

.music-meta {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.music-title {
	font-weight: 600;
	font-size: 30rpx;
}

.music-artist {
	font-size: 24rpx;
	opacity: 0.8;
}

.music-actions {
	display: flex;
	gap: 12rpx;
}

.music-extra {
	background-color: rgba(0, 0, 0, 0.05);
}
</style>
