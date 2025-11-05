<template>
  <image @load="load" :src="url" :mode="mode" :style='{"width":viewWidth,"height":viewHeight,borderRadius}' @click="handleClick"></image>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';
import config from '@/uni_modules/uni-im/common/config.js';
  export default {
    emits: ['click'],
    props: {
      src: {
        type: String,
        default: ''
      },
      mode: {
        type: String,
        default: ''
      },
      maxWidth: {
        type: [String,Number,Boolean],
        default: false
      },
      maxHeight: {
        type: [String,Number],
        default: ''
      },
      width: {
        type: [String,Number],
        default: ''
      },
      height: {
        type: [String,Number],
        default: ''
      },
      borderRadius: {
        type: [String,Number],
        default: ''
      }
    },
    data() {
      return {
        url: '',
        viewWidth: '',
        viewHeight: ''
      }
    },
    mounted() {
      // console.log('beforeCreate')
      if( this.width && this.height){
        // 根据maxWidth 和 maxWidth，在保持宽高比例不变的情况下 计算viewWidth 和 viewHeight
        const maxWidth = this.toPx(this.maxWidth)
        const maxHeight = this.toPx(this.maxHeight)
        let width = this.toPx(this.width)
        let height = this.toPx(this.height)
        
        // 如果宽超过最大宽度，高度按比例缩小
        if(width > maxWidth){
          height = height * maxWidth / width
          width = maxWidth
        }
        // 如果高超过最大高度，宽度按比例缩小
        if(height > maxHeight){
          width = width * maxHeight / height
          height = maxHeight
        }
        this.viewWidth = width + 'px'
        this.viewHeight = height + 'px'
      }
    },
    watch: {
       src:{
        async handler(src) {
          if(src){
            // 判断是否为base64 blob ./ / @/开头的本地图片
            if(src.indexOf('blob:') === 0 || src.indexOf('./') === 0 || src.indexOf('/') === 0 || src.indexOf('@/') === 0){
              this.url = src
              return
            }
            
            this.url = await uniIm.utils.getTempFileURL(src)
            // 文件存储的服务商
            const {provider} = config.cloudFile
						const maxWidth = this.maxWidth ? this.toPx(this.maxWidth) : '400'
            switch(provider){
              case 'aliyun':
                this.url += `?x-oss-process=image/resize,w_${maxWidth}/quality,q_80`
                break
              case 'tencent':
                this.url += `?imageMogr2/thumbnail/${maxWidth}x${maxWidth}>`
                break
              case 'qiniu':
                this.url += `?imageMogr2/thumbnail/${maxWidth}x${maxWidth}>`
                break
            }
            
          }
        },
        immediate: true
      }
    },
    methods: {
      load(e){
        // console.log('img load',e)
        // TODO：渲染后再设置宽高，为兼容旧版系统，图片消息中没有带宽高的情况
        if(!this.width || !this.height){
          let width = e.detail.width
          let maxWidth = this.toPx(this.maxWidth)
          if(maxWidth && width > maxWidth){
            this.viewWidth = maxWidth + 'px'
            this.viewHeight = maxWidth * e.detail.height / e.detail.width + 'px'
            // console.error('超了',this.width,this.height)
          }else{
            this.viewWidth = e.detail.width + 'px'
            this.viewHeight = e.detail.height + 'px'
          }
        }
      },
      handleClick(event){
        this.$emit('click',event)
      },
      // 如果是rpx单位，转换为px
      toPx(val){
        if(typeof val === 'string' && val.indexOf('rpx') > -1){
          return parseInt(val) * uniIm.systemInfo.windowWidth / 750
        }
        return parseInt(val)
      }
    }
  }
</script>

<style>
</style>
