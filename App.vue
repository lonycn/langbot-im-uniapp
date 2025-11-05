<script>
  //1. 导入uni身份信息管理模块
  import uniIdPagesInit from '@/uni_modules/uni-id-pages/init.js';
  //2. 导入uniIm
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  // 3.引入扩展插件（项目默认引入了，扩展插件uniImMsgReader用于展示消息是否已读）
  import MsgReaderExtension from '@/uni_modules/uni-im-msg-reader/extension.js'
  
  // 解决APP端不支持console.time的问题
  const consoleTimeObj = {}
  console.time = function (name) {
    consoleTimeObj[name] = Date.now()
  }
  console.timeEnd = function (name,fun) {
    const time = Date.now() - consoleTimeObj[name]
    if (time > 0) {
      // if (time > 3) {
      //   console.error(name + ':', time + 'ms')
      // }else if(time > 1){
      //   console.warn(name + ':', time + 'ms')
      // }
      // else{
      //   console.log(name + ':', time + 'ms')
      // }
      
      // // fun && fun(time)
      // // console.log('find-'+this.constructor.name,new Error().stack)
    } else {
      // console.log(name + ':', time + 'ms')
    }
  }
  
  export default {
    onLaunch: async function() {
      console.log('App Launch');
      //4. 安装uniIm扩展插件
      MsgReaderExtension.install()
      //5. 初始化uni身份信息管理模块
      uniIdPagesInit();
      //6. 初始化uniIm
      uniIm.init();
    },
    onShow: function() {
      console.log('App Show');
    },
    onHide: function() {
      console.log('App Hide');
    }
  };
</script>

<style lang="scss">
  /*每个页面公共css */

  /* #ifdef H5 */
  @media screen and (min-width:960px) {

    /* pc宽屏 隐藏会话页面头部 && 全局底部导航 以下兼容了Vue2和3两种模式的样式*/
    uni-page[data-page="uni_modules/uni-im/pages/index/index"] uni-page-head,
    .uni_modules-uni-im-pages-index-index uni-page-head,
    uni-tabbar,
    .uni-app--showtabbar uni-page-wrapper::after {
      display: none !important;
    }
  }

  /* #endif */

  /* #ifndef APP-NVUE */
  @import "@/uni_modules/uni-im/static/iconfont.css";
  /* #endif */
</style>