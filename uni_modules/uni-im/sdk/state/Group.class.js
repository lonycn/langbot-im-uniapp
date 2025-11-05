import CloudData from '@/uni_modules/uni-im/sdk/ext/CloudData.class.js'
import GroupItem from './GroupItem.class.js'
import $users from '@/uni_modules/uni-im/sdk/methods/users.js';

const dbJQL = uniCloud.databaseForJQL()
const dbJQLCommand = dbJQL.command
const $ = dbJQL.command.aggregate

export default class Group extends CloudData {
  constructor() {
    super()
  }
  __beforeAdd(groupList) {
    if(!Array.isArray(groupList)){
      groupList = [groupList]
    }
    return groupList.map(data => new GroupItem(data))
  }
  async __get(param = {}) {
    // console.error('pull Group Data param',param);
    const {group_id} = param
    let whereString = '"user_id" == $cloudEnv_uid && "is_delete" != true'
    if(!this.min_create_time){
      this.min_create_time = Date.now()
    }
    whereString += `&& "create_time" < ${this.min_create_time}`
    if (group_id) {
      whereString += `&& "group_id" == "${group_id}"`
    }
    // console.log('this.min_create_time',this.min_create_time)
    // console.log('whereString',whereString)
    const res = await dbJQL.collection(
        dbJQL.collection('uni-im-group-member')
          .where(whereString)
          .orderBy('create_time', 'desc')
          .getTemp(),
        dbJQL.collection('uni-im-group').getTemp()
      )
      .limit(this.loadLimit)
      .get()
    let groupList = res.data
    const length = groupList.length
    if(length){
      this.min_create_time = groupList[length - 1].create_time
    }
    groupList = groupList.map(item => item.group_id[0])
    return groupList
  }
}