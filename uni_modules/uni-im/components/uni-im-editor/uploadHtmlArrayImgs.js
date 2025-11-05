import uniIm from '@/uni_modules/uni-im/sdk/index.js';
export default async (htmlArray)=>{
	// 上传消息中的图片
	const promiseArr = []
	htmlArray.forEach(async (item,index)=>{
		if(item.name === 'img'){
			// 补充图片的宽高信息
			promiseArr.push(new Promise((resolve,reject)=>{
				uni.getImageInfo({
					src:item.attrs.src,
					success:res=>{
						item.attrs.width = res.width
						item.attrs.height = res.height
						resolve()
					},
					fail:reject
				});
			}))
			
			// 将blob类型的图片上传到云存储
			if(item.attrs.src.indexOf('blob:http') === 0){
				promiseArr.push(new Promise((resolve,reject)=>{
					uniCloud.uploadFile({
						filePath: item.attrs.src,
						cloudPath: Date.now() + index + uniIm.currentUser._id + '.' + name.split('.').pop(),
						// onUploadProgress: (res) => {
						// 	console.log('上传进度', res.progress)
						// 	item._uploadProgress = res.progress
						// }
					}).then(res=>{
						item.attrs.src = res.fileID
						// console.log('上传成功',res);
						resolve()
					}).catch(e=>{
						reject()
					})
				}))
			}
		}
	})
	try{
		await Promise.all(promiseArr)
	}catch(e){
		console.error('上传图片失败',e)
		uni.showModal({
			content: '上传图片失败' + JSON.stringify(e),
			showCancel: false
		});
		throw e
	}
	return htmlArray
}