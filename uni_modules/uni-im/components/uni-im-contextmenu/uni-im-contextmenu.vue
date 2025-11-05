<template>
  <view class="root" v-if="isShow" @contextmenu.prevent.native="isWidescreen?closeMe():''">
    <view class="uni-im-contextmenu-mark" @touchstart.prevent="closeMe" @click="closeMe"></view>
    <!-- 注意微信小程序下style不支持传obj -->
    <view class="contextmenu" ref="contextmenu" :style="{'left':style.left,'top':style.top,'opacity':style.opacity}">
      <text class="item" v-for="(item,index) in menuList" :key="index" @click="doAction(item.action)">{{item.title}}</text>
    </view>
  </view>
</template>

<script>
  // let funList = {}
  let onCloseFnList = [];
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    computed: {
      ...uniIm.mapState(['isWidescreen']),
    },
    data() {
      return {
        "isShow":false,
        "style":{
          "top":"",
          "left":"",
          "opacity":1
        },
        "menuList":[
          {
            "title":"title",
            "action":"defaultAction"
          },
          {
            "title":"title2",
            "action":"defaultAction2"
          },
          {
            "title":"测试其中一个特别长",
            "action":"defaultAction2"
          }
        ]
      }
    },
    methods: {
      onClose(fn){
        onCloseFnList.push(fn)
      },
      doAction(actionName){
        actionName()
        this.closeMe()
      },
      show(position,menuList){
        let {
          top = '',
          left = '',
          estimateWidth = 150, // 预估尺寸应该不小于实际渲染尺寸
          estimateHeight = 150,
        } = position

        // 根据给定的位置和尺寸，结合窗口大小，计算出 top/left 定位参数，
        // 确保不超出窗口边界。
        let calcPosition = (top, left, width, height) => {
          let { windowWidth, windowHeight } = uni.getWindowInfo()
          // console.log({windowWidth,windowHeight,top, left, width, height})
          let style = {}
          if (top) {
            if (top > windowHeight - height) {
              style.top = `${windowHeight - height}px`
            } else {
              style.top = `${top}px`
            }
          }
          if (left) {
            if (left > windowWidth - width) {
              style.left = `${windowWidth - width}px`
            } else {
              style.left = `${left}px`
            }
          }
          return style
        }
        
        // 根据预估的组件大小初步设定组件的位置
        this.style = calcPosition(top, left, estimateWidth, estimateHeight)
        this.isShow = true
        this.menuList = menuList
        this.style.opacity = 0

        setTimeout(() => {
          // 根据实际渲染出的组件大小修正定位
          const query = uni.createSelectorQuery().in(this)
          query.select('.contextmenu').boundingClientRect(option => {
            const { width, height } = option
            this.style = calcPosition(top, left, width, height)
            this.style.opacity = 1
          }).exec()
        }, 0)
      },
      closeMe(){
        this.isShow = false
        onCloseFnList.forEach(fn => {
          if(typeof fn === 'function'){
            fn()
          }
        })
        onCloseFnList = []
        // console.log('closeMe');
      }
    }
  }
</script>

<style lang="scss">
.root{
  
}
.contextmenu{
  position: fixed;
  background-color: #fff;
  z-index: 99;
  border-radius: 10px;
  box-shadow: 0 0 10px #888;
  background-color:#FFF;
  // opacity: 0.98;
  border: 1px solid #999;
  padding: 3px;
  flex-direction: column;
}

.item{
  padding: 5px 10px;
  font-size: 18px;
  border-radius: 5px;
  margin: 5px;
  opacity: 0.9;
  text-align: left;
  height: 40px;
  align-content: center;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
}

.item:hover{
  background-color: #1099ff;
  color: #fff;
}

.uni-im-contextmenu-mark{
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index:10;
		background-color: rgba(0,0,0,0.5);
	}
</style>
