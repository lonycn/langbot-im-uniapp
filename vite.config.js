import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import cementingPlugin from './rollup-plugin-uniapp-cementing.js'

export default defineConfig({
  plugins: [
    cementingPlugin({
      // 需要静态化的页面路径（支持通配符*）
      include: [
        '**/uni-im-conversation.vue',
        './uni_modules/uni-im/components/uni-im-msg/uni-im-msg.vue',
        './uni_modules/uni-im/components/uni-im-msg/msg-content.vue',
        './uni_modules/uni-im/pages/chat/info.vue'
      ],
      components: {
        // 声明组件，格式 {"$组件名":{"$cementing":"$组件路径"}}
        MsgByType: {
          msgUserCard: '@/uni_modules/uni-im/components/uni-im-msg/types/userinfo-card.vue',
          msgVideo: '@/uni_modules/uni-im/components/uni-im-msg/types/video.vue',
          msgFile: '@/uni_modules/uni-im/components/uni-im-msg/types/file.vue',
          msgHistory: '@/uni_modules/uni-im/components/uni-im-msg/types/history.vue',
          msgRichText: '@/uni_modules/uni-im/components/uni-im-msg/types/rich-text.vue',
          msgCode: '@/uni_modules/uni-im/components/uni-im-msg/types/code.vue',
          msgText: '@/uni_modules/uni-im/components/uni-im-msg/types/text.vue',
          msgSound: '@/uni_modules/uni-im/components/uni-im-msg/types/sound.vue',
          msgImage: '@/uni_modules/uni-im/components/uni-im-msg/types/image.vue',
        },
        MsgExtra: {
          UniImMsgReader: '@/uni_modules/uni-im-msg-reader/components/uni-im-msg-reader/uni-im-msg-reader.vue',
        }
      },
      debug: true
    }),
    uni(),
  ],
  build:{target: 'es2015'},
});