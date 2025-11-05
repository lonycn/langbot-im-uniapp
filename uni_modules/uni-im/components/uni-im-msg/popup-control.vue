<template>
	<view v-if="isShow" :style="{opacity}" class="popup-control">
		<view class="control-mark" @touchstart.prevent="closeMe" @click="closeMe">
		</view>
		<view ref="content" class="content" :style="{top:controlData.top,left:controlData.left,right:controlData.right}">
      <template v-for="(item,index) in controlList">
        <view :key="index" class="control-item" v-if="typeof item.canDisplay == 'function' ? item.canDisplay() : item.canDisplay " @click="item.action">
        	<uni-im-icons v-if="item.icon" :code="item.icon" size="16" color="#FFF"></uni-im-icons>
        	<text class="control-item-text">{{item.title}}</text>
        </view>
      </template>
		</view>
    <view class="icon" :class="{isInTop:controlData.isInTop}" :style="{right:iconBoxRight,left:iconBoxLeft,top:controlData.top}"></view>
	</view>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	export default {
		data(){
			return {
        controlList:[],
				isShow:false,
				controlData: {
					top:'',
          bottom:'',
					left:'unset',
					right:'unset',
					width:'',
					msg:{},
          msgContentDomInfo:{},
					isInTop:false
				},
        opacity:0
			}
		},
		computed: {
			...uniIm.mapState(['isWidescreen']),
			iconBoxLeft(){
        if(this.controlData.left != 'unset'){
          const {left:mLeft,width:mWidth} = this.controlData.msgContentDomInfo
          return mLeft + mWidth/2 + 'px'
        }else{
          return ''
        }
			},
			iconBoxRight(){
        if(this.controlData.right != 'unset'){
          const {left:mLeft,right:mRight,width:mWidth} = this.controlData.msgContentDomInfo
          const metrics = uniIm.utils.getScreenMetrics()
          return metrics.pageWidth - mRight + mWidth/2 + 'px'
        }else{
          return ''
        }
			}
		},
		mounted() {},
		methods:{
      chooseMore(){
        this.$emit('chooseMore',[this.controlData.msg])
      },
      share(e){
        this.$emit('share',[this.controlData.msg])
      },
      initControlList(msg){
        this.controlList = [
          {
            title:'回复',
            action:()=>this.answer(),
            canDisplay:msg._id != undefined,// 只有发送成功的消息才能回复
          },
          {
            title:'复制',
            action:()=>this.copyContent(),
            canDisplay: (uniIm.systemInfo.uniPlatform === "web" && ["userinfo-card","rich-text","image"].includes(msg.type) || msg.type == 'text' ),
          },
          {
            title:'撤回',
            action:()=>this.revokeMsg(),
            canDisplay:this.canRevoke,
          },
          // {
          //   title:'删除',
          //   action:()=>this.deleteMsg(),
          //   canDisplay:msg._id != undefined, 
          // },
          {
            title:'转发',
            action:()=>this.share(),
            canDisplay: msg._id != undefined,
          },
          {
            title:'多选',
            action:()=>this.chooseMore(),
            canDisplay: msg._id != undefined,
          },
          {
            title:'进入话题',
            action:()=> this.$emit('intoTopic', msg._id),
            canDisplay: this.isWidescreen
          }
        ]
        
        // 拿到扩展点的数据
        let extensionsControlList = uniIm.extensions.invokeExts('msg-popup-controls',msg)
        this.controlList = this.controlList.concat(...extensionsControlList)
        
        this.controlList.map(item=>{
          const oldAction = item.action
          item.action = ()=>{
            this.isShow = false
            oldAction()
          }
        })
      },
      async show({isSelf,msg,msgContentDomInfo}){
        this.initControlList(msg)
        // 先显示出来，设置透明度为0，拿到宽度，再设置透明度为1
        this.opacity = 0
        this.controlData.msg = msg
        this.isShow = true
        await this.$nextTick()
        // #ifdef H5
        // 当蒙版弹出，鼠标右键就关闭msg-popup-control
        const popupControl = document.querySelector('.popup-control')
        popupControl.addEventListener('contextmenu',(e) => {
          if(this.isShow && this.isWidescreen){
            this.isShow = false
          }
          e.preventDefault()
        })
        // #endif
        
        const controlData = {
          msgContentDomInfo,
          msg,
          isInTop: false
        }
        
        const query = uni.createSelectorQuery().in(this);
        await new Promise(resolve => {
          query.selectAll('.content').boundingClientRect(data => {
            controlData.width = data[0].width + 'px'
            resolve()
          }).exec();
        })
        
        // console.error('controlData.width',controlData.width)
        
        let metrics = uniIm.utils.getScreenMetrics()
        if (isSelf) {
          controlData.left = 'unset'
          const metrics = uniIm.utils.getScreenMetrics() 
          // console.log('msgContentDomInfo',msgContentDomInfo)
          controlData.right = metrics.pageWidth - msgContentDomInfo.right + msgContentDomInfo.width/2 - parseInt(controlData.width)/2 + 'px'
        } else {
          controlData.left = msgContentDomInfo.left + msgContentDomInfo.width / 2 - parseInt(controlData.width)/2 + 'px'
          controlData.right = 'unset'
        }
        
        controlData.isInTop = msgContentDomInfo.top > 60
        if (controlData.isInTop) {
          // #ifdef H5
          let n = -20
          // #endif
          // #ifndef H5
          let n = -65
          // #endif
          controlData.top = msgContentDomInfo.top + n + 'px'
        } else {
          // #ifdef APP
          let n = 8
          // #endif
          // #ifdef H5
          let n = 55
          // #endif
          // #ifdef MP
          let n = 10
          // #endif
          controlData.top = msgContentDomInfo.bottom + n + 'px'
        }
        
        
        if(parseInt(controlData.right) < 60){
          controlData.right = '60px'
        }
        if(parseInt(controlData.left) < msgContentDomInfo.left){
          controlData.left = msgContentDomInfo.left + 'px'
        }
        
        // console.error('dddddddta',controlData)
				this.controlData = controlData
        this.$nextTick(()=>{
          this.opacity = 1
        })
			},
			async copyContent(){
        let data = ''// 需要复制的数据
        const msgBody = this.controlData.msg.body
        const action = {
          text(){
            data = msgBody
          },
          'userinfo-card'(){
            data = location.origin + '/#/?user_id='+msgBody.user_id
          },
          // #ifdef H5
          async image(){
            let url = msgBody.url
            url = await uniIm.utils.getTempFileURL(url)
            fetch(url).then(response => response.blob()).then(blob => {
              let mime = blob.type
              let file = new File([blob], mime.replace('/', '.'), { type: mime })
              let clipboardItem = new ClipboardItem({ [mime]: file })
              navigator.clipboard.write([clipboardItem])
            })
          },
          async 'rich-text'(){
            let html = ""
            for(let i of msgBody){
              if(i.name == 'img'){
                const url = await uniIm.utils.getTempFileURL(i.attrs.src)
                html += `<img src="${url}">`
              }else if(i.name == 'a'){
                html += `<a href="${i.attrs.href}">${i.children[0].text}</a>`
              }else{
                html += i.text
              }
            }
            data = html
            // 把data写到剪切板
            // 将HTML字符串转换为ArrayBuffer，确保UTF-8编码
            const encoder = new TextEncoder();
            const htmlArrayBuffer = encoder.encode(html);
            // 创建一个包含HTML内容的ClipboardItem
            const clipboardItem = new ClipboardItem({
              'text/html': new Blob([htmlArrayBuffer], { type: 'text/html' }),
            });
            data = clipboardItem
            // 尝试将ClipboardItem写入剪切板
            try {
              await navigator.clipboard.write([clipboardItem]);
              // console.log('HTML内容已写入剪切板');
            } catch (err) {
              console.error('写入剪切板失败: ', err);
            }
          }
          // #endif
        }
        await action[this.controlData.msg.type]?.()

				if(typeof data === 'string'){
          uni.setClipboardData({
          	data,
          	complete:(e)=> {
          		uni.hideToast()
          		// console.log(e);
          	}
          })
        }else{
          // console.log('非字符串',data);
        }
			},
			canRevoke() {
				let current_uid = uniIm.currentUser._id
				let {group_id,from_uid,conversation_id,create_time} = this.controlData.msg || {}
				// console.log('create_time',create_time,'group_id',group_id);
				// console.log('from_uid current_uid',this.controlData.msg,from_uid,current_uid);
        // console.log('this.controlData.msg.state',this.controlData.msg);

        //自己发的，状态 不是发送成功不能撤回 （发送成功的数据才有_id）
        if(!this.controlData.msg._id){
          return false
        }
        
        if(this.uniIDHasRole('uni-im-admin')){
          // 如果是管理员
          return true
        }
        
				let isGroupAdmin = false
				if(group_id){
					let conversation = uniIm.conversation.find(conversation_id)
					isGroupAdmin = conversation.group.user_id == current_uid
				}
				// console.log('isGroupAdmin',isGroupAdmin);
				// 如果是群主
				if(isGroupAdmin){
					return true
				}
        
        // 以上都不是，这需要是消息的发送者，且消息创建时间小于2分钟
        return from_uid == current_uid && ( Date.now() - create_time < 1000*60*2 )
			},
			async revokeMsg(){
				// 再判断一遍防止，分钟在2分钟的时候右键了，然后到了第3分钟才点下的情况
				if(this.canRevoke()){
					const {conversation_id,_id:msg_id} = this.controlData.msg
          uniIm.conversation.find(conversation_id).revokeMsg(msg_id)
				}else{
					uni.showToast({
						title: '已超过2分钟，不能撤回',
						icon: 'none'
					});
				}
				// console.log('this.controlData.msg',this.controlData.msg);
			},
			async answer(){
				// console.log('answer')
				this.$emit('answer',this.controlData.msg._id)
				
			},
			async deleteMsg(){
				// #ifndef H5
				return this.other()
				// #endif
				this.controlData.msg.is_delete = true
				// 存到本地
				let conversation = await uniIm.conversation.get(this.controlData.msg.conversation_id)
				// conversation.msgManager.localMsg.update(this.controlData.msg.unique_id,this.controlData.msg)
				
			},
			other(){
				uni.showToast({
					title: '暂不支持',
					icon: 'none'
				});
			},
			closeMe(evt){
				// 触摸屏忽略 click 事件
				if (uniIm.isTouchable && evt.type === 'click') return
				this.isShow = false
			}
		}
	}
</script>

<style lang="scss">
.popup-control {
  .content{
  	background-color:#252a30;
  	height: 55px;
  	// width: 375rpx;
  	position:fixed;
  	top:0;
  	border-radius: 5px;
  	flex-direction: row;
  	justify-content: space-around;
  	align-items: center;
    z-index: 10;
  }
  .control-item{
  	padding: 0 15px;
  	justify-content: center;
  	align-items: center;
  }
  .control-item-text{
  	font-size: 12px;
  	color:#FFFFFF;
  	margin-top: 1px;
  	/* #ifdef H5 */
  	cursor: pointer;
  	/* #endif */
  }
  /* #ifdef H5 */
  .control-item-text:hover{
  	color:#c9e7ff;
  }
  /* #endif */
  .control-mark{
  	position: fixed;
  	top: 0;
  	left: 0;
  	width: 100vw !important;
  	height: 100vh !important;
  	z-index: 9;
  	background-color: rgba(0,0,0,0.1);
  }
  
  .icon {
    position: fixed;
  	transform:translate(0,-5px) rotate(45deg);
    background-color: #252a30;
    width: 10px;
    height: 10px;
    z-index: 9;
  }
  
  .isInTop{
  	transform:translate(0,50px) rotate(45deg);
  }
  
  /* #ifdef H5 */
  @media screen and (min-device-width:960px){
  	.control-mark {
  		background-color: rgba(255,255,255,0.05);
  	}
  }
  /* #endif */
}
</style>