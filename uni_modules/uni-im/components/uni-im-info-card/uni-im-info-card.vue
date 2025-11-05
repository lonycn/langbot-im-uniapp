<template>
  <view class="info-card" :class="{link}" @click="$emit('click')">
    <slot name="left"></slot>
    <view class="avatar-box">
      <image class="avatar" :src="avatarUrl || avatarFileUrl" mode="widthFix"></image>
      <slot name="avatar-overlay-list"></slot>
    </view>
    <view class="main">
      <view class="row">
        <text class="title">{{title}}</text>
        <view class="tag-box">
          <view class="tag" v-for="(tag,index) in tags" :key="tag">{{tag}}</view>
        </view>
        <view class="time" v-if="time">{{time}}</view>
      </view>
      <view class="row">
        <view class="note-box">
          <text class="red-note">{{redNote}}</text>
          <text class="note">{{note}}</text>
        </view>
        <view class="state">
          <image v-if="mute" class="mute" mode="widthFix" src="@/uni_modules/uni-im/static/mute.png"/>
          <image v-if="is_star" class="star" mode="widthFix" src="@/uni_modules/uni-im/static/star.png"/>
          <template v-if="badge">
            <view v-if="mute || badge == 'dot'" class="red-point"></view>
            <view v-else class="badge">{{badge > 99 ? '99+' : badge}}</view>
          </template>
        </view>
      </view>
    </view>
    <image v-if="pinned" class="pinned" mode="widthFix" src="@/uni_modules/uni-im/static/pinned.png">
    </image>
    <slot></slot>
    <slot name="right"></slot>
  </view>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    emits: ['click'],
    props: {
      avatarUrl: {
        type: String,
        default: ''
      },
			avatarFile: {
				type: Object,
				default: () => {}
			},
      title: {
        type: String,
        default: ''
      },
      tags: {
        type: Array,
        default: () => []
      },
      time: {
        type: String,
        default: ''
      },
      note: {
        type: String,
        default: ''
      },
      badge: {
        type: [String,Number],
        default: 0
      },
      mute: {
        type: Boolean,
        default: false
      },
      pinned: {
        type: Boolean,
        default: false
      },
      redNote: {
        type: String,
        default: ''
      },
      link: {
        type: Boolean,
        default: false
      },
      is_star: {
        type: Boolean,
        default: false
      }
    },
    computed: {
    },
    data() {
      return {
				avatarFileUrl: '/uni_modules/uni-im/static/avatarUrl.png'
      }
    },
		watch: {
			avatarFile: {
				async handler(avatarFile) {
					if (avatarFile?.url) {
						this.avatarFileUrl = await uniIm.utils.getTempFileURL(avatarFile.url);
					}
				},
				immediate: true,
				deep: true
			}
		},
    methods: {}
  }
</script>

<style lang="scss">
  // 限制只能一行，超出显示省略号
  @mixin ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .info-card {
    position: relative;
    padding:10px 12px;
    flex-direction: row;
    &::after {
      content: "";
      position: absolute;
      left: 50px;
      right: 0;
      bottom: 0;
      height: 1px;
      transform: scaleY(0.1);
      background-color: #eee;
    }
    /* #ifdef H5 */
    @media screen and (min-device-width:960px){
      ::after {
        display: none;
      }
    }
    &.link{
      cursor: pointer;
      &:hover {
        background-color: #f0f0f0;
      }
    }
    /* #endif */
    .avatar-box{
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 5px;
      overflow: hidden;
      .avatar {
       width: 100%;
       height: 100%;
			 background-color: #f0f0f0;
      }
    }
    .main {
      flex-grow: 1;
      justify-content: space-around;
      overflow: hidden;
      margin-left: 5px;
      flex-shrink: 1;
      .row {
        flex-direction: row;
        align-items: center;
        // min-height: 20px;

        .title {
          font-size: 14px;
          color: #333;
          @include ellipsis;
        }

        .tag-box {
          transform: scale(0.8);
          margin-right: 5px;

          .tag {
            word-break: keep-all;
            font-size: 12px;
            color: #1a6dfe;
            border: 1px solid #1a6dfe;
            border-radius: 2px;
            padding: 0 2px;
          }
        }

        .time {
          // 不换行
          white-space: nowrap;
          font-size: 10px;
          color: #999;
          margin-left: auto;
        }

        .state {
          margin-left: auto;
          flex-direction: row;
          align-items: center;

          .red-point {
            width: 8px;
            height: 8px;
            background-color: #f00;
            border-radius: 50%;
            margin-left: 2px;
          }

          .star,.mute {
            width: 12px;
            height: 12px;
            opacity: 0.5;
          }

          .badge {
            transform: scale(0.9);
            font-size: 12px;
            color: #fff;
            background-color: #f00;
            border-radius: 10px;
            min-width: 16px;
            min-height: 16px;
            padding: 0 5px;
            justify-content: center;
            align-items: center;
            margin:0 2px;
            align-self: flex-end;
          }
        }

        .note-box {
          flex-direction: row;
          overflow: hidden;
          align-items: center;
          flex-shrink: 1;

          .red-note {
            font-size: 12px;
            white-space: nowrap;
            color: #f00;
            margin-right: 3px;
          }

          .note {
            font-size: 14px;
            color: #aaa;
            @include ellipsis;
          }
        }
      }
    }

    .pinned {
      position: absolute;
      right: 3px;
      top: 3px;
      width: 8px;
      height: 8px;
    }
  }
</style>