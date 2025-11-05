<template>
  <view class="pay-notify">
    <text class="title">支付成功通知</text>
    <view class="item">
      <text class="title">订单编号：</text>
      <text :selectable="true" class="value">{{msg.body.order_id}}</text>
    </view>
    <view class="item">
      <text class="title">支付时间：</text>
      <text :selectable="true" class="value">{{new Date(msg.create_time).toLocaleString()}}</text>
    </view>
    <view class="item">
      <text class="title">支付金额：</text>
      <text :selectable="true" class="value">{{msg.body.price / 100}}元</text>
    </view>
    <view class="item">
      <text class="title">支付渠道：</text>
      <text :selectable="true" class="value">{{msg.body.pay_channel}}</text>
    </view>
    
  </view>
</template>

<script>
  export default {
    props: {
      msg: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        
      }
    },
    methods: {
      
    }
  }
</script>

<style lang="scss">
.pay-notify {
  background-color: #FFF;
  border-radius: 10px;
  padding: 25px;
  max-width: 100%;
  & > .title {
    font-size: 18px;
    font-weight: bold;
  }
  .item {
    flex-direction: row;
    justify-content: start;
    margin-top: 10px;
    .title {
      color: #666;
      // 不换行
      white-space: nowrap;
    }
    .value {
      color: #333;
      font-size: 14px;
      // 换行
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
  .tip {
    font-size: 14px;
    color: #666;
    margin-top: 10px;
  }
  .btn {
    margin-top: 20px;
    height: 36px;
    line-height: 36px;
    padding: 0;
  }
}
</style>
