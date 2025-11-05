import {watch,computed} from 'vue'
import CloudData from '@/uni_modules/uni-im/sdk/ext/CloudData.class.js'
import getCloudMsg from '../init/getCloudMsg.js';
import ConversationItem from './ConversationItem.class.js'
import $utils from '@/uni_modules/uni-im/sdk/utils/index.js';
import $state from '../state/index.js';
import $extensions from '@/uni_modules/uni-im/sdk/methods/extensions.js';
import $users from '@/uni_modules/uni-im/sdk/methods/users.js';

const uniImCo = uniCloud.importObject("uni-im-co")
export default class Conversation extends CloudData {
  constructor() {
    super()
    this.inheritedBy = 'conversation'
    this.indexKey = 'id'
    // 云端{"未读会话id":未读数}数据
    this.cloudUnreadCountObj = {}
    // 定义加载数据的条数
    this.loadLimit = 15
    // #ifdef H5
    this.loadLimit = 30
    // #endif
    this.typeList = [
      {
        title:'全部',
        value:'all',
				filter: () => true
      },
      {
        title:'未读',
        value:'unread',
				filter: c => c.unread_count > 0,
				needKeep: true
      },
			{
			  title:'@我的',
			  value:'has_remind_msg',
				filter: c => c?.remind_msg_ids?.length > 0,
				needKeep: true
			},
      // 群聊
      {
        title:'群聊',
        value:'group',
				filter: c => c.group_id
      },
      // 单聊
      {
        title:'单聊',
        value:'single',
				filter: c => !c.group_id
      },
      {
        title:'星标',
        value:'is_star',
				filter: c => c.is_star
      }
    ]
  }
  __beforeFind(param){
    if (typeof param === 'string'){
      // 设置为默认按id查找会话，而不是按_id查找
      return {id:param}
    }else if(typeof param === 'object' && param !== null && !Array.isArray(param)){
      const {user_id,friend_uid,conversation_id:id} = param
      if(id){
        param.id = id
        delete param.conversation_id
      }else if(user_id){
        param.friend_uid = friend_uid || user_id
        delete param.user_id
      }
      if('source' in param){
        // 本地查找不需要source字段
        const source = param.source
        delete param.source
        setTimeout(()=>{
          // 在下一个事件循环中执行，加上source
          /**
           * 存在source字段的会话，表示此会话基于某个来源而被创建。
           * 比如：群聊会话，可能是从群聊列表中创建的，此时source字段会记录群聊的id
           * 用于在云端同步创建会话时的判断依据，比如：限制只能群成员和群管理员才能发起私聊时，确定指的是哪个群
           */
          const conversation = this.find(param)
          if(conversation){
            conversation.source = source
          }
        },0)
      }
      return param
    }
  }
  __afterFind({res,param}){
    const friend_uid = param?.friend_uid || param?.user_id
     if(!res && friend_uid){
      // console.error('Conversation __afterFind',res,param)
      // 会话不存在，创建会话
      const conversationData = {
        friend_uid,
				"user_info": {"nickname": ""},
        "unread_count": 0,
        "user_id": $state.currentUser._id,
        "id": $utils.getConversationId(friend_uid),
        "type": param.friend_uid ? 1 : 2,
        "msgList": [],
        "update_time": Date.now(),
        "customSortTime": Date.now(),
        // 是本地临时会话数据
        "is_temp": true
      }
      const conversation = this.add(conversationData)
      return conversation
    }
    return res
  }
  __beforeAdd(datas){
		 // console.log('__beforeAdd',datas)
    if(!Array.isArray(datas)){
      datas = [datas]
    }
    return datas.reduce((resList, item, index) => {
      // console.log('resList',resList);
      // 如果已存在，则直接返回原来的。不需要重复处理
      let conversation_item = $state.conversation.find(item.id)
      if (conversation_item) {
        // console.log('此会话已经存在', conversation_item,conversation_item._update_time)
        resList.push(conversation_item)
        return resList
      }
      
      // 把群数据都存到群列表
      if(item.group_id){
        $state.group.set(item.group_info)
        // 删除冗余数据
        delete item.group_info
      } else {
				// 把会话相关的用户信息合并到 $users
				if(!item.is_temp) {
					$users.merge({[item.friend_uid]: item.user_info})
				}
			}
      
      // console.log('新增会话', item)
      // 插入客户端创建此会话的时间
      item.client_create_time = Date.now()
      try{
        let conversation = new ConversationItem(item)
        // console.log('新增会话', conversation)
        resList.push(conversation)
      }catch(e){
				console.error('ConversationItem error',e)
        $utils.reportError(e)
      }
      return resList
    }, [])
  }
  __afterAdd(datas){
    if(!Array.isArray(datas)){
      datas = [datas]
    }
    
    datas.forEach(conversation => {
      const {msgList} = conversation
      if(msgList){
        // 服务端查找“应当”按消息“更新”时间排序，但显示需要按“创建”时间倒序，所以这里需要重新排序
        msgList.sort((a,b) => a.create_time - b.create_time)
        // 将会话数据带的msgList添加到msg中
        conversation.msg.add(msgList,{canSetIsFull:true})
        // 删除冗余数据
        delete conversation.msgList
      }
    })
    
    
    // 通过 setTimeout 0，使得在下一次事件循环中执行，避免冲突
    setTimeout(() => {
      // console.log('__afterAdd',datas)
      datas.forEach(conversation => {
        // init响应式字段
        const activeProperty = this.find(conversation.id).activeProperty()
        Object.keys(activeProperty).forEach(key => {
          const item = activeProperty[key]
          conversation[key] = computed(item)
        })
      })
    }, 0)
  }
  __afterGet(datas){
    // 获取单个会话时，检查群会话是否已经加载完群成员
    if(datas && !Array.isArray(datas)){
      const conversation = datas
      const member = conversation.group?.member
      if (member?.needLoadOnce) {
        member.needLoadOnce = false
        setTimeout(()=>member.loadMore(),1000)
      }
    }
  }
  __afterGetMore(datas){
    if (this.dataList.length === 0 && datas.length >0){
      // console.log('首次拉取会话')
      getCloudMsg()
    }
  }
  async __get(param) {
    const loadMoreType = this.loadMore?.type || 'all'
		const lastConversationKey = typeof loadMoreType === 'string' ? loadMoreType : Object.keys(loadMoreType).join('-') + "_" + Object.values(loadMoreType).join('-')
    let conversation_id = param
    if (typeof param === "object"){
      conversation_id = param.id || param.conversation_id
    }
    const uniImCo = uniCloud.importObject("uni-im-co",{customUI: true})
    const limit = this.loadLimit
    const conversationDatas = this.dataList
    // 已有会话id的情况下，不设置更新时间条件
    let maxLastMsgCreateTime = false;
    let skip = 0;
    const group_id = param?.group_id
    if (!conversation_id && !group_id) {
      // 会话列表的总数
      const conversationCount = conversationDatas.length
      if(conversationCount !== 0){
        // 本地除置顶会话之外的普通会话个数
        const normalConversationCount = conversationDatas.filter(i => !i.pinned).length
        if(normalConversationCount === 0){
          // 全部是置顶会话的情况下，当前会话有几个就跳过几个
          skip = conversationCount
        }else{
          // 上一次请求的最后一条会话数据，用于分页查询。如果当前会话列表为空（比如：首次打开/被移除了所有会话/重新登录等），则此字段应当为false
          maxLastMsgCreateTime = this.loadMore?.lastConversation?.[lastConversationKey]?.last_msg_create_time || false
          // console.log('maxLastMsgCreateTime：'+maxLastMsgCreateTime,'loadMoreType:'+lastConversationKey);
          if(maxLastMsgCreateTime){
            // 查询时间与 maxLastMsgCreateTime 相同的会话数。（因为某些情况下，多个会话的update_time相同）
            skip = conversationDatas.filter(i => i.last_msg_create_time === maxLastMsgCreateTime).length
          }
        }
      }
    }
    // console.log('maxLastMsgCreateTime', maxLastMsgCreateTime);
    let res = await uniImCo.getConversationList({
      maxLastMsgCreateTime,
      limit,
      conversation_id,
      skip,
      // 是否要区分是否为置顶会话
      distinguishPinned: loadMoreType === 'all',
      type:loadMoreType,
      group_id
    })
    if (!conversation_id) {
			if (typeof this.loadMore.lastConversation == "object") {
				this.loadMore.lastConversation[lastConversationKey] = res.data[res.data.length - 1]
			}else{
				this.loadMore.lastConversation = {[lastConversationKey]: res.data[res.data.length - 1]}
			}
    }
    return res.data
  }
  // 统计所有消息的未读数
  unreadCount() {
    // console.log('计算 conversation unreadCount')
    const conversationDatas = $state.conversation.dataList
    const cloudUnreadCountObj = $state.conversation.cloudUnreadCountObj
    const localUnreadCountObj = conversationDatas.reduce((sum, item, index, array) => {
      const {id,mute,unread_count} = item
      if ( id in cloudUnreadCountObj || !mute && unread_count) {
        sum[id] = mute ? 0 : unread_count
      }
      return sum
    }, {})
    // console.log('localUnreadCountObj n',Object.values(localUnreadCountObj).reduce((sum, item) => sum + item, 0))
    const unreadCountObj = {
      ...cloudUnreadCountObj,
      ...localUnreadCountObj
    }
    // console.log('unreadCountObj', unreadCountObj)
    return Object.values(unreadCountObj).reduce((sum, item) => sum + item, 0)
  }
  /**
   * 清空所有未读消息数
   */
  clearUnreadCount(){
    uniImCo.clearUnreadCount().then(res => {
      let conversationDatas = $state.conversation.dataList.filter(i => i.unread_count > 0)
      conversationDatas.forEach(i => {
        i.unread_count = 0
        // console.log('i',i)
      })
      this.cloudUnreadCountObj = {}
    }).catch(err => {
      console.error('clearUnreadCount err',err)
    })
  }
  // 删除会话后，如果当前选中的会话是该会话，则清空当前选中的会话
  __afterRemove(item){
    if($state.currentConversationId == item.id){
      $state.currentConversationId = null
    }
  }
}