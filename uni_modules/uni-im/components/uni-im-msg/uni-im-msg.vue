<template>
  <view v-if="!msg.is_delete" class="uni-im-msg" :class="{self}">
    <msg-system v-if="msg.type === 'system'" class="system-msg-box" :msg="msg" />
    <template v-else>
      <view v-if="!noTime" class="friendlyTime" :class="{'hide':equalPrevTime}">
        <uni-im-friendly-time :time="msg.create_time || msg.client_create_time"></uni-im-friendly-time>
      </view>
      <view class="msg-box">
        <view v-if="msg.is_revoke" class="revoke-text-box">
          <text class="revoke-text">
            已被撤回
          </text>
          <text v-if="msg.before_revoke_body && ['text','rich-text'].includes(msg.type) " class="re-edit" @click="putChatInputContent">
            重新编辑
          </text>
        </view>
        <view v-else-if="msg.revoke_ing" class="revoke-text-box">
          <text class="revoke-text">
            消息撤回中...
          </text>
        </view>
        <template v-else>
          <uni-im-img class="avatar" ref="avatar" width="40px" height="40px" border-radius="5px"
            :src="avatarUrl" mode="widthFix"
            :class="{'pointer':canPrivateChat}"
            @click.stop="toChat" @longpress.stop="longpressMsgAvatar" />
          <view class="msg-main">
            <view v-if="!self" class="nickname-box">
              <text :selectable="true" class="nickname" :class="{noPreview:!preview}" @click="longpressMsgAvatar">{{nickname}}</text>
              <text :selectable="true" class="real_name" v-if="real_name" @click="showRealName">{{real_name}}</text>
              <text class="badge" v-if="isFromAdmin">管理员</text>
              <template v-for="(item,index) in extMsgBadge" :key="index">
                <component :is="item.component" v-bind="item.props"></component>
              </template>
            </view>
            
            <view v-if="msg.about_msg_id && !preview" class="cite-box">
              <template v-if="aboutMsg.body">
                <text v-if="aboutMsg.is_revoke" class="cite-box-text">
                  回复的消息已被撤回
                </text>
                <text v-else class="cite-box-text" :class="{'pointer':!noJump}" @click="showAboutMsg">
                  {{ getNickname(aboutMsg.from_uid) }}：{{aboutMsgNote}}
                </text>
              </template>
              <text v-else class="cite-box-text">
                [加载中]
              </text>
            </view>
            <view class="msg-content-box" @longpress.prevent="showControl">
              <uni-icons v-if="self && msg.state != 100 && msgStateIcon" :color="msg.state===0?'#999':'#d22'"
                :type="msgStateIcon" class="msgStateIcon" @click="retriesSendMsg" />
							<msg-content class="msg-content" ref="msg-content" :msg="msg"
                @viewMsg="$emit('viewMsg',$event)"
              />
            </view>
						<template
						  v-for="extra in extraComponents"
						  :key="extra.component.name"
						>
						  <component
						    :is="extra.component"
						    v-bind="extra.props"
						    ref="extras"
						    cementing="MsgExtra"
						  />
						</template>
          </view>
        </template>
      </view>
      <slot />
    </template>

    <!-- <template
      v-for="extra in extraComponents"
      :key="extra.component.name"
    >
      <component
        :is="extra.component"
        v-bind="extra.props"
        ref="extras"
        cementing="MsgExtra"
      />
    </template> -->
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import msgSystem from './types/system.vue'
	import msgContent from './msg-content.vue'
  import { markRaw } from 'vue'
/**
 * uni-im-msg 组件，渲染一条消息。
 * 
 * 支持多种消息类型：
 * 
 * - text
 * - rich-text
 * - code
 * - file
 * - image
 * - sound
 * - video
 * - userinfo-card
 * - history
 * 
 * @module
 */
  export default {
    components: {
			msgSystem,
			msgContent
    },
    props: {
      msg: {
        type: Object,
        default () {
          return {
            body: ""
          }
        }
      },
      self: {
        type: Boolean,
        default () {
          return false
        }
      },
      index: {
        type: Number
      },
      equalPrevTime: {
        type: Boolean,
        default () {
          return false
        }
      },
      noTime: { // 不显示时间
        type: Boolean,
        default: false
      },
      noJump: { // 引用的消息不可点击跳转
        type: Boolean,
        default: false
      },
      preview: { // 是否预览模式
        type: Boolean,
        default: false,
      }
    },
    emits: ['viewMsg', 'showControl', 'showMsgById','longpressMsgAvatar','putChatInputContent','intoTopic','retriesSendMsg'],
    data() {
      // 调用扩展点，正在渲染一条消息，扩展程序可以返回扩展组件，为该消息增加一些显示元素。
      const extraComponents = this.preview ? {} : uniIm.extensions.invokeExts('msg-extra', this.msg)
        .filter(result => result && result.component)
        .map(result => {
          return {
            component: markRaw(result.component),
            props: result.props || {},
            handlers: result.handlers || {},
          }
        })
      return {
        videoUrl: '',
        soundPlayState: 0,
        aboutMsg: {},
        extraComponents,
      };
    },
    computed: {
      extMsgBadge(){
        return uniIm.extensions.invokeExts('msg-badge', this)
          .filter(result => result && result.component)
          .map(result => {
            return {
              component: markRaw(result.component),
              props: result.props || {},
              handlers: result.handlers || {},
            }
          })
      },
      currentConversation() {
        if(this.preview) return false
        return uniIm.conversation.find(this.msg.conversation_id)
      },
      currentUid() {
        return uniIm.currentUser._id
      },
      users() {
        const users = uniIm.users[this.msg.from_uid]
        return users?.__loading ? null : users
      },
      msgStateIcon() {
        return {
          "0": 'spinner-cycle',
          "-100": 'refresh-filled',
          "-200": 'info-filled',
        }[this.msg.state]
      },
      aboutMsgNote() {
        if(this.aboutMsg.from_uid){
          return uniIm.utils.getMsgNote(this.aboutMsg)
        }else{
          return '加载中...'
        }
      },
      isFromAdmin() {
        if(this.preview) return false
        const conversation = uniIm.conversation.find(this.msg.conversation_id)
        return conversation?.group_id && conversation.group.member.find(this.msg.from_uid)?.role?.includes('admin')
      },
      nickname() {
        return this.users?.nickname || this.msg.nickname || uniIm.users.getNickname(this.msg.from_uid)
      },
      real_name() {
        return uniIm.users[this.msg.from_uid]?.realname_auth?.real_name
      },
      avatarUrl() {
        return (this.self ? uniIm.currentUser.avatar_file?.url : this.users?.avatar_file?.url || this.msg?.avatar_file?.url) || '/uni_modules/uni-im/static/avatarUrl.png'
      },
      soundBoxWidth() {
        return uni.upx2px(750 / 60 * this.msg.body.time) + 50 + 'px'
      },
      canPrivateChat(){
        if(this.preview) return false
        const conversation = uniIm.conversation.find(this.msg.conversation_id)
        const currentMember = conversation.group?.member?.find(this.currentUid)
        // 当前登录的账号是管理员，或者是群管理员，或者当前消息是群管理员发的
        return this.uniIDHasRole('staff') || 
               currentMember?.role?.includes('admin') || 
               this.isFromAdmin
      }
    },
    async mounted() {
      this.initAboutMsg()

      // #ifdef H5
      // web端限制不选中文字时出现系统右键菜单
      let msgContent = this.$refs['msg-content']
      if (msgContent && uniIm.isWidescreen && msgContent.$el) {
        msgContent.$el.addEventListener('contextmenu', (e) => {
          if (!document.getSelection().toString()) {
            this.showControl(e)
            e.preventDefault()
          }
        })
      }
      let avatarRef = this.$refs['avatar']
      if (avatarRef) {
        avatarRef.$el.addEventListener('contextmenu', (e) => {
          if (uniIm.isWidescreen) {
            this.longpressMsgAvatar()
          }
          e.preventDefault()
        })
      }
      // #endif
    },
    methods: {
      getNickname(uid) {
        return uniIm.users.getNickname(uid)
      },
      showAboutMsg() {
        this.$emit('showMsgById', this.aboutMsg._id)
      },
      onAppear() {
        // console.log('msg ----msgAppear msg.body',this.msg.body)
        let index = this.currentConversation.remind_msg_ids.findIndex(i => i == this.msg._id)
        if (index != -1) {
          console.log('已读，移除remind_msg_ids对应数据')
          this.currentConversation.readRemindMsg(this.msg._id)
        }
      },
      onDisappear() {},
      async showControl(e) {
        let msgContentDomInfo;
        const query = uni.createSelectorQuery().in(this);
        await new Promise(callback => {
          query.selectAll('.msg-content-box .msg-content').boundingClientRect(data => {
            msgContentDomInfo = data[0]
            // console.log('msgContentDomInfo data--------', data);
            callback(msgContentDomInfo)
          }).exec();
        })

        this.$emit('showControl', {
          msgId: this.msg._id,
          msgContentDomInfo,
          // #ifdef H5
          coordinate: {
            left: e.x,
            top: e.y
          }
          // #endif
        })
      },
      retriesSendMsg() {
        // if (this.msg.state == -200) {
        //   return uni.showToast({
        //     title: '内容不合法',
        //     icon: 'error'
        //   });
        // }
        this.$emit('retriesSendMsg', this.msg)
      },
      toChat() {
        if (this.canPrivateChat) {
          uniIm.toChat({
            user_id: this.msg.from_uid,
            source: {
              group_id: this.msg.group_id
            }
          })
        }
      },
      longpressMsgAvatar() {
        if (this.msg.group_id) {
          // console.log('~~~~this.msg.from_uid', this.msg.from_uid)
          this.$emit('longpressMsgAvatar', this.msg.from_uid)
        }
      },
      async initAboutMsg() {
        if (this.preview) return
        // 处理引用消息
        const {
          about_msg_id
        } = this.msg
        if (about_msg_id) {
          let aboutMsg = this.currentConversation.msg.find(about_msg_id) || false
          // 本地不存在联网查找
          if (!aboutMsg) {
            const db = uniCloud.database();
            let {
              conversation_id,
              "about_msg_id": _id
            } = this.msg;
            let res = await db.collection('uni-im-msg')
              .where({
                conversation_id,
                _id
              })
              .limit(1)
              .get()
            aboutMsg = res.result.data[0]
            if (aboutMsg) {
              aboutMsg.isCloudMsg = true
            } else {
              console.error('疑似脏数据，云端也没有查到');
              delete this.msg.about_msg_id
              return
            }
          }
          this.aboutMsg = aboutMsg
        }
      },
      async putChatInputContent() {
        const msgBody = JSON.parse(JSON.stringify(this.msg.before_revoke_body))
        if(msgBody.url){
          msgBody.url = await uniIm.utils.getTempFileURL(msgBody.url)
        }else if(Array.isArray(msgBody)){
          for (let i = 0; i < msgBody.length; i++) {
            if (msgBody[i].name === 'img') {
              msgBody[i].attrs.src = await uniIm.utils.getTempFileURL(msgBody[i].attrs.src)
            }
          }
        }
        this.$emit('putChatInputContent', msgBody)
      },
      showRealName() {
        if(!uniIm.isWidescreen){
          uni.showModal({
            title: '企业名称',
            content: this.real_name,
            showCancel: true,
            confirmText: '复制',
            cancelText: '关闭',
            success: (res) => {
              if (res.confirm) {
                uni.setClipboardData({
                  data: this.real_name,
                  success: () => {
                    uni.showToast({
                      title: '复制成功',
                      icon: 'none'
                    })
                  }
                })
              }
            }
          });
        }
      },
    }
  }
</script>
<style lang="scss">
.uni-im-msg {
  position: relative;
  width: 100%;
  .msg-box {
    position: relative;
    flex-direction: row;
    justify-content: flex-start;
		margin:0 8px;
		// border: 1px solid #000;
    /* #ifdef H5 */
    &,& > * {
      cursor: default;
    }
    /* #endif */
    .msg-main {
      margin: 0 8px;
      margin-right: 40px;
      align-items: flex-start;
      width: 0;
      flex-grow: 1;
      .msg-content-box {
				// border: 1px solid #000;
        width: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
      }
      
      /* 回复引用某条消息提示框 */
      .cite-box {
        margin:8px 0;
        background-color: #e3e3e3;
        color: #6a6a6a;
        border-radius: 5px;
        max-width: 100%;
        justify-content: center;
        padding: 5px 10px;
        .cite-box-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
        }
      }
    }
  }
  
  &.self {
    .msg-box {
      flex-direction: row-reverse;
    }
    .msg-main {
      align-items: flex-end;
      margin-right: 8px;
      margin-left: 40px;
      .msg-content-box {
        justify-content: flex-end;
      }
    }
  }
  
  .nickname-box {
    flex-direction: row;
    align-items: center;
    width: 100%;
    .nickname {
      font-size: 14px;
      color: #666666;
      padding-left: 2px;
    }
    .real_name {
      font-size: 12px;
      color: #999;
      padding:0 4px;
      background-color: #FFF;
      border-radius: 2px;
      box-shadow: 0 0 2px #ddd;
      margin-left: 3px;
      position: relative;
      bottom: 2px;
      // 溢出隐藏，且显示省略号
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &::before {
        content: "\eab8";
        color: #fd7e08;
        font-size: 10px;
        margin-right: 2px;
        font-family: uni-im-icons;
      }
    }
    .badge {
      position: relative;
      bottom: 2px;
      font-size: 12px;
      color: #FFFFFF;
      background-color: #1ab94d;
      padding: 1px 3px;
      border-radius: 2px;
      // 缩小字体
      transform: scale(0.8);
      &.grey {
        background-color: #bbb;
      }
    }
  }
  
  /* #ifdef H5 */
  .nickname-box {
		margin-bottom: 4px;
    .nickname.noPreview{
      &:hover {
        color: #0b65ff;
        cursor: pointer;
        &::after {
          content: '@';
          margin-left: 3px;
        }
      }
    }
  }
  /* #endif */
  
  .rich-text {
    background-color: transparent;
    width: 500rpx;
  }
  
  .link {
    // font-size: 16px;
    color: #007fff;
    /* #ifdef H5 */
    cursor: pointer;
    /* #endif */
  }
  
  .msgStateIcon {
    margin-right: 5px;
  }
  
  .revoke-text-box {
    flex-direction: row;
    flex: 1;
    justify-content: center;
  }
  
  .revoke-text-box .revoke-text {
    color: #999;
    font-size: 12px;
  }
  
  .revoke-text-box .re-edit {
    color: #0b65ff;
    font-size: 12px;
    margin-left: 10px;
    /* #ifdef H5 */
    cursor: pointer;
    /* #endif */
  }
  
  .friendlyTime {
    height: 18px;
  }
  
  /* #ifdef H5 */
  .hide .format-time-text {
    display: none;
  }
  &:hover .hide .format-time-text {
    display: flex;
  }
  
  .pointer {
    cursor: pointer;
  }
  /* #endif */
}
</style>