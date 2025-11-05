<template>
	<view class="group-QRCode">
		<view class="qr-code">
			<view class="code-info">
				<text class="group-name">{{group.name}}</text>
				<!-- <text class="group-id" @click="copyGroupID">群号：{{group.id_axxx}}</text> -->
				<!--uqrcode 组件来源，插件Sansnn-uQRCode 链接地址：https://ext.dcloud.net.cn/plugin?id=1287 -->
				<!-- #ifndef MP-WEIXIN -->
				<uqrcode @click="copyUrl" ref="uqrcode" :start="false" :size="200" canvas-id="qrcode" :value="joinGroupUrl"></uqrcode>
				<!-- #endif -->
        <text class="tip">点击二维码复制链接</text>
			</view>
			<uni-im-img class="group-avatar" :src="group?.avatar_file?.url || '/uni_modules/uni-im/static/avatarUrl.png'" 
        mode=""
        width="100px"
        height="100px"
      ></uni-im-img>
		</view>

		<!-- <view class="btn-box">
			<view class="btn-item" @click="save">
				<uni-icons type="arrow-down" size="30"></uni-icons>
				<text class="btn-text">保存</text>
			</view>
			<view class="btn-item" @click="share">
				<uni-icons type="paperplane" size="30"></uni-icons>
				<text class="btn-text">分享</text>
			</view>
		</view> -->
	</view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import uqrcode from "@/uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode"
  import config from '@/uni_modules/uni-im/common/config.js';
	export default {
		components: {
			uqrcode
		},
		data() {
			return {
        group: {}
			}
		},
		computed: {
			joinGroupUrl() {
				return config.domain + "/#/?joinGroup=" + this.group._id
			}
		},
		onLoad(param) {
			this.load(param)
		},
		methods: {
      async load({conversation_id}){
        console.log("conversation_id: ",conversation_id);
        const conversation = await uniIm.conversation.get(conversation_id)
        this.group = conversation.group
        this.$refs.uqrcode.make({
        	success: () => {
        		// console.log('生成成功');
        	},
        	fail: err => {
        		console.log(err)
        	}
        });
      },
      copyUrl() {
        uni.setClipboardData({
          data: this.joinGroupUrl,
          success: function() {
            console.log('success');
          }
        });
      },
			copyGroupID() {
				uni.setClipboardData({
					data: this.group_id,
					success: function() {
						console.log('success');
					}
				});
			},
			save() {
				console.log('保存');
			},
			share() {
				console.log('分享');
			}
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.group-QRCode {
  height: 100vh;
  padding-top: 200rpx;
  // justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  .qr-code {
    width: 550rpx;
    height: 780rpx;
    align-items: center;
    justify-content: center;
    border-radius: 20rpx;
    background-color: #fff;
    position: relative;
  }
  
  .code-info {
    align-items: center;
    justify-content: center;
  }
  
  .group-avatar {
    width: 100px;
    height: 100px;
    border-radius: 100rpx;
    position: absolute;
    top: -70rpx;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 20rpx;
  }
  
  .group-name {
    width: 400rpx;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 40px;
    margin-bottom: 10px;
    text-align: center;
  }
  
  .group-id {
    margin: 40rpx 0;
    font-size: 30rpx;
  }
  
  .btn-box {
    flex-direction: row;
    margin-top: 100rpx;
  }
  
  .btn-item {
    align-items: center;
    justify-content: center;
    width: 130rpx;
    height: 130rpx;
    border-radius: 100rpx;
    background-color: #fff;
    margin: 0 80rpx;
    border: 1px solid #eee;
  }
  
  .btn-text {
    font-size: 28rpx;
  }
}
</style>
