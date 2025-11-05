<template>
	<component :is="'msg-'+msg.type" :class="'msg-'+msg.type" :msg="msg"
	  @viewMsg="$emit('viewMsg',$event)"
	  cementing="MsgByType"
		:imgMaxWidth="imgMaxWidth"
	></component>
</template>

<script>
	// 导入各类型的消息组件
	import msgUserinfoCard from './types/userinfo-card.vue'
	import msgVideo from './types/video.vue'
	import msgFile from './types/file.vue'
	import msgHistory from './types/history.vue'
	import msgRichText from './types/rich-text.vue'
	import msgCode from './types/code.vue'
	import msgText from './types/text.vue'
	import msgSound from './types/sound.vue'
	import msgImage from './types/image.vue'
	import msgOrder from './types/order.vue'
	import msgPayNotify from './types/pay-notify.vue'
	import msgEncryption from './types/encryption.vue'
	export default {
		emits: ['viewMsg'],
		components: {
		  msgUserinfoCard,
		  msgVideo,
		  msgFile,
		  msgHistory,
		  msgRichText,
		  msgCode,
		  msgText,
		  msgSound,
		  msgImage,
		  msgOrder,
		  msgPayNotify,
		  msgEncryption
		},
		props: {
		  msg: {
		    type: Object,
		    default () {
		      return {
		        body: ""
		      }
		    }
		  },
			imgMaxWidth: {
				type: [String, Number],
				default: '200px'
			}
		}
	}
</script>
<style>
</style>