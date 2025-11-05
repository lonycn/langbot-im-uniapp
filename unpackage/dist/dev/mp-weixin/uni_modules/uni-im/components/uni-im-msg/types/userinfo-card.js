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
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const common_vendor = require("../../../../../common/vendor.js");
const _sfc_main = {
  props: {
    msg: {
      type: Object,
      default() {
        return {
          body: ""
        };
      }
    }
  },
  data() {
    return {
      avatarUrl: "",
      nickname: "[...加载中]"
    };
  },
  mounted() {
    return __async(this, null, function* () {
      var _a, _b;
      let user = (yield uni_modules_uniIm_sdk_index.uniIm.users.get(this.msg.body.user_id)) || {};
      this.avatarUrl = (_b = (_a = user.avatar_file) == null ? void 0 : _a.url) != null ? _b : "/uni_modules/uni-im/static/avatarUrl.png";
      this.nickname = user.nickname;
    });
  },
  methods: {
    onClick() {
      uni_modules_uniIm_sdk_index.uniIm.toChat({
        user_id: this.msg.body.user_id,
        source: {
          group_id: this.msg.group_id
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_im_img2 = common_vendor.resolveComponent("uni-im-img");
  _easycom_uni_im_img2();
}
const _easycom_uni_im_img = () => "../../uni-im-img/uni-im-img.js";
if (!Math) {
  _easycom_uni_im_img();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      width: "40px",
      height: "40px",
      ["border-radius"]: "5px",
      src: $data.avatarUrl,
      mode: "widthFix"
    }),
    b: common_vendor.t($data.nickname),
    c: common_vendor.o((...args) => $options.onClick && $options.onClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/userinfo-card.js.map
