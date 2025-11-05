<template>
<view class="chat-filtered-root" v-if="keyword || fragment">
    <view class="head">
      <view class="hint">
        <template v-if="count == 0 && loading">加载中</template>
        <template v-else>{{ count }} 条与“{{ keyword }}”相关的聊天记录</template>
      </view>
			<!-- #ifdef H5 -->
			<!-- web-pc端会话标题 设置导航栏标题，如与谁对话，群人数为几人等 -->
			<text v-if="isWidescreen" class="web-pc-chat-title" :selectable="true">{{navTitle}}</text>
			<!-- #endif -->
      <view
        v-if="conversation_id"
        class="enter-chat"
        @click="onEnterConversation(conversation_id)"
      >
        <uni-icons type="chatbubble" size="16"></uni-icons>
        进入会话
      </view>
    </view>

    <chat-fragment
      v-if="fragment"
      :entry="fragment"
      @close="onCloseFragment"
    />
		
		<scroll-view
			class="message-list"
		  scroll-y
		  :scroll-into-view="autoScrollToEl"
		  @scrolltoupper="onScrollToUpper"
		>	
			<uni-im-msg
				v-for="msg in msgList"
				:key="msg._id"
				:id="`msg-${msg._id}`"
				:msg="msg"
				no-time
				no-jump
				@loadMore="cb => cb()"
			>
				<view class="float-info">
					<view>{{ toFriendlyTime(msg) }}</view>
					<view class="enter-fragment" @click="onOpenFragment(msg)">查看上下文</view>
				</view>
			</uni-im-msg>
			<view id="bottom-el" style="height: 1px;"></view>
		</scroll-view>
</view>
</template>

<script>
/**
 * chat-filtered 组件，渲染一个会话中经过滤选择的消息列表，用于显示某个会话的消息搜索结果。
 * 
 * 点击某条消息的“查看上下文”按钮可以打开 {@link module:chat-fragment} 组件。
 * 
 * @module
 */
  const uniImCo = uniCloud.importObject("uni-im-co", {
    customUI: true
  })
  import uniIm from '@/uni_modules/uni-im/sdk/index.js'
  import ChatFragment from './components/chat-fragment'

  export default {
    components: {
      ChatFragment,
    },
    emits: ['to-chat', 'fragment-closed'],
    data() {
      return {
        loading: true,
        count: 0,
        keyword: '',
        msgList: [],
        hasMore: true,
        skip: Number.MAX_SAFE_INTEGER,
        conversation_id: '',
        autoScrollToEl: '',
        // 当前会话对象
        conversation: {},
        // 聊天记录片段的入口消息
        fragment: null,
      };
    },
    computed: {
      ...uniIm.mapState(['isWidescreen']),
      navTitle() {
        let title = this.conversation.title
        if (this.conversation.group_id) {
          title += `(${this.conversation.group.member.count()})`;
        }
        return title
      }
    },
    async onLoad(param) {
      // 调用load方法，因为pc宽屏时本页面是以组件形式展示，如 $refs.chatFiltered.load(conversation_id)
      await this.load(param);
    },
    methods: {
      async load({ keyword, count, conversation_id, msg }) {
				conversation_id = conversation_id || msg.conversation_id
        // 根据入口参数进行初始化
        this.loading = true
        this.count = count
        this.keyword = keyword
        this.msgList = []
        this.hasMore = true
        this.skip = Number.MAX_SAFE_INTEGER
        this.conversation_id = conversation_id
        this.conversation = await uniIm.conversation.get(conversation_id)
        this.autoScrollToEl = ''
        this.fragment = null
				
				if(msg){
					// 刷新fragment的值
					return this.$nextTick(()=>this.fragment = msg)
				}

        // 加载第一批匹配的聊天记录
        this.loadData(() => {
          // 自动滚动到底
          this.autoScrollToEl = 'bottom-el'
        })
      },
      async loadData(afterLoaded) {
        this.loading = true
        let result = await uniImCo.getFilteredMessageOfConversation({
          keyword: this.keyword,
          skip: this.skip,
          conversation_id: this.conversation_id,
        })
        this.msgList.unshift(...result.data.reverse())
        if (this.count < this.msgList.length) {
          // 计数以传入的 count 为准，除非实际查询到的更多
          this.count = this.msgList.length
        }
        this.hasMore = result.hasMore
        this.skip = result.skip
        this.loading = false
        this.$nextTick(afterLoaded)
      },
      onScrollToUpper(evt) {
        if (this.loading) return
        if (!this.hasMore) return
        let elId = 'bottom-el'
        if (this.msgList.length > 0) {
          elId = 'msg-' + this.msgList[0]._id
        }
        this.autoScrollToEl = ''
        this.loadData(() => {
          this.autoScrollToEl = elId
        })
      },
      onEnterConversation(conversation_id) {
				this.onCloseFragment()
        this.$emit('to-chat', { conversation_id })
				uniIm.ext.showCallMeConversationList = false
      },
      onOpenFragment(msg) {
        this.fragment = msg
      },
      onCloseFragment() {
        this.fragment = null
				this.keyword = ''
				this.$emit('fragment-closed')
      },
      toFriendlyTime(msg) {
        return uniIm.utils.toFriendlyTime(msg.create_time || msg.client_create_time)
      }
    }
  }
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.chat-filtered-root {
	position: relative;
  background-color: #efefef;
	height: 1px;
	flex: 1 !important;
	
	/* #ifdef H5 */
	@media screen and (min-device-width:960px){
		position: absolute !important;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		height: 100% !important;
		z-index: 9;
	}
	/* #endif */
	
  .head {
    flex-direction: row;
    justify-content: space-between;
    height: 50px;
		padding: 0 15px;
		align-items: center;
    font-size: 12px;
    border-bottom: 1px solid #ddd;
		.web-pc-chat-title {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			font-size: 16px;
			z-index: 2;
		}
    .hint {
      color: #999;
    }
    .enter-chat {
			z-index: 2;
      flex-direction: row;
      padding: 0 5px;
      /* #ifdef H5 */
      cursor: pointer;
      &:hover {
				border-radius: 10px;
        background-color: #ddd;
      }
      /* #endif */
    }
  }
	.message-list {
		padding: 10px;
		overflow: hidden;
		.uni-im-msg ::v-deep {
			.msg-content {
			  max-width: calc(95% - 40px);
			}
			// 隐藏消息中的自定义组件
			.uni-im-msg-reader {
				display: none;
			}
			.float-info {
			  align-items: flex-end;
			  position: absolute;
			  top: 0;
			  right: 0px;
			  font-size: 12px;
			  color: #999;
			  padding: 10px;
				.enter-fragment {
					color: #576b95;
				  /* #ifdef H5 */
				  cursor: pointer;
					&:hover {
						color: #7c8cae;
					}
				  /* #endif */
				}
			}
		}
  }
  
  .chat-fragment {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
		z-index: 1;
  }
}
</style>
