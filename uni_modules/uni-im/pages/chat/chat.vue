<template>
  <view id="uni-im-chat" class="uni-im-chat" :class="{'pc':isWidescreen}">
    <!-- #ifdef H5 -->
    <!-- web-pc端会话标题 -->
    <view v-if="isWidescreen" id="web-pc-chat-title">
      <text :selectable="true">{{navTitle}}</text>
      <template v-for="(item,index) in extChatTitle" :key="index">
        <component :is="item.component" v-bind="item.props"></component>
      </template>
    </view>
    <!-- H5端 左上角显示未读消息数 ，app端使用setTitleNViewButtonBadge设置，小程序端暂未支持-->
    <view @click="tapUnreadCount" class="unread_count" v-if="unread_count != 0">
      {{ unread_count > 99 ? '99+' : unread_count }}
    </view>
    <!-- #endif -->

    <!-- 消息列表 -->
    <uni-im-msg-list :conversationId="conversation.id" ref="msg-list" 
      @showControl="showControl" @longpressMsgAvatar="onLongpressMsgAvatar"
      @retriesSendMsg="retriesSendMsg" class="msg-list"
      @putChatInputContent="putChatInputContent" :chooseMore="chooseMoreMsg"
      :checkedMsgList.sync="checkedMsgList"
      @showMenberList="showMenberList"
			@touchstart="onclickMsgList"
    ></uni-im-msg-list>
    
    <!-- 聊天数据输入框 键盘弹出后要抬高底部内边距 全面屏的安全距离 -->
    <text v-if="conversation.leave" class="disable-chat-foot">- 你不是此群成员 -</text>
    <text v-else-if="conversation.isMuteAllMembers" class="disable-chat-foot">-  全群禁言禁止输入 -</text>
    <view v-else class="chat-foot" @touchmove.prevent>
      <uni-im-chat-input
        ref="chat-input"
        v-model="chatInputContent"
        :keyboardMaxHeight="keyboardMaxHeight"
        :keyboardHeight="keyboardHeight"
        @confirm="chatInputConfirm"
        @input="onInput"
        @sendSoundMsg="sendSoundMsg"
        @sendCodeMsg="beforeSendMsg"
        @showMenberList="showMenberList"
      >
        <template #about-msg>
          <view class="answer-msg" v-if="answerMsg !== false">
            <text class="answer-msg-text">{{answerMsgNickname}}：{{answerMsgNote}}</text>
            <uni-icons class="close-icon" @click="answerMsg = false" type="clear" color="#ccc" size="18px"></uni-icons>
          </view>
        </template>
      </uni-im-chat-input>
      
      <toolbar v-model="chooseMoreMsg" @shareMsg="shareMsg(checkedMsgList,$event)"></toolbar>
    </view>

    <msg-popup-control ref="msg-popup-control" @answer="setAnswerMsg" @intoTopic="intoTopic" @share="shareMsg" @chooseMore="chooseMoreMsg = true;checkedMsgList = $event"></msg-popup-control>

    
    <uni-im-member-list ref="member-list" :conversationId="conversation.id"></uni-im-member-list>

    <!-- #ifdef H5 -->
    <uni-im-share-msg v-if="isWidescreen" id="uni-im-share-msg" ref="share-msg"></uni-im-share-msg>
    <!-- #endif -->
    
    <view style="position: fixed;top: 200px;left: 0;background-color: #FFFFFF;z-index: 9999;">
      <!-- keyboardMaxHeight:{{keyboardMaxHeight}}
			conversation.leave:{{conversation.leave}}
      chatInputContent:{{chatInputContent}}
			keyboardHeight:{{keyboardHeight}}
			systemInfo.osName:{{systemInfo.osName}}
      chooseMoreMsg:{{chooseMoreMsg}}
      checkedMsgList:{{checkedMsgList}} -->
		</view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  import msgPopupControl from '@/uni_modules/uni-im/components/uni-im-msg/popup-control.vue';
  import toolbar from './toolbar.vue';
  import {markRaw} from "vue";
  // #ifdef H5
  import uniImShareMsg from '@/uni_modules/uni-im/pages/share-msg/share-msg.vue';
  // #endif
  

/**
 * chat 组件，渲染一个完整的会话，包括头部、消息列表、输入区。
 * 
 * @module
 * 
 * @see 用于渲染消息列表的组件 {@link module:uni-im-msg-list}
 */
  export default {
    components: {
      // #ifdef H5
      uniImShareMsg,
      // #endif
      msgPopupControl,
      toolbar
    },
    data() {
      return {
        // 当前会话对象
        conversation: {
          id: false,
          leave:false,
          title: ''
        },
        navTitle:"",//导航栏标题
        keyboardHeight: 0,
        keyboardMaxHeight: 0,
        answerMsg: false,
        chooseMoreMsg: false,
        checkedMsgList: [],
        // 聊天输入框内容
        chatInputContent: '',
      };
    },
    props: {
      // #ifdef VUE3
      conversation_id: {
        default: ''
      }
      // #endif
    },
    computed: {
      ...uniIm.mapState(['currentConversationId', 'isWidescreen', 'systemInfo']),
      unread_count() {
        // 所有会话的未读消息数
        const unreadCount = uniIm.conversation.unreadCount()

        // #ifdef APP-PLUS
        // 给标题栏返回按钮添加数字角标，表示有几条其他会话的未读消息数
        plus.webview.currentWebview().setTitleNViewButtonBadge({
          index: 0,
          text: unreadCount
        })
        // #endif

        return unreadCount
      },
      //当前用户自己的uid
      current_uid() {
        return uniIm.currentUser._id;
      },
      extChatTitle(){
        if(this.conversation){
          return uniIm.extensions
            .invokeExts("chat-title",this.conversation)
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
      },
      answerMsgNote() {
        return uniIm.utils.getMsgNote(this.answerMsg)
      },
      answerMsgNickname() {
        // 兼容旧版本，消息中未包含用户最新的昵称，需要通过用户id获取
        return this.answerMsg.nickname || uniIm.users.getNickname(this.answerMsg.from_uid)
      }
    },
    created() {
      // console.log('chat created',this.systemInfo)
      // 监听推送消息
      this.onImMsg = (res) => {
        if(uniIm.isDisabled){
          return console.log('uniIm isDisabled')
        }
        //获取透传内容
        const { data } = res.data.payload;
        //判断消息类型是否为im，且为当前页面对应会话消息
        if (
          data.conversation_id == this.currentConversationId 
          && data.from_uid != this.current_uid 
          && uniIm.utils.isReadableMsg(data)
        ) {
          // 已经打开相应会话时，收到消息，则设置此会话为已读。注意无需判断，本地会话未读数是否为0，因为云端可能不为0
          this.conversation.clearUnreadCount();
          console.log('聊天页面-收到消息: ', JSON.stringify(res));
          // 需要重新设置滚动条的高，以至于用户可以立即看到（即：滚动到最后一条消息）
          // console.log(66666);

          // 注：为兼容web-PC端这里必须使用setTimeout 0
          setTimeout(() => {
            this.$refs['msg-list']?.notifyNewMsg()
          }, 0);
        }
      }
      uniIm.onMsg(this.onImMsg);
      
      // 优化 提前拿到键盘高度，防止第一次在会话点击输入框时，输入框抬起慢。（缺省值300，是为了解决模拟器调试没有键盘高度而设置）
      this.keyboardMaxHeight = uniIm.keyboardMaxHeight || 300
      this.onKeyboardHeightChange = ({
        height
      }) => {
        this.keyboardHeight = height
        // console.log('height',height)
        if (height > this.keyboardMaxHeight) {
          this.keyboardMaxHeight = height
        }
        this.$nextTick(() => {
          this.showLast();
        });
      }
      // #ifdef H5
      const oldWindowHeight = window.innerHeight;
      window.onresize = ()=>{
        this.onKeyboardHeightChange({"height": oldWindowHeight - window.innerHeight})
      }
      // #endif
      // #ifndef H5
      // 监听键盘高度变化显示最后一条消息
      uni.onKeyboardHeightChange(this.onKeyboardHeightChange);
      // #endif
    },
    mounted() {
      // #ifdef H5
      if(this.isWidescreen){
        // 以下为实现拖拽或粘贴图片至聊天页面，直接发送的逻辑
        const chatBodyDom = document.getElementById("uni-im-chat")
        // 阻止默认事件
        chatBodyDom.addEventListener(
          'dragover',
          function(event) {
            event.preventDefault();
          },
          false
        );
        // 拖拽结束时触发
        chatBodyDom.addEventListener(
          'drop',
          e => {
            //取消默认浏览器拖拽效果
            e.preventDefault();
            //获取文件对象
            let fileList = e.dataTransfer.files;
            if (fileList.length == 0) {
              return false;
            }
            const [file] = fileList
            let fileType = file.type.split('/')[0] || 'file'
            if (fileType === 'image') {
              let blobUrl = window.URL.createObjectURL(file);
              if(this.chatInputContent === ''){
                this.$refs["chat-input"].setContent({html:`<img src="${blobUrl}" />`})
              }else{
                this.$refs["chat-input"].addHtmlToCursor(`<img src="${blobUrl}" />`)
              }
              return false; // 拖拽图片内容进入输入框先不发送
            }
            // 其他文件类型，直接发送
            let {
              name,
              size
            } = file
            // console.log(78979798,fileList);
            const blobUrl = window.URL.createObjectURL(file);
            this.uploadFileAndSendMsg({
                tempFiles:[{
                  size,
                  name,
                  path:blobUrl,
                  fileType
                }]
            })
          },
          false
        );
        const chatInput = document.querySelector('.pc .uni-im-editor');
        chatInput.addEventListener('keydown',async e => {
          this.$refs['member-list'].onChatInputKeydown(e)
        })
      }
      // #endif
    },
    onShow() {
      // TODO:解决 previewImage 误触发onShow的问题
      if(uniIm.ext._previewImageIsOpen){
        return
      }
      if (this.conversation.id) {
        // 用于打开会话窗口后，切换到后台，再切回时设置当前会话id。
        uniIm.currentConversationId = this.conversation.id
        // 用于从后台切到前台时，设置当前会话为已读
        this.clearUnreadCount();
        this.updateNavTitle()
      }
    },
    onUnload() {
      // console.log('onUnload');
      
      // 关闭监听消息推送事件
      uniIm.offMsg(this.onImMsg);
      
      // #ifndef H5
      uni.offKeyboardHeightChange(this.onKeyboardHeightChange)
      // #endif
      
      //页面销毁之前销毁 全局变量 正在聊天的用户的id
      uniIm.currentConversationId = ''
      // console.log('beforeDestroy');
      // 关闭sound播放
      uniIm.audioContext.stop()
    },
    beforeDestroy() {
      //页面销毁之前销毁 全局变量 正在聊天的用户的id
      uniIm.currentConversationId = ''
      // console.log('beforeDestroy');
      // 关闭sound播放
      uniIm.audioContext.stop()
    },
    onHide() {
      // TODO:解决 previewImage 误触发onHide的问题
      if(uniIm.ext._previewImageIsOpen){
        return
      }
      uniIm.currentConversationId = ''
      // 关闭sound播放
      uniIm.audioContext.stop()
    },
    onLoad(param) {
      for (const key in param) {
        try{
          param[key] = JSON.parse(param[key])
        }catch(_){}
      }
      //调用load方法，因为pc宽屏时本页面是以组件形式展示。如$refs.chatView.loadconversation_id()执行
      this.load(param)
    },
    onBackPress(e) {
      // console.log('onBackPress',e);
      const memberListRef = this.$refs['member-list']
      if(memberListRef.isShow){
        memberListRef.hide()
        return true
      }
    },
    watch: {
      // 监听群昵称变化
      'conversation.title'(){
        this.updateNavTitle()
      },
      // 监听群成员数变化
      'conversation.group.member_count'(){
        this.updateNavTitle()
      }
    },
    methods: {
      async load(param) {
				await Promise.all(uniIm.extensions.invokeExts('chat-load-before-extra', param))
        this.answerMsg = false
        if(this.conversation.id){
          // 设置上一个会话的chatInputContent 实现多个会话之间的草稿功能
          this.conversation.chatInputContent = this.chatInputContent
        }

        this.conversation = await uniIm.conversation.get(param)
        // 初始化会话的chatInputContent
        this.chatInputContent = this.conversation.chatInputContent
        // this.conversation.remind_msg_ids = []
        // console.log('this.conversation',this.conversation)
        

        //设置全局的app当前正在聊天的会话id（注：本页面可能是直达页）
        uniIm.currentConversationId = this.conversation.id
        setTimeout(() => {
          this.$refs['msg-list'].init()
        }, 0);

        // console.log('this.conversation',this.conversation);
        
        //debug用模拟一次性自动发送100条数据
        // for (var i = 0; i < 20; i++) {
        // 	this.chatInputContent = '这是第'+i+'条消息'
        // 	this.beforeSendMsg()
        // }*/
        
        // 清除当前会话未读数
        this.clearUnreadCount();
        
        // #ifdef H5
        if(this.isWidescreen){
          // 切换到新的会话后把输入焦点设置到输入框（考虑到可能有草稿文字，需延迟设置）
          setTimeout(() => {
            this.$refs["chat-input"]?.focus()
          }, 100)
        }else{
          const {is_temp,friend_uid} = this.conversation
          if(is_temp && friend_uid){
            // 为了避免在web端刷新页面之后，本地单聊临时会话丢失，将地址栏中的会话id参数替换为好友的uid，以此来确保在刷新页面之后，本地能够再次创建临时会话。
            const {route:path,options} = getCurrentPages().pop()
            delete options.conversation_id
            options.user_id = friend_uid
            let paramSrt
            for (const key in options) {
              paramSrt = `${key}=${options[key]}`
            }
            history.replaceState(null, '', `/#/${path}?${paramSrt}`)
          }
        }
        // #endif
      },
      onclickMsgList(){
				// console.log('onclickMsgList');
        this.$refs["chat-input"]?.retract()
        uni.hideKeyboard()
      },
      putChatInputContent(value){
        this.$refs["chat-input"]?.setContent(value)
      },
      uploadFileAndSendMsg({tempFiles}){
        // console.log(res, 'image');
        // console.log('this.uploadFileAndSendMsg res',res);
        tempFiles.forEach(async tempFile => {
          // console.log('tempFile~',tempFile);
          const {
            path:url,
            name,
            size
          } = tempFile;
          let {fileType} = tempFile
          if (!['image', 'video'].includes(fileType)) {
            fileType = 'file'
          }
          // console.log('fileType===>', fileType);
          // console.error('tempFile~~~~~~~~~', tempFile,size/1000/1024+'mb');
          const sizeMB = size/1000/1024
          if(fileType == 'image' && sizeMB > 2){
            return uni.showToast({
              title: '图片大小不能超过2mb',
              icon: 'none'
            });
          } else if(sizeMB > 100){
            return uni.showToast({
              title: '文件大小不能超过100mb',
              icon: 'none'
            });
          }
          
          const data = {};
          const fileInfo = {
            url,
            size,
            name
          };
          if(fileType == 'image'){
            const {width,height} = await uni.getImageInfo({src:url});
            fileInfo.width = width
            fileInfo.height = height
          }
          data[fileType] = fileInfo
          let msg = await this.beforeSendMsg(data,false)
          // console.log('~~~beforeSendMsg',msg);
          const uploadFileFn = async ()=>{
            const result = await uniCloud.uploadFile({
              filePath: tempFile.path,
              cloudPath: Date.now() + this.current_uid + '.' + name.split('.').pop(),
            });
            // console.log('result.fileID',result.fileID);
            msg.body.url = result.fileID
          }
          try{
            await uploadFileFn()
            this.sendMsg(msg)
          }catch(e){
            console.error('uploadFile error:',e)
            // 重发之前增加先上传图片的逻辑
            msg.__beforeRetriesAction = uploadFileFn
            msg.state = -200
          }
        });
      },
      async chooseFileSendMsg(type,_config={}) {
        // console.log('type',type);
        //先创建发送消息的
        let objFn = {
          'image':()=>{
            uni.chooseImage({
            	// count:9,
            	// sourceType,
            	// extension,
            	success:res=> beforeUploadFileAndSendMsg(res,'image'),
            	"fail":alertFail
            });
          },
          'video':()=>{
            uni.chooseVideo({
              sourceType: ['camera', 'album'],
              success:res=> beforeUploadFileAndSendMsg(res,'video'),
              "fail":alertFail
            });
          },
          'all':()=>{
            let chooseFile = uni.chooseFile;
            // #ifdef MP-WEIXIN
            chooseFile = wx.chooseMedia;
            // #endif
            chooseFile({
            	type: 'all',
            	// count:10,
              sourceType:['album','camera'],
            	"success":this.uploadFileAndSendMsg,
            	"fail":alertFail
            })
          }
        };
        objFn[type]();
        
        const _this = this;
        function beforeUploadFileAndSendMsg(res,fileType){
          // console.log(111,res)
          // 视频只能选择单文件，为了参数统一，这里转成数组
          if(fileType == 'video'){
            // #ifndef H5
            res.tempFile = {
              size: res.size,
              width: res.width,
              height: res.height
            }
            // #endif
            res.tempFile.path = res.tempFilePath
            res.tempFiles = [res.tempFile]
          }
          res.tempFiles.forEach(item=>{
            //如果没有type，默认为：用户选择的类型
            if(!item.fileType){
              item.fileType = fileType
            }
            // 如果没有name，默认为：用户id+随机数+时间戳生成一个
            if(!item.name){
             item.name = _this.current_uid + Math.random().toString(36).substr(2) + Date.now()
            }
          })
          // console.log(222,res)
          _this.uploadFileAndSendMsg(res)
        }
        function alertFail(res){
          console.error('res',res);
          // uni.showModal({
          //   content: JSON.stringify(res),
          //   showCancel: false
          // });
        }
        
      },
      sendSoundMsg(sound){
        this.beforeSendMsg({sound})
      },
      onInput(e) {
        // console.log('onInput',e.data);
        // #ifndef MP
        if(this.conversation.group_id && e.data == "@"){
          // 非小程序的群聊才支持@功能
          uni.hideKeyboard()
          this.showMenberList({
            confirm:userId=> {
              this.setCallAboutUid(userId)
            },
            filter:member=>!this.getCallUid().includes(member.users._id)
          })
        }
        // #endif
        // 成员列表内实现：在被显示时，监听输入框的输入，以实现搜索功能等
        this.$refs['member-list'].onChatInput(e)
      },
      intoTopic(msgId){
        this.$refs['msg-list'].intoTopic(msgId)
      },
      async setAnswerMsg(msgId) {
        this.answerMsg = this.conversation.msg.find(msgId)
        this.$refs["chat-input"]?.focus()
        const {from_uid} = this.answerMsg
        if (this.conversation.group && from_uid != this.current_uid) {
          this.setCallAboutUid(from_uid,false)
        }
      },
      async chatInputConfirm() {
        const $mr = this.$refs['member-list']
        if($mr.isShow && $mr.memberList.length){
          console.log('正在执行选中要@的人，不发送数据')
          return
        }
        if (typeof this.chatInputContent == 'object'){
          // 富文本（图文混排、@某人）消息
          const {data: htmlArray,uploadImg} = this.chatInputContent.getHtmlArray()
          // 先插到消息列表
          let msg = await this.beforeSendMsg({
            "rich-text": htmlArray
          },false)
					// 定义上传htmlArray中的图片的方法
					const uploadHtmlArrayImgFn = async ()=> await uploadImg(msg.body)
          try{
            await uploadHtmlArrayImgFn()
            // 执行发送
            this.sendMsg(msg)
          }catch(e){
						console.error('uploadImg error:',e)
            // 重发之前增加先上传图片的逻辑
            msg.__beforeRetriesAction = uploadHtmlArrayImgFn
            msg.state = -200
          }
          
        }else{
          // 把this.chatInputContent中的&nbsp;变成空格，再把头尾的空格去掉
          this.chatInputContent = this.chatInputContent.replace(/&nbsp;/g, ' ').trim()
          // 普通消息
          await this.beforeSendMsg()
        }
      },
      showMenberList(){
        this.$refs['member-list'].show(arguments[0])
      },
      async beforeSendMsg(param = {},_continue = true) {
        console.log('beforeSendMsg',{param});
        let msg = {
          type: 'text',
          to_uid: this.conversation.friend_uid,
          conversation_id: this.conversation.id,
          group_id: this.conversation.group_id,
          client_create_time: Date.now(),
          from_uid: this.current_uid,
          state: 0,
          body: this.chatInputContent,
          // 接收消息的appId，默认为当前应用的appId。如果你是2个不同appId的应用相互发，请修改此值为相对的appId
          appId: this.systemInfo.appId
        }
        // 根据传入的参数设置消息类型和内容
        for (let key in param) {
          if (param[key]) {
            msg.type = key
            msg.body = JSON.parse(JSON.stringify(param[key]))
          }
        }
        // 如果是文本类型需要做一些处理
        if (msg.type === 'text') {
          //清除空格
          msg.body = msg.body.trim();
          // 阻止发送空消息
          if (!msg.body.length) {
            this.resetChatInput()
            return uni.showToast({
              title: '不能发送空消息',
              icon: 'none'
            });
          }
        }

        //如果是回复某一条消息，需要带上相关id
        if (this.answerMsg !== false) {
          msg.about_msg_id = this.answerMsg._id
        }

        // 消息列表追加此消息。此时消息状态值为0，表示发送中
        msg = this.conversation.msg.add(msg)
        
        // 代码在，弹出的代码输入框，无需清空消息输入框内容
        if(msg.type !== 'code'){
          this.resetChatInput()
        }

        this.$nextTick(() => {
          this.showLast()
        })
        // console.error('sendMsg-sendMsg-sendMsg', msg);
        // 存到本地数据库
        // await this.conversation.msgManager.localMsg.add(msg)
        // console.log('msg被localMsg.add引用 会新增一个unique_id',msg)
        if(_continue){
          this.sendMsg(msg);
        }else{
          return msg;
        }
      },
      resetChatInput() {
        this.chatInputContent = ''
        // 关闭引用的消息
        this.answerMsg = false
      },
      getCallUid(){
        return this.chatInputContent?.aboutUserIds || []
      },
      sendMsg(msg, callback) {
        
        if(this.conversation.source){
          msg.chat_source = this.conversation.source
        }
        
        // console.log('sendMsg-sendMsg-sendMsg', msg);
        const uniImCo = uniCloud.importObject('uni-im-co', {
          customUI: true
        });
        
        // 检查内容不是包含 个推 两个字，有则 改成 个 + 零宽字符 + 推
        let tmpBody = JSON.stringify(msg.body)
        if(tmpBody.includes('个推')){
          msg.body = JSON.parse(tmpBody.replace(/个推/g,'个\u200b推'))
        }
        
        uniImCo.sendMsg(msg)
          .then(async e => {
            // console.log('uniImCo.sendMsg',{e,msg});
            msg.state = e.errCode === 0 ? 100 : -100
            msg.create_time = e.data.create_time
            msg._id = e.data._id
          })
          .catch(async e => {
            uni.showModal({
              content: e.message,
              showCancel: false,
              confirmText: '关闭',
            });
            console.error('uniImCo.sendMsg error:', e.errCode, e.message);
            // todo:必须要有create_time的值，否则indexDB通过创建时间索引找不到数据。后续会优化这个问题
            msg.state = -200,
            msg.create_time = Date.now()
          })
          .finally(e => {
            if (callback) {
              callback(e);
            }
          });
      },
      async retriesSendMsg(msg) {
        uni.showLoading({
          mask: true
        });
         msg.state = 0
        // 检查文件是否上传成功
        if(msg.__beforeRetriesAction){
          await msg.__beforeRetriesAction()
        }
        delete msg.__beforeRetriesAction
        // console.log('retriesSendMsg', msg);
        msg.isRetries = true
        this.sendMsg(msg, e => {
          uni.hideLoading();
        });
      },
      showLast(duration = 300) {
        let msgListRef = this.$refs['msg-list']
        if (msgListRef) {
          msgListRef.showLast(duration)
        }
      },
      onLongpressMsgAvatar(user_id){
        // 当前输入框已经@了的用户id 要过滤掉
        let callUidList = this.getCallUid()
        if(callUidList.includes(user_id)){
          console.log('此用户id已经@过');
          uni.showToast({
            title: '此用户已经@过',
            icon: 'none'
          });
        }else{
          this.$refs['chat-input'].raiseEditor = true
          this.$nextTick(()=>{
            this.setCallAboutUid(user_id,false)
          })
        }
      },
      setCallAboutUid(user_id,needDeleteLeftART = true) {
        // 拿到@之后为搜索用户的关键字长度，以便插入@的用户后删除关键字 (移动端搜索的关键词并不在消息输入栏)
        const keywordLength = this.isWidescreen ? this.$refs['member-list'].keyword.length : 0
        this.$refs['chat-input'].addCallUser({
          user_id,
          nickname: user_id == '__ALL' ? '所有人' : uniIm.users[user_id]?.nickname || '未知用户'
        },needDeleteLeftART,keywordLength)
      },
      async showControl({
        msgId,
        msgContentDomInfo
      }) {
        const msg = this.conversation.msg.find(msgId)
        let isSelf = msg.from_uid == this.current_uid
        this.$refs['msg-popup-control'].show({isSelf,msg,msgContentDomInfo})
      },
      shareMsg(msgList,merge = false) {
        console.error('msgList',msgList)
        if (this.isWidescreen) {
          this.$refs['share-msg'].open(msgList,merge)
        } else {
          uni.navigateTo({
            url: '/uni_modules/uni-im/pages/share-msg/share-msg',
            success: res => {
              res.eventChannel.emit('shareMsg', [msgList,merge])
            }
          })
        }
        this.chooseMoreMsg = false
      },
      tapUnreadCount() {
        //点击未读消息文字按钮事件
        uni.navigateBack();
      },
      updateNavTitle(){
        this.navTitle = this.conversation.title
        const group_id = this.conversation?.group_id
        if (group_id && group_id?.indexOf('__tmp') != 0) {
          this.navTitle += `（${this.conversation.group.member_count}）`
        }
        if(this.navTitle && !this.isWidescreen){
          uni.setNavigationBarTitle({
          	title: this.navTitle
          });
        }
      },
      clearUnreadCount(){
        if ( this.conversation.unread_count > 0) {
          this.conversation.clearUnreadCount();
        }
      }
    },
    onNavigationBarButtonTap(e) {
      if (e.index === 0) {
        if (this.conversation.group_id) {
          uni.navigateTo({
            url: "/uni_modules/uni-im/pages/group/info?conversation_id=" + this.conversation.id
          })
        } else {
          // console.log(this.conversation,6565);
          uni.navigateTo({
            url: `/uni_modules/uni-im/pages/chat/info?user_id=${this.conversation.friend_uid}&conversation_id=${this.conversation.id}`
          })
          // uni.showToast({
          // 	title: '仅群里可见，详细信息',
          // 	icon: 'none'
          // });
        }
      }
      // uni.navigateBack();
    }
  };
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
page {
  height: 100%;
}
.uni-im-chat {
  position: relative;
  height: 100%;
  width: 100%;
  flex: 1;
  background-color: #efefef;
  .msg-list {
    /* height: 1px; 覆盖掉 组件内的height：100%，使得flex-grow: 1作用在容器内被撑开*/
    height: 1px !important;
    flex-grow: 1;
  }
  
  .chat-foot,.disable-chat-foot{
    position: relative;
    flex-direction: column;
    border-top: 1rpx solid #BBBBBB;
    background-color: #F7F7F7;
  }
  
  .disable-chat-foot{
    padding: 20px;
    text-align: center;
    justify-content: center;
    color: #777777;
  }
  
  .answer-msg {
    padding: 2px 10px;
    background-color: #eee;
    border-radius: 3px;
    margin-bottom: 10px;
    flex-direction: row;
    align-items: center;
    ::v-deep .uni-icons {
      margin-left: 5px;
    }
    /* #ifdef H5 */
    .close-icon{
      cursor: pointer;
    }
    @media screen and (min-device-width:960px){
      margin: 5px;
      margin-bottom: -18px;
      top: 0;
    }
    /* #endif */
    .answer-msg-text {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: #333;
    }
  }
  
  /* #ifdef H5 */
  .vue-codemirror {
    position: fixed;
    top: 100px;
    left: 50%;
    width: 500px;
  }
  
  /* #endif */
  
  /* #ifdef H5 */
  .chat-foot {
    border: none;
  }
  /* #endif */
  
  /* #ifdef H5 */
  .unread_count {
    position: absolute;
    top: -30px;
    left: 70rpx;
    z-index: 10;
    background-color: #dfe2e9;
    padding: 0 14rpx;
    height: 14px;
    line-height: 14px;
    border-radius: 9px;
    color: #0c1013;
    font-size: 12px;
    margin-top: 3px;
  }
  /* #endif */
}
</style>