<template>
	<view class="chat-page">
		<view class="chat-header">
			<view class="title-area">
				<text class="title">LangBot 会话</text>
				<text class="subtitle">会话ID：{{ convId }}</text>
			</view>
			<view class="status-area">
				<text class="status-dot" :class="connectionStatus"></text>
				<text class="status-text">{{ statusLabel }}</text>
				<button class="settings-btn" size="mini" @click="toggleSettings">{{ settingsVisible ? '收起' : '设置' }}</button>
			</view>
		</view>

		<view v-if="settingsVisible" class="settings-panel">
			<view class="settings-row">
				<text class="settings-label">WS 地址</text>
				<input class="settings-input" v-model="wsUrlInput" placeholder="ws://127.0.0.1:8765" />
			</view>
			<view class="settings-row">
				<text class="settings-label">HTTP 地址</text>
				<input class="settings-input" v-model="httpUrlInput" placeholder="http://127.0.0.1:8080" />
			</view>
			<view class="settings-actions">
				<button type="primary" @click="applySettings">保存并重连</button>
			</view>
		</view>

		<scroll-view scroll-y class="chat-body" :scroll-with-animation="true" :scroll-into-view="scrollAnchor">
			<view class="message-list">
				<view v-for="(msg, index) in messages" :key="msg.id || index" :id="`msg-${index}`" class="message-row" :class="msg.from">
					<view v-if="msg.from === 'system'" class="system-tip">{{ msg.text }}</view>
					<MsgText v-else-if="msg.msg_type === 'text'" :text="msg.text" :from="msg.from" />
					<MsgCard
						v-else-if="msg.msg_type === 'card'"
						:card="msg.card"
						:from="msg.from"
						@action="handleCardAction"
						@media="handleCardMediaEvent"
					/>
					<MsgImage v-else-if="msg.msg_type === 'image'" :image="msg.image" :from="msg.from" />
					<MsgAudio v-else-if="msg.msg_type === 'audio'" :audio="msg.audio" :from="msg.from" />
					<MsgVideo v-else-if="msg.msg_type === 'video'" :video="msg.video" :from="msg.from" />
					<MsgFile v-else-if="msg.msg_type === 'file'" :file="msg.file" :from="msg.from" @open="handleFileOpen" />
					<MsgWidget
						v-else-if="msg.msg_type === 'widget'"
						:widget="msg.widget"
						:from="msg.from"
						@action="handleWidgetAction"
					/>
					<MsgText v-else :text="fallbackText(msg)" :from="msg.from" />
				</view>
			</view>
		</scroll-view>

		<view v-if="systemTip" class="system-status">{{ systemTip }}</view>

		<view class="input-bar">
			<input class="chat-input" v-model="inputText" placeholder="请输入消息，例如：报修单 R2025xxxx 状态？" confirm-type="send" @confirm="handleSend" />
			<button class="send-btn" type="primary" @click="handleSend" :disabled="!inputText.trim()">发送</button>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import MsgText from '@/components/MsgText.vue'
import MsgCard from '@/components/MsgCard.vue'
import MsgImage from '@/components/MsgImage.vue'
import MsgAudio from '@/components/MsgAudio.vue'
import MsgVideo from '@/components/MsgVideo.vue'
import MsgFile from '@/components/MsgFile.vue'
import MsgWidget from '@/components/MsgWidget.vue'
import { configureWS, connectWS, onWSMessage, sendWSMessage, closeWS } from '@/utils/langbot.ws.js'
import { configureHttp } from '@/utils/langbot.http.js'
import { getToken, setToken, getUserId, setUserId } from '@/utils/auth.js'

const HISTORY_STORAGE_KEY = 'langbot_chat_history'
const MAX_HISTORY_LENGTH = 100

const defaultWsURL = uni.getStorageSync('langbot_ws_url') || 'ws://127.0.0.1:8765'
const defaultHttpURL = uni.getStorageSync('langbot_http_base') || 'http://127.0.0.1:8080'

const config = reactive({
	wsUrl: defaultWsURL,
	httpUrl: defaultHttpURL
})

const wsUrlInput = ref(config.wsUrl)
const httpUrlInput = ref(config.httpUrl)
const settingsVisible = ref(false)

const userId = ref(getUserId() || `guest_${Date.now()}`)
if (!getUserId()) {
	setUserId(userId.value)
}
const convId = ref('c_langbot')

const messages = ref([])
const inputText = ref('')
const systemTip = ref('')
const scrollAnchor = ref('')
const connectionStatus = ref('connecting')
const activeStreamId = ref(null)

let unsubscribeWS = null

const statusLabel = computed(() => {
	switch (connectionStatus.value) {
		case 'connected':
			return '已连接'
		case 'reconnecting':
			return '重连中...'
		case 'error':
			return '连接异常'
		case 'closed':
			return '已断开'
		default:
			return '连接中...'
	}
})

function loadHistory() {
	try {
		const raw = uni.getStorageSync(HISTORY_STORAGE_KEY)
		if (!raw) return
		const data = typeof raw === 'string' ? JSON.parse(raw) : raw
		if (Array.isArray(data)) {
			messages.value = data.map((item) => normalizeMessage(item))
		}
	} catch (error) {
		console.warn('[chat] load history failed', error)
	}
}

function persistHistory() {
	try {
		const snapshot = messages.value.slice(-MAX_HISTORY_LENGTH)
		uni.setStorageSync(HISTORY_STORAGE_KEY, JSON.stringify(snapshot))
	} catch (error) {
		console.warn('[chat] persist history failed', error)
	}
}

function normalizeMessage(payload = {}) {
	return {
		id: payload.id || `msg-${Date.now()}`,
		from: payload.from || 'bot',
		msg_type: payload.msg_type || 'text',
		text: typeof payload.text === 'string' ? payload.text : '',
		card: payload.card ?? null,
		image: payload.image ?? null,
		audio: payload.audio ?? null,
		video: payload.video ?? null,
		file: payload.file ?? null,
		widget: payload.widget ?? null,
		media: payload.media ?? null,
		meta: { ...(payload.meta || {}) },
		ts: payload.ts || Date.now(),
		streaming: !!payload.streaming
	}
}

function appendMessage(payload = {}) {
	const record = normalizeMessage(payload)
	messages.value.push(record)
	trimMessages()
	persistHistory()
	scrollToBottom()
	return record.id
}

function updateMessage(id, patch = {}) {
	const index = messages.value.findIndex((msg) => msg.id === id)
	const base = index !== -1 ? messages.value[index] : normalizeMessage({ id })
	const merged = normalizeMessage({
		...base,
		...patch,
		card: patch.card !== undefined ? patch.card : base.card,
		image: patch.image !== undefined ? patch.image : base.image,
		audio: patch.audio !== undefined ? patch.audio : base.audio,
		video: patch.video !== undefined ? patch.video : base.video,
		file: patch.file !== undefined ? patch.file : base.file,
		widget: patch.widget !== undefined ? patch.widget : base.widget,
		media: patch.media !== undefined ? patch.media : base.media,
		meta: { ...(base.meta || {}), ...(patch.meta || {}) },
		ts: patch.ts || base.ts,
		streaming: patch.streaming !== undefined ? !!patch.streaming : base.streaming
	})

	if (index === -1) {
		messages.value.push(merged)
	} else {
		messages.value.splice(index, 1, merged)
	}
	trimMessages()
	persistHistory()
	scrollToBottom()
	return merged
}

function trimMessages() {
	if (messages.value.length > MAX_HISTORY_LENGTH) {
		const overflow = messages.value.length - MAX_HISTORY_LENGTH
		messages.value.splice(0, overflow)
	}
}

function scrollToBottom() {
	nextTick(() => {
		scrollAnchor.value = `msg-${messages.value.length - 1}`
	})
}

function initNetwork() {
	configureHttp({
		baseURL: config.httpUrl,
		getAuthToken: getToken
	})

	configureWS({
		url: config.wsUrl,
		userId: userId.value,
		convId: convId.value,
		getAuthToken: getToken,
		onOpen: () => {
			activeStreamId.value = null
			systemTip.value = '已连接 LangBot Adapter'
		},
		onClose: () => {
			systemTip.value = '连接断开，正在尝试重连...'
		},
		onError: () => {
			systemTip.value = '连接异常，请检查配置或稍后再试'
		},
		onStatusChange: (status) => {
			connectionStatus.value = status
			if (status === 'connecting') {
				systemTip.value = '正在连接 LangBot Adapter...'
			} else if (status === 'reconnecting') {
				systemTip.value = '连接断开，正在尝试重连...'
			} else if (status === 'closed') {
				systemTip.value = '连接已关闭'
			}
		}
	})

	connectWS()

	if (typeof unsubscribeWS === 'function') {
		unsubscribeWS()
	}
	unsubscribeWS = onWSMessage(handleWSMessage)
}

function handleWSMessage(message) {
	if (!message || typeof message !== 'object') {
		return
	}

	switch (message.type) {
		case 'system':
			handleSystemMessage(message)
			break
		case 'reply':
			handleBotReply(message)
			break
		case 'error':
			handleErrorMessage(message)
			break
		default:
			appendMessage({
				id: `unknown-${Date.now()}`,
				from: 'bot',
				msg_type: 'text',
				text: JSON.stringify(message)
			})
	}
}

function handleSystemMessage(message) {
	if (message.text) {
		systemTip.value = message.text
	}
}

function handleBotReply(message) {
	const payload = message.payload || {}
	const converted = normalizePayload(payload)
	if (converted.msg_type === 'widget') {
		console.log('[chat] widget payload', converted.widget, 'raw', message.payload)
	}
	const topMeta = message.meta || {}
	const combinedMeta = { ...(payload.meta || {}), ...(topMeta || {}) }
	const isChunk = topMeta && topMeta.is_final === false
	const baseData = {
		from: 'bot',
		msg_type: converted.msg_type,
		text: converted.text,
		card: converted.card,
		image: converted.image,
		audio: converted.audio,
		video: converted.video,
		file: converted.file,
		widget: converted.widget,
		media: converted.media,
		meta: combinedMeta,
		ts: message.server_ts || Date.now(),
		streaming: isChunk
	}

	if (isChunk) {
		systemTip.value = 'AI 正在回复...'
		if (!activeStreamId.value) {
			activeStreamId.value = appendMessage({
				...baseData,
				id: `stream-${Date.now()}`
			})
		} else {
			updateMessage(activeStreamId.value, baseData)
		}
		return
	}

	if (activeStreamId.value) {
		updateMessage(activeStreamId.value, { ...baseData, streaming: false })
		activeStreamId.value = null
		systemTip.value = ''
		return
	}

	appendMessage({
		...baseData,
		id: `bot-${Date.now()}`
	})
	systemTip.value = ''
}

function normalizePayload(payload = {}) {
	const media = payload.media || null
	let msgType = payload.msg_type
	if (!msgType) {
		if (payload.card) {
			msgType = 'card'
		} else if (payload.image) {
			msgType = 'image'
		} else if (payload.audio || media?.type === 'audio') {
			msgType = 'audio'
		} else if (payload.video || media?.type === 'video') {
			msgType = 'video'
		} else if (payload.file || media?.type === 'file') {
			msgType = 'file'
		} else if (payload.widget) {
			msgType = 'widget'
		} else {
			msgType = 'text'
		}
	}
	const resolvedAudio = payload.audio || (media?.type === 'audio' ? media : null)
	const resolvedVideo = payload.video || (media?.type === 'video' ? media : null)
	const resolvedFile = payload.file || (media?.type === 'file' ? media : null)
	return {
		msg_type: msgType,
		text: payload.text || '',
		card: payload.card || null,
		image: payload.image || null,
		audio: resolvedAudio,
		video: resolvedVideo,
		file: resolvedFile,
		widget: payload.widget || null,
		media
	}
}

function handleErrorMessage(message) {
	const errorText = message.message || message.text || '系统错误'
	systemTip.value = errorText
	appendMessage({
		id: `error-${Date.now()}`,
		from: 'system',
		msg_type: 'text',
		text: `错误：${errorText}`
	})
}

function sendUserTextMessage(text) {
	const trimmed = text.trim()
	if (!trimmed) {
		return
	}

	appendMessage({
		id: `me-${Date.now()}`,
		from: 'me',
		msg_type: 'text',
		text: trimmed,
		ts: Date.now()
	})

	sendWSMessage({
		type: 'message',
		client_ts: Date.now(),
		user_id: userId.value,
		conv_id: convId.value,
		payload: {
			msg_type: 'text',
			text: trimmed
		}
	})
}

function handleSend() {
	const text = inputText.value
	sendUserTextMessage(text)
	inputText.value = ''
}

function handleCardAction(action) {
	if (!action || typeof action !== 'object') {
		return
	}
	switch (action.type) {
		case 'postback':
		case 'reply':
			sendPostbackAction(action)
			break
		case 'submit_form':
			systemTip.value = action.text ? `请填写表单：${action.text}` : '表单提交流程待实现'
			emitActionMessage(action, { note: 'form_submit_requested' })
			break
		case 'interrupt':
			sendInterrupt()
			break
		default:
			emitActionMessage(action)
	}
}

function handleWidgetAction(action) {
	handleCardAction(action)
}

function handleCardMediaEvent(event) {
	if (!event) return
	console.debug('[chat] card media event', event)
}

function handleFileOpen(file) {
	console.debug('[chat] file open', file)
}

function sendPostbackAction(action) {
	let replyText = ''
	if (typeof action.value === 'string') {
		replyText = action.value
	} else if (action.value && typeof action.value === 'object' && typeof action.value.text === 'string') {
		replyText = action.value.text
	} else if (action.payload && typeof action.payload.text === 'string') {
		replyText = action.payload.text
	} else if (typeof action.text === 'string') {
		replyText = action.text
	}
	if (replyText) {
		appendMessage({
			id: `me-${Date.now()}`,
			from: 'me',
			msg_type: 'text',
			text: replyText,
			meta: { action }
		})
	}
	emitActionMessage(action, { user_text: replyText })
	systemTip.value = action.text ? `已选择：${action.text}` : ''
}

function emitActionMessage(action, extraMeta = {}) {
	sendWSMessage({
		type: 'message',
		client_ts: Date.now(),
		user_id: userId.value,
		conv_id: convId.value,
		payload: {
			msg_type: 'postback',
			text: action.text || `[${action.type}]`,
			meta: {
				action,
				...extraMeta
			}
		}
	})
}

function sendInterrupt() {
	sendWSMessage({
		type: 'interrupt',
		client_ts: Date.now(),
		user_id: userId.value,
		conv_id: convId.value
	})
	systemTip.value = '已发送打断请求'
}

function fallbackText(msg) {
	if (!msg) return ''
	if (msg.text) return msg.text
	return JSON.stringify(msg)
}

function toggleSettings() {
	settingsVisible.value = !settingsVisible.value
}

function applySettings() {
	config.wsUrl = wsUrlInput.value.trim()
	config.httpUrl = httpUrlInput.value.trim()
	uni.setStorageSync('langbot_ws_url', config.wsUrl)
	uni.setStorageSync('langbot_http_base', config.httpUrl)

	closeWS()
	initNetwork()
	settingsVisible.value = false
	systemTip.value = '连接已刷新'
}

onMounted(() => {
	const token = getToken()
	if (!token) {
		setToken('')
	}
	loadHistory()
	initNetwork()
	scrollToBottom()
})

onBeforeUnmount(() => {
	if (typeof unsubscribeWS === 'function') {
		unsubscribeWS()
	}
	closeWS()
})
</script>

<style scoped>
.chat-page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f4f6fb;
	padding: 0 20rpx 30rpx;
	box-sizing: border-box;
}

.chat-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
}

.title-area {
	display: flex;
	flex-direction: column;
}

.title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1e272e;
}

.subtitle {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: #808e9b;
}

.status-area {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.status-dot {
	width: 14rpx;
	height: 14rpx;
	border-radius: 50%;
	background-color: #ffa502;
}

.status-dot.connected {
	background-color: #2ed573;
}

.status-dot.reconnecting {
	background-color: #ffa502;
}

.status-text {
	font-size: 24rpx;
	color: #57606f;
}

.settings-btn {
	font-size: 24rpx;
}

.settings-panel {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.settings-row {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.settings-label {
	font-size: 24rpx;
	color: #57606f;
}

.settings-input {
	padding: 12rpx 18rpx;
	border-radius: 10rpx;
	background-color: #f1f2f6;
	font-size: 26rpx;
}

.settings-actions {
	display: flex;
	justify-content: flex-end;
}

.chat-body {
	flex: 1;
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 20rpx;
	box-sizing: border-box;
	overflow: hidden;
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.message-row {
	display: flex;
}

.message-row.me {
	justify-content: flex-end;
}

.message-row.bot {
	justify-content: flex-start;
}

.system-tip {
	align-self: center;
	font-size: 24rpx;
	color: #a4b0be;
	padding: 8rpx 14rpx;
	background-color: rgba(164, 176, 190, 0.2);
	border-radius: 20rpx;
}

.system-status {
	font-size: 22rpx;
	color: #a4b0be;
	text-align: center;
	margin: 12rpx 0;
}

.input-bar {
	margin-top: 16rpx;
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.chat-input {
	flex: 1;
	background-color: #ffffff;
	border-radius: 999px;
	padding: 18rpx 26rpx;
	font-size: 28rpx;
	box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
}

.send-btn {
	padding: 0 36rpx;
	border-radius: 999px;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 28rpx;
}
</style>
