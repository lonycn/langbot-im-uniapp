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
const uni_modules_uniIm_common_config = require("../../../common/config.js");
const _sfc_main = {
  props: {
    msg: {
      type: Object,
      default: () => {
        return {
          reader_list: [],
          body: []
        };
      }
    },
    imgMaxWidth: {
      type: [String, Number],
      default: "200px"
    }
  },
  data() {
    return {
      webInfoList: []
    };
  },
  mounted() {
    return __async(this, null, function* () {
    });
  },
  computed: {
    currentUid() {
      return uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    },
    isSingeImg() {
      return this.msg.body.filter((item) => {
        var _a;
        return item.name != "img" && item.text || ((_a = item == null ? void 0 : item.attrs) == null ? void 0 : _a.class) === "nickname";
      }).length === 0;
    },
    imgList() {
      return this.msg.body.filter((item) => item.name == "img").map((item) => item.attrs.src);
    },
    isFromSelf() {
      return this.msg.from_uid === this.currentUid;
    },
    trBody() {
      if (this.webInfoList.length === 1 && this.msg.body.filter((i) => !(i.type === "text" && i.text === " ")).length === 1 && this.webInfoList[0].url === this.msg.body[0].attrs.href) {
        return [];
      } else {
        return this.msg.body.map((node) => {
          if (node.name == "span" && node.attrs && node.attrs.class == "nickname" && node.attrs.user_id) {
            node.children = [{
              type: "text",
              text: "@" + this.getNicknameByUid(node.attrs.user_id)
            }];
            if (node.attrs.user_id == "__ALL") {
              delete node.isRead;
            } else {
              node.isRead = this.msg.reader_list ? this.msg.reader_list.find((item) => item.user_id == node.attrs.user_id) : false;
            }
          }
          return node;
        });
      }
    },
    canPrivateChat() {
      var _a;
      if (this.uniIDHasRole("staff")) {
        return true;
      }
      const { conversation_id, from_uid } = this.msg;
      const { group_member } = uni_modules_uniIm_sdk_index.uniIm.conversation.find(conversation_id);
      return group_member ? (_a = group_member.find(from_uid)) == null ? void 0 : _a.role.includes("admin") : false;
    }
  },
  methods: {
    trText(str) {
      return str.replace(/\\n/g, "\\\\n");
    },
    getNicknameByUid(uid) {
      if (uid === "__ALL") {
        return "所有人";
      }
      return uni_modules_uniIm_sdk_index.uniIm.users.getNickname(uid);
    },
    previewImage(src) {
      return __async(this, null, function* () {
        const urls = [];
        for (let i = 0; i < this.imgList.length; i++) {
          const url = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(this.imgList[i]);
          urls.push(url);
        }
        src = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(src);
        common_vendor.index.previewImage({
          urls,
          current: src
        });
      });
    },
    copy(text) {
      common_vendor.index.setClipboardData({
        data: text,
        success: () => {
          common_vendor.index.showToast({
            title: "复制成功",
            icon: "none"
          });
        }
      });
    },
    privateChat(user_id) {
      if (this.canPrivateChat && user_id != "__ALL") {
        uni_modules_uniIm_sdk_index.uniIm.toChat({
          user_id,
          source: {
            group_id: this.msg.group_id
          }
        });
      }
    },
    isAppLink(item) {
      return item.attrs.href.indexOf(uni_modules_uniIm_common_config.config.domain) === 0;
    },
    toAppLink(url) {
      const params = url.split("?")[1];
      let path = url.split("?")[0].split(uni_modules_uniIm_common_config.config.domain + "/#/")[1];
      common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/types/rich-text.vue:205", "path", path);
      if (path === "") {
        path = "/uni_modules/uni-im/pages/index/index";
      }
      common_vendor.index.redirectTo({
        url: path + "?" + params,
        fail: (err) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/types/rich-text.vue:213", "跳转失败", err);
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_im_icons2 = common_vendor.resolveComponent("uni-im-icons");
  const _easycom_uni_im_img2 = common_vendor.resolveComponent("uni-im-img");
  const _easycom_uni_link2 = common_vendor.resolveComponent("uni-link");
  (_easycom_uni_im_icons2 + _easycom_uni_im_img2 + _easycom_uni_link2)();
}
const _easycom_uni_im_icons = () => "../../uni-im-icons/uni-im-icons.js";
const _easycom_uni_im_img = () => "../../uni-im-img/uni-im-img.js";
const _easycom_uni_link = () => "../../../../uni-link/components/uni-link/uni-link.js";
if (!Math) {
  (_easycom_uni_im_icons + _easycom_uni_im_img + _easycom_uni_link)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($options.trBody, (item, index, i0) => {
      return common_vendor.e({
        a: item.name == "span"
      }, item.name == "span" ? common_vendor.e({
        b: item.attrs && item.attrs.class == "nickname"
      }, item.attrs && item.attrs.class == "nickname" ? {
        c: common_vendor.t(item.children[0].text),
        d: $options.canPrivateChat ? 1 : "",
        e: item.attrs.user_id == $options.currentUid ? 1 : "",
        f: common_vendor.o(($event) => $options.privateChat(item.attrs.user_id), index)
      } : {
        g: common_vendor.t(item.children[0].text)
      }, {
        h: $options.isFromSelf && "isRead" in item
      }, $options.isFromSelf && "isRead" in item ? {
        i: item.isRead ? 1 : "",
        j: "2d50f5fb-0-" + i0,
        k: common_vendor.p({
          code: item.isRead ? "e609" : "e741",
          size: item.isRead ? "12px" : "10px",
          color: item.isRead ? "#25882a" : "#bbb"
        })
      } : {}) : item.type == "text" ? {
        m: common_vendor.t($options.trText(item.text))
      } : item.name == "img" ? {
        o: common_vendor.o(($event) => $options.previewImage(item.attrs.src), index),
        p: "2d50f5fb-1-" + i0,
        q: common_vendor.p({
          ["max-width"]: $props.imgMaxWidth,
          src: item.attrs.src,
          width: item.attrs.width,
          height: item.attrs.height,
          mode: "widthFix"
        })
      } : item.name == "a" && item.children && typeof item.children[0] === "object" ? common_vendor.e({
        s: $options.isAppLink(item)
      }, $options.isAppLink(item) ? {
        t: common_vendor.t(item.children[0].text),
        v: common_vendor.o(($event) => $options.toAppLink(item.attrs.href), index)
      } : {
        w: "2d50f5fb-2-" + i0,
        x: common_vendor.p({
          href: item.attrs.href,
          color: "#007fff",
          text: item.children[0].text
        })
      }) : {}, {
        l: item.type == "text",
        n: item.name == "img",
        r: item.name == "a" && item.children && typeof item.children[0] === "object",
        y: index
      });
    }),
    b: $options.isFromSelf ? 1 : "",
    c: $options.trBody.length === 0 && $data.webInfoList.length === 1 ? 1 : "",
    d: $options.isSingeImg ? 1 : ""
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/rich-text.js.map
