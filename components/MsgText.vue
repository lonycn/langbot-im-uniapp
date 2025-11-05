<template>
	<view :class="['msg-bubble', from === 'me' ? 'from-me' : 'from-bot']">
		<text class="msg-text">{{ text }}</text>
	</view>
</template>

<script setup>
defineProps({
	text: {
		type: String,
		default: ''
	},
	from: {
		type: String,
		default: 'bot'
	}
})
</script>

<style scoped>
.msg-bubble {
	max-width: 70%;
	margin: 8px 0;
	padding: 12px;
	border-radius: 14px;
	font-size: 28rpx;
	line-height: 1.4;
	white-space: pre-wrap;
	word-break: break-word;
}

.from-me {
	align-self: flex-end;
	background-color: #4b7bec;
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
}
</style>
