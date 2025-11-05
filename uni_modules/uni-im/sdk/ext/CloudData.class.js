const dbJQL = uniCloud.databaseForJQL()
const dbJQLcmd = dbJQL.command
const $ = dbJQL.command.aggregate
import $state from '../state/index.js';
import utils from '@/uni_modules/uni-im/sdk/utils/index.js';

export default class CloudData {
  dataList = []
  hasMore = true
  loading = false
  loadLimit = 100
  indexKey = '_id'
  __getMoreQueue = []
  // 被哪个类继承
  inheritedBy = ''
  constructor() {
    // this.dbJQL = dbJQL
    // this.dbJQLcmd = dbJQLcmd
    // this.dbJQL$ = $
    if(this.indexKey){
      this.dataMap = new Map()
    }
  }
  reset() {
    this.dataList.length = 0
    this.hasMore = true
    this.loading = false
    if(this.indexKey){
      this.dataMap.clear()
    }
  }
  remove(param) {
    let item = this.find(param)
    if(item){
      if(Array.isArray(this.dataList)){
        this.dataList.splice(this.dataList.indexOf(item), 1)
      }else{
        delete this.dataList[item._id]
      }
      if(this.indexKey){
        let key;
        this.indexKey.split('.').forEach(k => {
          key = key ? key[k] : item[k]
        })
        this.dataMap.delete(key)
      }
    }
    this.__afterRemove(item)
  }
  __beforeRemove(param) {
    // 空实现
    return param
  }
  __afterRemove(param) {
    // 空实现
    return param
  }
  __beforeFind(param) {
    // 空实现，用于子类重写
    return param
  }
  /**
   * @description 查找本地中存在的数据
   * @param {Object} param 查找条件，如果为空则返回全部数据，否则返回查找到的1条数据
   */
  find(param) {
    if(!param){
      throw new Error('请传入查找条件')
    }
    const dataList = this.dataList
    param = this.__beforeFind(param)
    let res;
    if(this.indexKey){
      // 先判断param是否和this.indexKey一样,可以走dataMap查找
      const indexKeyArr = this.indexKey.split('.');
      let mapKey = false;
      // 判断索引为字符串还是对象
      if(indexKeyArr.length == 1 && typeof param == 'string'){
        // 字符串索引
        mapKey = param
      }else if(typeof param == 'object' && convertObjToString(param) === this.indexKey){
        // 对象索引
        let key;
        indexKeyArr.forEach(k => {
          key = key ? key[k] : param[k]
        })
        mapKey = key
      }
      if (mapKey) {
        // console.time('find dataMap.get' + this.constructor.name)
        res = this.dataMap.get(mapKey)
        // console.timeEnd('find dataMap.get' + this.constructor.name)
      } else {
        console.log('注意：此次查找未走索引',param,this.indexKey,this.constructor.name)
      }
    } 
    
    if(!res) {
      // console.time('find-no-index-' + this.constructor.name)
      // 默认查找条件为_id
      if(typeof param == 'string'){
        res = dataList.find(item => item._id == param)
      }else if(typeof param == 'object'){
        // console.log('param',param)
        res = dataList.find(item => isEq(item,param))
      }else{
        throw new Error('错误的查找条件')
      }
      // console.timeEnd('find-no-index-' + this.constructor.name)
    }
    if(this.__afterFind){
     res = this.__afterFind?.({param,res})
    }
    
    return res
  }
  /** @description 查询数据，先从本地查找，如果没有则从云端拉取
   * @param {Object} param 查找条件，如果为空则返回全部数据，否则返回查找到的1条数据
   */
  async get(param) {
    if(this.inheritedBy === 'conversation'){
      // debugger
    }
    if(!param){
      throw new Error('请传入查找条件')
    }
    let data = this.find(param)
    if(!data){
      data = await this.loadMore(param)
    }
    this.__afterGet(data)
    return data
  }
  __afterGet(param) {
    // 空实现，用于子类重写
    return param
  }
  count() {
    return this.dataList.length
  }
  __get(param){
    // 空实现，用于子类重写
    console.error('CloudData.pullData is not implemented')
    // 返回入参，避免报错
    return param
  }
  
  async getMore(param) {
    if(!param){
      if(!this.hasMore){
        console.log('没有更多数据了')
        return []
      }
      if (this.loading) {
        await new Promise((resolve, reject) => {
          console.warn('正在加载中，本次请求进入列队。模块名称:' + this.constructor.name)
          this.__getMoreQueue.push({resolve, reject})
        })
        console.log('列队任务已开始执行。模块名称:' + this.constructor.name)
      }else{
        this.loading = true
      }
    }
    let datas = []
    try{
      datas = await this.__get(param)
      if(!param){
        this.hasMore = datas.length === this.loadLimit
        this.loading = false
      }
    }catch(e){
      console.error('loadMore err',e)
      this.loading = false
      uni.showToast({
        title: e.message,
        icon: 'none'
      });
    }
    this.__afterGetMore?.(datas)
    // 执行下一个队列
    if(this.__getMoreQueue.length > 0){
      const item = this.__getMoreQueue.shift()
      item.resolve()
    }
    return datas
  }
  async loadMore(param) {
    // console.log('loadMore param',param);
    let datas = await this.getMore(param)
    if(datas.length > 0){
      datas = this.add(datas,{canSetIsFull:true})
    }
    return param == undefined ? datas : datas[0]
  }
  set(data){
    if(!data) return
    // 先判断是否存在
    let item = this.find(data.id || data._id || Object.keys(data)[0])
    if(item){
      // console.log('更新会话',data)
      try{
        utils.deepAssign(item,data)
      }catch(e){
        console.error('合并更新出错',{item,data,e})
      }
      return item
    }else{
      return this.add(data)
    }
  }
  __beforeAdd(param) {
    // 空实现，用于子类重写
    return param
  }
  add(param,options = {}) {
    // console.time('add' + this.constructor.name)
    const {canUpdate = true,unshift = false} = options
    const paramIsArray = Array.isArray(param)
    let datas = paramIsArray ? param : [param]
    
    // console.time('add __beforeAdd' + this.constructor.name)
    let res = this.__beforeAdd(datas,options)
    // console.timeEnd('add __beforeAdd' + this.constructor.name)
    if(res !== undefined){
      datas = res
    }
    // 插入之前dataList是否为空
    const isEmpty = this.dataList.length === 0
    const resData = datas.map(item => {
      let val;
      if(this.indexKey){
        this.indexKey.split('.').forEach(k => {
          val = val ? val[k] : item[k]
        })
      }else{
        val = item._id || item.id || { [Object.keys(item)[0]]: item[Object.keys(item)[0]] }
      }
      // 如果当前数据列表为空或者没有传入索引值，则不检查要插入的数据是否存在
      let _data = (isEmpty || !val) ? false : this.find(val)
      // console.log('add _data',{_data,item})
      // 如果已经存在的，只更新不添加
      if(_data){
        if(canUpdate && item != _data){
          // console.log('添加的对象已经存在，更新对象',{item,item})
          try{
            utils.deepAssign(_data,item)
          }catch(e){
            console.error('合并更新出错',{item,_data,e})
          }
        }
        return _data
      }else{
        if(unshift){
          this.dataList.unshift(item)
          item = this.dataList.slice(0,1)[0]
        }else{
          this.dataList.push(item)
          item = this.dataList.slice(-1)[0]
        }
        if(this.indexKey){
          // console.time('dataMap set')
          let key;
          this.indexKey.split('.').forEach(k => {
            key = key ? key[k] : item[k]
          })
          const cs = this.__canSeaveToDataMap
          const val = cs ? cs(item) : true
          if(val){
            this.dataMap.set(key, item)
          }
          // console.log('this.dataMap',this.dataMap)
          // console.timeEnd('dataMap set')
        }
        return item
      }
    })
    this.__afterAdd(resData,options)
    // console.error('param',param)
    // console.timeEnd('add' + this.constructor.name)
    return paramIsArray ? resData : resData[0]
  }
  __afterAdd(param) {
    // 空实现，用于子类重写
    return param
  }
  update(param, data) {
    let item = this.find(param)
    if(item){
      Object.assign(item, data)
    }
    return item
  }
}

function convertObjToString(obj) {
  let result = '';
  function recursiveConvert(currentObj, path) {
    for (const key in currentObj) {
      const value = currentObj[key];
      const newPath = path? `${path}.${key}` : key;
      if (typeof value === 'object') {
        recursiveConvert(value, newPath);
      } else {
        result += `${newPath}`;
      }
    }
  }
  recursiveConvert(obj, '');
  return result;
}

function isEq(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    console.error('不支持数组比较')
    return a === b;
  }
  let result = true;
  for (let key in b) {
    const valueA = a[key];
    const valueB = b[key];
    if (typeof valueB === 'object' 
      && valueB !== null
      && typeof valueA === 'object'
      && valueA !== null
    ) {
      return isEq(valueA, valueB);
    }
    result = valueA === valueB;
    if (!result) {
      break;
    }
  }
  return result;
}