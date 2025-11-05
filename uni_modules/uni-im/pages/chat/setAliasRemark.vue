<template>
	<uni-popup ref="popup" type="center">
	<view class="set-alias-remark" @click="close">
		<view class="content" @click.stop>
			<view class="title">设置别名和备注</view>
			<view class="item">
				<view>别名</view>
				<uni-easyinput :disabled="!aliasDataReady" class="input" v-model="alias" :placeholder="aliasDataReady ? '请输入别名' : '加载中...'" clearable trim="all" />
			</view>
			<view class="item">
				<view>备注</view>
				<uni-easyinput :disabled="!remarkDataReady" class="input" v-model="remark" :placeholder="remarkDataReady ? '请输入备注' : '加载中...'" clearable trim="all" type="textarea" />
			</view>
			<view class="btns">
				<button class="btn" @click="close">关闭</button>
				<button class="btn" type="primary" @click="submit" :disabled="!aliasIsChange && !remarkIsChange">更新</button>
			</view>
		</view>
	</view>
	</uni-popup>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	const db = uniCloud.databaseForJQL()
	export default {
		data() {
			return {
				alias: '',
				remark: '',
				target_uid: '',
				oldAlias: false,
				oldRemark: false,
				aliasDataReady: false,
				remarkDataReady: false
			}
		},
		computed: {
			// 通过别名和备注的数据准备状态来判断是否可以提交
			aliasIsChange() {
				return this.aliasDataReady && this.oldAlias !== this.alias;
			},
			remarkIsChange() {
				return this.remarkDataReady && this.oldRemark !== this.remark;
			}
		},
		methods: {
			open(target_uid) {
				this.target_uid = target_uid;
				const where = `target_uid == "${this.target_uid}" && user_id == $cloudEnv_uid`
				db.collection('uni-im-user-remark').where(where).get()
				.then(res => {
					this.remark = res.data[0]?.content;
					this.oldRemark = this.remark
					this.remarkDataReady = true;
				});
				db.collection('uni-im-user-alias').where(where).get()
				.then(res => {
					this.alias = res.data[0]?.content;
					this.oldAlias = this.alias;
					this.aliasDataReady = true;
				});
				this.$refs.popup.open();
			},
			async submit(){
				uni.showLoading({
					title: '提交中',
					mask: true
				});
				const where = `target_uid == "${this.target_uid}" && user_id == $cloudEnv_uid`
				try {
					// 先判断是否更新了备注和别名，再进行更新或添加
					if (this.remarkIsChange) {
						if (this.oldRemark) {
							await db.collection('uni-im-user-remark').where(where).update({
								content: this.remark
							});
						} else {
							await db.collection('uni-im-user-remark').add({
								target_uid: this.target_uid,
								content: this.remark
							})
						}
					}
					if (this.aliasIsChange) {
						if (this.oldAlias) {
							await db.collection('uni-im-user-alias').where(where).update({
								content: this.alias
							});
						} else {
							await db.collection('uni-im-user-alias').add({
								target_uid: this.target_uid,
								content: this.alias
							})
						}
						uniIm.userAlias[this.target_uid] = this.alias;
					}
				} catch(e) {
					console.error(e);
				}
				uni.hideLoading();
				this.close();
			},
			close() {
				this.$refs.popup.close();
				// 重置数据
				this.alias = '';
				this.remark = '';
				this.oldAlias = false;
				this.oldRemark = false;
				this.aliasDataReady = false;
				this.remarkDataReady = false;
			}
		}
	}
</script>

<style lang="scss">
.set-alias-remark {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	.content {
		width: 350px;
		max-width: 90%;
		margin: auto auto;
		border-radius: 10px;
		background-color: #fff;
		padding: 20px 0;
		.title {
			font-size: 18px;
			text-align: center;
			line-height: 50px;
		}
		.item {
			padding: 15px 25px;
			.input {
				height: 30px;
				margin-top: 10px;
			}
		}
		.btns {
			justify-content: space-around;
			margin-top: 20px;
			flex-direction: row;
			.btn {
				width: 100px;
			}
		}
	}
}
</style>
