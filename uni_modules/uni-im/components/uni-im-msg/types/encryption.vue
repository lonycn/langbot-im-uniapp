<template>
  <view class="encryption-tip">
    此消息为加密消息{{hasKey?'，与配置的密钥不匹配':'，当前未配置密钥'}}，无法查看
  </view>
</template>

<script>
/**
 * 只有未被成功解密的消息才会显示在这个组件
*/
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    props: {
      msg: {
        type: Object,
        default: () => {}
      }
    },
    computed: {
      hasKey() {
        uniIm.ext.encryptionKey?.[uniIm.currentConversationId]
      }
    },
    methods: {
    }
  }
</script>

<style>
  .encryption-tip {
    padding:8px 15px;
    margin-top:5px;
    background-color: #FFF;
    border-radius: 10px;
    color: #999;
    border: 1px dashed #eee;
  }
</style>