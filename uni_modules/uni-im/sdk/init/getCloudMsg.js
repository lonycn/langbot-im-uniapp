import $state from '@/uni_modules/uni-im/sdk/state/index.js';
const uniImCo = uniCloud.importObject("uni-im-co", {
  customUI: false
})
const dbJQL = uniCloud.databaseForJQL();
// 获得云端数据，适用于：socket突然断开丢失，或者应用iOS切到后台拿不到透传等场景使用 获取丢失的数据
let getCloudMsgIng = false

function getCloudMsg({
  loadingTitle,
  callback
} = {
  "callback": () => {}
}) {
  if ($state.isDisabled) {
    return console.log('$state isDisabled')
  }

  if (getCloudMsgIng) {
    callback()
    return // 防止重复发起，比如即被切换到后台，socket又断开的场景
  }

  getCloudMsgIng = true

  if (loadingTitle) {
    uni.showLoading({
      title: loadingTitle,
      mask: true
    });
  }

  // 下一次事件循环执行
  setTimeout(async () => {
    try {

      await getConversationList()
      async function getConversationList() {
        // 根据本地会话的最大更新时间，查询云端数据
        let maxConversation = ([...$state.conversation.dataList].sort((a, b) => b.update_time - a.update_time))[0]
        console.log('maxConversation:', maxConversation)
        
        if (!maxConversation) {
          getCloudMsgIng = false
          return
        }
        let minUpdateTime = maxConversation.update_time
        // console.log('minUpdateTime', minUpdateTime);
        console.log('getCloudMsg');
        let {data:conversationDatas} = await uniImCo.getConversationList({
          minUpdateTime,
          limit: 30
        })
        
        // console.error('conversationDatas',conversationDatas)

        conversationDatas.forEach(newConversationInfo => {
          // console.error('newConversationInfo',newConversationInfo)
          // 存在则更新，不存在则新增
          const conversation = $state.conversation.set(newConversationInfo)
          // 如果当前会话已经被打开则需要设置未读消息数为0
          if ($state.currentConversationId === conversation.id) {
            conversation.unread_count = 0
          }
        })

        for (let i = 0; i < conversationDatas.length; i++) {
          console.log('需要查询的msg有：'+conversationDatas.length,i)
          // 判断是否已经存在
          const conversation = conversationDatas[i]
          // 查询云端消息数据
          await getConversationMsgs({conversation,minUpdateTime})
        }

        // await getMsgList({minUpdateTime,conversation_ids: conversationDatas.map(item => item.id)})

        if (conversationDatas.length === 30) {
          console.log("可能存在下一页数据");
          return await getConversationList()
        } else {
          console.log('离线会话数据同步完毕')
        }
        console.log(`更新会话：${conversationDatas.length}`)
      }
      getCloudMsgIng = false
      callback()
      if (loadingTitle) {
        uni.hideLoading()
      }
    } catch (e) {
      console.error('getCloudMsg error', e);
      getCloudMsgIng = false
    }
  }, 0);
}

export default getCloudMsg

async function seaveMsgs(msgs) {
  if (msgs.length === 0) {
    return
  }
  const conversation = $state.conversation.find(msgs[0].conversation_id)
  msgs.forEach(msg => {
    // todo：暂时先不考虑本地库
    // 会话未初始化（打开）过，不需要更新内存
    if(conversation.isInit){
      let hasThisMsg = conversation.msg.find(msg._id)
      if (hasThisMsg) {
        // 更新内存的这条消息内容
        Object.assign(hasThisMsg, msg)
      } else {
        conversation.msg.add(msg)
      }
    }
  })
  /**
   * 以下为启用本地库的端使用的代码
   */
  // msgs.sort((a, b) => a.update_time - b.update_time)
  // msgs.forEach(async msg => {
  //   // 判断是否出现重复
  //   let [localHasThisMsg] = await conversation.msgManager.localMsg.get({
  //     _id: msg._id
  //   })
  //   if (localHasThisMsg) {
  //     // console.log('出现重复', localHasThisMsg);
  //     // 更新本地的这条消息内容
  //     const unique_id = localHasThisMsg.unique_id
  //     msg.unique_id = unique_id
  //     await conversation.msgManager.localMsg.update(unique_id, msg)
  //     // 如果内存中存在也更新（这种情况，会话确定已经初始化（打开）过）
  //     let memoryMsg = conversation.msg.find(msg._id)
  //     if (memoryMsg) {
  //       // console.log('出现重复', memoryMsg);
  //       Object.assign(memoryMsg, msg)
  //     }
  //   } else {
  //     // 本地库插入新消息
  //     conversation.msgManager.localMsg.add(msg)
  //     // console.log('本地库插入新消息', msg);
  //     // 初始化（打开）过的会话，需要更新内存
  //     if (conversation.isInit) {
  //       conversation.msg.add(msg)
  //     }
  //   }
  // })
}

async function getConversationMsgs({
  limit = 100,
  conversation,
  minUpdateTime = 0
}){
  // console.error('getConversationMsgs minUpdateTime',minUpdateTime);
  // 按会话查
  const conversation_id = conversation.id
  let res = await dbJQL.collection('uni-im-msg').where({
      conversation_id,
      "update_time": dbJQL.command.gt(minUpdateTime),
    })
    .orderBy('update_time', 'asc')
    .limit(limit)
    .get()
  console.log('查询到新msg数据', res,res.data.length);
  seaveMsgs(res.data)
  // 递推查询
  if (res.data.length === limit) {
    arguments[0].minUpdateTime = res.data[limit - 1].update_time
    await getConversationMsgs(arguments[0])
  }
}

// async function getMsgList({
//   minUpdateTime = 0,
//   conversation_ids
// }) {
//   const limit = 1000
//   console.log('minUpdateTime', minUpdateTime);
//   console.log('conversation_ids', conversation_ids);
//   let res = await uniImCo.getMsgList({
//     conversation_ids,
//     minUpdateTime,
//     limit
//   })

//   console.error('查询到新消息数据', res.data.length);
//   // 按会话id分组
//   let conversationMsgs = {}
//   res.data.forEach(msg => {
//     if (!conversationMsgs[msg.conversation_id]) {
//       conversationMsgs[msg.conversation_id] = []
//     }
//     conversationMsgs[msg.conversation_id].push(msg)
//   })
//   // console.log('conversationMsgs', conversationMsgs);
//   // 逐个会话处理
//   for (let conversation_id in conversationMsgs) {
//     let msgs = conversationMsgs[conversation_id]
//     // console.log('msgs', msgs);
//     seaveMsgs(msgs)
//   }

//   if (res.data.length === limit) {
//     minUpdateTime = res.data[limit - 1].update_time
//     let res2 = await getMsgList(arguments[0])
//     res.data = res.data.concat(res2.data)
//     return res
//   } else {
//     return res
//   }
// }