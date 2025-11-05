**uni-im 已开放需求征集和投票** [点此前往](https://vote.dcloud.net.cn/#/?name=uni-im)

# 简介
uni-im 是一款云端一体、全平台、免费且开源的即时通讯系统
- 基于uni-app，App、小程序、web全端兼容
- 基于uniCloud，前后端都使用js开发
- 基于[uni-push2](https://uniapp.dcloud.net.cn/unipush-v2.html)，专业稳定的全端消息推送系统（聚合多个手机厂商推送通道，App关闭后也能收到消息）
- 开放性高，支持非uniCloud（即支持服务端是php、java、go、.net、python、c#等开发语言的项目），甚至非uni-app开发的项目都可以接入使用
- 性价比高，前后端代码均免费开源，与同类产品相比，使用uni-im仅需支付因托管在 uniCloud（serverless 服务器）而产生的少量费用，详情可查看文末`费用说明`部分

## 案例：
应用名称：DCloud。此 App 的内置聊天模块即是基于 uni-im 开发的。

web端网址（支持PC宽屏和移动端）：[https://im.dcloud.net.cn](https://im.dcloud.net.cn)

扫码体验： ![](https://web-ext-storage.dcloud.net.cn/doc/im/download.png)

下载地址为：[https://im.dcloud.net.cn/uni-portal.html](https://im.dcloud.net.cn/uni-portal.html)

> uni-im相关功能建议或问题，可以加入由uni-im（本插件）搭建的交流群[点此加入](https://im.dcloud.net.cn/#/?joinGroup=63ef49711d358337456f4d67)
 
## 开发文档[详情查看](https://uniapp.dcloud.net.cn/uniCloud/uni-im.html)

## 使用uniCloud产生的费用说明@cost

uni-im本身并不收费，实际使用中需要依赖uniCloud云服务，会产生费用；而uniCloud的价格很实惠：  
- 调用10000次云函数仅需0.0133元
- 调用10000次数据库查询仅需0.015元
> 更多计费参考：[支付宝云版uniCloud按量计费文档](https://doc.dcloud.net.cn/uniCloud/price.html#alipay)

### 举例说明：  
- 单聊场景，向用户发送一条消息的过程：
1. 调用uni-im-co云对象的sendMsg方法（产生1次云函数请求）
2. 查询当前对话的会话记录（产生1次云数据库读操作）
3. 根据步骤2的查询结果，如果已经有会话记录，就更新会话，否则就创建一条会话记录（产生1次云数据库写操作）
4. 查询发送消息的用户信息，用于接收消息时在通知栏显示发送者昵称和头像（产生1次云数据库读操作）
5. 记录发送的消息内容到数据库，用于保存消息历史记录（产生1次云数据库写操作）
6. 以`user_id`为标识通过`uni-push2`向用户发送消息会产生0.00000283元uniCloud使用费用[详情查看](https://uniapp.dcloud.net.cn/unipush-v2.html#cost)

合计：1次云函数请求、2次数据库读操作、2次数据库写操作、1次uni-push2推送操作，即 (1 * 0.0133 + 2 * 0.015 + 2 * 0.05 + 1 * 0.0283)/10000 ≈ 0.000017元

- 群聊场景，向用户发送一条消息的过程：
1. 调用uni-im-co云对象的sendMsg方法（产生1次云函数请求）
2. 查询当前用户是否为群成员，防止非群成员发送消息（产生1次云数据库读操作）
3. 查询当前对话的会话记录（产生1次云数据库读操作）
4. 根据步骤3的查询结果，如果已经有会话记录，就更新会话，否则就创建一条会话记录（产生1次云数据库写操作）
5. 查询发送消息的用户信息，用于接收消息时在通知栏显示发送者昵称和头像（产生1次云数据库读操作）
6. 记录发送的消息内容到数据库，用于保存消息历史记录（产生1次云数据库写操作）
7. 以群id为参数，调用uni-im-co云对象的sendMsgToGroup方法，这是一个递归方法每次向500名群成员推送消息（如果群成员数量为0-500只需执行1次，500-1000需执行2次，以此类推），（会产生最少1次数据库读操作，和1次以`user_id`为标识通过`uni-push2`向用户发送消息会产生0.00000283元uniCloud使用费用[详情查看](https://uniapp.dcloud.net.cn/unipush-v2.html#cost)）

合计：向500人群发送消息，会产生：1次云函数请求、4次数据库读操作、2次数据库写操作、1次uni-push2推送操作，即 (1 * 0.0133 + 4 * 0.015 + 2 * 0.05 + 1 * 0.0283)/10000 ≈ 0.000020元

相比市面上同类型产品，使用uni-im仅需花费如此便宜的uniCloud（serverless服务器）费用；在价格这块uni-im性价比极高。