<template>
  <view class="uni-im-chat-input" :style="{height:chatInputBoxHeight}">
    <view id="drag-line"></view>
    <view class="top-menu">
      <uni-im-icons v-for="(item,index) in menuList" :key="index" class="item"
        @click.native.stop="clickMenu(index,$event)"
        :title.native="`选择${item.title}，并发送`"
        :code="item.iconCode" size="24" color="#666666" 
      ></uni-im-icons>
      <!-- #ifdef H5 -->
      <view v-for="(item,index) in extToolBar" :key="index" class="item">
        <component :is="item.component" v-bind="item.props" @sendCodeMsg="sendCodeMsg" 
          @showMenberList="showMenberList"
        ></component>
      </view>
      <!-- #endif -->
    </view>
    <view class="main">
      <!-- 切换为语音模式 -->
      <!-- #ifdef H5 -->
      <!-- <view class="camera-filled-box icon" @click="chooseFileSendMsg('image')">
        <uni-icons type="camera-filled" size="20px" color="#FFF"></uni-icons>
      </view> -->
      <!-- #endif -->
      
      <uni-im-icons @click="changeMode('sound')" :code="soundIsShow?'e69f':'e684'" size="30" class="icon"></uni-im-icons>
      
      <view class="editor-box-parent">
        <view class="editor-box">
          <uni-im-sound v-show="soundIsShow" @sendSoundMsg="sendSoundMsg" class="uni-im-sound"></uni-im-sound>
          <uni-im-editor @click="clickEditor" @touchmove.stop v-show="!soundIsShow" @input="oninput" @confirm="confirm" @change="updateModelValue" class="editor" ref="editor" :hideKeyboard="emojiIsShow"></uni-im-editor>
        </view>
        <slot name="about-msg"></slot>
      </view>
      <uni-im-icons @click="changeMode('emoji')" :code="emojiIsShow?'e69f':'e646'" size="30" class="icon"></uni-im-icons>
      <text v-if="!soundIsShow&&canSend" @click="confirm" class="icon confirm">发送</text>
      <uni-im-icons v-else @click="changeMode('menu')" code="e75a" size="30" class="icon"></uni-im-icons>
    </view>
    <view v-if="showMediaBox" class="media-box" :style="{height:keyboardMaxHeight - bHeight +'px'}">
      <view v-if="mode == 'menu'" class="menu">
        <view class="menu-item" v-for="(item,index) in menuList" :key="index" @click.stop="clickMenu(index,$event)">
          <view class="menu-item-icon">
            <uni-im-icons :code="item.iconCode" size="26"></uni-im-icons>
          </view>
          <text class="menu-item-text">{{item.title}}</text>
        </view>
      </view>
      <scroll-view v-if="emojiIsShow" :scroll-y="true" class="emoji-list-box">
        <text v-for="(uniCodeEmoji,index) in emojiCodes" :key="index"
          @click.stop="clickEmojiItem(uniCodeEmoji,$event)" class="item">{{uniCodeEmoji}}</text>
      </scroll-view>
    </view>
    <!-- #ifndef H5 -->
    <!-- 调整输入框的位置，占位专用：键盘高度 或 全面屏底部不可用区域高度 -->
    <view v-else-if="raiseEditor || keyboardHeight" :style="{height: keyboardMaxHeight - bHeight + 'px'}"></view>
    <view :style="{height: bHeight + 'px'}"></view>
    <!-- #endif -->
    
    <view class="send-msg-btn-box">
      <text class="send-btn-tip">↵ 发送 / shift + ↵ 换行</text>
      <button @click="confirm" :disabled="!canSend" class="send" type="primary">发送</button>
    </view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  import {markRaw} from "vue";
  import emojiCodes from './emojiCodes.js';
  let currentModelValue = '';
  export default {
    name: 'uni-im-chat-input',
    emits: ["update:modelValue","confirm","input","sendSoundMsg","sendCodeMsg","showMenberList"],
    data() {
      return {
        bHeight:uniIm.systemInfo.safeAreaInsets.bottom/2,
        raiseEditor: false,
        mode: false,
        menuIsShow: false,
        menuList: [{
            "title": "图片",
            "iconCode": "e7be"
          },
          {
            "title": "视频",
            "iconCode": "e690"
          },
          {
            "title": "文件",
            "iconCode": "e69e"
          }
        ],
        emojiCodes,
        chatInputBoxHeight:'auto',
      }
    },
    computed: {
			showMediaBox() {
				return this.mode && this.mode != 'sound' 
				// #ifdef H5
				&& this.mode != 'input'
				// #endif
			},
			emojiIsShow() {
				return this.mode == 'emoji';
			},
			soundIsShow: {
				get() {
					return this.mode == 'sound';
				},
				set(value) {
					this.mode = value ? 'sound' : false;
				}
			},
      canSend() {
        return typeof this.modelValue != "string" || this.modelValue.trim().length > 0;
      },
      // #ifdef H5
      extToolBar(){
        // 调用扩展点，扩展程序可以在消息输入框新增一个工具类的项
        const currentConversationId = uniIm.currentConversationId
        if (currentConversationId) {
          return uniIm.extensions
            .invokeExts("input-msg-tool-bar",uniIm.conversation.find(currentConversationId))
            .filter((result) => result && result.component)
            .map((result) => {
              return {
                component: markRaw(result.component),
                props: result.props||{}
              };
            });
        }else{
          return []
        }
      }
      // #endif
    },
    props: {
      modelValue: {
        type: [String, Object],
        default: ""
      },
      keyboardMaxHeight: {
        type: Number,
        default: 0
      },
      keyboardHeight: {
        type: Number,
        default: 0
      },
			hideKeyboard: {
				type: Boolean,
				default: false
			}
    },
    mounted() {
			// #ifdef APP
			// 解决：点击输入框上的完成按钮，键盘收起，但是输入框不收起的问题
			uni.onKeyboardHeightChange(e=>{
				if(e.height === 0 && this.mode === 'input'){
					console.log('uni.onKeyboardHeightChange', e,this.mode);
					this.retract()
				}
			})
			// #endif
			
      currentModelValue = this.modelValue;
      // #ifdef H5
      // pc宽屏支持拖动改变输入框高度
      if(uniIm.isWidescreen){
        this.chatInputBoxHeight = uni.getStorageSync('uni-im-data:chatInputBoxHeight') || '300px';
        // 拖动uni-im-chat-input的顶部，改变高度
        let startY,startHeight,isMove = false;
        const dragLine = document.querySelector('#drag-line');
        dragLine.addEventListener('mousedown', (e) => {
          startY = e.clientY;
          startHeight = parseInt(this.chatInputBoxHeight);
          isMove = true;
        });
        document.addEventListener('mousemove', (e) => {
          if (isMove) {
            const moveY = startY - e.clientY;
            const height = startHeight + moveY;
            if(height > 800){
              // 改变鼠标样式，为向下箭头
              document.body.style.cursor = 's-resize';
            }else if(height < 200){
              // 改变鼠标样式，为向上箭头
              document.body.style.cursor = 'n-resize';
            }else{
              this.chatInputBoxHeight = height + 'px';
            }
          }
        });
        document.addEventListener('mouseup', () => {
          if(isMove){
            document.body.style.cursor = '';
            isMove = false;
            uni.setStorageSync('uni-im-data:chatInputBoxHeight',this.chatInputBoxHeight)
          }
        });
      }
      // #endif
    },
    watch: {
      modelValue:{
        handler(modelValue,oldValue) {
          // console.log('###modelValue', modelValue,JSON.stringify(currentModelValue) != JSON.stringify(modelValue) );
          if(JSON.stringify(currentModelValue) != JSON.stringify(modelValue) ) {
            const {html} = modelValue
            this.setContent(html?{html}:modelValue)
          }
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
			clickEditor() {
				if(this.mode != 'input'){
					// #ifdef H5
					if(this.mode == 'emoji'){
						this.changeMode('input');
						// 滚动到底部。todo：当前场景$nextTick和setTimeout均无效
						setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),50)
						return
					}
					// #endif
					this.changeMode('input');
				}
			},
      sendSoundMsg(e) {
        this.$emit('sendSoundMsg',e)
      },
      sendCodeMsg(e) {
        this.$emit('sendCodeMsg',e)
      },
      showMenberList(e) {
        this.$emit('showMenberList',e)
      },
      oninput(e) {
        currentModelValue = e.value;
        this.$emit('update:modelValue', e.value)
        this.$emit('input',e)
      },
      updateModelValue({value}) {
        this.$emit('update:modelValue', value)
      },
      focus() {
        // console.log('focus');
        this.$refs.editor.callRmd('$focus')
      },
      async addCallUser({user_id, nickname},needDeleteLeftART = true,DL=0) {
        // 隐藏发送语音消息模式
        this.soundIsShow = false;
        
        this.raiseEditor = true;
        setTimeout(()=>this.raiseEditor = false,2000)
        
        if(needDeleteLeftART){
          // console.error('needDeleteLeftART');
          // DL 是需要删除的个数，因为web-pc端用户可以输入关键词筛选用户导致多出字符
          this.$refs.editor.callRmd('$deleteLeftChar', 1+DL)
        }else{
          // console.error('no needDeleteLeftART');
          await uniIm.utils.sleep(100)
          this.$refs.editor.callRmd('$focus')
        }
        await uniIm.utils.sleep(10)
        
        // 提醒末尾的此空格在margin-right: -3px;内，用于解决办法浏览器非文本节点后的光标定位不正确的问题
        const html =`<span class="nickname" contenteditable="false" user_id="${user_id}">@${nickname}</span>&nbsp;`
        this.addHtmlToCursor(html)
        // setTimeout(()=>this.$refs.editor.callRmd('$restoreCursor'),500)
      },
			retract(){
				if(![false, 'sound'].includes(this.mode)){
					this.mode = false
				}
			},
      changeMode(type) {
				// console.log('changeMode', type,this.mode);
				this.mode = this.mode === type ? 'input' : type;
				// #ifdef MP-WEIXIN
				if (this.mode === 'input') {
					// 获取焦点
					this.$refs.editor.focus()
				}
				// #endif
				// #ifndef MP-WEIXIN
				const needRC = ['input']
				// #ifdef APP
				if(uniIm.systemInfo.platform != 'ios'){
					needRC.push('emoji')
				}
				// #endif
				if (needRC.includes(this.mode)) {
					// 获取焦点
					this.$refs.editor.callRmd('$restoreCursor')
				}
				// #endif
      },
      clickEmojiItem(uniCodeEmoji, event) {
        // console.log('clickEmojiItem', uniCodeEmoji, event);
        this.addHtmlToCursor(uniCodeEmoji,false)
      },
      addHtmlToCursor(html,focus=true) {
        this.$refs.editor.callRmd('$addHtmlToCursor',html,focus)
      },
      setContent(content) {
        // console.log('setContent', content);
        this.$refs.editor.callRmd('$setContent',content)
        // this.$emit('update:modelValue', content)
      },
      clickMenu(index, event) {
        console.log('clickMenu', index, event);
        let parrent = this.$parent
        // #ifdef H5
        parrent = this.$parent.$parent.$parent
        // #endif
        
        if (index < 2) {
          parrent.chooseFileSendMsg(index === 0 ? 'image' : 'video')
        }
        if (index === 2) {
          // #ifdef APP
          return uni.showToast({
            title: '暂不支持，发送文件',
            icon: 'none'
          });
          // #endif
          parrent.chooseFileSendMsg('all')
        }
      },
      confirm() {
        console.log('confirm');
        this.$emit('confirm');
      }
    }
  }
</script>

<style lang="scss">
.uni-im-chat-input {
  padding:0 5px;
  border-top: 1px solid #f5f5f5;
  & > view {
    // justify-content: center;
    // align-items: center;
    // align-content: center;
  }
  .top-menu,.send-msg-btn-box{
    // 默认隐藏 pc端才显示
    display: none;
  }
  .main {
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    overflow: hidden;
    .icon {
      margin:0 5px;
      margin-bottom: 20px;
      width: 30px;
      height: 30px;
      align-content: center;
      flex-shrink: 0;
      &.confirm {
        width: auto;
        color: #fff;
        font-size: .75rem;
        border-radius: 6px;
        background-color: #2faf4c;
        height: 28px;
        line-height: 28px;
        padding: 0 8px;
        text-align: center;
      }
    }
    .camera-filled-box {
      background-color: #3b81fd;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 100px;
    }
    .editor-box-parent{
      flex: 1;
      height: 100%;
      overflow: hidden;
      .editor-box {
        position: relative;
        overflow: hidden;
        flex: 1;
        margin:10px 5px;
        padding: 10px 8px;
        background-color: #FFF;
        min-height: 46px;
        &,.editor {
          border-radius: 10px;
        }
        .editor {
          // flex: 1;
        }
        .uni-im-sound {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 10;
        }
      }
    }
  }
  .media-box {
    .menu {
      flex-direction: row;
      justify-content: self-start;
      align-items: self-start;
      padding: 10px 0;
      // height: 100%;
      .menu-item {
        margin: 15px;
        width: 60px;
        height: 60px;
        justify-content: center;
        align-items: center;
        .menu-item-icon {
          width: 40px;
          height: 40px;
          justify-content: center;
          align-items: center;
          background-color: #FFF;
          padding: 8px;
          border-radius: 10px;
          margin-bottom: 5px;
        }
        .menu-item-text {
          font-size: 12px;
          color: #666666;
        }
      }
    }
    .emoji-list-box {
      height: 100%;
      padding: 15rpx;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      .item {
        text-align: center;
        font-size: 65rpx;
        width: 87rpx;
        height: 87rpx;
        justify-content: center;
        align-items: center;
        display: inline-block;
      }
    }
  }
}


/* #ifdef H5 */
@media screen and (min-device-width:560px){
  .uni-im-chat-input {
    position: relative;
    flex-direction: column;
    #drag-line {
      // 鼠标变上下拖动的光标
      cursor: row-resize;
      height: 5px;
      position: absolute;
      left: 0;
      top: -3px;
      width: 100%;
      z-index: 1;
    }
    .main {
      .icon {
        display: none;
      }
      .editor-box-parent {
        flex-direction: column-reverse;
      }
      .editor-box {
        height: 200px;
        padding: 0;
        background-color: transparent !important;
        & ::v-deep {
          .uni-im-editor-box {
            height: 100%;
          }
          .uni-im-editor{
            height: 100%;
            max-height: 100%;
          }
        }
      }
    }
    
    .top-menu {
      display: flex;
      height: 45px;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      background-color: #f5f5f5;
      .item {
        margin:0 20px 0 10px;
      }
    }
    .send-msg-btn-box {
      display: flex;
      flex-direction: row;
      height: 45px;
      justify-content: flex-end;
      align-items: center;
      padding:0 5px;
      .send-btn-tip {
        font-size: 12px;
        color: #666666;
      }
      .send {
        font-size: 12px;
        margin:0 10px;
        color: #fff;
      }
    }
  }
  
}
/* #endif */
</style>