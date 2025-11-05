<template>
  <view v-if="modelValue" class="toolbar">
    <view class="item" @click="shareMsg(false)">
      <view class="icons-box">
        <uni-icons size="20" type="redo"></uni-icons>
      </view>
      <text class="title">逐条转发</text>
    </view>
    <view class="item" @click="shareMsg(true)">
      <view class="icons-box">
        <uni-icons size="20" type="paperplane"></uni-icons>
      </view>
      <text class="title">合并转发</text>
    </view>
    <view class="item" @click="toolBarNext">
      <view class="icons-box">
        <uni-icons size="20" type="folder-add"></uni-icons>
      </view>
      <text class="title">收藏</text>
    </view>
    <view class="item" @click="toolBarNext">
      <view class="icons-box">
        <uni-icons size="20" type="download"></uni-icons>
      </view>
      <text class="title">下载保存</text>
    </view>
    <view class="item" @click="toolBarNext">
      <view class="icons-box">
        <uni-icons size="20" type="trash"></uni-icons>
      </view>
      <text class="title">删除</text>
    </view>
    <uni-icons class="close-icon" @click="close" color="#999" size="35" type="closeempty"></uni-icons>
  </view>
</template>

<script>
  export default {
    name: 'UniImToolBar',
    emits: ['shareMsg', 'toolBarNext', 'update:modelValue'],
    props: {
      checkedMsgList: {
        type: Array,
        default: () => []
      },
      modelValue: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
      }
    },
    methods: {
      shareMsg(merge) {
        this.$emit('shareMsg', merge)
      },
      close() {
        this.$emit('update:modelValue', false)
      },
      toolBarNext(){
        uni.showToast({
          title: '暂不支持',
          icon: 'none',
          duration: 2000
        });
        this.chooseMoreMsg = false
      },
    }
  }
</script>

<style lang="scss">
  .toolbar {
    background-color: #FFF;
    /* #ifdef H5 */
    @media screen and (min-device-width:960px){
      background-color: #ededed;
    }
    /* #endif */
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-top: solid 1px #ededed;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    z-index: 9;
    .item {
      align-items: center;
      /* #ifdef H5 */
      cursor: pointer;
      /* #endif */
      .icons-box {
        background-color: #fff;
        justify-content: center;
        align-items: center;
        border-radius: 100px;
        width: 30px;
        height: 30px;
        /* #ifdef H5 */
        @media screen and (min-device-width:960px){
          width: 60px;
          height: 60px;
          margin-bottom: 10px;
          .uni-icons {
            font-size: 35px !important;
          }
        }
        /* #endif */
      }
      .title {
        font-size: 8px;
        /* #ifdef H5 */
        @media screen and (min-device-width:960px){
          font-size: 14px;
        }
        /* #endif */
      }
    }
  }
</style>