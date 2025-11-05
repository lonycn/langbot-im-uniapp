<template>
<view class="uni-im-conversation-list">
  <view class="conversation-type">
    <view class="item" v-for="(item,index) in conversation.typeList" :key="index" @click="changeType(item.value)" :class="{'active':activeTypeId === item.value}">
      {{item.title}}
    </view>
  </view>
  <scroll-view
    ref="conversation-list"
    class="conversation-list"
    :class="{canCheck}"
    :scroll-top="listScrollTop"
    scroll-y="true"
    @scrolltolower="conversation.loading ? '' : loadMore()"
    @scroll="onScroll"
  >
    <view v-for="(item,index) in conversationList" :key="item.id"
      class="conversation-list-item" :class="{'activeConversation':activeConversationId == item.id,'focus':focusConversationId === item.id}"
    >
      <uni-im-conversation
        :conversation="item" :id="item.id"
        @click="clickItem(item)" @contextmenu.prevent="openConversationMenu($event,index)"
        @longpress="onScroll.isScrolling?'':openConversationMenu($event,index)"
      >
        <template v-if="canCheck" #left>
          <view style="justify-content: center;">
            <view class="check-box" :class="{checked:isCheck(item)}">
              <uni-icons
                v-if="isCheck(item)"
                color="#FFF"
                type="checkmarkempty"
              />
            </view>
          </view>
        </template>
      </uni-im-conversation>
    </view>
    <view style="margin-top: 5px;backgroundColor:'#f5f5f5'">
      <template v-if="!keyword">
        <uni-im-load-state
          :content-text="loadMoreContentText"
          :status="conversation.hasMore?'loading':'noMore'"
        />
      </template>
      <text v-else-if="conversationList.length === 0"
        style="text-align: center;flex: 1;margin: 8px;color: #aaa;"
      >没有相关数据</text>
    </view>

  </scroll-view>

  <uni-im-contextmenu ref="uni-im-contextmenu" />
	<view v-if="isWidescreen && activeTypeId === 'has_remind_msg'" class="foot-box" @click="showCallMeConversationList">
		<uni-icons class="left-icon" type="calendar" color="#888" size="20"></uni-icons>
		<text>查看历史@消息</text>
		<uni-icons class="right-icon" type="right"></uni-icons>
	</view>
</view>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';
const db = uniCloud.database();
let currentScrollTop = 0;
export default {
  emits: ['change', 'clickItem', 'onScroll', 'update:checkedList'],
  props: {
    keyword: {
      type: String,
      default: ''
    },
    activeConversationId: {
      type: [String, Boolean],
      default: ''
    },
    canCheck: {
      type: Boolean,
      default: false
    },
    checkedList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      listScrollTop: 0,
      focusConversationId: '',
      activeTypeId: 'all'
    }
  },
  computed: {
		...uniIm.mapState(['isWidescreen','conversation']),
    loadMoreContentText() {
      return {
        contentrefresh: "正在加载...",
        contentnomore: (this.conversationList.length ? "没有更多数据了" : "没有会话数据")
      }
    },
    conversationList() {
			const action = uniIm.conversation.typeList.reduce((acc, item)=>{
				acc[item.value] = item.filter
				return acc
			},{})
			const needKeepType = uniIm.conversation.typeList.filter(i=>i.needKeep).map(i=>i.value)
			// console.log('action',action)
      const conversationList = uniIm.conversation.dataList
        // #ifdef H5
        .filter(i => i.title?.toLowerCase().includes(this.keyword.toLowerCase()))
        // #endif
        .filter(i => !i.hidden)
        .filter(conversation=>{
          if(typeof this.activeTypeId === 'object' && Object.keys(this.activeTypeId)[0] === 'group_type'){
            return conversation.group?.type === this.activeTypeId.group_type
          }else{
            return action[this.activeTypeId]?.(conversation) || this.needKeepCid?.includes(conversation.id)
          }
        })
        if (needKeepType.includes(this.activeTypeId)) {
          this.needKeepCid = conversationList?.map(i=>i.id)
        }
        return conversationList
    }
  },
  watch: {
		// 如果切换了会话类型，需要清空needKeepCid
		activeTypeId(){
			this.needKeepCid = []
		},
    conversationList: {
      handler() {
        // console.log('更新会话列表',this.conversationList)
        this.$emit('change', this.conversationList)
      },
      deep: true
    },
    activeConversationId(activeConversationId) {
      // #ifdef H5
      // 重试次数
      let tryIndex = 0
      const scrollToCurrentConversation = () => {
        if (!activeConversationId || tryIndex > 5) {
          return
        }
        const query = uni.createSelectorQuery().in(this);
        query.select('#' + activeConversationId).boundingClientRect(data => {
          if (!data) {
            // console.log('找不到 showMsgByIndex #'+activeConversationId,'tryIndex:'+tryIndex);
            tryIndex++
            setTimeout(() => scrollToCurrentConversation(), 300)
            return
          } else {
            // console.log(data);
          }
          let listHeight = document.querySelector('.conversation-list')?.clientHeight
          if (data.top - 70 < listHeight) {
            return
          }
          this.listScrollTop = ''
          this.$nextTick(() => {
            this.listScrollTop = currentScrollTop - listHeight + data.top + data.height
            // console.log('this.listScrollTop',this.listScrollTop);
          })
        }).exec()
      }
      setTimeout(() => {
        scrollToCurrentConversation()
      },300)
      // #endif
    }
  },
  async mounted() {
    // 监听鼠标移入conversation-type 后滚动事件，并设置滚动条位置
    // #ifdef H5
    const tagBox = this.$el.querySelector('.conversation-type')
    function scrollFunc(e) {
      tagBox.scrollLeft += e.deltaY/5
    }
    tagBox.addEventListener('mouseover', (e) => {
      tagBox.addEventListener('wheel', scrollFunc)
    })
    tagBox.addEventListener('mouseout', (e) => {
      tagBox.removeEventListener('wheel', scrollFunc)
    })
    // #endif
  },
  methods: {
		showCallMeConversationList(){
			uniIm.ext.showCallMeConversationList = true
		},
    changeType(tagId){
      this.activeTypeId = tagId
      uniIm.conversation.hasMore = true
      uniIm.conversation.loadMore.type = tagId
      this.listScrollTop = ''
      this.$nextTick(()=>{
        this.listScrollTop = 0
      })
      this.loadMore()
    },
    onScroll(e) {
      currentScrollTop = e.detail.scrollTop
      this.$emit('onScroll', e)
      // 设置 this.onScroll.isScrolling 为 true
      this.onScroll.isScrolling = true
      clearTimeout(this.onScroll.timer)
      this.onScroll.timer = setTimeout(() => {
        // 设置 this.onScroll.isScrolling 为 false
        this.onScroll.isScrolling = false
      }, 500)
    },
    isCheck(item) {
      return this.checkedList.some(i => i.id === item.id)
    },
    clickItem(item) {
      if (this.canCheck) {
        // 判断是否选中
        let checkedList = this.checkedList;
        if (this.isCheck(item)) {
          checkedList.splice(checkedList.findIndex(i => i.id === item.id), 1)
        } else {
          checkedList.push(item)
        }
        this.$emit('update:checkedList', checkedList)
      }
      this.$emit('clickItem', item)
    },
    openConversationMenu(e, index) {
      let conversation = this.conversationList[index]
      this.focusConversationId = conversation.id
      const myContextmenu = this.$refs['uni-im-contextmenu']
      
      const clientY = e.clientY || e.changedTouches[0].clientY
      const clientX = e.clientX || e.changedTouches[0].clientX
      
      const position = {
        "top": clientY + 35,
        "left": clientX
      }
      let menuList = [{
                        "title": conversation.pinned ? "取消置顶" : "置顶",
                        "action": () => {
                          conversation.pinned = !conversation.pinned
                          db.collection('uni-im-conversation')
                            .doc(conversation._id)
                            .update({
                              "pinned": conversation.pinned
                            })
                            .then((e) => {
                              console.log('updated 置顶', e.result.updated, conversation._id)
                            })
                            .catch(() => {
                              uni.showToast({
                                title: '服务端错误，置顶失败，请稍后重试',
                                icon: 'none'
                              });
                              conversation.pinned = !conversation.pinned
                            })
                        }
                      },
                      {
                        "title": "标为" + (conversation.unread_count ? "已读" : "未读"),
                        "action": () => {
                          conversation.setUnreadCount(conversation.unread_count ? 0 : 1)
                        }
                      },
                      {
                        "title": (conversation.is_star ? "取消" : "设为") + "星标",
                        "action": () => {
                          conversation.changeIsStar()
                        }
                      },
                      {
                        "title": conversation.mute ? "允许消息通知" : "消息免打扰",
                        "action": () => {
                          console.log('mute 允许消息通知 / 消息免打扰')
                          conversation.changeMute()
                        }
                      },
                      // {
                      //   "title":"复制会话id",
                      //   "action":()=>{
                      //      uni.setClipboardData({
                      //        data:conversation.id,
                      //        showToast:false
                      //      })
                      //   }
                      // },
                      {
                        "title": "移除会话",
                        "action": () => conversation.hide()
                      }
      ]
      myContextmenu.show(position, menuList)
      myContextmenu.onClose(() => {
        this.focusConversationId = ''
      })
    },
    closeConversationMenu(){
      const myContextmenu = this.$refs['uni-im-contextmenu']
      myContextmenu.closeMe()
    },
    async loadMore() {
      let data = await uniIm.conversation.loadMore()
      // console.log('加载到新的会话数据',data);
      return data
    }
  }
}
</script>

<style lang="scss">
  .uni-im-conversation-list{
    height: 0;
    flex: 1;
    overflow: hidden;
    /* #ifdef MP-WEIXIN */
    height: 100%;
    /* #endif */
    .conversation-type {
      margin: 0 10px;
      flex-direction: row;
      overflow: scroll;
      // 滚动条样式，高度设置
      &::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
      .item {
				font-size: 16px;
        color: #333;
        text-align: center;
        padding: 5px 0;
        margin:0 15px;
        cursor: pointer;
        &.active {
          color: #1ab94e;
          border-bottom: 2px solid #1ab94e;
        }
      }
    }
    .conversation-list{
      height:0;
      flex: 1;
    }
    .tip {
      flex: 1;
    }
    
    .canCheck  {
      .note-box,
      .time,
      .state {
        display: none;
      }
      .title {
        font-size: 16px !important;
      }
    }
    
    .conversation-list {
      .conversation-list-item {
        border-radius: 5px;
        overflow: hidden;
        &.focus 
        {
          border: 2px solid #1ab94e;
        }
        &.activeConversation {
          background-color: #f1f1f1;
        }
      }
    }
    
    .check-box {
      border: 1px solid #ccc;
      width: 20px;
      height: 20px;
      border-radius: 2px;
      margin-right: 10px;
    }
    
    .check-box.checked {
      background-color: #00a953;
      border-color: #00a953;
    }
		
		.foot-box {
			padding: 0 15px;
			flex-direction: row;
			height: 40px;
			justify-content: center;
			align-items: center;
			background-color: rgba(0, 0, 0, 0.03);
			border-radius: 10px;
			margin: 10px;
			color: #555;
			/* #ifdef H5 */
			&:hover {
				background-color: #EEE;
				cursor: pointer;
			}
			/* #endif */
			.right-icon {
				margin-left: auto;
			}
			.left-icon {
				margin-left: auto;
				margin-right: 5px;
			}
		}
  }
</style>