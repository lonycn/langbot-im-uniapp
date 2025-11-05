import {watch} from 'vue'
import $state from '../state/index.js'
import $methods from '@/uni_modules/uni-im/sdk/methods/index.js';
import $utils from '@/uni_modules/uni-im/sdk/utils/index.js';
import CloudData from '@/uni_modules/uni-im/sdk/ext/CloudData.class.js'
import MsgItem from './MsgItem.class.js'
const dbJQL = uniCloud.databaseForJQL()
const dbJQLcmd = dbJQL.command;

export default class Msg extends CloudData {
  constructor(conversation_id) {
    super()
    this.loadLimit = 10 //每次拉取的条数
    this.conversation_id = conversation_id
    this.isFull = false
  }
  // 可见的消息列表（过滤掉不可见的消息，比如：消息撤回指令、更新群头像指令...）
  visibleDataList(){
    return this.dataList.filter(msg => $utils.isReadableMsg(msg))
  }
  __saveToLocal(datas,{canSetIsFull}){
    // #ifndef H5
    return
    // #endif
    
    let transaction = $state.indexDB.transaction('uni-im-msg', 'readwrite')
    let objectStore = transaction.objectStore('uni-im-msg') // 仓库对象
    let index = 0
    let length = datas.length
    const addData = (data) =>{
      data.__isLocal = true
      const res = objectStore.add(data)
      res.onsuccess = (e) => {
        // console.log('resolve',e, index, length);
        index++
        if (index == length) {
          // console.log('add - success', e);
        }
      }
      res.onerror = (e) => {
        console.error('add - failed', e);
        reject(e)
      }
    }
    // 拷贝一份数据，避免修改原数据
    const dataList = JSON.parse(JSON.stringify(datas))
    dataList.forEach(data => {
      // console.log('data._id',data._id);
      if(data._id){
        objectStore.index("_id").get(data._id).onsuccess = event => {
          // console.log('get',event.target.result);
          if (event.target.result) {
            // console.error('canSetIsFull',canSetIsFull)
            if(canSetIsFull && !this.isFull){
              // console.log('数据已存在，设置canSetIsFull', canSetIsFull, data.body);
              this.isFull = true
            }
            // console.log('数据已存在', data._id);
            return
          }else{
            // console.log('可以新增', data._id);
            addData(data)
          }
        }
      }else{
        addData(data)
      }
    })
  }
  __beforeAdd(datas){
    const currentConversation = $state.conversation.find(this.conversation_id)
    // 如果插入的消息，包含指令（撤回、新用户进群、用户离群、@我 等）则执行指令
    // 允许插入消息之前，执行一些操作
    $state.extensions.invokeExts('before-add-msg', datas)
    datas.forEach(async data => {
      // console.log('beforeAdd',data);
      // 如果此消息，创建时间在当前设备创建此会话之前，则无需执行
      const conversation_time =  currentConversation.update_time || currentConversation.client_create_time || 0
      if (data.create_time <= conversation_time) {
        return //console.log('消息创建时间早于会话最新时间，不执行',data.create_time,conversation_time);
      }
      // 调用扩展程序，使扩展程序可以在消息插入之前执行一些操作
      $methods.msgTypes.get(data.type)?.beforeLocalAdd?.(data,currentConversation)
      // 如果收到的是撤回消息指令
      if (data.type === "revoke_msg") {
        return currentConversation.revokeMsg(data.body.msg_id, false)
      }
      // 订单支付通知
      if(data.type === 'pay-notify' && data.from_uid === "system"){
        // console.log('收到订单支付通知',data);
        const {order_id,group_id,pay_channel,status} = data.body
        let currentConversation = $state.conversation.find({group_id})
        if(currentConversation){
          const msg = currentConversation.msg.find({body:{"order_id":order_id}})
          if(!msg){
            console.log('pay-notify 未找到订单消息',data);
            return
          }
          console.log('pay-notify msg',msg);
          msg.body.pay_channel = pay_channel
          msg.body.status = status || 1
          msg.body.pay_time = data.create_time
          msg.body.pay_notify = data
        }else{
          console.log('pay-notify 未找到会话',data);
        }
      }
      const current_uid = $state.currentUser._id
      //  系统通知
      if (data.type === "system") {
        // 用户退出、被踢出群
        if (["group-exit", "group-expel"].includes(data.action)) {
          data.body.user_id_list.forEach(uid=>{
            // 从列表中移除这些用户
            currentConversation.group.member.remove({"users":{"_id":uid}})
            currentConversation.group.member_count --
          })
          if (data.body.user_id_list.includes(current_uid)) {
            // 移除相关会话
            $state.conversation.remove(currentConversation.id)
            // 删除相关群
            $state.group.remove(currentConversation.group_id)
          }
        } else if (data.action === "group-dissolved") {
          // 解散群
          $state.conversation.remove(currentConversation.id)
          $state.group.remove(currentConversation.group_id)
        }
        // 新用户加群
        else if (data.action === "join-group") {
          const {new_member_list,user_id_list} = data.body
          // 如果新加入此群的用户id列表，包括当前用户 
          if(user_id_list.includes(current_uid)){
            // 此会话当前设备之前就加载过，需要重新加载群会话和成员列表（因为被踢出群期间可能有其他用户进群、发消息等）
            if(currentConversation.client_create_time < data.create_time){
              const uniImCo = uniCloud.importObject("uni-im-co",{customUI: true})
              let res = await uniImCo.getConversationList({"conversation_id":currentConversation.id})
              Object.assign(currentConversation, res.data[0])
              //先清空 群成员
              currentConversation.msg.reset()
              currentConversation.group.reset()
              //重新拉取 群成员
              await currentConversation.group.loadMore()
              // 获取群公告
              currentConversation.has_unread_group_notification = !!currentConversation.group.notification
            }
          }else{
            // 将新成员加入到群成员列表
            // 获取成员信息 get方法会从云端拉取本地不存在的用户数据
            await $state.users.get(new_member_list.map(i=>i.user_id))
            new_member_list.forEach(member=>{
              // 补全用户信息
              member.users = $state.users[member.user_id]
              currentConversation.group.member.add(member)
              currentConversation.group.member_count ++
            })
          }
        }
        //更新群资料
        else if (data.action.indexOf("update-group-info-") === 0) {
          if(data.action === "update-group-info-mute_all_members" && currentConversation?.group?.mute_all_members != data?.body?.updateData?.mute_all_members){
            const {mute_all_members} = data.body.updateData
            currentConversation.group.member.dataList.forEach(member => {
              member.mute_type += (mute_all_members ? 1 : -1)
            })
          }
          currentConversation.group = Object.assign(currentConversation.group,data.body.updateData)
          const {notification} = data.body.updateData
          if(data.action === "update-group-info-notification"){
            console.log('收到群公告');
            currentConversation.has_unread_group_notification = true
          }
        }
        else if(data.action === "set-group-admin"){
          const {user_id,addRole,delRole} = data.body
          const {role} = currentConversation.group.member.find(user_id)
          if(addRole.length != 0){
            role.push(...addRole)
          }else if(delRole.length != 0){
            console.log('delRole',delRole);
            delRole.forEach(r=>{
              console.log('r',r);
              console.log('role',role);
              const index = role.findIndex(i => i === r)
              console.log('index',index);
              if(index > -1){
                role.splice(index,1)
              }
            })
          }
          // console.log('设置群管理员',currentConversation.group.member.find(user_id));
        }
        // 
        else if(data.action === "set-group-member-ext-plugin-order-info"){
          const {user_id,group_id,dcloud_plugin_order_info} = data.body
          const member = currentConversation.group.member.find(user_id)
          if(!member.ext){
            member.ext = {}
          }
          console.log('设置群成员插件订单信息',member);
          member.ext.dcloud_plugin_order_info = dcloud_plugin_order_info
        }
      }
      
      if (
        // 如果收到的是群聊且带@的消息
        data.group_id &&
        data.call_uid && 
        (
          // @所有人 或 @我
          data.call_uid == '__ALL' ||
          data.call_uid.includes(current_uid)
        )
      ) {
        currentConversation.remind_msg_ids.push(data._id)
      }
    })
    
    return datas.map(item => new MsgItem(item))
  }
  __afterAdd(datas,{canSetIsFull}){
    datas.forEach(msg => {
      watch(msg, (newMsg)=>msg.__updateAfter(newMsg), {deep: true})
    })
    // console.log('canSetIsFull',canSetIsFull)
    // 存到客户端数据库中
    if(datas[0] && !datas[0].__isLocal){
      const msgs = datas.filter(data => {
        let needSave = $utils.isReadableMsg(data)
        if (needSave) {
          return true
        }else{
          // console.log('不需要保存',data);
          return false
        }
      })
      this.__saveToLocal(msgs,{canSetIsFull})
    }
    return datas
  }
  async __getLocalData({
    minTime = 0,
    maxTime = Date.now(),
    limit = this.loadLimit,
    _id = false,
    orderBy = {
      // asc 升序，desc 降序
      "create_time": "desc"
    }
  }){
    // #ifndef H5
    return []
    // #endif
    
    // console.log('minTime',minTime,'maxTime',maxTime,'limit',limit,'_id',_id,'orderBy',orderBy)
    const start = Date.now()
    let datas = await new Promise((resolve, reject) => {
      //  根据 id 查询
      if (_id) {
        // console.error('$state.indexDB~~~',$state.indexDB)
        let getRequest = $state.indexDB.transaction("uni-im-msg")
          .objectStore("uni-im-msg")
          .index("_id")
          .get(_id)
        getRequest.onsuccess = function(event) {
          if (getRequest.result) {
            resolve([getRequest.result])
          } else {
            resolve([])
          }
        };
        getRequest.onerror = function(event) {
          console.log('Error getting data');
          resolve([])
        };
        return
      }

      // 设置查询索引
      // console.log('kkkkkkkk',[this.conversation_id, minTime], [this.conversation_id,maxTime]);
      let range = IDBKeyRange.bound([this.conversation_id, minTime], [this.conversation_id, maxTime])
      // 传入的 prev 表示是降序遍历游标，默认是next表示升序；
      // $state.indexDB 在im的场景下，查始终是降序遍历游标 orderBy指的是查询结果的排序方式
      let sort = "prev"
      // console.log('sortsortsortsortsortsortsort',sort);
      // console.error('$state.indexDB~~~',$state.indexDB)
      let task = $state.indexDB.transaction("uni-im-msg")
        .objectStore("uni-im-msg")
        .index("conversation_id-create_time")
        .openCursor(range, sort)
      
      let datas = [], index = 0;
      task.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
          // console.log('cursor',cursor.value);
          // 排除边界值
          if (![minTime, maxTime].includes(cursor.value.create_time)) {
            datas.push(cursor.value)
            index++
          }else{
            // console.log('边界值',cursor.value.create_time);
          }
          
          // console.log('index',index,limit);
          if (limit && index === limit) {
            resolve(datas)
          } else {
            cursor.continue();
          }
        } else {
          resolve(datas)
        }
      }
      task.onerror = function(err) {
        console.error(err);
        resolve([])
      }
    })
    // console.log('本地查找耗时',Date.now() - start);
    datas.sort((a, b) => {
      if (orderBy.create_time == 'asc') {
        return a.create_time - b.create_time
      } else {
        return b.create_time - a.create_time
      }
    })
    // console.log('本地查到的datas：',datas);
    return datas
  }
  async __get(){
    //已经拉取的数据中时间最小的值，作为最大
    let maxTime = this.dataList[0]?.create_time || Date.now()
    let localData = []
    if(this.isFull){
      // 如果云端和本地数据重合了，则可以先从本地查
      // console.log('如果云端和本地数据重合了，则可以先从本地查',this.isFull);
      localData = await this.__getLocalData({
        maxTime: maxTime,
        limit: this.loadLimit,
        orderBy: {
          "create_time": "asc",
        },
      })
      // 如果本地有数据，直接返回
      if (localData.length === this.loadLimit) {
        // console.log('本地有数据',localData);
        return localData
      }else{
        // console.error('本地未拉满'+this.loadLimit+'条，从云端拉取 this.isFull',this.isFull);
      }
    }else{
      // console.log('本地数据未与云端重合，需从云端拉取',this.isFull);
    }
    
    maxTime = localData[0]?.create_time || maxTime
    
    // 本地没有数据，从云端拉取
    const where = {
      "conversation_id": this.conversation_id
    }
    if(this.preWhere){
      Object.assign(where, this.preWhere)
    }
    if(maxTime){
      where.update_time = dbJQLcmd.lt(maxTime)
    }
    let data;
    let res = await dbJQL.collection('uni-im-msg')
      .where(where)
      .limit(this.loadLimit - localData.length)
      .orderBy('update_time', 'desc')
      .get()
    // console.error('云端查找到', res.data.length ,'条',res.data);
    
    // 服务端查找“应当”按消息“更新”时间排序，但显示需要按“创建”时间倒序，所以这里需要重新排序
    res.data.sort((a,b) => b.create_time - a.create_time)
    data = res.data.concat(localData)
    // console.error('合并本地与云端为', data.length ,'条',data);
    // console.error('where', where,data);
    return data
  }
  __canSeaveToDataMap(msg){
    // 本地创建的消息，不保存到dataMap中。等发送成功后，服务端回调_id再由__updateAfter方法更新到dataMap中
    return msg._id?.indexOf('temp_') === -1
  }
}