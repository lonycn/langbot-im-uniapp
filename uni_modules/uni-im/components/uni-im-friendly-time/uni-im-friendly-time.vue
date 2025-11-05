<template>
  <view class="format-time-text" @click="onclick">
    <text class="text">{{friendlyTime}}</text>
    <text class="text detail" v-if="showDetail">({{timeString}})</text>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    props: {
      time: {
        type: Number,
        default: 0
      },
    },
    computed: {
      friendlyTime() {
        let time = this.time
        // 使得时间会随着心跳动态更新
        time = time + uniIm.heartbeat * 0
        return uniIm.utils.toFriendlyTime(time)
      },
    },
    data() {
      return {
        timeString: new Date(this.time).toLocaleString(),
        showDetail: false
      }
    },
    mounted() {
      // #ifdef H5
      // 鼠标移入移出事件 设置显示时间
      this.$el.addEventListener('mouseenter', () => {
        this.showDetail = true
      })
      this.$el.addEventListener('mouseleave', () => {
        this.showDetail = false
      })
      // #endif
    },
    methods: {
      onclick() {
        this.showDetail = true
        setTimeout(() => {
          this.showDetail = false
        }, 2000)
      }
    }
  }
</script>

<style lang="scss">
.format-time-text {
  flex-direction: row !important;
  justify-content: center;
  align-items: center;
  .text {
    font-size: 12px;
    text-align: center;
    color: #999999;
  }
  .detail {
    margin-left: 5px;
  }
}
</style>
