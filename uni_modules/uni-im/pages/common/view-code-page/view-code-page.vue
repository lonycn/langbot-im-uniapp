<template>
  <view class="code-view">
    <!-- 默认不启用代码浏览模块，如有需要请关闭注释 -->
    <uni-im-code-view :msg="msg" :showFullBtn="false"></uni-im-code-view>
  </view>
</template>

<script>
  import uniImCodeView from '@/uni_modules/uni-im/components/uni-im-msg/types/code.vue'
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    components: {
      uniImCodeView
    },
    data() {
      return {
        msg: {
          type: "code",
          body: ""
        }
      }
    },
    onLoad({
      msgId,conversationId
    }) {
      this.msg = uniIm.conversation.find(conversationId).msg.find(msgId)
    },
    methods: {}
  }
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.text-box,
.code-view {
  width: 750rpx;
  height: 100vh;
}
</style>