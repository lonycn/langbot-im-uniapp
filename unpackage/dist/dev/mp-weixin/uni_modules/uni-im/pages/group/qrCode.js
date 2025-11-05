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
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const uni_modules_uniIm_common_config = require("../../common/config.js");
const uqrcode = () => "../../../Sansnn-uQRCode/components/uqrcode/uqrcode.js";
const _sfc_main = {
  components: {
    uqrcode
  },
  data() {
    return {
      group: {}
    };
  },
  computed: {
    joinGroupUrl() {
      return uni_modules_uniIm_common_config.config.domain + "/#/?joinGroup=" + this.group._id;
    }
  },
  onLoad(param) {
    this.load(param);
  },
  methods: {
    load(_0) {
      return __async(this, arguments, function* ({ conversation_id }) {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/qrCode.vue:56", "conversation_id: ", conversation_id);
        const conversation = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get(conversation_id);
        this.group = conversation.group;
        this.$refs.uqrcode.make({
          success: () => {
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/qrCode.vue:64", err);
          }
        });
      });
    },
    copyUrl() {
      common_vendor.index.setClipboardData({
        data: this.joinGroupUrl,
        success: function() {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/qrCode.vue:72", "success");
        }
      });
    },
    copyGroupID() {
      common_vendor.index.setClipboardData({
        data: this.group_id,
        success: function() {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/qrCode.vue:80", "success");
        }
      });
    },
    save() {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/qrCode.vue:85", "保存");
    },
    share() {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/qrCode.vue:88", "分享");
    }
  }
};
if (!Array) {
  const _easycom_uni_im_img2 = common_vendor.resolveComponent("uni-im-img");
  _easycom_uni_im_img2();
}
const _easycom_uni_im_img = () => "../../components/uni-im-img/uni-im-img.js";
if (!Math) {
  _easycom_uni_im_img();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return {
    a: common_vendor.t($data.group.name),
    b: common_vendor.p({
      src: ((_b = (_a = $data.group) == null ? void 0 : _a.avatar_file) == null ? void 0 : _b.url) || "/uni_modules/uni-im/static/avatarUrl.png",
      mode: "",
      width: "100px",
      height: "100px"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/group/qrCode.js.map
