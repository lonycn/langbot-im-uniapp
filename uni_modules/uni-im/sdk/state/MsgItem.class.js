import md5 from '@/uni_modules/uni-im/sdk/utils/md5.min.js'
import $state from '@/uni_modules/uni-im/sdk/state/index.js'
const __updateAfterTimer = {}
export default class MsgItem{
  constructor(msgData) {
    for (let key in msgData) {
      this[key] = msgData[key]
    }
    const {create_time,client_create_time} = msgData
    this.unique_id = "u" + (create_time || client_create_time).toString(36) + md5( JSON.stringify(msgData))
  }
  __updateAfter(){
    // 防抖 100ms
    if(__updateAfterTimer[this.unique_id]){
      clearTimeout(__updateAfterTimer[this.unique_id])
    }
    __updateAfterTimer[this.unique_id] = setTimeout(()=>{
      const {conversation_id,_id} = this
      if(_id){
				const conversation = $state.conversation.find({conversation_id})
				if (conversation) {
					conversation.msg.dataMap.set(_id,this)
				}
      }
      // #ifndef H5
      return // 仅H5环境下更新本地数据库
      // #endif
      const msg = JSON.parse(JSON.stringify(this))
      // console.error('MsgItem __updateAfter',msg)
      let request = $state.indexDB.transaction(['uni-im-msg'], 'readwrite')
        .objectStore("uni-im-msg")
        .put(msg)
      request.onsuccess = function(event) {
        // console.log('event---更新本地数据库记录成功',event);
      }
      request.onerror = function(event) {
        console.error(event);
      };
    },100)
    
  }
}