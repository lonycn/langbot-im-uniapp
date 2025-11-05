<template>
	<view class="contacts-addPeopleGroups">
		<uni-nav-bar color="#999" :fixed="true" background-color="#ffffff" status-bar left-icon="left" @clickLeft="back">
			<view class="segmented-box">
				<uni-segmented-control :current="current" :values="items" @clickItem="setActiveIndex" styleType="button" activeColor="#5fc08e" style="width:120px;"></uni-segmented-control>
			</view>
		</uni-nav-bar>
		<view class="content">
			<uni-search-bar :placeholder="activeIndex?'搜索群名称/群号':'搜索手机号/用户名/用户昵称'" :radius="100"
				class="search-bar"
        bgColor="#eeeeee"
				v-model="keyword"
				@confirm="doSearch"
				@focus="searchFocus = true"
				@blur="searchFocus = false"
				@cancel="doClear"
				@clear="doClear"
			></uni-search-bar>
			
			<view v-if="activeIndex === 0">
				<!-- 搜索 -->
				<view v-if="usersList.length">
					<uni-im-info-card v-for="(item,index) in usersList" :key="index"
						:title="item.nickname" :avatarCircle="true"
						:avatar="item.avatar_file?.url || '/uni_modules/uni-im/static/avatarUrl.png'"  
					>
            <text v-if="item.isFriend" class="chat-custom-right grey">已添加</text>
						<text v-else-if="item._id === currentUser._id" class="chat-custom-right grey">不能加自己</text>
						<text v-else @click="addUser(index)" class="chat-custom-right">加为好友</text>
					</uni-im-info-card>
				</view>
				<uni-im-load-state v-else :status="loading?'loading':(hasMore?'hasMore':'noMore')"></uni-im-load-state>
			</view>
			<view v-if="activeIndex === 1">
				<view v-if="groupList.length">
					<uni-im-info-card v-for="(item,index) in groupList" :key="index"
						:title="item.name" 
						:avatar="item.avatar_file?.url || '/uni_modules/uni-im/static/avatarUrl.png'" 
					>
            <text v-if="item.isExist" class="chat-custom-right grey">已加入</text>
						<text v-else @click="addUser(index)" class="chat-custom-right">申请加入</text>
					</uni-im-info-card>
				</view>
				<uni-im-load-state v-else :status="loading?'loading':(hasMore?'hasMore':'noMore')"></uni-im-load-state>
			</view>
		</view>
		
		<uni-popup ref="popup" type="dialog">
			<uni-popup-dialog mode="input" :title="activeIndex?'申请加群':'申请添加好友'" 
				placeholder="请输入验证信息" confirmText="发送" message="成功消息" 
				:duration="2000" :before-close="true" :value="value"
				@close="close" @confirm="confirm" :maxlength="100"
			></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	const db = uniCloud.database();
	export default {
		data() {
			return {
        current:0,
				loading:true,
				hasMore: false,
				activeIndex:0,
				value:'',
				items: ['找人', '找群'],
				searchFocus:false,//是否展示搜索列表
				keyword:'',
				tabs:[
					{
						'title':'添加手机联系人',
						'url':''
					},
					{
						'title':'扫一扫加好友',
						'url':''
					},
					{
						'title':'查找陌生人',
						'url':''
					}
				],
				usersData: [],
				checkIndex:'',//申请加的群index
				groupData:[]
			}
		},
		computed: {
      ...uniIm.mapState(['currentUser']),
			usersList() {
				let friendList = uniIm.friend.dataList
				return this.usersData.map(item => {
					const isFriend = friendList.find(i=>i._id == item._id)
					return {
						...item,
						isFriend
					}
				})
			},
			groupList() {
				let groupList = uniIm.group.dataList
				console.log('已经加入的groupList',groupList);
				console.log('查到的groupList',this.groupData);
				// return this.groupData.filter(item=> groupList.find(i=>i._id == item._id))
        
        return this.groupData.map(item => {
          const isExist = groupList.find(i=>i._id == item._id)
          return {
            ...item,
            isExist
          }
        })
			}
		},
    onLoad(param) {
    	this.setParam(param)
		},
		methods: {
      setParam(param){
        // console.log("param: ",param);
        if(param.group_id){
          this.current = 1
          this.setActiveIndex({currentIndex: 1})
          this.keyword = param.group_id
          return this.doSearch()
        }
        this.getUserList()
        this.getGroupsList()
      },
			async getGroupsList(){
        const limit = 100
        const skip = this.groupData.length/limit
				const res =  await db.collection('uni-im-group')
                              .where(`"user_id" != "${this.currentUser._id}"`)
                              .field('_id,name,avatar_file')
                              .orderBy('create_date', 'desc')
                              .skip(skip)
                              .limit(limit)
                              .get()
				// console.error("uni-im-group: ",res);
				if(res.result.data.length){
					this.loading = false
					this.hasMore = true
					this.groupData = res.result.data
				}
			},
			async getUserList(){
				try{
					let res = await db.collection('uni-id-users')
                    .where(`"_id" != "${this.currentUser._id}"`)
										.field('_id,nickname,avatar_file')
										.get()
					let data = res.result.data
					// console.log("data: ",data);
					if(data.length){
						this.loading = false
						this.hasMore = true
						this.usersData = data
					}
				}catch(e){
					console.error(e);
				}
			},
			back() {
				uni.navigateBack()
			},
			async doSearch(e){
        if(!this.keyword){
          return this.activeIndex === 0 ? this.getUserList() : this.getGroupsList()
        }
				// console.log("doSearch: ",e,this.keyword);
        uni.showLoading({
          title: '搜索中'
        })
				if(this.activeIndex){
          const where = `
              /${this.keyword}/.test(name) || 
							"_id" == "${this.keyword}"
						`
					const res = await db.collection('uni-im-group')
						.where(where)
						.get()
					// console.log(res);
					this.groupData = res.result.data
				}else{
          const whereString = [
            "_id",
            "username",
            "nickname",
            "email",
            "mobile"
          ].map(item => `"${item}" == "${this.keyword}"`).join(' || ')
          // console.log('whereString',whereString);
					const res = await db.collection('uni-id-users')
										.where(whereString)
										.field('_id,nickname,avatar_file')
										.get()
        	// tip：用户表数据少，或者已做好优化，可以使用：/${this.keyword}/.test(nickname) 模糊匹配用户昵称
					console.log(res);
					this.usersData = res.result.data
				}
        uni.hideLoading()
			},
			doClear() {
        if(this.keyword){
          this.keyword = ''
          this.usersData = []
          this.groupData = []
          this.getUserList()
          this.getGroupsList()
        }
			},
			setActiveIndex(e) {
				// console.log("activeIndex: ",e);
				if (this.activeIndex != e.currentIndex) {
					this.activeIndex = e.currentIndex;
				}
			},
			addUser(index){
				this.checkIndex = index
				this.$refs.popup.open()
			},
			async confirm(value){
				// if(!value){
				// 	uni.showToast({
				// 		title: '验证信息不能为空！',
				// 		icon:'none'
				// 	});
				// 	return
				// }
				// console.log('提供的验证信息',value);
				this.value = value
				this.$refs.popup.close()
				if(this.activeIndex === 0){
					//添加好友
					const uniImCo = uniCloud.importObject("uni-im-co")
					await uniImCo.addFriendInvite({
						"to_uid": this.usersList[this.checkIndex]._id,
						"message": this.value
					}).then((res)=>{
						console.log("res: ",res);
						uni.showToast({
							title: '已申请',
							icon: 'none'
						});
					}).catch((err) => {
						uni.showModal({
							content: err.message || '请求服务失败',
							showCancel: false
						})
					})
					
				}else{
					// console.log('1233123132123132',this.groupData,this.checkIndex);
					//申请加群
					db.collection('uni-im-group-join').add({
						"group_id":this.groupList[this.checkIndex]._id,
						"message":this.value
					}).then((res) => {
						console.log("res: ",res);
						uni.showToast({
							icon: 'none',
							title: '已申请'
						})
					}).catch((err) => {
						uni.showModal({
							content: err.message || '请求服务失败',
							showCancel: false
						})
					})
				}
				setTimeout(()=> {
					this.value = ''
				}, 100);
				
			},
			close(){
				console.log('取消了');
				this.$refs.popup.close()
			}
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.contacts-addPeopleGroups {
  .segmented-box{
  	flex: 1;
  	justify-content: center;
  	align-items: center;
  }
  
  .tab-item{
  	border-bottom: #f5f5f5 solid 1px;
  	height:60px;
  	justify-content: center;
  	padding: 0 15rpx;
  }
  .background{
  	background-color: #f5f5f5;
  }
  .chat-custom-right {
  	height:30px;
  	line-height: 30px;
    padding: 0 10px;
  	color: #666;
  	font-size: 12px;
  	text-align: center;
  	background-color: #efefef;
  	/* #ifdef H5 */
  	cursor: pointer;
  	/* #endif */
  	border-radius: 100px;
  }
  .grey{
  	color: #aaa;
  }
  .border{
  	border: #ddd solid 1px;
  }
  .state-text{
  	text-align: center;
  	font-size: 28rpx;
  }
  
  /* #ifdef H5 */
  @media screen and (min-device-width:960px){
    .content {
      margin-top: 0;
      height: calc(100vh - 150px);
      overflow: auto;
    }
  	::v-deep .uni-navbar__header-btns-left,
  	::v-deep .uni-navbar__placeholder,
  	{
  		display: none;
  	}
  	::v-deep .uni-navbar--fixed{
  		position: relative;
  		left: 0	
  	}
  }
  /* #endif */
}
</style>
