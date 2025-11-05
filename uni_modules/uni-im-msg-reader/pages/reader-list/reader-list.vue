<template>
  <view class="reader-list-page">
    <uni-im-msg-reader ref="msg-reader" :msg="msg" :hiddenState="true"></uni-im-msg-reader>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    data() {
      return {
        msg: {}
      }
    },
    onLoad(param) {
      // console.log('onload', param);
      this.msg = uniIm.conversation.find(param.conversationId).msg.find(param.msgId)
      this.$nextTick(() => {
        const msgReader = this.$refs['msg-reader']
        msgReader.readStateCanShow = false;
        msgReader.showReaderList();
        if(msgReader.unreadUserList.length === 0){
          msgReader.currentIndex = 1
        }
      });
    },
    methods: {
    }
  }
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
page,.reader-list-page {
  width: 100%;
  height: 100%;
}
</style>
