/**
 * 系统消息
 */
import state from '../state/index.js';
import $utils from '@/uni_modules/uni-im/sdk/utils';
const db = uniCloud.database();
export default {
  get: ({
    type,
    excludeType
  } = {}) => {
    const notificationDatas = state.notification.dataList
    if (notificationDatas) {
      return notificationDatas.reduce((sum, item) => {
        // 指定需要的类型
        if (type) {
          //兼容字符串和数组
          typeof type == 'string' ? type = [type] : ''
          if (type.includes(item.payload.subType)) {
            sum.push(item)
          }
          // 排查指定的类型
        } else if (excludeType) {
          //兼容字符串和数组
          typeof excludeType == 'string' ? excludeType = [excludeType] : ''
          if (!excludeType.includes(item.payload.subType)) {
            sum.push(item)
          }
        } else {
          sum.push(item)
        }
        return sum
      }, [])
    } else {
      return false
    }
  },
  async loadMore() {
    let res = await db.collection('uni-im-notification')
      .aggregate()
      .match('"payload.type" == "uni-im-notification" && "user_id" == $cloudEnv_uid')
      .sort({
        create_time: -1
      })
      .limit(1000)
      .end()
    this.add(res.result.data)
    this.hasMore == (res.result.data.length != 0)
  },
  add(datas) {
    if (!Array.isArray(datas)) {
      datas = [datas]
    }

    let notificationDatas = datas.concat(state.notification.dataList)
    // 正序，实现时间大的覆盖时间小的
    notificationDatas.sort((a, b) => a.create_time - b.create_time)
    // console.log('notificationDatas',notificationDatas);
    let obj = {}
    for (var i = 0; i < notificationDatas.length; i++) {
      let item = notificationDatas[i]
      // 去重操作
      let {
        subType,
        unique
      } = item.payload
      obj[unique ? (subType + "_" + unique) : (Date.now() + "_" + i)] = item
    }
    let dataList = []
    for (let key in obj) {
      let item = obj[key]
      dataList.push(item)
    }
    // 倒序 实现，最新的消息在最上面
    dataList.sort((a, b) => b.create_time - a.create_time)
    // console.log('dataList',dataList)
    state.notification.dataList = dataList
  },
  unreadCount(param = {}) {
    let notificationDatas = this.get(param)
    let unreadCount = notificationDatas.reduce((sum, item, index, array) => {
      if (!item.is_read) {
        sum++
      }
      return sum
    }, 0)

    // console.log('最新的未读数:', unreadCount, data);
		$utils.setTabBarBadge(2, unreadCount)
		
    if (unreadCount) {
      return unreadCount + ''
    } else {
      return ''
    }
  }
}
