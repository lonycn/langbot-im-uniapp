<template>
<view
  v-if="showMsgList"
  class="uni-im-view-msg"
  @click="close()"
>
  <view class="msg-list" @click.stop>
    <view class="header">
      <view class="title">
        转发的消息内容
      </view>
      <view class="close" @click="close">
        <uni-icons
          type="clear"
          size="20px"
          color="#ccc"
        />
      </view>
    </view>
    <scroll-view :scroll-y="true" class="scroll-view">
      <view class="scroll-content">
        <uni-im-msg
          v-for="(msg,index) in msgList"
          :key="index"
          :msg="msg"
          :preview="true"
        />
      </view>
    </scroll-view>
  </view>
</view>
</template>

<script>
export default {
  name: 'UniImViewMsg',
  data() {
    return {
      showMsgList: false,
      msgList: [],
    }
  },
  methods: {
    open(msgList) {
      this.showMsgList = true;
      this.msgList = msgList;
    },
    close() {
      this.showMsgList = false;
      this.msgList = [];
    }
  }
}
</script>

<style lang="scss">
.uni-im-view-msg {
  position: fixed !important;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  .msg-list {
    position: absolute;
    bottom: 0;
    width: 100%;
    overflow: hidden;
    border-radius: 10px;
    background-color: rgba(245, 245, 245, 1);
    height: unset !important;
    padding-bottom: 10px;
    .header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding: 10px;
      .close {
        cursor: pointer;
      }
    }
    .title {
      font-size: 16px;
      color: #333;
    }
    .scroll-view {
      height: 400px;
      .scroll-content {
        margin: 10px;
      }
    }
  }
  /* #ifdef H5 */
  @media screen and (min-device-width:960px) {
    .msg-list {
      position: relative;
      width: 60%;
      top: 25%;
      left: 20%;
    }
  }
  /* #endif */
}
</style>
