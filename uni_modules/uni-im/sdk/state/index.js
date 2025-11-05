import {watchEffect,watch,reactive} from 'vue'
import data from './data';
const observable = reactive(data)
uni.imObservableData = observable
let lastKey = ''
// 监听数据变化
let index2 = 0,nnn2 = 0
watchEffect(() => {
  const conversationDataList = observable.conversation.dataList
  index2 ++ 
  // console.error('watchEffect会话数据变化2222',index2)
  // 会话数据排序
  const currentKey = sortConversationDataList(conversationDataList.slice()).map(item => item.id).join(',')
  if (currentKey !== lastKey) {
    nnn2 ++
    // console.log('重新排序2',nnn2)
    // TODO：优化未知错误需要加setTimeout 0，使得在下一次js引擎的事件循环执行，后续可以考虑优化
    setTimeout(()=>sortConversationDataList(conversationDataList),0)
    lastKey = currentKey
  }else{
    // console.error('---无需重新排序')
  }
})


watch(() => observable.currentConversationId,(currentConversationId,old)=>{
  // console.log('选中的会话变化',currentConversationId,old)
  if(old){
    const oldConversation = observable.conversation.dataList.find(item => item.id === old)
    // console.log('oldConversation',oldConversation)
    // 只存储最后10条可见消息
    const msgList = oldConversation?.msg?.dataList || []
    const visibleDataList = oldConversation?.msg?.visibleDataList() || []
    if (visibleDataList.length > 10) {
      // 拿到倒数第10条可见消息
      const lastTenMsg = visibleDataList[visibleDataList.length - 10]
      const lastTenMsgIndex = msgList.findIndex(item => item._id === lastTenMsg._id)
      oldConversation.msg.hasMore = true
      // 删掉dataMap中的多余数据
      for (let i = 0; i < lastTenMsgIndex; i++) {
        oldConversation.msg.dataMap.delete(msgList[i]._id)
      }
      msgList.splice(0, lastTenMsgIndex)
    }
  }
})

watch(() => observable.networkConnected, (networkConnected,oldNetworkConnected) => {
  // console.log('网络连接状态变化',networkConnected,oldNetworkConnected)
  if(networkConnected){
    // 重新连接
  }else{
    // 断开连接
  }
  
  if(oldNetworkConnected === false && networkConnected){
    uni.showModal({
      content: "运行期间网络连接被异常中断，请重新加载",
      showCancel: false,
      confirmText: '重新加载',
      success(e) {
        if (e.confirm) {
          // console.log('用户点击确定');
          window.location.reload()
        }
      }
    });
  }
  
})


function sortConversationDataList(conversationDataList) {
  return conversationDataList.sort(function(a, b) {
    if (a.pinned != b.pinned) {
      return a.pinned ? -1 : 1;
    }
    if (a.customIndex || b.customIndex) {
      let aIndex = a.customIndex || 0
      let bIndex = b.customIndex || 0
      return bIndex > aIndex ? 1 : -1
    }
    if(b.time === a.time){
      return b.id > a.id ? 1 : -1
    }
    return b.time > a.time ? 1 : -1
  })
}
export default observable;