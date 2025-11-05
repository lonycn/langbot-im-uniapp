import {computed} from 'vue'
import { store as uniIdStore } from '@/uni_modules/uni-id-pages/common/store.js';
import CloudData from '@/uni_modules/uni-im/sdk/ext/CloudData.class.js'
import Conversation from './Conversation.class.js'
import Group from './Group.class.js'
import Friend from './Friend.class.js'
export default {
  // 会话数据
  conversation: new Conversation(),
  // 好友列表
  friend: new Friend(),
  // 群列表
  group: new Group(),
  // 系统通知消息
  notification: new CloudData(),
  // 存储所有出现过的用户信息，包括群好友信息
  users: {},
	// 用户别名
	userAlias:{},
  // 当前用户信息
  currentUser: computed(()=>{
    const {role,tokenExpired,permission} = uniCloud.getCurrentUserInfo()
    return {
      ...uniIdStore.userInfo,
      role,tokenExpired,permission
    }
  }),
  // 是否禁用（用于全局禁用）
  isDisabled: false,
  // 正在对话的会话id
  currentConversationId: false,
  // 全局响应式心跳，用于更新消息距离当前时长 等
  heartbeat: '',
  //是否为pc宽屏
  isWidescreen: false,
  //是否为触摸屏
  isTouchable: false,
  //系统信息
  systemInfo: {},
  // #ifndef H5
  indexDB: false,
  // #endif
  audioContext: false,
  // sqlite数据库是否已经打开
  dataBaseIsOpen: false,
  socketIsClose: false,
  // 自由挂载任意自定义的全局响应式变量，特别用于nvue下跨页面通讯
  ext:{
    appIsActive:true,
    _initImData:{
      callbackList:[],
      isInit:false
    },
    _extensionPoints:{}
  }
}