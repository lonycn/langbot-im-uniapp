<template>
  <view class="text selfText sound-box" :class="{reverse:!self}" :style="{width:soundBoxWidth}" @click="playSound">
    <text class="sound-time">
      {{ msg.body.time }}''
    </text>
    <view class="sound-icon-box" :class="{rotate:!self}">
      <image v-if="soundPlayState" src="@/uni_modules/uni-im/static/sound-ing.gif" style="width: 18px;height: 18px;"
        mode="widthFix" />
      <uni-im-icons v-else :class="{'sound-icon-active':soundPlayState}" code="e6f5" size="18px" color="#000000" />
    </view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    data() {
      return {
        soundPlayState: 0
      }
    },
    props: {
      msg: {
        type: Object,
        default () {
          return {
            from_uid: '',
            body: {
              time: 0
            }
          }
        }
      },
      soundBoxWidth: {
        type: String,
        default: '100px'
      }
    },
    computed: {
      self() {
        return this.msg.from_uid === uniIm.currentUser._id
      }
    },
    destroyed() {
      // console.log('unmounted');
			if(this.isInit){
				const audioContext = uniIm.audioContext
				audioContext.offPlay(this.onPlay);
				audioContext.offPause(this.soundPlayEnd);
				audioContext.offStop(this.soundPlayEnd);
				audioContext.offEnded(this.soundPlayEnd);
				audioContext.offError(this.soundPlayEnd);
			}
    },
    methods: {
			init(){
				if (this.isInit) {
				  return
				}
				// console.log('----init');
				const audioContext = uniIm.audioContext
				this.onPlay = async () => {
				  // console.log('soundPlayStart------------------',this.msg.body);
				  const currentAudioUrl = await uniIm.utils.getTempFileURL(this.msg.body.url)
				  if (audioContext.src == currentAudioUrl) {
				    this.soundPlayState = 1
				  } else {
				    this.soundPlayState = 0
				  }
				}
				audioContext.onPlay(this.onPlay);
				this.soundPlayEnd = () => {
				  // console.log('soundPlayEnd------------------');
				  this.soundPlayState = 0
				}
				audioContext.onPause(this.soundPlayEnd);
				audioContext.onStop(this.soundPlayEnd);
				audioContext.onEnded(this.soundPlayEnd);
				audioContext.onError(this.soundPlayEnd);
				this.isInit = true
			},
      async playSound() {
				this.init()
				const audioContext = uniIm.audioContext
        audioContext.src = await uniIm.utils.getTempFileURL(this.msg.body.url)
        // 下一个事件循环执行
        setTimeout(() => {
          // console.log(78998797,audioContext);
          if (this.soundPlayState === 1) {
            // console.log('播放中，执行关闭');
            audioContext.stop()
          } else {
						// console.log('未播放中，执行播放');
            audioContext.stop()
            audioContext.play();
          }
        }, 0)
      }
    }
  }
</script>

<style lang="scss">
.sound-box {
  /* #ifdef H5 */
  cursor: pointer !important;
  /* #endif */
  flex-direction: row;
  background-color: #94EB6A;
  height: 44px;
  padding: 10px;
  width: 66px;
  border-radius: 5px;
  justify-content: flex-end;
  align-items: center;
  
  &.reverse {
    flex-direction: row-reverse;
  }
  
  .sound-time {
    font-size: 14px;
    margin: 0 4px;
  }
  
  .sound-icon-box {
    width: 18px;
    height: 18px;
    justify-content: center;
  }
  .rotate {
    transform: rotate(180deg);
  }
  .sound-icon-active {
    transform: option;
    opacity: 10;
    background-color: #007AFF;
    transition-property: background-color;
    transition-duration: 0.3s;
    transition-delay: 0.1s;
    transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  }
}
</style>