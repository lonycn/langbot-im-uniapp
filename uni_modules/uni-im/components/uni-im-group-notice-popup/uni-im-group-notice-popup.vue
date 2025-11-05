<template>
	<uni-popup ref="group-notice-popup" type="center" :mask-click="false">
		<view class="uni-im-group-notice-popup">
			<group-notice :msg="{ body: { content: this.notice.content }, create_time: notice.create_time }">
				<template v-slot>
					<view class="btn-box">
						<button class="btn" type="primary" plain size="mini" @click="close">知道了</button>
					</view>
				</template>
			</group-notice>
		</view>
	</uni-popup>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import groupNotice from '@/uni_modules/uni-im/components/uni-im-msg/types/group-notice.vue'
  export default {
		options: {
			styleIsolation: 'shared' // 解除样式隔离
		},
		components: {
			groupNotice
		},
    data() {
      return {
        notice:{},
				isOpened: false
      }
    },
		watch: {
			isOpened(val){
				if(val){
					uniIm.onMsg(this.hasNewMsg)
				} else {
					uniIm.offMsg(this.hasNewMsg)
					this.notice = {}
				}
			}
		},
		methods: {
			hasNewMsg(res){
				// console.log('hasNewMsg-----------------',res)
				const msg = res.data.payload.data
				if (msg.action == 'setUnreadGroupNoticeId') {
					if(msg.body.type === 'delete' && this.notice._id === msg.body.notice_id){
						console.log('删除群公告')
						this.isOpened = false
						this.$refs['group-notice-popup'].close();
						uni.showToast({
							title: '此群公告已被删除',
							icon: 'none'
						});
					}
				}
			},
			async open({group_id,notice_id}) {
				
				if( this.isOpened ){
					this.$refs['group-notice-popup'].close();
					open.call(this)
				} else {
					open.call(this)
				}
				
				async function open(){
					this.isOpened = true
					const dbJQL = uniCloud.databaseForJQL()
					const res = await dbJQL.collection('uni-im-group-notice').where({group_id,_id: notice_id})
					.orderBy('create_time', 'desc')
					.limit(1)
					.get()
					this.notice = res.data[0]
					console.log('群公告', res,'this.notice',this.notice)
					this.conversation = await uniIm.conversation.get('group_' + this.notice.group_id)
					this.$refs['group-notice-popup'].open();
				}
			},
			close() {
				this.isOpened = false
				this.$refs['group-notice-popup'].close();
				const db = uniCloud.database();
				db.collection('uni-im-conversation')
				.where({
				  id:this.conversation.id,
				  user_id: uniIm.currentUser._id
				})
				.update({
				  unread_group_notice_id: ''
				}).then(res => {
				  this.conversation.unread_group_notice_id = ''
				  console.log('群公告设为已读，成功', res)
				}).catch(err => {
				  console.error('群公告设为已读，失败', err)
				})
			},
		}
  }
</script>

<style lang="scss">
  .uni-im-group-notice-popup {
		background-color: #FFF;
		border-radius: 8px;
		::v-deep .group-notice-box .group-notice{
			margin: 0;
			.content {
				max-height: 750rpx;
				overflow: auto;
				/* #ifdef H5 */
				@media screen and (min-device-width:960px){
					max-height: 80vh;
				}
				/* #endif */
			}
		}
		.btn-box {
			background-color: #FFF;
			padding: 10px 0;
			.btn {
				margin: 0 10px;
			}
		}
	}
</style>