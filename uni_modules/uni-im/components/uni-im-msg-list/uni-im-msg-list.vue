<template>
  <view class="uni-im-msg-list-root" :class="{'in-topic':filterAsUid.length}">
    <filter-contorl ref="filter-contorl" class="filter-contorl" @change="updateFilterUids" :conversationId="conversationId"></filter-contorl>
    <uni-im-list class="uni-im-list" :scrollTop="scrollTop"
      :scroll-into-view="scrollIntoView" ref="uni-im-list"
      @scroll="onScroll" @scrolltolower="onScrollToLower"
    >
     <template v-for="(msg,index) in visibleMsgList" :key="msg.unique_id || msg._id">
       <view class="uni-im-list-item" :ref="'item-'+index">
         <view v-if="index === 0" class="data-state-tip-box">
           <uni-im-load-state :status="loadStatus" 
              :contentText='{"contentrefresh": "正在加载历史消息","contentnomore": "没有更多历史消息"}'></uni-im-load-state>
         </view>
         <view :class="['item',msg.type]" :id="'item-'+index" @click="clickItem">
           <view class="msg-box" :class="{'active-msg':msg._id === activeMsgId || msg.unique_id === activeMsgId,'pointer':chooseMore}" @click="checkMsg(msg)">
             <template v-if="chooseMore && !msg.is_revoke">
              <checkbox :checked="checkedMsgList.find(i=>i._id == msg._id) != undefined" class="checkbox" />
              <view class="mask"></view>
             </template>
             <!-- <text style="width: 750rpx;text-align: center;border: 1px solid #000;">{{'item-'+index}}</text> -->
             <uni-im-msg :msg="msg" :id="msg._id" :self="currentUid == msg.from_uid" :index="index"
             @putChatInputContent="putChatInputContent" :equalPrevTime="equalPrevTime(index)" 
             @showMsgById="showMsgById" @showControl="showControl" @intoTopic="intoTopic"
             @longpressMsgAvatar="longpressMsgAvatar" @retriesSendMsg="retriesSendMsg" 
             @viewMsg="viewMsg" ref="uni-im-msg" class="uni-im-msg"
             >
             </uni-im-msg>
           </view>
         </view>
       </view>
     </template>
     <uni-im-load-state v-if="visibleMsgList.length === 0" :status="loadStatus" class="uni-im-list-item" :contentText='{"contentrefresh": "加载中","contentnomore": "- 没有聊天记录 -"}'></uni-im-load-state>
    </uni-im-list>
    
    <view v-if="hasNewMsg" class="new-msg-bar" @click="showLast">
      <uni-icons type="pulldown" size="18" color="#007fff"></uni-icons>
      <text>有新消息</text>
    </view>
    
    <view style="position: fixed;top: 100px;width: 500rpx;">
      <!-- hasNewMsg:{{hasNewMsg}} -->
      <!-- scrollTop：{{scrollTop}} -->
      <!-- scrollIntoView:{{scrollIntoView}}
			visibleMsgList.length:{{visibleMsgList.length}} -->
			<!-- <button @click="showLast">showLast</button> -->
		</view>

    <view v-if="remind_msg_ids.length" class="showRemindMsg" @click="showRemindMsg">@回复我({{remind_msg_ids.length}})</view>

    <uni-popup @change="$event.show?'':closeGroupNotification()" ref="group-notification-popup" type="center" class="group-notification-popup">
      <uni-im-group-notification ref="group-notification"></uni-im-group-notification>
    </uni-popup>
		
		<uni-im-group-notice-popup ref="uni-im-group-notice-popup"></uni-im-group-notice-popup>

    <uni-im-view-msg ref="view-msg"></uni-im-view-msg>
  </view>
</template>

<script>
/**
 * uni-im-msg-list 组件，渲染一个会话列表。
 * 
 * 内部使用 {@link module:uni-im-list} 组件实现列表功能，使用 {@link module:uni-im-msg} 组件实现每条消息的渲染。
 * 
 * @module
 * @see module:chat
 * @see module:uni-im-list
 */
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  import uniImList from './components/uni-im-list/uni-im-list';
  import filterContorl from './components/filter-contorl/filter-contorl';

  // 当前页面滚动条高度
  let currentScrollTop = 0
  
  let appearObj = {};

  export default {
    components: {
      uniImList,
      filterContorl
    },
    emits:['checkedMsgList','update:checkedMsgList','longpressMsgAvatar','showControl','clickItem','retriesSendMsg','putChatInputContent','showMenberList'],
    computed: {
      ...uniIm.mapState(['systemInfo', 'isWidescreen']),
      loadStatus() {
        return this.conversation.msg.hasMore ? 'loading' : 'noMore'
      },
      visibleMsgList() {
        const visibleMsgList = this.conversation.msg.visibleDataList()
        // console.log('visibleMsgList',visibleMsgList);
        this.$nextTick(() => {
          uniIm.utils.throttle(this.setIntersectionObserver, 1000);
        })
        
        if(this.filterAsUid.length > 0){
          return visibleMsgList.filter(i=>this.filterAsUid.includes(i.from_uid))
        }
        // console.log('visibleMsgList.l',visibleMsgList.length);
        return visibleMsgList
      },
      //当前用户自己的uid
      currentUid() {
        return uniIm.currentUser._id;
      }
    },
    data() {
      return {
        conversation: {
          msg: {
            hasMore: true,
            visibleDataList: () => []
          },
          unread_group_notice_id: false,
          group_info: {
            notification: false
          }
        },
				lastMsgIsShow: true,
        scrollIntoView: "",
        scrollTop: 0,
        hasNewMsg: false,
        remind_msg_ids: [],
        activeMsgId: "",
        filterAsUid:[]
      }
    },
    watch: {
      'conversation.remind_msg_ids'(remind_msg_ids) {
        this.remind_msg_ids = remind_msg_ids
      },
      'conversation.unread_group_notice_id': {
        async handler(notice_id) {
					// 拿到新增的公告id
					if(notice_id){
						this.$refs["uni-im-group-notice-popup"].open({
							group_id: this.conversation.group_id,
							notice_id
						})
					}
        },
        immediate: true
      },
      filterAsUid(filterAsUid,old){
        this.$refs['filter-contorl'].userIdList = filterAsUid
				const {msg} = this.conversation
				msg.reset()
				if(filterAsUid.length === 0){
					msg.preWhere = false
				} else {
					msg.preWhere = {
						from_uid: uniCloud.databaseForJQL().command.in(filterAsUid)
					}
				}
				this.loadMore(()=>{
					this.showLast()
				})
      }
    },
    props: {
      conversationId: {
        default () {
          return false
        }
      },
      chooseMore: {
        default: false
      },
      checkedMsgList: {
        default () {
          return []
        }
      }
    },
    async mounted() {
    },
    destroyed() {
      // console.log('destroyed')
      if (this.intersectionObserver){
        this.intersectionObserver.disconnect()
      }
    },
    methods: {
      async init() {
        if (this.intersectionObserver){
          this.intersectionObserver.disconnect()
        }
        this.conversation = uniIm.conversation.find(this.conversationId)
        
        // init data --start
				this.lastMsgIsShow = true
        this.scrollIntoView = ''
        this.scrollTop = 0
        currentScrollTop = 0

        const showLast = ()=>{
          // #ifdef H5
          // 非web-pc端，list是颠倒的，所以默认显示最后一条。而web-pc端是正常的，所以需要滚动到底部
          if(this.isWidescreen){
            this.showLast()
          }
          // #endif
        }
        
        if(this.visibleMsgList.length === 0){
          await this.loadMore(showLast)
        } else {
          showLast()
          setTimeout(async()=>{
            const msgIsOverFlow = await this.msgIsOverFlow()
            if(this.visibleMsgList.length === 0 || !msgIsOverFlow){
             await this.loadMore(showLast)
            }
          },0)
        }
      },
      async msgIsOverFlow(){
        if(this.visibleMsgList.length > 0){
          // 计时
          // console.time('getElInfo')
          let firstMsgTop = (await this.getElInfo('#item-0')).top
          let lastMsgBottom = (await this.getElInfo('#item-' + (this.visibleMsgList.length - 1) )).bottom
          const listElInfo = await this.getElInfo('.uni-im-list')
          // console.timeEnd('getElInfo')
          return firstMsgTop < listElInfo.top || lastMsgBottom > listElInfo.bottom
        }else{
          return true
        }
      },
      async loadMore(callback) {
        let datas = []
        datas = await this.conversation.msg.getMore()
        if(datas.length){
          await this.insertMsg(datas)
        }
        if (typeof callback === 'function') {
          // 为兼容 web pc端特殊场景 不能使用$nextTick
          setTimeout(() => {
            callback(datas)
          }, 0)
        }
        return datas
      },
      msgOnAppear(msgId){
        uniIm.utils.throttle(()=>{
          let index = this.visibleMsgList.findIndex(i => i._id == msgId)
          if (index == -1) {
            return //因为是异步的，可能已经被销毁了替换了新对象
          }
          // console.log('msgOnAppear',index);
        }, 1000);
      },
      async setIntersectionObserver() {
        // console.log('setIntersectionObserver');
        if (this.intersectionObserver) {
          // console.log('this.intersectionObserver存在','执行销毁');
          this.intersectionObserver.disconnect()
          await uniIm.utils.sleep(1000)
        }
        
        this.intersectionObserver = uni.createIntersectionObserver(this, { observeAll: true })
          .relativeTo('.uni-im-list', {})
          .observe('.uni-im-msg', (res) => {
            const msgId = res.id
            const msgRef = this.$refs['uni-im-msg'].find(item => item.msg._id == msgId)
            if (!msgRef) {
              // console.error('找不到msgRef，或会话已切走', msgId);
              return
            }
            
            // hasBeenDisplayed表示是否已经显示过了
            const hasBeenDisplayed = appearObj[msgId] || false;
            // 新显示的
            const isAppear = res.intersectionRatio > 0 && !hasBeenDisplayed
            
            
            // 是否为最后一条消息
            const isLastMsg = [...this.visibleMsgList].pop()?._id === msgId
            if(isLastMsg){
              this.lastMsgIsShow = isAppear
              if(this.lastMsgIsShow){
                this.hasNewMsg = false
              }
            }
            
            if (isAppear) {
              appearObj[msgId] = true;
              msgRef.onAppear()
              this.msgOnAppear(msgId)
              
              // console.error('出现了',msgRef.msg.body)
              const isFirstMsg = this.visibleMsgList[0]?._id === msgId
              // 是否为第一个消息
              if (isFirstMsg) {
                // console.log('第一个消息出现在视窗内，加载更多',this.visibleMsgList[0]?._id , msgId);
                this.loadMore()
              }
              // 调用扩展点，通知消息列表某条消息进入显示区。
              uniIm.extensions.invokeExts('msg-appear', msgRef.msg)
            } else if (!res.intersectionRatio > 0 && hasBeenDisplayed) {
              appearObj[msgId] = false;
              msgRef.onDisappear()
              // console.error('消失了',msgRef.msg.body)
              // 调用扩展点，通知消息列表某条消息离开显示区。
              uniIm.extensions.invokeExts('msg-disappear', msgRef.msg)
            }
          })
      },
      viewMsg(msgList) {
        this.$refs['view-msg'].open(msgList);
      },
      async onScroll(e) {
        // 记录当前滚动条高度
        currentScrollTop = e.detail.scrollTop
        // console.log('onScroll', e.detail.scrollTop)
        
        // TODO:滚动停止后，将end置为true
        this.onScroll.end = false
        if (this.onScroll.timeoutId) {
          clearTimeout(this.onScroll.timeoutId)
        }
        this.onScroll.timeoutId = setTimeout(() => {
          this.onScroll.end = true
        }, 500)
      },
      async onScrollToLower() {
      },
      async canHoldScrollDo(fn){
        /**
         * 解决web-pc端，部分情况下插入消息滚动内容会跳动的问题
         */
        // #ifdef H5
        if(this.isWidescreen){
          if(window.chrome){
            // console.error('currentScrollTop',currentScrollTop)
            // console.error('this.visibleMsgList.length',this.visibleMsgList.length)
            const msgIsOverFlow = await this.msgIsOverFlow()
            if(msgIsOverFlow && currentScrollTop === 0 && this.visibleMsgList.length != 0){
              this.scrollTop = currentScrollTop
              await this.$nextTick(()=> this.scrollTop = (currentScrollTop + 1) )
              if(!this.canHoldScrollDo.tryIndex){
                this.canHoldScrollDo.tryIndex = 1
              }else{
                this.canHoldScrollDo.tryIndex ++
              }
              if(this.canHoldScrollDo.tryIndex > 10){
                console.warn('canHoldScrollDo tryIndex > 10',this.canHoldScrollDo.tryIndex,currentScrollTop,this.visibleMsgList.length)
                this.canHoldScrollDo.tryIndex = 0
                fn()
              }else{
                setTimeout(()=>{
                  this.canHoldScrollDo(fn)
                },300)
              }
            }else{
              fn()
            }
          }else{
            const getScrollContentHeight = ()=>document.querySelector('.scroll-content').offsetHeight
            let scrollContent = getScrollContentHeight()
            fn()
            // 下一个事件循环中，重新计算滚动条的高度
            setTimeout(()=>{
              const diff = getScrollContentHeight() - scrollContent
              // console.error( 'diff', diff)
              this.scrollTop = currentScrollTop
              this.$nextTick(()=> this.scrollTop = currentScrollTop + diff)
            },0)
          }
          return
        }
        // #endif
        fn()
      },
      async insertMsg(data) {
        return await new Promise((resolve) => {
          this.canHoldScrollDo(async ()=>{
            // 重新获取会话对象，防止web pc端 切换太快引起的会话对象指向错误
            const conversation = await uniIm.conversation.get(data[0].conversation_id)
            conversation.msg.add(data,{unshift:true})
            resolve()
          })
        })
      },
      equalPrevTime(index) {
        if (index === 0) {
          return false
        } else if (index == this.visibleMsgList.length - 1) {
          return false
        } else {
          const getFriendlyTime = (msg) => {
            return uniIm.utils.toFriendlyTime(msg.create_time || msg.client_create_time)
          }
          return getFriendlyTime(this.visibleMsgList[index]) == getFriendlyTime(this.visibleMsgList[index - 1])
        }
      },
      async showRemindMsg() {
        const msgId = this.conversation.readRemindMsg()
        console.log('msgId', msgId)
				if (msgId) {
          this.showMsgById(msgId)
        }
      },
      showLast() {
        let mLength = this.visibleMsgList.length
        this.showMsgByIndex(mLength - 1)
        this.hasNewMsg = false
      },
      notifyNewMsg() {
        this.hasNewMsg = true
        // 如果当前在底部，则自动显示最新消息
        if (this.lastMsgIsShow) {
          this.showLast()
        }
      },
      async getElInfo(select){
        return await new Promise((resolve, rejece) => {
          const query = uni.createSelectorQuery().in(this);
          query.select(select).boundingClientRect(data => {
            if (!data) {
              console.log('找不到 showMsgByIndex：' + select);
              return rejece(false)
            }
            resolve(data)
          }).exec()
        })
      },
      async showMsgByIndex(index) {
        if (index == -1) {
          return
        }
        const listHeight = (await this.getElInfo('.uni-im-list')).height
        const targetInfo = await this.getElInfo('#item-' + index)
        const itemScrollTop = targetInfo.top
        // console.error('currentScrollTop',currentScrollTop)
        // console.error('itemScrollTop',itemScrollTop,listHeight,currentScrollTop,index)
        let val = 0;
        let m = listHeight - targetInfo.height
        if(m < 0){
          m = 10
        }
         if(this.isWidescreen){
           val = itemScrollTop + currentScrollTop - 0.5 * m
         }else{
           val = itemScrollTop * -1 + currentScrollTop + 0.3 * m
         }
        
        // console.error('val',val)
        // 赋值为当前滚动条的高度
        this.scrollTop = currentScrollTop
        // 设置一个新值触发视图更新 -> 滚动
        this.$nextTick(async () => {
          this.scrollTop = val
          // console.error('currentScrollTop',currentScrollTop)
        })
      },
      // 进入话题
      intoTopic(msgId) {
        let currentMsg = this.conversation.msg.find(msgId)
        const getAboutUser = msg => {
          const aboutUid = [msg.from_uid];
          const about_msg_id = msg.about_msg_id
          if(!about_msg_id){
            return aboutUid
          }
          const aboutMsg = this.conversation.msg.find(about_msg_id)
          if(aboutMsg){
            aboutUid.push(...getAboutUser(aboutMsg))
          }
          // 去重
          return [...new Set(aboutUid)]
        }
        
        this.filterAsUid = getAboutUser(currentMsg)
      },
      showMenberList(){
        this.$emit('showMenberList',arguments[0])
      },
      async showMsgById(msgId) {
				// 话题中的消息，不支持定位到引用消息
        if(this.filterAsUid.length > 0){
          return uni.showToast({
            title: '话题中的消息，不支持定位到引用消息',
            icon: 'none'
          });
        }
				
        // 找到消息的索引
        let index = this.visibleMsgList.findIndex(i => i._id == msgId)
        // 如果找不到，先加载更多，再找
        if (index === -1) {
          const {_findIndex} = this.showMsgById
          if (!_findIndex) {
            uni.showLoading();
            this.showMsgById._findIndex = 0
          } else if (_findIndex > 29) {
            uni.hideLoading()
            this.showMsgById._findIndex = false
            console.error('防止特殊情况下死循环，不加载30屏以外的引用数据');
            return uni.showToast({
              title: '暂不支持，定向10屏以外的引用消息',
              icon: 'none'
            });
          }
          this.showMsgById._findIndex++
          console.log('this.showMsgById._findIndex', this.showMsgById._findIndex);
          await this.loadMore()
          return await this.showMsgById(msgId)
        }
				// todo:必须要用settmeout 0,此处$nextTick无效
				await uniIm.utils.sleep(0)
        uni.hideLoading()
        this.activeMsgId = msgId
        if(this.showMsgActiveColorActionT){
          clearTimeout(this.showMsgActiveColorActionT)
        }
        this.showMsgActiveColorActionT = setTimeout(() => {
          this.activeMsgId = ''
        }, 2000);
        this.showMsgByIndex(index)
      },
      isChecked(msg) {
        return this.checkedMsgList.some(i => i._id === msg._id)
      },
      checkMsg(msg) {
        if (!this.chooseMore) {
          return
        }
        let checkedMsgList = this.checkedMsgList
        if (this.isChecked(msg)) {
          checkedMsgList.splice(checkedMsgList.findIndex(i => i._id === msg._id), 1)
        } else {
          checkedMsgList.push(msg)
        }
        this.$emit('update:checkedMsgList', checkedMsgList)
      },
      showControl(e) {
        if (this.isWidescreen || this.onScroll.end !== false){
          this.$emit('showControl', e)
        }else{
          // console.log('滚动中，不响应长按弹出菜单')
        }
      },
      longpressMsgAvatar(e) {
        this.$emit('longpressMsgAvatar', e)
      },
      retriesSendMsg(msg) {
        if(msg.state === 0){
          return console.error('消息发送中')
        }
        this.$emit('retriesSendMsg', msg)
      },
      clickItem() {
        this.$emit('clickItem')
      },
      putChatInputContent(msgBody) {
        this.$emit('putChatInputContent', msgBody)
      },
      updateFilterUids(uids){
        this.filterAsUid = uids
      }
    }
  }

</script>

<style lang="scss">
.uni-im-msg-list-root{
	position: relative;
  &.in-topic {
    // 显示滚动条时，最外层增加描边
    border: 2px #bee1ff solid;
  }
  &,.uni-im-list {
    background-color: transparent;
    height: 100%;
  }
  .uni-im-list-item {
    transform: scale(1, -1);
    .uni-im-msg {
      width: 0;
      flex-grow: 1;
			margin-bottom: 10px;
    }
  }
  /* #ifdef H5 */
  @media screen and (min-device-width:960px) {
    .uni-im-list-item {
       // 关闭上下翻转
       transform: scale(1, 1);
     }
  }
  /* #endif */
  
  
  .item {
    // border: solid 1px #0055ff;
  }
  .uni-im-list-item .system .checkbox {
    display: none;
  }
  
  .data-state-tip-box {
    // height: 35px;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    color: #999999;
    margin-bottom: -5px;
    margin-top: 10px;
  }
  
  .data-state-tip-text {
    height: 36px;
    line-height: 36px;
    font-size: 12px;
    margin: 0 5px;
    color: #999999;
  }
  
  /* #ifdef H5 */
  .loadMore-btn {
    font-size: 14px;
    color: #666;
  }
  
  .loadMore-btn::after {
    display: none;
  }
  
  /* #endif */
  .msg-box {
    position: relative;
    transition-property: background-color;
    transition-duration: 2s;
    flex-direction: row;
  }
  
  .msg-box .checkbox {
    margin: 30px 0 0 10px;
    // transform: translateX(20px);
  }
  
  .msg-box .mask {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
  }
  
  .active-msg {
    background-color: #f9f9f9;
  }
  
  .showRemindMsg {
    background-color: #62caf8;
    border-radius: 50px;
    padding: 2px 15px;
    font-size: 12px;
    color: #FFF;
    position: fixed;
    right: 5px;
    top: 10px;
    /* #ifdef H5 */
    top: 55px;
    cursor: pointer;
  
    @media screen and (min-device-width:960px) {
      top: calc(7vh + 20px);
      right: 30px;
      font-size: 16px;
    }
  
    /* #endif */
  }
  
  .group-notification-popup {
    z-index: 9999;
  }
  
  .new-msg-bar {
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    right: 40px;
    bottom: 10px;
    font-size: 12px;
    background-color: white;
    color: #007fff;
    padding: 5px 8px 5px 5px;
    border-radius: 15px 15px 15px 15px;
    /* #ifdef H5 */
    pointer-events: auto;
    cursor: pointer;
    /* #endif */
  }
  /* #ifdef H5 */
  .pointer {
    cursor: pointer;
  }
  /* #endif */
}
</style>