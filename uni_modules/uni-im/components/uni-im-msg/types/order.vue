<template>
  <view class="msg-order">
    <text class="title">订单信息</text>
    <view class="item">
      <text class="title">订单编号：</text>
      <text :selectable="true" class="value">{{orderInfo.order_id}}</text>
    </view>
    <view class="item">
      <text class="title">产品/服务名称：</text>
      <text class="value">{{orderInfo.product.name}}</text>
    </view>
    <view class="item">
      <text class="title">订单价格：</text>
      <text class="value">{{orderInfo.product.price}}元</text>
    </view>
    <view class="item">
      <text class="title">所属用户：</text>
      <text class="value">{{nickName}}</text>
    </view>
    
    <view class="item">
      <text class="title">订单状态：</text>
      <text class="value">{{status}}</text>
    </view>
    <template v-if="orderInfo.status === 1">
      <view class="item">
        <text class="title">支付时间：</text>
        <text class="value">{{new Date(orderInfo.pay_time).toLocaleString()}}</text>
      </view>
      <view class="item">
        <text class="title">支付渠道：</text>
        <text class="value">{{orderInfo.pay_channel}}</text>
      </view>
    </template>
		<view class="btns" v-else-if="isMineOrder && (!isExpired || !isExpired2)">
			<button class="btn" type="primary" @click="toPay" :disabled="isExpired">在线支付</button>
			<text class="tip">在线支付，需在 {{new Date(orderInfo.expire_time).toLocaleString()}} 前完成</text>
			
			<button class="btn" type="primary" @click="toPay" :disabled="isExpired2">对公打款</button>
			<text class="tip">对公打款，需在 {{new Date(msg.create_time + 3600 * 24 * 7 * 1000).toLocaleString()}} 前完成</text>
		</view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    props: {
      msg: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
      orderInfo() {
        return this.msg.body
      },
      nickName() {
        return uniIm.users.find(this.orderInfo.user_id)[0]?.nickname || '未知'
      },
      isExpired() {
        let now = Date.now() + uniIm.heartbeat * 0
        return now > this.orderInfo.expire_time
      },
			// 对公打款，是否过期
			isExpired2() {
				let now = Date.now() + uniIm.heartbeat * 0
				return now > this.msg.create_time + 3600 * 24 * 7 * 1000
			},
      isMineOrder() {
        // console.log('isMineOrder',this.orderInfo.user_id,uniIm.currentUser._id)
        return this.orderInfo.user_id == uniIm.currentUser._id
      },
      status() {
        if(this.orderInfo.status == 1) {
          return '已支付'
        }
        if(this.isExpired && this.isExpired2) {
          return '已过期'
        }
        if(this.orderInfo.status == 0) {
          return '待支付'
        }
        return '待支付'
      }
    },
    data() {
      return {
        
      }
    },
    methods: {
      async toPay() {
        const uniIdSpaceConfig = {
          provider: 'private',
          spaceName: 'uni-id-server',
          spaceId: 'uni-id-server',
          clientSecret: 'ba461799-fde8-429f-8cc4-4b6d306e2339',
          endpoint: 'https://account.dcloud.net.cn'
        }
        const uniIdCenterEnv = uniCloud.init(uniIdSpaceConfig)
        const uniIdCenterObj = uniIdCenterEnv.importObject('uni-id-co')
        
        let oauthToken;
        try {
          let res = await uniIdCenterObj.getOauthToken()
          console.log('getOauthToken',res)
          oauthToken = res.data.access_token
        } catch (e) {
          return uni.showModal({
            content: JSON.stringify(e),
            showCancel: false
          });
        }
          
        const url = `https://dev.dcloud.net.cn/pages/common/pay?return_url=`
        + encodeURIComponent('/uni_modules/uni-trade/pages/order-payment/order-payment?order_id='+this.orderInfo.order_id)
        + '&oauthToken=' + oauthToken
        console.log('url',url)
        uniIm.utils.openURL(url)
      }
    }
  }
</script>

<style lang="scss">
.msg-order {
  background-color: #FFF;
  border-radius: 10px;
  padding: 25px;
  max-width:100%;
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
