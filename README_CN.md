# Langbot IM (uni-app)

Langbot IM 是基于开源 **uni-im** 聊天系统的 uni-app 实现。它是一个云原生、跨平台的即时通讯应用，使用单一的 Vue 代码库即可运行在 Web、移动端（iOS/Android）和小程序等多个平台。

## 目录

1. [功能特性](#功能特性)
2. [项目结构](#项目结构)
3. [前置要求](#前置要求)
4. [快速开始](#快速开始)
5. [Git 远程仓库设置](#git-远程仓库设置)
6. [开发工作流](#开发工作流)
7. [部署到 uniCloud](#部署到-unicloud)
8. [成本概览](#成本概览)
9. [额外资源](#额外资源)
10. [解决合并冲突](#解决合并冲突)

## 功能特性

- **跨平台支持：** 基于 uni-app 构建，单一代码库可同时支持浏览器、原生应用和小程序等多个平台
- **云原生架构：** 使用 uniCloud（无服务器）提供后端服务，利用 uni-push 2.0 实现可靠的厂商集成消息推送
- **可扩展性：** 开箱即用支持 uniCloud，也可以通过 HTTP API 集成非 uniCloud 技术栈（Node、PHP、Java、Go、.NET 等）
- **成本高效：** 仅按实际使用的 uniCloud 资源付费，客户端和云端代码完全开源免费

## 项目结构

- `App.vue`、`main.js`、`pages.json` – 全局应用外壳和入口点
- `pages/` – 即时通讯相关的页面级视图
- `components/` – 跨页面共享的可复用 Vue 组件
- `uni_modules/` – 已安装的 uni-app 模块，包括 `uni-im` 核心功能
- `uniCloud-aliyun/` – 无服务器云对象、云函数和数据库架构
- `utils/` – 前端工具和辅助函数

> 提示：如果导入了额外的模块或插件，请记得运行 `npm install` 以确保本地依赖与 `package.json` 配置一致。

## 前置要求

1. **Node.js** 16 或更高版本及 npm
2. **HBuilderX**（推荐）或其他兼容 uni-app 的 IDE
3. **uniCloud** 服务空间。大多数使用场景建议使用公有云（阿里云）；受监管行业可使用私有云部署
4. **uni-push 2.0** 账号，需绑定到同一个服务空间以实现实时消息推送

## 快速开始

```bash
# 安装依赖
yarn install  # 或者使用: npm install

# 运行本地开发服务器
npm run dev
```

基于 Vite 的开发服务器会打印一个本地 URL；在两个不同的浏览器（或浏览器配置文件）中打开它来模拟多个聊天参与者。

## Git 远程仓库设置

克隆的挑战工作空间默认不会链接到上游远程仓库。因此，在关联远程分支之前运行 `git pull` 会报告缺少追踪信息：

```bash
git remote add origin <您的仓库URL>
git branch --set-upstream-to=origin/<分支名称>
```

配置远程仓库后，`git pull` 和 `git push` 将正常工作。

## 开发工作流

1. **导入示例项目**（如果从头开始）：通过 [uni-im 插件页面](https://ext.dcloud.net.cn/plugin?name=uni-im) 使用"使用 HBuilderX 导入示例项目"
2. **关联服务空间：** 在 HBuilderX 中，右键点击 `uniCloud` 文件夹 → `关联云服务空间或项目`
3. **配置 uni-push：** 在 [uni-push 2.0 控制台](https://dev.dcloud.net.cn/pages/app/push2/info) 中，绑定同一个服务空间以启用消息推送
4. **在浏览器或模拟器中运行：** 使用 `运行 -> 运行到浏览器`（或原生目标）来启动应用。避免在同一浏览器实例中打开多个标签页，以防止 WebSocket 资源竞争
5. **发起单聊：** 导航到 `/uni_modules/uni-im/pages/chat/chat?user_id=<目标用户ID>`。您可以通过浏览器控制台的 `uni.imObservableData.currentUser._id` 获取当前用户 ID

## 部署到 uniCloud

当您准备好发布更改时：

1. 在 HBuilderX 中，右键点击项目根目录并选择 `云服务空间初始化向导` 来完成部署流程
2. 上传 `uniCloud-aliyun/` 中包含的云函数和数据库架构
3. 确认环境变量和推送凭证与您的生产环境设置匹配

对于非 uniCloud 技术栈，需要暴露与 uni-im 云对象 API 兼容的 REST 端点，以便前端可以与您自己的后端实现交互。

## 成本概览

虽然客户端和服务端代码都是开源的，但使用 uniCloud 资源会产生基于用量的费用。典型操作包括：

- 云函数调用（`uni-im-co.sendMsg`、`sendMsgToGroup`）
- 数据库读取（获取会话记录、用户信息）和写入（持久化对话和历史记录）
- uni-push 2.0 按用户或群组发送的通知

例如，发送一条单聊消息大约会触发：

- 1 × 云函数调用
- 2 × 数据库读操作
- 2 × 数据库写操作
- 1 × uni-push 2.0 通知（约 ¥0.00000283）

即使在高频使用场景下——例如向 500 名接收者推送群消息——综合成本相比专有 IM 平台也仅为几分之一分钱。

最新费率请参考 [uniCloud 价格指南](https://doc.dcloud.net.cn/uniCloud/price.html#alipay)。

## 额外资源

- **文档：** [uni-im 文档](https://uniapp.dcloud.net.cn/uniCloud/uni-im.html)
- **产品网站：** [https://im.dcloud.net.cn](https://im.dcloud.net.cn)
- **下载门户：** [https://im.dcloud.net.cn/uni-portal.html](https://im.dcloud.net.cn/uni-portal.html)
- **功能路线图与投票：** [需求征集和投票](https://vote.dcloud.net.cn/#/?name=uni-im)
- **社区群组：** [通过 uni-im 聊天加入](https://im.dcloud.net.cn/#/?joinGroup=63ef49711d358337456f4d67)

如需反馈或功能请求，请提交 issue 或通过社区群组联系我们。

## 解决合并冲突

当基础分支（例如 `main`）向前推进时，Pull Request 可能会显示"此分支存在冲突"。要让 PR 准备好合并：

1. **更新本地基础分支：** `git fetch origin && git checkout main && git pull`
2. **将基础分支变基或合并到您的功能分支：**
   - 变基（保持线性历史）：`git checkout <your-branch> && git rebase origin/main`
   - 合并（保留原始提交）：`git checkout <your-branch> && git merge origin/main`
3. **在本地解决冲突：** 打开每个冲突的文件，保留所需的更改，并删除冲突标记（`<<<<<<<`、`=======`、`>>>>>>>`）。使用 `git status` 确认所有冲突已解决
4. **验证项目：** 运行相关的单元测试、代码检查或构建命令，确保合并后的代码仍然正常工作
5. **完成变基/合并：**
   - 对于变基：`git rebase --continue`
   - 对于合并：`git commit`（在您暂存已解决的文件后，Git 会创建合并提交）
6. **强制推送变基分支或推送合并提交：**
   - 变基分支：`git push --force-with-lease`
   - 合并分支：`git push`
7. **刷新 PR：** GitHub 会自动重新运行合并检查；在请求审查前确认显示"此分支没有冲突"消息

如果冲突仅在 GitHub 上发生，您也可以在 PR UI 中点击 **解决冲突**，直接在浏览器中编辑文件并提交解决方案。但是，在本地解决冲突可以让您在推送前完全控制测试。

## 许可证

本项目采用开源许可证。详情请参阅 [license.md](license.md) 文件。

## 贡献

欢迎贡献！如果您想为项目做出贡献，请：

1. Fork 本仓库
2. 创建您的功能分支（`git checkout -b feature/AmazingFeature`）
3. 提交您的更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 开启一个 Pull Request

## 技术支持

如遇到问题或需要帮助，请：

- 查看 [uni-im 官方文档](https://uniapp.dcloud.net.cn/uniCloud/uni-im.html)
- 在 GitHub 上提交 [Issue](https://github.com/lonycn/langbot-im-uniapp/issues)
- 加入社区群组进行讨论
