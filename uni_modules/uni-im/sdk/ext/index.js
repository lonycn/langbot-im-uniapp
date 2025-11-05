import $state from '@/uni_modules/uni-im/sdk/state/index.js';
import {mutations as uniIdMutations} from '@/uni_modules/uni-id-pages/common/store.js';
export default {
  toChat(param) {
    if ($state.isWidescreen) {
      uni.$emit('uni-im-toChat', param)
    } else {
      let url = '/uni_modules/uni-im/pages/chat/chat?'
      for (let key in param) {
        let value = param[key]
        if (typeof value === 'object') {
          value = decodeURIComponent(JSON.stringify(value))
        }
        url += key + '=' + value + '&'
      }
      uni.navigateTo({url,animationDuration: 300})
    }
  },
	async login(param) {
		const uniImCo = uniCloud.importObject("uni-im-co")
		const res = await uniImCo.login(param)
		if (res.errCode) {
			return uni.showModal({
				content: JSON.stringify(res),
				showCancel: false
			});
		}
		uniIdMutations.loginSuccess({
			autoBack: false,
			showToast: false
		})
		return res
	},
	async logout() {
		await uniIdMutations.logout()
	}
}