export async function init(version) {
  // console.log('init~~~~~~~~~~~~~~~~')
  if (!window.indexedDB) {
    return uni.showModal({
      content: "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.",
      showCancel: false
    });
  }
  const maxIndexDBVersion = Date.now() // todo 临时方案，使得每次打开indexDB都会清空。等项目稳定后，再恢复
  let currentIndexDBVersion = uni.getStorageSync('uni-im-currentIndexDBVersion') || 0
  if (currentIndexDBVersion < maxIndexDBVersion) {
    // console.log('clear indexedDB database');
    try {
      window.indexedDB.deleteDatabase("uni-im");
    } catch (e) {
      console.error(e);
    }
    uni.setStorageSync('uni-im-currentIndexDBVersion', maxIndexDBVersion)
  }

  return new Promise((resolve, reject) => {
    let indexedDB = window.indexedDB
    let request = indexedDB.open("uni-im", 1)
    request.onsuccess = function (event) {
      let indexDB = event.target.result // 数据库对象
      // console.log('数据库打开成功',indexDB)
      resolve(event)
    }
    request.onerror = function (event) {
      console.error("Database error: " + event.target.errorCode);
      reject(event)
    }

    request.onupgradeneeded = function (event) {
      // 数据库创建或升级的时候会触发
      // console.log('onupgradeneeded')
      let indexDB = event.target.result // 数据库对象
      if (!indexDB.objectStoreNames.contains("uni-im-msg")) {
        let uniImMsgStore = indexDB.createObjectStore("uni-im-msg", {
          keyPath: 'unique_id',
          // autoIncrement:true
        }) // 创建表
        uniImMsgStore.createIndex('from_uid', 'from_uid', {
          unique: false
        }) // 创建索引 可以让你搜索任意字段
        uniImMsgStore.createIndex('to_uid', 'to_uid', {
          unique: false
        })
        uniImMsgStore.createIndex('unique_id', 'unique_id', {
          unique: true
        })
        uniImMsgStore.createIndex('conversation_id', 'conversation_id', {
          unique: false
        })
        uniImMsgStore.createIndex('_id', '_id', {
          unique: false
        })
        uniImMsgStore.createIndex('group_id', 'group_id', {
          unique: false
        })
        uniImMsgStore.createIndex('body', 'body', {
          unique: false
        })
        uniImMsgStore.createIndex('is_read', 'is_read', {
          unique: false
        })
        uniImMsgStore.createIndex('type', 'type', {
          unique: false
        })
        uniImMsgStore.createIndex('create_time', 'create_time', {
          unique: false
        })
        uniImMsgStore.createIndex('client_create_time', 'client_create_time', {
          unique: false
        })
        uniImMsgStore.createIndex('conversation_id-create_time', ['conversation_id', 'create_time'], {
          unique: false
        })
      }
      if (!indexDB.objectStoreNames.contains("uni-im-convasation")) {
        let uniImMsgStore = indexDB.createObjectStore("uni-im-convasation", {
          keyPath: 'id',
          // autoIncrement:true
        }) // 创建表
        uniImMsgStore.createIndex('_id', '_id', {
          unique: true
        })
      }
    }
  })
}