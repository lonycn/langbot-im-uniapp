<template>
	<view class="contacts-groupList">
		<uni-search-bar placeholder="搜索群号/群名称" :radius="100" bgColor="#eeeeee" v-model="keyword" 
			@cancel="doClear"
			@clear="doClear"
		></uni-search-bar>
		<view class="uni-list">
			<uni-im-info-card v-for="(item,index) in groupList" :key="index" 
				@click="toChat(item._id)" link
				:title="item?.name"
				:avatar="item?.avatar_file?.url || '/uni_modules/uni-im/static/avatarUrl.png'">
			</uni-im-info-card>
      <uni-im-load-state class="uni-im-load-state" :status="groupHasMore?'loading':'noMore'"></uni-im-load-state>
		</view>
	</view>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	export default {
		data() {
			return {
				keyword: '',
				groupData:false
			}
		},
		computed: {
			//是否为pc宽屏（width>960px）
			isWidescreen(){
				return uniIm.isWidescreen
			},
			groupList() {
				const groupList = uniIm.group.dataList
				if(this.keyword){
					return groupList.filter(item=>{
					  return item.name.includes(this.keyword) || item._id.includes(this.keyword)
					})
				}else{
					return groupList
				}
			},
			groupHasMore(){
				return uniIm.group.hasMore
			}
		},
    mounted() {
      uni.createIntersectionObserver(this, { observeAll: true })
        .relativeTo('body', {})
        .observe('.uni-im-load-state', (res) => {
          if (res.intersectionRatio > 0) {
            uniIm.group.loadMore()
          }
        })
    },
    async onLoad(options) {
    	this.setParam(options)
    },
		methods: {
      setParam(param = {}){
        if(param.group_id){
          this.keyword = param.group_id
        }
      },
			doClear(){
				this.keyword = ''
			},
			toChat(group_id) {
				let conversation_id = 'group_' + group_id
        uniIm.toChat({conversation_id})
			}
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.contacts-groupList {
  /* #ifdef H5 */
  	@media screen and (min-device-width:960px){
      .uni-list {
        height: calc(100vh - 165px);
        overflow: auto;
      }
  	}
  /* #endif */
}
</style>
