<template>
	<view class="sound-buttom-box">
		<view @touchmove="touchmove" @touchstart="recordStart" @touchend="recordEnd" @touchcancel="recordEnd"
			class="sound-buttom" :class="{recordState}">
			<view v-if="soundProgress" class="sound-progress" :style="{'width':soundProgress}"></view>
			<text class="sound-text">{{recordState?'录音中（'+time+'s）':'按住 说话'}}</text>
			<view class="sound-tip" v-if="recordState">
				<text class="sound-tip-text" :style="{color:cancel?'#f70000':'#FFFFFF'}">{{cancel?'松手取消':'松手发送，上划取消'}}</text>
				<view class="closeIcon" :style="{'background-color':cancel?'#f70000':'#EEEEEE'}">
					<uni-im-icons class="icon" code="e61a" size="10px" color="#FFFFFF"></uni-im-icons>
				</view>
			</view>
		</view>
    <view v-if="recordState" :style="{bottom:markBottom}" class="mark"></view>
	</view>
</template>

<script>
	// #ifndef H5
	const recorderManager = uni.getRecorderManager();
	// #endif

	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	let soundInterval,soundPath,startTime;
	export default {
		emits: ['sendSoundMsg'],
		data() {
			return {
				recordState:0,
				soundProgress:0,
				cancel:false,
				time:0,
				phoneBH:0
			}
		},
		computed:{
      ...uniIm.mapState(['systemInfo']),
			markBottom(){
				let markBottom = 67;
				// #ifndef H5
				markBottom += this.systemInfo.safeAreaInsets.bottom/2
				// #endif
        console.log('markBottom',markBottom);
				return markBottom  + 'px'
			},
		},
		created() {
			// #ifndef H5
			recorderManager.onStop((res)=> {
				console.log('recorderManager.onStop',{res});
				if(!this.cancel){
					if(this.time < 2){
						return uni.showToast({
							title: '语音时间过短',
							icon: 'none'
						});
					}
					uni.showLoading({
						title: '上传中',
						mask: false
					});
					uniCloud.uploadFile({
						filePath:res.tempFilePath,
						cloudPath:'uni-im/' + uniIm.currentUser._id + '/sound/' + Date.now() + '.mp3',
						// fileType:"audio",
						success: (e) => {
							// console.log('uniCloud.uploadFile-sendSoundMsg',e,'sendSoundMsg',{"url":e.fileID,time:this.time});
							try{
								this.$emit('sendSoundMsg',{"url":e.fileID,time:this.time})
							}catch(e){
								console.error(e);
							}
							uni.hideLoading()
						},
						fail: (e) =>{
							console.log(e);
							uni.showModal({
								content: JSON.stringify(e),
								showCancel: false,
								confirmText: '知道了'
							});
						},
						complete: (e) =>{
							console.log('complete',e);
							uni.hideLoading()
						}
					})
				}else{
					console.log('用户取消了录音功能','this.time:'+this.time);
				}
			});
			
			recorderManager.onStart(e=>{
				// console.log(e);
			})
			recorderManager.onPause(e=>{
				// console.log(e);
			})
			recorderManager.onError(e=>{
				console.error(e);
			})
			// #endif
		},
		methods: {
			touchmove(e){
        let touchY = e.touches[0].clientY + this.systemInfo.statusBarHeight + this.systemInfo.safeArea.top
        // #ifdef H5
        touchY += 44
        // #endif
        this.cancel = this.systemInfo.safeArea.bottom - touchY > 66
			},
			recordStart(e){
				// 关闭正在播放的sound
				uniIm.audioContext.stop()
				this.time = 0
				
				// #ifdef H5
				// 防止H5端 调试出现鼠标右键菜单
				window.oncontextmenu = function () { return false; }
				// #endif

				// #ifdef H5
				// return uni.showToast({
				// 	title: 'h5端不支持语音功能',
				// 	icon: 'none'
				// });
				// #endif

				// #ifndef H5
				recorderManager.start({
					sampleRate:16000,
					numberOfChannels:2,
					format:"mp3"
				});
				// #endif

				startTime = Date.now()

				console.log('recordStart');

				//进度条
				this.recordState = 1
				soundInterval = setInterval(()=>{
					this.soundProgress = parseInt(this.soundProgress) + uni.upx2px(450/60) +'px'
					// console.log('this.soundProgress',this.soundProgress);
					this.time = parseInt((Date.now() - startTime) / 1000)
				},1000)
				// e.preventDefault();
			},
			recordEnd(){
				// #ifndef H5
				recorderManager.stop();
				// #endif
				console.log('recordEnd');
				clearInterval(soundInterval)
				setTimeout(()=> {
					this.recordState = 0
					this.soundProgress = 0
					this.cancel = false
				}, 300);
			}
		}
	}
</script>

<style lang="scss">
  .sound-buttom-box {
    height: 100%;
  }
	.sound-buttom {
		background-color: #ffffff;
		padding: 10px;
		width: 100%;
    flex: 1;
		// border-radius: 10px;
		font-size: 16px;
		align-items: flex-start;
		justify-content: center;
		overflow:hidden;
	}
	.sound-text{
		position: relative;
		left: -20rpx;
		width: 450rpx;
		font-size: 14px;
		text-align: center;
	}
	.sound-tip{
		position: fixed;
		left: 0;
		bottom: 110px;
    z-index: 9;
		width: 750rpx;
		text-align: center;
		justify-content: center;
		align-items: center;
	}
	.sound-tip-text{
		margin-bottom: 10px;
		color: #999999;
		font-size: 14px;
	}
	.closeIcon{
		width: 30px;
		height: 30px;
		background-color: #DDDDDD;
		border-radius: 100px;
		justify-content: center;
		align-items: center;
	}
  /* #ifdef MP-WEIXIN */
  // 纠正微信小程序的icon位置
  .closeIcon .icon{
    position: relative;
    top: -2px;
  }
  /* #endif */
	.sound-progress {
		// border-radius: 10px;
		height: 44px;
		position: absolute;
		left: 0;
		top: 0;
		padding: 0;
		transition: width 0.2s linear;
		background-color: #2faf4c;
		opacity: 0.3;
	}
	
	.recordState{
		background-color: #efefef;
	}
	
	.mark{
		width: 750rpx;
		position: fixed;
		top: 0;
		left: 0;
		bottom: 57px;
		right: 0;
		background:rgba(0,0,0,0.7);
		flex: 1;
	}
</style>
