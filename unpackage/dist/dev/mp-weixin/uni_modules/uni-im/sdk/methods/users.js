"use strict";
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_state_index = require("../state/index.js");
let $users = {
  system: {
    _id: "system",
    nickname: "系统消息",
    avatar_file: "/static/uni-im/avatar/system.png"
  },
  merge(usersInfo) {
    if (Array.isArray(usersInfo)) {
      let obj = {};
      usersInfo.forEach((item) => {
        obj[item._id] = item;
      });
      usersInfo = obj;
    }
    for (let key in usersInfo) {
      const { nickname } = usersInfo[key];
      if (nickname && !nickname.includes("(")) {
        usersInfo[key] = new Proxy(usersInfo[key], {
          get(target, prop) {
            if (prop === "nickname") {
              const alias = uni_modules_uniIm_sdk_state_index.state.userAlias[target._id];
              if (alias) {
                return target[prop] + " (" + alias + ")";
              }
            }
            return target[prop];
          }
        });
      } else {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/methods/users.js:31", "已经代理过了", usersInfo[key].nickname);
      }
    }
    Object.assign(uni_modules_uniIm_sdk_state_index.state.users, usersInfo);
  },
  find(param) {
    param = Array.isArray(param) ? param : [param];
    let usersInfo = [];
    param.forEach((uid) => {
      const userInfo = uni_modules_uniIm_sdk_state_index.state.users[uid];
      if (userInfo) {
        usersInfo.push(userInfo);
      }
    });
    return usersInfo;
  },
  get(param) {
    return __async(this, null, function* () {
      const uid_list = Array.isArray(param) ? param : [param];
      let new_uid_list = [];
      let userInfoList = [];
      uid_list.forEach((uid) => {
        let userInfo = uni_modules_uniIm_sdk_state_index.state.users[uid];
        if (userInfo && !this.loadTask.list.includes(uid)) {
          userInfoList.push(userInfo);
        } else {
          new_uid_list.push(uid);
        }
      });
      if (new_uid_list.length) {
        const db = common_vendor.tr.database();
        let res = yield db.collection("uni-id-users").where({
          "_id": db.command.in(new_uid_list)
        }).field("_id,nickname,avatar_file,realname_auth").get();
        uni_modules_uniIm_sdk_state_index.state.users.merge(res.result.data.reduce((obj, item) => {
          obj[item._id] = item;
          return obj;
        }, {}));
        userInfoList.push(...this.find(new_uid_list));
      }
      return Array.isArray(param) ? userInfoList : userInfoList[0];
    });
  },
  getNickname(user_id, tmpNickname = "[昵称加载中...]") {
    var _a, _b;
    const nickname = (_a = uni_modules_uniIm_sdk_state_index.state.users[user_id]) == null ? void 0 : _a.nickname;
    if (nickname) {
      return nickname;
    } else {
      $users.loadTask.add(user_id);
      uni_modules_uniIm_sdk_state_index.state.users[user_id] = {
        nickname: tmpNickname,
        _id: user_id,
        __loading: true
      };
      return (_b = uni_modules_uniIm_sdk_state_index.state.users[user_id]) == null ? void 0 : _b.nickname;
    }
  },
  // 设置一个队列加载用户信息避免频繁请求
  loadTask: {
    list: [],
    add(uids) {
      uids = Array.isArray(uids) ? uids : [uids], this.list.push(...uids);
      this.run();
    },
    run() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.list.length) {
          this.list = [...new Set(this.list)];
          $users.get(this.list);
          this.list = [];
        }
      }, 300);
    }
  }
};
exports.$users = $users;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/methods/users.js.map
