export default (version)=>{
  // 根据版本号决定是否清空过期的 storage 数据
  // #ifndef APP
  // 清理旧版本下的storage避免脏数据引发问题
  const lastVersion = uni.getStorageSync('uni-im-storage-version')
  if (lastVersion != version) {
    // uni.clearStorage()
    const storageKeys = uni.getStorageInfoSync().keys
    storageKeys.forEach(key => {
      if (key.indexOf("uni-im") === 0) {
        // console.error('key', key);
        uni.removeStorageSync(key)
      }
    })
    uni.setStorageSync('uni-im-storage-version', version)
    // console.log('clear history storage success');
  }
  // #endif
}