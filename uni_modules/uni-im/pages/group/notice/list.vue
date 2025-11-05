<template>
	<view class="group-notice-list">
		<view v-if="isWidescreen" class="navigator">
			<text class="title">群公告列表</text>
			<uni-icons @click="$emit('close')" type="clear" size="20" color="#BBB"></uni-icons>
		</view>
		<scroll-view class="group-notice-content" :scroll-y="true">
			<unicloud-db v-slot:default="{data, loading, error, options}" collection="uni-im-group-notice" ref="udb" loadtime="manual" :where="where" orderby="create_time desc">
				<view v-for="(item,index) in data" :key="index" class="notice-item">
					<uni-im-msg :msg="{...item.content,'from_uid':item.user_id,'create_time':item.create_time}" preview ></uni-im-msg>
					<view v-if="isAdmin" class="btns-box">
						<button class="btn" type="warn" plain @click="remove(item)">删除</button>
						<button class="btn" type="primary" @click="toEdit(item._id)">编辑</button>
					</view>
				</view>
				<uni-im-load-state :status="loading ? 'loading' : ''" :contentText='{
					"contentrefresh": "加载中...",
					"contentnomore": data.length ? "没有更多了" : "暂无数据"
				}'/>
				<view v-if="error">{{error.message}}</view>
			</unicloud-db>
		</scroll-view>
		<uni-fab v-if="isAdmin" @click="toEdit(false)" horizontal="right"></uni-fab>
		<uni-popup ref="notice-edit-pop" type="center">
			<notice-edit ref="notice-edit" @back="$refs['notice-edit-pop'].close()"></notice-edit>
		</uni-popup>
	</view>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import msgRichText from '@/uni_modules/uni-im/components/uni-im-msg/types/rich-text.vue'
	import noticeEdit from '@/uni_modules/uni-im/pages/group/notice/edit.vue';
	export default {
		emits: ['close'],
		computed: {
			...uniIm.mapState(['isWidescreen'])
		},
		components: {
			msgRichText,
			noticeEdit
		},
		data() {
			return {
				where: {},
				isAdmin: false
			}
		},
		onLoad(param) {
			this.$nextTick(()=>{
				this.load(param)
			})
		},
		methods: {
			async remove(item){
				uni.showModal({
					content: '确认删除该公告？',
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								mask: true
							});
							// 为了适配触发器的权限验证，必须传_id + group_id
							const {_id,group_id} = item
							const dbJQL = uniCloud.databaseForJQL()
							await dbJQL.collection('uni-im-group-notice')
							.where({_id,group_id})
							.remove()
							.then(res=>{
								this.$refs.udb.dataList = this.$refs.udb.dataList.filter(it=>it._id !== item._id)
							})
							.catch(err=>{
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							})
							.finally(()=>{
								uni.hideLoading();
							})
						}
					}
				});
			},
			load({group_id}){
				// console.log('group_id',group_id)
				this.where.group_id = group_id
				this.$refs.udb.loadData()
				const groupObj = uniIm.group.find(group_id)
				// console.log('groupObj',groupObj)
				this.isAdmin = groupObj?.member.find(uniIm.currentUser._id)?.role.includes('admin')
				// console.log('isAdmin',this.isAdmin)
			},
			toEdit(_id){
				const dataList = this.$refs.udb.dataList
				const events = {
					update(value){
						console.log('events update',value)
						dataList.forEach(item=>{
							if(item._id === value._id){
								Object.assign(item,value)
							}
						})
					},
					add(value){
						console.log('events add',value)
						dataList.unshift(value)
					}
				}
				
				if(uniIm.isWidescreen){
					this.$refs['notice-edit-pop'].open()
					setTimeout(()=>{
						this.$refs['notice-edit'].load({
							_id,
							group_id: this.where.group_id
						},events)
					},0)
				} else {
					let url = '/uni_modules/uni-im/pages/group/notice/edit?group_id=' + this.where.group_id
					if(_id){
						url += '&_id=' + _id
					}
					uni.navigateTo({
						url,
						events
					})
				}
			}
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
page {
	background-color: #FAFAFA;
	flex: 1;
	height: 100%;
}
.group-notice-list {
	height: 100%;
	flex: 1;
	.group-notice-content {
		height: 0;
		flex: 1;
	}
	.navigator {
		flex-direction: row;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 50px;
		background-color: #f5f5f5;
		.title {
			font-size: 16px;
			text-align: center;
		}
		::v-deep .uni-icons {
			position: absolute;
			right: 10px;
			/* #ifdef H5 */
			cursor: pointer;
			/* #endif */
		}
	}
	.notice-item {
		padding: 10px 0;
		background-color: #fff;
		margin-bottom: 10px;
		.btns-box {
			flex-direction: row;
			margin-top: 10px;
			justify-content: flex-end;
			.btn {
				margin-right: 10px;
				font-size: 12px;
			}
		}
	}
	::v-deep {
		.uni-fab__circle {
			position: absolute;
			bottom: 10px;
		}
		.group-notice-edit {
			border-radius: 10px;
			width: 600px;
		}
	}
}
</style>
