<template>
  <view v-if="!msg.is_revoke && !msg.revoke_ing" :class="{'self':currentUid == msg.from_uid}" class="uni-im-msg-reader">
    <text
      v-if="readerList && !hiddenState"
      class="read-state"
      :class="{'active-color':unreadUserList.length || readerList.length,isGroupMsg}"
      @click="clickHandler"
    >
      {{ isGroupMsg ? (isReady ? unreadUserCountTip : '') : (readerList.length?'已读':'未读') }}
    </text>
    
    <!-- #ifdef H5 -->
    <teleport to="body" :disabled="!isWidescreen">
    <!-- #endif -->
      <view
        v-if="showPopup && isGroupMsg"
        class="uni-im-msg-reader-popup"
        @click="closePopup"
      >
        <view
          class="reader-list-box"
          :class="{'show':showTransition}"
          @click.stop
        >
          <text class="title">消息接收人列表</text>
          <uni-segmented-control class="segmented-control"
            v-if="!isWidescreen"
            :current="currentIndex"
            :values="[`未读(${unreadUserList.length})`, `已读(${readerList.length})`]"
            style-type="text"
            active-color="black"
            @clickItem="e => currentIndex = e.currentIndex"
          />
          <view class="content">
            <view v-if="isWidescreen || currentIndex == 0" class="reader-list">
              <text v-if="isWidescreen" class="title">
                {{ unreadUserList.length }}人未读
              </text>
              <scroll-view class="user-list" scroll-y>
                <view
                  v-for="(item,index) in unreadUserList"
                  :key="index"
                  class="users"
                >
                  <cloud-image
                    :src=" item.avatar_file&&item.avatar_file.url||'/uni_modules/uni-im/static/avatarUrl.png'"
                    mode="widthFix"
                    width="36px"
                    height="36px"
                    border-radius="15px"
                  />
                  <text class="nickname">
                    {{ item.nickname }}
                  </text>
                </view>
              </scroll-view>
            </view>
            <view v-if="isWidescreen || currentIndex == 1" class="reader-list">
              <text v-if="isWidescreen" class="title">
                {{ readerList.length }}人已读
              </text>
              <scroll-view class="user-list" scroll-y>
                <view
                  v-for="(item,index) in readerUserlist"
                  :key="index"
                  class="users"
                >
                  <cloud-image
                    :src=" item.avatar_file&&item.avatar_file.url||'/uni_modules/uni-im/static/avatarUrl.png'"
                    mode="widthFix"
                    width="36px"
                    height="36px"
                    border-radius="15px"
                  />
                  <text class="nickname">
                    {{ item.nickname }}
                  </text>
                </view>
              </scroll-view>
            </view>
          </view>
        </view>
      </view>
    <!-- #ifdef H5 -->
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';
/**
 * uni-im-msg-reader 组件，实现“已读反馈”功能，可在消息列表中每条消息的下方显示已读信息。
 */
export default {
  name: 'UniImMsgReader',
  props: {
    msg: {
      type: Object,
      default: () => {}
    },
    hiddenState: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPopup: false,
      showTransition: false,
      conversation: {},
      currentIndex: 0
    }
  },
  // 计算属性
  computed: {
    ...uniIm.mapState(['isWidescreen','systemInfo']),
    currentUid() {
      return uniIm.currentUser._id
    },
    isReady() {
      // 群会话需要等待群成员数据，全部加载完毕
      return !this.conversation.group?.member?.hasMore
    },
    memberUids() {
      const groupMember = this.conversation.group?.member
      if(groupMember){
        // 成员uid不包含消息发送者
        return groupMember.dataList.filter(item => item.users._id != this.msg.from_uid).map(item => item.users._id)
      }else{
        return []
      }
    },
    unreadUserList() {
      const unreadUserList = this.memberUids.filter(item => !this.readerList.find(reader => reader.user_id == item))
      return unreadUserList.map(item => uniIm.users[item])
    },
    unreadUserCountTip() {
      let unreadUserCount = this.unreadUserList.length
      // 大于99人显示99+
      unreadUserCount = unreadUserCount > 99 ? '99+' : unreadUserCount
      return unreadUserCount > 0 ? `${unreadUserCount}人未读` : '全部已读'
    },
    isGroupMsg() {
      return !!this.msg.group_id
    },
    readerList() {
      return this.msg.reader_list || []
    },
    readerUserlist() {
      return this.readerList.map(item => uniIm.users[item.user_id])
    }
  },
  watch: {
    showPopup(state) {
      setTimeout(()=>{
        this.showTransition = state
      },0)
    }
  },
  mounted() {
    this.conversation = uniIm.conversation.find(this.msg.conversation_id)
  },
  methods: {
    clickHandler() {
      if(this.isGroupMsg){
        if(uniIm.isWidescreen){
          this.showReaderList()
        }else {
          
          uni.navigateTo({
            url: `/uni_modules/uni-im-msg-reader/pages/reader-list/reader-list?msgId=${this.msg._id}&conversationId=${this.msg.conversation_id}`,
            // animationType: 'slide-in-bottom'
          })
        }
      }
    },
    showReaderList() {
      this.showPopup = true
      // this.$refs.popup.open()
    },
    closePopup() {
      this.showPopup = false
    }
  }
}
</script>

<style lang="scss">
  .uni-im-msg-reader {
    display: flex;
    width: 100%;
    flex: 1;
		margin-top: 5px;
    overflow: hidden;
    .read-state {
      font-size: 12px;
      flex-direction: row;
      color: #555;
      width: 65px;
      height: 16px;
    }
    .active-color {
      color: #aaa;
      &.isGroupMsg {
        /* #ifdef H5 */
          cursor: pointer;
        /* #endif */
        color: #0b65ff;
      }
    }
    &.self {
      align-items: flex-end;
      .read-state {
        text-align: right;
      }
    }
  }
  
  .uni-im-msg-reader-popup {
    height: 100%;
    .reader-list-box {
      width: 750rpx;
      height: 100%;
      .segmented-control {
        flex-shrink: 0;
      }
      &>.title {
        display: none;
      }
      .content {
        height: 100%;
        overflow: hidden;
        .reader-list {
          flex-direction: column;
          overflow: hidden;
          .title {
            padding: 15px;
            background-color: #FFF;
            font-size: 20px;
          }
          .user-list {
            flex: 1;
            overflow: hidden;
            .users {
              flex-direction: row;
              align-items: center;
              padding: 10px;
              .nickname {
                font-size: 16px;
                color: #333;
                margin-left: 6px;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                /* #ifndef APP-NVUE */
                white-space: nowrap;
                /* #endif */
              }
            }
          }
        }
      }
    }
  }
  /* #ifdef H5 */
  @media screen and (min-device-width:960px) {
    .uni-im-msg-reader-popup {
      position: fixed !important;
      top: 0;
      left: 0;
      z-index: 9999;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center !important;
      .reader-list-box {
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
        /* 显示隐藏的过度动画 */
        transition: transform 0.1s,opacity 0.1s;
        transform: scale(0.7);
        opacity: 0;
        width: 600px;
        margin-top: 44px;
        height: 50%;
        flex-direction: column;
        &.show {
          transform: scale(1);
          opacity: 1;
        }
        &>.title {
          display: flex;
          font-size: 18px;
          font-weight: bold;
          color: #333;
          padding: 15px;
          background-color: #f5f5f5;
        }
        .content {
          flex-direction: row;
          padding: 5px 15px;
          .reader-list {
            flex: 1;
          }
        }
      }
    }
  }
  /* #endif */
</style>