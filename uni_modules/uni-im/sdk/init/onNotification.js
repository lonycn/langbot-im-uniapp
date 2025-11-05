import $state from '@/uni_modules/uni-im/sdk/state/index.js';
const current_uid = $state.currentUser._id
export default res => {
  res.data.create_time = Date.now()
  res.data.is_read = res.data.is_read || false
  console.log('res.data notification.add', res.data)
  res.data._id = res.data.payload.notificationId
  const notificationData = res.data
  delete res.data.payload.notificationId
  delete res.data.unipush_version
  $state.notification.add(res.data)
  const {data} = notificationData?.payload || {}
  const actions = {
    "uni-im-friend-delete"(){
      const friend_uid = data.from_uid == current_uid ? data.to_uid : data.from_uid
      $state.friend.remove(friend_uid)
    },
    async "uni-im-friend-add"(){
      const friend_uid = data.from_uid == current_uid ? data.to_uid : data.from_uid
      let friendInfo = await $state.users.get(friend_uid)
      console.log('friendInfo',friendInfo)
      $state.friend.add(friendInfo)
    }
  }
  
  try{
    console.log(777,notificationData?.payload?.subType, notificationData)
    const action = actions[notificationData?.payload?.subType]
    action && action()
  }catch(e){
    console.error(e, notificationData)
  }
  
  
}