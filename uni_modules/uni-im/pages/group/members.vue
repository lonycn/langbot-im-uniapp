<template>
  <view class="group-members-box">
    <uni-search-bar v-model="keyword" class="search-bar" radius="5" placeholder="输入昵称搜索" clearButton="auto"
      cancelButton="none"></uni-search-bar>
    <view v-if="!leave_group" class="members-list-container" >
      <view class="invite-box item" v-if="isAdmin">
        <view class="invite-icon">
          <uni-icons @click="invite" color="#989898" size="20px" type="plusempty"></uni-icons>
        </view>
        <text class="invite-text">邀请</text>
      </view>
      <template v-for="(member,index) in memberList" :key="index">
        <view class="item" :title="member.users.nickname"
          :class="{'pointer': canPrivateChat,'focus':member.focus}" @click="toChat(member.users._id)"
          @longpress.prevent="openConversationMenu($event,index)"
          @contextmenu.prevent="openConversationMenu($event,index)"
          @mousemove="hoverUserId = member.users._id"
          >
          <image class="avatar" :src="(member.users.avatar_file && member.users.avatar_file.url) ? member.users.avatar_file.url:'/uni_modules/uni-im/static/avatarUrl.png'"
            mode="widthFix"></image>
          <text class="nickname">{{member.users.nickname||'匿名用户'}}</text>
          <text v-if="member.role.includes('admin')" class="group-admin">管</text>
          <text v-if="!mute_all_members && member.mute_type" class="mute-type-1">已被禁言</text>
        </view>
      </template>
    </view>
    <view v-if="showLoadMoreBtn" class="set-index-box">
      <text v-if="laterRenderIndex > 0" class="item" @click="laterRenderIndex = 0" space="emsp">收起</text>  
      <view class="look-more-box">
        <text v-if="member.loading" class="item">加载中...</text>
        <text v-else-if="!isAllShow" class="item" @click="lookMore">查看更多</text>
      </view>
    </view>
    <template v-else>
      <text v-if="member.loading" class="tip">加载中...</text>
      <text v-else-if="!member.hasMore" class="tip">没有更多了</text>
    </template>
    <uni-im-contextmenu ref="uni-im-contextmenu"></uni-im-contextmenu>
    <!-- #ifdef H5 -->
    <uni-popup v-if="isWidescreen" ref="invitePagePopup" type="center">
      <invitePage class="invite-page" ref="invitePage" @done="$refs.invitePagePopup.close()"></invitePage>
    </uni-popup>
    <!-- #endif -->
  </view>
</template>

<script>
  const db = uniCloud.database()
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  // #ifdef H5
  import invitePage from '@/uni_modules/uni-im/pages/contacts/createGroup/createGroup.vue'
  // #endif
  export default {
    components: {
      // #ifdef H5
      invitePage
      // #endif
    },
    data() {
      return {
        conversation: {
          group: {
            user_id: "",
            mute_all_members: false,
            member: {
              dataList: []
            }
          },
          mute: false
        },
        leave_group: false,
        editorType: '',
        editorDefaultValue: '',
        groupType: '',
        isAdmin: false,
        keyword: '',
        mute_all_members: false,
        // 鼠标在哪个用户id上
        hoverUserId: '',
        // 延迟渲染，避免页面卡顿
        laterRenderIndex: 0,
        showLoadMoreBtn: true
      };
    },
    computed: {
      ...uniIm.mapState(['isWidescreen']),
      member(){
        return this.conversation.group.member
      },
      memberList() {
        let memberList = this.member.dataList
          // 根据关键词搜索
          .filter(member => {
            // 忽略大小写
            return member.users.nickname.toLowerCase().includes(this.keyword.toLowerCase())
          })
          // 是管理员排序靠前
          .sort((a, b) => {
            if (a.role.includes('admin') && !b.role.includes('admin')) {
              return -1
            } else if (!a.role.includes('admin') && b.role.includes('admin')) {
              return 1
            } else {
              return 0
            }
          })
          .filter((item, index) => {
            return index < this.canRenderCount
          })
        return memberList
      },
      // 允许被渲染的个数
      canRenderCount() {
        // 懒渲染的值*50，如果是管理员，减1（因为有一个“+邀请”用户加入群聊的占位）
        let n = this.laterRenderIndex * 50 - (this.isAdmin ? 1 : 0)
        // 如果是第一次渲染，则默认渲染10个，如果是管理员，则默认渲染9个（因为有一个“+邀请”用户加入群聊的占位）
        if(this.laterRenderIndex === 0){
          n = this.isAdmin ? 9 : 10
        }
        return n
      },
      // 剩余未渲染的个数
      notRenderCount() {
        return this.member.dataList.length - this.canRenderCount
      },
      // 是否全部显示（全部加载完毕，并全部被渲染）
      isAllShow() {
        return this.notRenderCount <= 0 && !this.member.hasMore
      },
      currentUid() {
        return uniIm.currentUser._id
      },
      isGroupCreator() {
        return this.conversation.group.user_id == this.currentUid
      },
      canPrivateChat(){
        // 当前登录的账号是管理员，或者是群管理员，或者要私信管理员
        return this.uniIDHasRole('staff') || 
              this.member.find(this.currentUid)?.role.includes('admin') ||
              this.hoverUserId && this.member.find(this.hoverUserId).role.includes('admin') 
      }
    },
    onReachBottom() {
      this.showMore()
    },
    watch: {
      // （后续）通过监听实现实时切换管理员实时刷新权限
      // console.log('isAdmin',isAdmin);
      conversation: {
        handler(conversation, oldValue) {
          // 当前用户是群的创建者或者管理员（在群成员中找到当前用户的角色包含admin）
          this.isAdmin = this.isGroupCreator || this.member.find(this.currentUid)?.role.includes('admin')
          this.leave_group = conversation.leave
          this.mute_all_members = conversation.group.mute_all_members
        },
        deep: true
      },
    },
    props: {
      conversation_id: {
        default () {
          return false
        }
      }
    },
    async onLoad(e) {
      if (!e.conversation_id) {
        throw new Error("会话id不能为空")
      }
      this.load(e.conversation_id)
      // 以页面模式加载时不需要显示加载更多按钮
      this.showLoadMoreBtn = false
      this.laterRenderIndex = 1
    },
    mounted() { //pc端以组件模式加载时逻辑
      if (this.conversation_id) {
        this.load(this.conversation_id)
      }
    },
    methods: {
      async load(conversation_id) {
        this.conversation = await uniIm.conversation.get(conversation_id)
      },
      toChat(user_id) {
        if (this.canPrivateChat) {
          uniIm.toChat({
            user_id,
            source:{
              group_id: this.conversation.group_id
            }
          })
        }
      },
      showMore(){
        if(this.notRenderCount < 5){
          this.member.loadMore().then(() => {
            this.laterRenderIndex++
          })
        }else{
          this.laterRenderIndex++
        }
      },
      lookMore() {
        if(this.isWidescreen){
          if(this.isAllShow){
            this.laterRenderIndex = 0
          }else{
            this.showMore()
          }
        }else{
          uni.navigateTo({
            url: '/uni_modules/uni-im/pages/group/members?conversation_id=' + this.conversation.id,
            animationType:"slide-in-right"
          })
        }
      },
      invite() {
        const group_id = this.conversation.group._id
        if (this.isWidescreen) {
          this.$refs.invitePagePopup.open()
          setTimeout(() => {
            this.$refs.invitePage.setParam({group_id})
          },0)
        } else {
          uni.navigateTo({
            url: '/uni_modules/uni-im/pages/contacts/createGroup/createGroup?group_id=' + group_id
          })
        }
      },
      async expel(item) {
        uni.showModal({
          title: '确定要将该用户移出本群吗？',
          content: '不能撤销，请谨慎操作',
          cancelText: '取消',
          confirmText: '确认',
          complete: async (e) => {
            // console.log(e);
            if (e.confirm) {
              uni.showLoading({
                mask: true
              });
              try {
                let res = await db.collection('uni-im-group-member').where({
                    user_id: item.users._id,
                    group_id: this.conversation.group._id
                  })
                  .remove()
                if (res.result.deleted) {
                  uni.showToast({
                    title: '成功移除',
                    icon: 'none',
                    complete: () => {}
                  });
                  // console.log('exitGroup', res);
                }
              } catch (error) {
                uni.showToast({
                  title: error.message,
                  icon: 'error',
                  complete: () => {}
                });
              }
              uni.hideLoading()
            }
          }
        });
      },
      async expelAndToBlack(item) {
      
        uni.showModal({
          title: '确定要将该用户移出本群并拉黑吗？',
          content: '拉黑后此用户将不能再次加入本群，不能撤销，请谨慎操作',
          cancelText: '取消',
          confirmText: '确认',
          complete: async (e) => {
            // console.log(e);
            if (e.confirm) {
              uni.showLoading({
                mask: true
              });
              try {
                let res = await db.collection('uni-im-group-member').where({
                    user_id: item.users._id,
                    group_id: this.conversation.group._id
                  })
                  .remove()
                console.log('expel', res);
                const uniImCo = uniCloud.importObject("uni-im-co")
                res = await uniImCo.addToGroupMenberBlackList({
                  user_id: item.users._id,
                  group_id: this.conversation.group._id
                })
                console.log('expelAndToBlack', res);
              } catch (error) {
                uni.showToast({
                  title: error.message,
                  icon: 'error',
                  complete: () => {}
                });
              }
              uni.hideLoading()
            }
          }
        });
      },
      async changeMemberMute(item) {
        let nickname = item.users.nickname || '匿名用户'
        uni.showModal({
          title: '确定要' + (item.mute_type ? `为"${nickname}"解除禁言吗？` : `禁言"${nickname}"吗？`),
          cancelText: '取消',
          confirmText: '确认',
          complete: async (e) => {
            // console.log(e);
            if (e.confirm) {
              uni.showLoading({
                mask: true
              });
              try {
                let res = await db.collection('uni-im-group-member').where({
                    _id: item._id,
                    mute_type: item.mute_type // 防止此时云端已经变化
                  })
                  .update({
                    mute_type: item.mute_type ? 0 : 1
                  })
                // console.log('mute_type', res);
                if (res.result.updated) {
                  item.mute_type = item.mute_type ? 0 : 1
      
                  uni.showToast({
                    title: '设置成功',
                    icon: 'none',
                    complete: () => {}
                  });
                }
              } catch (error) {
                // console.log('error',merror)
                uni.showToast({
                  title: error.message,
                  icon: 'error',
                  complete: () => {}
                });
              }
              uni.hideLoading()
            }
          }
        });
      },
      openConversationMenu(event, index) {
        if (!this.isAdmin) {
          return
        }
        const member = this.memberList[index]
        const menuList = []
        menuList.unshift({
          "title": "移除",
          "action": () => {
            // console.log('移除');
            this.expel(member)
          }
        })
            
        menuList.unshift({
          "title": "移除并拉黑",
          "action": () => {
            console.log('移除并拉黑');
            this.expelAndToBlack(member)
          }
        })
            
        if (!this.conversation.group.mute_all_members) {
          menuList.unshift({
            "title": member.mute_type ? "解除禁言" : '设为禁言',
            "action": () => {
              // console.log('禁言');
              this.changeMemberMute(member)
            }
          })
        }
            
        const isAdmin = member.role.includes('admin')
        menuList.push({
          "title": isAdmin ? "取消管理员" : "设置管理员",
          "action": () => {
            let role = member.role;
            if (isAdmin) {
              // console.log('取消管理员');
              role = member.role.filter(item => item !== 'admin')
            } else {
              role.push('admin')
              // console.log('设置管理员');
            }
            uni.showLoading({
              mask: true
            });
            db.collection('uni-im-group-member').doc(member._id).update({
                "role": role
              }).then(res => {
                // console.log('res', res);
                member.role = role
              })
              .catch(err => {
                console.error(err)
                uni.showToast({
                  title: err.message,
                  icon: 'none'
                });
              })
              .finally(() => {
                uni.hideLoading()
              })
          }
        })
      
        if (menuList.length > 0) {
          member.focus = true
          const myContextmenu = this.$refs['uni-im-contextmenu']
          let position = {
            "top": event.touches[0].screenY || event.touches[0].clientY,
            "left": event.touches[0].screenX || event.touches[0].clientX
          }
          if(event.type === 'contextmenu'){
            position = {
              "top": event.clientY,
              "left": event.clientX,
            }
          }
      
          // #ifdef H5
          position.top = position.top + 120
          // #endif
      
          myContextmenu.show(position, menuList)
          myContextmenu.onClose(() => {
            member.focus = false
          })
        }
      },
    }
  }
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
.group-members-box {
  width: 750rpx;
  background-color: #f5f5f5;
  .members-list-container {
    width: 750rpx;
    flex-direction: row;
    flex-wrap: wrap;
    .item {
      position: relative;
      width: 150rpx;
      height: 140rpx;
      margin: 5px 0;
      align-items: center;
      justify-content: space-around;
    }
    .invite-icon {
      border: 1px dashed #ccc;
      border-radius: 10px;
      width: 90rpx;
      height: 90rpx;
      justify-content: center;
      cursor: pointer;
    }
  }
  
  /* #ifdef H5 */
  .windows .item {
    width: 146rpx;
  }
  /* #endif */
  
  .item.focus {
    border: 1px dashed #ccc;
  }
  
  .group-admin {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 1px 3px;
    border-radius: 6px;
    background-color: #e64141;
    color: #fff;
    font-size: 12px;
  }
  
  .mute-type-1 {
    position: absolute;
    padding: 1px 10px;
    background-color: #0b60ff;
    color: #fff;
    font-size: 10px;
    bottom: 28px;
  }
  
  /* #ifdef H5 */
  .pointer {
    cursor: pointer;
  }
  /* #endif */
  
  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 10px;
    box-shadow: 0 0 1px #aaa;
  }
  
  .invite-text,.nickname {
    width: 140rpx;
    text-align: center;
    font-size: 12px;
    color: #666;
    padding: 0 16rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .tip {
    text-align: center;
    font-size: 14px;
    color: #666;
    height: 60px;
    line-height: 60px;
  }
  
  .set-index-box {
    flex-direction: row;
    justify-content: center;
    .look-more-box {
      flex-direction: row;
      justify-content: center;
    }
    .item {
      margin:0 10px;
      text-align: center;
      font-size: 14px;
      color: #666;
      height: 40px;
      line-height: 40px;
    }
    /* #ifdef H5 */
    .item {
      cursor: pointer;
    }
    .item:hover {
      color: #333;
    }
    /* #endif */
  }
  .invite-page {
    border-radius: 10px;
    background-color: #fff;
    overflow: hidden;
    .header-box {
      padding-top: 5px;
    }
  }
}

  
</style>