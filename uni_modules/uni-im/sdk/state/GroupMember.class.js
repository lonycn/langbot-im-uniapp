import CloudData from '@/uni_modules/uni-im/sdk/ext/CloudData.class.js'
import GroupMemberItem from '@/uni_modules/uni-im/sdk/state/GroupMemberItem.class.js'
import $users from '@/uni_modules/uni-im/sdk/methods/users.js';
import $extensions from '@/uni_modules/uni-im/sdk/methods/extensions.js';
const dbJQL = uniCloud.databaseForJQL()
const dbJQLCommand = dbJQL.command
const $ = dbJQL.command.aggregate

export default class GroupMember extends CloudData {
  constructor({group_id}={}) {
    super()
    this.group_id = group_id
    this.indexKey = 'users._id'
    this.needLoadOnce = true
  }
  __beforeAdd(datas){
    // console.log('GroupMember beforeAdd',datas);
    // 调用扩展点中的方法
    // $extensions.invokeExts('before-add-group-member', datas)
    
    // 为了方便使用，将用户信息缓存到全局
    const userInfoObj = datas.reduce((obj,item) => {
      obj[item.users._id] = item.users
      return obj
    },{})
    $users.merge(userInfoObj)
		return datas.map(item => new GroupMemberItem(item))
  }
  findByUid(uid) {
    console.warn('member.findByUid 已经过期，去直接member.find(uid)查找');
    return this.dataList.find(item => item.users._id === uid)
  }
  __beforeFind(param){
    if (typeof param === 'string'){
      // 设置为默认按users._id查找群成员，而不是按_id查找
      return {
        users:{
          _id:param
        }
      }
    }else{
      return param
    }
  }
  async __get() {
    // console.error('pull GroupMember Data param',this.group_id);
    let _where = `"group_id" == "${this.group_id}"`
    if (this.lastItem) {
      const {active_time,_id} = this.lastItem
      _where += ` && !(role in ["admin"]) && ("active_time" < ${active_time} || ("active_time" == ${active_time} && "_id" < "${_id}"))`
    }
    let res = await dbJQL.collection(
        dbJQL.collection('uni-im-group-member')
            .where(_where)
            .orderBy("role desc,active_time desc,_id desc")
            .limit(this.loadLimit)
            .getTemp(),
        dbJQL.collection('uni-id-users').field('_id,nickname,avatar_file,realname_auth').getTemp()
      )
      .get()
    // console.error('拉取到群成员数据',_where,res.data.length,length);
    this.lastItem = res.data[res.data.length - 1]
    return res.data.map(item => {
      const usersInfo = item.user_id[0];
      delete item.user_id
      item.users = usersInfo
      return item
    })
  }
}