import uniIm from '@/uni_modules/uni-im/sdk/index.js'
import UniImMsgReader from '@/uni_modules/uni-im-msg-reader/components/uni-im-msg-reader/uni-im-msg-reader.vue'
function install() {
  
  // 配置在什么情况下启用已读功能
  uniIm.extensions.installExt('msg-extra', (msg, currentUser) => {
    // 仅限“我”发送的消息
    if (msg.from_uid !== uniIm.currentUser._id) return
    // 仅限内部用户
    if (!uniIm.currentUser.role.includes('staff')) return 
    // 排除特殊消息
    if (msg.type == 'system' || msg.is_revoke) return
    // 仅限私聊会话
    let conversation = uniIm.conversation.find(msg.conversation_id)
    if (!conversation?.friend_uid) return
    return {
      component: UniImMsgReader,
      props: {
        msg
      }
    }
  })
  
  
  // 注册 read_msg 消息类型
  uniIm.extensions.installExt('msg-type-register', () => {
    return {
      type: 'read_msg',

      isReadable(msg) {
        return false
      },

      beforeLocalAdd(msgData, conversation) {
        let {
          body: {
            msgId
          },
          from_uid,
          create_time,
        } = msgData
        // debugger
        const msg = conversation.msg.find(msgId)
        if (msg) {
          let reader = {
            user_id: from_uid,
            create_time
          }
          msg.reader_list ? msg.reader_list.push(reader) : msg.reader_list = [reader]
        }
      },
    }
  })

  // 监听每条消息的显示状态，报送 read_msg 消息
  uniIm.extensions.installExt('msg-appear', msg => {
    const currentUid = uniIm.currentUser._id
    // 特殊消息不用处理
    if (msg.type === 'system' || msg.is_revoke) return

    // 如果是我发送的消息则不处理
    if (msg.from_uid == currentUid) return

    // 如果我已经在已读列表里则不再处理
    if (msg.reader_list?.some(u => u.user_id == currentUid)) return

    // 如果是群聊消息且没有 @我，则不用处理
    let conversation = uniIm.conversation.find(msg.conversation_id)
    if (conversation.group_id && !msg.call_uid?.includes(currentUid)) return

    // 把自己记入已读列表
    msg.reader_list = msg.reader_list || []
    msg.reader_list.push({
      user_id: currentUid,
      create_time: Date.now()
    })

    // 向云端提交 read_msg 消息
    const uniImCo = uniCloud.importObject('uni-im-co', {
      customUI: true
    })
    uniImCo.sendMsg({
      type: 'read_msg',
      body: {
        msgId: msg._id
      }
    }).catch(e => {
      // 提交失败，把自己从已读列表里去掉
      msg.reader_list = msg.reader_list.filter(u => u.user_id !== currentUid)
    })
  })
}

export default {
  install
}