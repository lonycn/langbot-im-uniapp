import CloudData from '@/uni_modules/uni-im/sdk/ext/CloudData.class.js'
import $state from '../state/index.js';
const dbJQL = uniCloud.databaseForJQL()
const dbJQLCommand = dbJQL.command
const $ = dbJQL.command.aggregate
export default class Friend extends CloudData {
  __beforeAdd(friendList) {
    // 将好友信息存储到users中
    friendList.forEach(item => $state.users[item._id] = item)
    return friendList
  }
  async __get(param = {}) {
    const {friend_uid} = param
    const limit = this.loadLimit
    let whereString = '"user_id" == $cloudEnv_uid'
    if (friend_uid) {
      whereString += `&& "friend_uid" == "${friend_uid}"`
      // console.log('whereString',whereString);
    }
    let res = await dbJQL.collection(
        dbJQL.collection('uni-im-friend').where(whereString).field('friend_uid,mark,class_name')
        .getTemp(),
        dbJQL.collection('uni-id-users').field('_id,nickname,avatar_file,realname_auth').getTemp()
      )
      .limit(limit)
      .get()
    const usersList = res.data.map(item => item.friend_uid[0])
    $state.users.merge(usersList.reduce((obj, item) => {
      obj[item._id] = item
      return obj
    }, {}))
    return usersList 
  }
  remove(friend_uid) {
    let friendList = $state.friend.dataList
    let index = friendList.findIndex(i => i._id == friend_uid)
    friendList.splice(index, 1)
  }
}