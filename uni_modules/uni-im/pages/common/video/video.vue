<template>
  <view v-if="url" class="video-box" :class="{'is-float-mode':mode == 'float'}" @click="showCloseBtnFn">
    <view class="mask" v-if="mode == 'float'"></view>
  	<video ref="video" @click="showCloseBtnFn" :src="url" :autoplay="true" :page-gesture="true" :show-mute-btn="true" :show-fullscreen-btn="mode == 'float'" class="video"></video>
		<cover-view class="close-icon" @click="close">关闭</cover-view>
  </view>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	export default {
		data() {
			return {
				url:"",
				showCloseBtn:true,
        // 全屏模式和小窗模式，fullscreen为全屏模式，float为小窗模式
        mode: 'fullscreen',
			};
		},
		onLoad({url}) {
			// console.log({url});
			this.url = url
			setTimeout(()=> {
				this.showCloseBtn = false
			}, 1000);
		},
    mounted(){
      // console.log('mounted');
      uni.$on('uni-im-playVideo',(url)=>{
        this.mode = 'float'
        this.url = url
        this.showCloseBtn = true
      })
      
      // 监听esc按键，关闭视频
      // #ifdef H5
      uniIm.utils.appEvent.onKeyDown(evt => this.onDownEscapeKey(), {
        order: 1000,
        match: {
          key: 'Escape',
          altKey: false,
          ctrlKey: false,
          shiftKey: false,
        }
      })
      // #endif
    },
    beforeDestroy(){
      // #ifdef H5
      uniIm.utils.appEvent.offKeyDown(this.onDownEscapeKey)
      // #endif
    },
		methods:{
      onDownEscapeKey() {
        if (this.url.length) {
          this.close()
        }
        return true
      },
			close(){
        if(this.mode == 'fullscreen'){
          uni.navigateBack()
        }else{
          this.url = ''
        }
			},
			showCloseBtnFn(){
				console.log('showCloseBtnFn');
				this.showCloseBtn = true
        if(this.mode == 'fullscreen'){
          setTimeout(()=> {
          	this.showCloseBtn = false
          }, 5000);
        }
			}
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";

page {
  height: 100%;
}
.video-box {
  flex: 1;
  .video{
    width: 100vw;
    height: 100%;
  }
	.close-icon{
  	position: absolute;
  	top: 35px;
  	left: 20px;
  	z-index: 9;
		color: #CCC;
		border: 1px solid #CCC;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 10px;
		font-size: 14px;
		text-align: center;
		padding: 0 10px;
		/* #ifdef H5 */
    cursor: pointer;
    /* #endif */ 
	}
  &.is-float-mode,
  &.is-float-mode .video{
  	position: fixed;
  	top: 10vh;
    left: calc(10vw + 250px);
    width: calc(80vw - 220px) !important;
    height: 80vh !important;
    z-index: 9;
  }
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
}
</style>
