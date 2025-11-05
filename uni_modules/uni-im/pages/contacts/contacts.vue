<template>
	<view @click="hiddenDeleteBtn" class="contacts-pages">
		<uni-list :border="false" class="menu-list-box" v-if="showMenu">
			<uni-list-item v-for="(menu,menuIndex) in menuList" :key="menuIndex" :title="menu.title" link
				@click="openPages(menu)" :showBadge="true" :class="{activeMenu:isOpenItemTitle === menu.title}">
				<template v-slot:header>
					<view class="slot-icon-box green">
						<image class="slot-icon" :src="'/uni_modules/uni-im/static/noticeIcon/' + menu.srcName + '.png'"
							mode="widthFix"></image>
					</view>
				</template>
			</uni-list-item>
			<uni-list-item v-for="(item,index) in noticeList" :key="item.id" :title="item.title" :showBadge="true"
				:badgeText="item.badge" :badgeStyle="item.badgeStyle" link @click="openPages(item)" :border="false"
				:class="{activeMenu:isOpenItemTitle === item.title}">
				<template v-slot:header>
					<view class="slot-icon-box blue">
						<image class="slot-icon" :src="item.icon" mode="widthFix"></image>
					</view>
				</template>
			</uni-list-item>
		</uni-list>

		<text class="title">好友列表</text>
		<uni-list v-if="showUser" :border="false" class="user-list-box" :scroll-y="true">
			<uni-list-item v-for="(item, index) in friendList" :key="item._id" :customStyle="{padding:0}"
				class="user-list-item">
				<template v-slot:body>
					<scroll-view scroll-x="true" @scroll="scroll" :scroll-left="activeIndex === index ?'':scrollLeft[index]"
						:show-scrollbar="false" :scroll-with-animation="true" class="user-list-item-scroll-view">
						<view class="user-list-item-scroll-view-item" @click="toChat(item)"
							@touchstart.passive="activeIndex = index">
							<image class="avatar"
								:src="item.avatar_file&&item.avatar_file.url ? item.avatar_file.url : '/uni_modules/uni-im/static/avatarUrl.png'"
								mode="widthFix"></image>
							<text class="username">{{item.nickname}}</text>
							<button @click.stop="deleteItem(item,index,$event)" class="delete-btn" size="mini"
								type="warn">删除</button>
						</view>
					</scroll-view>
				</template>
			</uni-list-item>
			<uni-list-item :customStyle="{padding:0,backgroundColor:'#FFFFFF'}">
				<template v-slot:body>
					<uni-im-load-state :status="friendHasMore?'loading':'noMore'"></uni-im-load-state>
				</template>
			</uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	const db = uniCloud.database()
	export default {
		emits: ['clickMenu'],
		props: {
			// pc端时会控制隐藏
			showMenu: {
				type: Boolean,
				default: true
			},
			// pc端时会控制隐藏
			showUser: {
				type: Boolean,
				default: true
			},
		},
		data() {
			return {
				isOpenItemTitle: '',
				scrollLeft: {
					0: 0,
					1: 1
				},
				activeIndex: false,
				menuList: [{
						title: '加人/加群',
						path: './addPeopleGroups/addPeopleGroups',
						srcName: 'search'
					},
					{
						title: '群聊列表',
						path: './groupList/groupList',
						srcName: 'group'
					},
					{
						title: '创建群聊',
						path: './createGroup/createGroup',
						srcName: 'createGroup'
					}
				]
			}
		},
		computed: {
			//是否为pc宽屏（width>960px）
			isWidescreen() {
				return uniIm.isWidescreen
			},
			friendList() {
				return uniIm.friend.dataList
			},
			friendHasMore() {
				return uniIm.friend.hasMore
			},
			noticeList() {
				return [{
						title: "新朋友",
						param: {
							type: ['uni-im-friend-invite']
						},
						icon: "/uni_modules/uni-im/static/noticeIcon/newFriend.png"
					},
					{
						title: "群通知",
						param: {
							type: ['uni-im-group-join-request']
						},
						icon: "/uni_modules/uni-im/static/noticeIcon/groupNotice.png"
					},
					{
						title: "系统通知",
						param: {
							excludeType: ['uni-im-group-join-request', 'uni-im-friend-invite']
						},
						icon: "/uni_modules/uni-im/static/noticeIcon/notification.png"
					}
				].reduce((sum, item, index) => {
					let {
						param: filterNotice,
						title
					} = item,
					param = {
						filterNotice,
						title
					}
					// console.log('param----',param);
					sum.push({
						title: item.title,
						badge: this.getUnreadCount(item.param),
						badgeStyle: {
							backgroundColor: '#d60000'
						},
						path: "./notification/notification?param=" + encodeURIComponent(JSON.stringify(param)),
						param,
						icon: item.icon,
						id: Date.now() + '-' + index
					})
					return sum
				}, [])
			}
		},
		onPullDownRefresh() {
			this.$refs.udb.loadData({
				clear: true
			}, () => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			// this.$refs.udb.loadMore()
		},
		mounted() {},
		methods: {
			openPages(item) {
				this.isOpenItemTitle = item.title
				// #ifdef H5
				if (this.isWidescreen) {
					let componentName = 'uni-im-' + item.path.split('/')[1],
						param = item.param
					return this.$emit('clickMenu', {
						componentName,
						param,
						title: item.title
					})
				}
				// #endif
				// console.log('item',item);
				uni.navigateTo({
					url: item.path,
					fail: (e) => {
						console.error(e, item.path);
					}
				})
			},
			getUnreadCount(param) {
				return uniIm.notification.unreadCount(param)
			},
			toChat(item) {
        uniIm.toChat({user_id: item._id})
			},
			hiddenDeleteBtn() {
				this.activeIndex = false
				this.$nextTick(() => {
					for (let i in this.scrollLeft) {
						this.$set(this.scrollLeft, i, 0)
						// this.scrollLeft[i] = 0
					}
				})
			},
			async deleteItem(item, index, event) {
				uni.showModal({
					title: '确认要删除好友吗',
					content: '此操作不可撤销',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确认',
					complete: async (e) => {
						if (e.confirm) {
							uni.showLoading({
								mask: true
							});
							await db.collection('uni-im-friend').where({
								friend_uid: item._id,
								user_id: uniIm.currentUser._id
							}).remove()
							uni.hideLoading()
							// 收到push消息后会自动，将此用户从列表中移除
						}
					}
				});
				this.hiddenDeleteBtn()
				event.stopPropagation()
				event.preventDefault()
			},
			scroll(e) {
				// console.log(this.inMove);
				this.$set(this.scrollLeft, this.activeIndex, e.detail.scrollLeft)
				// this.scrollLeft[this.activeIndex] = e.detail.scrollLeft
				for (let i in this.scrollLeft) {
					if (i != this.activeIndex) {
						this.$set(this.scrollLeft, i, 0)
						// this.scrollLeft[i] = 0
					}
				}
			},
			handleItemClick(id) {
				uni.navigateTo({
					url: './detail?id=' + id
				})
			},
			fabClick() {
				// 打开新增页面
				uni.navigateTo({
					url: './add',
					events: {
						// 监听新增数据成功后, 刷新当前页面数据
						refreshData: () => {
							this.$refs.udb.loadData({
								clear: true
							})
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.contacts-pages {
  height: 100%;
  background-color: #FFF;
  position: relative;
  
  .menu-list-box {
    .uni-list-item {
      cursor: pointer;
      &:hover {
        background-color: #FBFBFB !important;
      }
    }
  }
  
  .title {
    padding: 8px;
    font-size: 14px;
  }
  
  .user-list-box {
    flex: 1;
  }
  
  .user-list-item {
    padding: 0;
  }
  
  .user-list-item-scroll-view {
    width: 750rpx;
    background-color: #ffffff;
  }
  
  .user-list-item-scroll-view-item {
    width: 880rpx;
    position: relative;
    height: 60px;
    align-items: center;
    padding: 8px 15px;
    flex-direction: row;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .avatar {
    background-color: #fefefe;
    width: 40px;
    height: 40px;
    border-radius: 5px;
  }
  
  .username {
    line-height: 30px;
    margin-left: 30rpx;
    font-size: 16px;
  }
  
  .delete-btn {
    border-radius: 0;
    position: absolute;
    right: 0;
    top: 0;
    height: 60px;
    line-height: 60px;
    width: 130rpx;
    font-size: 26rpx;
    padding: 0;
  }
  
  .slot-icon-box {
    width: 45px;
    height: 45px;
    align-items: center;
    justify-content: center;
    border-radius: 10rpx;
    margin-right: 20rpx;
  }
  
  .slot-icon {
    width: 25px;
    height: 25px;
  }
  
  .warn {
    background-color: #FA9E3B;
  }
  
  .green {
    background-color: #08C060;
  }
  
  .blue {
    background-color: #5DBAFF;
  }
}
</style>