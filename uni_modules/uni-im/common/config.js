export default {
  // 云存储服务商
  cloudFile:{
    // 云存储服务商，支持：aliyun、tencent、qiniu
    provider: 'aliyun', 
  },
  uniPush: {
    // 消息渠道设置，避免被限量推送、静默推送（静音且需下拉系统通知栏才可见通知内容）详情文档：https://doc.dcloud.net.cn/uniCloud/uni-cloud-push/api.html#channel
    channel:{
      // 渠道id 
      id: "",
      // 消息渠道描述，会显示在手机系统关于当前应用的通知设置中
      desc: ""
    }
  },
  // web端绑定的域名，用于生成二维码等
  domain: 'http://localhost:8080/',
}