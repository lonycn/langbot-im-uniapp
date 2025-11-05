import $state from '../state/index.js';
const db = uniCloud.database();
export default {
  get() {
    return $state.friend.dataList
  },
  async loadMore({
    friend_uid
  } = {}) {
    const limit = 1000
    let whereString = '"user_id" == $cloudEnv_uid'
    if (friend_uid) {
      whereString += `&& "friend_uid" == "${friend_uid}"`
      // console.log('whereString',whereString);
    }
    let res = await db.collection(
        db.collection('uni-im-friend').where(whereString).field('friend_uid,mark,class_name')
        .getTemp(),
        db.collection('uni-id-users').field('_id,nickname,avatar_file,realname_auth').getTemp()
      )
      .limit(limit)
      .get()
    let data = res.result.data
    // console.log('data',data);
    data.forEach((item, index) => {
      data[index] = item.friend_uid[0]
      let uid = data[index]._id
      if (!$state.users[uid]) {
        $state.users[uid] = item.friend_uid[0]
      }
    })
    $state.friend.hasMore = data.length == limit
    $state.friend.dataList.push(...data)
  },
  remove(friend_uid) {
    let friendList = $state.friend.dataList
    let index = friendList.findIndex(i => i._id == friend_uid)
    friendList.splice(index, 1)
  }
}
