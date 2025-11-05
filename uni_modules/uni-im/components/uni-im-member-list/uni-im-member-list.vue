<template>
  <view v-if="isShow && ((isWidescreen && !forceShowSearch) ? memberList.length != 0 : 1)" class="member-list-box">
    <view class="member-list-mark" @click.stop="hide()"></view>
    <view class="content">
      <view class="head">
        <view class="close">
          <uni-icons @click="hide()" type="back" color="#000" size="12px"></uni-icons>
        </view>
        <text class="title">{{title}}</text>
      </view>
      <uni-search-bar v-if="!isWidescreen || forceShowSearch" v-model="keyword" :focus="true" placeholder="搜索" cancelButton="none" class="search" />
      <scroll-view class="member-list" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="true">
        <view v-for="(item,index) in memberList" :key="item._id" class="member-list-item"
          :class="{'member-list-item-active':activeUid == item.users._id}" @mouseover="activeUid = item.users._id"
          @click="confirm(item.users._id)" :id="'a'+item.users._id">
          <text class="nickname">{{item.users.nickname}}</text>
          <text class="real_name">{{item.users.real_name}}</text>
        </view>
        <view class="null-about-menber-tip" v-if="memberList.length === 0">没有与"{{keyword}}"相关成员</view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  let confirmFunc = () => {}
  export default {
    props: {
      conversationId: {
        default: ''
      },
      memberListData: {
        type: [Array,null],
        default: null
      }
    },
    computed: {
      ...uniIm.mapState(['isWidescreen']),
      memberList() {
        let memberList = []
        if(this.memberListData){
          memberList = this.memberListData
        }else{
          memberList = uniIm.conversation.find(this.conversationId)?.group?.member.dataList || []
        }
        if (this.mapFn) {
          memberList = memberList.map(this.mapFn)
        }
        if (this.filterFn) {
          memberList = memberList.filter(this.filterFn)
        }
        if (this.keyword) {
          memberList = memberList.filter(item => item.users.nickname.toLowerCase().includes(this.keyword.toLowerCase()))
        }
        // 按昵称排序
        memberList.sort((a, b) => {
          return a.users.nickname.localeCompare(b.users.nickname)
        })
        this.activeUid = memberList[0]?.users._id
        return memberList
      },
    },
    data() {
      return {
        isShow: false,
        scrollTop: 0,
        activeUid: '',
        filterFn: null,
        mapFn: null,
        title: '',
        keyword: '',
        forceShowSearch: false
      }
    },
    methods: {
      confirm(uid) {
        confirmFunc(uid)
        this.hide()
      },
      onChatInput(e){
        const enterText = e.data
        if (!this.isShow) return
        // console.log('enterText',enterText)
        if(enterText == null){
          // 敲了删除键
          this.keyword = this.keyword.slice(0,-1)
        }
        else if(enterText == '@'){
          this.keyword = ""
        }else{
          setTimeout(()=>{
            // 输入法正在输入中
            let isComposing = false
            // #ifdef H5
            isComposing = this.isWidescreen ? document.querySelector('.uni-im-editor').isComposing : e.isComposing
            // #endif
            if (isComposing) {
              console.log('输入法正在输入中')
            }else{
              // console.log('enterText')
              this.keyword += enterText
            }
          },0)
        }
      },
      onChatInputKeydown(e) {
        if (!this.isShow) return
        if(e.key == 'Enter'){
          if(this.memberList.length){
            // console.log('选中要@的人')
            this.confirm(this.activeUid)
          }
        }else if(["ArrowUp", "ArrowDown"].includes(e.key)){
          // console.log('上下箭头选择@谁')
          let index = this.memberList.findIndex(i => i.users._id == this.activeUid)
          // console.log('index',index);
          if (e.key == "ArrowUp") {
            index--
          } else {
            index++
          }
          if (index < 0 || index > this.memberList.length - 1) {
            index = 0
          }
          this.activeUid = this.memberList[index].users._id
          // 防止选中的成员看不到，触发滚动
          this.scrollTop = (index - 3) * 45
          // console.log('this.scrollTop',this.scrollTop);
          e.preventDefault();
        }else if(["ArrowLeft", "ArrowRight"].includes(e.key)){
          this.hide()
        }else if(e.key == 'Backspace'){
          setTimeout(() => {
            // 获取e.target 元素内不包含在标签内的文字内容
            let newValue = e.target.innerText
            // console.log('删除键',newValue,this.oldChatInputValue);
            // 拿到newValue 和 this.oldChatInputValue 中 包含的@字符的个数
            let newAtN = newValue.replace(/[^@]/g, "").length
            let oldAtN = this.oldChatInputValue?.replace(/[^@]/g, "")?.length || 0
            if(newAtN === 0 || newAtN < oldAtN){
              // console.log('删除了@成员的昵称');
              this.hide()
            }
            this.oldChatInputValue = newValue
          }, 0);
        }
      },
      show({confirm,...param}) {
        if(this.isShow){
          return console.log('已经显示了')
        }
        // console.log('show',param, confirm)
        // 默认选中第一个
        // console.log('this.memberList[0]',this.memberList[0])
        this.isShow = true
        if (confirm) {
          confirmFunc = confirm
        }
        this.keyword = ''
        this.filterFn = param.filter
        this.mapFn = param.map
        this.title = param.title || '选择提醒的人'
        this.forceShowSearch = param.forceShowSearch
      },
      hide() {
        this.keyword = ''
        this.isShow = false
      }
    }
  }
</script>

<style lang="scss">
.member-list-box {
  .content {
    position: fixed;
    width: 750rpx;
    height: 80vh;
    bottom: 0;
    z-index: 999;
    background-color: #ffffff;
    border-radius: 15px 15px 0 0;
    box-shadow: 0 0 100px rgba(0, 0, 0, 0.2);
    /* #ifdef H5 */
    @media screen and (min-device-width:960px){
      border-radius: 15px;
      max-height: 300px;
      width: unset;
      min-width: 260px;
      left: auto;
      right: calc(50vw - 300px);
      bottom: 300px;
    }
    /* #endif */
    .head{
      flex-direction: row;
      position: relative;
      .close {
        position: absolute;
        left: 5px;
        background-color: #eee;
        height: 18px;
        width: 18px;
        margin: 12px;
        transform: rotate(270deg);
        border-radius: 50%;
        justify-content: center;
        align-items: center;
        /* #ifdef H5 */
        cursor: pointer;
        z-index: 1;
        /* #endif */
      }
      .title {
        flex: 1;
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
        color: #000;
      }
    }
    .search {
       ::v-deep .uni-searchbar__box {
        margin: 0;
        height: 30px;
        .uni-searchbar__box-icon-search {
          padding: 0 5px;
        }
        .uni-searchbar__text-placeholder {
          // font-size: 12px;
        }
      }
    }
    .member-list {
      height: 0;
      flex-grow: 1;
      padding: 10px;
      .member-list-item {
        overflow: hidden;
        height: 40px;
        width: 100%;
        font-size: 14px;
        line-height: 40px;
        padding:0 15px;
        border-radius: 10px;
        margin-bottom: 10px;
        text-align: left;
        flex-direction: row;
        /* #ifdef H5 */
        @media screen and (min-device-width:960px){
          margin:0;
          margin-bottom: 5px;
          cursor: pointer;
        }
        /* #endif */
        .real_name {
          margin-left: 10px;
          font-size: 12px;
          color: #666;
        }
      }
      .member-list-item-active {
        background-color: #efefef;
      }
      .null-about-menber-tip {
        color: #666;
        font-size: 12px;
        align-items: center;
        justify-content: center;
        height: 100px;
      }
    }
  }
  .member-list-mark {
    position: fixed;
    top: 0;
    left: 0;
    width: 750rpx;
    flex: 1;
    width: 100vw;
    height: 100vh;
    z-index: 999;
  }
}
</style>
