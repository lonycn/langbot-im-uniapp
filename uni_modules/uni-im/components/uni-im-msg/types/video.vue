<template>
  <view class="video-box" @click="playVideo">
    <image class="video-img" mode="aspectFill" :src="videoPoster" />
    <view class="video-box-mark" />
    <uni-im-icons code="e650" size="35" color="#FFF" class="play-video-icon" />
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  import config from '@/uni_modules/uni-im/common/config.js';
  export default {
    props: {
      msg: {
        type: Object,
        default () {
          return {
            body: ""
          }
        }
      },
    },
    data() {
      return {
        videoPoster: '', //视频封面
        videoUrl: '', //视频地址
      }
    },
    watch: {
      'msg.body': {
        async handler(msgBody) {
          this.videoUrl = await uniIm.utils.getTempFileURL(this.msg.body.url)
          //设置videoPoster
          if (this.videoUrl.indexOf('blob:') === 0) {
            // #ifdef H5
            try {
              let videoEl = document.createElement("video");
              videoEl.src = this.videoUrl
              videoEl.currentTime = 1
              let canvasEl = document.createElement("canvas");
              let context = canvasEl.getContext("2d");
              // console.log('videoEl',videoEl);
              videoEl.addEventListener('loadeddata', () => {
                canvasEl.width = videoEl.videoWidth;
                canvasEl.height = videoEl.videoHeight;
                context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
                let firstFrameUrl = canvasEl.toDataURL();
                // console.log('firstFrameUrl',firstFrameUrl);
                this.videoPoster = firstFrameUrl
              });
            } catch (e) {
              console.error('浏览器环境，获取本地视频封面失败。将使用默认图片', e)
              this.videoPoster = '/uni_modules/uni-im/static/msg/video-uploading.gif'
            }
            // #endif
             
            // #ifndef H5
            this.videoPoster = '/uni_modules/uni-im/static/msg/video-uploading.gif'
            // #endif
          }else{
            // 如果链接带?号则加&否则加?
            this.videoPoster = this.videoUrl + (this.videoUrl.indexOf('?') > -1 ? '&' : '?')
            // 根据文件存储的服务商，传不同的参数获取视频封面
            const paramObj = {
              aliyun: 'x-oss-process=video/snapshot,t_0,f_jpg,w_200,m_fast,ar_auto',
              tencent: 'imageView2/0/w/200',
              qiniu: 'vframe/jpg/offset/0/w/200'
            }
            this.videoPoster += paramObj[config.cloudFile.provider]
            // console.log('this.videoPoster',this.videoPoster);
          }
        },
        deep: true,
        immediate: true
      }
    },
    mounted() {
    },
    methods: {
      async playVideo() {
        let url = await uniIm.utils.getTempFileURL(this.msg.body.url)
        if (uniIm.isWidescreen) {
          uni.$emit('uni-im-playVideo', url)
        } else {
          uni.navigateTo({
            url: "/uni_modules/uni-im/pages/common/video/video?url=" + url,
            animationDuration: 300,
            animationType: "fade-in"
          })
        }
      },
    }
  }
</script>

<style lang="scss">
  .video-box {
    /* #ifdef H5 */
    cursor: pointer;
    /* #endif */
    width: 200rpx;
    height: 200rpx;
    position: relative;
    .video-img {
      width: 200rpx;
      height: 200rpx;
    }
    .video-box-mark {
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.1);
    }
    .play-video-icon {
      position: absolute;
      top: calc(50% - 17.5px);
      left: calc(50% - 17.5px);
      width: 35px;
      height: 35px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      border: 2px solid #FFF;
      background-color: rgba(0, 0, 0, 0.2);
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    }
  }
</style>