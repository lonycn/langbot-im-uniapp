<template>
  <view class="code-view-root" >
    <view class="copy-btn-box" @click.stop>
      <text class="language">{{language}}</text>
      <text class="copy-btn" @click="copyCode">复制代码</text>
    </view>
    <scroll-view :scroll-y="overflow" :enable-flex="true" class="code-view-box" :style="{height:showFullBtn ? boxHeight: 'auto'}">
      <!-- #ifdef APP-NVUE -->
      <web-view ref="web" @onPostMessage="onWebViewMsg" src="/static/app-plus/mp-html/uni-im-code-view-local.html" :style='{"height":webViewHeight}' class="web-view"></web-view>
      <!-- #endif -->

      <!-- #ifndef APP-NVUE -->
      <rich-text v-if="nodes.length" space="nbsp" :nodes="nodes" @itemclick="trOnclick" :style='{"height":webViewHeight}' class="code-view-rich-text"></rich-text>
      <!-- #endif -->
    </scroll-view>
    <view class="show-full-btn" v-if="!isWidescreen && showFullBtn && overflow" @click="toCodePage">
      <text class="show-full-text">全屏查看</text>
    </view>
  </view>
</template>

<script>
  // hljs是由 Highlight.js 经兼容性修改后的文件，请勿直接升级。否则会造成uni-app-vue3-Android下有兼容问题
  import hljs from "@/uni_modules/uni-im/sdk/utils/highlight/highlight-uni.min.js";
  
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  
  // 初始化 MarkdownIt库
  const MarkdownIt = uniIm.utils.markdownIt;
  const markdownIt = MarkdownIt({
    // 在源码中启用 HTML 标签
    html: true,
    // 如果结果以 <pre ... 开头，内部包装器则会跳过。
    highlight: function (str, language) {
      // 把tab换成两个空格
      str = str.replace(/\t/g, '  ')
      // 经过highlight.js处理后的html
      let preCode = ""
      try {
        preCode = hljs.highlightAuto(str).value
      } catch (err) {
        // console.log('err',err);
        preCode = markdownIt.utils.escapeHtml(str);
      }
      // console.log('preCode',preCode);
      // 以换行进行分割
      const lines = preCode.split(/\n/).slice(0, -1)
      // 添加自定义行号
      let html = lines.map((item, index) => {
        // 去掉空行
        if (item == '') {
          return ''
        }
        const style = `transform: translateX(${lines.length > 99?10:0}px);height:20px;line-height: 20px;`
        return `<li style="${style}"><span class="line-num" data-line="${index + 1}"></span>${item}</li>`
      }).join('')
      html = '<ol>' + html + '</ol>'

      let htmlCode = `<div>`
      htmlCode += `<pre class="hljs" style="padding-bottom:${uniIm.isWidescreen?15:0}px;overflow: auto;display: block;"><code>${html}</code></pre>`;
      htmlCode += '</div>'
      return htmlCode
    }
  })
  
  export default {
    computed: {
      ...uniIm.mapState(['isWidescreen']),
      code(){
        return this.msg.body || ''
      }
    },
    data() {
      return {
        nodes: [],
        language: '',
        // #ifdef APP-NVUE
        webViewHeight: "100px",
        // #endif
        htmlString: '',
        overflow: false,
        boxHeight: '20px'
      }
    },
    props: {
      msg: {
        type: Object,
        default () {
          return {}
        }
      },
      showFullBtn: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      code: {
        handler(code, oldValue) {
          // console.log('code',code);
          // 判断markdown中代码块标识符的数量是否为偶数
          this.htmlString = markdownIt.render("``` \n\n" + code + " \n\n ```")
          // console.log('this.htmlString',this.htmlString);
          // #ifdef APP-NVUE
          this.setWebViewConetnt(this.htmlString)
          // #endif

          // #ifndef APP-NVUE
          this.nodes = this.htmlString
          // #endif
          
          const codeLine = this.code.split(/\n/).slice(0, -1).filter(item=>item).length + 1
          let height = codeLine * 20
          this.webViewHeight = height + 'px'
          const maxHeight = 200
          if (height > maxHeight) {
            this.overflow = true
            this.boxHeight = maxHeight + 'px'
          }else{
            this.boxHeight = height + 'px'
          }
        },
        immediate: true
      }
    },
    mounted() {},
    methods: {
      // #ifdef APP-NVUE
      setWebViewConetnt() {
        if (this.$refs.web) {
          // console.log('this.htmlString',this.htmlString);
          this.$refs.web.evalJs(`setHtml(${JSON.stringify(this.htmlString)})`)
        }
      },
      onWebViewMsg(e) {
        let [data] = e.detail.data
        if (data.action == 'onJSBridgeReady') {
          this.setWebViewConetnt()
        }
      },
      // #endif
      copyCode(e) {
        uni.setClipboardData({
          data: this.code,
          showToast: false,
          success() {
            uni.showToast({
              title: '复制成功',
              icon: 'none'
            });
          }
        })
      },
      toCodePage() {
        uni.navigateTo({
          url: '/uni_modules/uni-im/pages/common/view-code-page/view-code-page?msgId=' + this.msg._id + '&conversationId=' + this.msg.conversation_id
        })
      },
      trOnclick(e) {
        console.log('e', e);
      }
    }
  }

</script>

<style lang="scss">
  /* #ifndef APP-NVUE */
  @import '@/uni_modules/uni-im/sdk/utils/highlight/github-dark.min.scss';
  /* #endif */
  
  .code-view-root {
    flex: 1;
    border-radius: 3px;
    background-color: #0d1117;
    /* #ifndef APP-NVUE */
    width: 100%;
    /* #endif */
  }
  
  .copy-btn-box {
    font-size: 12px;
    top: 0px;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    padding:5px;
  }
  .language {
    color: #888;
  }
  .copy-btn {
    font-size: 12px;
    padding: 0 5px;
    color: #888;
    /* #ifdef H5 */
    cursor: pointer;
    /* #endif */
  }
  /* #ifdef H5 */
  .copy-btn:hover {
    color: #259939;
  }
  /* #endif */

  .code-view-box {
    position: relative;
    padding: 0;
    margin-bottom: 10px;
    // 设置与背景一样的黑色，防止滚动条样式变化太大
    background-color: #0d1117;
    /* #ifndef APP-NVUE */
    padding: 0 5px;
    overflow: auto;
    width: 100%;
    /* #endif */
    box-sizing: border-box;
  }

  /* #ifdef H5 */
  .code-view-box * {
    user-select: text;
    cursor: text;
  }
  /* #endif */

  .code-view-rich-text {
    // flex: 1;
    font-size: 14px;
    border-radius: 10px;
  }

  .msg-code {
    /* #ifdef MP */
    width: 600rpx;
    /* #endif */
  }
  
  .show-full-btn {
    justify-content: center;
    align-items: center;
    height: 30px;
    border-top: 1px solid #30363d;
  }
  
  .show-full-text {
    margin:0 auto;
    font-size: 12px;
    color: #888;
  }
</style>