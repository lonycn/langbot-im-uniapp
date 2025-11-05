# Langbot IM (uni-app)

Langbot IM is a uni-app implementation of the open-source **uni-im** chat system. It delivers a cloud-native, cross-platform instant-messaging experience that runs on Web, mobile (iOS/Android), and mini-program targets with a single Vue-based codebase.

## Table of contents

1. [Features](#features)
2. [Project structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Quick start](#quick-start)
5. [Development workflow](#development-workflow)
6. [Deploying to uniCloud](#deploying-to-unicloud)
7. [Cost overview](#cost-overview)
8. [Additional resources](#additional-resources)

## Features

- **Cross platform:** Built with uni-app, the project targets browsers, native apps, and mini-programs from a single codebase.
- **Cloud native:** Uses uniCloud (serverless) for back-end services and leverages uni-push 2.0 for reliable, vendor-integrated notifications.
- **Extensible:** Works with uniCloud out of the box and can integrate with non-uniCloud stacks (Node, PHP, Java, Go, .NET, etc.) through HTTP APIs.
- **Cost efficient:** Only the uniCloud resources that you consume incur costs. The client and cloud code are open-source and free to use.

## Project structure

- `App.vue`, `main.js`, `pages.json` – Global application shell and entry points.
- `pages/` – Page-level views for the IM experience.
- `components/` – Reusable Vue components shared across pages.
- `uni_modules/` – Installed uni-app modules, including `uni-im` functionality.
- `uniCloud-aliyun/` – Serverless cloud objects, functions, and database schema.
- `utils/` – Front-end utilities and helpers.

> Tip: If you import additional modules or plugins, remember to run `npm install` so local dependencies match the configuration in `package.json`.

## Prerequisites

1. **Node.js** 16 or later with npm.
2. **HBuilderX** (recommended) or another uni-app-compatible IDE.
3. A **uniCloud** service space. Public cloud (Alibaba Cloud) is suggested for most use cases; private cloud deployments are available for regulated industries.
4. A **uni-push 2.0** account bound to the same service space to deliver real-time notifications.

## Quick start

```bash
# Install dependencies
yarn install  # or: npm install

# Run the local development server
npm run dev
```

The Vite-powered dev server prints a local URL; open it in two different browsers (or browser profiles) to simulate multiple chat participants.

## Development workflow

1. **Import the sample project** (if starting fresh) via the [uni-im plugin page](https://ext.dcloud.net.cn/plugin?name=uni-im) using "使用 HBuilderX 导入示例项目".
2. **Associate a service space:** In HBuilderX, right-click the `uniCloud` folder → `关联云服务空间或项目`.
3. **Configure uni-push:** In the [uni-push 2.0 console](https://dev.dcloud.net.cn/pages/app/push2/info), bind the same service space so push notifications can be delivered.
4. **Run in browser or emulator:** Use `运行 -> 运行到浏览器` (or a native target) to launch the application. Avoid opening multiple tabs in the same browser instance to prevent WebSocket contention.
5. **Initiate a direct chat:** Navigate to `/uni_modules/uni-im/pages/chat/chat?user_id=<TARGET_USER_ID>`. You can retrieve the current user's ID from the browser console via `uni.imObservableData.currentUser._id`.

## Deploying to uniCloud

When you are ready to promote changes:

1. In HBuilderX, right-click the project root and choose `云服务空间初始化向导` to walk through deployment.
2. Upload cloud functions and database schema contained in `uniCloud-aliyun/`.
3. Confirm that environment variables and push credentials match your production settings.

For non-uniCloud stacks, expose REST endpoints that mirror the uni-im cloud-object APIs so the front end can interact with your own back-end implementation.

## Cost overview

While the client and server code are open source, consuming uniCloud resources generates usage-based charges. Typical operations include:

- Cloud function invocations (`uni-im-co.sendMsg`, `sendMsgToGroup`).
- Database reads (fetching session records, user info) and writes (persisting conversations and history).
- uni-push 2.0 notifications sent per user or group.

As an example, sending a single direct message triggers approximately:

- 1 × cloud function call
- 2 × database read operations
- 2 × database write operations
- 1 × uni-push 2.0 notification (~¥0.00000283)

Even under heavy use—e.g., pushing a group message to 500 recipients—the combined cost remains a fraction of a cent compared with proprietary IM platforms.

Refer to the [uniCloud pricing guide](https://doc.dcloud.net.cn/uniCloud/price.html#alipay) for the most recent rates.

## Additional resources

- **Documentation:** [uni-im docs](https://uniapp.dcloud.net.cn/uniCloud/uni-im.html)
- **Product site:** [https://im.dcloud.net.cn](https://im.dcloud.net.cn)
- **Download portal:** [https://im.dcloud.net.cn/uni-portal.html](https://im.dcloud.net.cn/uni-portal.html)
- **Feature roadmap & voting:** [需求征集和投票](https://vote.dcloud.net.cn/#/?name=uni-im)
- **Community group:** [Join via uni-im chat](https://im.dcloud.net.cn/#/?joinGroup=63ef49711d358337456f4d67)

For feedback or feature requests, please open an issue or reach out through the community group.
