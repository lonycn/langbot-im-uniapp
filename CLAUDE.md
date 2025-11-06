# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Langbot IM** is a uni-app implementation of the open-source **uni-im** chat system. It's a cross-platform instant messaging application that runs on Web (H5), mobile (iOS/Android), and mini-program targets from a single Vue 3 codebase.

- **Framework**: uni-app (Vue 3, Vite-powered)
- **Backend**: uniCloud (Alibaba Cloud serverless)
- **Push Notifications**: uni-push 2.0
- **IDE**: HBuilderX (recommended)
- **App ID**: `__UNI__371BB2B`

## Development Commands

```bash
# Install dependencies
yarn install          # or: npm install

# Run development server (H5)
npm run dev          # Starts Vite dev server on port 8080

# Run tests (if configured)
npm test             # Currently not configured
```

For other platforms (iOS, Android, mini-programs), use HBuilderX's "运行" menu to launch on emulators or devices.

## Architecture Overview

### Core Structure

- **`App.vue`** + **`main.js`**: Application entry points. Initializes uni-id-pages (authentication), uni-im SDK, and MsgReader extension
- **`pages/`**: Custom application pages
  - `pages/chat/chat.vue`: Custom LangBot chat interface
  - `pages/index/index.vue`: Application entry/splash page
- **`components/`**: Custom message rendering components (see below)
- **`uni_modules/`**: Installed uni-app modules
  - `uni-im/`: Core IM functionality (conversation, messaging, contacts)
  - `uni-id-pages/`: User authentication and profile management
  - Various UI components (uni-badge, uni-icons, uni-forms, etc.)
- **`uniCloud-aliyun/`**: Serverless backend (cloud functions, database schema)
- **`utils/`**: Custom utilities for LangBot integration

### Custom Utilities (`utils/`)

**`langbot.ws.js`** - WebSocket manager for LangBot backend connection
- `configureWS(options)`: Configure connection settings (url, userId, convId, auth token)
- `connectWS(options?)`: Connect to WebSocket server
- `onWSMessage(listener)`: Register message listener (returns unsubscribe function)
- `sendWSMessage(payload)`: Send message (auto-serializes objects to JSON)
- `closeWS()`: Manually close connection
- `isConnected()`: Check connection status
- Features automatic reconnection with exponential backoff (max 6 retries)

**`langbot.http.js`** - HTTP client wrapper
- `configureHttp(options)`: Set baseURL, timeout, auth token getter
- `postJson(path, data, extraHeaders)`: POST request
- `getJson(path, params, extraHeaders)`: GET request
- Auto-injects `Authorization: Bearer <token>` header

**`auth.js`** - Local storage manager for authentication
- `getToken()` / `setToken(token)` / `clearToken()`: Token management
- `getUserId()` / `setUserId(userId)`: User ID management
- Uses `uni.getStorageSync()` / `uni.setStorageSync()` for persistence

### Custom Message Components (`components/`)

LangBot extends uni-im's message system with rich media and interactive components:

**`MsgCard.vue`** - Structured card renderer supporting:
- **General cards**: Header (icon, title, subtitle), description, key-value fields
- **Sections**: List layout (items with title/description/status badges) and key-value layout
- **Timeline cards** (`card_type: 'timeline'`): Chronological event display with status dots
- **Form preview cards** (`card_type: 'form'`): Read-only form field display
- **Media cards** (`card_type: 'media'`): Embeds audio/video/file/image via delegation to media components
- **Actions**: Interactive buttons (link, copy, postback, submit_form, open_widget, interrupt)
  - Supports confirmation dialogs (`action.confirm`)
  - Link actions open in webview (non-H5) or new tab (H5)
  - Copy actions use `uni.setClipboardData`

**`MsgWidget.vue`** - Interactive widget container supporting:
- `music_player`: Music playback controls (via MusicPlayerWidget.vue)
- `form_preview`: Form rendering (via FormPreviewWidget.vue)
- `webview`: External URL preview and launcher (via WebViewWidget.vue)
- Unknown types render fallback message

**`WebViewWidget.vue`** - URL preview card
- Displays title, hostname, description
- H5: Opens in new tab via `window.open`
- APP: Uses `plus.runtime.openURL` or in-app webview
- Fallback: Copies URL to clipboard on failure

**Media components**: `MsgAudio.vue`, `MsgVideo.vue`, `MsgFile.vue`, `MsgImage.vue`, `MsgText.vue`
- Render specific media types in chat bubbles
- Emit events for playback control and file operations

### Configuration Files

**`pages.json`**: uni-app page routing and tab bar configuration
- Main pages at root level
- Subpackages for `uni-im/pages` (chat, contacts, groups) and `uni-id-pages` (auth flows)
- uniIdRouter: Login page and protected routes
- Conditional compilation: Different layouts for H5 vs APP vs mini-programs

**`manifest.json`**: Platform-specific configurations
- App version: `3.4.42` (versionCode: 24110802)
- H5 dev server: port 8080
- WeChat mini-program appid: `wx335730ca97859026`
- uni-push 2.0 enabled for all platforms
- Statistics disabled globally

**`vite.config.js`**: Build configuration
- Custom plugin: `rollup-plugin-uniapp-cementing.js` for component static generation
- Targets ES2015 for broader compatibility
- Component cementing for uni-im message types (msgText, msgImage, msgVideo, etc.)

## Key Development Patterns

### Platform-Specific Code

Use uni-app conditional compilation comments:

```vue
<!-- #ifdef H5 -->
<view>H5-specific content</view>
<!-- #endif -->

<!-- #ifndef H5 -->
<view>Non-H5 platforms</view>
<!-- #endif -->

<!-- #ifdef APP-PLUS -->
<view>Native app only</view>
<!-- #endif -->
```

### Message Type Extension

To add new message card types:

1. Define card structure in LangBot backend with `card_type` field
2. Update `MsgCard.vue` computed `cardType` to recognize new type
3. Add template section for new type (follow existing patterns for timeline/form)
4. Update styles in `<style scoped>` section

To add new widget types:

1. Create new component in `components/widgets/<WidgetName>.vue`
2. Import and register in `MsgWidget.vue` script setup
3. Add `v-if` condition in template for `type === 'your_widget_type'`

### WebSocket Integration

Initialize LangBot WebSocket in page or component:

```javascript
import { configureWS, connectWS, onWSMessage, sendWSMessage, closeWS } from '@/utils/langbot.ws.js';
import { getToken, getUserId } from '@/utils/auth.js';

// Configure once (usually in onMounted)
configureWS({
  url: 'wss://your-langbot-backend.com/ws',
  userId: getUserId(),
  convId: 'c_langbot',  // or dynamic conversation ID
  getAuthToken: () => getToken(),
  onStatusChange: (status) => console.log('WS status:', status)
});

connectWS();

// Listen for messages
const unsubscribe = onWSMessage((message) => {
  console.log('Received:', message);
  // Handle message types: init_ack, message, typing, error, etc.
});

// Send message
sendWSMessage({ type: 'send_message', text: 'Hello' });

// Cleanup (in onBeforeUnmount)
unsubscribe();
closeWS();
```

### HTTP Requests

Configure and use LangBot HTTP client:

```javascript
import { configureHttp, postJson, getJson } from '@/utils/langbot.http.js';
import { getToken } from '@/utils/auth.js';

configureHttp({
  baseURL: 'https://your-langbot-backend.com/api',
  getAuthToken: () => getToken()
});

// POST request
const response = await postJson('/messages', { text: 'Hello' });

// GET request
const data = await getJson('/conversations', { limit: 20 });
```

## uniCloud Deployment

When deploying cloud functions:

1. In HBuilderX, right-click project root → `云服务空间初始化向导`
2. Associate with uniCloud service space (right-click `uniCloud-aliyun/` folder)
3. Upload cloud functions from `uniCloud-aliyun/cloudfunctions/`
4. Upload database schema from `uniCloud-aliyun/database/`
5. Configure uni-push credentials in [uni-push 2.0 console](https://dev.dcloud.net.cn/pages/app/push2/info)

For non-uniCloud backends, implement REST APIs compatible with uni-im cloud-object interface.

## Testing Chat Functionality

To test direct messaging in browser:

1. Run `npm run dev`
2. Open `http://localhost:8080` in two different browser profiles
3. Login with different accounts in each browser
4. Get current user ID from console: `uni.imObservableData.currentUser._id`
5. Navigate to: `/uni_modules/uni-im/pages/chat/chat?user_id=<TARGET_USER_ID>`

**Important**: Avoid opening multiple tabs in the same browser instance (WebSocket contention issues).

## File Paths and Module Resolution

- `@/` resolves to project root
- uni_modules auto-imported by uni-app (no explicit import needed for installed modules)
- Custom components in `components/` are auto-registered globally
- Use absolute paths for navigation: `/uni_modules/uni-im/pages/chat/chat`

## Common Gotchas

1. **Console.time polyfill**: `App.vue` includes a custom implementation for APP platforms
2. **H5 custom navigation**: On H5, navigation style is set to `custom` globally (manifest.json:334)
3. **PC responsive layout**: H5 hides conversation page header and tabbar on screens ≥960px (App.vue styles)
4. **Component cementing**: Changes to message type components require understanding of `rollup-plugin-uniapp-cementing.js` plugin
5. **Vue version**: Project uses Vue 3 (vueVersion: "3" in manifest.json)
