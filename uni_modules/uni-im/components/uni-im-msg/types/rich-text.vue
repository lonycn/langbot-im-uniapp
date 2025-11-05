<template>
  <view class="uni-im-rich-text"
    :class="{'isFromSelf':isFromSelf, 'only1u': trBody.length === 0 &&webInfoList.length === 1 , isSingeImg}">
		<template v-for="(item,index) in trBody" :key="index">
      <template v-if="item.name == 'span'">
        <text v-if="item.attrs && item.attrs.class == 'nickname'" class="text nickname"
          :class="{'pointer':canPrivateChat,'isCallMe':item.attrs.user_id == currentUid}"
          @click="privateChat(item.attrs.user_id)"
        >
          {{item.children[0].text}}
        </text>
        <text v-else class="text">
          {{item.children[0].text}}
        </text>
        <uni-im-icons class="text read-state" v-if="isFromSelf && 'isRead' in item" 
          :class="{isRead:item.isRead}" :code="item.isRead?'e609':'e741'"
          :size="item.isRead?'12px':'10px'" :color="item.isRead?'#25882a':'#bbb'"></uni-im-icons>
      </template>
      <text class="text" v-else-if="item.type == 'text'" :decode="true" space="ensp">{{trText(item.text)}}</text>
      <uni-im-img v-else-if="item.name == 'img'" :max-width="imgMaxWidth" @click="previewImage(item.attrs.src)"
        :src="item.attrs.src" :width="item.attrs.width" :height="item.attrs.height" mode="widthFix" class="img" />
			<template  v-else-if="item.name == 'a' && item.children && typeof(item.children[0]) === 'object'">
				<!-- 判断是否为应用内链接 -->
				<text class="app-link" @click="toAppLink(item.attrs.href)" v-if="isAppLink(item)">{{item.children[0].text}}</text>
				<uni-link v-else class="link" :href="item.attrs.href" color="#007fff" :text="item.children[0].text"></uni-link>
			</template>
     
    </template>


    <!-- <view class="web-info" v-for="(item,index) in webInfoList" :key="index">
        <view class="title-box">
          <image v-if="item.icon" :src="item.icon" mode="widthFix" class="web-icon" @error="item.icon = false" />
          <view v-if="item.title" class="title">{{item.title}}</view>
        </view>
        <view class="content">
          <view v-if="item.description" class="description">{{item.description}}</view>
          <image v-if="item.thumbnail" class="web-thumbnail" :src="item.thumbnail" mode="widthFix"
            @error="item.thumbnail = false" />
        </view>
        <view class="link-box" v-if="item.url">
          <uni-link class="link" :href="item.url" color="#007fff" :text="item.url"></uni-link>
          <uni-im-icons @click="copy(item.url)" class="copy" code="e67e"></uni-im-icons>
        </view>
      </view> -->
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import config from '@/uni_modules/uni-im/common/config.js';
  export default {
    props: {
      msg: {
        type: Object,
        default: () => {
          return {
            reader_list: [],
            body: []
          }
        }
      },
			imgMaxWidth: {
        type: [String, Number],
        default: '200px'
      }
    },
    data() {
      return {
        webInfoList: []
      }
    },
    async mounted() {
      // let aList = this.msg.body.filter(item => item.name == 'a')
      //                           // .filter(item => {
      //                           //   return item.attrs && item.attrs.href &&
      //                           //    item.attrs.href.includes('dcloud.net.cn') ||
      //                           //    item.attrs.href.includes('dcloud.io')
      //                           // })
      // // console.log('aList',aList)
      // for(let i = 0; i < aList.length; i++){
      //   const uniImCo = uniCloud.importObject("uni-im-co",{customUI:true})
      //   let res = await uniImCo.getWebInfo(aList[i].attrs.href)
      //   // console.log('getWebInfo',res.data)
      //   res.data.url = aList[i].attrs.href
      //   if(res.data.title){
      //     res.data.title = getStr(res.data.title, 60)
      //     res.data.description = getStr(res.data.description, 60)
      //   // // 取字符串的前20个字符，如果超出加...
      //    function getStr(str='', len) {
      //      if (str.length > len) {
      //        return str.substring(0, len) + "...";
      //      } else {
      //        return str;
      //      }
      //    }
      //     this.webInfoList.push(res.data)
      //   }
      // }
    },
    computed: {
      currentUid() {
        return uniIm.currentUser._id
      },
      isSingeImg() {
        return this.msg.body.filter(item => item.name != 'img' && item.text || item?.attrs?.class === "nickname" ).length === 0
      },
      imgList() {
        return this.msg.body.filter(item => item.name == 'img').map(item => item.attrs.src)
      },
      isFromSelf() {
        return this.msg.from_uid === this.currentUid
      },
      trBody() {
        if (
          this.webInfoList.length === 1 &&
          this.msg.body.filter(i => !(i.type === 'text' && i.text === ' ')).length === 1 &&
          this.webInfoList[0].url === this.msg.body[0].attrs.href
        ) {
          // 只有一个链接，且链接的地址和消息体的地址一样，则不显示消息体
          return []
        } else {
          return this.msg.body.map(node => {
            if (node.name == 'span' && node.attrs && node.attrs.class == 'nickname' && node.attrs.user_id) {
              // 改写/设置 nickname
              node.children = [{
                type: 'text',
                text: '@' + this.getNicknameByUid(node.attrs.user_id)
              }]
              if(node.attrs.user_id == '__ALL'){
                delete node.isRead
              }else{
                // 设置是否已读
                node.isRead = this.msg.reader_list ? this.msg.reader_list.find(item => item.user_id == node.attrs.user_id) : false
              }
            }
            return node
          })
        }
      },
      canPrivateChat() {
        if(this.uniIDHasRole('staff')){
          return true
        }
        const {conversation_id,from_uid} = this.msg
        const {group_member} = uniIm.conversation.find(conversation_id)
        return group_member ? group_member.find(from_uid)?.role.includes('admin') : false
      }
    },
    methods: {
      trText(str) {
        // TODO：临时方案，解决 \n 被转义的问题
        return str.replace(/\\n/g, "\\\\n")
      },
      getNicknameByUid(uid) {
        if(uid === "__ALL"){
          return "所有人"
        }
        return uniIm.users.getNickname(uid);
      },
      async previewImage(src) {
        const urls = []
        for (let i = 0; i < this.imgList.length; i++) {
          const url = await uniIm.utils.getTempFileURL(this.imgList[i])
          urls.push(url)
        }
        src = await uniIm.utils.getTempFileURL(src)
        uni.previewImage({
          urls,
          current: src
        })
      },
      copy(text) {
        uni.setClipboardData({
          data: text,
          success: () => {
            uni.showToast({
              title: '复制成功',
              icon: 'none'
            })
          }
        })
      },
      privateChat(user_id) {
        if (this.canPrivateChat &&  user_id != '__ALL') {
          uniIm.toChat({
            user_id,
            source:{
              group_id: this.msg.group_id
            }
          })
        }
      },
			isAppLink(item){
				// console.log('config.domain',config.domain)
				// console.error(item.attrs.href.split('?'))
				// 判断是否为应用内链接
				return item.attrs.href.indexOf(config.domain) === 0
			},
			toAppLink(url){
				// 拿到链接的参数
				const params = url.split('?')[1]
				// 拿到链接的路径
				let path = url.split('?')[0].split(config.domain + '/#/')[1]
				console.log('path',path)
				if (path === ''){
					path = '/uni_modules/uni-im/pages/index/index'
				}
				// 跳转到对应的页面
				uni.redirectTo({
					url: path + '?' + params,
					fail: (err) => {
						console.log('跳转失败',err)
					}
				})
				
			}
    }
  }
</script>

<style lang="scss">
.uni-im-rich-text {
  // todo: 由于web端首页引入的sass热更新不能影响组件样式，导致baseStyle.scss的样式使用了 deep，导致这里需要加 !important
  display: inline-block!important;
  background-color: #fff;
  padding:5px 10px;
  border-radius: 10px;
  max-width: 100%;
  &.isFromSelf {
    background-color: #c9e7ff;
  }
  /* #ifdef H5 */
  @media screen and (min-device-width:960px) {
    .img {
      max-width: 480px !important;
    }
  }
  .pointer {
    cursor: pointer !important;
  }
  /* #endif */
  
  .text {
    word-break: break-all;
    cursor: text;
    /* #ifdef H5 */
    @media screen and (min-device-width:960px){
      user-select: text;
    }
    /* #endif */
  }
  
  .app-link,.link {
    display: inline;
    user-select: all;
    margin: 0 2px;
    word-break: break-all;
  }
	.app-link {
		color: #0080ff;
		// 加下划线
		text-decoration: underline;
	}
  
  .only1u {
    padding: 0;
    .web-info {
      margin-top: 0;
    }
  }
  
  .img {
    margin: 5px 0 !important;
    /* #ifdef H5 */
    display: block !important;
    box-shadow: #eee 0 0 5px;
    cursor: pointer;
    /* #endif */
  }
  
   .nickname {
    color: #0b65ff;
    padding: 1px 4px;
    font-size: 14px;
  }
  .isCallMe {
    color: #FFF;
    background-color: #0080ff;
    border-radius: 5px;
    margin-right: 4px;
  }
  
   .read-state {
    position: relative;
    top: -5px;
    
  }
  
  .isSingeImg {
    background-color: transparent !important;
    padding: 0;
  }
  
  .web-info {
    background-color: #FFF;
    padding: 10px;
    border-radius: 10px;
    margin-top: 10px;
    border: 1px solid #eee;
    .title-box {
      flex-direction: row;
      .web-icon {
        width: 16px;
        height: 16px;
        margin: 4px 5px 0 0;
      }
    }
    .title {
      font-size: 16px;
      flex: 1;
      font-weight: bold;
    }
    .content {
      flex-direction: row;
      .description {
        font-size: 14px;
        color: #666;
        margin-top: 5px;
        flex: 1;
        beak-word: break-all;
      }
      .web-thumbnail {
        height: 100px;
        width: 100px;
        margin: 5px;
      }
    }
    .link-box {
      flex-direction: row;
      border-top: 1px solid #eee;
      padding-top: 5px;
      justify-content: space-between;
      align-items: flex-end;
      .link {
        font-size: 12px;
        // 不会换行
        white-space: nowrap;
        flex: 1;
        overflow: hidden;
      }
      .copy {
        opacity: 0.5;
        margin-left: 20px;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>