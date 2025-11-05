<template>
  <view class="history-msg" @click="viewMsg">
    <view class="title">{{title}}</view>
    <view class="item-text-list">
      <view class="item-text" v-for="(item,index) in msgList.slice(0,3)" :key="index">
        {{item.nickname}}：{{item.content}}
      </view>
    </view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    emits: ['viewMsg'],
    props: {
      msg: {
        type: Object,
        default: {}
      },
    },
    data() {
      return {
        msgList: [],
      }
    },
		computed: {
			title(){
				const {to_uid,from_uid,group_id} = this.msg.body.msgList[0] || {}
				if(group_id){
					return this.msg.body.title
				}else{
				  let nickname1 = uniIm.users.getNickname(to_uid)
					let nickname2 = uniIm.users.getNickname(from_uid)
					return `${nickname1} 与 ${nickname2} 的聊天记录`;
				  // console.log(this.title)
				}
			}
		},
    mounted() {
      const msg = this.msg
      // console.log(msg)
      this.msgList = msg.body.msgList || []
      for (let i = 0; i < this.msgList.length; i++) {
        let msg = this.msgList[i]
        this.setNickname(msg)
        // 获取body 去掉所有 html 标签
        msg.content = typeof(msg.body) === 'string' ? msg.body.replace(/<[^>]+>/g, "") : '[多媒体类型]'
      }
      
    },
    methods: {
      viewMsg(){
        this.$emit('viewMsg',this.msgList)
      },
      setNickname(msg) {
        let users = uniIm.users[msg.from_uid]
        if (users) {
          msg.nickname = users.nickname;
        } else {
          const dbJQL = uniCloud.databaseForJQL();
          dbJQL.collection('uni-id-users').doc(msg.from_uid).field('nickname').get().then(res => {
            msg.nickname = res.data[0].nickname;
          })
        }
      }
    }
  }
</script>

<style lang="scss">
  /* #ifdef H5 */
  .history-msg,.history-msg * {
    cursor: pointer;
  }
  /* #endif */
  .history-msg {
    padding: 10px;
    border-radius: 5px;
    background-color: #fff;
    width: 600rpx;
    .title {
      text-align: left;
      font-size: 16px;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
      margin-bottom: 5px;
    }
    .item-text-list{
      max-height: 150px !important;
      overflow: hidden;
      .item-text {
        color: #999;
        font-size: 14px;
      }
    }
  }
</style>