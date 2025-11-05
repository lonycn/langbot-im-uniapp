import uniIm from '@/uni_modules/uni-im/sdk/index.js';
export default (htmlString)=>{
	const htmlArray = uniIm.utils.parseHtml(htmlString);
	// 把用户手敲的http链接转为a标签包裹，再转为富文本数组
	htmlArray.forEach((item,index)=>{
	  // 如果文字中有http链接，需要把链接的地址提取出来
	  if(item.type === "text"){
	    if(item.text.includes('http')){
	      const newStr = uniIm.utils.replaceUrlToLink(item.text)
	      const newItems = uniIm.utils.parseHtml(newStr)
	      // 删除原来的text，替换成新的
	      htmlArray.splice(index,1,...newItems)
	    }
	    //转义：&gt; 转换为 > $lt; 转换为 < &amp; 转换为 & &quot; 转换为 " &nbsp; 转换为空格 &ensp; 转换为空格 &emsp; 转换为空格
	    item.text = item.text.replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&ensp;/g,' ').replace(/&emsp;/g,' ')
	  }
	})
	// 如果最后一项是text
	const lastItem = htmlArray[htmlArray.length - 1]
	if(lastItem.type === 'text'){
	  // 删除末尾的空格或者换行
	  lastItem.text = lastItem.text.replace(/[\s\n]*$/,'')
	  if(lastItem.text === ''){
	    htmlArray.pop()
	  }  
	}
	return htmlArray;
}