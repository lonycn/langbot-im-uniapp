<template>
  <uni-im-info-card
    :id="conversation.id"
    @click="handleClick"
    :title="conversation.title"
    :note="conversation.note"
    :red-note="redNote"
    :tags="conversation.tags"
    :avatarUrl="avatarUrl"
    :time="friendlyTime"
    :badge="conversation.unread_count"
    :mute="conversation.mute"
    :pinned="conversation.pinned"
    :is_star="conversation.is_star"
    link
  >
    <template #left>
      <slot name="left"></slot>
    </template>
    <template #avatar-overlay-list>
      <template v-for="overlay in avatarOverlayList" :key="overlay.component.name">
        <component :is="overlay.component" v-bind="overlay.props" cementing="ConversationAvatarOverlay" />
      </template>
    </template>
  </uni-im-info-card>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  import {
    markRaw
  } from "vue";
  export default {
    name: 'UniImConversation',
    props: {
      conversation: {
        type: Object,
        default: () => {}
      }
    },
    emits: ['click'],
    computed: {
      redNote() {
        if (this.conversation.hasDraft){
          return '[草稿]'
        } else if (this.conversation.remind_msg_ids.length){
          return '[@我]'
        } else if (this.conversation.unread_group_notice_id){
          return '[有未读群公告]'
        }
        return ''
      },
      friendlyTime() {
        // 使得时间会随着心跳动态更新
        let timestamp = this.conversation.time + uniIm.heartbeat * 0
        let friendlyTime = uniIm.utils.toFriendlyTime(timestamp)
        // console.log('friendlyTime',friendlyTime);
        let friendlyTimeArr = friendlyTime.split(' ')
        let friendlyTimeArrL = friendlyTimeArr.length
        // 如果含 年/月（不在3天内，且不是同一周），去掉时间
        if (friendlyTimeArrL == 3 && friendlyTime.includes('/')) {
          friendlyTime = friendlyTimeArr[0]
        }
        return friendlyTime
      }
    },
    data() {
      // 调用扩展点，扩展程序可以为该会话增加覆盖的图标元素。
      let avatarOverlayList = uniIm.extensions
        .invokeExts("conversation-avatar-overlay", this.conversation)
        .filter((result) => result && result.component)
        .map((result) => {
          return {
            component: markRaw(result.component),
            props: result.props || {},
            handlers: result.handlers || {},
          };
        });
      return {
        avatarUrl: "/uni_modules/uni-im/static/avatarUrl.png",
        avatarOverlayList
      };
    },
    watch: {
      'conversation.avatar_file': {
        async handler(avatar_file) {
          if (avatar_file?.url) {
            this.avatarUrl = await uniIm.utils.getTempFileURL(avatar_file.url);
          }
        },
        immediate: true,
      },
    },
    methods: {
      handleClick() {
        this.$emit('click', this.conversation)
      }
    }
  };
</script>

