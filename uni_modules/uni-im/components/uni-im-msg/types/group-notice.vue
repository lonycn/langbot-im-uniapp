<template>
<view class="group-notice-box">
	<text v-if="msg.is_revoke" class="is_revoke">公告已被撤回</text>
	<view v-else class="group-notice">
		<view class="header">
			<view class="title-box">
				<uni-icons size="26" type="sound-filled" color="#0cc8fa"></uni-icons>
				<text class="title">群公告</text>
			</view>
			<text class="create_time">{{friendlyTime}}</text>
		</view>
		<view class="content">
			<msg-content :msg="msg.body.content" imgMaxWidth="550rpx"></msg-content>
		</view>
		<!-- 加一个默认插槽 -->
		<slot></slot>
	</view>
</view>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import msgContent from '@/uni_modules/uni-im/components/uni-im-msg/msg-content.vue'
	export default {
		components: {
			msgContent
		},
		props: {
			msg: {
				type: Object,
				default () {
					return {
						body: ""
					}
				}
			}
		},
		data() {
			return {}
		},
		computed: {
			friendlyTime() {
				return uniIm.utils.toFriendlyTime(this.msg.create_time || this.msg.client_create_time)
			}
		},
		methods: {},
		watch: {},
		mounted() {},
	}
</script>

<style lang="scss">
.group-notice-box {
	.is_revoke {
		text-align: center;
		color: #999;
		font-size: 12px;
	}
	.group-notice {
		background-color: #FFF;
		border-radius: 10px;
		min-width: 200px;
		max-width: 600rpx;
		/* #ifdef H5 */
		@media screen and (min-device-width:960px){
			max-width: 700px;
		}
		/* #endif */
		margin:0 20px;
		padding: 10px 5px;
		.header{
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			margin:0 10px;
			.title-box {
				flex-direction: row;
				align-items: center;
				.title {
					padding-left: 5px;
					font-size: 16px;
				}
			}
			.create_time {
				font-size: 12px;
				color: #999;
			}
		}
	}
}
</style>