<template>
  <view class="uni-im-filtered-conversation-list" v-if="keyword || showCallMe" :class="{showCallMe}">
		<view class="header" v-if="showCallMe">
			<uni-icons class="icon" type="down" color="#888" @click="showCallMe = false;$emit('close')"></uni-icons>
			<view class="title">@我的</view>
		</view>
		<uni-im-load-state v-if="loading || noMatched" :status="loading?'loading':'noMore'" :contentText='loadStateContentText'></uni-im-load-state>
    <scroll-view v-else class="conversation-list" ref="filtered-conversation-list" scroll-y="true">
			<view v-for="(category,key) in matchedData" :key="key">
				<template v-if="category.data.length">
					<view class="category-name">{{category.name}}</view>
						<uni-im-info-card v-for="(item,index) in category.data"
							class="conversation-list-item"
							:class="{active: activeItem === item}"
							:key="item.id"
							:title="item.title"
							:note="getNote(key,item)"
							:tags="item.type==2 ? ['群聊'] : []"
							:avatarFile="item.avatar_file"
							clickable
							@click="clickItem(key,item)"
						/>
					<uni-im-load-state v-if="category.loading" class="loading" status="loading" :contentText='loadStateContentText'></uni-im-load-state>
					<view v-else-if="category.hasMore || category.localMore" class="loadmore" @click="loadMore(key)">显示更多</view>
				</template>
			</view>
    </scroll-view>
  </view>
</template>

<script>
  // 防抖
  function debounce(delay = 200) {
    let timer = null
    let busy = false
    let last_kw = ''
    let debouncedFn = function(kw, cb) {
      last_kw = kw
      if (busy) {
        // 如果上一次请求还没完成，则本次不执行，只记录参数，事后补发
        return
      }
      if (timer) {
        // 如果还在防抖期间，则重新计算防抖期
        clearTimeout(timer)
      }
      timer = setTimeout(async () => {
        // 防抖时间到，调用 cb 执行请求
        let kw = last_kw
        timer = null
        busy = true
        last_kw = ''
        await cb(kw)
        busy = false

        // 如果执行期间又有请求进来，则补发请求
        if (last_kw) {
          debouncedFn(last_kw, cb)
        }
      }, delay)
    }
    return debouncedFn
  }
  const debouncedSearch = debounce()
  const uniImCo = uniCloud.importObject("uni-im-co", {
    customUI: true
  })
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    emits:['to-chat', 'to-chat-filtered', 'close'],
    props: {
      keyword: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        loading: true,
				matchedData: {},
				loadStateContentText: {"contentrefresh": "加载中","contentnomore": "没有匹配的内容"},
				activeItem: ''
      }
    },
    computed: {
      noMatched() {
        return !Object.values(this.matchedData).some(category => category.data.length)
      },
			showCallMe: {
				get() {
					return uniIm.ext.showCallMeConversationList || false
				},
				set(v) {
					uniIm.ext.showCallMeConversationList = v
				}
			}
    },
    watch: {
			showCallMe(v){
				if(v){
					this.initMatchedData()
					this.loading = true
					uniImCo.getConversationsByRemindMsg().then(async res => {
						// console.error('###############res:', res)
						Object.assign(this.matchedData.callMe, res)
						// console.error('###############res:this.matchedData', this.matchedData)
					}).finally(() => {
						this.loading = false
					})
				}
			},
      keyword: {
        handler(keyword) {
					if(!this.showCallMe && !keyword){
						this.$emit('close')
					}
					if (this.showCallMe || !keyword) return
					this.initMatchedData()
          debouncedSearch(keyword, async (keyword) => {
            this.loading = true
            const resData = await uniImCo.getFilteredConversationList({ keyword })
						// console.error('resData:', resData)
						for (let category in this.matchedData) {
							const item = this.matchedData[category]
							Object.assign(item, resData[category])
							if (item.data.length > 5) {
								item.localMore = item.data.splice(5)
							}
						}
            this.loading = false
          })
        },
        immediate: true
      }
    },
    methods: {
			initMatchedData() {
				class baseData {
					constructor(name) {
						this.data = []
						this.hasMore = true
						this.skip = Number.MAX_SAFE_INTEGER
						this.loading = false
						this.name = name
					}
				}
				this.matchedData = {
					friends: new baseData('联系人'),
					groups: new baseData('群聊'),
					conversations: new baseData('聊天记录'),
					callMe: new baseData('')
				}
			},
			getNote(key,item) {
				const data = {
					'conversations': ()=> item.count + '条相关聊天记录',
					'callMe': ()=> uniIm.utils.getMsgNote(item.msg),
				}
				return data[key]?.()
			},
			clickItem(key,item) {
				this.activeItem = item
				// console.error('clickItem:', key, item)
				const obj = {
					friends(){
						this.$emit('to-chat', {friend_uid:item.friend_uid})
					},
					groups(){
						this.$emit('to-chat', {group_id:item.group_id})
					},
					conversations(){
						this.$emit('to-chat-filtered', { conversation_id: item.id, count: item.count, keyword: this.keyword })
					},
					callMe(){
						const {msg} = item
						this.$emit('to-chat-filtered', {msg})
					}
				}
				obj[key]?.call(this)
			},
      async loadMore(category) {
				const list = this.matchedData[category]
        if (list.localMore) {
          list.data.push(...list.localMore)
          delete list.localMore
          return
        }
        if (list.loading) return
        if (!list.hasMore) return
        list.loading = true
				const method = {
					friends: 'getSingleConversationsByFriendName',
					groups: 'getGroupConversationsByName',
					conversations: 'getConversationsByMessage',
					callMe: 'getConversationsByRemindMsg'
				}[category]
        let more = await uniImCo[method]({
          keyword: this.keyword,
          skip: list.skip,
        })
        list.data.push(...more.data)
        list.hasMore = more.hasMore
        list.skip = more.skip
        list.loading = false
      }
    }
  }
</script>

<style lang="scss">
.uni-im-filtered-conversation-list{
	&.showCallMe {
		position: absolute;
		top: 10px;
		left: 0;
		width: 100%;
		height:calc(100% - 10px) !important;
		background: #fff;
		border-radius: 10px;
		box-shadow: 0 -5px 5px 0 rgba(0,0,0,0.1);
		z-index: 100;
	}
	.header {
		padding:5px 10px;
		flex-direction: row;
		align-items: center;
		border-bottom: 1px solid #EFEFEF;
		/* #ifdef H5 */
		.icon {
			padding: 5px;
			&:hover {
			background-color: #f5f5f5;
			border-radius: 5px;
			cursor: pointer;
		}
		}
		/* #endif */
		
		.title {
			font-weight: 500;
			font-size: 14px;
		}
	}
	
  .hint {
    text-align: center;
    color: #CCC;
		font-size: 14px;
		margin-top: 20px;
  }
  
  .category-name {
    font-size: 14px;
    color: #999;
    margin: 0.3em 0.5em;
  }
  
  .loading,.loadmore {
		color: #576b95;
		font-size: 12px;
		padding: 6px 15px 10px;
		text-align: center;
  }
	.loading {
		color: #999;
	}
  .loadmore{
		/* #ifdef H5 */
		cursor: pointer;
		/* #endif */
		&:hover {
			color: #7c8cae;
		}
  }
  
  .conversation-list {
    flex: 1;
		overflow: hidden;
		.conversation-list-item {
			background-color: #fff;
			border-radius: 5px;
			/* #ifdef H5 */
			cursor: pointer;
			/* #endif */
			&.active,&:hover {
				background-color: #f1f1f1;
			}
		}
  }
}
</style>