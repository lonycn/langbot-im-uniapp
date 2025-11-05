<template>
  <view class="msg-content file-msg-box" @click="downLoadFile" ref="msg-content">
    <view class="file-msg-info" :class="{downloading}">
			<view class="progress" v-if="downloading">
				下载中：{{downloadProgress}}%
			</view>
      <text class="name">{{fileName}}</text>
      <text class="size">{{fileSize}}</text>
    </view>
    <uni-im-icons code="e7d0" size="50" color="#EEEEEE" class="file-icon" />
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
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
    computed: {
			downloading() {
				return this.downloadProgress != 0 && this.downloadProgress != 100
			},
      fileSize() {
        if (this.msg.type == 'file') {
          let size = this.msg.body.size
          if (size < Math.pow(1024, 1)) {
            return parseInt(size * 10) / 10 + 'B'
          } else if (size < Math.pow(1024, 2)) {
            return parseInt(size / Math.pow(1024, 1) * 10) / 10 + 'KB'
          } else if (size < Math.pow(1024, 3)) {
            return parseInt(size / Math.pow(1024, 2) * 10) / 10 + 'MB'
          } else {
            return 'err'
          }
        }
        return 'err'
      },
      fileName() {
        if (this.msg.type == 'file') {
          let name = this.msg.body.name
          if (name.length < 30) {
            return name
          } else {
            return name.slice(0, 15) + '...' + name.slice(-15)
          }
        }
        return ''
      }
    },
    data() {
      return {
				downloadProgress: 0
      }
    },
    methods: {
      async downLoadFile() {
        const url = await uniIm.utils.getTempFileURL(this.msg.body.url)
        const downloadTask = uni.downloadFile({
          url,
          success: (res) => {
            if (res.statusCode === 200) {
              // console.log('下载成功');
              // console.log(res.tempFilePath);
							
							// #ifdef H5
							// 触发下载
							const a = document.createElement('a');
							a.style.display = 'none';
							a.href = res.tempFilePath;
							a.download = this.msg.body.name || 'file';
							a.target = '_blank';
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
							// #endif
							
							// #ifndef H5
              uni.saveFile({
                tempFilePath: res.tempFilePath,
                success: (res) => {
                  // console.log('res',res);
                  uni.openDocument({
                    filePath: res.savedFilePath
                  })
                }
              });
							// #endif
            }
          }
        });
				
				downloadTask.onProgressUpdate((res) => {
					console.log('下载进度' + res.progress);
					console.log('已经下载的数据长度' + res.totalBytesWritten);
					console.log('预期需要下载的数据总长度' + res.totalBytesExpectedToWrite);
					this.downloadProgress = parseInt(res.totalBytesWritten / this.msg.body.size * 100)
				})
				
      }
    }
  }
</script>

<style lang="scss">
  .file-msg-box.msg-content {
    background-color: #FFFFFF;
    width: 500rpx;
    padding: 10px;
    border-radius: 8px;
    flex-direction: row;
    justify-content: space-between;
		/* #ifdef H5 */
		cursor: pointer;
		/* #endif */
    .file-msg-info {
			position: relative;
      flex: 1;
      flex-direction: column;
      justify-content: space-around;
			.progress {
				position: absolute;
				font-size: 14px;
				height: 100%;
				width: 100%;
				top: 0;
				left: 0;
				background-color: #FFF;
				opacity: 0.8;
				justify-content: center;
				align-items: center;
			}
      .name {
        word-break: break-all;
        font-size: 16px;
      }
      .size {
        font-size: 12px;
        color: #666;
      }
    }
    .file-icon {
    }
  }
</style>