<template>
  <view class="uni-im-load-state">
    <uni-icons v-if="status == 'loading'" color="#bbb" :size="24" class="refresh-icon" type="spinner-cycle"></uni-icons>
    <text class="refresh-text">{{status == 'loading'?contentText.contentrefresh:contentText.contentnomore}}</text>
  </view>
</template>

<script>
  export default {
    props: {
      status: {
        type: String,
        default: "loading"
      },
      contentText: {
        type: Object,
        default () {
          return {
            "contentrefresh": "加载中...",
            "contentnomore": "- 没有相关数据 -"
          }
        }
      }
    }
  }
</script>

<style lang="scss">
  .uni-im-load-state{
    height: 50px;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    width: 750rpx;
    /* #ifdef H5 */
    @media screen and (min-device-width:960px){
        width: 100%;
    }
    /* #endif */
    
    // 给refresh-icon增加旋转的动画
    @keyframes rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    .refresh-icon {
      animation: rotate 1.3s linear infinite;
      margin: 5px;
    }
    
    .refresh-text {
      color: #bbb;
      font-size: 14px;
    }
  }
</style>