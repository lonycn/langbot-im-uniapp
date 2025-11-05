<template>
  <view class="create-group-box" :class="{'join-grpop':group_id}">
    <view class="header-box">
      <uni-search-bar v-model="keyword" placeholder="搜索" bgColor="#fff" :radius="100" 
        @cancel="doClear();isFocus = true" @clear="doClear" :isFocus="isFocus" @focus="isFocus = true" @blur="isFocus = false" ></uni-search-bar>
    </view>
    <uni-list class="content-box" :border="false">
      <uni-im-info-card @click="checkboxChange(item._id)" v-for="(item,index) in friendList" :key="index" :avatar-circle="true" :title="item.nickname" :border="false" :clickable="true"
        :avatarUrl="item.avatar_file?.url || '/uni_modules/uni-im/static/avatarUrl.png'">
        <template v-slot:left>
          <view class="checkbox" :class="{
            'disabled': groupMemberUid.includes(item._id),
            'checked': checkFriendIds.includes(item._id)}
          ">
            <uni-icons type="checkmarkempty" color="#FFF" v-if="groupMemberUid.includes(item._id) || checkFriendIds.includes(item._id)"></uni-icons>
          </view>
        </template>
      </uni-im-info-card>
      <uni-im-load-state :status="loading?'loading':(hasMore?'hasMore':'noMore')"
        :contentText='{"contentnomore": friendList.length?"没有更多好友":"没有可以选择的好友"}'></uni-im-load-state>
      <uni-list-item style="height: 60px;" :border="false">
        <!-- 占位，用于此元素上方显示 操作按钮 -->
      </uni-list-item>
    </uni-list>
    <view class="foot-box">
      <!-- 创建新群可以不选择好友直接创建，邀请好友进群必须选择好友 -->
      <button :disabled="group_id? !checkFriendIds.length : false " class="btn" type="primary"
        @click="createGroup">{{btnText}}{{checkFriendNum}}</button>
    </view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  const db = uniCloud.database();
  export default {
    emits: ['done'],
    data() {
      return {
        loading: true,
        hasMore: false,
        keyword: '',
        checkFriendIds: [],
        friendData: [],
        groupMemberUid: [], //选人进群时，已经在群里的人的id
        group_id: false,
        isFocus: false
      }
    },
    computed: {
      friendList() {
        return this.friendData.filter(item => {
          //转小写筛选
          return (this.keyword == '' || item.nickname.toLowerCase().includes(this.keyword.toLowerCase()))
        })
      },
      checkFriendNum() {
        return this.checkFriendIds.length > 0 ? '（' + this.checkFriendIds.length + '）' : ''
      },
      btnText() {
        return this.group_id ? '立即邀请' : '立即创建'
      },
      checkFriendsWidth() {
        return this.checkFriendIds.length > 6 ? '100%' : this.checkFriendIds.length * 80 + 'px'
      },
      // checkFriendsSearchWidth() {
      // 	return this.checkFriendIds.length > 6 ? '360' : 720 - (this.checkFriendIds.length * 60)
      // },
      translateXWidth() {
        return this.checkFriendIds.length > 6 ? this.checkFriendIds.length * 65 : '60'
      },
      checkFriendImg() {
        return this.friendList.reduce((sum, current) => {
          if (this.checkFriendIds.includes(current._id)) {
            sum.push(current)
          }
          return sum
        }, []).map(item => item.avatar_file)
      }
    },
    async onLoad(options) {
      this.setParam(options)
    },
    methods: {
      async setParam(options = {}) {
        console.log("group_id", options);
        if (options.group_id) {
          this.group_id = options.group_id
          if(!uniIm.isWidescreen){
            uni.setNavigationBarTitle({
              title: '邀请新成员'
            })
          }
          //查本群，成员，
          let res = await db.collection('uni-im-group-member').where({
              group_id: options.group_id
            })
            .get()
          console.log("res:查本群，成员 ", res);
          this.groupMemberUid = res.result.data.map(item => item.user_id)
          // console.log('this.groupMemberUid', this.groupMemberUid);
        }
        this.getFriendsData()
      },
      async getFriendsData() {
        let whereString = {}
        if (this.keyword) {
          whereString = `
          	"_id"		== 	"${this.keyword}" ||
          	"username"	== 	"${this.keyword}" || 
          	"nickname"	== 	"${this.keyword}" || 
          	"email"		== 	"${this.keyword}" || 
          	"mobile"	== 	"${this.keyword}" 
          `
        }
        let res = await db.collection(
          db.collection('uni-im-friend').where('"user_id" == $cloudEnv_uid').field('friend_uid,mark,class_name')
          .getTemp(),
          db.collection('uni-id-users').where(whereString).field('_id,nickname,avatar_file').getTemp()
        ).get()
        // console.log(res);
        let data = res.result.data
        data.forEach((item, index) => {
          if (item.friend_uid[0]) {
            data[index] = item.friend_uid[0]
          } else {
            delete data[index]
          }
        })
        this.friendData = data
        this.loading = false
        this.hasMore = this.friendList.length != 0
      },
      doClear() {
        this.keyword = ''
        this.getFriendsData()
      },
      checkboxChange(user_id) {
        if (this.groupMemberUid.includes(user_id)){
          return console.log('已经在群里了');
        }
        console.log("checkboxChange-value",user_id);
        this.checkFriendIds = this.checkFriendIds.includes(user_id) ? this.checkFriendIds.filter(item => item != user_id) : this.checkFriendIds.concat(user_id)
        console.log("checkboxChange",this.checkFriendIds);
      },
      async createGroup() {
        // console.log('创建', this.checkFriendIds.length)
        const uniImCo = uniCloud.importObject("uni-im-co")
        let res = await uniImCo.chooseUserIntoGroup({
          user_ids: this.checkFriendIds,
          group_id: this.group_id
        })
        this.checkFriendIds = []
        // console.log('createGroup',res);
        if (this.group_id) {
          if (uniIm.isWidescreen) {
            this.$emit('done')
          } else {
            uni.navigateBack({
              delta: 1
            })
          }
        } else {
          // #ifdef H5
          if (uniIm.isWidescreen) {
            uni.$emit('uni-im-toChat', 'group_' + res.data.group_id)
          } else {
            uni.redirectTo({
              url: '/uni_modules/uni-im/pages/chat/chat?conversation_id=' + 'group_' + res.data.group_id,
              animationDuration: 300,
              fail: (e) => {
                console.log(e);
              }
            })
          }
          // #endif

          // #ifndef H5
          uni.redirectTo({
            url: '/uni_modules/uni-im/pages/chat/chat?conversation_id=' + 'group_' + res.data.group_id,
            animationDuration: 300,
            complete: (e) => {
              console.log(e);
            }
          })
          // #endif
        }
      }
    }
  }
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.create-group-box {
  position: relative;
  background-color: #F9F9F9;
  flex: 1;
  .header-box {
    flex-direction: column;
    background-color: #F9F9F9;
  }
  
  .content-box {
   width: 100%;
   overflow: auto;
  }
  
  .label-box {
    flex-direction: row;
    align-items: center;
    background-color: #FFF;
    padding: 5px 0;
  }
  
  .checkbox {
    margin: 12px 10px 0 0;
    border: 1px solid #DDD;
    width: 20px;
    height: 20px;
    justify-content: center;
    align-items: center;
    border-radius: 100px;
    &.disabled {
      background-color: #1189e9;
      opacity: 0.5;
      border: none;
      cursor: not-allowed;
    }
    &.checked {
      background-color: #1189e9;
      border: none;
    }
  }
  
  .foot-box {
    position: fixed;
    bottom: 15px;
    // 注意：此页面可能显示在pc端所以不能用750rpx，而用100%
    width: 100%;
    height: 60px;
    justify-content: center;
    align-items: center;
  }
  
  .foot-box .btn {
    width: 300px;
  }
  
  /* #ifdef H5 */
  @media screen and (min-device-width:960px){
    width: 100%;
    margin: 10px auto;
    &.join-grpop {
      width: 800px;
    }
    .content-box {
      height: calc(100vh - 175px);
    }
    .content-box ::v-deep .info-card {
      cursor: pointer;
    }
    .foot-box {
      position: absolute;
    }
  }
  /* #endif */
}
</style>