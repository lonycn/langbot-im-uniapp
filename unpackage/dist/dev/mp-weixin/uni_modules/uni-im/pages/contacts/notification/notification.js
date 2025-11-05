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
const common_vendor = require("../../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const uni_modules_uniIm_pages_contacts_notification_action = require("./action.js");
const db = common_vendor.tr.database();
const _sfc_main = {
  data() {
    return {
      contentText: {
        "contentrefresh": "加载中...",
        "contentnomore": "- 暂无相关数据 -"
      },
      filterNotice: {},
      tips: "",
      hasMore: true
      // notificationDatas:[]
    };
  },
  onLoad(_0) {
    return __async(this, arguments, function* ({
      param
    }) {
      param = JSON.parse(decodeURIComponent(param));
      this.setParam(param);
    });
  },
  computed: {
    //是否为pc宽屏（width>960px）
    isWidescreen() {
      return uni_modules_uniIm_sdk_index.uniIm.isWidescreen;
    },
    notificationDatas() {
      let notificationDatas = uni_modules_uniIm_sdk_index.uniIm.notification.get(this.filterNotice);
      if (notificationDatas.length == 0) {
        setTimeout(() => {
          this.hasMore = false;
        }, 100);
      }
      return notificationDatas;
    }
  },
  mounted() {
    this.hasMore = uni_modules_uniIm_sdk_index.uniIm.notification.hasMore;
  },
  methods: {
    setParam({
      filterNotice,
      title
    }) {
      if (typeof filterNotice == "string") {
        filterNotice = JSON.parse(decodeURIComponent(filterNotice));
      }
      this.filterNotice = filterNotice;
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/notification/notification.vue:89", "filterNotice", filterNotice);
      common_vendor.index.setNavigationBarTitle({
        title
      });
      if (title == "新朋友" && !this.isWidescreen) {
        this.tips = "好友请求通知";
      }
    },
    setItem(_0, _1) {
      return __async(this, arguments, function* ({
        _id
      }, param) {
        const datas = uni_modules_uniIm_sdk_index.uniIm.notification.get(this.filterNotice);
        for (let i = 0; i < datas.length; i++) {
          if (datas[i]._id == _id) {
            datas[i] = deepAssign(datas[i], param);
            uni_modules_uniIm_sdk_index.uniIm.notificationDatas = datas;
            common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/notification/notification.vue:106", "uniIm.notificationDatas", uni_modules_uniIm_sdk_index.uniIm.notificationDatas);
            break;
          }
        }
        yield db.collection("uni-im-notification").where(`"_id" == "${_id}" && "user_id" == $cloudEnv_uid`).get();
        yield db.collection("uni-im-notification").where(`"_id" == "${_id}" && "user_id" == $cloudEnv_uid`).update(param);
        function isPlainObject(obj) {
          return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object Object]";
        }
        function deepAssign() {
          let len = arguments.length, target = arguments[0];
          if (!isPlainObject(target)) {
            target = {};
          }
          for (let i = 1; i < len; i++) {
            let source = arguments[i];
            if (isPlainObject(source)) {
              for (let s in source) {
                if (s === "__proto__" || target === source[s]) {
                  continue;
                }
                if (isPlainObject(source[s])) {
                  target[s] = deepAssign(target[s], source[s]);
                } else {
                  target[s] = source[s];
                }
              }
            }
          }
          return target;
        }
      });
    },
    clickHandle(index, item) {
      return __async(this, null, function* () {
        if (!item.is_read) {
          this.setItem(item, {
            is_read: true
          });
        }
        let path = item.path || item.payload.path;
        if (path) {
          common_vendor.index.navigateTo({
            url: path,
            fail: (e) => {
              common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/contacts/notification/notification.vue:167", e);
            }
          });
        }
      });
    },
    doAction(index, type) {
      let item = this.notificationDatas[index];
      let e = {
        subType: item.payload.subType,
        confirm: type === 1,
        cancel: type === 0,
        item
      };
      uni_modules_uniIm_pages_contacts_notification_action.action(e, (data) => {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/notification/notification.vue:185", "doAction", data);
        this.setItem(item, {
          is_read: true,
          payload: {
            state: type === 1 ? "confirm" : "cancel"
          }
        });
      });
    },
    friendlyTime(timestamp) {
      return uni_modules_uniIm_sdk_index.uniIm.utils.toFriendlyTime(timestamp);
    },
    handleText(state) {
      switch (state) {
        case 0:
          return "同意";
        case 100:
          return "已同意";
        case -100:
          return "已拒绝";
        default:
          return "其他";
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_info_card2 = common_vendor.resolveComponent("uni-im-info-card");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_icons2 + _easycom_uni_im_info_card2 + _easycom_uni_im_load_state2 + _easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_icons = () => "../../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_info_card = () => "../../../components/uni-im-info-card/uni-im-info-card.js";
const _easycom_uni_im_load_state = () => "../../../components/uni-im-load-state/uni-im-load-state.js";
const _easycom_uni_list_item = () => "../../../../uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../../../uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_im_info_card + _easycom_uni_im_load_state + _easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.tips
  }, $data.tips ? {
    b: common_vendor.t($data.tips)
  } : {}, {
    c: $options.notificationDatas && $options.notificationDatas.length
  }, $options.notificationDatas && $options.notificationDatas.length ? {
    d: common_vendor.f($options.notificationDatas, (item, index, i0) => {
      var _a, _b;
      return common_vendor.e({
        a: item.payload.state
      }, item.payload.state ? {
        b: common_vendor.t("已" + (item.payload.state == "confirm" ? item.payload.confirmText : item.payload.cancelText))
      } : common_vendor.e({
        c: item.payload.cancelText
      }, item.payload.cancelText ? {
        d: common_vendor.t(item.payload.cancelText),
        e: common_vendor.o(($event) => $options.doAction(index, 0), item.id)
      } : {}, {
        f: item.payload.confirmText
      }, item.payload.confirmText ? {
        g: common_vendor.t(item.payload.confirmText),
        h: common_vendor.o(($event) => $options.doAction(index, 1), item.id)
      } : {}, {
        i: !item.payload.cancelText && !item.payload.confirmText && item.path
      }, !item.payload.cancelText && !item.payload.confirmText && item.path ? {
        j: "35f4ca0c-2-" + i0 + "," + ("35f4ca0c-1-" + i0),
        k: common_vendor.p({
          type: "right",
          color: "#cccccc"
        })
      } : {}), {
        l: item.id,
        m: common_vendor.o(($event) => $options.clickHandle(index, item), item.id),
        n: "35f4ca0c-1-" + i0 + ",35f4ca0c-0",
        o: common_vendor.p({
          avatarCircle: true,
          clickable: true,
          badge: item.is_read ? "" : "dot",
          badgePositon: "left",
          title: item.payload.title || item.title,
          note: item.payload.content || item.content || "无",
          avatar: ((_b = (_a = item.payload) == null ? void 0 : _a.avatar_file) == null ? void 0 : _b.url) || "/uni_modules/uni-im/static/noticeIcon/notification2.png",
          direction: "column",
          time: $options.friendlyTime(item.create_time)
        })
      });
    })
  } : {
    e: common_vendor.p({
      contentText: $data.contentText,
      status: $data.hasMore ? "loading" : "noMore"
    })
  }, {
    f: common_vendor.p({
      border: false
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/contacts/notification/notification.js.map
