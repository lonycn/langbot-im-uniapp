<template>
  <view>
    <!-- 注意:根节点都view不能去掉，否则鼠标右键出不来菜单 -->
    <uni-im-img max-width="200px" :src="msg.body.url" :width="msg.body.width" :height="msg.body.height" mode="widthFix" @click="previewImage" class="img" />
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    props: {
      msg: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        
      }
    },
    methods: {
      async previewImage() {
        // console.log(213);
        uni.showLoading();
        let url = await uniIm.utils.getTempFileURL(this.msg.body.url)
        uni.previewImage({
          urls: [url],
          complete() {
            uni.hideLoading()
          }
        })
      }
    }
  }
</script>

<style>
.img {
  width: 400rpx;
  /* border: 1px solid #aaa; */
  box-shadow: 0 0px 2px -1px #aaa;
  border-radius: 5px;
}
</style>
