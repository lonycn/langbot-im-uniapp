import {watch,computed} from 'vue'
import $state from '@/uni_modules/uni-im/sdk/state/index.js';
import $utils from '@/uni_modules/uni-im/sdk/utils/index.js';
import $extensions from '@/uni_modules/uni-im/sdk/methods/extensions.js';
import Msg from '@/uni_modules/uni-im/sdk/state/Msg.class.js'
const db = uniCloud.database();
const uniImCo = uniCloud.importObject("uni-im-co",{customUI:true})
/**
 * 会话类，实现会话相关的业务逻辑。
 */
class ConversationItem {
  constructor(data) {
    // 检查是否关联用户/群被删除
    if (!data.group_id && !data.user_info) {
      // 删除本地生成的 data.client_create_time 避免错误重复上报
      delete data.client_create_time
      throw new Error('会话列表失效，疑似关联用户/群被删除(请改为软删除避免系统异常）data:'+JSON.stringify(data));
    }
    // 对话框消息内容
    this.chatInputContent = ""
    // @我的消息id列表
    this.remind_msg_ids = []
    
    this.msg = new Msg(data.id)
    
    // 客户端创建此会话的时间
    this.client_create_time = Date.now()
    // 是否已离开（退出、被踢出）群聊
    this.leave = false
    // 默认不置顶
    this.pinned = false
    
    this.tags = []

    // 是否已经初始化。 从缓存中取出的会话数据可能已经初始化，这里需要归零
    data.isInit = true
    Object.assign(this, data)
		
		this.readRemindMsg = (id)=>{
			// 需要绕一圈，否则无法触发响应式
			const remind_msg_ids = $state.conversation.find(this.id).remind_msg_ids
			if(id) {
				remind_msg_ids.splice(remind_msg_ids.indexOf(id),1)
				console.log('readRemindMsg',id,remind_msg_ids)
			} else {
				id = remind_msg_ids.pop()
			}
			if(id){
				uniImCo.removeRemindMsgId({
					conversation_id:this.id,
					msg_id:id
				}).then((e)=>{
					console.log('removeRemindMsgId success',id,e)
				})
			}
			return id
		}

    if (this.group_id) {
      // 群聊
      this.group = $state.group.find(this.group_id)
      if (!this.group) {
        console.error('群聊不存在', this)
        throw new Error('群聊不存在')
      }

      // 2. 设置群tag
      // 调用扩展点，扩展程序可以为该会话增加 tag。
      Promise.all($extensions.invokeExts('conversation-tags', this))
        .then(tags => {
          tags = tags.filter(tag => tag)
          if (tags.length === 0) {
            this.tags = ['群聊']
          }else{
            // 需要绕一圈，否则无法触发响应式
            $state.conversation.find(this.id).tags = tags
          }
        })

      // 3. 初始化字段:群简介、群公告、群头像
      const fieldList = [{
          "introduction": ""
        }, {
          "notification": {
            "content": false
          }
        }, {
          "avatar_file": {
            "url": ""
          }
        },
        {
          "mute_all_members": false // 全员禁言
        }
      ]
      fieldList.forEach(item => {
        const key = Object.keys(item)[0]
        if (!this.group[key]) {
          this.group[key] = item[key]
        }
      })
      // 4. 非单聊，不需要用户信息
      this.user_info = false
    } else {
      // 非群聊，不需要群消息
      this.group = false
			if(this.is_temp){
				this.user_info = {}
				$state.users.get(this.friend_uid).then(userInfo => {
					// 绕一圈，否则无法触发响应式
					$state.conversation.find(this.id).user_info = userInfo
				})
			}else{
				this.user_info = $state.users[this.friend_uid]
			}
      const real_name = this.user_info?.realname_auth?.real_name
      if (real_name){
        this.tags = [real_name]
      }
    }
    
    // 初始化响应式属性
    this.activeProperty().init()
  }
  /**
   * 会话未读消息数清零。
   */
  clearUnreadCount() {
    // console.log('clearUnreadCount');
    setTimeout(() => {
      this.unread_count = 0
    }, 100);
    // console.log('clearUnreadCount this.id', this.id)
    // 触发器会触发消息表的 is_read = true
    uniCloud.database()
      .collection('uni-im-conversation')
      .where({
        user_id: $state.currentUser._id,
        id: this.id
      })
      .update({
        "unread_count": 0
      }).then(e => {
        console.log('设置为已读', e.result.updated);
      }).catch(err => {
        console.error('设置为已读失败', err);
      })
  }

  /** 撤回消息。
   * @param {object} msg - 参数对象
   * @param {string} msg._id - 消息id
   * @param {string} msg.msg_id - 消息id和_id二选一
   * @param {string} msg.conversation_id - 所属会话的id
   * @param {number} msg.create_time - 创建时间
   * @param {boolean} [submit=true] -  是否需要提交；操作撤回端需要提交，被动撤回消息端无需提交
   */
  async revokeMsg(msg_id, submit = true) {
    // 处理内存中显示中的数据
    const msg = this.msg.find(msg_id)
    if (!msg) {
      return console.warn('内存中没有找到此消息（当前用户可能还没点开相关会话），无需撤回', msg_id)
    }
    // 是否为当前用户触发的撤回
    if (submit) {
      // 保存撤回前的消息内容，用于方便点击重新编辑
      msg.before_revoke_body = msg.body
      // ui 界面上显示撤回中
      msg.revoke_ing = true
      // 提交操作到云端
      try {
        await uniImCo.sendMsg({
          "type": "revoke_msg",
          "body": {msg_id}
        })
      } catch (err) {
        console.log('err', err);
        // 撤回失败，还原数据
        msg.body = msg.before_revoke_body
        delete msg.before_revoke_body
        delete msg.revoke_ing
        return uni.showToast({
          title: err.message,
          icon: 'none'
        });
      }
      // ui 界面上去掉撤回中
      delete msg.revoke_ing
    }
    msg.is_revoke = true
    msg.body = '[此消息已被撤回]'
  }

  /**
   * 获取用户信息。
   */
  getUsersInfo() {
    // 群会话返回群成员信息，单聊返回对方用户信息
    return this.group_id ? this.group.member.dataList : {
      [this.user_info._id]: this.user_info
    }
  }
  /**
   * changeMute
   */
  changeMute() {
    this.mute = !this.mute
    const db = uniCloud.database();
    db.collection('uni-im-conversation')
      // 因为本地创建的会话没有_id，需通过user_id和id指定要操作的会话
      .where({
        user_id: this.user_id,
        id: this.id
      })
      .update({
        "mute": this.mute
      })
      .then((e) => {
        console.log('updated 消息免打扰设置', e.result.updated, this._id)
      })
      .catch(() => {
        uni.showToast({
          title: '服务端错误，消息免打扰设置失败，请稍后重试',
          icon: 'none'
        });
        this.mute = !this.mute
      })
  }
  /**
   * 设置响应式属性。
   * @param {Object} data
   */
  activeProperty(data) {
    this._leave = this.leave
    this._update_time = this.update_time || this.create_time
    const _conversation = this
    const activeProperty = {
      title() {
        return _conversation.group_id ? _conversation.group.name : _conversation.user_info.nickname
      },
      avatar_file() {
        return _conversation.group_id ? _conversation.group.avatar_file : _conversation.user_info.avatar_file
      },
      leave:{
        get() {
          if (_conversation.msg.dataList.length === 0) {
            return _conversation._leave
          } else {
            let last_msg = _conversation.msg.dataList[_conversation.msg.dataList.length - 1]
            //群被解散，或者被踢出
            return "group-dissolved" === last_msg.action || ["group-exit", "group-expel"].includes(last_msg.action) && last_msg.body.user_id_list.includes($state.currentUser._id)
          }
        },
        set(value){
          // console.log('set leave value',value)
          _conversation._leave = value
        }
      },
      isMuteAllMembers() {
        try{
          if (!_conversation.group_id) return false
          const member = _conversation.group.member.find($state.currentUser._id)
          // console.log('member',member)
          return member && !member.role.includes('admin') && _conversation.group.mute_all_members
        }catch(e){
          console.error('isMuteAllMembers',e,_conversation)
          console.error('isMuteAllMembers',1,_conversation.group)
          console.error('isMuteAllMembers',2,_conversation.group.member)
          console.error('isMuteAllMembers',3,_conversation.group.member.find)
          console.error('isMuteAllMembers',4,typeof _conversation.group.member.find)
        }
      },
      // 最后一条可见消息
      _last_visible_msg() {
        // 拿到内存中的
        const visibleMsgList = _conversation.msg.visibleDataList()
        const vml = visibleMsgList.length
        return vml > 0 ? visibleMsgList[vml - 1] : false
      },
      // 最后一条可见消息的时间，也被用于排序会话
      time() {
        // 如果存在最后一条可见消息，就用它的时间，否则用会话的更新时间 （注意：不能取最大值，因为消息被已读也会更新会话时间，此时会话无需重新排序）
       const last_visible_msg = _conversation._last_visible_msg
       let time = last_visible_msg ? (last_visible_msg.create_time || last_visible_msg.client_create_time) : _conversation.update_time
       // time 和本地自定义排序时间比较，取最大值。说明：customSortTime 是临时将会话排序提升到最前的时间。比如：在群成员列表/消息列表等 与某个用户起会话，临时将会话提升到最前等
       return Math.max(time, _conversation.customSortTime || 0)
      },
      // 最后一条可见消息的内容
      note() {
        let note = _conversation.last_msg_note || '暂无聊天记录'
        // 如果输入框有文本未发出（草稿），直接覆盖消息
        let chatInputContent = _conversation.chatInputContent
        if (typeof chatInputContent === 'object') {
          chatInputContent = chatInputContent.text || '[富文本消息]'
        } else {
          // 把this.chatInputContent中的&nbsp;变成空格，再把头尾的空格去掉
          chatInputContent = chatInputContent.replace(/&nbsp;/g, ' ').trim()
        }
        _conversation.hasDraft = chatInputContent && $state.currentConversationId != _conversation.id
        let last_visible_msg = _conversation._last_visible_msg
        if (_conversation.hasDraft) {
          note = chatInputContent
          last_visible_msg = {
            body: chatInputContent,
            type: 'text'
          }
        }
        if (last_visible_msg) { // 如果存在最后一条消息
          const _last_visible_msg = JSON.parse(JSON.stringify(last_visible_msg))
          // console.error('last_visible_msg',_last_visible_msg)
          note = $utils.getMsgNote(last_visible_msg)
        }
        // 替换\\n \\r \n \r &nbsp; &lt; &gt; &amp; 为 空格
        note = note.replace(/\\n|\\r|\n|\r|&nbsp;|&lt;|&gt;|&amp;/g, ' ')
        // 拿到发送消息的用户昵称
        const {nickname} =last_visible_msg
        if(_conversation.group_id && nickname){
          note = nickname + ': ' + note
        }
        
        return note.trim()
      },
      // 刷新会话的更新时间
      update_time:{
        get() {
          // console.log('refreshUpdateTime');
          // 拿到最后一条消息
          let update_time = _conversation._update_time
          let msgLength = _conversation.msg.dataList.length
          if (msgLength > 0) {
            let last_msg = _conversation.msg.dataList[msgLength - 1]
            // 拿到最后一条消息的创建时间，消息发送成功之前没有create_time，用client_create_time
            let last_msg_time = last_msg.create_time || last_msg.client_create_time
            if (last_msg_time > update_time) {
              update_time = last_msg_time
            }
          }
          return update_time
        },
        set(value) {
          _conversation._update_time = value
        }
      }
    }
    
    let res = {
      init() {
        Object.keys(activeProperty).forEach(key => {
          let item = activeProperty[key];
          if (typeof activeProperty[key] != 'function') {
            item = activeProperty[key].get
          }
          _conversation[key] = item()
        })
      },
      ...activeProperty
    }
    
    Object.defineProperty(res, 'init', {
      // 设置init方法不可枚举
      enumerable: false
    })
    return res
  }
  // 隐藏会话
  async hide() {
    console.log('hidden######');
    this.hidden = true
    let res = await db.collection('uni-im-conversation')
      // 因为本地创建的会话没有_id，需通过user_id和id指定要操作的会话
      .where({
        user_id: this.user_id,
        id: this.id
      })
      .update({
        "hidden": true
      })
    console.log('updated hidden', res)
    return res
  }
  // 设置未读消息数
  async setUnreadCount(count) {
    // console.log('setUnreadCount', count);
    const oldCount = this.unread_count
    this.unread_count = count
    let res = await db.collection('uni-im-conversation')
      // 因为本地创建的会话没有_id，需通过user_id和id指定要操作的会话
      .where({
        user_id: this.user_id,
        id: this.id
      })
      .update({
        "unread_count": count
      })
      .catch(err => {
        console.error('setUnreadCount err', err);
        this.unread_count = oldCount
      })
      .then(e => {
        // console.log('setUnreadCount updated', e.result.updated);
      })
    return res
  }
  async changeIsStar() {
    const oldIsStar = this.is_star
    console.log('setIsStar', oldIsStar);
    this.is_star = !oldIsStar
    let res = await db.collection('uni-im-conversation')
      // 因为本地创建的会话没有_id，需通过user_id和id指定要操作的会话
      .where({
        user_id: this.user_id,
        id: this.id
      })
      .update({
        "is_star": this.is_star
      })
      .catch(err => {
        console.error('setIsStar err', err);
        this.is_star = oldIsStar
      })
      .then(e => {
        console.log('setUnreadCount updated', e.result.updated);
      })
    return res
  }
}

export default ConversationItem
