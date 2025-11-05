<template>
  <scroll-view class="uni-im-msg-scroll-view" :scroll-anchoring="true" :enable-flex="true" :bounces="false"
    :scroll-with-animation="false" :scroll-y="scrollY" :scroll-top="scrollTop" :scroll-into-view="scrollIntoView"
    @scroll="onScroll" @scrolltolower="onScrollToLower" :show-scrollbar="true">
    <view class="scroll-content">
      <slot></slot>
      <view id="uni-im-list-last-item" key="uni-im-list-last-item">
        <!-- 高度为0的 最后一个元素用于方便滚动到最后一个元素 -->
      </view>
    </view>
  </scroll-view>
</template>

<script>
  /**
   * uni-im-list 组件，渲染一个列表。
   * 
   * @module
   */
  export default {
    emits: ['scroll', 'scrolltolower'],
    data() {
      return {}
    },
    props: {
      scrollY: {
        default: true
      },
      scrollTop: {
        default: 0
      },
      scrollIntoView: {
        type: String,
        default: ''
      }
    },
    methods: {
      onScroll(e) {
        this.$emit('scroll', e)
      },
      onScrollToLower(e) {
        this.$emit('scrolltolower', e)
      }
    },
    mounted() {}
  }
</script>

<style lang="scss">
  .uni-im-msg-scroll-view {
    overflow-anchor: auto !important;
    height: 100%;
    -webkit-overflow-scrolling: touch;
    // 上下翻转
    transform: scale(1, -1);
    
    .scroll-content {
      min-height: 100%;
      flex-direction: column-reverse;
    }
    
    & ::v-deep .uni-scroll-view {
      /* 滚动条的样式 */
      &::-webkit-scrollbar {
        width: 5px;  /* 滚动条宽度 */
      }
      /* 滚动条滑块的样式 */
      &::-webkit-scrollbar-thumb {
        background-color: #bbb;  /* 滑块颜色 */
        border-radius: 5px;  /* 滑块圆角 */
      }
    }
  }

  

  /* #ifdef H5 */
  @media screen and (min-device-width:960px) {
    .uni-im-msg-scroll-view {
      // 关闭上下翻转
      transform: scale(1, 1);
      .scroll-content {
        flex-direction: column;
      }
    }
  }
  /* #endif */
</style>