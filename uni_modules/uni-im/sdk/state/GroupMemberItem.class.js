import $state from '@/uni_modules/uni-im/sdk/state/index.js';
export default class GroupMemberItem {
	constructor(data) {
		Object.assign(this, data)
		this.users = $state.users[this.users._id]
	}
}