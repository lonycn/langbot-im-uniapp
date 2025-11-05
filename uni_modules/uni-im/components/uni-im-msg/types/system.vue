<template>
  <view class="system-msg-box">
    <template v-if="content">
			<group-notice v-if="msg.action === 'setUnreadGroupNoticeId'" :msg="msg"></group-notice>
      <text v-else class="system-msg">{{friendlyTime}} {{content}}</text>
    </template>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import groupNotice from './group-notice.vue'
  export default {
		components: {
			groupNotice
		},
    data() {
      return {
        create_time:0
      }
    },
    props: {
      msg: {
        type: Object,
        default () {
          return {}
        }
      },
    },
    computed: {
      friendlyTime() {
        return uniIm.utils.toFriendlyTime(this.create_time || this.msg.create_time || this.msg.client_create_time)
      },
      content(){
        const msg = this.msg
        if(msg.action.indexOf("update-group-info-") === 0){
          const key = Object.keys(msg.body.updateData)[0]
          const value = msg.body.updateData[key];
          if (key ==  "notification"){
            this.create_time = value.create_time
            return value.content
          }else if(key ==  "avatar_file"){
            return "群聊头像已更新"// 已在 msg-list 组件隐藏此类型消息
          }
          // mute_all_members 
          else if(key ==  "mute_all_members"){
            return value ? "已开启“全员禁言”" : "已关闭“全员禁言”"
          } else{
            return {
              "name":" 群聊名称",
              "introduction":"群简介"
            }[key] + "已更新为：" + value
          }
        }else if( ["join-group","group-exit","group-expel"].includes(msg.action) ){
          const nicknameList = []
          msg.body.user_id_list.forEach(async (user_id) => {
            const nickname = uniIm.users.getNickname(user_id)
            // console.log(nickname)
            nicknameList.push(nickname)
          })
          let actionName = {
            "join-group":"加入群聊",
            "group-exit":"退出群聊",
            "group-expel":"被踢出群聊"
          }[msg.action];
          return nicknameList.join(' , ') + actionName
        }else if(msg.action === "group-dissolved"){
          return '此群聊已被解散'
        }else if(msg.action === "set-group-admin"){
          const {user_id,addRole,delRole} = msg.body
          const nickname = uniIm.users.getNickname(user_id)
          // console.log(nickname)
          return `已将"${nickname}"${addRole.includes("admin") ? "添加为群管理员" : "从群管理员中移除"}`
        }else{
          return msg.body
        }
      }
    },
    async mounted() {}
  }
</script>

<style lang="scss">
  .system-msg-box{
    align-items: center;
		// 如果是 pc 端
		// #ifdef H5
		@media screen and (min-device-width:960px){
		    max-width: 550px!important;
		    word-break: break-all;
		    margin: 0 auto;
		}
		// #endif
		.system-msg {
		  background-color: #f2f2f2;
		  color: #9d9e9d;
		  font-size: 12px;
		  line-height: 30px;
		  padding: 0 15rpx;
		  border-radius: 8px;
		  margin: 0 2em;
		}
  }
</style>