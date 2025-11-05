import GroupMember from '@/uni_modules/uni-im/sdk/state/GroupMember.class.js'
export default class GroupItem {
  constructor(data){
    for (let key in data) {
      this[key] = data[key]
    }
    this.member = new GroupMember({group_id:this._id})
  }
}