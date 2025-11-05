<template>
<view
  v-if="isOpen"
  class="share-msg-root"
  @click="close"
>
  <view class="share-msg-content" @click.stop>
    <!-- #ifndef APP -->
    <view class="navbar" v-if="!isWidescreen">
      <text class="btn cancel" @click="close">返回</text>
      <text class="title">选择会话</text>
      
      <text class="btn" @click="send" v-if="canSend">发送({{checkedList.length}})</text>
      <text class="btn disabled" v-else>发送</text>
    </view>
    <!-- #endif -->
    <view class="conversation-list-box">
      <uni-search-bar
        id="search-bar"
        v-model="keyword"
        radius="5"
        placeholder="搜索会话"
        clear-button="auto"
        cancel-button="none"
      />
      <uni-im-conversation-list
        id="conversation-list-box"
        v-model:checked-list="checkedList"
        :keyword="keyword"
        :can-check="true"
        :show-unread-count="false"
      />
    </view>
    <view class="conversation-detail-box" v-if="isWidescreen">
      <text class="title">
        转发给：
      </text>
      <!-- 已经选择的会话列表 -->
      <scroll-view scroll-y class="selected-conversation-list">
        <view class="scroll-content">
          <view
            v-for="(item,index) in checkedList"
            :key="index"
            class="selected-conversation-item"
          >
            <image
              class="avatar"
              :src="item.avatar_file&&item.avatar_file.url ? item.avatar_file.url : '/uni_modules/uni-im/static/avatarUrl.png'"
              mode="widthFix"
            />
            <text class="title">
              {{ item.title }}
            </text>
            <uni-icons
              class="close-icon"
              type="clear"
              color="#ccc"
              @click="removeCheckedItem(index)"
            />
          </view>
        </view>
      </scroll-view>
      <!-- 消息详情 -->
      <view v-if="!noMsgList" class="msg">
        <uni-list-item
          title="转发的消息内容"
          link
          @click="viewMsg"
        />
      </view>
      <!-- 输入留言 -->
      <view v-if="!noComment" class="input-box">
        <textarea
          v-model="inputText"
          class="textarea"
          placeholder="留言..."
        />
      </view>
      <!-- 操作按钮 -->
      <view class="action-btns">
        <button
          class="btn cancel"
          plain
          @click="close"
        >
          取消
        </button>
        <button
          class="btn"
          :disabled="checkedList.length === 0"
          type="primary"
          @click="send"
        >
          发送
        </button>
      </view>
    </view>

    <!-- 消息详情 -->
    <uni-im-view-msg v-if="!noMsgList" ref="view-msg" />
  </view>
</view>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';
export default {
  name: 'UniImShareMsg',
  emits: ['close'],
  props: {
    noMsgList: { // 不显示转发的消息列表
      type: Boolean,
      default: false
    },
    noComment: { // 不显示留言
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputText: '',
      keyword: '',
      checkedList: [],
      isOpen: false,
      msgList: [],
      merge: false,
      canSend: false
    }
  },
  computed: {
    ...uniIm.mapState(['isWidescreen'])
  },
  watch: {
    checkedList: {
      handler(val) {
        this.canSend = val.length > 0;
        // #ifdef APP
        const titleNView = {
          "autoBackButton": false,
          "buttons": [{
            "text": "取消",
            "fontSize": 16,
            "float": "left",
            "onclick": this.close
          },{
            "text": "发送",
            "fontSize": 16,
            "float": "right",
            "onclick": this.canSend ? this.send : null
          }]
        }
        const rightButton = titleNView.buttons[1];
        rightButton.width = "100px"
        rightButton.text = `发送(${val.length})`
        rightButton.color = this.canSend ? '#149d42' : '#CCC'
        const currentWebview = this.$scope.$getAppWebview();
        currentWebview.setStyle({titleNView});
        // #endif
      },
      immediate: true,
      deep: true
    }
  },
  onLoad() {
  	const eventChannel = this.getOpenerEventChannel();
  	eventChannel.on('shareMsg', ([msgList,merge]) => {
      console.log('shareMsg',msgList,merge)
      this.open(msgList, merge);
  	});
  },
  methods: {
    open(msgList, merge) {
      console.info('msgList', msgList);
      this.isOpen = true;
      this.merge = merge;

      this.msgList = msgList.map(msg => {
        let data = Object.assign({},msg);
        delete data._id
        if (!merge) {
          // 如果不是合并转发，则删除会话id和群id
          data.conversation_id = '';
          data.group_id = '';
        }
        return data;
      });
    },
    removeCheckedItem(index) {
      this.checkedList.splice(index, 1);
    },
    close() {
      this.isOpen = false;
      this.checkedList = [];
      this.inputText = '';
      if(!this.isWidescreen){
        uni.navigateBack();
      }
    },
    createMsg(msg, conversation) {

    },
    viewMsg() {
      console.info('viewMsg', this.msgList);
      this.$refs['view-msg'].open(this.msgList);
    },
    async send() {
      console.info('send', this.checkedList);
      console.info('this.msgList', this.msgList);
      if (!this.merge && this.inputText.length != 0) {
        this.msgList.push({
          "body": this.inputText,
          "type": "text"
        })
      }

      for (var cidIndex = 0; cidIndex < this.checkedList.length; cidIndex++) {
        const conversation = this.checkedList[cidIndex];
        const {
          friend_uid,
          group_id,
          id: conversation_id
        } = conversation;
        // 基本消息信息
        const baseMsgInfo = {
          "to_uid": friend_uid,
          conversation_id,
          group_id,
          "from_uid": uniIm.currentUser._id,
          "state": 0,
          "client_create_time": Date.now(),
          "is_read": false,
          // 接收消息的appId，默认为当前应用的appId。如果你是2个不同appId的应用相互发，请修改此值为相对的appId
          appId: uniIm.systemInfo.appId,
        }

        if (this.merge) {
          let msg = Object.assign(baseMsgInfo, {
            "type": "history",
            "body": {
              "title": this.msgList[0].group_id ? "群聊天记录" : "", // 是否转带真实群名称待定
              "msgList": JSON.parse(JSON.stringify(this.msgList))
            }
          });
          console.info('msg', msg);
          await sendMsgToConversation(conversation, msg);
          if (this.merge && this.inputText.length != 0) {
            await sendMsgToConversation(conversation, {
              ...baseMsgInfo,
              "body": this.inputText,
              "type": "text"
            });
          }
        } else {
          for (let msgIndex = 0; msgIndex < this.msgList.length; msgIndex++) {
            let msg = JSON.parse(JSON.stringify(this.msgList[msgIndex]));
            msg = Object.assign(msg, baseMsgInfo);
            // console.info('msg',msg);
            await sendMsgToConversation(conversation, msg);
          }
        }
      }
      this.close();
      async function sendMsgToConversation(conversation, msg) {
        // 插到消息列表
        msg = conversation.msg.add(msg);
        // 保存到本地数据库
        // await conversation.msgManager.localMsg.add(msg);
        const uniImCo = uniCloud.importObject("uni-im-co");
        await uniImCo.sendMsg(msg)
          .then(async e => {
            console.log('uniImCo.sendMsg',e);
            msg.state = e.errCode === 0 ? 100 : -100;
            msg.create_time = e.data.create_time;
            msg._id = e.data._id;
          })
          .catch(async e => {
            uni.showModal({
              content: e.message,
              showCancel: false,
              confirmText: '关闭',
            });
            console.error('uniImCo.sendMsg error:', e.errCode, e.message);
            // 必须要有create_time的值，否则indexDB通过创建时间索引找不到数据
            msg.create_time = Date.now();
            msg.state = -200;
          });
      }
    }
  }
}
</script>

<style lang="scss">
  @import "@/uni_modules/uni-im/common/baseStyle.scss";
  /* #ifdef H5*/
  .share-msg-root,
  .share-msg-root * {
    max-width: none !important;
    max-height: none !important;
  }

  /* #endif */

  .share-msg-root {
    width: 750rpx;
    /* #ifndef APP */
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    /* #endif */
    /* #ifdef H5 */
    width: 100vw;
    height: 100vh;
    /* #endif */
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: rgb(0, 0, 0, 0.3);
    .share-msg-content {
      .navbar {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
        .title {
          font-size: 14px;
          color: #333;
        }
        .btn {
          font-size: 12px;
          color: #FFF;
          background-color: #149d42;
          padding: 4px 8px;
          border-radius: 6px;
          &.disabled {
            background-color: #EEE;
            color: #CCC;
          }
          &.cancel {
            border: none;
            background-color: #FFF;
            color: #666;
          }
        }
      }
      background-color: #fff;
      width: 750rpx;
      height: 100%;
      /* #ifdef H5 */
      @media screen and (min-device-width:960px){
        width: 750px;
        height: 70vh;
        border-radius: 15px;
        flex-direction: row;
      }
      /* #endif */
      position: relative;
    }
    
    .conversation-list-box {
      /* #ifdef H5 */
      @media screen and (min-device-width:960px){
        width: 300px;
      }
      /* #endif */
      height: 100%;
      border-right: 1px solid #eee;
    }
    
    .conversation-list-box ::v-deep .conversation-list .refresh-box {
      background-color: #fff;
    }
    
    .conversation-detail-box {
      flex: 1;
    }
    
    .conversation-detail-box .title {
      font-size: 18px;
      color: #333;
      margin: 15px;
    }
    
    .selected-conversation-list {
      height: 0;
      flex: 1;
    }
    
    .scroll-content {
      flex-direction: row;
      flex-wrap: wrap;
      margin: 0 5px 35px 5px;
    }
    
    .selected-conversation-item {
      flex-direction: row;
      padding: 3px;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      background-color: rgba(250, 250, 250, 1);
      margin: 3px;
    }
    
    .selected-conversation-item .avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
    }
    
    .selected-conversation-item .title {
      font-size: 12px;
      color: #333;
      text-align: center;
      margin: 0 5px;
    }
    
    .close-icon {
      cursor: pointer;
    }
    
    .msg {}
    
    .input-box {
      padding: 15px 10px;
      border: 1px solid #EEE;
      border-width: 1px 0;
    }
    
    .textarea {
      width: 100%;
      border-radius: 5px;
      font-size: 14px;
      outline: none;
    }
    
    .action-btns {
      flex-direction: row;
      justify-content: flex-end;
      padding: 10px;
    }
    
    .action-btns .btn {
      margin: 0 10px;
      width: 100px;
    }
    
    .action-btns .btn.cancel {
      color: #999;
      border-color: #999;
    }
  }
</style>