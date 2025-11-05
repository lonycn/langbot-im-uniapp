<template>
  <view class="msg-text-box" :class="{self}">
    <msgRichText v-if="htmlNodes.length" :msg="{...msg,...{'body':htmlNodes}}" />
    <text v-else class="msg-text" :decode="true" space="ensp">{{ trText(msg.body) }}</text>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  import msgRichText from './rich-text.vue'
  export default {
    components: {
      msgRichText,
    },
    props: {
      msg: {
        type: Object,
        default () {
          return {
            body: ""
          }
        }
      }
    },
    data() {
      return {
        htmlNodes: []
      }
    },
    computed: {
      self() {
        return this.msg.from_uid === uniIm.currentUser._id
      },
    },
    methods: {
      trText(str) {
        // TODO：临时方案，解决 \n 被转义的问题
        return str.replace(/\\n/g, "\\\\n")
      },
    },
    watch: {
      "msg.body": {
        handler() {
          let htmlString = this.msg.body.replace(/</g, "&lt;").replace(/>/g, "&gt;")
          // 将字符串的url转换为链接
          htmlString = uniIm.utils.replaceUrlToLink(htmlString)
          
          /* 如需要自己补：
          // 手机号正则
          const regPhone = /(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}/g;
          htmlString = htmlString.replace(regPhone, " <a href='tel:$&'>$&</a>")
          // 固定电话正则
          const regTel = /(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?/g;
          htmlString = htmlString.replace(regTel, " <a href='tel:$&'>$&</a>")
          // 邮箱正则
          const regMail = /([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4})/ig;
          htmlString = htmlString.replace(regMail, " <a href='mailto:$&'>$&</a>")
          */
          
          if (this.msg.body != htmlString) {
            try {
              let htmlNodes = uniIm.utils.parseHtml(htmlString)
              // console.log('htmlNodes',htmlNodes);
              htmlNodes.map(item => {
                // console.log('item',item);
                if (item.attrs && item.attrs.class) {
                  item.attrs.class += " msg-text"
                } else {
                  item.attrs = {
                    class: "msg-text"
                  }
                }
                return item
              })
              this.htmlNodes = htmlNodes
            } catch (e) {
              console.error('htmlString error：', e);
            }
          }
        },
        immediate: true
      }
    },
    mounted() {},
  }
</script>

<style lang="scss">
  .msg-text-box {
    border-radius: 10px;
    background-color: #FFFFFF;
    min-width: 30px;
    flex-shrink: 1;
    &.self{
      background-color: #c9e7ff;
    }
    .msg-text {
      padding:5px 10px;
      font-size: 15px;
      word-break: break-all;
      cursor: text;
      /* #ifdef H5 */
      @media screen and (min-device-width:960px){
        user-select: text;
      }
      /* #endif */
    }
  }
  
</style>