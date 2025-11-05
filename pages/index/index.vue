<template>
	<view>
		<uni-list>
			<uni-list-item
				title="uni-im 会话列表" @click="toPath('/uni_modules/uni-im/pages/index/index')" :link="true"
				:show-badge="unreadMsgCount>0" :badge-text="unreadMsgCount+''" :badge-style="{'background':'#f41500'}"
			></uni-list-item>
			<uni-list-item
				title="用户列表" @click="toPath('/uni_modules/uni-im/pages/userList/userList')" :link="true"
			></uni-list-item>
			<uni-list-item
				title="通讯录" @click="toPath('/uni_modules/uni-im/pages/contacts/contacts')" :link="true"
				:show-badge="notificationUnreadCount>0" :badge-text="notificationUnreadCount+''" :badge-style="{'background':'#f41500'}"
			></uni-list-item>
			<uni-list-item
				title="个人中心" @click="toPath('/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true')" :link="true"
			></uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	export default {
		computed: {
			unreadMsgCount(){
				return uniIm.conversation.unreadCount()
			},
			notificationUnreadCount(){
				return uniIm.notification.unreadCount()
			}
		},
		data() {
			return {
			}
		},
		async onReady() {
		},
		methods: {
			//未读系统通知数量
			toPath(path){
				uni.navigateTo({
					url: path,
					fail: () => {
						uni.switchTab({
							url:path,
							fail: (e) => {
								console.error(e);
							}
						})
					}
				});
			}
		}
	}
</script>

<style>
</style>