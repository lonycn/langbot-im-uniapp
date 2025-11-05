<template>
<view class="msg-userinfo-card" @click="onClick">
  <uni-im-img
    class="avatar"
    width="40px"
    height="40px"
    border-radius="5px"
    :src="avatarUrl"
    mode="widthFix"
  />
  <text
    :decode="true"
    space="ensp"
    class="msg-text"
  >
    {{ nickname }}
  </text>
</view>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';

export default {
  props: {
    msg: {
      type: Object,
      default () {
        return {
          body: ""
        }
      }
    },
  },

  data() {
    return {
      avatarUrl:'',
      nickname:'[...加载中]',
    };
  },
  async mounted() {
    let user = await uniIm.users.get(this.msg.body.user_id) || {}
    this.avatarUrl = user.avatar_file?.url ?? '/uni_modules/uni-im/static/avatarUrl.png'
    this.nickname = user.nickname
  },
  methods: {
    onClick() {
      uniIm.toChat({
        user_id: this.msg.body.user_id,
        source:{
          group_id: this.msg.group_id
        }
      })
    },
  }
}
</script>

<style>
.msg-userinfo-card {
  flex-direction: row;
  align-items: center;
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
  min-width: 250px;
}
/* #ifdef H5 */
.msg-userinfo-card,.msg-userinfo-card * {
  cursor: pointer;
}
/* #endif */
.avatar {
  border-radius: 5px;
  margin-right: 10px;
}
</style>
