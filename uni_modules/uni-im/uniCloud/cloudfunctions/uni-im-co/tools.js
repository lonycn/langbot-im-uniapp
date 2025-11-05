async function getImgBase64(url) {
  try {
    const res = await uniCloud.httpclient.request(url, {
      method: 'GET',
      responseType: "arraybuffer",
    })
    const base64Image = 'data:image/png;base64,' + Buffer.from(res.data).toString("base64");
    return {
      data: base64Image,
      errCode: 0,
      errMsg: ''
    }
  } catch (e) {
    console.error('uni-im-co.getImgBase64', e, {
      url
    })
    return {
      data: false,
      errCode: 404,
      errMsg: 'uni-im-co.getImgBase64'
    }
  }
}

// 请求一个网络链接，获取网站的标题、概述、图标等信息
async function getWebInfo(url) {
  throw new Error('uni-im-tool.getWebInfo已经废弃')
  // console.log('getWebInfo',url)

  //拒绝为url的最后一个/后面的内容为.xxx的请求
  if (url.indexOf('/') !== -1) {
    let last = url.split('/').pop();
    if (last.indexOf('.') !== -1) {
      return {
        data: false,
        errCode: 404,
        errMsg: 'url格式错误',
      }
    }
  }

  let res = await uniCloud.httpclient.request(url, {
    method: 'GET',
    dataType: 'text',
  });
  // console.log(res);
  // 解析html
  let html = res.data;
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  const title = $('title').text();
  const description = $('meta[name="description"]').attr('content');
  let icon = $('head').find('link[rel="shortcut icon"], link[rel="icon"]').attr('href');
  // 如果icon存在，返回base64
  if (icon) {
    icon = fixUrl(icon);
    // console.error('icon',icon);
    icon = (await getImgBase64({
      "url": icon
    })).data;
  }
  // 缩略图
  let thumbnail = $('head').find('meta[property="og:image"]').attr('content');
  // 如果thumbnail不存在，找一张正方形的图片
  if (!thumbnail) {
    $('img').each(function() {
      const src = $(this).attr('src');
      if (src && src.indexOf('data:image') === -1) {
        thumbnail = src;
        return false;
      }
    });
  }

  if (thumbnail) {
    thumbnail = fixUrl(thumbnail);
    thumbnail = (await getImgBase64({
      "url": thumbnail
    })).data;
  }

  // 如果是/开头，加上域名,如果没有http，加上域名
  function fixUrl(src) {
    if (src.indexOf('//') === 0) {
      // 如果没有http，加上域名
      return 'https:' + src;
    } else if (src.indexOf('/') === 0) {
      return url.split('/')[0] + '//' + url.split('/')[2].split('?')[0].split('#')[0] + src;
    }
    return src;
  }

  // console.error('title,description,icon,thumbnail',{title,description,icon,thumbnail})
  return {
    data: {
      title,
      description,
      icon,
      thumbnail
    },
    errCode: 0,
    errMsg: ''
  }
}

module.exports = {
  getImgBase64,
  // getWebInfo,
}
