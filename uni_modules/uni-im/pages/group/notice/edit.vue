<template>
	<view class="group-notice-edit">
		<text v-if="isWidescreen" class="navigator">
			{{where._id ? '编辑' : '新建'}}公告
		</text>
		<uni-im-editor class="editor" ref="group-notice-editor" @input="onEditorInput" :enter-send="false"></uni-im-editor>
		<view class="btns-box">
			<!-- 取消 更新 发布 删除 -->
			<button class="btn" @click="navigateBack" type="default">取消</button>
			<button class="btn" @click="comfrom" type="primary" :disabled="! (where._id ? isUpdate : inputContent)">{{where._id ? '更新' : '发布' }}</button>
		</view>
	</view>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	const dbJQL = uniCloud.databaseForJQL()
	export default {
		data() {
			return {
				where: {
					group_id: ''
				},
				imgSrcMap:{},
				// 文本框原始内容
				inputContent: '',
				orginContent: '',
			}
		},
		computed: {
			...uniIm.mapState(['isWidescreen']),
			isUpdate(){
				return this.inputContent != '' && JSON.stringify(this.inputContent) != JSON.stringify(this.orginContent)
			}
		},
		onLoad(param) {
			this.$nextTick(() => {
				this.load(param)
			})
		},
		methods: {
			async load(param,eventChannel) {
				this.orginContent = ''
				this.imgSrcMap = {}
				this.inputContent = ''
				// console.log('eventChannel',eventChannel)
				
				if(this.isWidescreen) {
					this.getOpenerEventChannel = ()=>{
						return {
							emit: (name, data)=>{
								eventChannel[name](data)
							}
						}
					}
				}
				
				Object.assign(this.where, param)
				// console.log('where', this.where)
				if (this.where._id) {
					const res = await dbJQL.collection('uni-im-group-notice').where(this.where).get()
					// console.log('res', res)
					const content = res.data[0]?.content.body
					if(Array.isArray(content)){
						for(let i = 0; i < content.length; i++){
						  if(content[i].name === "img" && content[i]?.attrs?.src.indexOf('qiniu://') === 0  ){
						    const src = await uniIm.utils.getTempFileURL(content[i].attrs.src)
						    this.imgSrcMap[src] = content[i].attrs.src
						    content[i].attrs.src = src
						  }
						}
					}
					// console.error('6666666', this.$refs['group-notice-editor'])
					// console.log('content', content)
					this.$refs['group-notice-editor'].callRmd('$setContent',content)
				}
			},
			async comfrom() {
				// 确认发布
				uni.showLoading({mask: true})
				const content = await	this.getNoticeContent()
				const eventChannel = this.getOpenerEventChannel?.()
				// console.log('content',content)
				const noticeCollection = dbJQL.collection('uni-im-group-notice')
				try {
					if (this.where._id) {
						// 更新
						const res = await noticeCollection.where(this.where).update({
							content
						})
						console.log('res', res,eventChannel)
						eventChannel.emit('update', {
							_id: this.where._id,
							content
						})
					} else {
						// 发布
						const res = await noticeCollection.add({
							content,
							group_id: this.where.group_id,
						})
						console.log('res', res)
						eventChannel.emit('add', {
							_id: res.id,
							content,
							group_id: this.where.group_id,
							user_id: uniIm.currentUser._id,
							create_time: Date.now()
						})
					}
				} catch (e) {
					console.error('e', e)
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					})
				}
				uni.hideLoading()
				this.navigateBack()
			},
			navigateBack() {
				if (this.isWidescreen) {
					this.$emit('back')
				} else {
					uni.navigateBack()
				}
			},
			async getNoticeContent() {
			  let msg = {
			    "from_uid": "system",
			    "type": "text",
			    "body": this.inputContent
			  }
			  if (typeof this.inputContent == 'object'){
			    msg = {
			      "type":"rich-text",
			      body: await this.inputContent.getHtmlArray().uploadImg()
			    }
			  }else{
			    // 把this.inputContent中的&nbsp;变成空格，再把头尾的空格去掉
			    this.inputContent = this.inputContent.replace(/&nbsp;/g, ' ').trim()
			  }
			  // console.log('msg',msg)
				return msg
			},
			onEditorInput(e){
			  this.inputContent = e.value
				if(this.orginContent === ''){
					this.orginContent = e.value
				}
			}
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.group-notice-edit {
	background-color: #FFF;
	width: 100%;
	overflow: hidden;
	.navigator {
		padding-top: 10px;
		font-size: 16px;
		text-align: center;
	}
	.editor {
		border: 1px solid #eee;
		margin: 10px;
		padding: 10px;
		::v-deep {
			.uni-im-editor {
				max-height: unset;
				height: 400px;
				-webkit-user-modify: read-write;
			}
			img {
			  max-width: 100% !important;
			}
		}
	}
	.btns-box {
		flex-direction: row;
		justify-content: flex-end;
		.btn {
			margin: 10px;
			width: 100px;
			font-size: 12px;
		}
	}
}
</style>