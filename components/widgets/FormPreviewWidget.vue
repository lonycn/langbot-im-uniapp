<template>
	<view class="form-card">
		<text class="form-title">{{ widget?.title || '表单预览' }}</text>
		<view v-if="Array.isArray(widget?.fields)" class="form-field-list">
			<view v-for="field in widget.fields" :key="field.field || field.label" class="form-field">
				<text class="field-label">{{ field.label || field.field }}</text>
				<text class="field-value">{{ renderPlaceholder(field) }}</text>
			</view>
		</view>
		<view class="form-actions">
			<button
				v-if="widget?.submit_text"
				size="mini"
				type="primary"
				@click="emitAction({ type: 'submit_form', value: { form_ref: widget?.form_ref || widget?.id } })"
			>
				{{ widget.submit_text }}
			</button>
			<button
				v-if="widget?.cancel_text"
				size="mini"
				type="default"
				@click="emitAction({ type: 'cancel_form', value: { form_ref: widget?.form_ref || widget?.id } })"
			>
				{{ widget.cancel_text }}
			</button>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	widget: {
		type: Object,
		default: () => ({})
	}
})

const emit = defineEmits(['action'])

function emitAction(action) {
	if (!action) return
	emit('action', action)
}

function renderPlaceholder(field) {
	if (!field) return ''
	if (field.placeholder) return field.placeholder
	switch (field.type) {
		case 'select':
			return '请选择'
		case 'textarea':
			return '请输入文本'
		case 'image':
			return `可上传 ${field.max_count || 3} 张图片`
		default:
			return '填写内容'
	}
}
</script>

<style scoped>
.form-card {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.form-title {
	font-weight: 600;
	font-size: 30rpx;
}

.form-field-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.form-field {
	background-color: rgba(0, 0, 0, 0.04);
	border-radius: 12rpx;
	padding: 12rpx 16rpx;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.field-label {
	font-size: 26rpx;
	font-weight: 500;
}

.field-value {
	font-size: 24rpx;
	opacity: 0.75;
}

.form-actions {
	display: flex;
	gap: 12rpx;
}
</style>
