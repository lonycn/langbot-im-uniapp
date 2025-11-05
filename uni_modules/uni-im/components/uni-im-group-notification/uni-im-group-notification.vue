<template>
  <view class="system-msg-box">
    <view class="system-msg group-notification">
      <view class="title-box">
        <uni-icons size="26" type="sound-filled" color="#0cc8fa"></uni-icons>
        <text class="title">群公告</text>
      </view>
	  <textMsg :msg="{body:notification.content}"></textMsg>
      <text class="create_time">公告时间：{{friendlyTime}}</text>
    </view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  import textMsg from '@/uni_modules/uni-im/components/uni-im-msg/types/text.vue';
  export default {
	components:{
		textMsg
	},
    data() {
      return {
        notification:{
          content:"",
          create_time:0
        }
      }
    },
    props: {
      content:{
        type: String,
        default:""
      },
      create_time:{
        type: Number,
        default:0
      }
    },
    mounted() {
      this.notification.content = this.content
      this.notification.create_time = this.create_time
    },
    computed: {
      friendlyTime() {
        return uniIm.utils.toFriendlyTime(this.notification.create_time + uniIm.heartbeat * 0)
      }
    }
  }
</script>

<style lang="scss">
  .system-msg-box{
    margin: 0 30px;
  }
  .hidden {
    height: 0;
  }
  .system-msg {
    background-color: #f2f2f2;
    color: #9d9e9d;
    font-size: 14px;
    line-height: 30px;
    padding: 0 15rpx;
    border-radius: 8px;
  }
  .group-notification {
    padding:14px 0;
    background-color: #FFFFFF;
    margin-top: 10px;
  }
  .group-notification .title-box{
    flex-direction: row;
  }
  .group-notification .title-box .title{
    padding-left: 5px;
    color: #888;
    font-size: 18px;
  }
  .title-box,.create_time {
    color: #888;
    font-size: 14px;
    padding-left: 15px;
  }
</style>